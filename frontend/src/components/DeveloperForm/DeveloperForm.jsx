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
  