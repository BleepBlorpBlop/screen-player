import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProjectEditor.css';

function ProjectEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    loadProject();
    loadScenes();
  }, [id]);

  const loadProject = async () => {
    const token = localStorage.getItem('token');
    axios.get(`${API_URL}/api/admin/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProject(response.data);
  };

  const loadScenes = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/admin/projects/${id}/scenes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setScenes(response.data);
  };

  const togglePublish = async () => {
    const token = localStorage.getItem('token');
    await axios.put(`${API_URL}/api/admin/projects/${id}`, 
      { ...project, is_published: !project.is_published },
      { headers: { Authorization: `Bearer ${token}` }}
    );
    loadProject();
  };

  const searchSpotify = async (query) => {
    if (!query) return;
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/spotify/search`,
      { query, projectId: id },
      { headers: { Authorization: `Bearer ${token}` }}
    );
    setSearchResults(response.data);
  };

  const handleSaveScene = async (scene) => {
    const token = localStorage.getItem('token');
    if (scene.id) {
      await axios.put(`${API_URL}/api/admin/scenes/${scene.id}`, scene, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      await axios.post(`${API_URL}/api/admin/projects/${id}/scenes`, scene, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    setEditing(null);
    loadScenes();
  };

  const handleDeleteScene = async (sceneId) => {
    if (!window.confirm('Delete this scene?')) return;
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/api/admin/scenes/${sceneId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    loadScenes();
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="project-editor">
      <header>
        <button onClick={() => navigate('/admin')}>← Back to Dashboard</button>
        <h1>{project.title}</h1>
        <button onClick={togglePublish} className={project.is_published ? 'btn-unpublish' : 'btn-publish'}>
          {project.is_published ? '✓ Published' : 'Publish'}
        </button>
      </header>

      <div className="scenes-list">
        <button onClick={() => setEditing({})}>+ Add Scene</button>
        
        {scenes.map(scene => (
          <div key={scene.id} className="scene-item">
            <div className="scene-header">
              <span>Scene {scene.scene_number}: {scene.scene_heading}</span>
              <div>
                <button onClick={() => setEditing(scene)}>Edit</button>
                <button onClick={() => handleDeleteScene(scene.id)}>Delete</button>
              </div>
            </div>
            {scene.song_title && (
              <div className="scene-song">♪ {scene.song_title} - {scene.song_artist}</div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="scene-editor-modal">
          <div className="modal-content">
            <h2>{editing.id ? 'Edit Scene' : 'New Scene'}</h2>
            <input
              type="number"
              placeholder="Scene Number"
              value={editing.scene_number || ''}
              onChange={(e) => setEditing({...editing, scene_number: parseInt(e.target.value)})}
            />
            <input
              type="text"
              placeholder="Scene Heading"
              value={editing.scene_heading || ''}
              onChange={(e) => setEditing({...editing, scene_heading: e.target.value})}
            />
            <textarea
              placeholder="Scene Text"
              value={editing.scene_text || ''}
              onChange={(e) => setEditing({...editing, scene_text: e.target.value})}
              rows="10"
            />
            <input
              type="text"
              placeholder="Search Spotify (e.g., Jump Van Halen)"
              onKeyPress={(e) => e.key === 'Enter' && searchSpotify(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(track => (
                  <div key={track.id} className="track-result" onClick={() => {
                    setEditing({
                      ...editing,
                      song_title: track.name,
                      song_artist: track.artist,
                      spotify_track_id: track.id,
                      spotify_album_art_url: track.albumArt
                    });
                    setSearchResults([]);
                  }}>
                    <img src={track.albumArt} alt={track.album} />
                    <div>
                      <strong>{track.name}</strong>
                      <p>{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {editing.song_title && (
              <div className="selected-song">
                <img src={editing.spotify_album_art_url} alt="Album art" />
                <div>{editing.song_title} - {editing.song_artist}</div>
              </div>
            )}
            <div className="modal-actions">
              <button onClick={() => setEditing(null)}>Cancel</button>
              <button onClick={() => handleSaveScene(editing)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectEditor;
