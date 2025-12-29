import axiosInstance from '../axiosInstance';

/**
 * Admin Login
 */
export const loginAdmin = async (username, password) => {
  try {
    const response = await axiosInstance.post(
      '/auth/login', // ✅ EXACT MATCH WITH BACKEND
      {
        username,
        password
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};
