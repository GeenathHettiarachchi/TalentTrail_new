import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiServer, FiLayers, FiChevronDown } from 'react-icons/fi';
import { projectService } from '../../services/api';
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
  const [projectCatalog, setProjectCatalog] = useState([]); // [{ id, projectName }]
  const [selectedProjectIds, setSelectedProjectIds] = useState(() => new Set());

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

  useEffect(() => {
    if (!isOpen || !editingIntern || !projectCatalog.length) return;
    const incomingProjects = editingIntern.projects || [];
    const matchedProjectIds = new Set(
      projectCatalog
        .filter((project) => incomingProjects.includes(project.projectName))
        .map((project) => project.id)
    );
    setSelectedProjectIds(matchedProjectIds);
  }, [isOpen, editingIntern, projectCatalog]);

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
                    {projectCatalog.map((project) => (
                      <label key={project.id} className={styles.optionRow}>
                        <input
                          type="checkbox"
                          checked={selectedProjectIds.has(project.id)}
                          onChange={() => {
                            const newSelectedIds = new Set(selectedProjectIds);
                            if (newSelectedIds.has(project.id)) {
                              newSelectedIds.delete(project.id);
                            } else {
                              newSelectedIds.add(project.id);
                            }
                            setSelectedProjectIds(newSelectedIds);
                            const newProjects = Array.from(newSelectedIds).map(
                              (id) => projectCatalog.find((p) => p.id === id)?.projectName
                            );
                            setFormData((prev) => ({ ...prev, projects: newProjects }));
                          }}
                          disabled={isLoading}
                        />
                        <span>{project.projectName}</span>
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