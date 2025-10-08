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
}) => {}