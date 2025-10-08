import React, { useState, useEffect } from "react";
import styles from "./InternForm.module.css";

const InternForm = ({
  isOpen,
  onClose,
  onSubmit,
  intern = null,
  isLoading = false,
  internOnly = false, // ✅ added to control if intern edits only end date
}) => {
  const [formData, setFormData] = useState({
    trainingEndDate: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (intern) {
      setFormData({
        trainingEndDate: intern.trainingEndDate || "",
      });
    } else {
      setFormData({
        trainingEndDate: "",
      });
    }
    setErrors({});
  }, [intern, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.trainingEndDate) {
      newErrors.trainingEndDate = "Training end date is required";
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

    const submitData = { ...formData };
    if (intern && intern.internId) {
      submitData.internId = intern.internId;
    }

    onSubmit(submitData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Request End Date Update
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
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
                  errors.trainingEndDate ? styles.error : ""
                }`}
              />
              {errors.trainingEndDate && (
                <span className={styles.errorText}>
                  {errors.trainingEndDate}
                </span>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InternForm;
