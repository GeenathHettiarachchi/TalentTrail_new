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
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const DEVOPS_CATEGORY_ID = 3;

  // Mock data for DevOps interns
  const mockDevOpsData = [
    {
      internId: 367,
      internCode: '3142',
      name: 'John Smith',
      email: 'john.smith@example.com',
      mobileNumber: '0712356172',
      trainingEndDate: '2024-12-15',
      resourceType: 'Cloud Engineer',
      projects: ['CI/CD', 'MERN']
    },
    {
      internId: 368,
      internCode: '3143',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2024-11-30',
      resourceType: 'DevOps Engineer',
      projects: ['CI/CD', 'MERN', 'AWS']
    },
    {
      internId: 369,
      internCode: '3145',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2025-01-20',
      resourceType: 'Site Reliability Engineer',
      projects: ['CI/CD', 'MERN', 'AWS']
    },
    {
      internId: 370,
      internCode: '3146',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2024-12-10',
      resourceType: 'Infrastructure Engineer',
      projects: ['CI/CD', 'MERN', 'AWS']
    },
    {
      internId: 371,
      internCode: '3147',
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2025-02-05',
      resourceType: 'Platform Engineer',
      projects: ['CI/CD', 'MERN', 'AWS']
    },
    {
      internId: 372,
      internCode: '3148',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2024-12-28',
      resourceType: 'Cloud Architect',
      projects: ['CI/CD', 'MERN', 'AWS']
    }
  ];

  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Step 1: Set your hardcoded intern data
        setDevOpsInterns(mockDevOpsData);

        // Step 2: Fetch the current lead from the backend
        const categoryResponse = await fetch(`http://localhost:8080/api/categories/${DEVOPS_CATEGORY_ID}`);
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          if (categoryData && categoryData.leadIntern) {
            setCurrentLeadId(categoryData.leadIntern.internId);
          }
        } else {
           console.warn("Could not fetch current lead information.");
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError("Could not load lead information from the server.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const asText = (v) => Array.isArray(v) ? v.join(', ') : (v ?? '');

  // Filter interns based on search term
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    let list = !term ? [...devOpsInterns] : devOpsInterns.filter(intern => {
      const name = (intern.name || '').toLowerCase();
      const code = (intern.internCode || '').toLowerCase();
      const resType = asText(intern.resourceType).toLowerCase();
      const proj = asText(intern.projects).toLowerCase();
      const mobile = (intern.mobileNumber || '').toLowerCase();
      return name.includes(term) || code.includes(term) || resType.includes(term) || proj.includes(term) || mobile.includes(term);
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
          case 'resourceType':
            aVal = asText(a.resourceType);
            bVal = asText(b.resourceType);
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
          cmp = (aVal || '').localeCompare(bVal || '', undefined, { numeric: true, sensitivity: 'base' });
        }
        
        return sortOrder === 'asc' ? cmp : -cmp;
      });
    }
    setFilteredInterns(list);
  }, [devOpsInterns, searchTerm, sortOption]);

  // Assign new lead
  const handleAssignLead = async (internId) => {
    try {
      setError('');
      const response = await fetch(`http://localhost:8080/api/categories/${DEVOPS_CATEGORY_ID}/assign-lead/${internId}`, {
          method: 'PUT',
      });

      if (!response.ok) {
          throw new Error('Failed to assign lead. The intern ID might be invalid.');
      }
      
      // Update the UI immediately on success
      setCurrentLeadId(internId);
      alert('New DevOps lead has been assigned successfully!');

    } catch (err) {
      console.error('Error assigning lead:', err);
      setError(err.message);
    }
  };


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

  const handleFormSubmit = async (payload) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // Mock form submission
      if (payload?.internId != null) {
        setDevOpsInterns(prev =>
          prev.map(intern =>
            intern.internId === payload.internId ? { ...intern, ...payload } : intern
          )
        );
      } else {
        const newIntern = {
        ...payload,
          internId: Date.now()
        };
        setDevOpsInterns(prev => [...prev, newIntern]);
      }
      
      setIsFormOpen(false);
      setSelectedIntern(null);
    } catch (err) {
      console.error('Error saving DevOps intern:', err);
      setError(`Failed to ${payload?.internId ? 'update' : 'create'} DevOps intern. Please try again.`);
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
                placeholder="Search by name, code, resource type, projects, or mobile..." 
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
        editingIntern={selectedIntern}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default DevOps;
