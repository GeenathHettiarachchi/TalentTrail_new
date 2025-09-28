import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBasedAccess } from '../../components';
import { bulkImportService, internService, teamService, projectService, teamMemberService, statsService } from '../../services/api';
import styles from './Home.module.css';
import { FaUser, FaUserCheck, FaUserGroup, FaUserXmark, FaCircleCheck, FaFolder, FaFolderOpen, FaTriangleExclamation } from "react-icons/fa6";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [stats, setStats] = useState({
    totalInterns: 0,
    activeInterns: 0,
    unassignedInterns: 0,
    totalTeams: 0,
    totalProjects: 0,
    ongoingProjects: 0,
    completedProjects: 0,
    pendingRepositoryInfo: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      
      // Fetch all data in parallel
      const [internsResponse, teamsResponse, projectsResponse, teamMembersResponse, dashboardStatsResponse] = await Promise.all([
        internService.getAllInterns(),
        teamService.getAllTeams(),
        projectService.getAllProjects(),
        teamMemberService.getAllTeamMembers(),
        statsService.getDashboardStats()
      ]);

      const interns = internsResponse.data;
      const teams = teamsResponse.data;
      const projects = projectsResponse.data;
      const teamMembers = teamMembersResponse.data;
      const dashboardStats = dashboardStatsResponse.data;

      // Calculate assigned interns
      const assignedInternIds = new Set(teamMembers.map(member => member.internId).filter(id => id));
      const unassignedInterns = interns.filter(intern => !assignedInternIds.has(intern.internId));

      // Calculate project statuses
      const ongoingProjects = projects.filter(project => 
        project.status === 'IN_PROGRESS' || project.status === 'PLANNED'
      );
      const completedProjects = projects.filter(project => 
        project.status === 'COMPLETED'
      );

      setStats({
        totalInterns: interns.length,
        activeInterns: dashboardStats.activeInterns || 0,
        unassignedInterns: unassignedInterns.length,
        totalTeams: teams.length,
        totalProjects: projects.length,
        ongoingProjects: ongoingProjects.length,
        completedProjects: completedProjects.length,
        pendingRepositoryInfo: dashboardStats.pendingRepositoryInfo || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleAddBulkData = () => {
    navigate('/add-bulk-data');
  };

  const handleExportData = () => {
    setShowExportModal(true);
  };

  const exportData = async (format) => {
    try {
      setIsExporting(true);
      setShowExportModal(false);
      
      let response;
      let fileExtension;
      let mimeType;
      
      if (format === 'excel') {
        response = await bulkImportService.exportDataAsExcel();
        fileExtension = 'xlsx';
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else {
        response = await bulkImportService.exportDataAsCSV();
        fileExtension = 'csv';
        mimeType = 'text/csv';
      }
      
      // Create blob URL and download
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      link.download = `intern-data-export-${dateStr}.${fileExtension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Welcome to TalentTrail</h1>
          <p className={styles.subtitle}>
            Track & manage interns, teams, and projects with ease and clarity!
          </p>
          <div className={styles.actionButtons}>
            <button 
              className={styles.bulkDataBtn}
              onClick={handleAddBulkData}
            >
              Import Data
            </button>
            <button 
              className={styles.exportBtn}
              onClick={handleExportData}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statsContainer}>
          <h2 className={styles.statsTitle}>Dashboard Overview</h2>
          <div className={styles.statsSubtitle}>
            Get a quick snapshot of key metrics including intern status, team distribution, and project progress — all updated in real time.
          </div>
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.totalInterns}`}>
              <div className={styles.statIcon}>
                <FaUser />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {loadingStats ? '...' : stats.totalInterns}
                </div>
                <div className={styles.statLabel}>Total Interns</div>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.activeInterns}`}>
              <div className={styles.statIcon}>
                <FaUserCheck />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {loadingStats ? '...' : stats.activeInterns}
                </div>
                <div className={styles.statLabel}>Active Interns</div>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.unassignedInterns}`}>
              <div className={styles.statIcon}>
                <FaUserXmark />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {loadingStats ? '...' : stats.unassignedInterns}
                </div>
                <div className={styles.statLabel}>Unassigned Interns</div>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.totalTeams}`}>
              <div className={styles.statIcon}>
                <FaUserGroup />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {loadingStats ? '...' : stats.totalTeams}
                </div>
                <div className={styles.statLabel}>Total Teams</div>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.totalProjects}`}>
              <div className={styles.statIcon}>
                <FaFolder />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {loadingStats ? '...' : stats.totalProjects}
                </div>
                <div className={styles.statLabel}>Total Projects</div>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.ongoingProjects}`}>
              <div className={styles.statIcon}>
                <FaFolderOpen />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {loadingStats ? '...' : stats.ongoingProjects}
                </div>
                <div className={styles.statLabel}>Ongoing Projects</div>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.completedProjects}`}>
              <div className={styles.statIcon}>
                <FaCircleCheck />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {loadingStats ? '...' : stats.completedProjects}
                </div>
                <div className={styles.statLabel}>Completed Projects</div>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.pendingRepositoryInfo}`}>
              <div className={styles.statIcon}>
                <FaTriangleExclamation />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {loadingStats ? '...' : stats.pendingRepositoryInfo}
                </div>
                <div className={styles.statLabel}>Pending Repository Info</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>👥</div>
            <h3 className={styles.featureTitle}>Manage Interns</h3>
            <p className={styles.featureDescription}>
              Keep track of intern information, training periods, and progress
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🏢</div>
            <h3 className={styles.featureTitle}>Organize Teams</h3>
            <p className={styles.featureDescription}>
              Create and manage teams with designated leaders and members
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📋</div>
            <h3 className={styles.featureTitle}>Track Projects</h3>
            <p className={styles.featureDescription}>
              Monitor project progress, assign teams, and track deliverables
            </p>
          </div>
        </div>
      </div>

      {/* Export Format Selection Modal */}
      {showExportModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Choose Export Format</h3>
              <button 
                className={styles.modalClose}
                onClick={() => setShowExportModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <p>Select the format for your data export:</p>
              <div className={styles.exportOptions}>
                <button 
                  className={styles.exportOption}
                  onClick={() => exportData('csv')}
                  disabled={isExporting}
                >
                  <div className={styles.exportIcon}>📄</div>
                  <div>
                    <strong>CSV File</strong>
                    <br />
                    <span>Compatible with Excel, Google Sheets</span>
                  </div>
                </button>
                <button 
                  className={styles.exportOption}
                  onClick={() => exportData('excel')}
                  disabled={isExporting}
                >
                  <div className={styles.exportIcon}>📊</div>
                  <div>
                    <strong>Excel File</strong>
                    <br />
                    <span>Native Excel format with formatting</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
