require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ===== AUTH ROUTES =====

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newHash, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== PROJECT ROUTES (Admin) =====

// Get all projects for logged-in user
app.get('/api/admin/projects', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, slug, description, is_published, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single project (admin view with API keys)
app.get('/api/admin/projects/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new project
app.post('/api/admin/projects', authenticateToken, async (req, res) => {
  try {
    const { title, slug, description, spotify_client_id, spotify_client_secret } = req.body;

    // Check if slug already exists
    const existing = await pool.query('SELECT id FROM projects WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A project with this slug already exists' });
    }

    const result = await pool.query(
      `INSERT INTO projects (user_id, title, slug, description, spotify_client_id, spotify_client_secret) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, title, slug, description, spotify_client_id, spotify_client_secret]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project
app.put('/api/admin/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { title, slug, description, spotify_client_id, spotify_client_secret, is_published } = req.body;

    const result = await pool.query(
      `UPDATE projects 
       SET title = $1, slug = $2, description = $3, spotify_client_id = $4, 
           spotify_client_secret = $5, is_published = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [title, slug, description, spotify_client_id, spotify_client_secret, is_published, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project
app.delete('/api/admin/projects/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== SCENE ROUTES (Admin) =====

// Get all scenes for a project
app.get('/api/admin/projects/:projectId/scenes', authenticateToken, async (req, res) => {
  try {
    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.projectId, req.user.id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const result = await pool.query(
      'SELECT * FROM scenes WHERE project_id = $1 ORDER BY scene_number',
      [req.params.projectId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get scenes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create scene
app.post('/api/admin/projects/:projectId/scenes', authenticateToken, async (req, res) => {
  try {
    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.projectId, req.user.id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { scene_number, scene_heading, scene_text, song_title, song_artist, spotify_track_id, spotify_album_art_url } = req.body;

    const result = await pool.query(
      `INSERT INTO scenes (project_id, scene_number, scene_heading, scene_text, song_title, song_artist, spotify_track_id, spotify_album_art_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.params.projectId, scene_number, scene_heading, scene_text, song_title, song_artist, spotify_track_id, spotify_album_art_url]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create scene error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update scene
app.put('/api/admin/scenes/:id', authenticateToken, async (req, res) => {
  try {
    const { scene_number, scene_heading, scene_text, song_title, song_artist, spotify_track_id, spotify_album_art_url } = req.body;

    // Verify scene belongs to user's project
    const sceneCheck = await pool.query(
      `SELECT s.id FROM scenes s 
       JOIN projects p ON s.project_id = p.id 
       WHERE s.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (sceneCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const result = await pool.query(
      `UPDATE scenes 
       SET scene_number = $1, scene_heading = $2, scene_text = $3, 
           song_title = $4, song_artist = $5, spotify_track_id = $6, spotify_album_art_url = $7
       WHERE id = $8 RETURNING *`,
      [scene_number, scene_heading, scene_text, song_title, song_artist, spotify_track_id, spotify_album_art_url, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update scene error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete scene
app.delete('/api/admin/scenes/:id', authenticateToken, async (req, res) => {
  try {
    // Verify scene belongs to user's project
    const sceneCheck = await pool.query(
      `SELECT s.id FROM scenes s 
       JOIN projects p ON s.project_id = p.id 
       WHERE s.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (sceneCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    await pool.query('DELETE FROM scenes WHERE id = $1', [req.params.id]);

    res.json({ message: 'Scene deleted successfully' });
  } catch (error) {
    console.error('Delete scene error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== PUBLIC ROUTES (No auth required) =====

// Get published project by slug
app.get('/api/public/:slug', async (req, res) => {
  try {
    const projectResult = await pool.query(
      'SELECT id, title, slug, description FROM projects WHERE slug = $1 AND is_published = true',
      [req.params.slug]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];

    const scenesResult = await pool.query(
      'SELECT scene_number, scene_heading, scene_text, song_title, song_artist, spotify_track_id, spotify_album_art_url FROM scenes WHERE project_id = $1 ORDER BY scene_number',
      [project.id]
    );

    res.json({
      project,
      scenes: scenesResult.rows
    });
  } catch (error) {
    console.error('Get public project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Spotify proxy - search for track
app.post('/api/spotify/search', authenticateToken, async (req, res) => {
  try {
    const { query, projectId } = req.body;

    // Get project's Spotify credentials
    const projectResult = await pool.query(
      'SELECT spotify_client_id, spotify_client_secret FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.user.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { spotify_client_id, spotify_client_secret } = projectResult.rows[0];

    if (!spotify_client_id || !spotify_client_secret) {
      return res.status(400).json({ error: 'Spotify credentials not configured for this project' });
    }

    // Get Spotify access token
    const authResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')
        }
      }
    );

    const accessToken = authResponse.data.access_token;

    // Search for track
    const searchResponse = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const tracks = searchResponse.data.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url || null,
      spotifyUrl: track.external_urls.spotify
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Spotify search error:', error);
    res.status(500).json({ error: 'Spotify search failed' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
