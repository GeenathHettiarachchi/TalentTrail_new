import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { internService, teamMemberService, projectService, teamService, internUpdateRequestService } from '../../services/api';
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

  // Forms & edit flags
  const [showEditForm, setShowEditForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [showTeamForm, setShowTeamForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isEditingTeam, setIsEditingTeam] = useState(false);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditingProject, setIsEditingProject] = useState(false);

  // Update request workflow
  const [myRequests, setMyRequests] = useState([]);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Is this the intern’s own profile page (no :id, user is Intern, not Admin)
  const isProfileRoute = location.pathname === '/profile' && isIntern && !isAdmin;

  useEffect(() => {
    if (user && !authLoading) {
      fetchIntern();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading, location.pathname]);

  const fetchIntern = async () => {
    try {
      setLoading(true);
      setError(null);

      let internResponse;

      if (isProfileRoute && user?.traineeId) {
        // Load intern by code for intern’s own profile
        internResponse = await internService.getInternByCode(user.traineeId);
      } else if (isProfileRoute && !user?.traineeId) {
        throw new Error('Trainee ID not found in user profile. Please contact administrator.');
      } else if (id) {
        // Admin or others viewing by ID
        internResponse = await internService.getInternById(id);
      } else {
        throw new Error('No intern identifier provided');
      }

      const internData = internResponse.data;
      setIntern(internData);

      const internId = internData.internId;

      // Teams (load all team members, filter by this intern)
      const teamMembersResponse = await teamMemberService.getAllTeamMembers();
      setAllTeamMembers(teamMembersResponse.data);
      const internTeams = teamMembersResponse.data.filter(m => m.internId === internId);
      setTeams(internTeams);

      // Projects (any project whose assignedTeamIds contains one of intern's teamIds)
      const projectsResponse = await projectService.getAllProjects();
      const internProjects = projectsResponse.data.filter(project =>
        internTeams.some(team => project.assignedTeamIds && project.assignedTeamIds.includes(team.teamId))
      );
      setProjects(internProjects);

      // Load update requests for intern’s own profile
      if (isProfileRoute && internId) {
        try {
          const reqRes = await internUpdateRequestService.listForIntern(internId);
          setMyRequests(reqRes.data || []);
        } catch (e) {
          console.warn('Could not load update requests', e);
          setMyRequests([]);
        }
      } else {
        setMyRequests([]);
      }

    } catch (err) {
      console.error('Error fetching intern:', err);
      setError(err?.message || 'Failed to load intern details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ====== Admin direct edit (immediate update) ======
  const handleEdit = () => setShowEditForm(true);

  const handleEditSubmit = async (internData) => {
    try {
      setIsEditing(true);
      const updated = await internService.updateIntern(intern.internId, internData);
      setIntern(updated.data);
      setShowEditForm(false);
    } catch (err) {
      console.error('Error updating intern:', err);
      throw err; // let InternForm show the error
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the intern "${intern.name}"? This action cannot be undone.`)) {
      try {
        await internService.deleteIntern(intern.internId);
        navigate('/interns');
      } catch (err) {
        console.error('Error deleting intern:', err);
        alert('Failed to delete intern. Please try again.');
      }
    }
  };

  // ====== Team & Project edit helpers ======
  const handleEditTeam = async (team) => {
    try {
      const teamResponse = await teamService.getTeamById(team.teamId);
      setSelectedTeam(teamResponse.data);
      setShowTeamForm(true);
    } catch (err) {
      console.error('Error fetching team details:', err);
      alert('Failed to load team details. Please try again.');
    }
  };

  const handleTeamFormSubmit = async (teamData) => {
    try {
      setIsEditingTeam(true);
      await teamService.updateTeam(selectedTeam.teamId, teamData);
      setShowTeamForm(false);
      setSelectedTeam(null);
      fetchIntern();
    } catch (err) {
      console.error('Error updating team:', err);
      throw err;
    } finally {
      setIsEditingTeam(false);
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowProjectForm(true);
  };

  const handleProjectFormSubmit = async (projectData) => {
    try {
      setIsEditingProject(true);
      await projectService.updateProject(selectedProject.projectId, projectData);
      setShowProjectForm(false);
      setSelectedProject(null);
      fetchIntern();
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    } finally {
      setIsEditingProject(false);
    }
  };

  // ====== Intern self-update (create approval request) ======
  const handleInternSelfEditSubmit = async (formData) => {
    try {
      setSubmittingRequest(true);
      await internUpdateRequestService.createForIntern(intern.internId, {
        name: formData.name,
        email: formData.email,
        institute: formData.institute,
        trainingStartDate: formData.trainingStartDate,
        trainingEndDate: formData.trainingEndDate,
      });
      setShowEditForm(false);
      // refresh request list
      const reqRes = await internUpdateRequestService.listForIntern(intern.internId);
      setMyRequests(reqRes.data || []);
      alert('Update request submitted and is pending admin approval.');
    } catch (err) {
      console.error('Failed to submit update request:', err);
      alert('Failed to submit update request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // ====== helpers ======
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getTrainingDuration = () => {
    if (!intern?.trainingStartDate || !intern?.trainingEndDate) return '-';
    const start = new Date(intern.trainingStartDate);
    const end = new Date(intern.trainingEndDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    if (weeks > 0 && days > 0) return `${weeks} weeks, ${days} days`;
    if (weeks > 0) return `${weeks} weeks`;
    return `${days} days`;
  };

  const getTrainingStatus = () => {
    if (!intern?.trainingStartDate || !intern?.trainingEndDate) return null;
    const today = new Date();
    const start = new Date(intern.trainingStartDate);
    const end = new Date(intern.trainingEndDate);

    if (today < start) {
      const daysUntilStart = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
      return { status: 'upcoming', message: `Starts in ${daysUntilStart} days`, class: styles.statusUpcoming };
    }
    if (today > end) {
      const daysSinceEnd = Math.ceil((today - end) / (1000 * 60 * 60 * 24));
      return { status: 'completed', message: `Completed ${daysSinceEnd} days ago`, class: styles.statusCompleted };
    }
    const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return { status: 'active', message: `${daysRemaining} days remaining`, class: styles.statusActive };
  };

  // ====== loading / error states ======
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
          <button className={styles.retryBtn} onClick={fetchIntern}>Try Again</button>
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
          <button className={styles.retryBtn} onClick={() => navigate('/interns')}>Back to Interns</button>
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

        {/* Admin controls */}
        {isAdmin && (
          <div className={styles.actions}>
            <button className={styles.editBtn} onClick={handleEdit}>✏️ Edit Intern</button>
            <button className={styles.deleteBtn} onClick={handleDelete}>🗑️ Delete Intern</button>
          </div>
        )}

        {/* Intern self-update button */}
        {isProfileRoute && (
          <div className={styles.actions}>
            <button
              className={styles.primaryBtn}
              onClick={() => { setShowEditForm(true); setIsEditing(false); }}
            >
              Request Profile Update
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
                      <div key={team.teamMemberId || index} className={styles.assignmentCard}>
                        <div
                          className={styles.assignmentMainContent}
                          onClick={() => navigate(`/teams/${team.teamId}`)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view team profile"
                        >
                          <div className={styles.teamIcon}><FiUsers /></div>
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
                      <div key={project.projectId || index} className={styles.assignmentCard}>
                        <div
                          className={styles.assignmentMainContent}
                          onClick={() => navigate(`/projects/${project.projectId}`)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view project profile"
                        >
                          <div className={styles.projectIcon}><FiFolder /></div>
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

        {/* Intern’s update request history (only on their own profile) */}
        {isProfileRoute && (
          <div className={styles.card}>
            <h3>My Profile Update Requests</h3>
            {myRequests.length === 0 ? (
              <p>No requests yet.</p>
            ) : (
              <ul className={styles.requestsList}>
                {myRequests.map((r) => (
                  <li key={r.id} className={styles.requestItem}>
                    <div>
                      <strong>Status:</strong> {r.status}
                      {r.status === 'REJECTED' && r.rejectionReason && (
                        <> — <em>{r.rejectionReason}</em></>
                      )}
                    </div>
                    <div><strong>Submitted:</strong> {new Date(r.submittedAt).toLocaleString()}</div>
                    <details>
                      <summary>Proposed changes</summary>
                      <pre className={styles.diffBlock}>
{JSON.stringify({
  name: r.name,
  email: r.email,
  institute: r.institute,
  trainingStartDate: r.trainingStartDate,
  trainingEndDate: r.trainingEndDate
}, null, 2)}
                      </pre>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Intern/Admin edit form modal:
          - On intern's own profile → submit creates an approval request
          - On admin view by ID → submit updates directly */}
      <InternForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={isProfileRoute ? handleInternSelfEditSubmit : handleEditSubmit}
        intern={intern}
        isLoading={isProfileRoute ? submittingRequest : isEditing}
      />

      {/* Team edit modal */}
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

      {/* Project edit modal */}
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
    </div>
  );
};

export default InternProfile;
