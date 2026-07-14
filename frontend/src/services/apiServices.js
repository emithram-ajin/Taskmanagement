import axiosInstance from './axiosConfig';

const apiServices = {
  // -------------------------
  // TEAMS
  // -------------------------
  getTeams: async () => {
    const response = await axiosInstance.get('/admin/teams');
    return response.data;
  },

  createTeam: async (teamData) => {
    const response = await axiosInstance.post('/admin/team', teamData);
    return response.data;
  },

  updateTeam: async (teamId, teamData) => {
    const response = await axiosInstance.put(`/admin/team/${teamId}`, teamData);
    return response.data;
  },

  deleteTeam: async (teamId) => {
    const response = await axiosInstance.delete(`/admin/team/${teamId}`);
    return response.data;
  },
  loginUser: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  registerUser: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },
  
  getAllMembers: async (department = "") => {
    const url = department ? `/admin/members?department=${department}` : '/admin/members';
    const response = await axiosInstance.get(url);
    return response.data;
  },

  deleteMember: async (userId) => {
    const response = await axiosInstance.delete(`/auth/${userId}`);
    return response.data;
  },

  getAdminDependencies: async (params = {}) => {
    const response = await axiosInstance.get('/admin/dependencies', { params });
    return response.data;
  },

  getAdminScrums: async () => {
    const response = await axiosInstance.get('/admin/scrums?limit=1000');
    return response.data.scrums || response.data;
  },

  // -------------------------
  // PROJECTS
  // -------------------------
  getProjects: async () => {
    const response = await axiosInstance.get('/projects');
    return response.data;
  },

  getProjectProgress: async (projectId) => {
    const response = await axiosInstance.get(`/projects/progress/${projectId}`);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await axiosInstance.post('/projects', projectData);
    return response.data;
  },

  updateProject: async (projectId, projectData) => {
    const response = await axiosInstance.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  deleteProject: async (projectId) => {
    const response = await axiosInstance.delete(`/projects/${projectId}`);
    return response.data;
  },

  // -------------------------
  // TASKS
  // -------------------------
  getTasks: async (params = {}) => {
    const response = await axiosInstance.get('/tasks', { params });
    return response.data;
  },

  getAdminBlockedTasks: async (params = {}) => {
    const response = await axiosInstance.get('/admin/blocked-tasks', { params });
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await axiosInstance.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await axiosInstance.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await axiosInstance.delete(`/tasks/${taskId}`);
    return response.data;
  },

  updateTaskStatus: async (taskId, newStatus) => {
    const response = await axiosInstance.put(`/tasks/${taskId}`, { status: newStatus });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/dashboard-stats');
    return response.data;
  },

  getDepartments: async () => {
    const response = await axiosInstance.get('/auth/departments');
    return response.data;
  },

  adminLoginAs: async (userId) => {
    const response = await axiosInstance.post(`/admin/login-as/${userId}`);
    return response.data;
  }
};

export default apiServices;
