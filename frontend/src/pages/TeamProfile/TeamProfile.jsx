import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamService, teamMemberService, projectService, internService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { TeamForm, InternTable } from '../../components';
import { FiFolder } from 'react-icons/fi';
import styles from './TeamProfile.module.css';

const TeamProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, canEditTeam, user, loading: authLoading } = useAuth();
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [interns, setInterns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  // member management handled in TeamForm now

  useEffect(() => {
    fetchTeam();
  }, [id]);

  useEffect(() => {
    if (!authLoading && user) {
      checkEditPermissions();
    }
  }, [id, user, authLoading]);

  const checkEditPermissions = async () => {
    console.log('TeamProfile: Checking edit permissions for team', id);
    console.log('TeamProfile: isAdmin:', isAdmin, 'user:', user);
    
    if (isAdmin) {
      console.log('TeamProfile: User is admin, setting canEdit to true');
      setCanEdit(true);
      return;
    }
    
    try {
      const hasPermission = await canEditTeam(id);
      console.log('TeamProfile: Permission check result:', hasPermission);
      setCanEdit(hasPermission);
    } catch (error) {
      console.error('Error checking edit permissions:', error);
      setCanEdit(false);
    }
  };

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch team details
      const teamResponse = await teamService.getTeamById(id);
      setTeam(teamResponse.data);
      
      // Fetch all team members for this team
      const teamMembersResponse = await teamMemberService.getAllTeamMembers();
      const teamTeamMembers = teamMembersResponse.data.filter(
        member => member.teamId === parseInt(id)
      );
      setTeamMembers(teamTeamMembers);
      
      // Fetch all interns to get full intern details for team members
      const internsResponse = await internService.getAllInterns();
      const teamInterns = internsResponse.data.filter(intern => 
        teamTeamMembers.some(member => member.internId === intern.internId)
      );
      setInterns(teamInterns);
      
      // Fetch projects assigned to this team
      const projectsResponse = await projectService.getAllProjects();
      const teamProjects = projectsResponse.data.filter(
        project => project.assignedTeamIds && project.assignedTeamIds.includes(parseInt(id))
      );
      setProjects(teamProjects);
      
    } catch (error) {
      console.error('Error fetching team:', error);
      setError('Failed to load team details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleEditSubmit = async (teamData) => {
    try {
      setIsEditing(true);
      const response = await teamService.updateTeam(id, teamData);
      setTeam(response.data);
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating team:', error);
      throw error; // Let TeamForm handle the error
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the team "${team.teamName}"? This action cannot be undone.`)) {
      try {
        await teamService.deleteTeam(id);
        navigate('/teams');
      } catch (error) {
        console.error('Error deleting team:', error);
        alert('Failed to delete team. Please try again.');
      }
    }
  };

  const handleEditIntern = (intern) => {
    // Navigate to intern profile instead of editing
    navigate(`/interns/${intern.internId}`);
  };

  const handleDeleteIntern = async (internId) => {
    // Remove intern from team (remove team member relationship)
    const teamMember = teamMembers.find(member => member.internId === internId);
    if (teamMember) {
      try {
        await teamMemberService.removeTeamMember(teamMember.teamMemberId);
        // Refresh data
        fetchTeam();
      } catch (error) {
        console.error('Error removing team member:', error);
        alert('Failed to remove team member. Please try again.');
      }
    }
  };

  const handleMembersUpdated = () => {
    // Refresh team data when members are updated
    fetchTeam();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTeamLeader = () => {
    if (!team || !team.teamLeaderId || interns.length === 0) return null;
    return interns.find(intern => intern.internId === team.teamLeaderId);
  };

  const getProjectStatusBadge = (status) => {
    const statusClasses = {
      PLANNED: styles.statusPlanned,
      IN_PROGRESS: styles.statusInProgress,
      COMPLETED: styles.statusCompleted,
      ON_HOLD: styles.statusOnHold
    };

    const statusLabels = {
      PLANNED: 'Planned',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      ON_HOLD: 'On Hold'
    };

    return (
      <span className={`${styles.statusBadge} ${statusClasses[status] || ''}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading team details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Error Loading Team</h2>
          <p>{error}</p>
          <button 
            className={styles.retryBtn}
            onClick={fetchTeam}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>👥</div>
          <h2>Team Not Found</h2>
          <p>The team you're looking for could not be found.</p>
          <button 
            className={styles.retryBtn}
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const teamLeader = getTeamLeader();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        
        <div className={styles.actions}>
          {canEdit && (
            <button 
              className={styles.editBtn}
              onClick={handleEdit}
            >
              ✏️ Edit Team
            </button>
          )}
          {isAdmin && (
            <button 
              className={styles.deleteBtn}
              onClick={handleDelete}
            >
              🗑️ Delete Team
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.titleSection}>
          <div className={styles.teamInfo}>
            <h1 className={styles.teamName}>{team.teamName}</h1>
            <div className={styles.teamStats}>
              <span className={styles.statItem}>
                {interns.length} {interns.length === 1 ? 'Member' : 'Members'}
              </span>
              <span className={styles.statDivider}>•</span>
              <span className={styles.statItem}>
                {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.topGrid}>
          <div className={styles.leftColumn}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Team Information</h3>
              <div className={styles.scrollableContent}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Team Name:</span>
                    <span className={styles.infoValue}>{team.teamName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Team Leader:</span>
                    <span className={styles.infoValue}>
                      {teamLeader ? (
                        <span 
                          className={styles.clickableValue}
                          onClick={() => navigate(`/interns/${teamLeader.internId}`)}
                        >
                          {teamLeader.name} ({teamLeader.internCode})
                        </span>
                      ) : 'Not assigned'}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Total Members:</span>
                    <span className={styles.infoValue}>{interns.length}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Active Projects:</span>
                    <span className={styles.infoValue}>{projects.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Assigned Projects</h3>
              <div className={styles.scrollableContent}>
                {projects.length > 0 ? (
                  <div className={styles.assignmentsList}>
                    {projects.map((project, index) => (
                      <div 
                        key={project.projectId || index} 
                        className={styles.assignmentCard}
                        onClick={() => navigate(`/projects/${project.projectId}`)}
                        style={{ cursor: 'pointer' }}
                        title="Click to view project profile"
                      >
                        <div className={styles.projectIcon}>
                          <FiFolder />
                        </div>
                        <div className={styles.assignmentInfo}>
                          <div className={styles.assignmentName}>{project.projectName}</div>
                          <div className={styles.assignmentMeta}>
                            {getProjectStatusBadge(project.status)}
                            <span className={styles.projectDates}>
                              {formatDate(project.startDate)} - {formatDate(project.targetDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.unassigned}>
                    <div className={styles.unassignedIcon}>❓</div>
                    <span>No assigned projects</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.membersSection}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Team Members {interns.length > 0 && `(${interns.length})`}
            </h3>
            <div className={styles.tableContainer}>
              <InternTable
                interns={interns}
                onEdit={handleEditIntern}
                onDelete={handleDeleteIntern}
                isLoading={false}
              />
            </div>
          </div>
        </div>
      </div>

      <TeamForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleEditSubmit}
        team={team}
        isLoading={isEditing}
      />

  {/* TeamMemberManager removed; membership handled inside TeamForm during edit */}
    </div>
  );
};

export default TeamProfile;
