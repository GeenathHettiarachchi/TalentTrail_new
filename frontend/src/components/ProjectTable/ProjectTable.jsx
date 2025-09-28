import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMoreVertical, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import styles from './ProjectTable.module.css';

const ProjectTable = ({ projects, onEdit, onDelete, loading }) => {
  const navigate = useNavigate();
  const { isAdmin, isProjectManager, isTeamLeader } = useAuth();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [expanded, setExpanded] = useState({});
  const tableRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tableRef.current && !tableRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRowClick = (project) => {
    // Allow navigation for admin, project manager, and team leader users
    if (isAdmin || isProjectManager || isTeamLeader) {
      navigate(`/projects/${project.projectId}`);
    }
  };

  const handleEditClick = (e, project) => {
    e.stopPropagation();
    setOpenMenuId(null);
    onEdit(project);
  };

  const handleDeleteClick = (e, project) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (window.confirm(`Are you sure you want to delete the project "${project.projectName}"?`)) {
      onDelete(project.projectId);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      PLANNED: styles.statusPlanned,
      IN_PROGRESS: styles.statusInProgress,
      COMPLETED: styles.statusCompleted,
      ON_HOLD: styles.statusOnHold
    };

    const statusLabels = {
      PLANNED: 'Planned',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      ON_HOLD: 'On Hold'
    };

    return (
      <span className={`${styles.statusBadge} ${statusClasses[status] || ''}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className={styles.overdue}>Overdue by {Math.abs(diffDays)} days</span>;
    } else if (diffDays === 0) {
      return <span className={styles.dueToday}>Due today</span>;
    } else if (diffDays <= 7) {
      return <span className={styles.dueSoon}>Due in {diffDays} days</span>;
    } else {
      return <span className={styles.dueLater}>{diffDays} days remaining</span>;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📋</div>
        <h3 className={styles.emptyTitle}>No Projects Found</h3>
        <p className={styles.emptyText}>
          Create your first project to get started with project management.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container} ref={tableRef}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>Project Name</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>Target Date</th>
              <th>Days Remaining</th>
              <th>Project Manager</th>
              {isAdmin && <th style={{ width: '50px' }}></th>}
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <>
                <tr 
                  key={project.projectId} 
                  className={`${styles.row} ${(isAdmin || isProjectManager || isTeamLeader) ? styles.clickable : ''}`}
                  onClick={() => handleRowClick(project)}
                  title={(isAdmin || isProjectManager || isTeamLeader) ? "Click to view project details" : ""}
                >
                  <td className={`${styles.td} ${styles.expandCell}`}>
                    <button
                      className={styles.expandBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(prev => ({ ...prev, [project.projectId]: !prev[project.projectId] }));
                      }}
                      aria-label={expanded[project.projectId] ? 'Collapse' : 'Expand'}
                    >
                      {expanded[project.projectId] ? <FiChevronDown /> : <FiChevronRight />}
                    </button>
                  </td>
                  <td>
                    <div className={styles.projectInfo}>
                      <div className={styles.projectName}>{project.projectName}</div>
                      
                    </div>
                  </td>
                  <td>{getStatusBadge(project.status)}</td>
                  <td>{formatDate(project.startDate)}</td>
                  <td>{formatDate(project.targetDate)}</td>
                  <td>{getDaysRemaining(project.targetDate)}</td>
                  <td>
                    <span className={styles.managerName}>
                      {project.projectManagerName || 'Not assigned'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.menuButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(prev => prev === project.projectId ? null : project.projectId);
                        }}
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === project.projectId}
                        title="Actions"
                      >
                        <FiMoreVertical />
                      </button>
                      {openMenuId === project.projectId && (
                        <div className={styles.menu} role="menu">
                          <button className={styles.menuItem} role="menuitem" onClick={(e) => handleEditClick(e, project)}>Edit</button>
                          <button className={styles.menuItem} role="menuitem" onClick={(e) => handleDeleteClick(e, project)}>Delete</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
                {expanded[project.projectId] && (
                  <tr className={styles.expandRow}>
                    <td className={styles.td}></td>
                    <td className={styles.td} colSpan={isAdmin ? 7 : 6}>
                      <div className={styles.expandedContent}>
                        <div className={styles.teamsHeader}>Teams Assigned -  
                          <span className={styles.teamCount}>
                            {project.assignedTeamNames?.length || project.assignedTeamName ? 
                            (project.assignedTeamNames?.length || 1) : 0}
                          </span>
                        </div>
                        <div className={styles.teamsExpandedList}>
                          {project.assignedTeamNames && project.assignedTeamNames.length > 0 ? (
                            project.assignedTeamNames.map((teamName, index) => (
                              <div key={index} className={styles.teamNameItem}>- {teamName}</div>
                            ))
                          ) : project.assignedTeamName ? (
                            <div className={styles.teamNameItem}>{project.assignedTeamName}</div>
                          ) : (
                            <div className={styles.noTeams}>No teams assigned</div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTable;
