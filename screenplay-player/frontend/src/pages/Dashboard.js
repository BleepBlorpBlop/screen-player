import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    slug: '',
    description: '',
    spotify_client_id: '',
    spotify_client_secret: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/projects', newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewProject({ title: '', slug: '', description: '', spotify_client_id: '', spotify_client_secret: '' });
      setShowNewProject(false);
      loadProjects();
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure? This will delete all scenes.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadProjects();
    } catch (error) {
      alert('Error deleting project');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Screenplay Player Admin</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <button onClick={() => setShowNewProject(!showNewProject)} className="btn-primary">
            {showNewProject ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {showNewProject && (
          <div className="new-project-form">
            <h2>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                placeholder="Title (e.g., Last Chance on the Stairway)"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Slug (e.g., last-chance) - becomes yoursite.com/last-chance"
                value={newProject.slug}
                onChange={(e) => setNewProject({...newProject, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                required
              />
              <textarea
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
              <input
                type="text"
                placeholder="Spotify Client ID"
                value={newProject.spotify_client_id}
                onChange={(e) => setNewProject({...newProject, spotify_client_id: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Spotify Client Secret"
                value={newProject.spotify_client_secret}
                onChange={(e) => setNewProject({...newProject, spotify_client_secret: e.target.value})}
                required
              />
              <button type="submit" className="btn-primary">Create Project</button>
            </form>
          </div>
        )}

        <div className="projects-grid">
          {projects.length === 0 ? (
            <div className="empty-state">
              <p>No projects yet. Click "New Project" to get started.</p>
            </div>
          ) : (
            projects.map(project => (
              <div key={project.id} className="project-card">
                <h3>{project.title}</h3>
                <p className="project-slug">/{project.slug}</p>
                <p className="project-description">{project.description}</p>
                <div className="project-status">
                  {project.is_published ? (
                    <span className="status-published">Published</span>
                  ) : (
                    <span className="status-draft">Draft</span>
                  )}
                </div>
                <div className="project-actions">
                  <Link to={`/admin/projects/${project.id}`} className="btn-edit">Edit</Link>
                  <button onClick={() => handleDeleteProject(project.id)} className="btn-delete">Delete</button>
                  {project.is_published && (
                    <a href={`/${project.slug}`} target="_blank" rel="noopener noreferrer" className="btn-view">View Public</a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
