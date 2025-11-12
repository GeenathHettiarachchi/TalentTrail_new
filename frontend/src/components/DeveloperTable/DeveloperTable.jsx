import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMoreVertical, FiChevronRight } from 'react-icons/fi';
import styles from './DeveloperTable.module.css';

const DeveloperTable = React.memo(({ 
  interns, 
  onEdit, 
  onDelete, 
  onAssignLead, 
  currentLeadId, 
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
    if (
      e.target.closest(`.${styles.menuButton}`) ||
      e.target.closest(`.${styles.menu}`) ||
      e.target.closest(`.${styles.menuItem}`) ||
      e.target.closest(`.${styles.expanderBtn}`)
    ) {
      return;
    }
    const langs = toList(intern.languagesAndFrameworks || intern.skills);
    const projects = toList(intern.projects);
    if (langs.length > 2 || projects.length > 2) {
      toggleExpand(intern.internId);
    }
  }, [toList, toggleExpand]);

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
              <th className={`${styles.th} ${styles.expanderTh}`}></th>
              <th className={styles.th}>Intern Code</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Mobile Number</th>
              <th className={styles.th}>End Date</th>
              <th className={styles.th}>Languages & Frameworks</th>
              <th className={styles.th}>Projects</th>
              {isAdmin && <th className={styles.th}></th>}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {interns.map((intern) => {
              const langs = toList(intern.languagesAndFrameworks || intern.skills);
              const projects = toList(intern.projects);
              const isExpanded = expanded.has(intern.internId);
              const langHidden = Math.max(0, langs.length - 2);
              const projHidden = Math.max(0, projects.length - 2);
              const canExpand = langHidden > 0 || projHidden > 0;

              return (
                <React.Fragment key={intern.internId}>
                  <tr
                    className={`${styles.tr} ${canExpand ? styles.trInteractive : ''}`}
                    onClick={(e) => handleRowClick(intern, e)}
                    aria-expanded={isExpanded}
                    role={canExpand ? 'button' : undefined}
                  >
                    <td className={`${styles.td} ${styles.expanderCell}`}>
                      {canExpand ? (
                        <button
                          type="button"
                          className={`${styles.expanderBtn} ${isExpanded ? styles.expanderBtnOpen : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleExpand(intern.internId); }}
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <FiChevronRight />
                        </button>
                      ) : (
                        <span className={styles.expanderSpacer} />
                      )}
                    </td>
                    <td className={styles.td}>{intern.internCode}</td>
                    <td className={styles.td}>
                      <div className={styles.nameCell}>
                        <span className={styles.name}>{intern.name}</span>
                        {intern.internId === currentLeadId && (
                          <span className={styles.leadBadge}>⭐ Lead</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.td}>{intern.email}</td>
                    <td className={styles.td}>{intern.mobileNumber}</td>
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
                      {langs.length === 0 ? (
                        <span>-</span>
                      ) : (
                        <div className={styles.cellPills}>
                          {langs.slice(0, 2).map((lang, i) => (
                            <span key={i} className={styles.projectBadge}>{lang}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className={styles.td}>
                      {projects.length === 0 ? (
                        <span>-</span>
                      ) : (
                        <div className={styles.cellPills}>
                          {projects.slice(0, 2).map((p, i) => (
                            <span key={i} className={styles.projectBadge}>{p}</span>
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
                            setOpenMenuId((prev) =>
                              prev === intern.internId ? null : intern.internId
                            );
                          }}
                        >
                          <FiMoreVertical />
                        </button>
                        {openMenuId === intern.internId && (
                          <div className={styles.menu}>
                            <button
                              className={styles.menuItem}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(intern);
                                setOpenMenuId(null);
                              }}
                            >
                              Edit
                            </button>
                            {intern.internId !== currentLeadId && onAssignLead && (
                              <button
                                className={styles.menuItem}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAssignLead(intern.internId);
                                  setOpenMenuId(null);
                                }}
                              >
                                Assign as Lead
                              </button>
                            )}
                            <button
                              className={styles.menuItem}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to delete ${intern.name}?`)) {
                                  onDelete(intern.internId);
                                }
                                setOpenMenuId(null);
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
                          {langs.length > 2 && (
                            <div className={styles.expandedSection}>
                              <div className={styles.sectionTitle}>All Languages & Frameworks</div>
                              <div className={styles.projectsList}>
                                {langs.map((l, i) => (
                                  <span key={i} className={styles.projectBadge}>{l}</span>
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

