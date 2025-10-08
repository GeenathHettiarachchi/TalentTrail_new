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
  });}
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

  