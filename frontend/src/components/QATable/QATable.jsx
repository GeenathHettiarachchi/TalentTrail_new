// src/components/QATable.jsx

/**
 * QATable.jsx
 *
 * Read-only table for QA interns with:
 * - Expand/collapse per-row chips for Tools and Projects (shows 1 item, expand to all)
 * - Row actions menu (Edit/Delete) visible to admins only
 * - Loading and empty states
 *
 * Props:
 *  - interns: Array of intern objects (see helpers for normalization)
 *  - onEdit(intern): callback when Edit is chosen
 *  - onDelete(internId): callback when Delete is confirmed
 *  - isLoading: whether table data is loading
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiMoreVertical, FiChevronDown } from 'react-icons/fi';
import styles from './QATable.module.css';

const QATable = React.memo(({ interns, onEdit, onDelete, isLoading = false }) => {
  // Role-gated actions (only admins see the kebab menu)
  const { isAdmin } = useAuth();

  // Which row's menu is currently open (stores internId or null)
  const [openMenuId, setOpenMenuId] = useState(null);

  // Root ref to detect outside clicks to close menus
  const tableRef = useRef(null);

  // Per-row expanded state (as Sets for O(1) lookup)
  // expandedTools: which internIds have their Tools list expanded
  // expandedProjects: which internIds have their Projects list expanded
  const [expandedTools, setExpandedTools] = useState(() => new Set());
  const [expandedProjects, setExpandedProjects] = useState(() => new Set());

  /**
   * Close action menu when clicking outside the table area.
   * Only attaches the listener when a menu is open for perf.
   */
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
   * Falls back to the original string on parsing errors.
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
   * Row click handler—currently a placeholder for a future details page.
   * Ignores clicks originating on buttons/menus/chevrons to avoid conflicts.
   */
  const handleRowClick = useCallback((intern, e) => {
    if (
      e.target.closest(`.${styles.menuButton}`) ||
      e.target.closest(`.${styles.menu}`) ||
      e.target.closest(`.${styles.menuItem}`) ||
      e.target.closest(`.${styles.chevronBtn}`)
    ) return;

    // Navigate to a details page in the future, e.g.:
    // navigate(`/qa/${intern.internId}`)
  }, []);

  // ---------- Normalization helpers for Tools/Projects ----------

  // Split a CSV string -> trimmed, non-empty array
  const splitCSV = (val) => val.split(',').map((s) => s.trim()).filter(Boolean);

  /**
   * Tools field can arrive as:
   *  - array of strings (preferred)
   *  - CSV string
   *  - optional legacy alias "skills"
   * Returns a clean string[].
   */
  const toToolsList = (intern) => {
    const v = intern?.tools ?? intern?.skills;
    if (!v) return [];
    if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
    if (typeof v === 'string') return splitCSV(v);
    return [];
  };

  /**
   * Projects field can arrive as:
   *  - array of strings (project names)
   *  - array of objects { id?, name }
   *  - CSV string
   * Returns a normalized array of { id?, name }.
   */
  const toProjectsList = (intern) => {
    const v = intern?.projects;
    if (!v) return [];
    if (Array.isArray(v)) {
      return v
        .map((x) => (typeof x === 'string' ? { name: x.trim() } : x))
        .filter((p) => (p?.name || '').trim())
        .map((p) => ({ id: p.id, name: p.name.trim() }));
    }
    if (typeof v === 'string') return splitCSV(v).map((name) => ({ name }));
    return [];
  };

  // ---------- Expand/collapse helpers using Sets ----------

  const isExpanded = (set, id) => set.has(id);

  /**
   * Generic toggle helper for a Set-based state.
   * Example: toggleInSet(setExpandedTools, internId)
   */
  const toggleInSet = (setUpdater, id) => {
    setUpdater((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /**
   * Small reusable “show 1 item, expand to all” list with a chevron button.
   * - Keeps chevron right-aligned across rows using a fixed slot
   * - Accessible labels for expand/collapse
   */
  const ArrowExpandableList = ({ items, expanded, onToggle, itemClass, ariaLabelBase }) => {
    if (!items?.length) return <span className={styles.muted}>—</span>;

    const showAll = expanded;
    const visible = showAll ? items : items.slice(0, 1);

    return (
      <div className={styles.inlineListWrap} style={{ width: '100%' /* fallback if CSS not loaded */ }}>
        <ul
          className={`${showAll ? styles.listWrap : styles.listOneLine} ${styles.listBase} ${styles.listGrow}`}
          style={{ flex: '1 1 auto', minWidth: 0 }} // fallback to ensure chevron aligns right
        >
          {visible.map((x, idx) => {
            const key = typeof x === 'string' ? x : (x.id || x.name || idx);
            const label = typeof x === 'string' ? x : x.name;
            return (
              <li key={`${key}-${idx}`} className={`${styles.listItem} ${itemClass}`}>
                {label}
              </li>
            );
          })}
        </ul>

        {items.length > 1 && (
          <button
            type="button"
            className={`${styles.chevronBtn} ${showAll ? styles.chevronRotated : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            aria-expanded={showAll}
            aria-label={
              showAll
                ? `Collapse ${ariaLabelBase}`
                : `Expand ${ariaLabelBase} to show all (${items.length})`
            }
            title={showAll ? 'Collapse' : 'Expand'}
            style={{ flex: '0 0 22px' }} // fixed slot so chevrons align in a column
          >
            <FiChevronDown />
          </button>
        )}
      </div>
    );
  };

  // ---------- Loading / Empty states ----------

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

  // ---------- Main table ----------

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
              // Normalize per-row data
              const tools = toToolsList(intern);
              const projects = toProjectsList(intern);

              // Read whether each column is expanded for this row
              const toolsExpanded = isExpanded(expandedTools, intern.internId);
              const projectsExpanded = isExpanded(expandedProjects, intern.internId);

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

                  {/* TOOLS (1 item by default; expand to show all) */}
                  <td className={styles.td}>
                    <ArrowExpandableList
                      items={tools}
                      expanded={toolsExpanded}
                      onToggle={() => toggleInSet(setExpandedTools, intern.internId)}
                      itemClass={styles.listItemTool}
                      ariaLabelBase="Tools"
                    />
                  </td>

                  {/* PROJECTS (1 item by default; expand to show all) */}
                  <td className={styles.td}>
                    <ArrowExpandableList
                      items={projects}
                      expanded={projectsExpanded}
                      onToggle={() => toggleInSet(setExpandedProjects, intern.internId)}
                      itemClass={styles.listItemProject}
                      ariaLabelBase="Projects"
                    />
                  </td>

                  {/* Row actions (visible to admins only) */}
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
