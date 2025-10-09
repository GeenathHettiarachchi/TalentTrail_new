// src/components/QAForm.jsx
/**
 * QAForm.jsx
 *
 * Add/Edit QA Intern.
 * EDIT MODE: Only Training End Date, QA Tools, and Projects are editable/submitted.
 * ADD MODE: All fields are editable/submitted.
 *
 * Tools UI: custom multi-select dropdown with checkboxes (no Ctrl/Cmd)
 * Projects UI: custom multi-select dropdown with checkboxes (fetched from /api/projects)
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

// Fixed QA tool options
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
  const isEdit = !!current;

  // ---------------- State ----------------
  const [formData, setFormData] = useState({
    internCode: '',
    name: '',
    email: '',
    mobileNumber: '',
    trainingEndDate: '',
  });

  // Tools multi-select
  const [selectedTools, setSelectedTools] = useState(() => new Set());
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef(null);

  // Projects multi-select (fetched)
  const [projectCatalog, setProjectCatalog] = useState([]); // [{ id, projectName }]
  const [selectedProjectIds, setSelectedProjectIds] = useState(() => new Set());
  const [projectsOpen, setProjectsOpen] = useState(false);
  const projectsRef = useRef(null);

  // Errors
  const [errors, setErrors] = useState({});

  // ---------------- Helpers ----------------
  const splitCSV = (val) => val.split(',').map((s) => s.trim()).filter(Boolean);

  const normalizeTools = (v) => {
    let list = [];
    if (Array.isArray(v)) list = v.map(String).map((s) => s.trim());
    else if (typeof v === 'string') list = splitCSV(v);
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

  // ---------------- Effects ----------------
  // Fetch projects when modal opens
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res = await projectService.getAllProjects();
        const data = Array.isArray(res.data) ? res.data : [];
        const normalized = data.map((p) => ({
          id: p.id ?? p.projectId,
          projectName: p.projectName ?? p.name ?? 'Unnamed Project',
        }));
        setProjectCatalog(normalized);
      } catch (e) {
        console.error('Failed to fetch projects', e);
        setProjectCatalog([]);
      }
    })();
  }, [isOpen]);

  // Hydrate form
  useEffect(() => {
    if (current) {
      setFormData({
        internCode: current.internCode || '',
        name: current.name || '',
        email: current.email || '',
        mobileNumber: current.mobileNumber || '',
        trainingEndDate: current.trainingEndDate ? current.trainingEndDate.split('T')[0] : '',
      });
      setSelectedTools(new Set(normalizeTools(current.tools ?? current.skills)));
      setSelectedProjectIds(new Set()); // matched below once catalog is ready
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

  // Match existing intern projects to catalog IDs
  useEffect(() => {
    if (!isOpen || !current || !projectCatalog.length) return;
    const incoming = normalizeProjects(current.projects);
    const namesWanted = new Set(incoming.map((p) => p.name.toLowerCase()));
    const matched = new Set(
      projectCatalog
        .filter((p) => namesWanted.has((p.projectName || '').toLowerCase()))
        .map((p) => p.id)
    );
    setSelectedProjectIds(matched);
  }, [projectCatalog, current, isOpen]);

  // Close Tools dropdown on outside click / Esc
  useEffect(() => {
    if (!toolsOpen) return;
    const onDocClick = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) setToolsOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setToolsOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [toolsOpen]);

  // Close Projects dropdown on outside click / Esc
  useEffect(() => {
    if (!projectsOpen) return;
    const onDocClick = (e) => {
      if (projectsRef.current && !projectsRef.current.contains(e.target)) setProjectsOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setProjectsOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [projectsOpen]);

  // ---------------- Validation ----------------
  const validateForm = () => {
    const newErrors = {};
    if (!formData.internCode.trim()) newErrors.internCode = 'Trainee ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.trainingEndDate) newErrors.trainingEndDate = 'End date is required';
    return newErrors;
  };

  // ---------------- Handlers ----------------
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

    if (isEdit) {
      onSubmit({
        internCode: formData.internCode, // identifier (locked)
        trainingEndDate: formData.trainingEndDate,
        tools,
        projects,
      });
      return;
    }

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

  const handleClose = () => { if (!isLoading) onClose(); };

  const toggleProjectId = (id) => {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleTool = (tool) => {
    setSelectedTools((prev) => {
      const next = new Set(prev);
      if (next.has(tool)) next.delete(tool); else next.add(tool);
      return next;
    });
  };

  // Lock helper: disable an input when editing
  const lockIfEdit = (extra = {}) => (isEdit ? { disabled: true, ...extra } : extra);

  // ---------------- Render ----------------
  if (!isOpen) return null;

  const selectedToolsText =
    selectedTools.size === 0 ? 'Select tools…' : Array.from(selectedTools).join(', ');

  const selectedProjectsText =
    selectedProjectIds.size === 0
      ? 'Select projects…'
      : Array.from(selectedProjectIds)
          .map((id) => projectCatalog.find((p) => p.id === id)?.projectName)
          .filter(Boolean)
          .join(', ');

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? 'Edit QA Intern' : 'Add QA Intern'}</h2>
          <button type="button" className={styles.closeButton} onClick={handleClose} disabled={isLoading}>
            <FiX />
          </button>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGrid}>
            {/* Trainee ID (LOCKED in edit) */}
            <div className={styles.inputGroup}>
              <label className={styles.label}><FiUser className={styles.labelIcon} />Trainee ID</label>
              <input
                type="text"
                name="internCode"
                value={formData.internCode}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.internCode ? styles.inputError : ''}`}
                placeholder="e.g. QA001"
                {...lockIfEdit()}
              />
            </div>

            {/* Full Name (LOCKED in edit) */}
            <div className={styles.inputGroup}>
              <label className={styles.label}><FiUser className={styles.labelIcon} />Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                placeholder="Enter full name"
                {...lockIfEdit()}
              />
            </div>

            {/* Email (LOCKED in edit) */}
            <div className={styles.inputGroup}>
              <label className={styles.label}><FiMail className={styles.labelIcon} />Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="Enter email"
                {...lockIfEdit()}
              />
            </div>

            {/* Mobile (LOCKED in edit) */}
            <div className={styles.inputGroup}>
              <label className={styles.label}><FiPhone className={styles.labelIcon} />Mobile</label>
              <input
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.mobileNumber ? styles.inputError : ''}`}
                placeholder="07XXXXXXXX"
                {...lockIfEdit()}
              />
            </div>

            {/* Training End Date (EDITABLE) */}
            <div className={styles.inputGroup}>
              <label className={styles.label}><FiCalendar className={styles.labelIcon} />Training End Date</label>
              <input
                type="date"
                name="trainingEndDate"
                value={formData.trainingEndDate}
                onChange={handleInputChange}
                className={`${styles.input} ${styles.dateInput}`}
                disabled={isLoading}
                required
              />
            </div>

            {/* QA Tools (EDITABLE) */}
            <div className={styles.inputGroupFull} ref={toolsRef}>
              <label className={styles.label}><FiTool className={styles.labelIcon} />QA Tools</label>
              <button
                type="button"
                className={`${styles.input} ${styles.multiSelectControl}`}
                onClick={() => setToolsOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={toolsOpen}
                disabled={isLoading}
              >
                <span className={selectedTools.size ? styles.multiSelectValue : styles.multiSelectPlaceholder}>
                  {selectedToolsText}
                </span>
                <FiChevronDown className={`${styles.multiSelectChevron} ${toolsOpen ? styles.chevronOpen : ''}`} />
              </button>

              {toolsOpen && (
                <div className={styles.multiSelectMenu} role="listbox" aria-multiselectable="true">
                  {QA_TOOL_OPTIONS.map((tool) => {
                    const checked = selectedTools.has(tool);
                    return (
                      <label key={tool} className={`${styles.multiSelectOption} ${checked ? styles.optionChecked : ''}`}>
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

            {/* Projects (EDITABLE, same dropdown UX as Tools) */}
            <div className={styles.inputGroupFull} ref={projectsRef}>
              <label className={styles.label}><FiFolderPlus className={styles.labelIcon} />Projects</label>
              <button
                type="button"
                className={`${styles.input} ${styles.multiSelectControl}`}
                onClick={() => setProjectsOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={projectsOpen}
                disabled={isLoading}
              >
                <span className={selectedProjectIds.size ? styles.multiSelectValue : styles.multiSelectPlaceholder}>
                  {selectedProjectsText}
                </span>
                <FiChevronDown className={`${styles.multiSelectChevron} ${projectsOpen ? styles.chevronOpen : ''}`} />
              </button>

              {projectsOpen && (
                <div className={styles.multiSelectMenu} role="listbox" aria-multiselectable="true">
                  {projectCatalog.length === 0 ? (
                    <div className={styles.multiSelectEmpty}>No projects available</div>
                  ) : (
                    projectCatalog.map((p) => {
                      const checked = selectedProjectIds.has(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`${styles.multiSelectOption} ${checked ? styles.optionChecked : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProjectId(p.id)}
                            disabled={isLoading}
                          />
                          <span>{p.projectName}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              )}

              {selectedProjectIds.size > 0 && (
                <div className={styles.tagsWrap}>
                  {Array.from(selectedProjectIds).map((id) => {
                    const name = projectCatalog.find((p) => p.id === id)?.projectName || 'Project';
                    return (
                      <span key={id} className={styles.tag}>
                        {name}
                        <button
                          type="button"
                          className={styles.tagRemove}
                          onClick={() => toggleProjectId(id)}
                          aria-label={`Remove ${name}`}
                          disabled={isLoading}
                        >
                          <FiTrash2 />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={handleClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isEdit ? 'Update Intern' : 'Add Intern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QAForm;
