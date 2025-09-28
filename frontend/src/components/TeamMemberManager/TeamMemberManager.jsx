import React, { useState, useEffect } from 'react';
import { internService, teamMemberService } from '../../services/api';
import styles from './TeamMemberManager.module.css';

const TeamMemberManager = ({ 
  isOpen, 
  onClose, 
  team = null,
  teamMembers = [],
  onMembersUpdated
}) => {
  const [availableInterns, setAvailableInterns] = useState([]);
  const [currentMembers, setCurrentMembers] = useState([]);
  const [selectedInternId, setSelectedInternId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && team) {
      fetchData();
    }
  }, [isOpen, team]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch all interns
      const internsResponse = await internService.getAllInterns();
      const allInterns = internsResponse.data;
      
      // Get current team members for this team
      const currentTeamMembers = teamMembers.filter(member => member.teamId === team.teamId);
      setCurrentMembers(currentTeamMembers);
      
      // Filter out interns who are already members of THIS specific team
      const currentTeamMemberIds = currentTeamMembers.map(member => member.internId);
      const available = allInterns.filter(intern => !currentTeamMemberIds.includes(intern.internId));
      setAvailableInterns(available);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignIntern = async () => {
    if (!selectedInternId) return;
    
    try {
      setIsAssigning(true);
      setError('');
      
      await teamMemberService.assignInternToTeam(team.teamId, selectedInternId);
      
      // Refresh data
      await fetchData();
      setSelectedInternId('');
      
      // Notify parent component to refresh team members
      if (onMembersUpdated) {
        onMembersUpdated();
      }
      
    } catch (err) {
      console.error('Error assigning intern:', err);
      setError(
        err.response?.data?.message || 
        'Failed to assign intern to team. Please try again.'
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      setError('');
      await teamMemberService.removeTeamMember(memberId);
      
      // Refresh data
      await fetchData();
      
      // Notify parent component to refresh team members
      if (onMembersUpdated) {
        onMembersUpdated();
      }
      
    } catch (err) {
      console.error('Error removing team member:', err);
      setError('Failed to remove team member. Please try again.');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !team) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Manage Team Members - {team.teamName}
          </h2>
          <button 
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {error && (
            <div className={styles.errorAlert}>
              <span className={styles.errorIcon}>⚠️</span>
              <span className={styles.errorText}>{error}</span>
              <button 
                className={styles.errorClose}
                onClick={() => setError('')}
              >
                ×
              </button>
            </div>
          )}

          {/* Team Leader Info */}
          <div className={styles.leaderSection}>
            <h4 className={styles.sectionTitle}>Team Leader</h4>
            <div className={styles.leaderCard}>
              <span className={styles.leaderName}>{team.teamLeaderName}</span>
              <span className={styles.leaderBadge}>Leader</span>
            </div>
          </div>

          {/* Add New Member */}
          <div className={styles.addSection}>
            <h4 className={styles.sectionTitle}>Add Team Member</h4>
            <div className={styles.addForm}>
              <select
                value={selectedInternId}
                onChange={(e) => setSelectedInternId(e.target.value)}
                className={styles.select}
                disabled={isAssigning || isLoading}
              >
                <option value="">Select an intern to add</option>
                {availableInterns.map((intern) => (
                  <option key={intern.internId} value={intern.internId}>
                    {intern.name} ({intern.internCode})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignIntern}
                disabled={!selectedInternId || isAssigning || isLoading}
                className={styles.addBtn}
              >
                {isAssigning ? 'Adding...' : 'Add Member'}
              </button>
            </div>
            {availableInterns.length === 0 && !isLoading && (
              <p className={styles.noAvailable}>
                No available interns to assign. All interns are already members of this team.
              </p>
            )}
          </div>

          {/* Current Members */}
          <div className={styles.membersSection}>
            <h4 className={styles.sectionTitle}>
              Current Members ({currentMembers.length})
            </h4>
            {isLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <span>Loading members...</span>
              </div>
            ) : currentMembers.length > 0 ? (
              <div className={styles.membersList}>
                {currentMembers.map((member) => (
                  <div key={member.id} className={styles.memberCard}>
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>{member.internName}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove ${member.internName} from the team?`)) {
                          handleRemoveMember(member.id);
                        }
                      }}
                      className={styles.removeBtn}
                      title="Remove from team"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noMembers}>
                <span>No team members assigned yet.</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberManager;
