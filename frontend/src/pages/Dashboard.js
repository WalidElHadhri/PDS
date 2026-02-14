import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    owned: 0,
    shared: 0,
    totalVersions: 0,
    totalCollaborators: 0
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      const projectsData = response.data.projects;
      setProjects(projectsData);

      // Calculate statistics
      const owned = projectsData.filter(p => p.owner._id === JSON.parse(localStorage.getItem('user')).id).length;
      const shared = projectsData.length - owned;
      const totalVersions = projectsData.length; // Simplified
      const totalCollaborators = projectsData.reduce((sum, p) => sum + (p.collaborators?.length || 0), 0);

      setStats({ owned, shared, totalVersions, totalCollaborators });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Owned Projects</h3>
          <p className="stat-number">{stats.owned}</p>
        </div>
        <div className="stat-card">
          <h3>Shared Projects</h3>
          <p className="stat-number">{stats.shared}</p>
        </div>
        <div className="stat-card">
          <h3>Total Versions</h3>
          <p className="stat-number">{stats.totalVersions}</p>
        </div>
        <div className="stat-card">
          <h3>Total Collaborators</h3>
          <p className="stat-number">{stats.totalCollaborators}</p>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h2 style={{ marginBottom: 0 }}>My Projects</h2>
          <Link to="/projects/new" className="btn btn-primary">
            + Create New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="card">
            <p>No projects yet. Create your first project!</p>
          </div>
        ) : (
          <div className="projects-list">
            {projects.map((project) => (
              <Link key={project._id} to={`/projects/${project._id}`} className="project-row">
                <div className="project-row-left">
                  <div className="project-row-title">
                    <span style={{ fontSize: '18px' }}>📁</span>
                    <h3>{project.name}</h3>
                    <span className="project-row-badge">
                      {project.owner?._id === JSON.parse(localStorage.getItem('user'))?.id ? 'Owned' : 'Shared'}
                    </span>
                  </div>
                  <div className="project-row-desc">
                    {project.description || 'No description provided.'}
                  </div>
                </div>

                <div className="project-row-right">
                  <div className="project-row-meta">
                    <span style={{ fontSize: '14px' }}>👤</span>
                    <span>{project.owner.username}</span>
                  </div>
                  <div className="project-row-meta">
                    <span style={{ fontSize: '14px' }}>👥</span>
                    <span>{project.collaborators?.length || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
