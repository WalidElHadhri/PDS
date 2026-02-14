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
  const [editorFilename, setEditorFilename] = useState('Main.java');
  const [editorContent, setEditorContent] = useState('// Temporary Java editor for this project overview\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello from the project overview editor!\");\n  }\n}\n');
  const [editorSavedMessage, setEditorSavedMessage] = useState('');
  const [selectedEditorVersionId, setSelectedEditorVersionId] = useState('current');
  const [versionMessage, setVersionMessage] = useState('');

  useEffect(() => {
    fetchProject();
    fetchVersions();
    fetchDocumentation();
    fetchCodeFile();
  }, [id]);

  const fetchCodeFile = async () => {
    try {
      const response = await api.get(`/projects/${id}/code-file`);
      const { filename, content } = response.data || {};

      if (filename) {
        setEditorFilename(filename);
      }

      if (content && content.trim().length > 0) {
        setEditorContent(content);
      }

      // When loading the current shared code file, keep the editor view on "current"
      setSelectedEditorVersionId('current');
    } catch (err) {
      // Non-fatal: editor will just use default template
      console.error('Error fetching code file for editor:', err);
    }
  };

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
      setVersions(response.data.versions || []);

      // Keep project.currentVersion in sync if the API returned it
      if (response.data.currentVersion && project) {
        setProject({ ...project, currentVersion: response.data.currentVersion });
      }
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

  const handleSetCurrentVersion = async (versionId) => {
    try {
      setVersionMessage('');
      await api.put(`/projects/${id}/versions/${versionId}/current`);

      // Update local project state so UI reflects the change immediately
      if (project) {
        setProject({ ...project, currentVersion: versionId });
      }

      // Refresh the shared code file so the inline editor reflects the selected version's snapshot
      await fetchCodeFile();

      setVersionMessage('Current version updated and code file restored for this project.');
      setTimeout(() => setVersionMessage(''), 4000);
    } catch (err) {
      console.error('Error setting current version:', err);
      setVersionMessage('Failed to update current version. Please try again.');
      setTimeout(() => setVersionMessage(''), 4000);
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '2px solid var(--border-color)'
      }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>{project.name}</h1>
          {project.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginTop: '4px' }}>
              {project.description}
            </p>
          )}
        </div>
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
        <>
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

          <div className="card" style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📝</span> Code Editor
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
              Edit and manage your project code files. Select a version from the dropdown to view historical snapshots.
              Changes are saved to the current shared file for all collaborators.
            </p>

            <div
              className="form-group"
              style={{ marginBottom: '10px', maxWidth: '320px' }}
            >
              <label>Editor version</label>
              <select
                value={selectedEditorVersionId}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedEditorVersionId(value);

                  if (value === 'current') {
                    // Load the latest shared code file from the project
                    fetchCodeFile();
                    return;
                  }

                  const selectedVersion = versions.find((v) => v._id === value);
                  if (!selectedVersion) return;

                  const codeFile = selectedVersion.codeFile || {};

                  setEditorFilename(codeFile.filename || editorFilename || 'Main.java');
                  setEditorContent(codeFile.content || '');
                }}
              >
                <option value="current">Current (latest saved)</option>
                {versions.map((version) => (
                  <option key={version._id} value={version._id}>
                    {version.versionNumber} — {new Date(version.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <small style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '6px', lineHeight: '1.5' }}>
                Select a version to view its code snapshot. Saving updates the current shared file for all collaborators.
              </small>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                marginBottom: '10px',
                flexWrap: 'wrap'
              }}
            >
              <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                <label>File name (optional)</label>
                <input
                  type="text"
                  value={editorFilename}
                  onChange={(e) => setEditorFilename(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label
                  htmlFor="inline-editor-file-input"
                  className="btn btn-secondary"
                  style={{ cursor: 'pointer' }}
                >
                  Load from file
                </label>
                <input
                  id="inline-editor-file-input"
                  type="file"
                  accept=".java,.txt,.md,.json,.xml,.yaml,.yml"
                  style={{ display: 'none' }}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;

                    setEditorFilename(file.name);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const text = typeof e.target?.result === 'string' ? e.target.result : '';
                      setEditorContent(text);
                    };
                    reader.readAsText(file);
                  }}
                />

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={() => {
                    const blob = new Blob([editorContent], { type: 'text/plain;charset=utf-8' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = editorFilename || 'notes.txt';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(link.href);
                  }}
                >
                  Download
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={async () => {
                    try {
                      const payload = {
                        filename: editorFilename || 'Main.java',
                        content: editorContent || ''
                      };

                      await api.put(`/projects/${id}/code-file`, payload);

                      setEditorSavedMessage('Editor content saved for this project. All collaborators will see the latest version.');
                      setTimeout(() => setEditorSavedMessage(''), 4000);
                    } catch (err) {
                      console.error('Error saving code file for editor:', err);
                      setEditorSavedMessage('Unable to save editor content. Please try again.');
                      setTimeout(() => setEditorSavedMessage(''), 4000);
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '10px' }}>
              <label>Editor</label>
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                style={{
                  minHeight: '400px',
                  fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, Courier New, monospace',
                  fontSize: '14px',
                  whiteSpace: 'pre',
                  overflow: 'auto',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  lineHeight: '1.6'
                }}
              />
            </div>

            {editorSavedMessage && (
              <div
                className="success"
                style={{ marginTop: '5px' }}
              >
                {editorSavedMessage}
              </div>
            )}
          </div>
        </>
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
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
              Versions are metadata snapshots (labels/descriptions). Setting a version as current does not
              automatically change documentation or code, but gives your team a clear reference point to
              which version is considered active.
            </p>

            {versionMessage && (
              <div
                className="success"
                style={{ marginBottom: '16px' }}
              >
                {versionMessage}
              </div>
            )}

            {versions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>No versions yet</p>
                <p style={{ fontSize: '14px' }}>Create your first version to start tracking changes</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {versions.map((version) => (
                  <div
                    key={version._id}
                    style={{
                      padding: '20px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                      backgroundColor: project?.currentVersion === version._id ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{version.versionNumber}</strong>
                        {project?.currentVersion === version._id && (
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              backgroundColor: 'var(--primary-color)',
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            Current
                          </span>
                        )}
                      </div>
                      {version.description && (
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>
                          {version.description}
                        </p>
                      )}
                      <small style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        Created by <strong>{version.createdBy.username}</strong> on{' '}
                        {new Date(version.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </small>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      {project?.currentVersion !== version._id && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                          onClick={() => handleSetCurrentVersion(version._id)}
                        >
                          Restore
                        </button>
                      )}
                    </div>
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
