import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService, teamService, internService, moduleService, teamMemberService, projectTeamService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import ModuleTable from '../../components/ModuleTable/ModuleTable';
import ModuleForm from '../../components/ModuleForm/ModuleForm';
import ModuleBulkImport from '../../components/ModuleBulkImport/ModuleBulkImport';
import DocumentationSection from '../../components/DocumentationSection/DocumentationSection';
import { PiCrownFill } from "react-icons/pi";
import {
  FiUsers, 
  FiUser
} from 'react-icons/fi';
import styles from './ProjectProfile.module.css';

const ProjectProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, canEditProject, user, loading: authLoading } = useAuth();
  const [project, setProject] = useState(null);
  const [modules, setModules] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [repoAnalytics, setRepoAnalytics] = useState({ contributors: [], recentCommits: [] });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (!authLoading && user) {
      checkEditPermissions();
    }
  }, [id, user, authLoading]);

  const checkEditPermissions = async () => {
    console.log('ProjectProfile: Checking edit permissions for project', id);
    console.log('ProjectProfile: isAdmin:', isAdmin, 'user:', user);
    
    if (isAdmin) {
      console.log('ProjectProfile: User is admin, setting canEdit to true');
      setCanEdit(true);
      return;
    }
    
    try {
      const hasPermission = await canEditProject(id);
      console.log('ProjectProfile: Permission check result:', hasPermission);
      setCanEdit(hasPermission);
    } catch (error) {
      console.error('Error checking edit permissions:', error);
      setCanEdit(false);
    }
  };

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getProjectById(id);
      setProject(response.data);
      
      // Fetch modules for this project
      const modulesResponse = await moduleService.getModulesByProjectId(id);
      setModules(modulesResponse.data);

  // Fetch team members if project has assigned teams
      if (response.data.assignedTeamIds && response.data.assignedTeamIds.length > 0) {
        try {
          const [teamMembersResponse, allTeamsResponse] = await Promise.all([
            teamMemberService.getAllTeamMembers(),
            teamService.getAllTeams()
          ]);
          
          // Get all teams assigned to this project
          const projectAssignedTeams = allTeamsResponse.data.filter(
            team => response.data.assignedTeamIds.includes(team.teamId)
          );
          setAssignedTeams(projectAssignedTeams);
          
          // Get team members from all assigned teams
          const projectTeamMembers = teamMembersResponse.data.filter(
            member => response.data.assignedTeamIds.includes(member.teamId)
          );
          setTeamMembers(projectTeamMembers);
        } catch (teamError) {
          console.error('Error fetching team members:', teamError);
          setTeamMembers([]);
          setAssignedTeams([]);
        }
      } else {
        setTeamMembers([]);
        setAssignedTeams([]);
      }

      // Fetch repo analytics for Bitbucket/GitHub if repo configured (token optional for public repos)
      if (response.data.repoHost && response.data.repoName) {
        const host = String(response.data.repoHost).toUpperCase();
        if (host === 'BITBUCKET' || host === 'GITHUB') {
          try {
            setAnalyticsLoading(true);
            const analyticsResp = await projectService.getRepoAnalytics(id);
            setRepoAnalytics(analyticsResp.data || { contributors: [], recentCommits: [] });
          } catch (e) {
            console.error('Error fetching repo analytics:', e);
            setRepoAnalytics({ contributors: [], recentCommits: [] });
          } finally {
            setAnalyticsLoading(false);
          }
        } else {
          setRepoAnalytics({ contributors: [], recentCommits: [] });
        }
      } else {
        setRepoAnalytics({ contributors: [], recentCommits: [] });
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleEditSubmit = async (projectData) => {
    try {
      setIsEditing(true);
      const response = await projectService.updateProject(id, projectData);
      setProject(response.data);
      setShowEditForm(false);
      // Refresh analytics if repo fields present (token optional for public repos)
      if (response.data.repoHost && response.data.repoName) {
        const host = String(response.data.repoHost).toUpperCase();
        if (host === 'BITBUCKET' || host === 'GITHUB') {
          try {
            setAnalyticsLoading(true);
            const analyticsResp = await projectService.getRepoAnalytics(id);
            setRepoAnalytics(analyticsResp.data || { contributors: [], recentCommits: [] });
          } catch (e) {
            console.error('Error refreshing repo analytics:', e);
          } finally {
            setAnalyticsLoading(false);
          }
        } else {
          setRepoAnalytics({ contributors: [], recentCommits: [] });
        }
      } else {
        setRepoAnalytics({ contributors: [], recentCommits: [] });
      }
    } catch (error) {
      console.error('Error updating project:', error);
      throw error; // Let ProjectForm handle the error
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the project "${project.projectName}"? This action cannot be undone.`)) {
      try {
        await projectService.deleteProject(id);
        navigate('/projects');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  // Module CRUD handlers
  const handleCreateModule = () => {
    setEditingModule(null);
    setShowModuleForm(true);
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setShowModuleForm(true);
  };

  const handleModuleSubmit = async (moduleData) => {
    try {
      if (editingModule) {
        // Update existing module
        const response = await moduleService.updateModule(editingModule.moduleId, moduleData);
        setModules(prev => prev.map(m => 
          m.moduleId === editingModule.moduleId ? response.data : m
        ));
      } else {
        // Create new module
        const response = await moduleService.createModule(moduleData);
        setModules(prev => [...prev, response.data]);
      }
      setShowModuleForm(false);
      setEditingModule(null);
    } catch (error) {
      console.error('Error saving module:', error);
      throw error; // Let the form handle the error
    }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      await moduleService.deleteModule(moduleId);
      setModules(prev => prev.filter(m => m.moduleId !== moduleId));
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete module. Please try again.');
    }
  };

  const handleBulkImportSuccess = async () => {
    // Refresh modules after successful bulk import
    try {
      const modulesResponse = await moduleService.getModulesByProjectId(id);
      setModules(modulesResponse.data);
    } catch (error) {
      console.error('Error refreshing modules after import:', error);
    }
  };

  const getStatusBadge = (status) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className={styles.overdue}>Overdue by {Math.abs(diffDays)} days</span>;
    } else if (diffDays === 0) {
      return <span className={styles.dueToday}>Due today</span>;
    } else if (diffDays <= 7) {
      return <span className={styles.dueSoon}>Due in {diffDays} days</span>;
    } else {
      return <span className={styles.dueLater}>{diffDays} days remaining</span>;
    }
  };

  const getProjectDuration = () => {
    if (!project.startDate || !project.targetDate) return 'Duration not set';
    const start = new Date(project.startDate);
    const end = new Date(project.targetDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Error Loading Project</h2>
        <p>{error}</p>
        <button 
          className={styles.retryBtn}
          onClick={fetchProject}
        >
          Try Again
        </button>
        <button 
          className={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={styles.error}>
        <div className={styles.errorIcon}>📋</div>
        <h2>Project Not Found</h2>
        <p>The project you're looking for doesn't exist or has been deleted.</p>
        <button 
          className={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    );
  }

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
              ✏️ Edit Project
            </button>
          )}

          {isAdmin && (
            <button 
              className={styles.deleteBtn}
              onClick={handleDelete}
            >
              🗑️ Delete Project
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.titleSection}>
          <h1 className={styles.projectTitle}>{project.projectName}</h1>
          {getStatusBadge(project.status)}
        </div>

        <div className={styles.topGrid}>
          <div className={styles.leftColumn}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Project Description</h3>
              <div className={styles.scrollableContent}>
                <p className={styles.description}>
                  {project.description || 'No description provided'}
                </p>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Timeline</h3>
              <div className={styles.scrollableContent}>
                <div className={styles.timelineGrid}>
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineLabel}>Start Date:</span>
                    <span className={styles.timelineValue}>{formatDate(project.startDate)}</span>
                  </div>
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineLabel}>Target Date:</span>
                    <span className={styles.timelineValue}>{formatDate(project.targetDate)}</span>
                  </div>
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineLabel}>Duration:</span>
                    <span className={styles.timelineValue}>{getProjectDuration()}</span>
                  </div>
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineLabel}>Status:</span>
                    <span className={styles.timelineValue}>{getDaysRemaining(project.targetDate)}</span>
                  </div>
                </div>
              </div>
            </div>


          </div>

          <div className={styles.rightColumn}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>PM & Team Assignments {assignedTeams.length > 0 && ` (${assignedTeams.length})`}</h3>
              <div className={styles.scrollableContent}>
                {assignedTeams.length > 0 ? (
                  <div className={styles.teamsContainer}>
                    {/* Show project manager information */}
                    {project.projectManagerName && (
                      <div className={styles.assignmentCard}>
                        <div className={styles.assignedTeam}>
                          <div className={`${styles.teamIcon} ${styles.pmIcon}`}>
                            <PiCrownFill />
                          </div>
                          <div className={styles.teamInfo}>
                            <div className={styles.teamName}>Project Manager</div>
                            <div className={styles.teamRole}>{project.projectManagerName}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {assignedTeams.map(team => (
                      <div key={team.teamId} className={styles.assignmentCard}>
                        <div className={styles.assignedTeam}>
                          <div className={styles.teamIcon}>
                            <FiUsers />
                          </div>
                          <div className={styles.teamInfo}>
                            <div className={styles.teamName}>{team.teamName}</div>
                          </div>
                        </div>
                        
                        {/* Show team members for this specific team */}
                        {teamMembers.filter(member => member.teamId === team.teamId).length > 0 && (
                          <div className={styles.teamMembersList}>
                            {teamMembers
                              .filter(member => member.teamId === team.teamId)
                              .map((member, index) => (
                                <div key={member.teamMemberId || index} className={styles.teamMember}>
                                  <div className={styles.memberIcon}>
                                    <FiUser />
                                  </div>
                                  <div className={styles.memberInfo}>
                                    <span className={styles.memberName}>{member.internName}</span>
                                    <span className={styles.memberRole}>
                                      {member.internId === team.teamLeaderId 
                                        ? 'Team Leader' 
                                        : 'Team Member'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.unassigned}>
                    <div className={styles.unassignedIcon}>❓</div>
                    <span>No teams assigned</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DocumentationSection projectId={id} />

        <div className={styles.modulesSection}>
          <div className={styles.section}>
            <div className={styles.modulesSectionHeader}>
              <h3 className={styles.sectionTitle}>
                Project Modules{modules.length > 0 && ` (${modules.length})`}
              </h3>
              {canEdit && (
                <div className={styles.modulesActions}>
                  <button 
                    className={styles.importExportBtn}
                    onClick={() => setShowBulkImport(true)}
                    title="Import/Export Modules & Functions"
                  >
                    📤 Import/Export Modules & Functions
                  </button>
                </div>
              )}
            </div>
            <ModuleTable 
              modules={modules} 
              projectId={id}
              teamMembers={teamMembers}
              assignedTeams={assignedTeams}
              onModulesChange={setModules}
              onEdit={handleEditModule}
              onDelete={handleDeleteModule}
              onCreateModule={handleCreateModule}
            />
          </div>
        </div>

        {/* Repository Information Section */}
        <div className={styles.repositorySection}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Repository Information</h3>
            <div className={styles.scrollableContent}>
              {project.repoHost && project.repoName ? (
                <div className={styles.repoGrid}>
                  <div className={styles.repoItem}>
                    <span className={styles.repoLabel}>Host:</span>
                    <span className={styles.repoValue}>
                      {project.repoHost === 'GITHUB' ? '🐙 GitHub' : '🔧 Bitbucket'}
                    </span>
                  </div>
                  <div className={styles.repoItem}>
                    <span className={styles.repoLabel}>Repository:</span>
                    <span className={styles.repoValue}>{project.repoName}</span>
                  </div>
                  <div className={styles.repoItem}>
                    <span className={styles.repoLabel}>Access Token:</span>
                    <span className={styles.repoValue}>
                      {project.repoAccessToken ? '🔒 Configured' : '❌ Not configured'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className={styles.unassigned}>
                  <div className={styles.unassignedIcon}>📂</div>
                  <span>No repository configured</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Repository Analytics Section */}
        {project.repoHost && project.repoName && (
          <div className={styles.analyticsSection}>
            {/* Commits per Contributor */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📊 Commits per Contributor</h3>
              <div className={styles.scrollableContent}>
                {analyticsLoading ? (
                  <div className={styles.unassigned}><span>Loading analytics…</span></div>
                ) : repoAnalytics.contributors.length > 0 ? (
                  <div className={styles.contributorsList}>
                    {repoAnalytics.contributors.map((c, idx) => {
                      const max = Math.max(...repoAnalytics.contributors.map(x => x.commitCount));
                      const pct = max > 0 ? Math.round((c.commitCount / max) * 100) : 0;
                      return (
                        <div key={c.username || idx} className={styles.contributorItem}>
                          <div className={styles.contributorInfo}>
                            <div className={styles.contributorAvatar}>👤</div>
                            <div className={styles.contributorDetails}>
                              <span className={styles.contributorName}>{c.displayName || c.username}</span>
                              <span className={styles.contributorRole}>{c.username}</span>
                            </div>
                          </div>
                          <div className={styles.contributorStats}>
                            <span className={styles.commitCount}>{c.commitCount} commits</span>
                            <div className={styles.commitBar}>
                              <div className={styles.commitBarFill} style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.unassigned}><span>No analytics available</span></div>
                )}
              </div>
            </div>

            {/* Last 5 Commits */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📝 Recent Commits</h3>
              <div className={styles.scrollableContent}>
                {analyticsLoading ? (
                  <div className={styles.unassigned}><span>Loading commits…</span></div>
                ) : repoAnalytics.recentCommits.length > 0 ? (
                  <>
                    <div className={styles.commitsList}>
                      {repoAnalytics.recentCommits.map((c, idx) => (
                        <div key={c.hash || idx} className={styles.commitItem}>
                          <div className={styles.commitHash}>#{c.hash}</div>
                          <div className={styles.commitDetails}>
                            <div className={styles.commitMessage}>{c.message}</div>
                            <div className={styles.commitMeta}>
                              <span className={styles.commitAuthor}>👤 {c.author}</span>
                              <span className={styles.commitDate}>{c.date ? new Date(c.date).toLocaleString() : ''}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={styles.unassigned}><span>No commits found</span></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ProjectForm
        project={project}
        onSubmit={handleEditSubmit}
        onCancel={() => setShowEditForm(false)}
        isOpen={showEditForm}
      />
      
      <ModuleForm
        module={editingModule}
        projectId={id}
        teamMembers={teamMembers}
        assignedTeams={assignedTeams}
        onSubmit={handleModuleSubmit}
        onCancel={() => {
          setShowModuleForm(false);
          setEditingModule(null);
        }}
        isOpen={showModuleForm}
      />

      <ModuleBulkImport
        projectId={id}
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onSuccess={handleBulkImportSuccess}
      />
    </div>
  );
};

export default ProjectProfile;
