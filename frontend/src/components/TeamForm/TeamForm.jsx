import React, { useState, useEffect } from 'react';
import { internService, teamMemberService } from '../../services/api';
import styles from './TeamForm.module.css';

const TeamForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  team = null,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    teamName: '',
    teamLeaderId: '',
    teamLeaderName: ''
  });

  const [errors, setErrors] = useState({});
  const [interns, setInterns] = useState([]);
  const [loadingInterns, setLoadingInterns] = useState(false);
  // Member management
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableInterns, setAvailableInterns] = useState([]);
  const [selectedInternId, setSelectedInternId] = useState('');
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [internSearchTerm, setInternSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchInterns();
      if (team && team.teamId) {
        loadMembers(team.teamId);
      } else {
        setTeamMembers([]);
        setAvailableInterns([]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (team) {
      setFormData({
        teamName: team.teamName || '',
        teamLeaderId: team.teamLeaderId || '',
        teamLeaderName: team.teamLeaderName || ''
      });
    } else {
      setFormData({
        teamName: '',
        teamLeaderId: '',
        teamLeaderName: ''
      });
    }
    setErrors({});
  }, [team, isOpen]);

  const fetchInterns = async () => {
    try {
      setLoadingInterns(true);
      const response = await internService.getAllInterns();
      setInterns(response.data);
    } catch (err) {
      console.error('Error fetching interns:', err);
      setInterns([]);
    } finally {
      setLoadingInterns(false);
    }
  };

  const loadMembers = async (teamId) => {
    try {
      setMembersLoading(true);
      setMembersError('');
      const response = await teamMemberService.getAllTeamMembers();
      const current = response.data.filter(m => m.teamId === teamId);
      setTeamMembers(current);
      const currentIds = current.map(m => m.internId);
      setAvailableInterns(prev => {
        // Use interns list if already fetched; else compute once interns are fetched
        const base = interns && interns.length > 0 ? interns : prev;
        return base.filter(i => !currentIds.includes(i.internId));
      });
    } catch (err) {
      console.error('Error loading members:', err);
      setMembersError('Failed to load team members');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLeaderChange = (e) => {
    const selectedInternId = e.target.value;
    const selectedIntern = interns.find(intern => intern.internId === parseInt(selectedInternId));
    
    setFormData(prev => ({
      ...prev,
      teamLeaderId: selectedInternId,
      teamLeaderName: selectedIntern ? selectedIntern.name : ''
    }));
    
    if (errors.teamLeaderId) {
      setErrors(prev => ({
        ...prev,
        teamLeaderId: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    }
    
    if (!formData.teamLeaderId) {
      newErrors.teamLeaderId = 'Team leader is required';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const submitData = { ...formData };
    if (team && team.teamId) {
      submitData.teamId = team.teamId;
    }

    onSubmit(submitData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Filter interns based on search term
  const availableInternsForSearch = interns.filter(i => !teamMembers.some(m => m.internId === i.internId));
  const filteredAvailableInterns = availableInternsForSearch.filter(intern =>
    intern.name.toLowerCase().includes(internSearchTerm.toLowerCase()) ||
    intern.internCode.toLowerCase().includes(internSearchTerm.toLowerCase())
  );

  const handleInternSelect = (internId) => {
    setSelectedInternId(internId);
    setInternSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {team ? 'Edit Team' : 'Create New Team'}
          </h2>
          <button 
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

  <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="teamName" className={styles.label}>
                Team Name *
              </label>
              <input
                type="text"
                id="teamName"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                className={`${styles.input} ${errors.teamName ? styles.error : ''}`}
                placeholder="e.g., Development Team A"
              />
              {errors.teamName && (
                <span className={styles.errorText}>{errors.teamName}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="teamLeaderId" className={styles.label}>
                Team Leader *
              </label>
              {loadingInterns ? (
                <div className={styles.loadingSelect}>
                  <span>Loading interns...</span>
                </div>
              ) : (
                <select
                  id="teamLeaderId"
                  name="teamLeaderId"
                  value={formData.teamLeaderId}
                  onChange={handleLeaderChange}
                  className={`${styles.select} ${errors.teamLeaderId ? styles.error : ''}`}
                >
                  <option value="">Select a team leader</option>
                  {interns.map((intern) => (
                    <option key={intern.internId} value={intern.internId}>
                      {intern.name} ({intern.internCode})
                    </option>
                  ))}
                </select>
              )}
              {errors.teamLeaderId && (
                <span className={styles.errorText}>{errors.teamLeaderId}</span>
              )}
            </div>
          </div>

          {/* Member management when editing */}
          {team && team.teamId && (
            <div className={styles.infoSection}>
              <h4 className={styles.infoTitle}>Manage Members</h4>
              {membersError && (
                <div className={styles.errorAlert}>
                  <span>⚠️ {membersError}</span>
                </div>
              )}
              <div className={styles.addMemberSection}>
                <div className={styles.searchableSection}>
                  <input
                    type="text"
                    placeholder="Search interns by name or code..."
                    value={internSearchTerm}
                    onChange={(e) => setInternSearchTerm(e.target.value)}
                    className={styles.searchInput}
                    disabled={isAssigning || membersLoading || loadingInterns}
                  />
                  {internSearchTerm && (
                    <div className={styles.searchResults}>
                      {filteredAvailableInterns.length > 0 ? (
                        filteredAvailableInterns.map((intern) => (
                          <button
                            key={intern.internId}
                            type="button"
                            className={styles.searchResultItem}
                            onClick={() => handleInternSelect(intern.internId)}
                          >
                            <span className={styles.internName}>{intern.name}</span>
                            <span className={styles.internCode}>({intern.internCode})</span>
                          </button>
                        ))
                      ) : (
                        <div className={styles.noResults}>
                          No interns found matching "{internSearchTerm}"
                        </div>
                      )}
                    </div>
                  )}
                  {selectedInternId && (
                    <div className={styles.selectedIntern}>
                      <span>Selected: {interns.find(i => i.internId === parseInt(selectedInternId))?.name}</span>
                      <button
                        type="button"
                        className={styles.clearSelection}
                        onClick={() => setSelectedInternId('')}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={async () => {
                    if (!selectedInternId) return;
                    try {
                      setIsAssigning(true);
                      await teamMemberService.assignInternToTeam(team.teamId, selectedInternId);
                      setSelectedInternId('');
                      setInternSearchTerm('');
                      await loadMembers(team.teamId);
                    } catch (err) {
                      console.error('Assign failed', err);
                      setMembersError(err.response?.data?.message || 'Failed to assign intern');
                    } finally {
                      setIsAssigning(false);
                    }
                  }}
                  disabled={!selectedInternId || isAssigning}
                >
                  {isAssigning ? 'Adding...' : 'Add Member'}
                </button>
              </div>
              <div className={styles.membersList}>
                {membersLoading ? (
                  <div className={styles.loadingSmall}>Loading members...</div>
                ) : teamMembers.length > 0 ? (
                  teamMembers.map((m) => (
                    <div key={m.id || m.teamMemberId} className={styles.memberRow}>
                      <span className={styles.memberName}>{m.internName}</span>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={async () => {
                          if (!window.confirm(`Remove ${m.internName} from team?`)) return;
                          try {
                            await teamMemberService.removeTeamMember(m.id || m.teamMemberId);
                            await loadMembers(team.teamId);
                          } catch (err) {
                            console.error('Remove failed', err);
                            setMembersError('Failed to remove member');
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className={styles.noMembers}>No members assigned</div>
                )}
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading || loadingInterns}
            >
              {isLoading ? 'Saving...' : (team ? 'Update Team' : 'Create Team')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamForm;
