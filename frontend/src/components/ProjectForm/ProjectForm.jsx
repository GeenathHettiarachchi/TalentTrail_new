import React, { useState, useEffect } from 'react';
import { teamService, internService } from '../../services/api';
import styles from './ProjectForm.module.css';

const ProjectForm = ({ project, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    startDate: '',
    targetDate: '',
    status: 'PLANNED',
    assignedTeamIds: [],
    projectManagerId: '',
    repoHost: '',
    repoName: '',
    repoAccessToken: ''
  });
  const [teams, setTeams] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [teamSearchTerm, setTeamSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTeamsAndInterns();
      if (project) {
        setFormData({
          projectName: project.projectName || '',
          description: project.description || '',
          startDate: project.startDate || '',
          targetDate: project.targetDate || '',
          status: project.status || 'PLANNED',
          assignedTeamIds: project.assignedTeamIds || (project.assignedTeamId ? [project.assignedTeamId] : []),
          projectManagerId: project.projectManagerId || '',
          repoHost: project.repoHost || '',
          repoName: project.repoName || '',
          repoAccessToken: project.repoAccessToken || ''
        });
      } else {
        // Reset form for new project
        setFormData({
          projectName: '',
          description: '',
          startDate: '',
          targetDate: '',
          status: 'PLANNED',
          assignedTeamIds: [],
          projectManagerId: '',
          repoHost: '',
          repoName: '',
          repoAccessToken: ''
        });
      }
      setErrors({});
      setSubmitError('');
      setTeamSearchTerm('');
    }
  }, [project, isOpen]);

  const fetchTeamsAndInterns = async () => {
    try {
      const [teamsResponse, internsResponse] = await Promise.all([
        teamService.getAllTeams(),
        internService.getAllInterns()
      ]);
      setTeams(teamsResponse.data);
      setInterns(internsResponse.data);
    } catch (error) {
      console.error('Error fetching teams and interns:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'assignedTeamIds') {
      // Handle multi-select for teams
      const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
      setFormData(prev => ({
        ...prev,
        [name]: selectedOptions
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleTeamToggle = (teamId) => {
    setFormData(prev => {
      const teamIds = prev.assignedTeamIds.includes(teamId)
        ? prev.assignedTeamIds.filter(id => id !== teamId)
        : [...prev.assignedTeamIds, teamId];
      
      return {
        ...prev,
        assignedTeamIds: teamIds
      };
    });
  };

  // Filter teams based on search term
  const filteredTeams = teams.filter(team =>
    team.teamName.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
    (team.teamLeaderName && team.teamLeaderName.toLowerCase().includes(teamSearchTerm.toLowerCase()))
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    }

    if (formData.startDate && formData.targetDate && 
        new Date(formData.startDate) > new Date(formData.targetDate)) {
      newErrors.targetDate = 'Target date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        assignedTeamIds: formData.assignedTeamIds.length > 0 ? formData.assignedTeamIds : null,
        projectManagerId: formData.projectManagerId || null
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting project:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save project. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'PLANNED', label: 'Planned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ON_HOLD', label: 'On Hold' }
  ];

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button 
            className={styles.closeBtn}
            onClick={onCancel}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {submitError && (
            <div className={styles.errorAlert}>
              <span className={styles.errorIcon}>⚠️</span>
              <span className={styles.errorText}>{submitError}</span>
              <button 
                type="button"
                className={styles.errorClose}
                onClick={() => setSubmitError('')}
              >
                ×
              </button>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Project Name *</label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.projectName ? styles.inputError : ''}`}
              placeholder="Enter project name"
              disabled={loading}
              required
            />
            {errors.projectName && <span className={styles.error}>{errors.projectName}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
              placeholder="Enter project description"
              disabled={loading}
              rows={4}
              required
            />
            {errors.description && <span className={styles.error}>{errors.description}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.startDate ? styles.inputError : ''}`}
                disabled={loading}
                required
              />
              {errors.startDate && <span className={styles.error}>{errors.startDate}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Target Date *</label>
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.targetDate ? styles.inputError : ''}`}
                disabled={loading}
                required
              />
              {errors.targetDate && <span className={styles.error}>{errors.targetDate}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={styles.select}
              disabled={loading}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Assigned Teams</label>
            <div className={styles.searchableSection}>
              <input
                type="text"
                placeholder="Search teams by name or leader..."
                value={teamSearchTerm}
                onChange={(e) => setTeamSearchTerm(e.target.value)}
                className={styles.searchInput}
                disabled={loading}
              />
              <div className={styles.teamsCheckboxGroup}>
                {filteredTeams.map(team => (
                  <label key={team.teamId} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.assignedTeamIds.includes(team.teamId)}
                      onChange={() => handleTeamToggle(team.teamId)}
                      disabled={loading}
                    />
                    <span className={styles.checkboxText}>{team.teamName}</span>
                    {team.teamLeaderName && (
                      <span className={styles.teamLeaderText}>
                        (Leader: {team.teamLeaderName})
                      </span>
                    )}
                  </label>
                ))}
                {teams.length === 0 && (
                  <span className={styles.noTeamsText}>No teams available</span>
                )}
                {teams.length > 0 && filteredTeams.length === 0 && teamSearchTerm && (
                  <span className={styles.noTeamsText}>No teams found matching "{teamSearchTerm}"</span>
                )}
              </div>
            </div>
            <div className={styles.helperText}>
              💡 Search and select multiple teams that will work on this project.
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Project Manager</label>
            <select
              name="projectManagerId"
              value={formData.projectManagerId}
              onChange={handleInputChange}
              className={styles.select}
              disabled={loading}
            >
              <option value="">Select project manager (optional)</option>
              {interns.map(intern => (
                <option key={intern.internId} value={intern.internId}>
                  {`${intern.name} (${intern.internCode})`}
                </option>
              ))}
            </select>
            <div className={styles.helperText}>
              💡 Choose who will manage this project. This person doesn't need to be on an assigned team.
            </div>
          </div>

          {/* Repository Information Section */}
          <div className={styles.sectionDivider}>
            <h3 className={styles.sectionTitle}>Repository Information</h3>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Repository Host</label>
            <select
              name="repoHost"
              value={formData.repoHost}
              onChange={handleInputChange}
              className={styles.select}
              disabled={loading}
            >
              <option value="">Select repository host (optional)</option>
              <option value="GITHUB">GitHub</option>
              <option value="BITBUCKET">Bitbucket</option>
            </select>
            <div className={styles.helperText}>
              💡 Choose the platform where your project repository is hosted.
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Repository Name</label>
            <input
              type="text"
              name="repoName"
              value={formData.repoName}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="e.g., username/repo-name or workspace/repo-slug"
              disabled={loading}
            />
            <div className={styles.helperText}>
              💡 For GitHub: owner/repository-name | For Bitbucket: workspace/repository-slug
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Repository Access Token</label>
            <input
              type="password"
              name="repoAccessToken"
              value={formData.repoAccessToken}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter access token for repository API access"
              disabled={loading}
            />
            <div className={styles.helperText}>
              🔒 Personal access token for accessing repository data and commits.
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
