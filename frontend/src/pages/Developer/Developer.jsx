import React, { useState, useEffect } from 'react';
import { DeveloperForm, DeveloperTable } from '../../components';
import { internService, categoryService } from '../../services/api';
import styles from './Developer.module.css';
import CategoryDropdown from '../../components/CategoryDropdown/CategoryDropdown';
import MasterDataModal from '../../components/MasterDataModal/MasterDataModal';

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
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const DEVELOPER_CATEGORY_ID = 1;


  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Step 1: Fetch all interns for the Developer category
        const internsResponse = await internService.getInternsByCategoryId(DEVELOPER_CATEGORY_ID);
        setDeveloperInterns(internsResponse.data);

        // Step 2: Fetch the current lead from the backend
        const categoryResponse = await categoryService.getCategoryById(DEVELOPER_CATEGORY_ID);
        if (categoryResponse.data && categoryResponse.data.leadInternId) {
          setCurrentLeadId(categoryResponse.data.leadInternId);
        }

      } catch (err) {
        console.error("Error loading initial data:", err);
        setError("Could not load lead information from the server.");

      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [DEVELOPER_CATEGORY_ID]);

  const asText = (v) => Array.isArray(v) ? v.join(', ') : (v ?? '');

  // Filter interns based on search term
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    let list = !term ? [...developerInterns] : developerInterns.filter(intern => {
      const name = (intern.name || '').toLowerCase();
      const code = (intern.internCode || '').toLowerCase();
      const langType = asText(intern.skills).toLowerCase();
      const proj = asText(intern.projects).toLowerCase();
      const mobile = (intern.mobileNumber || '').toLowerCase();
      return name.includes(term) || code.includes(term) || langType.includes(term) || proj.includes(term) || mobile.includes(term);
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
          case 'languageType':
            aVal = asText(a.skills);
            bVal = asText(b.skills);
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
  }, [developerInterns, searchTerm, sortOption]);

  // Assign new lead
  const handleAssignLead = async (internId) => {
    try {
      setError('');
      await categoryService.assignLead(DEVELOPER_CATEGORY_ID, internId);

      setCurrentLeadId(internId);
      alert('New Developer lead has been assigned successfully!');

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
    const internName = developerInterns.find(i => i.internId === internId)?.name || 'this intern';
    if (!window.confirm(`Are you sure you want to delete ${internName}?`)) {
      return;
    }

    try {
      setError('');
      await internService.deleteIntern(internId);
      // Update state *after* successful API call
      setDeveloperInterns(prev => prev.filter(intern => intern.internId !== internId));
    } catch (err) {
      console.error('Error deleting Developer intern:', err);
      const errorMsg = err.response?.data?.message || 'Failed to delete intern.';
      setError(errorMsg);
    }
  };

  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true);
    setError('');
      
    try {
      if (payload.internId) {
        // --- EDIT MODE ---
        const response = await internService.updateIntern(payload.internId, payload);
        // Update the list with the fresh data from the server
        setDeveloperInterns(prev =>
          prev.map(intern =>
            intern.internId === payload.internId ? response.data : intern
          )
        );
      } else {
        // --- ADD NEW MODE ---
        const response = await internService.createIntern(payload);
        // Add the new intern (from the server) to our list
        setDeveloperInterns(prev => [...prev, response.data]);
      }

      setIsFormOpen(false);
      setSelectedIntern(null);

    } catch (err) {
      console.error('Error saving intern:', err);
      const errorMsg = err.response?.data?.message || `Failed to save intern.`;
      setError(errorMsg);
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
          Manage Developer interns, skills, and project assignments
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
          <div className={styles.buttonGroup}>
            <button 
              className={styles.primaryBtn}
              onClick={handleAddIntern}
            >
              + Add New Intern
            </button>

            <button 
              className={styles.secondaryBtn}
              onClick={() => setIsManageModalOpen(true)}
            >
              Manage Languages and Frameworks
            </button>
          </div>
          <div className={styles.filterSection}>
            <CategoryDropdown current="developers" />
            <form onSubmit={handleSearch} className={styles.searchSection}>
              <input 
                type="text" 
                placeholder="Search by name, code, language type, projects, or mobile..." 
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
                <option value="languageType:asc">Language Type (Ascending)</option>
                <option value="languageType:desc">Language Type (Descending)</option>
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
            onAssignLead={handleAssignLead}
            currentLeadId={currentLeadId}
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

      <MasterDataModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        category="Web Developer"
        title="Manage Languages and Frameworks"
      />
    </div>
  );
};

export default Developer;