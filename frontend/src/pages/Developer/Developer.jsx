import React, { useState, useEffect } from 'react';
import { DeveloperForm, DeveloperTable } from '../../components';
import styles from './Developer.module.css';

const Developer = () => {
  const [developerInterns, setDeveloperInterns] = useState([]);
  const [filteredInterns, setFilteredInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('internCode:asc');

  // Mock data for Developer interns
  const mockDeveloperData = [
    {
      internId: 1,
      internCode: 'DEV001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      mobileNumber: '0712356172',
      trainingEndDate: '2024-12-15',
      languagesAndFrameworks: ['JavaScript', 'React', 'Node.js', 'Springboot'],
      projects: ['Portfolio Website', 'Inventory System','Task Manager']
    },
    {
      internId: 2,
      internCode: 'DEV002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2024-11-30',
      languagesAndFrameworks: ['Java', 'Spring Boot','React'],
      projects: ['E-Commerce Platform']
    },
    {
      internId: 3,
      internCode: 'DEV003',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2025-01-20',
      languagesAndFrameworks: ['Python', 'Django'],
      projects: ['Analytics Dashboard', 'ML Model API']
    },
    {
      internId: 4,
      internCode: 'DEV004',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2024-12-10',
      languagesAndFrameworks: ['C#', '.NET'],
      projects: ['Student Management System']
    },
    {
      internId: 5,
      internCode: 'DEV005',
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2025-02-05',
      languagesAndFrameworks: ['PHP', 'Laravel'],
      projects: ['Task Tracker', 'CRM System']
    },
    {
      internId: 6,
      internCode: 'DEV006',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2024-12-28',
      languagesAndFrameworks: ['Flutter', 'Firebase'],
      projects: ['Mobile E-Learning App']
    }
  ];

  // Simulate loading data
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setDeveloperInterns(mockDeveloperData);
        setIsLoading(false);
      }, 1000);
    };
    loadData();
  }, []);

  // Helper: normalize values for search/sort
  const asText = (v) => Array.isArray(v) ? v.join(', ') : (v ?? '');

  // Filter interns based on search term
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    let list = !term
      ? [...developerInterns]
      : developerInterns.filter(intern => {
          const name = (intern.name || '').toLowerCase();
          const code = (intern.internCode || '').toLowerCase();
          const langs = asText(intern.languagesAndFrameworks).toLowerCase();
          const proj = asText(intern.projects).toLowerCase();
          const mobile = (intern.mobileNumber || '').toLowerCase();
          return (
            name.includes(term) ||
            code.includes(term) ||
            langs.includes(term) ||
            proj.includes(term) ||
            mobile.includes(term)
          );
        });

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
          case 'languagesAndFrameworks':
            aVal = asText(a.languagesAndFrameworks);
            bVal = asText(b.languagesAndFrameworks);
            break;
          case 'projects':
            aVal = asText(a.projects);
            bVal = asText(b.projects);
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
          cmp = (aVal || '').localeCompare(bVal || '', undefined, {
            numeric: true,
            sensitivity: 'base'
          });
        }

        return sortOrder === 'asc' ? cmp : -cmp;
      });
    }

    setFilteredInterns(list);
  }, [developerInterns, searchTerm, sortOption]);

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
      setDeveloperInterns(prev =>
        prev.filter(intern => intern.internId !== internId)
      );
    } catch (err) {
      console.error('Error deleting Developer intern:', err);
      setError('Failed to delete Developer intern. Please try again.');
    }
  };

  const handleFormSubmit = async (payload) => {
    try {
      setIsSubmitting(true);
      setError('');

      if (payload?.internId != null) {
        // Update existing
        setDeveloperInterns(prev =>
          prev.map(intern =>
            intern.internId === payload.internId ? { ...intern, ...payload } : intern
          )
        );
      } else {
        // Add new
        const newIntern = { ...payload, internId: Date.now() };
        setDeveloperInterns(prev => [...prev, newIntern]);
      }

      setIsFormOpen(false);
      setSelectedIntern(null);
    } catch (err) {
      console.error('Error saving Developer intern:', err);
      setError(`Failed to ${payload?.internId ? 'update' : 'create'} Developer intern. Please try again.`);
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
        <h1 className={styles.title}>Developer Interns Management</h1>
        <p className={styles.subtitle}>
          Manage Developer interns, programming stacks, and project assignments
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
            + Add New Developer Intern
          </button>
          <div className={styles.filterSection}>
            <form onSubmit={handleSearch} className={styles.searchSection}>
              <input
                type="text"
                placeholder="Search by name, code, languages, projects, or mobile..."
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
                <option value="languagesAndFrameworks:asc">Languages & Frameworks (Ascending)</option>
                <option value="languagesAndFrameworks:desc">Languages & Frameworks (Descending)</option>
                <option value="projects:asc">Projects (Ascending)</option>
                <option value="projects:desc">Projects (Descending)</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>
              All Developer Interns ({filteredInterns.length})
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

          <DeveloperTable
            interns={filteredInterns}
            onEdit={handleEditIntern}
            onDelete={handleDeleteIntern}
            isLoading={isLoading}
          />
        </div>
      </div>

      <DeveloperForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        editingIntern={selectedIntern}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Developer;
