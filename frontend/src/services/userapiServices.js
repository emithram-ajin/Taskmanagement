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

    getProjects: async () => {
        const response = await axiosInstance.get('/projects');
        return response.data;
    },
};

export default userapiservicer;