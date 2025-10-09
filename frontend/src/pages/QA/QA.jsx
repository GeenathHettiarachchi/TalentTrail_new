// src/pages/QA/QA.jsx
import React, { useState, useEffect } from 'react';
import { QAForm, QATable } from '../../components';
import styles from './QA.module.css';
import CategoryDropdown from '../../components/CategoryDropdown/CategoryDropdown';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter + Sort
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();

    let list = !term
      ? [...qaInterns]
      : qaInterns.filter((intern) => {
          const toolsText = Array.isArray(intern.tools)
            ? intern.tools.join(' ').toLowerCase()
            : String(intern.tools || intern.skills || '').toLowerCase();

          const projectsText = Array.isArray(intern.projects)
            ? intern.projects.map((p) => (p?.name || p || '')).join(' ').toLowerCase()
            : String(intern.projects || '').toLowerCase();

          return (
            (intern.name || '').toLowerCase().includes(term) ||
            (intern.internCode || '').toLowerCase().includes(term) ||
            (intern.email || '').toLowerCase().includes(term) ||
            (intern.mobileNumber || '').toLowerCase().includes(term) ||
            toolsText.includes(term) ||
            projectsText.includes(term)
          );
        });

    // Sorting
    const [sortField, sortOrder] = (sortOption || 'none').split(':');
    if (sortField && sortOrder && sortField !== 'none') {
      const toText = (v) => (v ?? '').toString();
      const join = (arr) => (arr && arr.length ? arr.join(', ') : '');
      const joinNames = (arr) =>
        arr && arr.length ? arr.map((x) => (x?.name || x || '')).join(', ') : '';

      list.sort((a, b) => {
        let aVal, bVal;

        switch (sortField) {
          case 'internCode': aVal = a.internCode; bVal = b.internCode; break;
          case 'name':       aVal = a.name;       bVal = b.name;       break;
          case 'email':      aVal = a.email;      bVal = b.email;      break;
          case 'mobile':     aVal = a.mobileNumber; bVal = b.mobileNumber; break;
          case 'endDate':    aVal = a.trainingEndDate; bVal = b.trainingEndDate; break;
          case 'tools':      aVal = Array.isArray(a.tools) ? join(a.tools) : toText(a.tools || a.skills); 
                            bVal = Array.isArray(b.tools) ? join(b.tools) : toText(b.tools || b.skills); 
                            break;
          case 'projects':   aVal = joinNames(a.projects); bVal = joinNames(b.projects); break;
          default: return 0;
        }

        let cmp = 0;
        if (sortField === 'endDate') {
          const aDate = aVal ? new Date(aVal) : null;
          const bDate = bVal ? new Date(bVal) : null;
          if (!aDate && bDate) cmp = -1;
          else if (aDate && !bDate) cmp = 1;
          else if (aDate && bDate) cmp = aDate - bDate;
        } else {
          cmp = toText(aVal).localeCompare(toText(bVal), undefined, {
            numeric: true,
            sensitivity: 'base'
          });
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
      setQAInterns((prev) => prev.filter((intern) => intern.internId !== internId));
    } catch (err) {
      console.error('Error deleting QA intern:', err);
      setError('Failed to delete QA intern. Please try again.');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError('');
      // Expecting: internCode, name, email, mobileNumber, trainingEndDate, tools[], projects[]
      if (selectedIntern) {
        setQAInterns((prev) =>
          prev.map((intern) =>
            intern.internId === selectedIntern.internId ? { ...intern, ...formData } : intern
          )
        );
      } else {
        const newIntern = { ...formData, internId: Date.now() };
        setQAInterns((prev) => [...prev, newIntern]);
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

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearch = (e) => e.preventDefault();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>QA Interns Management</h1>
        <p className={styles.subtitle}>
          Manage QA interns, tools, and project assignments
        </p>
      </div>

      <div className={styles.content}>
        {error && (
          <div className={styles.errorAlert}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorText}>{error}</span>
            <button className={styles.errorClose} onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className={styles.actionSection}>
          <CategoryDropdown current="qa" />
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
                placeholder="Search by name, trainee ID, email, mobile, tools, or projects..."
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
                <option value="internCode:asc">Trainee ID (Ascending)</option>
                <option value="internCode:desc">Trainee ID (Descending)</option>
                <option value="name:asc">Name (Ascending)</option>
                <option value="name:desc">Name (Descending)</option>
                <option value="email:asc">Email (Ascending)</option>
                <option value="email:desc">Email (Descending)</option>
                <option value="mobile:asc">Mobile (Ascending)</option>
                <option value="mobile:desc">Mobile (Descending)</option>
                <option value="endDate:asc">End Date (Ascending)</option>
                <option value="endDate:desc">End Date (Descending)</option>
                <option value="tools:asc">Tools (A→Z)</option>
                <option value="tools:desc">Tools (Z→A)</option>
                <option value="projects:asc">Projects (A→Z)</option>
                <option value="projects:desc">Projects (Z→A)</option>
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
                <button className={styles.clearSearch} onClick={() => setSearchTerm('')}>
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
