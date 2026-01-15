import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [versions, setVersions] = useState([]);
  const [documentation, setDocumentation] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchVersions();
    fetchDocumentation();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.project);
      const user = JSON.parse(localStorage.getItem('user'));
      setIsOwner(response.data.project.owner._id === user.id);
    } catch (err) {
      setError('Failed to load project');
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const response = await api.get(`/projects/${id}/versions`);
      setVersions(response.data.versions);
    } catch (err) {
      console.error('Error fetching versions:', err);
    }
  };

  const fetchDocumentation = async () => {
    try {
      const response = await api.get(`/projects/${id}/documentation`);
      setDocumentation(response.data.documentation || '');
    } catch (err) {
      console.error('Error fetching documentation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/projects/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const formData = new FormData(e.target);
      await api.put(`/projects/${id}`, {
        name: formData.get('name'),
        description: formData.get('description')
      });
      fetchProject();
      alert('Project updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
    }
  };

  const handleUpdateDocumentation = async () => {
    try {
      await api.put(`/projects/${id}/documentation`, { documentation });
      alert('Documentation updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update documentation');
    }
  };

  const handleAddVersion = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const formData = new FormData(e.target);
      await api.post(`/projects/${id}/versions`, {
        versionNumber: formData.get('versionNumber'),
        description: formData.get('description')
      });
      e.target.reset();
      fetchVersions();
      alert('Version created successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create version');
    }
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const formData = new FormData(e.target);
      await api.post(`/projects/${id}/collaborators`, {
        email: formData.get('email')
      });
      e.target.reset();
      fetchProject();
      alert('Collaborator added successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add collaborator');
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    if (!window.confirm('Remove this collaborator?')) return;

    try {
      await api.delete(`/projects/${id}/collaborators/${userId}`);
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove collaborator');
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!project) {
    return <div className="container">Project not found</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>{project.name}</h1>
        {isOwner && (
          <button onClick={handleDelete} className="btn btn-danger">
            Delete Project
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="tabs">
        <button
          className={activeTab === 'overview' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'versions' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('versions')}
        >
          Versions
        </button>
        <button
          className={activeTab === 'documentation' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('documentation')}
        >
          Documentation
        </button>
        <button
          className={activeTab === 'collaborators' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('collaborators')}
        >
          Collaborators
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="card">
          <form onSubmit={handleUpdateProject}>
            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                name="name"
                defaultValue={project.name}
                required
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                defaultValue={project.description}
                maxLength={500}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Update Project
            </button>
          </form>
        </div>
      )}

      {activeTab === 'versions' && (
        <div>
          <div className="card">
            <h3>Create New Version</h3>
            <form onSubmit={handleAddVersion}>
              <div className="form-group">
                <label>Version Number *</label>
                <input
                  type="text"
                  name="versionNumber"
                  placeholder="e.g., 1.0.0"
                  required
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  maxLength={500}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Create Version
              </button>
            </form>
          </div>

          <div className="card">
            <h3>Version History</h3>
            {versions.length === 0 ? (
              <p>No versions yet</p>
            ) : (
              <div>
                {versions.map((version) => (
                  <div key={version._id} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                    <strong>{version.versionNumber}</strong>
                    {version.description && <p>{version.description}</p>}
                    <small style={{ color: '#999' }}>
                      Created by {version.createdBy.username} on {new Date(version.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documentation' && (
        <div className="card">
          <h3>Project Documentation</h3>
          <div className="form-group">
            <textarea
              value={documentation}
              onChange={(e) => setDocumentation(e.target.value)}
              style={{ minHeight: '400px', fontFamily: 'monospace' }}
              maxLength={10000}
            />
          </div>
          <button onClick={handleUpdateDocumentation} className="btn btn-primary">
            Save Documentation
          </button>
        </div>
      )}

      {activeTab === 'collaborators' && (
        <div>
          {isOwner && (
            <div className="card">
              <h3>Add Collaborator</h3>
              <form onSubmit={handleAddCollaborator}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="user@example.com"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Add Collaborator
                </button>
              </form>
            </div>
          )}

          <div className="card">
            <h3>Project Collaborators</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>Owner:</strong> {project.owner.username} ({project.owner.email})
            </div>
            {project.collaborators && project.collaborators.length > 0 && (
              <div>
                <h4>Collaborators:</h4>
                {project.collaborators
                  .filter(c => c.role === 'Collaborator')
                  .map((collab) => (
                    <div key={collab.user._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                      <span>{collab.user.username} ({collab.user.email})</span>
                      {isOwner && (
                        <button
                          onClick={() => handleRemoveCollaborator(collab.user._id)}
                          className="btn btn-danger"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
