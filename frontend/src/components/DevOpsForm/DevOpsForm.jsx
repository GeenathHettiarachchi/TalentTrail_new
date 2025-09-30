import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiCalendar, FiServer } from 'react-icons/fi';
import styles from './DevOpsForm.module.css';

const DevOpsForm = ({
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
    mobileNumber: '',
    trainingEndDate: '',
    resourceType: [],
    projects: []
  });


  const [isRTOpen, setIsRTOpen] = useState(false);
  const [isProjOpen, setIsProjOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingIntern) {
      const toList = (v) =>
        Array.isArray(v) ? v
        : (typeof v === 'string' && v.trim() ? v.split(',').map(s => s.trim()).filter(Boolean) : []);
      setFormData({
        internCode: editingIntern.internCode || '',
        name: editingIntern.name || '',
        email: editingIntern.email || '',
        mobileNumber: editingIntern.mobileNumber || '',
        trainingEndDate: editingIntern.trainingEndDate ? 
          editingIntern.trainingEndDate.split('T')[0] : '',
        resourceType: toList(editingIntern.resourceType),
        projects: toList(editingIntern.projects)
      });
    } else {
      setFormData({
        internCode: '',
        name: '',
        email: '',
        mobileNumber: '',
        trainingEndDate: '',
        resourceType: [],
        projects: []
      });
    }
    setErrors({});
  }, [editingIntern, isOpen]);

  const resourceTypes = [
    'Docker',
    'Kubernetes',
    'Jenkins',
    'GitLab CI/CD',
    'AWS DevOps',
    'Azure DevOps',
    'Terraform',
    'Ansible'
  ];

  const projects = [
    'CI/CD',
    'Monitoring',
    'Cloud Migration',
    'Containerization',
    'Infrastructure as Code',
    'Observability',
    'DevSecOps',
    'Release Automation'
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

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^(\+?\d{9,15}|0\d{9})$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Enter a valid phone number';
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

    if (!Array.isArray(formData.resourceType) || formData.resourceType.length === 0) {
      newErrors.resourceType = 'Select at least one resource type';
    }

    if (!formData.resourceType.trim()) {
      newErrors.resourceType = 'Resource type is required';
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

    onSubmit({
      ...formData,
      internId: editingIntern?.internId ?? null,
    });
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
      setIsRTOpen(false);
      setIsProjOpen(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {editingIntern ? 'Edit DevOps Intern' : 'Add DevOps Intern'}
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
                placeholder="e.g., DEV001"
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
              <label className={styles.label} htmlFor="resourceType">
                <FiServer className={styles.labelIcon} />
                Resource Type
              </label>
              <select
                id="resourceType"
                name="resourceType"
                value={formData.resourceType}
                onChange={handleInputChange}
                className={`${styles.input} ${styles.select} ${errors.resourceType ? styles.inputError : ''}`}
                disabled={isLoading}
                required
              >
                <option value="">Select resource type</option>
                {resourceTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.resourceType && (
                <span className={styles.errorText}>{errors.resourceType}</span>
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

export default DevOpsForm;
