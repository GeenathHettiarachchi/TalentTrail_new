import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMoreVertical, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import styles from './InternTable.module.css';

const InternTable = React.memo(({ 
  interns, 
  onEdit, 
  onDelete, 
  isLoading = false 
}) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const tableRef = useRef(null);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const toggleRowExpansion = useCallback((internId, e) => {
    e.stopPropagation();
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(internId)) {
        newSet.delete(internId);
      } else {
        newSet.add(internId);
      }
      return newSet;
    });
  }, []);

  const handleRowClick = useCallback((intern, e) => {
    // Don't trigger if dropdown arrow, menu button, or menu items were clicked
    if (
      e.target.closest(`.${styles.menuButton}`) ||
      e.target.closest(`.${styles.menu}`) ||
      e.target.closest(`.${styles.menuItem}`) ||
      e.target.closest(`.${styles.expandButton}`) ||
      e.target.closest(`.${styles.expandedContent}`)
    ) {
      return;
    }
    navigate(`/interns/${intern.internId}`);
  }, [navigate]);

  // Get intern details data
  const getInternDetails = useCallback((intern) => {
    return {
      fieldOfSpecialization: intern.fieldOfSpecialization || 'Not specified',
      skills: Array.isArray(intern.skills) ? intern.skills : 
             typeof intern.skills === 'string' ? intern.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      workingBranch: intern.workingBranch || 'Not specified',
      degree: intern.degree || 'Not specified'
    };
  }, []);

  // Mobile Card Layout with dropdown
  const renderMobileCards = () => (
    <div className={styles.mobileContainer}>
      {interns.map((intern) => {
        const isExpanded = expandedRows.has(intern.internId);
        const details = getInternDetails(intern);
        
        return (
          <div 
            key={intern.internId} 
            className={styles.mobileCard}
            onClick={() => navigate(`/interns/${intern.internId}`)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <button
                  className={styles.expandButton}
                  onClick={(e) => toggleRowExpansion(intern.internId, e)}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                </button>
                <span className={styles.mobileName}>{intern.name}</span>
              </div>
              <span className={styles.mobileCode}>{intern.internCode}</span>
            </div>
            
            <div className={styles.cardContent}>
              <div className={styles.cardRow}>
                <span>Email:</span>
                <span className={styles.email}>{intern.email}</span>
              </div>
              <div className={styles.cardRow}>
                <span>Institute:</span>
                <span className={styles.institute}>{intern.institute}</span>
              </div>
              <div className={styles.cardRow}>
                <span>Start Date:</span>
                <span className={styles.startDate}>{formatDate(intern.trainingStartDate)}</span>
              </div>
              <div className={styles.cardRow}>
                <span>End Date:</span>
                <span className={styles.endDate}>{formatDate(intern.trainingEndDate)}</span>
              </div>
              <div className={styles.cardRow}>
                <span>Specialization:</span>
                <span className={styles.specialization}>{details.fieldOfSpecialization}</span>
              </div>
            </div>

            {/* Expanded Content for Mobile */}
            {isExpanded && (
              <div className={styles.expandedContent}>
                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>Skills</h4>
                  <div className={styles.skillsContainer}>
                    {details.skills.length > 0 ? (
                      details.skills.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className={styles.noSkills}>No skills specified</span>
                    )}
                  </div>
                </div>
                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>Working Branch</h4>
                  <p className={styles.detailText}>{details.workingBranch}</p>
                </div>
                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>Degree</h4>
                  <p className={styles.detailText}>{details.degree}</p>
                </div>
              </div>
            )}
            
            {isAdmin && (
              <div className={styles.cardActions}>
                <button 
                  className={styles.cardButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(intern);
                  }}
                >
                  Edit
                </button>
                <button 
                  className={`${styles.cardButton} ${styles.deleteButton}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete ${intern.name}?`)) {
                      onDelete(intern.internId);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading interns...</p>
      </div>
    );
  }

  if (interns.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>👥</div>
        <h3 className={styles.emptyTitle}>No Interns Found</h3>
        <p className={styles.emptyText}>
          Start by adding your first intern to the system.
        </p>
      </div>
    );
  }

  // Use mobile cards on small screens
  if (isMobile) {
    return renderMobileCards();
  }

  // Desktop Table Layout
  return (
    <div className={styles.tableContainer} ref={tableRef}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Intern Code</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Institute</th>
              <th className={styles.th}>Specialization</th>
              <th className={styles.th}>Start Date</th>
              <th className={styles.th}>End Date</th>
              {isAdmin && <th className={styles.th} style={{ width: '50px' }}></th>}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {interns.map((intern) => {
              const isExpanded = expandedRows.has(intern.internId);
              const details = getInternDetails(intern);
              
              return (
                <React.Fragment key={intern.internId}>
                  <tr
                    className={styles.tr}
                    onClick={(e) => handleRowClick(intern, e)}
                    title="Click to view intern profile"
                  >
                    <td className={styles.td}>
                      <div className={styles.codeCell}>
                        <button
                          className={styles.expandButton}
                          onClick={(e) => toggleRowExpansion(intern.internId, e)}
                          aria-expanded={isExpanded}
                          title={isExpanded ? "Collapse details" : "Expand details"}
                        >
                          {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                        </button>
                        <span className={styles.internCode}>{intern.internCode}</span>
                      </div>
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
                      <span className={styles.institute}>{intern.institute}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.specialization}>{details.fieldOfSpecialization}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.startDate}>
                        {formatDate(intern.trainingStartDate)}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.endDate}>
                        {formatDate(intern.trainingEndDate)}
                      </span>
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
                  
                  {/* Expanded Row Details */}
                  {isExpanded && (
                    <tr className={styles.expandedRow}>
                      <td colSpan={isAdmin ? 8 : 7} className={styles.expandedCell}>
                        <div className={styles.expandedContent}>
                          <div className={styles.detailsGrid}>
                            <div className={styles.detailSection}>
                              <h4 className={styles.detailTitle}>Field of Specialization</h4>
                              <p className={styles.detailText}>{details.fieldOfSpecialization}</p>
                            </div>
                            <div className={styles.detailSection}>
                              <h4 className={styles.detailTitle}>Skills</h4>
                              <div className={styles.skillsContainer}>
                                {details.skills.length > 0 ? (
                                  details.skills.map((skill, index) => (
                                    <span key={index} className={styles.skillTag}>
                                      {skill}
                                    </span>
                                  ))
                                ) : (
                                  <span className={styles.noSkills}>No skills specified</span>
                                )}
                              </div>
                            </div>
                            <div className={styles.detailSection}>
                              <h4 className={styles.detailTitle}>Branch</h4>
                              <p className={styles.detailText}>{details.workingBranch}</p>
                            </div>
                            <div className={styles.detailSection}>
                              <h4 className={styles.detailTitle}>Degree</h4>
                              <p className={styles.detailText}>{details.degree}</p>
                            </div>
                          </div>
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

export default InternTable;