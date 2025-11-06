import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiUser, FiMail, FiCalendar, FiPhone, FiLayers, FiChevronDown, FiCode } from 'react-icons/fi';
import { projectService, excelService } from '../../services/api';
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
    mobileNumber: '',
    trainingEndDate: '',
    languagesAndFrameworks: [],
    projects: []
  });

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProjOpen, setIsProjOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [projectOptions, setProjectOptions] = useState([]);
  const [projLoading, setProjLoading] = useState(false);
  const [projError, setProjError] = useState('');
  const [languageOptions, setLanguageOptions] = useState([]);
  const [langLoading, setLangLoading] = useState(false);
  const [langError, setLangError] = useState('');

  const isEditMode = !!editingIntern;

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
        languagesAndFrameworks: toList(editingIntern.languagesAndFrameworks),
        projects: toList(editingIntern.projects)
      });
    } else {
      setFormData({
        internCode: '',
        name: '',
        email: '',
        mobileNumber: '',
        trainingEndDate: '',
        languagesAndFrameworks: [],
        projects: []
      });
    }
    setErrors({});
  }, [editingIntern, isOpen]);

  const fetchLanguages = async () => {
    setLangLoading(true);
    setLangError('');
    try {
      const response = await excelService.getWebDevResourceTypes();
      const data = Array.isArray(response.data) ? response.data : [];
      const normalized = data
        .map(item => {
          if (typeof item === 'string') return item.trim();
          if (item && typeof item === 'object') {
            const candidate = item.label ?? item.name ?? item.value;
            return typeof candidate === 'string' ? candidate.trim() : '';
          }
          return '';
        })
        .filter(Boolean);
  const deduped = Array.from(new Set(normalized)).sort((a, b) => a.localeCompare(b));
  setLanguageOptions(deduped);
    } catch (err) {
      console.error('Failed to load languages & frameworks', err);
      setLangError('Failed to load languages');
    } finally {
      setLangLoading(false);
    }
  };

  const fetchProjects = async () => {
    setProjLoading(true);
    setProjError('');
    try {
      const response = await projectService.getAllProjects();
      const data = response.data;
      const names = Array.from(new Set(
        (data || []).map(p => p?.projectName?.trim()).filter(Boolean)
      )).sort((a,b) => a.localeCompare(b));

      setProjectOptions(names);
    } catch (err) {
      console.error('Failed to load projects', err);
      setProjError(err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setProjLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLanguages();
      fetchProjects();
    }
  }, [isOpen]);

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

    if (!Array.isArray(formData.languagesAndFrameworks) || formData.languagesAndFrameworks.length === 0) {
      newErrors.languagesAndFrameworks = 'Select at least one language or framework';
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

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsLangOpen(false);
      setIsProjOpen(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  const toggleMulti = (field, rawValue) => {
    const value = typeof rawValue === 'string'
      ? rawValue.trim()
      : (rawValue && typeof rawValue === 'object')
        ? (typeof rawValue.label === 'string' && rawValue.label.trim())
          || (typeof rawValue.name === 'string' && rawValue.name.trim())
          || (typeof rawValue.value === 'string' && rawValue.value.trim())
        : '';

    if (!value) {
      return;
    }

    setFormData(prev => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      const exists = current.includes(value);
      const next = exists
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return createPortal(
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
            {/* Intern Code */}
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
                className={`${styles.input} ${errors.internCode ? styles.inputError : ''} ${isEditMode ? styles.readOnlyInput : ''}`}
                placeholder="e.g., DEV001"
                disabled={isLoading || isEditMode}
                readOnly={isEditMode}
                required
              />
              {errors.internCode && (
                <span className={styles.errorText}>{errors.internCode}</span>
              )}
            </div>

            {/* Name */}
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
                className={`${styles.input} ${errors.name ? styles.inputError : ''} ${isEditMode ? styles.readOnlyInput : ''}`}
                placeholder="Enter full name"
                disabled={isLoading || isEditMode}
                readOnly={isEditMode}
                required
              />
              {errors.name && (
                <span className={styles.errorText}>{errors.name}</span>
              )}
            </div>

            {/* Email */}
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
                className={`${styles.input} ${errors.email ? styles.inputError : ''} ${isEditMode ? styles.readOnlyInput : ''}`}
                placeholder="Enter email address"
                disabled={isLoading || isEditMode}
                readOnly={isEditMode}
                required
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            {/* Mobile Number */}
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="mobileNumber">
                <FiPhone className={styles.labelIcon} />
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.mobileNumber ? styles.inputError : ''} ${isEditMode ? styles.readOnlyInput : ''}`}
                placeholder="e.g., 0771234567"
                pattern="^(\+?\d{9,15}|0\d{9})$"
                title="Enter a valid phone number"
                disabled={isLoading || isEditMode}
                readOnly={isEditMode}
                required
              />
              {errors.mobileNumber && (
                <span className={styles.errorText}>{errors.mobileNumber}</span>
              )}
            </div>

            {/* Training End Date */}
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

            {/* Languages & Frameworks */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FiCode className={styles.labelIcon} />
                Languages & Frameworks
              </label>
              <div
                className={`${styles.multiSelect} ${errors.languagesAndFrameworks ? styles.inputError : ''}`}
                onClick={() => !isLoading && !langLoading && setIsLangOpen(v => !v)}
                role="button"
                aria-expanded={isLangOpen}
              >
                <div className={styles.multiControl}>
                  <div className={styles.multiValue}>
                    {formData.languagesAndFrameworks.length
                      ? formData.languagesAndFrameworks.join(', ')
                      : (langLoading ? 'Loading…' : 'Select one or more…')}
                  </div>
                  <FiChevronDown className={styles.caret} />
                </div>
                {isLangOpen && (
                  <div
                    className={styles.multiMenu}
                    onClick={(e) => e.stopPropagation()}
                    role="listbox"
                  >
                    {langLoading && (
                      <div className={styles.optionRow}><span>Loading languages…</span></div>
                    )}
                    {!langLoading && langError && (
                      <div className={styles.optionRow}><span>{langError}</span></div>
                    )}
                    {!langLoading && !langError && languageOptions.length === 0 && (
                      <div className={styles.optionRow}><span>No options found</span></div>
                    )}

                    {!langLoading && !langError && languageOptions.map(opt => (
                      <label key={opt} className={styles.optionRow}>
                        <input
                          type="checkbox"
                          checked={formData.languagesAndFrameworks.includes(opt)}
                          onChange={() => toggleMulti('languagesAndFrameworks', opt)}
                          disabled={isLoading}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {errors.languagesAndFrameworks && (
                <span className={styles.errorText}>{errors.languagesAndFrameworks}</span>
              )}
            </div>

            {/* Projects */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FiLayers className={styles.labelIcon} />
                Projects
              </label>

              <div
                className={`${styles.multiSelect} ${projError ? styles.inputError : ''}`}
                onClick={() => !isLoading && setIsProjOpen(v => !v)}
                role="button"
                aria-expanded={isProjOpen}
              >
                <div className={styles.multiControl}>
                  <div className={styles.multiValue}>
                    {formData.projects.length
                      ? formData.projects.join(', ')
                      : (projLoading ? 'Loading…' : 'Select one or more…')}
                  </div>
                  <FiChevronDown className={styles.caret} />
                </div>

                {isProjOpen && (
                  <div
                    className={styles.multiMenu}
                    onClick={(e) => e.stopPropagation()}
                    role="listbox"
                  >
                    {projLoading && (
                      <div className={styles.optionRow}>
                        <span>Loading projects…</span>
                      </div>
                    )}

                    {!projLoading && projError && (
                      <div className={styles.optionRow}>
                        <span>{projError}</span>
                      </div>
                    )}

                    {!projLoading && !projError && projectOptions.length === 0 && (
                      <div className={styles.optionRow}>
                        <span>No projects found</span>
                      </div>
                    )}

                    {!projLoading && !projError && projectOptions.map(opt => (
                      <label key={opt} className={styles.optionRow}>
                        <input
                          type="checkbox"
                          checked={formData.projects.includes(opt)}
                          onChange={() => toggleMulti('projects', opt)}
                          disabled={isLoading}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
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
    </div>,
    document.body
  );
};

export default DeveloperForm;