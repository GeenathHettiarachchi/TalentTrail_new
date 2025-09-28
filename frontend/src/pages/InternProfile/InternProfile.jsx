import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { internService, teamMemberService, projectService, teamService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { InternForm, TeamForm, ProjectForm } from '../../components';
import { FiUsers, FiFolder } from 'react-icons/fi';
import styles from './InternProfile.module.css';

const InternProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isIntern, isProjectManager, isTeamLeader, loading: authLoading } = useAuth();
  const [intern, setIntern] = useState(null);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allTeamMembers, setAllTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  // member management handled within TeamForm when editing a team
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);

  // Check if this is the profile route (no ID) and user is an intern
  const isProfileRoute = location.pathname === '/profile' && isIntern && !isAdmin;

  useEffect(() => {
    // Only fetch when user data is available and not loading
    if (user && !authLoading) {
      fetchIntern();
    }
  }, [id, user, authLoading]);

  const fetchIntern = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug logging
      console.log('fetchIntern called');
      console.log('isProfileRoute:', isProfileRoute);
      console.log('user:', user);
      console.log('user.traineeId:', user?.traineeId);
      
      let internResponse;
      
      // If this is the profile route for an intern, fetch by trainee_id (intern_code)
      if (isProfileRoute && user?.traineeId) {
        console.log('Fetching intern by code:', user.traineeId);
        internResponse = await internService.getInternByCode(user.traineeId);
      } else if (isProfileRoute && !user?.traineeId) {
        console.error('Trainee ID not found for profile route. User object:', user);
        throw new Error('Trainee ID not found in user profile. Please contact administrator.');
      } else if (id) {
        console.log('Fetching intern by ID:', id);
        // Fetch intern details by ID
        internResponse = await internService.getInternById(id);
      } else {
        throw new Error('No intern identifier provided');
      }
      
      setIntern(internResponse.data);
      const internId = internResponse.data.internId;
      
      // Fetch all team members to find teams this intern belongs to
      const teamMembersResponse = await teamMemberService.getAllTeamMembers();
      setAllTeamMembers(teamMembersResponse.data);
      const internTeams = teamMembersResponse.data.filter(
        member => member.internId === internId
      );
      setTeams(internTeams);
      
      // Fetch all projects to find projects this intern is assigned to
      const projectsResponse = await projectService.getAllProjects();
      const internProjects = projectsResponse.data.filter(project => {
        // Check if any of the intern's teams are assigned to this project
        return internTeams.some(team => 
          project.assignedTeamIds && project.assignedTeamIds.includes(team.teamId)
        );
      });
      setProjects(internProjects);
      
    } catch (error) {
      console.error('Error fetching intern:', error);
      setError('Failed to load intern details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleEditSubmit = async (internData) => {
    try {
      setIsEditing(true);
      const internId = intern.internId;
      const response = await internService.updateIntern(internId, internData);
      setIntern(response.data);
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating intern:', error);
      throw error; // Let InternForm handle the error
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the intern "${intern.name}"? This action cannot be undone.`)) {
      try {
        const internId = intern.internId;
        await internService.deleteIntern(internId);
        navigate('/interns');
      } catch (error) {
        console.error('Error deleting intern:', error);
        alert('Failed to delete intern. Please try again.');
      }
    }
  };

  const handleEditTeam = async (team) => {
    try {
      const teamResponse = await teamService.getTeamById(team.teamId);
      setSelectedTeam(teamResponse.data);
      setShowTeamForm(true);
    } catch (error) {
      console.error('Error fetching team details:', error);
      alert('Failed to load team details. Please try again.');
    }
  };

  const handleEditProject = async (project) => {
    setSelectedProject(project);
    setShowProjectForm(true);
  };

  // Team members are managed inside TeamForm during edit

  const handleTeamFormSubmit = async (teamData) => {
    try {
      setIsEditingTeam(true);
      await teamService.updateTeam(selectedTeam.teamId, teamData);
      setShowTeamForm(false);
      setSelectedTeam(null);
      // Refresh data
      fetchIntern();
    } catch (error) {
      console.error('Error updating team:', error);
      throw error; // Let TeamForm handle the error
    } finally {
      setIsEditingTeam(false);
    }
  };

  const handleProjectFormSubmit = async (projectData) => {
    try {
      setIsEditingProject(true);
      await projectService.updateProject(selectedProject.projectId, projectData);
      setShowProjectForm(false);
      setSelectedProject(null);
      // Refresh data
      fetchIntern();
    } catch (error) {
      console.error('Error updating project:', error);
      throw error; // Let ProjectForm handle the error
    } finally {
      setIsEditingProject(false);
    }
  };

  // Members updated by TeamForm flows will trigger refresh via handleTeamFormSubmit

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTrainingDuration = () => {
    if (!intern.trainingStartDate || !intern.trainingEndDate) return '-';
    const start = new Date(intern.trainingStartDate);
    const end = new Date(intern.trainingEndDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    
    if (weeks > 0 && days > 0) {
      return `${weeks} weeks, ${days} days`;
    } else if (weeks > 0) {
      return `${weeks} weeks`;
    } else {
      return `${days} days`;
    }
  };

  const getTrainingStatus = () => {
    if (!intern.trainingStartDate || !intern.trainingEndDate) return null;
    const today = new Date();
    const start = new Date(intern.trainingStartDate);
    const end = new Date(intern.trainingEndDate);
    
    if (today < start) {
      const daysUntilStart = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
      return { status: 'upcoming', message: `Starts in ${daysUntilStart} days`, class: styles.statusUpcoming };
    } else if (today > end) {
      const daysSinceEnd = Math.ceil((today - end) / (1000 * 60 * 60 * 24));
      return { status: 'completed', message: `Completed ${daysSinceEnd} days ago`, class: styles.statusCompleted };
    } else {
      const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      return { status: 'active', message: `${daysRemaining} days remaining`, class: styles.statusActive };
    }
  };

  if (loading || authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading intern details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Error Loading Intern</h2>
          <p>{error}</p>
          <button 
            className={styles.retryBtn}
            onClick={fetchIntern}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>👤</div>
          <h2>Intern Not Found</h2>
          <p>The intern you're looking for could not be found.</p>
          <button 
            className={styles.retryBtn}
            onClick={() => navigate('/interns')}
          >
            Back to Interns
          </button>
        </div>
      </div>
    );
  }

  const trainingStatus = getTrainingStatus();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {!isProfileRoute && (
          <button 
            className={styles.backButton}
            onClick={() => navigate(isAdmin ? '/interns' : '/profile')}
          >
            ← Back to {isAdmin ? 'Interns' : 'Profile'}
          </button>
        )}
        
        {isAdmin && (
          <div className={styles.actions}>
            <button 
              className={styles.editBtn}
              onClick={handleEdit}
            >
              ✏️ Edit Intern
            </button>
            <button 
              className={styles.deleteBtn}
              onClick={handleDelete}
            >
              🗑️ Delete Intern
            </button>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.titleSection}>
          <div className={styles.internInfo}>
            <h1 className={styles.internName}>{intern.name}</h1>
            <div className={styles.internCode}>{intern.internCode}</div>
            {trainingStatus && (
              <span className={`${styles.statusBadge} ${trainingStatus.class}`}>
                {trainingStatus.message}
              </span>
            )}
          </div>
        </div>

        <div className={styles.topGrid}>
          <div className={styles.leftColumn}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Personal Information</h3>
              <div className={styles.scrollableContent}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{intern.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Institute:</span>
                    <span className={styles.infoValue}>{intern.institute}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Training Period</h3>
              <div className={styles.scrollableContent}>
                <div className={styles.timelineGrid}>
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineLabel}>Start Date:</span>
                    <span className={styles.timelineValue}>{formatDate(intern.trainingStartDate)}</span>
                  </div>
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineLabel}>End Date:</span>
                    <span className={styles.timelineValue}>{formatDate(intern.trainingEndDate)}</span>
                  </div>
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineLabel}>Duration:</span>
                    <span className={styles.timelineValue}>{getTrainingDuration()}</span>
                  </div>
                  {trainingStatus && (
                    <div className={styles.timelineItem}>
                      <span className={styles.timelineLabel}>Status:</span>
                      <span className={styles.timelineValue}>{trainingStatus.message}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Team Assignments</h3>
              <div className={styles.scrollableContent}>
                {teams.length > 0 ? (
                  <div className={styles.assignmentsList}>
                    {teams.map((team, index) => (
                      <div 
                        key={team.teamMemberId || index} 
                        className={styles.assignmentCard}
                      >
                        <div 
                          className={styles.assignmentMainContent}
                          onClick={() => navigate(`/teams/${team.teamId}`)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view team profile"
                        >
                          <div className={styles.teamIcon}>
                            <FiUsers />
                          </div>
                          <div className={styles.assignmentInfo}>
                            <div className={styles.assignmentName}>{team.teamName}</div>
                            <div className={styles.assignmentRole}>Team Member</div>
                          </div>
                        </div>
                        {(isProjectManager || isTeamLeader) && (
                          <div className={styles.assignmentActions}>
                            <button
                              className={styles.actionBtn}
                              onClick={() => handleEditTeam(team)}
                              title="Edit team"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.unassigned}>
                    <div className={styles.unassignedIcon}>❓</div>
                    <span>No team assignments</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Project Assignments</h3>
              <div className={styles.scrollableContent}>
                {projects.length > 0 ? (
                  <div className={styles.assignmentsList}>
                    {projects.map((project, index) => (
                      <div 
                        key={project.projectId || index} 
                        className={styles.assignmentCard}
                      >
                        <div 
                          className={styles.assignmentMainContent}
                          onClick={() => navigate(`/projects/${project.projectId}`)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view project profile"
                        >
                          <div className={styles.projectIcon}>
                            <FiFolder />
                          </div>
                          <div className={styles.assignmentInfo}>
                            <div className={styles.assignmentName}>{project.projectName}</div>
                            <div className={styles.assignmentRole}>
                              Status: {project.status?.replace('_', ' ') || 'Unknown'}
                            </div>
                          </div>
                        </div>
                        {isProjectManager && (
                          <div className={styles.assignmentActions}>
                            <button
                              className={styles.actionBtn}
                              onClick={() => handleEditProject(project)}
                              title="Edit project"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.unassigned}>
                    <div className={styles.unassignedIcon}>❓</div>
                    <span>No project assignments</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <InternForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleEditSubmit}
        intern={intern}
        isLoading={isEditing}
      />

      <TeamForm
        isOpen={showTeamForm}
        onClose={() => {
          setShowTeamForm(false);
          setSelectedTeam(null);
        }}
        onSubmit={handleTeamFormSubmit}
        team={selectedTeam}
        isLoading={isEditingTeam}
      />

      <ProjectForm
        isOpen={showProjectForm}
        onClose={() => {
          setShowProjectForm(false);
          setSelectedProject(null);
        }}
        onSubmit={handleProjectFormSubmit}
        project={selectedProject}
        isLoading={isEditingProject}
      />

  {/** TeamMemberManager removed: use TeamForm (Edit Team) to manage members */}
    </div>
  );
};

export default InternProfile;
