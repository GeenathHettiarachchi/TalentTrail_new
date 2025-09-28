import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import ProjectTable from '../../components/ProjectTable/ProjectTable';
import styles from './Projects.module.css';

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOption, setSortOption] = useState('none');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getAllProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.projectName.toLowerCase().includes(term) ||
        (project.description && project.description.toLowerCase().includes(term)) ||
        (project.assignedTeamNames && project.assignedTeamNames.some(teamName => 
          teamName.toLowerCase().includes(term)
        )) ||
        (project.assignedTeamName && project.assignedTeamName.toLowerCase().includes(term)) ||
        (project.projectManagerName && project.projectManagerName.toLowerCase().includes(term))
      );
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Sorting
    const [sortField, sortOrder] = (sortOption || 'none').split(':');
    if (sortField !== 'none') {
      filtered.sort((a, b) => {
        let aVal, bVal;
        if (sortField === 'name') {
          aVal = a.projectName; bVal = b.projectName;
          const cmp = (aVal || '').localeCompare(bVal || '', undefined, { sensitivity: 'base' });
          return sortOrder === 'asc' ? cmp : -cmp;
        } else if (sortField === 'startDate' || sortField === 'targetDate') {
          aVal = sortField === 'startDate' ? a.startDate : a.targetDate;
          bVal = sortField === 'startDate' ? b.startDate : b.targetDate;
          const aDate = aVal ? new Date(aVal) : null;
          const bDate = bVal ? new Date(bVal) : null;
          let cmp = 0;
          if (!aDate && bDate) cmp = -1;
          else if (aDate && !bDate) cmp = 1;
          else if (aDate && bDate) cmp = aDate - bDate;
          else cmp = 0;
          return sortOrder === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
    }
    setFilteredProjects(filtered);
  };

  const handleCreate = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleFormSubmit = async (projectData) => {
    try {
      setIsSubmitting(true);
      if (editingProject) {
        // Update existing project
        const response = await projectService.updateProject(editingProject.projectId, projectData);
        setProjects(prev => prev.map(p => 
          p.projectId === editingProject.projectId ? response.data : p
        ));
      } else {
        // Create new project
        const response = await projectService.createProject(projectData);
        setProjects(prev => [...prev, response.data]);
      }
      setShowForm(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      throw error; // Let ProjectForm handle the error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await projectService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.projectId !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete project. Please try again.';
      alert(errorMessage);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const statusOptions = [
    { value: '', label: 'All Projects' },
    { value: 'PLANNED', label: 'Planned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ON_HOLD', label: 'On Hold' }
  ];

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Error Loading Projects</h2>
          <p>{error}</p>
          <button 
            className={styles.retryBtn}
            onClick={fetchProjects}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Projects Management</h1>
          <p className={styles.subtitle}>
            Track project progress, manage assignments, and monitor deliverables
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.actionSection}>
          {isAdmin && (
            <button 
              className={styles.primaryBtn}
              onClick={handleCreate}
            >
              + Create New Project
            </button>
          )}
          
          <div className={styles.filterSection}>
            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <input 
              type="text" 
              placeholder="Search projects..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <select
              className={styles.filterSelect}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              title="Sort by"
            >
              <option value="none">None</option>
              <option value="name:asc">Project Name (Ascending)</option>
              <option value="name:desc">Project Name (Descending)</option>
              <option value="startDate:asc">Start Date (Ascending)</option>
              <option value="startDate:desc">Start Date (Descending)</option>
              <option value="targetDate:asc">Target Date (Ascending)</option>
              <option value="targetDate:desc">Target Date (Descending)</option>
            </select>
          </div>
        </div>

        <ProjectTable
          projects={filteredProjects}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      {isAdmin && (
        <ProjectForm
          project={editingProject}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isOpen={showForm}
        />
      )}
    </div>
  );
};

export default Projects;
