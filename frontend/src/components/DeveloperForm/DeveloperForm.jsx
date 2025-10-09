import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiServer, FiLayers, FiChevronDown } from 'react-icons/fi';
import styles from './DeveloperForm.module.css';

const DeveloperForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingIntern = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    languagesAndFrameworks: [],
    projects: [],
  });
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProjOpen, setIsProjOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingIntern) {
      const toList = (v) =>
        Array.isArray(v)
          ? v
          : typeof v === 'string' && v.trim()
          ? v.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
      setFormData({
        languagesAndFrameworks: toList(editingIntern.languagesAndFrameworks),
        projects: toList(editingIntern.projects),
      });
    } else {
      setFormData({
        languagesAndFrameworks: [],
        projects: [],
      });
    }
    setErrors({});
  }, [editingIntern, isOpen]);

  const languagesList = [
    'Java',
    'Python',
    'C#',
    'MERN',
    'Laravel',
    'Spring Boot',
    '.NET',
    'PHP',
    'React',
    'Angular',
    'Vue.js',
  ];

  const projectsList = [
    'Portfolio Website',
    'Task Tracker',
    'E-Commerce Platform',
    'Admin Dashboard',
    'Inventory Manager',
    'CRM Application',
    'HR Portal',
  ];

 const toggleMulti = (field, value) => {
    setFormData((prev) => {
      const set = new Set(prev[field]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...prev, [field]: Array.from(set) };
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.languagesAndFrameworks.length) {
      newErrors.languagesAndFrameworks = 'Select at least one language/framework.';
    }
    if (!formData.projects.length) {
      newErrors.projects = 'Select at least one project.';
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

  const handleClose = () => {
    if (!isLoading) {
      setIsLangOpen(false);
      setIsProjOpen(false);
      onClose();
    }
  };

   if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Developer Intern</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isLoading}
          >
            <FiX />
          </button>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            {/* Languages & Frameworks */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FiServer className={styles.labelIcon} />
                Languages & Frameworks
              </label>
              <div
                className={`${styles.multiSelect} ${
                  errors.languagesAndFrameworks ? styles.inputError : ''
                }`}
                onClick={() => !isLoading && setIsLangOpen((v) => !v)}
                role="button"
                aria-expanded={isLangOpen}
              >
                <div className={styles.multiControl}>
                  <div className={styles.multiValue}>
                    {formData.languagesAndFrameworks.length
                      ? formData.languagesAndFrameworks.join(', ')
                      : 'Select one or more…'}
                  </div>
                  <FiChevronDown className={styles.caret} />
                </div>
                {isLangOpen && (
                  <div
                    className={styles.multiMenu}
                    onClick={(e) => e.stopPropagation()}
                    role="listbox"
                  >
                    {languagesList.map((opt) => (
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
                className={`${styles.multiSelect} ${
                  errors.projects ? styles.inputError : ''
                }`}
                onClick={() => !isLoading && setIsProjOpen((v) => !v)}
                role="button"
                aria-expanded={isProjOpen}
              >
                <div className={styles.multiControl}>
                  <div className={styles.multiValue}>
                    {formData.projects.length
                      ? formData.projects.join(', ')
                      : 'Select one or more…'}
                  </div>
                  <FiChevronDown className={styles.caret} />
                </div>
                {isProjOpen && (
                  <div
                    className={styles.multiMenu}
                    onClick={(e) => e.stopPropagation()}
                    role="listbox"
                  >
                    {projectsList.map((opt) => (
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
              {errors.projects && (
                <span className={styles.errorText}>{errors.projects}</span>
              )}
            </div>
          </div>
          {/* Actions */}
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
                  Updating...
                </>
              ) : (
                'Update Intern'
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