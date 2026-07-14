import axiosInstance from "./axiosConfig";

const userapiservicer = {
    getMyTasks: async (params = {}) => {
        const { status, priority, page, limit } = params;
        const response = await axiosInstance.get('/user/my-tasks', {
            params: {
                ...(status && { status }),
                ...(priority && { priority }),
                ...(page && { page }),
                ...(limit && { limit }),
            },
        });
        return response.data;
    },

    postDependency: async (payload) => {
        const response = await axiosInstance.post('/user/dependency', payload);
        return response.data;
    },

    getDependencies: async (params = {}) => {
        const { projectName, dependencyName, page, limit } = params;
        const response = await axiosInstance.get('/user/dependency', {
            params: {
                ...(projectName && { projectName }),
                ...(dependencyName && { dependencyName }),
                ...(page && { page }),
                ...(limit && { limit }),
            },
        });
        return response.data;
    },

    deleteDependency: async (id) => {
        const response = await axiosInstance.delete(`/user/dependency/${id}`);
        return response.data;
    },

    updateDependency: async (id, payload) => {
        const response = await axiosInstance.put(`/user/dependency/${id}`, payload);
        return response.data;
    },

    getProjects: async () => {
        const response = await axiosInstance.get('/projects');
        return response.data;
    },

    // Scrum / Daily Standup API calls

    createScrum: async (payload) => {
        const response = await axiosInstance.post('/user/scrum', payload);
        return response.data;
    },

    getMyScrums: async (params = {}) => {
        const { page, limit } = params;
        const response = await axiosInstance.get('/user/scrum', {
            params: {
                ...(page && { page }),
                ...(limit && { limit }),
            },
        });
        return response.data;
    },

    getScrumById: async (id) => {
        const response = await axiosInstance.get(`/user/scrum/${id}`);
        return response.data;
    },

    updateScrum: async (id, payload) => {
        const response = await axiosInstance.put(`/user/scrum/${id}`, payload);
        return response.data;
    },

    deleteScrum: async (id) => {
        const response = await axiosInstance.delete(`/user/scrum/${id}`);
        return response.data;
    },

    getProjects: async () => {
        const response = await axiosInstance.get('/user/projects');
        return response.data;
    },

    updateTaskStatus: async (id, status) => {
        const response = await axiosInstance.patch(`/user/my-tasks/status/${id}`, { status });
        return response.data;
    },


    getMyScrums: async (params = {}) => {
        const response = await axiosInstance.get('/user/scrum', { params });
        return response.data;
    },

    getBlockedTasks: async (params = {}) => {
        const response = await axiosInstance.get('/user/blocked-tasks', { params });
        return response.data;
    },
   updateBlockerReason: async (id, payload) => {
        const response = await axiosInstance.put(`/user/blocked-tasks/reason/${id}`, payload);
        return response.data;
    },
    
    getMyBlockers: async () => {
        const response = await axiosInstance.get('/user/my-blockers');
        return response.data;
    },

    getMyDepartmentMembers: async () => {
        const response = await axiosInstance.get('/user/my-department-members');
        return response.data;
    },
    // Profile
    getMyProfile: async () => {
        const response = await axiosInstance.get('/auth/profile');
        return response.data;
    },


};

export default userapiservicer;