import React, { useState, useEffect } from 'react';
import { QAForm, QATable } from '../../components';
import { internService, categoryService } from '../../services/api';
import styles from './QA.module.css';
import CategoryDropdown from '../../components/CategoryDropdown/CategoryDropdown';
import MasterDataModal from '../../components/MasterDataModal/MasterDataModal'; // Added this import

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
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false); // Added this state
  const QA_CATEGORY_ID = 2; // Make sure this ID is correct for your backend


  // Load initial data (This was already correct)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Step 1: Fetch all interns for the QA category
        const internsResponse = await internService.getInternsByCategoryId(QA_CATEGORY_ID);
        setQAInterns(internsResponse.data);

        // Step 2: Fetch the current lead from the backend
        const categoryResponse = await categoryService.getCategoryById(QA_CATEGORY_ID);
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
  }, [QA_CATEGORY_ID]);

  // Helper function from DevOps.jsx
  const asText = (v) => Array.isArray(v) ? v.join(', ') : (v ?? '');

  // Filter/Sort logic from DevOps.jsx
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    let list = !term ? [...qaInterns] : qaInterns.filter(intern => {
      const name = (intern.name || '').toLowerCase();
      const code = (intern.internCode || '').toLowerCase();
      // Updated to search 'tools' or 'skills'
      const tools = asText(intern.tools ?? intern.skills).toLowerCase();
      const proj = asText(intern.projects).toLowerCase();
      const mobile = (intern.mobileNumber || '').toLowerCase();
      return name.includes(term) || code.includes(term) || tools.includes(term) || proj.includes(term) || mobile.includes(term);
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
          case 'tools': // Changed from 'resourceType'
            aVal = asText(a.tools ?? a.skills);
            bVal = asText(b.tools ?? b.skills);
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
  }, [qaInterns, searchTerm, sortOption]);

  // Assign new lead (This was already correct)
  const handleAssignLead = async (internId) => {
    try {
      setError('');
      await categoryService.assignLead(QA_CATEGORY_ID, internId);
      setCurrentLeadId(internId);
      alert('New QA lead has been assigned successfully!');
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

  // REPLACED: Updated to call internService.deleteIntern
  const handleDeleteIntern = async (internId) => {
    const internName = qaInterns.find(i => i.internId === internId)?.name || 'this intern';
    if (!window.confirm(`Are you sure you want to delete ${internName}?`)) {
      return;
    }

    try {
      setError('');
      await internService.deleteIntern(internId);
      // Update state *after* successful API call
      setQAInterns(prev => prev.filter(intern => intern.internId !== internId));
    } catch (err) {
      console.error('Error deleting QA intern:', err);
      const errorMsg = err.response?.data?.message || 'Failed to delete intern.';
      setError(errorMsg);
    }
  };

  // REPLACED: Updated to call internService.create/update
  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true);
    setError('');
      
    try {
      if (payload.internId) {
        // --- EDIT MODE ---
        const response = await internService.updateIntern(payload.internId, payload);
        // Update the list with the fresh data from the server
        setQAInterns(prev =>
          prev.map(intern =>
            intern.internId === payload.internId ? response.data : intern
          )
        );
      } else {
        // --- ADD NEW MODE ---
        // **IMPORTANT**: We must add the categoryId to the payload for new interns
        const finalPayload = { ...payload, categoryId: QA_CATEGORY_ID };
        const response = await internService.createIntern(finalPayload);
        // Add the new intern (from the server) to our list
        setQAInterns(prev => [...prev, response.data]);
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
            <button 
              className={styles.errorClose}
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        )}

        {/* REPLACED: This whole section is updated to match DevOps.jsx layout */}
        <div className={styles.actionSection}>
          <div className={styles.buttonGroup}>
            <button 
              className={styles.primaryBtn}
              onClick={handleAddIntern}
            >
              + Add New Intern
            </button>
            
            {/* Added this button */}
            <button 
              className={styles.secondaryBtn}
              onClick={() => setIsManageModalOpen(true)}
            >
              Manage Tool Types
            </button>
          </div>
          <div className={styles.filterSection}>
            <CategoryDropdown current="qa" />
            <form onSubmit={handleSearch} className={styles.searchSection}>
              <input 
                type="text" 
                // Updated placeholder text
                placeholder="Search by name, code, tools, projects, or mobile..." 
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
                {/* Updated sort options to match new logic */}
                <option value="none">None</option>
                <option value="internCode:asc">Intern Code (Ascending)</option>
                <option value="internCode:desc">Intern Code (Descending)</option>
                <option value="endDate:asc">End Date (Ascending)</option>
                <option value="endDate:desc">End Date (Descending)</option>
                <option value="tools:asc">Tools (Ascending)</option>
                <option value="tools:desc">Tools (Descending)</option>
                <option value="projects:asc">Projects (Ascending)</option>
                <option value="projects:desc">Projects (Descending)</option>
              </select>
            </div>
          </div>
        </div>
        {/* End of replaced section */}

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
            onAssignLead={handleAssignLead}
            currentLeadId={currentLeadId}
          />
        </div>
      </div>

      <QAForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        // REPLACED: Changed prop 'intern' to 'editingIntern'
        editingIntern={selectedIntern} 
        isLoading={isSubmitting}
      />

      {/* Added this component */}
      <MasterDataModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        category="QA" // Set to "TOOLS" or your backend category for QA tools
        title="Manage QA Tools"
      />
    </div>
  );
};

export default QA;