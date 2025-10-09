import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMoreVertical, FiChevronRight } from 'react-icons/fi';
import styles from './DevOpsTable.module.css';

const DevOpsTable = React.memo(({ 
  interns, 
  onEdit, 
  onDelete, 
  isLoading = false 
}) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [openMenuId, setOpenMenuId] = useState(null);
  const tableRef = useRef(null);
  const [expanded, setExpanded] = useState(() => new Set());

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tableRef.current && !tableRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    
    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);
  
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, []);

  // Check if date is within 30 days from today
  const isDueSoon = useCallback((dateString) => {
    if (!dateString) return false;
    const end = new Date(dateString);
    if (isNaN(end)) return false;
    const today = new Date();
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = (end - today) / (1000 * 60 * 60 * 24);
    return diffDays < 30;
  }, []);

  const toList = useCallback((value) => {
    if (Array.isArray(value)) {
      return value.map(v => String(v).trim()).filter(Boolean);
    }
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map(v => v.trim()).filter(Boolean);
    }
    return [];
  }, []);

  const toggleExpand = useCallback((id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleRowClick = useCallback((intern, e) => {
    // Don't trigger if edit or delete button was clicked
    if (
      e.target.closest(`.${styles.menuButton}`) ||
      e.target.closest(`.${styles.menu}`) ||
      e.target.closest(`.${styles.menuItem}`) ||
      e.target.closest(`.${styles.expanderBtn}`)
    ) {
      return;
    }
    const rts = toList(intern.resourceType);
    const pjs = toList(intern.projects);
    if (rts.length > 2 || pjs.length > 2) {
      toggleExpand(intern.internId);
    }
  }, [toList, toggleExpand]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading DevOps interns...</p>
      </div>
    );
  }

  if (interns.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>⚙️</div>
        <h3 className={styles.emptyTitle}>No DevOps Interns Found</h3>
        <p className={styles.emptyText}>
          Start by adding your first DevOps intern to the system.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer} ref={tableRef}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={`${styles.th} ${styles.expanderTh}`}></th>
              <th className={styles.th}>Intern Code</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Mobile Number</th>
              <th className={styles.th}>End Date</th>
              <th className={styles.th}>Resource Type</th>
              <th className={styles.th}>Projects</th>
              {isAdmin && <th className={styles.th} style={{ width: '50px' }}></th>}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {interns.map((intern) => {
              const resourceTypes = toList(intern.resourceType);
              const projects = toList(intern.projects);
              const isExpanded = expanded.has(intern.internId);
              const rtHidden = Math.max(0, resourceTypes.length - 2);
              const pjHidden = Math.max(0, projects.length - 2);
              const canExpand = rtHidden > 0 || pjHidden > 0;

              return (
                <React.Fragment key={intern.internId}>
                <tr
                  className={`${styles.tr} ${canExpand ? styles.trInteractive : ''}`}
                  onClick={(e) => handleRowClick(intern, e)}
                  aria-expanded={isExpanded}
                  role={canExpand ? 'button' : undefined}
                  title="DevOps intern details"
                >
                  <td className={`${styles.td} ${styles.expanderCell}`}>
                    {canExpand ? (
                      <button
                        type="button"
                        className={`${styles.expanderBtn} ${isExpanded ? styles.expanderBtnOpen : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleExpand(intern.internId); }}
                        aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                        aria-expanded={isExpanded}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        <FiChevronRight />
                      </button>
                    ) : (
                      <span className={styles.expanderSpacer} />
                    )}
                  </td>
                  <td className={styles.td}>
                    <span className={styles.internCode}>{intern.internCode}</span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.nameCell}>
                      <span className={styles.name}>{intern.name}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.email}>{intern.email}</span>
                  </td>
                  <td className={styles.td}>                   
                    <span className={styles.mobile}>           
                      {intern.mobileNumber}             
                    </span>  
                  </td>
                  <td className={styles.td}>
                    <span
                      className={`${styles.endDate} ${
                        isDueSoon(intern.trainingEndDate)
                          ? styles.endDateSoon
                          : styles.endDateSafe
                      }`}
                    >
                      {formatDate(intern.trainingEndDate)}
                    </span>
                  </td>
                  <td className={styles.td}>
                    {resourceTypes.length === 0 ? (
                      <span className={styles.resourceType}>-</span>
                    ) : (
                      <div className={styles.cellPills} aria-label="Resource Types">
                        {resourceTypes.slice(0, 2).map((rt, idx) => (
                          <span key={idx} className={styles.projectBadge}>{rt}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className={styles.td}>
                    {projects.length === 0 ? (
                      <span className={styles.projects}>-</span>
                    ) : (
                      <div className={styles.cellPills} aria-label="Projects">
                        {projects.slice(0, 2).map((p, idx) => (
                          <span key={idx} className={styles.projectBadge}>{p}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  {isAdmin && (
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.menuButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId((prev) => (prev === intern.internId ? null : intern.internId));
                        }}
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === intern.internId}
                        title="Actions"
                      >
                        <FiMoreVertical />
                      </button>
                      {openMenuId === intern.internId && (
                        <div className={styles.menu} role="menu">
                          <button
                            className={styles.menuItem}
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              onEdit(intern);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.menuItem}
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              if (window.confirm(`Are you sure you want to delete ${intern.name}?`)) {
                                onDelete(intern.internId);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
                {isExpanded && (
                  <tr className={styles.expandedRow}>
                    <td className={styles.expandedCell} colSpan={isAdmin ? 9 : 8}>
                      <div className={styles.expandedContent}>
                        {resourceTypes.length > 2 && (
                          <div className={styles.expandedSection}>
                            <div className={styles.sectionTitle}>All Resource Types</div>
                            <div className={styles.projectsList}>
                              {resourceTypes.map((rt, i) => (
                                <span key={i} className={styles.projectBadge}>{rt}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {projects.length > 2 && (
                          <div className={styles.expandedSection}>
                            <div className={styles.sectionTitle}>All Projects</div>
                            <div className={styles.projectsList}>
                              {projects.map((p, i) => (
                                <span key={i} className={styles.projectBadge}>{p}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );              
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default DevOpsTable;
