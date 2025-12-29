import axiosInstance from '../axiosInstance';

/**
 * Register Staff (Operator Action)
 */
export const registerStaff = async (staffData) => {
  try {
    const response = await axiosInstance.post(
      '/registration/register',
      staffData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};
