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
  