// src/pages/QA/QA.jsx
import React, { useState, useEffect } from 'react';
import { QAForm, QATable } from '../../components';
import styles from './QA.module.css';

const QA = () => {
  const [qaInterns, setQAInterns] = useState([]);
  const [filteredInterns, setFilteredInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('internCode:asc');

  // ---- Mock data with Mobile + Tools[] + Projects[] ----
  const mockQAData = [
    {
      internId: 1,
      internCode: 'QA001',
      name: 'Amanda Rodriguez',
      email: 'amanda.rodriguez@example.com',
      mobileNumber: '0771234567',
      trainingEndDate: '2024-12-20',
      tools: ['Automation Testing', 'Selenium', 'API Testing'],
      projects: [{ name: 'Mobile Banking' }, { name: 'Billing Portal' }]
    },
    {
      internId: 2,
      internCode: 'QA002',
      name: 'Robert Kim',
      email: 'robert.kim@example.com',
      mobileNumber: '0715556677',
      trainingEndDate: '2024-11-25',
      tools: ['Manual Testing', 'Test Planning', 'Bug Tracking'],
      projects: [{ name: 'Vendor Onboarding' }]
    },
    {
      internId: 3,
      internCode: 'QA003',
      name: 'Jennifer Lee',
      email: 'jennifer.lee@example.com',
      mobileNumber: '0754443322',
      trainingEndDate: '2025-01-15',
      tools: ['Performance Testing', 'Load Testing', 'JMeter'],
      projects: [{ name: 'Payments Gateway' }]
    },
    {
      internId: 4,
      internCode: 'QA004',
      name: 'Mark Thompson',
      email: 'mark.thompson@example.com',
      mobileNumber: '0762228899',
      trainingEndDate: '2024-12-05',
      tools: ['Mobile Testing', 'Appium', 'Cross-platform Testing'],
      projects: [{ name: 'Field Sales App' }]
    },
    {
      internId: 5,
      internCode: 'QA005',
      name: 'Rachel Green',
      email: 'rachel.green@example.com',
      mobileNumber: '0709988776',
      trainingEndDate: '2025-02-10',
      tools: ['Security Testing', 'Penetration Testing', 'OWASP'],
      projects: [{ name: 'Identity & Access' }]
    },
    {
      internId: 6,
      internCode: 'QA006',
      name: 'Daniel Martinez',
      email: 'daniel.martinez@example.com',
      mobileNumber: '0786677554',
      trainingEndDate: '2025-01-03',
      tools: ['Database Testing', 'SQL', 'Test Data Management'],
      projects: [{ name: 'Data Warehouse' }]
    }
  ];

  // Simulate loading data
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setQAInterns(mockQAData);
        setIsLoading(false);
      }, 1000);
    };
    loadData();
  }, []);

  // Filter interns based on search term
  useEffect(() => {
    let list = !searchTerm.trim() ? [...qaInterns] : qaInterns.filter(intern =>
      intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.internCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.skills.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sorting
    const [sortField, sortOrder] = (sortOption || 'none').split(':');
    if (sortField && sortOrder && sortField !== 'none') {
      list.sort((a, b) => {
        let aVal, bVal;
        
        switch (sortField) {
          case 'internCode':
            aVal = a.internCode;
            bVal = b.internCode;
            break;
          case 'endDate':
            aVal = a.trainingEndDate;
            bVal = b.trainingEndDate;
            break;
          case 'skills':
            aVal = a.skills;
            bVal = b.skills;
            break;
          default:
            return 0;
        }

        let cmp = 0;
        if (sortField === 'endDate') {
          const aDate = aVal ? new Date(aVal) : null;
          const bDate = bVal ? new Date(bVal) : null;
          if (!aDate && bDate) cmp = -1;
          else if (aDate && !bDate) cmp = 1;
          else if (aDate && bDate) cmp = aDate - bDate;
        } else {
          cmp = (aVal || '').localeCompare(bVal || '', undefined, { numeric: true, sensitivity: 'base' });
        }
        
        return sortOrder === 'asc' ? cmp : -cmp;
      });
    }
    setFilteredInterns(list);
  }, [qaInterns, searchTerm, sortOption]);

  const handleAddIntern = () => {
    setSelectedIntern(null);
    setIsFormOpen(true);
  };

  const handleEditIntern = (intern) => {
    setSelectedIntern(intern);
    setIsFormOpen(true);
  };

  const handleDeleteIntern = async (internId) => {
    try {
      setError('');
      // Mock delete functionality
      setQAInterns(prev => prev.filter(intern => intern.internId !== internId));
    } catch (err) {
      console.error('Error deleting QA intern:', err);
      setError('Failed to delete QA intern. Please try again.');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // Mock form submission
      if (selectedIntern) {
        // Update existing intern
        setQAInterns(prev => 
          prev.map(intern => 
            intern.internId === selectedIntern.internId ? { ...intern, ...formData } : intern
          )
        );
      } else {
        // Create new intern
        const newIntern = {
          ...formData,
          internId: Date.now() // Mock ID generation
        };
        setQAInterns(prev => [...prev, newIntern]);
      }
      
      setIsFormOpen(false);
      setSelectedIntern(null);
    } catch (err) {
      console.error('Error saving QA intern:', err);
      setError(`Failed to ${selectedIntern ? 'update' : 'create'} QA intern. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedIntern(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e) => { 
    e.preventDefault(); 
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>QA Interns Management</h1>
        <p className={styles.subtitle}>
          Manage QA interns, testing skills, and quality assurance tracking
        </p>
      </div>

      <div className={styles.content}>
        {error && (
          <div className={styles.errorAlert}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorText}>{error}</span>
            <button 
              className={styles.errorClose}
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        )}

        <div className={styles.actionSection}>
          <button 
            className={styles.primaryBtn}
            onClick={handleAddIntern}
          >
            + Add New QA Intern
          </button>
          <div className={styles.filterSection}>
            <form onSubmit={handleSearch} className={styles.searchSection}>
              <input 
                type="text" 
                placeholder="Search by name, intern code, or skills..." 
                className={styles.searchInput}
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </form>
            <div className={styles.sortSection}>
              <select
                className={styles.filterSelect}
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                title="Sort by"
              >
                <option value="none">None</option>
                <option value="internCode:asc">Intern Code (Ascending)</option>
                <option value="internCode:desc">Intern Code (Descending)</option>
                <option value="endDate:asc">End Date (Ascending)</option>
                <option value="endDate:desc">End Date (Descending)</option>
                <option value="skills:asc">Skills (Ascending)</option>
                <option value="skills:desc">Skills (Descending)</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>
              All QA Interns ({filteredInterns.length})
            </h3>
            {searchTerm && (
              <p className={styles.searchInfo}>
                Showing results for "{searchTerm}"
                <button 
                  className={styles.clearSearch}
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </button>
              </p>
            )}
          </div>
          
          <QATable
            interns={filteredInterns}
            onEdit={handleEditIntern}
            onDelete={handleDeleteIntern}
            isLoading={isLoading}
          />
        </div>
      </div>

      <QAForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        intern={selectedIntern}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default QA;
