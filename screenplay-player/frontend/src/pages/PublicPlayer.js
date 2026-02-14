import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './PublicPlayer.css';

function PublicPlayer() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProject();
  }, [slug]);

  const loadProject = async () => {
    try {
      const response = await axios.get(`/api/public/${slug}`);
      setProject(response.data.project);
      setScenes(response.data.scenes);
    } catch (err) {
      setError('Screenplay not found');
    } finally {
      setLoading(false);
    }
  };

  const shareProject = () => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading screenplay...</div>;
  }

  if (error) {
    return <div className="error-screen">{error}</div>;
  }

  return (
    <div className="public-player">
      <header className="player-header">
        <h1>{project.title}</h1>
        {project.description && <p className="description">{project.description}</p>}
        <button onClick={shareProject} className="share-button">
          📤 Share This Experience
        </button>
      </header>

      <div className="playlist">
        <h2>🎵 Screenplay Playlist</h2>
        
        {scenes.map((scene, index) => (
          <div key={scene.scene_number} className="scene-card">
            <div className="scene-number">Scene {scene.scene_number}</div>
            
            <div className="scene-content">
              {scene.spotify_album_art_url && (
                <div className="album-art">
                  <img src={scene.spotify_album_art_url} alt={`${scene.song_title} album art`} />
                </div>
              )}
              
              <div className="scene-info">
                <div className="song-info">
                  {scene.song_title && (
                    <>
                      <h3 className="song-title">{scene.song_title}</h3>
                      <p className="song-artist">{scene.song_artist}</p>
                      {scene.spotify_track_id && (
                        <a
                          href={`https://open.spotify.com/track/${scene.spotify_track_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="spotify-link"
                        >
                          ► Open in Spotify
                        </a>
                      )}
                    </>
                  )}
                </div>
                
                <div className="scene-text-container">
                  <h4 className="scene-heading">{scene.scene_heading}</h4>
                  <pre className="scene-text">{scene.scene_text}</pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="player-footer">
        <p>Experience {scenes.length} scenes • {project.title}</p>
        <button onClick={shareProject} className="share-button-footer">
          Share with Friends
        </button>
      </footer>
    </div>
  );
}

export default PublicPlayer;
