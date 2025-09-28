import React, { useState, useEffect } from 'react';
import styles from './TestCaseForm.module.css';

const TestCaseForm = ({ testCase, functionId, teamMembers = [], assignedTeam = null, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    testCaseName: '',
    description: '',
    status: 'NOT_RUN',
    createdByInternId: '',
    executedByInternId: '',
    executionDate: '',
    isAutomated: false,
    functionId: functionId || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (testCase) {
        setFormData({
          testCaseName: testCase.testCaseName || '',
          description: testCase.description || '',
          status: testCase.status || 'NOT_RUN',
          createdByInternId: testCase.createdByInternId || '',
          executedByInternId: testCase.executedByInternId || '',
          executionDate: testCase.executionDate || '',
          isAutomated: testCase.isAutomated || false,
          functionId: testCase.functionId || functionId || ''
        });
      } else {
        // Reset form for new test case
        setFormData({
          testCaseName: '',
          description: '',
          status: 'NOT_RUN',
          createdByInternId: '',
          executedByInternId: '',
          executionDate: '',
          isAutomated: false,
          functionId: functionId || ''
        });
      }
      setErrors({});
      setSubmitError('');
    }
  }, [testCase, functionId, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.testCaseName.trim()) {
      newErrors.testCaseName = 'Test case name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.functionId) {
      newErrors.functionId = 'Function ID is required';
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
        createdByInternId: formData.createdByInternId || null,
        executedByInternId: formData.executedByInternId || null,
        executionDate: formData.executionDate || null
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting test case:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save test case. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'NOT_RUN', label: 'Not Run' },
    { value: 'PASS', label: 'Pass' },
    { value: 'FAIL', label: 'Fail' }
  ];

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {testCase ? 'Edit Test Case' : 'Create New Test Case'}
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
            <label className={styles.label}>Test Case Name *</label>
            <input
              type="text"
              name="testCaseName"
              value={formData.testCaseName}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.testCaseName ? styles.inputError : ''}`}
              placeholder="Enter test case name"
              disabled={loading}
              required
            />
            {errors.testCaseName && <span className={styles.error}>{errors.testCaseName}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
              placeholder="Enter test case description"
              disabled={loading}
              rows={4}
              required
            />
            {errors.description && <span className={styles.error}>{errors.description}</span>}
          </div>

          <div className={styles.formRow}>
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
              <label className={styles.label}>Execution Date</label>
              <input
                type="date"
                name="executionDate"
                value={formData.executionDate}
                onChange={handleInputChange}
                className={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Created By</label>
              <select
                name="createdByInternId"
                value={formData.createdByInternId}
                onChange={handleInputChange}
                className={styles.select}
                disabled={loading}
              >
                <option value="">Select creator (optional)</option>
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
                  💡 Team leaders cannot be assigned as test case creators.
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Executed By</label>
              <select
                name="executedByInternId"
                value={formData.executedByInternId}
                onChange={handleInputChange}
                className={styles.select}
                disabled={loading}
              >
                <option value="">Select executor (optional)</option>
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
                  💡 Team leaders cannot be assigned as test case executors.
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isAutomated"
                checked={formData.isAutomated}
                onChange={handleInputChange}
                className={styles.checkbox}
                disabled={loading}
              />
              <span className={styles.checkboxText}>Automated Test Case</span>
            </label>
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
              {loading ? 'Saving...' : (testCase ? 'Update Test Case' : 'Create Test Case')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestCaseForm;
