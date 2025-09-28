import React, { useState, useEffect } from 'react';
import styles from './InternForm.module.css';

const InternForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  intern = null,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    internCode: '',
    name: '',
    email: '',
    institute: '',
    trainingStartDate: '',
    trainingEndDate: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (intern) {
      setFormData({
        internCode: intern.internCode || '',
        name: intern.name || '',
        email: intern.email || '',
        institute: intern.institute || '',
        trainingStartDate: intern.trainingStartDate || '',
        trainingEndDate: intern.trainingEndDate || ''
      });
    } else {
      setFormData({
        internCode: '',
        name: '',
        email: '',
        institute: '',
        trainingStartDate: '',
        trainingEndDate: ''
      });
    }
    setErrors({});
  }, [intern, isOpen]);

  const handleChange = (e) => {
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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.internCode.trim()) {
      newErrors.internCode = 'Intern code is required';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.institute.trim()) {
      newErrors.institute = 'Institute is required';
    }
    
    if (!formData.trainingStartDate) {
      newErrors.trainingStartDate = 'Training start date is required';
    }
    
    if (!formData.trainingEndDate) {
      newErrors.trainingEndDate = 'Training end date is required';
    }
    
    if (formData.trainingStartDate && formData.trainingEndDate) {
      if (new Date(formData.trainingStartDate) >= new Date(formData.trainingEndDate)) {
        newErrors.trainingEndDate = 'End date must be after start date';
      }
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const submitData = { ...formData };
    if (intern && intern.internId) {
      submitData.internId = intern.internId;
    }

    onSubmit(submitData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {intern ? 'Edit Intern' : 'Add New Intern'}
          </h2>
          <button 
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="internCode" className={styles.label}>
                Intern Code *
              </label>
              <input
                type="text"
                id="internCode"
                name="internCode"
                value={formData.internCode}
                onChange={handleChange}
                className={`${styles.input} ${errors.internCode ? styles.error : ''}`}
                placeholder="e.g., INT001"
              />
              {errors.internCode && (
                <span className={styles.errorText}>{errors.internCode}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${styles.input} ${errors.name ? styles.error : ''}`}
                placeholder="Enter full name"
              />
              {errors.name && (
                <span className={styles.errorText}>{errors.name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${styles.input} ${errors.email ? styles.error : ''}`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="institute" className={styles.label}>
                Institute *
              </label>
              <input
                type="text"
                id="institute"
                name="institute"
                value={formData.institute}
                onChange={handleChange}
                className={`${styles.input} ${errors.institute ? styles.error : ''}`}
                placeholder="Enter institute name"
              />
              {errors.institute && (
                <span className={styles.errorText}>{errors.institute}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="trainingStartDate" className={styles.label}>
                Training Start Date *
              </label>
              <input
                type="date"
                id="trainingStartDate"
                name="trainingStartDate"
                value={formData.trainingStartDate}
                onChange={handleChange}
                className={`${styles.input} ${errors.trainingStartDate ? styles.error : ''}`}
              />
              {errors.trainingStartDate && (
                <span className={styles.errorText}>{errors.trainingStartDate}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="trainingEndDate" className={styles.label}>
                Training End Date *
              </label>
              <input
                type="date"
                id="trainingEndDate"
                name="trainingEndDate"
                value={formData.trainingEndDate}
                onChange={handleChange}
                className={`${styles.input} ${errors.trainingEndDate ? styles.error : ''}`}
              />
              {errors.trainingEndDate && (
                <span className={styles.errorText}>{errors.trainingEndDate}</span>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (intern ? 'Update Intern' : 'Add Intern')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InternForm;
