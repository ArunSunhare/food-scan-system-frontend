import axiosInstance from '../axiosInstance';

export const loginOperator = async (username, password) => {
  try {
    const res = await axiosInstance.post('/auth/login', {
      username,
      password
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Server error' };
  }
};
