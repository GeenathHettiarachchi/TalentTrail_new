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

  // Mock data for DevOps interns
  const mockDeveloperData = [
    {
      internId: 1,
      internCode: 'DVP001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      trainingEndDate: '2024-12-15',
      Languages: 'Flutter'
    },
    {
      internId: 2,
      internCode: 'DVP002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      trainingEndDate: '2024-11-30',
      Languages: 'Java'
    },
    {
      internId: 3,
      internCode: 'DVP003',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      trainingEndDate: '2025-01-20',
      Languages: 'Php'
    },
    {
      internId: 4,
      internCode: 'DVP004',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      trainingEndDate: '2024-12-10',
      Languages: 'C#'
    },
    {
      internId: 5,
      internCode: 'DVP005',
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      trainingEndDate: '2025-02-05',
      Languages: 'Java'
    },
    {
      internId: 6,
      internCode: 'DVP006',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      trainingEndDate: '2024-12-28',
      Languages: 'Mern'
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

  // Filter interns based on search term
  useEffect(() => {
    let list = !searchTerm.trim() ? [...developerInterns] : developerInterns.filter(intern =>
      intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.internCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.Languages.toLowerCase().includes(searchTerm.toLowerCase())
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
          case 'Languages':
            aVal = a.Languages;
            bVal = b.Languages;
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
      // Mock delete functionality
      setDeveloperInterns(prev => prev.filter(intern => intern.internId !== internId));
    } catch (err) {
      console.error('Error deleting Developer intern:', err);
      setError('Failed to delete Developer intern. Please try again.');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // Mock form submission
      if (selectedIntern) {
        // Update existing intern
        setDeveloperInterns(prev => 
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
        setDeveloperInterns(prev => [...prev, newIntern]);
      }
      
      setIsFormOpen(false);
      setSelectedIntern(null);
    } catch (err) {
      console.error('Error saving Developer intern:', err);
      setError(`Failed to ${selectedIntern ? 'update' : 'create'} Developer intern. Please try again.`);
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
          Manage Developer interns, technical skills, and software projects
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
                placeholder="Search by name, intern code, or Languages..." 
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
                <option value="Languages:asc">Languages (Ascending)</option>
                <option value="Languages:desc">Languages (Descending)</option>
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
        intern={selectedIntern}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Developer;