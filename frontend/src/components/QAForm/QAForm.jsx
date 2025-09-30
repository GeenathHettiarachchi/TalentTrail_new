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
  