import React, { useState, useEffect } from 'react';
import { AIForm, AITable } from '../../components'; 
import { internService, categoryService } from '../../services/api';
import styles from './AI.module.css'; // Assuming you create an AI.module.css (it can be a copy of DevOps.module.css)
import CategoryDropdown from '../../components/CategoryDropdown/CategoryDropdown';
// MasterDataModal is no longer needed

const AI = () => {
  const [aiInterns, setAiInterns] = useState([]); // Renamed state
  const [filteredInterns, setFilteredInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('internCode:asc');
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const AI_CATEGORY_ID = 4;


  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Step 1: Fetch all interns for the AI category
        const internsResponse = await internService.getInternsByCategoryId(AI_CATEGORY_ID);
        setAiInterns(internsResponse.data);

        // Step 2: Fetch the current lead from the backend
        const categoryResponse = await categoryService.getCategoryById(AI_CATEGORY_ID);
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
  }, [AI_CATEGORY_ID]); // Dependency updated

  const asText = (v) => Array.isArray(v) ? v.join(', ') : (v ?? '');

  // Filter interns based on search term
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    let list = !term ? [...aiInterns] : aiInterns.filter(intern => { // Use aiInterns state
      const name = (intern.name || '').toLowerCase();
      const code = (intern.internCode || '').toLowerCase();
      // 'resType' (skills) logic is removed
      const proj = asText(intern.projects).toLowerCase();
      const mobile = (intern.mobileNumber || '').toLowerCase();
      // Updated return
      return name.includes(term) || code.includes(term) || proj.includes(term) || mobile.includes(term);
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
          // 'resourceType' case is removed
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
  }, [aiInterns, searchTerm, sortOption]); // Dependency updated

  // Assign new lead
  const handleAssignLead = async (internId) => {
    try {
      setError('');
      await categoryService.assignLead(AI_CATEGORY_ID, internId); // Use AI_CATEGORY_ID

      setCurrentLeadId(internId);
      alert('New AI lead has been assigned successfully!'); // Updated text

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
    const internName = aiInterns.find(i => i.internId === internId)?.name || 'this intern'; // Use aiInterns
    if (!window.confirm(`Are you sure you want to delete ${internName}?`)) {
      return;
    }

    try {
      setError('');
      await internService.deleteIntern(internId);
      // Update state *after* successful API call
      setAiInterns(prev => prev.filter(intern => intern.internId !== internId)); // Use setAiInterns
    } catch (err) {
      console.error('Error deleting AI intern:', err); // Updated text
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
        setAiInterns(prev => // Use setAiInterns
          prev.map(intern =>
            intern.internId === payload.internId ? response.data : intern
          )
        );
      } else {
        // --- ADD NEW MODE ---
        const response = await internService.createIntern(payload);
        // Add the new intern (from the server) to our list
        setAiInterns(prev => [...prev, response.data]); // Use setAiInterns
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
        <h1 className={styles.title}>AI Interns Management</h1> {/* Updated title */}
        <p className={styles.subtitle}>
          Manage AI interns, model development, and project tracking {/* Updated subtitle */}
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

            {/* "Manage Resource Types" button is removed */}
          </div>
          <div className={styles.filterSection}>
            <CategoryDropdown current="ai" /> {/* Updated current prop */}
            <form onSubmit={handleSearch} className={styles.searchSection}>
              <input 
                type="text" 
                placeholder="Search by name, code, projects, or mobile..." // Updated placeholder
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
                {/* "resourceType" sort options are removed */}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>
              All AI Interns ({filteredInterns.length}) {/* Updated title */}
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
          
          {/* Use AITable component */}
          <AITable
            interns={filteredInterns}
            onEdit={handleEditIntern}
            onDelete={handleDeleteIntern}
            isLoading={isLoading}
            onAssignLead={handleAssignLead}
            currentLeadId={currentLeadId}
          />
        </div>
      </div>

      {/* Use AIForm component */}
      <AIForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        editingIntern={selectedIntern}
        isLoading={isSubmitting}
      />

      {/* MasterDataModal component is removed */}
    </div>
  );
};

export default AI;