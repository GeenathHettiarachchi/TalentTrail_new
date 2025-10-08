// src/components/QAForm.jsx
/**
 * QAForm.jsx
 *
 * Add/Edit QA Intern.
 * EDIT MODE: Only Training End Date, QA Tools, and Projects are editable/submitted.
 * ADD MODE: All fields are editable/submitted.
 *
 * Projects are fetched dynamically from the backend (/api/projects).
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
import { projectService } from '../../services/api'; // ✅ uses your existing api.jsx

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

  const [selectedTools, setSelectedTools] = useState(() => new Set());
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef(null);

  const [projectCatalog, setProjectCatalog] = useState([]); // [{ id, projectName }]
  const [selectedProjectIds, setSelectedProjectIds] = useState(() => new Set());

  const [errors, setErrors] = useState({});

  // ---------------- Helpers ----------------
  const splitCSV = (val) => val.split(',').map((s) => s.trim()).filter(Boolean);

  const normalizeTools = (v) => {
    let list = [];
    if (!v) list = [];
    else if (Array.isArray(v)) list = v.map(String).map((s) => s.trim());
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
  // ✅ Fetch projects from backend when modal opens
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const response = await projectService.getAllProjects();
        const data = Array.isArray(response.data) ? response.data : [];

        // ✅ Normalize: some APIs may return `projectId` or `name` instead of `id/projectName`
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

  // ✅ Populate form fields when editing
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

  // ✅ Match existing intern projects with backend project list
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

  // Close tool dropdown on outside click
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

    // ✅ Only allow some fields to be updated in Edit mode
    if (isEdit) {
      onSubmit({
        internCode: formData.internCode,
        trainingEndDate: formData.trainingEndDate,
        tools,
        projects,
      });
      return;
    }

    // ✅ Add mode: all fields included
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

  const lockIfEdit = (extra = {}) => (isEdit ? { disabled: true, ...extra } : extra);

  // ---------------- Render ----------------
  if (!isOpen) return null;

  const selectedToolsText =
    selectedTools.size === 0 ? 'Select tools…' : Array.from(selectedTools).join(', ');

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
                <span>{selectedToolsText}</span>
                <FiChevronDown />
              </button>

              {toolsOpen && (
                <div className={styles.multiSelectMenu}>
                  {QA_TOOL_OPTIONS.map((tool) => (
                    <label key={tool} className={styles.multiSelectOption}>
                      <input
                        type="checkbox"
                        checked={selectedTools.has(tool)}
                        onChange={() => toggleTool(tool)}
                        disabled={isLoading}
                      />
                      <span>{tool}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Projects (EDITABLE) */}
            <div className={styles.inputGroupFull}>
              <label className={styles.label}><FiFolderPlus className={styles.labelIcon} />Projects</label>
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

          {/* Actions */}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={handleClose}>Cancel</button>
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
