import React, { useState, useEffect } from "react";
import {
  FiX,
  FiServer,
  FiLayers,
  FiChevronDown
} from "react-icons/fi";
import styles from "./InternForm.module.css";
import { FiSearch } from "react-icons/fi";

/**
 * Props
 * - isOpen
 * - onClose
 * - onSubmit
 * - intern (object or null)
 * - isLoading (bool)
 * - internOnly (bool) -> when true, show ONLY End Date (for interns)
 */
const InternForm = ({
  isOpen,
  onClose,
  onSubmit,
  intern = null,
  isLoading = false,
  internOnly = false,
}) => {
  // Helpers to coerce incoming values
  const toList = (v) =>
    Array.isArray(v)
      ? v
      : typeof v === "string" && v.trim()
      ? v.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const [formData, setFormData] = useState({
    internCode: "",
    name: "",
    email: "",
    institute: "",
    trainingStartDate: "",
    trainingEndDate: "",
    role: "",
    // New dev sections
    languagesAndFrameworks: [],
    projects: [],
  });

  const [errors, setErrors] = useState({});
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProjOpen, setIsProjOpen] = useState(false);

  // Options (adjust to your needs)
  const languagesList = [
    "Java",
    "Python",
    "C#",
    "MERN",
    "Laravel",
    "Spring Boot",
    ".NET",
    "PHP",
    "React",
    "Angular",
    "Vue.js",
  ];

  const projectsList = [
    "Portfolio Website",
    "Task Tracker",
    "E-Commerce Platform",
    "Admin Dashboard",
    "Inventory Manager",
    "CRM Application",
    "HR Portal",
  ];

  useEffect(() => {
    if (intern) {
      setFormData({
        internCode: intern.internCode || "",
        name: intern.name || "",
        email: intern.email || "",
        institute: intern.institute || "",
        trainingStartDate: intern.trainingStartDate || "",
        trainingEndDate: intern.trainingEndDate || "",
        role: intern.role || "",
        languagesAndFrameworks: toList(intern.languagesAndFrameworks),
        projects: toList(intern.projects),
      });
    } else {
      setFormData({
        internCode: "",
        name: "",
        email: "",
        institute: "",
        trainingStartDate: "",
        trainingEndDate: "",
        role: "",
        languagesAndFrameworks: [],
        projects: [],
      });
    }
    setErrors({});
    setIsLangOpen(false);
    setIsProjOpen(false);
  }, [intern, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const toggleMulti = (field, value) => {
    setFormData((prev) => {
      const next = new Set(prev[field] || []);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [field]: Array.from(next) };
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // In internOnly mode:End Date validation
    if (internOnly) {
      if (!formData.trainingEndDate) {
        newErrors.trainingEndDate = "Training end date is required";
      }
      return newErrors;
    }

    // Admin/full edit validations
    if (!formData.internCode.trim()) newErrors.internCode = "Intern code is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.institute.trim()) newErrors.institute = "Institute is required";
    if (!formData.trainingStartDate) newErrors.trainingStartDate = "Start date is required";
    if (!formData.trainingEndDate) newErrors.trainingEndDate = "End date is required";
    if (formData.trainingStartDate && formData.trainingEndDate) {
      if (new Date(formData.trainingStartDate) >= new Date(formData.trainingEndDate)) {
        newErrors.trainingEndDate = "End date must be after start date";
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

    // Prepare payload
    const submitData = {
      ...formData,
      languagesAndFrameworks: formData.languagesAndFrameworks || [],
      projects: formData.projects || [],
    };

    if (intern && intern.internId) {
      submitData.internId = intern.internId;
    }

    onSubmit(submitData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {internOnly ? "Request End Date Update" : (intern ? "Edit Intern" : "Add New Intern")}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isLoading}
          >
            <FiX />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Intern-only: End Date only */}
          {internOnly ? (
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="trainingEndDate" className={styles.label}>
                  New Training End Date *
                </label>
                <input
                  type="date"
                  id="trainingEndDate"
                  name="trainingEndDate"
                  value={formData.trainingEndDate}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.trainingEndDate ? styles.inputError : ""
                  }`}
                />
                {errors.trainingEndDate && (
                  <span className={styles.errorText}>{errors.trainingEndDate}</span>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Admin/full edit grid */}
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="internCode" className={styles.label}>Intern Code </label>
                  <input
                    type="text"
                    id="internCode"
                    name="internCode"
                    value={formData.internCode}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.internCode ? styles.inputError : ""}`}
                    placeholder="e.g., INT001"
                    disabled
                  />
                  {errors.internCode && <span className={styles.errorText}>{errors.internCode}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="name" className={styles.label}>Full Name </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                    placeholder="Enter full name"
                    disabled
                  />
                  {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>Email </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                    placeholder="Enter email address"
                    disabled
                  />
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="institute" className={styles.label}>Institute </label>
                  <input
                    type="text"
                    id="institute"
                    name="institute"
                    value={formData.institute}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.institute ? styles.inputError : ""}`}
                    placeholder="Enter institute name"
                    disabled
                  />
                  {errors.institute && <span className={styles.errorText}>{errors.institute}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="trainingStartDate" className={styles.label}>Training Start Date </label>
                  <input
                    type="date"
                    id="trainingStartDate"
                    name="trainingStartDate"
                    value={formData.trainingStartDate}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.trainingStartDate ? styles.inputError : ""}`}
                    disabled
                  />
                  {errors.trainingStartDate && (
                    <span className={styles.errorText}>{errors.trainingStartDate}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="trainingEndDate" className={styles.label}>Training End Date *</label>
                  <input
                    type="date"
                    id="trainingEndDate"
                    name="trainingEndDate"
                    value={formData.trainingEndDate}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.trainingEndDate ? styles.inputError : ""}`}
                  />
                  {errors.trainingEndDate && (
                    <span className={styles.errorText}>{errors.trainingEndDate}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="role" className={styles.label}>Role</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g., Full Stack Developer"
                  />
                </div>
              </div>

              {/* Developer sections */}
              <div className={styles.formGrid}>
                {/* Languages & Frameworks */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <FiServer className={styles.labelIcon} />
                    Languages & Frameworks
                  </label>

                  <div
                    className={`${styles.multiSelect} ${
                      errors.languagesAndFrameworks ? styles.inputError : ""
                    }`}
                    onClick={() => !isLoading && setIsLangOpen((v) => !v)}
                    role="button"
                    aria-expanded={isLangOpen}
                  >
                    <div className={styles.multiControl}>
                      <div className={styles.multiValue}>
                        {formData.languagesAndFrameworks?.length
                          ? formData.languagesAndFrameworks.join(", ")
                          : "Select one or more…"}
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
                              onChange={() => toggleMulti("languagesAndFrameworks", opt)}
                              disabled={isLoading}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {errors.languagesAndFrameworks && (
                    <span className={styles.errorText}>
                      {errors.languagesAndFrameworks}
                    </span>
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
                      errors.projects ? styles.inputError : ""
                    }`}
                    onClick={() => !isLoading && setIsProjOpen((v) => !v)}
                    role="button"
                    aria-expanded={isProjOpen}
                  >
                    <div className={styles.multiControl}>
                      <div className={styles.multiValue}>
                        {formData.projects?.length
                          ? formData.projects.join(", ")
                          : "Select one or more…"}
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
                              onChange={() => toggleMulti("projects", opt)}
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
            </>
          )}

          {/* Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
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
                  <div className={styles.spinner} />
                  {internOnly ? "Submitting..." : "Saving..."}
                </>
              ) : internOnly ? (
                "Submit Request"
              ) : intern ? (
                "Update Intern"
              ) : (
                "Add Intern"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InternForm;
