import React, { useState, useEffect } from 'react';
import { DevOpsForm, DevOpsTable } from '../../components';
import styles from './DevOps.module.css';

const DevOps = () => {
  const [devOpsInterns, setDevOpsInterns] = useState([]);
  const [filteredInterns, setFilteredInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('internCode:asc');

  // Mock data for DevOps interns
  const mockDevOpsData = [
    {
      internId: 1,
      internCode: 'DEV001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      trainingEndDate: '2024-12-15',
      resourceType: 'Cloud Engineer'
    },
    {
      internId: 2,
      internCode: 'DEV002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      trainingEndDate: '2024-11-30',
      resourceType: 'DevOps Engineer'
    },
    {
      internId: 3,
      internCode: 'DEV003',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      trainingEndDate: '2025-01-20',
      resourceType: 'Site Reliability Engineer'
    },
    {
      internId: 4,
      internCode: 'DEV004',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      trainingEndDate: '2024-12-10',
      resourceType: 'Infrastructure Engineer'
    },
    {
      internId: 5,
      internCode: 'DEV005',
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      trainingEndDate: '2025-02-05',
      resourceType: 'Platform Engineer'
    },
    {
      internId: 6,
      internCode: 'DEV006',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      trainingEndDate: '2024-12-28',
      resourceType: 'Cloud Architect'
    }
  ];

  // Simulate loading data
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setDevOpsInterns(mockDevOpsData);
        setIsLoading(false);
      }, 1000);
    };
    loadData();
  }, []);

  // Filter interns based on search term
  useEffect(() => {
    let list = !searchTerm.trim() ? [...devOpsInterns] : devOpsInterns.filter(intern =>
      intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.internCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.resourceType.toLowerCase().includes(searchTerm.toLowerCase())
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
          case 'resourceType':
            aVal = a.resourceType;
            bVal = b.resourceType;
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
  }, [devOpsInterns, searchTerm, sortOption]);

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
      setDevOpsInterns(prev => prev.filter(intern => intern.internId !== internId));
    } catch (err) {
      console.error('Error deleting DevOps intern:', err);
      setError('Failed to delete DevOps intern. Please try again.');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // Mock form submission
      if (selectedIntern) {
        // Update existing intern
        setDevOpsInterns(prev => 
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
        setDevOpsInterns(prev => [...prev, newIntern]);
      }
      
      setIsFormOpen(false);
      setSelectedIntern(null);
    } catch (err) {
      console.error('Error saving DevOps intern:', err);
      setError(`Failed to ${selectedIntern ? 'update' : 'create'} DevOps intern. Please try again.`);
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
        <h1 className={styles.title}>DevOps Interns Management</h1>
        <p className={styles.subtitle}>
          Manage DevOps interns, infrastructure resources, and deployment tracking
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
            + Add New DevOps Intern
          </button>
          <div className={styles.filterSection}>
            <form onSubmit={handleSearch} className={styles.searchSection}>
              <input 
                type="text" 
                placeholder="Search by name, intern code, or resource type..." 
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
                <option value="resourceType:asc">Resource Type (Ascending)</option>
                <option value="resourceType:desc">Resource Type (Descending)</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>
              All DevOps Interns ({filteredInterns.length})
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
          
          <DevOpsTable
            interns={filteredInterns}
            onEdit={handleEditIntern}
            onDelete={handleDeleteIntern}
            isLoading={isLoading}
          />
        </div>
      </div>

      <DevOpsForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        intern={selectedIntern}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default DevOps;
