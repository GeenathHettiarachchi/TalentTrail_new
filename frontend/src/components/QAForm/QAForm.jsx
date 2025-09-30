// src/components/QAForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  FiX,
  FiUser,
  FiMail,
  FiCalendar,
  FiPhone,
  FiTool,
  FiFolderPlus,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';
import styles from './QAForm.module.css';

const QAForm = ({
  isOpen,
  onClose,
  onSubmit,
  intern,               // from QA.jsx
  editingIntern = null, // backward-compat
  isLoading = false,
}) => {
  const current = useMemo(() => editingIntern ?? intern ?? null, [editingIntern, intern]);

  const [formData, setFormData] = useState({
    internCode: '',
    name: '',
    email: '',
    mobileNumber: '',
    trainingEndDate: '',
  });
}

// Tools: array of strings
  const [tools, setTools] = useState([]);
  const [toolInput, setToolInput] = useState('');

  // Projects: array of { name }
    const [projects, setProjects] = useState([]);
    const [projectNameInput, setProjectNameInput] = useState('');
  
    const [errors, setErrors] = useState({});
  
    // ---------- Helpers ----------
    const splitCSV = (val) =>
      val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
  
    const normalizeTools = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
      if (typeof v === 'string') return splitCSV(v);
      return [];
    };
  
    const normalizeProjects = (v) => {
      if (!v) return [];
      if (typeof v === 'string') return splitCSV(v).map((name) => ({ name }));
      if (Array.isArray(v)) {
        return v
          .map((x) => (typeof x === 'string' ? { name: x } : x))
          .filter((p) => (p?.name || '').trim())
          .map((p) => ({ name: p.name.trim() }));
      }
      return [];
    };
  
    // ---------- Load data for Add/Edit ----------
    useEffect(() => {
      if (current) {
        setFormData({
          internCode: current.internCode || '',
          name: current.name || '',
          email: current.email || '',
          mobileNumber: current.mobileNumber || '',
          trainingEndDate: current.trainingEndDate ? current.trainingEndDate.split('T')[0] : '',
        });
        setTools(normalizeTools(current.tools ?? current.skills));
        setProjects(normalizeProjects(current.projects));
      } else {
        setFormData({
          internCode: '',
          name: '',
          email: '',
          mobileNumber: '',
          trainingEndDate: '',
        });
        setTools([]);
        setProjects([]);
      }
      setErrors({});
    }, [current, isOpen]);
  
     // ---------- Validation ----------
  const validateForm = () => {
    const newErrors = {};

    if (!formData.internCode.trim()) {
      newErrors.internCode = 'Trainee ID is required';
    } else if (formData.internCode.length < 3) {
      newErrors.internCode = 'Trainee ID must be at least 3 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^(\+94|0)?7\d{8}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Enter a valid Sri Lanka mobile e.g. 07XXXXXXXX';
    }

    // Training End Date: only require a value; allow past dates
    if (!formData.trainingEndDate) {
      newErrors.trainingEndDate = 'End date is required';
    }
    

    return newErrors;
  };

  // ---------- Handlers ----------
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      internCode: formData.internCode.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      trainingEndDate: formData.trainingEndDate,
      tools,                 // array of strings
      projects,              // array of { name }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleClose = () => { if (!isLoading) onClose(); };

  // Tools add/remove
  const addToolsFromText = (text) => {
    const parts = splitCSV(text);
    if (!parts.length) return;
    setTools((prev) => Array.from(new Set([...prev, ...parts])));
  };

  const handleToolKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (toolInput.trim()) {
        addToolsFromText(toolInput);
        setToolInput('');
      }
    }
  };

  const handleToolBlur = () => {
    if (toolInput.trim()) {
      addToolsFromText(toolInput);
      setToolInput('');
    }
  };

  const removeTool = (idx) => setTools((prev) => prev.filter((_, i) => i !== idx));

  // Projects add/remove (name only)
    const addProject = () => {
      const name = projectNameInput.trim();
      if (!name) return;
      setProjects((prev) => {
        const exists = prev.some((p) => p.name.toLowerCase() === name.toLowerCase());
        if (exists) return prev;
        return [...prev, { name }];
      });
      setProjectNameInput('');
    };
  
    const removeProject = (idx) => setProjects((prev) => prev.filter((_, i) => i !== idx));
  
    if (!isOpen) return null;
  
    return (
      <div className={styles.overlay} onClick={handleClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2 className={styles.title}>{current ? 'Edit QA Intern' : 'Add QA Intern'}</h2>
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
              {/* Trainee ID */}
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="internCode">
                  <FiUser className={styles.labelIcon} />
                  Trainee ID
                </label>
                <input
                  type="text"
                  id="internCode"
                  name="internCode"
                  value={formData.internCode}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.internCode ? styles.inputError : ''}`}
                  placeholder="e.g. QA001"
                  disabled={isLoading}
                  required
                />
                {errors.internCode && <span className={styles.errorText}>{errors.internCode}</span>}
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
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Enter full name"
                  disabled={isLoading}
                  required
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
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
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="Enter email address"
                  disabled={isLoading}
                  required
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>
  
              {/* Mobile */}
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="mobileNumber">
                  <FiPhone className={styles.labelIcon} />
                  Mobile Number
                </label>
                <input
                  type="text"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.mobileNumber ? styles.inputError : ''}`}
                  placeholder="07XXXXXXXX or +947XXXXXXXX"
                  disabled={isLoading}
                  required
                />
                {errors.mobileNumber && <span className={styles.errorText}>{errors.mobileNumber}</span>}
              </div>
  
              {/* End Date */}
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
                   className={`${styles.input} ${styles.dateInput} ${errors.trainingEndDate ? styles.inputError : ''}`}
                   placeholder="YYYY-MM-DD"
                   disabled={isLoading}
                   required
                />
                {errors.trainingEndDate && (
                  <span className={styles.errorText}>{errors.trainingEndDate}</span>
                )}
              </div>
  
              {/* Tools (multi) */}
              <div className={styles.inputGroupFull}>
                <label className={styles.label} htmlFor="toolsInput">
                  <FiTool className={styles.labelIcon} />
                  Tools
                </label>
                <div className={styles.tagsInputRow}>
                  <input
                    type="text"
                    id="toolsInput"
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    onKeyDown={handleToolKeyDown}
                    onBlur={handleToolBlur}
                    className={styles.input}
                    placeholder="Selenium, JMeter, Postman"
                    disabled={isLoading}
                  />
                </div>
                {tools.length > 0 && (
                  <div className={styles.tagsWrap}>
                    {tools.map((t, idx) => (
                      <span key={`${t}-${idx}`} className={styles.tag}>
                        {t}
                        <button
                          type="button"
                          className={styles.tagRemove}
                          onClick={() => removeTool(idx)}
                          aria-label={`Remove ${t}`}
                          disabled={isLoading}
                        >
                          <FiTrash2 />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
  
              {/* Projects (multi objects, name only) */}
              <div className={styles.inputGroupFull}>
                <label className={styles.label}>
                  <FiFolderPlus className={styles.labelIcon} />
                  Projects
                </label>
                <div className={styles.projectsRow}>
                  <input
                    type="text"
                    value={projectNameInput}
                    onChange={(e) => setProjectNameInput(e.target.value)}
                    className={styles.input}
                    placeholder="Project name e.g. Billing Portal"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={addProject}
                    disabled={isLoading}
                    title="Add project"
                  >
                    <FiPlus />
                  </button>
                </div>
  
                {projects.length > 0 && (
                  <div className={styles.tagsWrap}>
                    {projects.map((p, idx) => (
                      <span key={`${p.name}-${idx}`} className={styles.projectTag}>
                        {p.name}
                        <button
                          type="button"
                          className={styles.tagRemove}
                          onClick={() => removeProject(idx)}
                          aria-label={`Remove ${p.name}`}
                          disabled={isLoading}
                        >
                          <FiTrash2 />
                        </button>
                      </span>
                    ))}
                  </div>
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
              <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className={styles.spinner}></div>
                    {current ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  current ? 'Update Intern' : 'Add Intern'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  
  export default QAForm;
  