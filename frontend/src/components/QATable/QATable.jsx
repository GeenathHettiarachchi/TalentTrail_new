import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiMoreVertical, FiChevronRight } from 'react-icons/fi'; // Changed FiChevronDown to FiChevronRight
import styles from './QATable.module.css';

const QATable = React.memo(({ 
  interns, 
  onEdit, 
  onDelete, 
  onAssignLead,
  currentLeadId,
  isLoading = false 
}) => {
  const { isAdmin } = useAuth();
  const [openMenuId, setOpenMenuId] = useState(null);
  const tableRef = useRef(null);
  
  // NEW: Single expanded state Set, like in DevOpsTable
  const [expanded, setExpanded] = useState(() => new Set());

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tableRef.current && !tableRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId !== null) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  /**
   * Format ISO date strings to "MMM DD, YYYY".
   */
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }, []);

  /**
   * Check if end date is within 1 month (30 days) from today
   * Returns true if within 1 month, false otherwise
   */
  const isWithinOneMonth = (endDate) => {
    if (!endDate) return false;
    
    const today = new Date();
    const end = new Date(endDate);
    
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const timeDiff = end.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff <= 30 && daysDiff >= 0;
  };

  /**
   * NEW: Simplified data normalization function (like DevOpsTable's toList)
   * Handles string (CSV), array of strings, or array of {name: '...'} objects.
   */
  const toList = useCallback((value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map(v => {
        if (typeof v === 'string') {
          // Case 1: Simple string (from form submission)
          return v.trim();
        }
        // Case 2: Complex object (from API response)
        // Explicitly check for 'projectName' (from ProjectDTO) or 'name' (from other lists)
        return (v?.projectName?.trim() || v?.name?.trim() || '').filter(Boolean); 
      }).filter(Boolean);
    }
    // Handle CSV string for non-array fields
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map(v => v.trim()).filter(Boolean);
    }
    return [];
  }, []);

  /**
   * NEW: Toggle function for the main 'expanded' Set.
   */
  const toggleExpand = useCallback((id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  /**
   * NEW: Row click handler now also toggles expansion (like DevOpsTable)
   */
  const handleRowClick = useCallback((intern, e) => {
    // Ignore clicks on buttons/menus
    if (
      e.target.closest(`.${styles.menuButton}`) ||
      e.target.closest(`.${styles.menu}`) ||
      e.target.closest(`.${styles.menuItem}`) ||
      e.target.closest(`.${styles.expanderBtn}`) // Ignore expander button click
    ) return;
    
    // Logic to check if row *should* be expandable, then toggle
    const tools = toList(intern?.tools ?? intern?.skills);
    const projects = toList(intern.projects);
    if (tools.length > 2 || projects.length > 2) {
      toggleExpand(intern.internId);
    }
  }, [toList, toggleExpand]);


  // ---------- Loading / Empty states (Unchanged) ----------

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading QA interns...</p>
      </div>
    );
  }

  if (!interns?.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3 className={styles.emptyTitle}>No QA Interns Found</h3>
        <p className={styles.emptyText}>Start by adding your first QA intern to the system.</p>
      </div>
    );
  }

  // ---------- Main table (Refactored) ----------

  return (
    <div className={styles.tableContainer} ref={tableRef}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {/* NEW: Expander column */}
              <th className={`${styles.th} ${styles.expanderTh}`}></th>
              <th className={styles.th}>Trainee ID</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Mobile</th>
              <th className={styles.th}>End Date</th>
              <th className={styles.th}>Tools</th>
              <th className={styles.th}>Projects</th>
              {isAdmin && <th className={styles.th} style={{ width: '50px' }}></th>}
            </tr>
          </thead>

          <tbody className={styles.tbody}>
            {interns.map((intern) => {
              // Normalize data
              const tools = toList(intern?.tools ?? intern?.skills); // Handle 'tools' or legacy 'skills'
              const projects = toList(intern.projects);
              
              // Expansion logic
              const isExpanded = expanded.has(intern.internId);
              const toolsHidden = Math.max(0, tools.length - 2);
              const projHidden = Math.max(0, projects.length - 2);
              const canExpand = toolsHidden > 0 || projHidden > 0;

              return (
                <React.Fragment key={intern.internId}>
                  <tr
                    className={`${styles.tr} ${canExpand ? styles.trInteractive : ''}`}
                    onClick={(e) => handleRowClick(intern, e)}
                    aria-expanded={isExpanded}
                    role={canExpand ? 'button' : undefined}
                    title="QA intern details"
                  >
                    {/* NEW: Expander Cell */}
                    <td className={`${styles.td} ${styles.expanderCell}`}>
                      {canExpand ? (
                        <button
                          type="button"
                          className={`${styles.expanderBtn} ${isExpanded ? styles.expanderBtnOpen : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleExpand(intern.internId); }}
                          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <FiChevronRight />
                        </button>
                      ) : (
                        <span className={styles.expanderSpacer} />
                      )}
                    </td>

                    <td className={styles.td}>
                      <span className={styles.internCode}>{intern.internCode || '—'}</span>
                    </td>

                    <td className={styles.td}>
                      <div className={styles.nameCell}>
                        <span className={styles.name}>{intern.name || '—'}</span>
                        {/* NEW: Lead Badge (from DevOpsTable) */}
                        {intern.internId === currentLeadId && (
                           <span className={styles.leadBadge}>⭐ Lead</span>
                        )}
                      </div>
                    </td>

                    <td className={styles.td}>
                      <span className={styles.email}>{intern.email || '—'}</span>
                    </td>

                    <td className={styles.td}>
                      <span className={styles.mobile}>{intern.mobileNumber || '—'}</span>
                    </td>

                    {/* END DATE (Unchanged logic, just CSS) */}
                    <td className={styles.td}>
                      <span 
                        className={`${styles.endDate} ${
                          isWithinOneMonth(intern.trainingEndDate) 
                            ? styles.endDateWarning 
                            : styles.endDateNormal
                        }`}
                      >
                        {formatDate(intern.trainingEndDate)}
                      </span>
                    </td>

                    {/* REFACTORED: Tools Cell (now shows pills) */}
                    <td className={styles.td}>
                      {tools.length === 0 ? (
                        <span className={styles.muted}>—</span>
                      ) : (
                        <div className={styles.cellPills} aria-label="Tools">
                          {tools.slice(0, 2).map((tool, idx) => (
                            <span key={idx} className={styles.listItemTool}>{tool}</span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* REFACTORED: Projects Cell (now shows pills) */}
                    <td className={styles.td}>
                      {projects.length === 0 ? (
                        <span className={styles.muted}>—</span>
                      ) : (
                        <div className={styles.cellPills} aria-label="Projects">
                          {projects.slice(0, 2).map((proj, idx) => (
                            <span key={idx} className={styles.listItemProject}>{proj}</span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Row actions (Unchanged logic) */}
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
                            {/* Assign as Lead button logic */}
                            {intern.internId !== currentLeadId && (
                              <button
                                className={styles.menuItem}
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  onAssignLead(intern.internId);
                                }}
                              >
                                Assign as Lead
                              </button>
                            )}
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
                  
                  {/* NEW: Expanded Row */}
                  {isExpanded && (
                    <tr className={styles.expandedRow}>
                      <td className={styles.expandedCell} colSpan={isAdmin ? 9 : 8}>
                        <div className={styles.expandedContent}>
                          {toolsHidden > 0 && (
                            <div className={styles.expandedSection}>
                              <div className={styles.sectionTitle}>All Tools</div>
                              <div className={styles.projectsList}>
                                {tools.map((tool, i) => (
                                  <span key={i} className={styles.listItemTool}>{tool}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {projHidden > 0 && (
                            <div className={styles.expandedSection}>
                              <div className={styles.sectionTitle}>All Projects</div>
                              <div className={styles.projectsList}>
                                {projects.map((proj, i) => (
                                  <span key={i} className={styles.listItemProject}>{proj}</span>
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

export default QATable;