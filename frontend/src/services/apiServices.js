import axiosInstance from './axiosConfig';

const apiServices = {
  // -------------------------
  // TEAMS
  // -------------------------
  getTeams: async () => {
    // const response = await axiosInstance.get('/teams');
    // return response.data;
  },
  
  createTeam: async (teamData) => {
    // const response = await axiosInstance.post('/teams', teamData);
    // return response.data;
  },

  // -------------------------
  // PROJECTS
  // -------------------------
  getProjects: async () => {
    // const response = await axiosInstance.get('/projects');
    // return response.data;
  },
  
  createProject: async (projectData) => {
    // const response = await axiosInstance.post('/projects', projectData);
    // return response.data;
  },

  // -------------------------
  // TASKS
  // -------------------------
  getTasks: async () => {
    // const response = await axiosInstance.get('/tasks');
    // return response.data;
  },
  
  createTask: async (taskData) => {
    // const response = await axiosInstance.post('/tasks', taskData);
    // return response.data;
  },
  
  updateTaskStatus: async (taskId, newStatus) => {
    // const response = await axiosInstance.patch(`/tasks/${taskId}`, { status: newStatus });
    // return response.data;
  }
};

export default apiServices;
