import React, { useState, useEffect } from 'react';
import { InternForm, InternTable } from '../../components';
import { internService } from '../../services/api';
import styles from './Interns.module.css';

const Interns = () => {
  const [interns, setInterns] = useState([]);
  const [filteredInterns, setFilteredInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('internCode:asc');

  // Fetch all interns on component mount
  useEffect(() => {
    fetchInterns();
  }, []);

  // Filter interns based on search term
  useEffect(() => {
    let list = !searchTerm.trim() ? [...interns] : interns.filter(intern =>
      intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.internCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Sorting
    const [sortField, sortOrder] = (sortOption || 'none').split(':');
    if (sortField && sortOrder && sortField !== 'none') {
      list.sort((a, b) => {
        const aVal = sortField === 'internCode' ? a.internCode : (sortField === 'startDate' ? a.trainingStartDate : a.trainingEndDate);
        const bVal = sortField === 'internCode' ? b.internCode : (sortField === 'startDate' ? b.trainingStartDate : b.trainingEndDate);
        const aDate = (sortField === 'startDate' || sortField === 'endDate') ? (aVal ? new Date(aVal) : null) : null;
        const bDate = (sortField === 'startDate' || sortField === 'endDate') ? (bVal ? new Date(bVal) : null) : null;
        let cmp = 0;
        if (aDate || bDate) {
          if (!aDate && bDate) cmp = -1;
          else if (aDate && !bDate) cmp = 1;
          else if (aDate && bDate) cmp = aDate - bDate;
          else cmp = 0;
        } else {
          cmp = (aVal || '').localeCompare(bVal || '', undefined, { numeric: true, sensitivity: 'base' });
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });
    }
    setFilteredInterns(list);
  }, [interns, searchTerm, sortOption]);

  const fetchInterns = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await internService.getAllInterns();
      setInterns(response.data);
    } catch (err) {
      console.error('Error fetching interns:', err);
      setError('Failed to load interns. Please check if the backend server is running.');
    } finally {
      setIsLoading(false);
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
      await internService.deleteIntern(internId);
      setInterns(prev => prev.filter(intern => intern.internId !== internId));
    } catch (err) {
      console.error('Error deleting intern:', err);
      setError('Failed to delete intern. Please try again.');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      if (selectedIntern) {
        // Update existing intern
        const response = await internService.updateIntern(selectedIntern.internId, formData);
        setInterns(prev => 
          prev.map(intern => 
            intern.internId === selectedIntern.internId ? response.data : intern
          )
        );
      } else {
        // Create new intern
        const response = await internService.createIntern(formData);
        setInterns(prev => [...prev, response.data]);
      }
      
      setIsFormOpen(false);
      setSelectedIntern(null);
    } catch (err) {
      console.error('Error saving intern:', err);
      setError(
        err.response?.data?.message || 
        `Failed to ${selectedIntern ? 'update' : 'create'} intern. Please try again.`
      );
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

  const handleSearch = (e) => { e.preventDefault(); };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Interns Management</h1>
        <p className={styles.subtitle}>
          Manage intern profiles, training schedules, and progress tracking
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
            + Add New Intern
          </button>
          <div className={styles.filterSection}>
            <form onSubmit={handleSearch} className={styles.searchSection}>
            <input 
              type="text" 
              placeholder="Search by name or intern code..." 
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
                <option value="startDate:asc">Start Date (Ascending)</option>
                <option value="startDate:desc">Start Date (Descending)</option>
                <option value="endDate:asc">End Date (Ascending)</option>
                <option value="endDate:desc">End Date (Descending)</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>
              All Interns ({filteredInterns.length})
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
          
          <InternTable
            interns={filteredInterns}
            onEdit={handleEditIntern}
            onDelete={handleDeleteIntern}
            isLoading={isLoading}
          />
        </div>
      </div>

      <InternForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        intern={selectedIntern}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Interns;
