import axiosInstance from '../axiosInstance';

export const authApi = {
  login: (formData) => {
    console.log('authApi.login payload:', formData);
    return axiosInstance.post('auth/login', formData).then(response => {
      console.log('authApi.login response:', response.data);
      return response;
    });
  },
  logout: () => {
    console.log('Sending logout request');
    return axiosInstance.get('auth/logout').then(response => {
      console.log('authApi.logout response:', response.data);
      return response;
    });
  },
  checkAuth: () => {
    console.log('Sending checkAuth request');
    return axiosInstance.get('auth/check-auth').then(response => {
      console.log('authApi.checkAuth response:', response.data);
      return response;
    });
  },
  register: (formData) => {
    console.log('authApi.register payload:', formData);
    return axiosInstance.post('auth/register', formData).then(response => {
      console.log('authApi.register response:', response.data);
      return response;
    });
  },
  getUsers: () => {
    console.log('Fetching users');
    return axiosInstance.get('users/').then(response => {
      console.log('authApi.getUsers response:', response.data);
      return response;
    });
  },
  sendInterest: (receiverId) => {
    console.log('Sending interest to:', receiverId);
    return axiosInstance.post('interests/', { receiver_id: receiverId }).then(response => {
      console.log('authApi.sendInterest response:', response.data);
      return response;
    });
  },
  getReceivedInterests: () => {
    console.log('Fetching received interests');
    return axiosInstance.get('interests/').then(response => {
      console.log('authApi.getReceivedInterests response:', response.data);
      return response;
    });
  },
  getSentInterests: () => {
    console.log('Fetching sent interests');
    return axiosInstance.get('interests/?type=sent').then(response => {
      console.log('authApi.getSentInterests response:', response.data);
      return response;
    });
  },
  updateInterest: (id, action) => {
    console.log(`Updating interest ${id} with action: ${action}`);
    return axiosInstance.patch(`interests/${id}/`, { action }).then(response => {
      console.log('authApi.updateInterest response:', response.data);
      return response;
    });
  },
  getConnectedUsers: () => {
    console.log('Fetching connected users');
    return axiosInstance.get('connected-users/').then(response => {
        console.log('authApi.getConnectedUsers response:', response.data);
        return response;
    });
  },
  getMessageHistory: (userId) => {
    console.log(`Fetching message history with user ${userId}`);
    return axiosInstance.get(`messages/${userId}/`).then(response => {
        console.log('authApi.getMessageHistory response:', response.data);
        return response;
    });
  },
};