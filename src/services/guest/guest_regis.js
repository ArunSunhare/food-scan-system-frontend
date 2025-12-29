import axiosInstance from '../axiosInstance';

/**
 * Register Guest (Operator Action)
 */
export const registerGuest = async (formData) => {
  try {
    const response = await axiosInstance.post(
      '/registration/register',
      formData,
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
