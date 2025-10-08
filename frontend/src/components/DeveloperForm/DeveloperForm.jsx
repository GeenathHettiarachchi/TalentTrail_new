import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiCalendar, FiServer } from 'react-icons/fi';
import styles from './DeveloperForm.module.css';

const DeveloperForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingIntern = null,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    internCode: '',
    name: '',
    email: '',
    trainingEndDate: '',
    Languages: 'Java'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingIntern) {
      setFormData({
        internCode: editingIntern.internCode || '',
        name: editingIntern.name || '',
        email: editingIntern.email || '',
        trainingEndDate: editingIntern.trainingEndDate ? 
          editingIntern.trainingEndDate.split('T')[0] : '',
        Languages: editingIntern.Languages || 'Java'
      });
    } else {
      setFormData({
        internCode: '',
        name: '',
        email: '',
        trainingEndDate: '',
        Languages: 'Java'
      });
    }
    setErrors({});
  }, [editingIntern, isOpen]);

  const Languages = [
    'C#',
    'Python',
    'Java',
    'Mern',
    'Php',
    'Laravel',
    '.Net',
    'Springboot'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.internCode.trim()) {
      newErrors.internCode = 'Intern code is required';
    } else if (formData.internCode.length < 3) {
      newErrors.internCode = 'Intern code must be at least 3 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.trainingEndDate) {
      newErrors.trainingEndDate = 'Training end date is required';
    } else {
      const endDate = new Date(formData.trainingEndDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (endDate < today) {
        newErrors.trainingEndDate = 'End date cannot be in the past';
      }
    }

    if (!formData.Languages.trim()) {
      newErrors.Languages = 'Languages is required';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {editingIntern ? 'Edit Developer Intern' : 'Add Developer Intern'}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="internCode">
                <FiUser className={styles.labelIcon} />
                Intern Code
              </label>
              <input
                type="text"
                id="internCode"
                name="internCode"
                value={formData.internCode}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.internCode ? styles.inputError : ''}`}
                placeholder="e.g., WEB001"
                disabled={isLoading}
                required
              />
              {errors.internCode && (
                <span className={styles.errorText}>{errors.internCode}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="name">
                <FiUser className={styles.labelIcon} />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                placeholder="Enter full name"
                disabled={isLoading}
                required
              />
              {errors.name && (
                <span className={styles.errorText}>{errors.name}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="email">
                <FiMail className={styles.labelIcon} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="Enter email address"
                disabled={isLoading}
                required
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="trainingEndDate">
                <FiCalendar className={styles.labelIcon} />
                Training End Date
              </label>
              <input
                type="date"
                id="trainingEndDate"
                name="trainingEndDate"
                value={formData.trainingEndDate}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.trainingEndDate ? styles.inputError : ''}`}
                disabled={isLoading}
                required
              />
              {errors.trainingEndDate && (
                <span className={styles.errorText}>{errors.trainingEndDate}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="Languages">
                <FiServer className={styles.labelIcon} />
                Languages
              </label>
              <select
                id="Languages"
                name="Languages"
                value={formData.Languages}
                onChange={handleInputChange}
                className={`${styles.input} ${styles.select} ${errors.Languages ? styles.inputError : ''}`}
                disabled={isLoading}
                required
              >
                <option value="">Select Languages</option>
                {Languages.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.Languages && (
                <span className={styles.errorText}>{errors.Languages}</span>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  {editingIntern ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editingIntern ? 'Update Intern' : 'Add Intern'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeveloperForm;
