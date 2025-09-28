import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiChevronRight, FiChevronDown, FiMoreVertical } from 'react-icons/fi';
import styles from './TeamTable.module.css';

const TeamTable = ({ 
  teams, 
  teamMembers = [],
  projects = [],
  onEdit, 
  onDelete, 
  isLoading = false 
}) => {
  const navigate = useNavigate();
  const { isAdmin, isProjectManager, isTeamLeader } = useAuth();
  const [expanded, setExpanded] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
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
  
  const getTeamMembersCount = (teamId) => {
    return teamMembers.filter(member => member.teamId === teamId).length;
  };

  const getTeamMemberNames = (teamId) => {
    const members = teamMembers.filter(member => member.teamId === teamId);
    return members.map(member => member.internName).join(', ');
  };

  const getAssignedProjects = (teamId) => {
    if (!projects || projects.length === 0) return [];
    return projects.filter(p => Array.isArray(p.assignedTeamIds) && p.assignedTeamIds.includes(teamId));
  };

  const handleRowClick = (team, e) => {
    // Don't trigger if action buttons were clicked
    if (
      e.target.closest(`.${styles.expandBtn}`) ||
      e.target.closest(`.${styles.menuButton}`) ||
      e.target.closest(`.${styles.menu}`) ||
      e.target.closest(`.${styles.menuItem}`)
    ) {
      return;
    }
    // Allow navigation for admin, project manager, and team leader users
    if (isAdmin || isProjectManager || isTeamLeader) {
      navigate(`/teams/${team.teamId}`);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading teams...</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🏢</div>
        <h3 className={styles.emptyTitle}>No Teams Found</h3>
        <p className={styles.emptyText}>
          Start by creating your first team to organize your interns.
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
              <th className={styles.th} style={{width: '40px'}}></th>
              <th className={styles.th}>Team Name</th>
              <th className={styles.th}>Team Leader</th>
              <th className={styles.th}>Member Count</th>
              <th className={styles.th}>Assigned Project</th>
              {isAdmin && <th className={styles.th} style={{width: '50px'}}></th>}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {teams.map((team) => (
              <>
                <tr
                  key={team.teamId}
                  className={`${styles.tr} ${(isAdmin || isProjectManager || isTeamLeader) ? styles.clickable : ''}`}
                  onClick={(e) => handleRowClick(team, e)}
                  title={(isAdmin || isProjectManager || isTeamLeader) ? "Click to view team profile" : ""}
                >
                  <td className={`${styles.td} ${styles.expandCell}`}>
                    <button
                      className={styles.expandBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(prev => ({ ...prev, [team.teamId]: !prev[team.teamId] }));
                      }}
                      aria-label={expanded[team.teamId] ? 'Collapse' : 'Expand'}
                    >
                      {expanded[team.teamId] ? <FiChevronDown /> : <FiChevronRight />}
                    </button>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.teamNameCell}>
                      <span className={styles.teamName}>{team.teamName}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.leaderCell}>
                      <span className={styles.leaderName}>{team.teamLeaderName}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.memberCount}>
                      {getTeamMembersCount(team.teamId)}
                    </span>
                  </td>
                  <td className={styles.td}>
                    {(() => {
                      const aps = getAssignedProjects(team.teamId);
                      if (aps.length === 0) return <span className={styles.noMembers}>Not assigned</span>;
                      if (aps.length === 1) return <span className={styles.assignedProject}>{aps[0].projectName}</span>;
                      return (
                        <div className={styles.multipleProjects}>
                          <span className={styles.assignedProject}>{aps[0].projectName}</span>
                          <span className={styles.moreCount}>+{aps.length - 1} more</span>
                        </div>
                      );
                    })()}
                  </td>
                  {isAdmin && (
                    <td className={`${styles.td} ${styles.actionsCell}`}>
                      <button
                        className={styles.menuButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(prev => prev === team.teamId ? null : team.teamId);
                        }}
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === team.teamId}
                        title="Actions"
                      >
                        <FiMoreVertical />
                      </button>
                      {openMenuId === team.teamId && (
                        <div className={styles.menu} role="menu">
                          <button className={styles.menuItem} role="menuitem" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); onEdit(team); }}>Edit</button>
                          <button className={styles.menuItem} role="menuitem" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); if (window.confirm(`Are you sure you want to delete ${team.teamName}?`)) { onDelete(team.teamId); } }}>Delete</button>
                        </div>
                      )}
                    </td>
                  )}
                  
                </tr>
        {expanded[team.teamId] && (
                  <tr className={styles.expandRow}>
                    <td className={styles.td}></td>
                    <td className={styles.td} colSpan={isAdmin ? 5 : 4}>
                      <div className={styles.expandedContent}>
                        <div className={styles.membersHeader}>Team Members</div>
                        <div className={styles.membersExpandedList}>
                          {getTeamMembersCount(team.teamId) > 0 ? (
                            teamMembers
                              .filter(m => m.teamId === team.teamId)
                              .map(m => (
                                <div key={m.id || `${team.teamId}-${m.internId}`}>{m.internName}</div>
                              ))
                          ) : (
                            <div className={styles.noMembers}>No members assigned</div>
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

export default TeamTable;
