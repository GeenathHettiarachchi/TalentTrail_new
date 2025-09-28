import React, { useState, useEffect } from 'react';
import styles from './FunctionForm.module.css';

const FunctionForm = ({ func, moduleId, teamMembers = [], assignedTeam = null, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    functionName: '',
    description: '',
    status: 'PENDING',
    developerInternId: '',
    moduleId: moduleId || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (func) {
        setFormData({
          functionName: func.functionName || '',
          description: func.description || '',
          status: func.status || 'PENDING',
          developerInternId: func.developerInternId || '',
          moduleId: func.moduleId || moduleId || ''
        });
      } else {
        // Reset form for new function
        setFormData({
          functionName: '',
          description: '',
          status: 'PENDING',
          developerInternId: '',
          moduleId: moduleId || ''
        });
      }
      setErrors({});
      setSubmitError('');
    }
  }, [func, moduleId, isOpen]);

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

    if (!formData.functionName.trim()) {
      newErrors.functionName = 'Function name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.developerInternId) {
      newErrors.developerInternId = 'Function developer is required';
    }

    if (!formData.moduleId) {
      newErrors.moduleId = 'Module ID is required';
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
        developerInternId: formData.developerInternId || null
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting function:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save function. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_DEVELOPMENT', label: 'In Development' },
    { value: 'COMPLETED', label: 'Completed' }
  ];

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {func ? 'Edit Function' : 'Create New Function'}
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
            <label className={styles.label}>Function Name *</label>
            <input
              type="text"
              name="functionName"
              value={formData.functionName}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.functionName ? styles.inputError : ''}`}
              placeholder="Enter function name"
              disabled={loading}
              required
            />
            {errors.functionName && <span className={styles.error}>{errors.functionName}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
              placeholder="Enter function description"
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
            <label className={styles.label}>Developer</label>
            <select
              name="developerInternId"
              value={formData.developerInternId}
              onChange={handleInputChange}
              className={styles.select}
              disabled={loading}
            >
              <option value="">Select developer (optional)</option>
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
                💡 Team leaders cannot be assigned as function developers.
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
              {loading ? 'Saving...' : (func ? 'Update Function' : 'Create Function')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FunctionForm;
