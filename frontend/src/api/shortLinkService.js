import api from './api';

const createShortLink = async (linkData) => {
    const response = await api.post('/admin/short-links', linkData);
    return response.data;
};

const getAllShortLinks = async () => {
    const response = await api.get('/admin/short-links');
    return response.data;
};

const updateShortLink = async (id, linkData) => {
    const response = await api.put(`/admin/short-links/${id}`, linkData);
    return response.data;
};

const deleteShortLink = async (id) => {
    const response = await api.delete(`/admin/short-links/${id}`);
    return response.data;
};

const shortLinkService = {
    createShortLink,
    getAllShortLinks,
    updateShortLink,
    deleteShortLink,
};

export default shortLinkService;
