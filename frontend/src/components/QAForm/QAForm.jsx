// src/components/QAForm.jsx
/**
 * QAForm.jsx
 *
 * Modal form to Add/Edit a QA Intern profile.
 * - Tools: custom dropdown with multi-select checkboxes (no Ctrl/Cmd)
 * - Projects: checkbox group fetched from backend (/api/projects)
 * - Submits: tools as string[] and projects as { name }[]
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FiX,
  FiUser,
  FiMail,
  FiCalendar,
  FiPhone,
  FiTool,
  FiFolderPlus,
  FiTrash2,
  FiChevronDown,
} from 'react-icons/fi';
import styles from './QAForm.module.css';
import { projectService } from '../../services/api';

const QA_TOOL_OPTIONS = [
  'Selenium',
  'JMeter',
  'Postman',
  'Katalon Studio',
  'Appium',
  'Playwright',
  'Cypress',
  'Puppeteer',
  'Ranorex',
];

const QAForm = ({
  isOpen,
  onClose,
  onSubmit,
  intern,
  editingIntern = null,
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

  const [selectedTools, setSelectedTools] = useState(() => new Set());
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef(null);
  const [projectCatalog, setProjectCatalog] = useState([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState(() => new Set());
  const [errors, setErrors] = useState({});

  const splitCSV = (val) =>
    val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const normalizeTools = (v) => {
    let list = [];
    if (!v) list = [];
    else if (Array.isArray(v)) list = v.map(String).map((s) => s.trim());
    else if (typeof v === 'string') list = splitCSV(v);
    else list = [];
    const allowed = new Set(QA_TOOL_OPTIONS.map((t) => t.toLowerCase()));
    return list.filter((t) => allowed.has(t.toLowerCase()));
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

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const { data } = await projectService.getAllProjects();
        setProjectCatalog(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch projects', e);
        setProjectCatalog([]);
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (current) {
      setFormData({
        internCode: current.internCode || '',
        name: current.name || '',
        email: current.email || '',
        mobileNumber: current.mobileNumber || '',
        trainingEndDate: current.trainingEndDate ? current.trainingEndDate.split('T')[0] : '',
      });
      const incomingTools = normalizeTools(current.tools ?? current.skills);
      setSelectedTools(new Set(incomingTools));
      setSelectedProjectIds(new Set());
    } else {
      setFormData({
        internCode: '',
        name: '',
        email: '',
        mobileNumber: '',
        trainingEndDate: '',
      });
      setSelectedTools(new Set());
      setSelectedProjectIds(new Set());
    }
    setErrors({});
  }, [current, isOpen]);

  useEffect(() => {
    if (!isOpen || !current || !projectCatalog.length) return;
    const incomingProjects = normalizeProjects(current.projects);
    const namesWanted = new Set(incomingProjects.map((p) => p.name.toLowerCase()));
    const matchedIds = new Set(
      projectCatalog
        .filter((p) => namesWanted.has((p.projectName || '').toLowerCase()))
        .map((p) => p.id)
    );
    setSelectedProjectIds(matchedIds);
  }, [projectCatalog, current, isOpen]);

  useEffect(() => {
    if (!toolsOpen) return;
    const onDocClick = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') setToolsOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [toolsOpen]);

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
    if (!formData.trainingEndDate) {
      newErrors.trainingEndDate = 'End date is required';
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
    const tools = Array.from(selectedTools);
    const projects = Array.from(selectedProjectIds)
      .map((id) => projectCatalog.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({ name: p.projectName }));
    onSubmit({
      internCode: formData.internCode.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      trainingEndDate: formData.trainingEndDate,
      tools,
      projects,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  const toggleProjectId = (id) => {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTool = (tool) => {
    setSelectedTools((prev) => {
      const next = new Set(prev);
      if (next.has(tool)) next.delete(tool);
      else next.add(tool);
      return next;
    });
  };

  if (!isOpen) return null;

  const selectedToolsText =
    selectedTools.size === 0 ? 'Select tools…' : Array.from(selectedTools).join(', ');

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

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGrid}>
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

            <div className={styles.inputGroupFull} ref={toolsRef}>
              <label className={styles.label}>
                <FiTool className={styles.labelIcon} />
                QA Tools
              </label>
              <button
                type="button"
                className={`${styles.input} ${styles.multiSelectControl}`}
                onClick={() => setToolsOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={toolsOpen}
              >
                <span
                  className={
                    selectedTools.size === 0
                      ? styles.multiSelectPlaceholder
                      : styles.multiSelectValue
                  }
                >
                  {selectedToolsText}
                </span>
                <FiChevronDown
                  className={`${styles.multiSelectChevron} ${toolsOpen ? styles.chevronOpen : ''}`}
                />
              </button>
              {toolsOpen && (
                <div className={styles.multiSelectMenu} role="listbox" aria-multiselectable="true">
                  {QA_TOOL_OPTIONS.map((tool) => {
                    const checked = selectedTools.has(tool);
                    return (
                      <label
                        key={tool}
                        className={`${styles.multiSelectOption} ${checked ? styles.optionChecked : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTool(tool)}
                          disabled={isLoading}
                        />
                        <span>{tool}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              {selectedTools.size > 0 && (
                <div className={styles.tagsWrap}>
                  {Array.from(selectedTools).map((t) => (
                    <span key={t} className={styles.tag}>
                      {t}
                      <button
                        type="button"
                        className={styles.tagRemove}
                        onClick={() => toggleTool(t)}
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

            <div className={styles.inputGroupFull}>
              <label className={styles.label}>
                <FiFolderPlus className={styles.labelIcon} />
                Projects
              </label>
              <div className={styles.checkboxGrid}>
                {projectCatalog.length === 0 ? (
                  <span className={styles.muted}>No projects available</span>
                ) : (
                  projectCatalog.map((p) => (
                    <label key={p.id} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        checked={selectedProjectIds.has(p.id)}
                        onChange={() => toggleProjectId(p.id)}
                        disabled={isLoading}
                      />
                      <span>{p.projectName}</span>
                    </label>
                  ))
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
};

export default QAForm;
