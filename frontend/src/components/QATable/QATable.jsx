// src/components/QATable.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMoreVertical } from 'react-icons/fi';
import styles from './QATable.module.css';

const QATable = React.memo(({ interns, onEdit, onDelete, isLoading = false }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [openMenuId, setOpenMenuId] = useState(null);
  const tableRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tableRef.current && !tableRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId !== null) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, []);

  const handleRowClick = useCallback((intern, e) => {
    if (
      e.target.closest(`.${styles.menuButton}`) ||
      e.target.closest(`.${styles.menu}`) ||
      e.target.closest(`.${styles.menuItem}`)
    ) return;
    // navigate(`/qa/${intern.internId}`); // enable when detail page exists
  }, []);

  // --- Helpers to normalize values into arrays and split CSV strings ---
  const splitCSV = (val) =>
    val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const toToolsList = (intern) => {
    // Prefer 'tools'; fallback to 'skills'
    const v = intern?.tools ?? intern?.skills;
    if (!v) return [];
    if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
    if (typeof v === 'string') return splitCSV(v);
    return [];
  };

  const toProjectsList = (intern) => {
    const v = intern?.projects;
    if (!v) return [];
    // Accept: ['A','B'] or [{id,name}, ...]
    if (Array.isArray(v)) {
      return v
        .map((x) => (typeof x === 'string' ? { name: x.trim() } : x))
        .filter((p) => (p?.name || '').trim())
        .map((p) => ({ id: p.id, name: p.name.trim() }));
    }
    // Accept: "A, B, C"
    if (typeof v === 'string') {
      return splitCSV(v).map((name) => ({ name }));
    }
    return [];
  };

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

  return (
    <div className={styles.tableContainer} ref={tableRef}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
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
              const tools = toToolsList(intern);
              const projects = toProjectsList(intern);

              return (
                <tr
                  key={intern.internId}
                  className={styles.tr}
                  onClick={(e) => handleRowClick(intern, e)}
                  title="QA intern details"
                >
                  <td className={styles.td}>
                    <span className={styles.internCode}>{intern.internCode || '—'}</span>
                  </td>

                  <td className={styles.td}>
                    <div className={styles.nameCell}>
                      <span className={styles.name}>{intern.name || '—'}</span>
                    </div>
                  </td>

                  <td className={styles.td}>
                    <span className={styles.email}>{intern.email || '—'}</span>
                  </td>

                  <td className={styles.td}>
                    <span className={styles.mobile}>{intern.mobileNumber || '—'}</span>
                  </td>

                  <td className={styles.td}>
                    <span className={styles.endDate}>{formatDate(intern.trainingEndDate)}</span>
                  </td>

                  {/* TOOLS as list (from CSV or array) */}
                  <td className={styles.td}>
                    {tools.length ? (
                      <ul className={`${styles.list} ${styles.toolsList}`}>
                        {tools.map((t, idx) => (
                          <li key={`${t}-${idx}`} className={styles.listItemTool}>
                            {t}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>

                  {/* PROJECTS as list (from CSV string, array of strings, or array of {id,name}) */}
                  <td className={styles.td}>
                    {projects.length ? (
                      <ul className={`${styles.list} ${styles.projectsList}`}>
                        {projects.map((p, idx) => (
                          <li key={`${p.id || p.name}-${idx}`} className={styles.listItemProject}>
                            {p.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className={styles.muted}>—</span>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default QATable;
