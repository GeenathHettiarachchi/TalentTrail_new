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

  const handleRowClick = useCallback((intern, e) => {
    // Don't trigger if edit or delete button was clicked
    if (
      e.target.closest(`.${styles.menuButton}`) ||
      e.target.closest(`.${styles.menu}`) ||
      e.target.closest(`.${styles.menuItem}`) ||
      e.target.closest(`.${styles.expanderBtn}`)
      e.target.closest(`.${styles.menuItem}`)
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
              <th className={styles.th}>End Date</th>
              <th className={styles.th}>Resource Type</th>
              {isAdmin && <th className={styles.th} style={{ width: '50px' }}></th>}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {interns.map((intern) => (
              <tr
                key={intern.internId}
                className={styles.tr}
                onClick={(e) => handleRowClick(intern, e)}
                title="DevOps intern details"
              >
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
                  <span className={styles.endDate}>
                    {formatDate(intern.trainingEndDate)}
                  </span>
                </td>
                <td className={styles.td}>
                  <span className={styles.resourceType}>{intern.resourceType}</span>
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
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default DevOpsTable;
