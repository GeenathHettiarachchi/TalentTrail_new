import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMoreVertical } from 'react-icons/fi';
import styles from './DeveloperTable.module.css';

const DeveloperTable = React.memo(({ interns, onEdit, onDelete, onMakeLead, isLoading = false }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [openMenuId, setOpenMenuId] = useState(null);
  const tableRef = useRef(null);

  //  Separate expansion states for each column type
  const [expandedLangs, setExpandedLangs] = useState(() => new Set());
  const [expandedProjects, setExpandedProjects] = useState(() => new Set());

  // Close menu on outside click
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
        day: 'numeric',
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
      return value.map((v) => String(v).trim()).filter(Boolean);
    }
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map((v) => v.trim()).filter(Boolean);
    }
    return [];
  }, []);

  //  Independent toggles
  const toggleLangExpand = (id) => {
    setExpandedLangs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleProjExpand = (id) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
              {isAdmin && <th className={styles.th}></th>}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {interns.map((intern) => {
              const langs = toList(intern.languagesAndFrameworks);
              const projects = toList(intern.projects);
              const langExpanded = expandedLangs.has(intern.internId);
              const projExpanded = expandedProjects.has(intern.internId);

              const langHidden = Math.max(0, langs.length - 2);
              const projHidden = Math.max(0, projects.length - 2);

              return (
                <tr key={intern.internId} className={styles.tr}>
                  <td className={styles.td}>{intern.internCode}</td>
                  <td className={styles.td}>{intern.name}</td>
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

                  {/* ===== Languages & Frameworks column ===== */}
                  <td className={styles.td}>
                    {langs.length === 0 ? (
                      <span>-</span>
                    ) : (
                      <div className={styles.cellPills}>
                        {(langExpanded ? langs : langs.slice(0, 2)).map((lang, i) => (
                          <span key={i} className={styles.projectBadge}>
                            {lang}
                          </span>
                        ))}
                        {langHidden > 0 && (
                          <button
                            type="button"
                            className={styles.moreBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLangExpand(intern.internId);
                            }}
                          >
                            {langExpanded ? 'Show less' : `+${langHidden} more`}
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* ===== Projects column ===== */}
                  <td className={styles.td}>
                    {projects.length === 0 ? (
                      <span>-</span>
                    ) : (
                      <div className={styles.cellPills}>
                        {(projExpanded ? projects : projects.slice(0, 2)).map((p, i) => (
                          <span key={i} className={styles.projectBadge}>
                            {p}
                          </span>
                        ))}
                        {projHidden > 0 && (
                          <button
                            type="button"
                            className={styles.moreBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProjExpand(intern.internId);
                            }}
                          >
                            {projExpanded ? 'Show less' : `+${projHidden} more`}
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* ===== Actions ===== */}
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
                          <button
                            className={styles.menuItem}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              if (
                                window.confirm(
                                  `Are you sure you want to delete ${intern.name}?`
                                )
                              ) {
                                onDelete(intern.internId);
                              }
                            }}
                          >
                            Delete
                          </button>

                          <button
                            className={styles.menuItem}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              if (
                                window.confirm(
                                  `Make ${intern.name} the lead developer? This will set them as a lead.`
                                )
                              ) {
                                if (typeof onMakeLead === 'function') {
                                  onMakeLead(intern.internId);
                                } else {
                                  // Fallback - inform developer to implement handler
                                  window.alert(
                                    'Make as Lead action is not implemented. Provide an onMakeLead prop to handle this.'
                                  );
                                }
                              }
                            }}
                          >
                            Make as Lead
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default DeveloperTable;
