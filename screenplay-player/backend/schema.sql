-- Database Schema for Screenplay Player Platform

-- Users table (admin authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table (each screenplay is a project)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, -- URL-friendly name (e.g., "last-chance")
    description TEXT,
    spotify_client_id VARCHAR(255),
    spotify_client_secret VARCHAR(255),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scenes table (screenplay scenes with associated songs)
CREATE TABLE scenes (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    scene_number INTEGER NOT NULL,
    scene_heading VARCHAR(255) NOT NULL, -- e.g., "INT. GARAGE - MORNING"
    scene_text TEXT NOT NULL,
    song_title VARCHAR(255),
    song_artist VARCHAR(255),
    spotify_track_id VARCHAR(255), -- Just the track ID, not full URI
    spotify_album_art_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, scene_number)
);

-- Create indexes for performance
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_scenes_project ON scenes(project_id);
CREATE INDEX idx_scenes_number ON scenes(project_id, scene_number);

-- Insert default admin user (password: changeme123)
-- You should change this immediately after first login
INSERT INTO users (email, password_hash) 
VALUES ('admin@screenplay.local', '$2b$10$rQJ5KqE5XqF6FqN.vE9ZXeF5GqnQf5qJ5qF5qF5qF5qF5qF5qF5qO');
