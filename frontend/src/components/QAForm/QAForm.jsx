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