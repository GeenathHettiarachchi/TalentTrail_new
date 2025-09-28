import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication service
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  googleLogin: (idToken) => api.post('/auth/google-login', { idToken }),
  validateToken: (token) => api.get('/auth/validate', {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export const internService = {
  // GET all interns
  getAllInterns: () => api.get('/interns'),
  
  // GET intern by ID
  getInternById: (id) => api.get(`/interns/${id}`),
  
  // GET intern by intern code
  getInternByCode: (internCode) => api.get(`/interns/code/${internCode}`),
  
  // POST create new intern
  createIntern: (internData) => api.post('/interns', internData),
  
  // PUT update intern
  updateIntern: (id, internData) => api.put(`/interns/${id}`, internData),
  
  // DELETE intern
  deleteIntern: (id) => api.delete(`/interns/${id}`),
};

export const teamService = {
  // GET all teams
  getAllTeams: () => api.get('/teams'),
  
  // GET team by ID
  getTeamById: (id) => api.get(`/teams/${id}`),
  
  // POST create new team
  createTeam: (teamData) => api.post('/teams', teamData),
  
  // PUT update team
  updateTeam: (id, teamData) => api.put(`/teams/${id}`, teamData),
  
  // DELETE team
  deleteTeam: (id) => api.delete(`/teams/${id}`),
};

export const teamMemberService = {
  // GET all team members
  getAllTeamMembers: () => api.get('/team-members'),
  
  // GET team member by ID
  getTeamMemberById: (id) => api.get(`/team-members/${id}`),
  
  // GET team members by intern ID
  getTeamMembersByInternId: (internId) => api.get(`/team-members?internId=${internId}`),
  
  // POST assign intern to team
  assignInternToTeam: (teamId, internId) => api.post(`/team-members?teamId=${teamId}&internId=${internId}`),
  
  // DELETE remove team member
  removeTeamMember: (id) => api.delete(`/team-members/${id}`),
};

export const projectService = {
  // GET all projects
  getAllProjects: () => api.get('/projects'),
  
  // GET project by ID
  getProjectById: (id) => api.get(`/projects/${id}`),
  
  // GET projects by team ID
  getProjectsByTeamId: (teamId) => api.get(`/projects?teamId=${teamId}`),
  
  // POST create new project
  createProject: (projectData) => api.post('/projects', projectData),
  
  // PUT update project
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  
  // DELETE project
  deleteProject: (id) => api.delete(`/projects/${id}`),

  // GET repo analytics for a project
  getRepoAnalytics: (projectId) => api.get(`/projects/${projectId}/repo-analytics`),
};

export const bulkImportService = {
  // POST upload bulk data CSV or Excel
  uploadBulkData: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/bulk-import/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // GET export current data as CSV
  exportDataAsCSV: () => api.get('/bulk-import/export', {
    responseType: 'blob',
  }),

  // GET export current data as Excel
  exportDataAsExcel: () => api.get('/bulk-import/export/excel', {
    responseType: 'blob',
  }),
};

export const statsService = {
  // GET dashboard stats
  getDashboardStats: () => api.get('/stats/dashboard'),
  
  // GET active interns count
  getActiveInternsCount: () => api.get('/stats/active-interns'),
  
  // GET pending repository info count
  getPendingRepositoryInfoCount: () => api.get('/stats/pending-repository-info'),
};

export const moduleService = {
  // GET all modules
  getAllModules: () => api.get('/modules'),
  
  // GET modules by project ID
  getModulesByProjectId: (projectId) => api.get(`/modules/project/${projectId}`),
  
  // GET module by ID
  getModuleById: (id) => api.get(`/modules/${id}`),
  
  // POST create new module
  createModule: (moduleData) => api.post('/modules', moduleData),
  
  // PUT update module
  updateModule: (id, moduleData) => api.put(`/modules/${id}`, moduleData),
  
  // DELETE module
  deleteModule: (id) => api.delete(`/modules/${id}`),
};

export const functionService = {
  // GET all functions
  getAllFunctions: () => api.get('/functions'),
  
  // GET functions by module ID
  getFunctionsByModuleId: (moduleId) => api.get(`/functions/module/${moduleId}`),
  
  // GET function by ID
  getFunctionById: (id) => api.get(`/functions/${id}`),
  
  // POST create new function
  createFunction: (functionData) => api.post('/functions', functionData),
  
  // PUT update function
  updateFunction: (id, functionData) => api.put(`/functions/${id}`, functionData),
  
  // DELETE function
  deleteFunction: (id) => api.delete(`/functions/${id}`),
};

export const testCaseService = {
  // GET all test cases
  getAllTestCases: () => api.get('/test-cases'),
  
  // GET test cases by function ID
  getTestCasesByFunctionId: (functionId) => api.get(`/test-cases/function/${functionId}`),
  
  // GET test case by ID
  getTestCaseById: (id) => api.get(`/test-cases/${id}`),
  
  // POST create new test case
  createTestCase: (testCaseData) => api.post('/test-cases', testCaseData),
  
  // PUT update test case
  updateTestCase: (id, testCaseData) => api.put(`/test-cases/${id}`, testCaseData),
  
  // DELETE test case
  deleteTestCase: (id) => api.delete(`/test-cases/${id}`),
};

export const projectTeamService = {
  // GET all project-team assignments
  getAllProjectTeams: () => api.get('/project-teams'),
  
  // GET teams assigned to a project
  getTeamsByProjectId: (projectId) => api.get(`/project-teams/project/${projectId}`),
  
  // GET projects assigned to a team
  getProjectsByTeamId: (teamId) => api.get(`/project-teams/team/${teamId}`),
  
  // POST assign team to project
  assignTeamToProject: (projectId, teamId) => api.post(`/project-teams?projectId=${projectId}&teamId=${teamId}`),
  
  // DELETE remove team from project (by assignment ID)
  removeTeamFromProject: (assignmentId) => api.delete(`/project-teams/${assignmentId}`),
  
  // DELETE remove specific team from project
  removeSpecificTeamFromProject: (projectId, teamId) => api.delete(`/project-teams/project/${projectId}/team/${teamId}`),
};

export const moduleImportService = {
  // POST import modules and functions for a project
  importModulesAndFunctions: (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(`/modules/import/${projectId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // GET export modules and functions as CSV
  exportModulesAndFunctionsCsv: (projectId) => {
    return api.get(`/modules/export/csv/${projectId}`, {
      responseType: 'blob',
    });
  },
  
  // GET export modules and functions as Excel
  exportModulesAndFunctionsExcel: (projectId) => {
    return api.get(`/modules/export/excel/${projectId}`, {
      responseType: 'blob',
    });
  },
  
  // GET download CSV template
  downloadCsvTemplate: () => {
    return api.get('/modules/template/csv', {
      responseType: 'blob',
    });
  },
};

export const projectDocService = {
  // GET all documents for a project
  getProjectDocuments: (projectId) => api.get(`/projects/${projectId}/documents`),
  
  // GET specific document for a project
  getProjectDocument: (projectId, docType) => api.get(`/projects/${projectId}/documents/${docType}`),
  
  // POST upload document
  uploadDocument: (projectId, docType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(`/projects/${projectId}/documents/${docType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // DELETE document
  deleteDocument: (projectId, docType) => api.delete(`/projects/${projectId}/documents/${docType}`),
  
  // GET download document
  downloadDocument: (projectId, documentId) => api.get(`/projects/${projectId}/documents/download/${documentId}`, {
    responseType: 'blob',
  }),
};

export default api;
