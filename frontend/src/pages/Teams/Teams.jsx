import React, { useState, useEffect } from 'react';
import { TeamForm, TeamTable } from '../../components';
import { teamService, teamMemberService, projectService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Teams.module.css';

const Teams = () => {
  const { isAdmin } = useAuth();
  const [teams, setTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortOption, setSortOption] = useState('none');
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter teams based on search term and status
  useEffect(() => {
    let filtered = teams;

    // Filter by search term (team name or team member names)
    if (searchTerm.trim()) {
      filtered = filtered.filter(team => {
        const teamNameMatch = team.teamName.toLowerCase().includes(searchTerm.toLowerCase());
        const leaderNameMatch = team.teamLeaderName.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Check if any team member names match
        const teamMembersList = teamMembers
          .filter(member => member.teamId === team.teamId)
          .map(member => member.internName.toLowerCase());
        const memberNameMatch = teamMembersList.some(name => 
          name.includes(searchTerm.toLowerCase())
        );

        return teamNameMatch || leaderNameMatch || memberNameMatch;
      });
    }

    // Filter by status (for future implementation - currently not used)
    if (filterStatus) {
      // This could be implemented based on team status field if added to backend
      // filtered = filtered.filter(team => team.status === filterStatus);
    }

    // Sorting
  const [sortField, sortOrder] = (sortOption || 'none').split(':');
  if (sortField !== 'none') {
      const withCounts = filtered.map(team => ({
        team,
        count: teamMembers.filter(m => m.teamId === team.teamId).length,
      }));
      withCounts.sort((a, b) => {
        let cmp = 0;
        if (sortField === 'name') {
          cmp = a.team.teamName.localeCompare(b.team.teamName, undefined, { sensitivity: 'base' });
        } else if (sortField === 'memberCount') {
          cmp = a.count - b.count;
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });
      filtered = withCounts.map(x => x.team);
    }

    setFilteredTeams(filtered);
  }, [teams, teamMembers, searchTerm, filterStatus, sortOption]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch teams and team members in parallel
      const [teamsResponse, membersResponse, projectsResponse] = await Promise.all([
        teamService.getAllTeams(),
        teamMemberService.getAllTeamMembers(),
        projectService.getAllProjects()
      ]);
      
      setTeams(teamsResponse.data);
      setTeamMembers(membersResponse.data);
      setProjects(projectsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load teams. Please check if the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setIsTeamFormOpen(true);
  };

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setIsTeamFormOpen(true);
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      setError('');
      await teamService.deleteTeam(teamId);
      setTeams(prev => prev.filter(team => team.teamId !== teamId));
      // Also remove associated team members from local state
      setTeamMembers(prev => prev.filter(member => member.teamId !== teamId));
    } catch (err) {
      console.error('Error deleting team:', err);
      setError('Failed to delete team. Please try again.');
    }
  };

  // Members are now managed within TeamForm during edit

  const handleTeamFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      if (selectedTeam) {
        // Update existing team
        const response = await teamService.updateTeam(selectedTeam.teamId, formData);
        setTeams(prev => 
          prev.map(team => 
            team.teamId === selectedTeam.teamId ? response.data : team
          )
        );
      } else {
        // Create new team
        const response = await teamService.createTeam(formData);
        setTeams(prev => [...prev, response.data]);
      }
      
      setIsTeamFormOpen(false);
      setSelectedTeam(null);
    } catch (err) {
      console.error('Error saving team:', err);
      setError(
        err.response?.data?.message || 
        `Failed to ${selectedTeam ? 'update' : 'create'} team. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeamFormClose = () => {
    setIsTeamFormOpen(false);
    setSelectedTeam(null);
  };

  const handleMembersUpdated = async () => {
    try {
      const response = await teamMemberService.getAllTeamMembers();
      setTeamMembers(response.data);
    } catch (err) {
      console.error('Error refreshing team members:', err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Teams Management</h1>
        <p className={styles.subtitle}>
          Create and manage teams, assign team leaders, and track team performance
        </p>
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

        <div className={styles.actionSection}>
          {isAdmin && (
            <button 
              className={styles.primaryBtn}
              onClick={handleCreateTeam}
            >
              + Create New Team
            </button>
          )}
          <div className={styles.filterSection}>
            <select 
              className={styles.filterSelect}
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="">All Teams</option>
              <option value="active">Active Teams</option>
              <option value="inactive">Inactive Teams</option>
            </select>
            <input 
              type="text" 
              placeholder="Search teams, leaders, or members..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <select
              className={styles.filterSelect}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              title="Sort by"
            >
              <option value="none">None</option>
              <option value="name:asc">Team Name (Ascending)</option>
              <option value="name:desc">Team Name (Descending)</option>
              <option value="memberCount:asc">Member Count (Ascending)</option>
              <option value="memberCount:desc">Member Count (Descending)</option>
            </select>
          </div>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>
              All Teams ({filteredTeams.length})
            </h3>
            {searchTerm && (
              <p className={styles.searchInfo}>
                Showing results for "{searchTerm}"
                <button 
                  className={styles.clearSearch}
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </button>
              </p>
            )}
          </div>
          
          <TeamTable
            teams={filteredTeams}
            teamMembers={teamMembers}
            projects={projects}
            onEdit={handleEditTeam}
            onDelete={handleDeleteTeam}
            isLoading={isLoading}
          />
        </div>
      </div>

      {isAdmin && (
        <TeamForm
          isOpen={isTeamFormOpen}
          onClose={handleTeamFormClose}
          onSubmit={handleTeamFormSubmit}
          team={selectedTeam}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default Teams;
