import React, { useState, useEffect } from 'react';
import { DeveloperForm, DeveloperTable } from '../../components';
import { internService, categoryService } from '../../services/api';
import styles from './Developer.module.css';
import CategoryDropdown from '../../components/CategoryDropdown/CategoryDropdown';

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
  const DEVELOPERS_CATEGORY_ID = 1;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Step 1: Fetch all interns for the Developer category
        const internsResponse = await internService.getInternsByCategoryId(DEVELOPERS_CATEGORY_ID);
        setDeveloperInterns(internsResponse.data);

        // Step 2: Fetch the current lead from the backend
        const categoryResponse = await categoryService.getCategoryById(DEVELOPERS_CATEGORY_ID);
        if (categoryResponse.data && categoryResponse.data.leadInternId) {
          setCurrentLeadId(categoryResponse.data.leadInternId);
        }
      } catch (err) {
        console.error('Error loading developer interns:', err);
        setError('Could not load developer data from the server.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [DEVELOPERS_CATEGORY_ID]);

  const asText = (v) => Array.isArray(v) ? v.join(', ') : (v ?? '');

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

    const [sortField, sortOrder] = (sortOption || 'none').split(':');
    if (sortField && sortOrder && sortField !== 'none') {
      list.sort((a, b) => {
        let aVal;
        let bVal;

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

  const handleAssignLead = async (internId) => {
    try {
      setError('');
      await categoryService.assignLead(DEVELOPERS_CATEGORY_ID, internId);
      setCurrentLeadId(internId);
      alert('New Developer lead has been assigned successfully!');
    } catch (err) {
      console.error('Error assigning developer lead:', err);
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
      setDeveloperInterns(prev => prev.filter(intern => intern.internId !== internId));
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
        setDeveloperInterns(prev =>
          prev.map(intern =>
            intern.internId === payload.internId ? { ...intern, ...payload } : intern
          )
        );
      } else {
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
          Manage developer interns, tech stacks, and project alignments
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
            <CategoryDropdown current="developers" />
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
            onAssignLead={handleAssignLead}
            currentLeadId={currentLeadId}
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
