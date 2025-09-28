import React, { useState, useEffect } from 'react';
import styles from './ModuleForm.module.css';

const ModuleForm = ({ module, projectId, teamMembers = [], assignedTeam = null, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    moduleName: '',
    description: '',
    status: 'NOT_STARTED',
    ownerInternId: '',
    projectId: projectId || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (module) {
        setFormData({
          moduleName: module.moduleName || '',
          description: module.description || '',
          status: module.status || 'NOT_STARTED',
          ownerInternId: module.ownerInternId || '',
          projectId: module.projectId || projectId || ''
        });
      } else {
        // Reset form for new module
        setFormData({
          moduleName: '',
          description: '',
          status: 'NOT_STARTED',
          ownerInternId: '',
          projectId: projectId || ''
        });
      }
      setErrors({});
      setSubmitError('');
    }
  }, [module, projectId, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.moduleName.trim()) {
      newErrors.moduleName = 'Module name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.ownerInternId) {
      newErrors.ownerInternId = 'Module owner is required';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project ID is required';
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
        ownerInternId: formData.ownerInternId || null
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting module:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save module. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' }
  ];

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {module ? 'Edit Module' : 'Create New Module'}
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
            <label className={styles.label}>Module Name *</label>
            <input
              type="text"
              name="moduleName"
              value={formData.moduleName}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.moduleName ? styles.inputError : ''}`}
              placeholder="Enter module name"
              disabled={loading}
              required
            />
            {errors.moduleName && <span className={styles.error}>{errors.moduleName}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
              placeholder="Enter module description"
              disabled={loading}
              rows={4}
              required
            />
            {errors.description && <span className={styles.error}>{errors.description}</span>}
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
            <label className={styles.label}>Owner</label>
            <select
              name="ownerInternId"
              value={formData.ownerInternId}
              onChange={handleInputChange}
              className={styles.select}
              disabled={loading}
            >
              <option value="">Select owner (optional)</option>
              {teamMembers
                .filter(member => !(assignedTeam && member.internId === assignedTeam.teamLeaderId))
                .map(member => (
                <option key={member.internId} value={member.internId}>
                  {member.internName} ({member.internCode || 'No Code'})
                </option>
              ))}
            </select>
            {assignedTeam && (
              <div className={styles.helperText}>
                💡 Team leaders cannot be assigned as module owners.
              </div>
            )}
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
              {loading ? 'Saving...' : (module ? 'Update Module' : 'Create Module')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleForm;
