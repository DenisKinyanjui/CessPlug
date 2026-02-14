import axiosInstance from '../utils/axiosInstance';

const getMyChamas = async () => {
  const response = await axiosInstance.get('/chamas/my-groups');
  // Handle response structure: { success: true, data: [...] } or just [...]
  if (response.data && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

const getChamaById = async (id: string) => {
  const response = await axiosInstance.get(`/chamas/${id}`);
  if (response.data && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

const checkChamaEligibility = async (id: string) => {
  const response = await axiosInstance.get(`/chamas/${id}/eligibility`);
  return response.data.data || response.data;
};

const chamaApi = {
  getMyChamas,
  getChamaById,
  checkChamaEligibility,
};

export default chamaApi;