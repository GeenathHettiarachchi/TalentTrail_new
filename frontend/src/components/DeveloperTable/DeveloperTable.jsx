import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMoreVertical } from 'react-icons/fi';
import styles from './DeveloperTable.module.css';

const DeveloperTable = React.memo(({ 
  interns, 
  onEdit, 
  onDelete, 
  isLoading = false 
}) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set());
  const tableRef = useRef(null);

  // Handle clicking outside of action menu
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

  // Format date
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

  // Convert comma-separated or array strings to array
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
    if (
      e.target.closest(`.${styles.menuButton}`) ||
      e.target.closest(`.${styles.menu}`) ||
      e.target.closest(`.${styles.menuItem}`) ||
      e.target.closest(`.${styles.moreBtn}`)
    ) {
      return;
    }
    // navigate(`/developers/${intern.internId}`);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Developer interns...</p>
      </div>
    );
  }

  if (interns.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>👨‍💻</div>
        <h3 className={styles.emptyTitle}>No Developer Interns Found</h3>
        <p className={styles.emptyText}>
          Start by adding your first Developer intern to the system.
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
              <th className={styles.th}>Intern Code</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Mobile Number</th>
              <th className={styles.th}>End Date</th>
              <th className={styles.th}>Languages & Frameworks</th>
              <th className={styles.th}>Projects</th>
              {isAdmin && <th className={styles.th} style={{ width: '50px' }}></th>}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {interns.map((intern) => {
              const techStack = toList(intern.languagesAndFrameworks || intern.Languages);
              const projects = toList(intern.projects);
              const isExpanded = expanded.has(intern.internId);
              const techHidden = Math.max(0, techStack.length - 2);
              const pjHidden = Math.max(0, projects.length - 2);

              return (
                <React.Fragment key={intern.internId}>
                  <tr
                    className={styles.tr}
                    onClick={(e) => handleRowClick(intern, e)}
                    title="Developer intern details"
                  >
                    <td className={styles.td}>
                      <span className={styles.internCode}>{intern.internCode}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.name}>{intern.name}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.email}>{intern.email}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.mobile}>{intern.mobileNumber || '-'}</span>
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
                      {techStack.length === 0 ? (
                        <span className={styles.resourceType}>-</span>
                      ) : (
                        <div className={styles.cellPills} aria-label="Languages & Frameworks">
                          {techStack.slice(0, 2).map((tech, idx) => (
                            <span key={idx} className={styles.projectBadge}>{tech}</span>
                          ))}
                          {techHidden > 0 && (
                            <button
                              type="button"
                              className={styles.moreBtn}
                              onClick={(e) => { e.stopPropagation(); toggleExpand(intern.internId); }}
                              aria-expanded={isExpanded}
                              title={isExpanded ? 'Show less' : `Show ${techHidden} more`}
                            >
                              {isExpanded ? 'Show less' : `+${techHidden} more`}
                            </button>
                          )}
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
                          {pjHidden > 0 && (
                            <button
                              type="button"
                              className={styles.moreBtn}
                              onClick={(e) => { e.stopPropagation(); toggleExpand(intern.internId); }}
                              aria-expanded={isExpanded}
                              title={isExpanded ? 'Show less' : `Show ${pjHidden} more`}
                            >
                              {isExpanded ? 'Show less' : `+${pjHidden} more`}
                            </button>
                          )}
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
                      <td className={styles.expandedCell} colSpan={isAdmin ? 8 : 7}>
                        <div className={styles.expandedContent}>
                          {techStack.length > 2 && (
                            <div className={styles.expandedSection}>
                              <div className={styles.sectionTitle}>All Languages & Frameworks</div>
                              <div className={styles.projectsList}>
                                {techStack.map((t, i) => (
                                  <span key={i} className={styles.projectBadge}>{t}</span>
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

export default DeveloperTable;
