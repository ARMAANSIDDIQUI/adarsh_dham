import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import shortLinkService from '../../api/shortLinkService';
import { toast } from 'react-toastify';
import { FaTrashAlt, FaEdit, FaCopy, FaExternalLinkAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import Button from '../common/Button';

const ManageShortLinks = () => {
    const [links, setLinks] = useState([]);
    const [formData, setFormData] = useState({
        slug: '',
        targetUrl: '',
        description: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        setLoading(true);
        try {
            const data = await shortLinkService.getAllShortLinks();
            setLinks(data);
        } catch (error) {
            console.error('Error fetching links:', error);
            toast.error('Failed to load short links.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await shortLinkService.updateShortLink(currentId, formData);
                toast.success('Link updated successfully!');
            } else {
                await shortLinkService.createShortLink(formData);
                toast.success('Link created successfully!');
            }
            setFormData({ slug: '', targetUrl: '', description: '' });
            setIsEditing(false);
            setCurrentId(null);
            fetchLinks();
        } catch (error) {
            console.error('Error saving link:', error);
            toast.error(error.response?.data?.message || 'Failed to save link.');
        }
    };

    const handleEdit = (link) => {
        setFormData({
            slug: link.slug,
            targetUrl: link.targetUrl,
            description: link.description || '',
        });
        setIsEditing(true);
        setCurrentId(link._id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this link?')) {
            try {
                await shortLinkService.deleteShortLink(id);
                toast.success('Link deleted successfully!');
                fetchLinks();
            } catch (error) {
                console.error('Error deleting link:', error);
                toast.error('Failed to delete link.');
            }
        }
    };

    const copyToClipboard = (slug) => {
        const fullUrl = `${window.location.origin}/${slug}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success('Link copied to clipboard!');
    };

    if (loading) return <div className="text-center mt-10 text-xl text-primary font-body"><FaSpinner className="animate-spin inline mr-2" /> Loading Links...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-neutral min-h-screen font-body">
            <h2 className="text-3xl md:text-4xl font-bold text-primaryDark font-heading mb-6 border-b-2 border-primary pb-2">Manage Short Links</h2>

            {/* Form */}
            <div className="bg-card p-6 rounded-2xl shadow-soft mb-8">
                <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4">{isEditing ? 'Edit Short Link' : 'Add New Short Link'}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Slug (e.g., is-live)</label>
                        <div className="flex items-center">
                            <span className="bg-gray-200 px-3 py-2 rounded-l-lg text-gray-600 border border-gray-300 border-r-0">/</span>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="my-link"
                                className="w-full px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-pink-300 focus:border-pink-500"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Target URL</label>
                        <input
                            type="url"
                            name="targetUrl"
                            value={formData.targetUrl}
                            onChange={handleChange}
                            placeholder="https://example.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 font-medium mb-1">Description (Optional)</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Link for live stream..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500"
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-3 pt-2">
                        {isEditing && (
                            <Button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({ slug: '', targetUrl: '', description: '' });
                                }}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-md transition-colors"
                        >
                            {isEditing ? <><FaEdit className="inline mr-2" /> Update Link</> : <><FaPlus className="inline mr-2" /> Create Link</>}
                        </Button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-card shadow-soft rounded-2xl overflow-x-auto mb-6">
                <h3 className="text-xl font-semibold font-heading p-4 text-primaryDark border-b border-background">Existing Links</h3>
                <table className="min-w-full divide-y divide-background">
                    <thead className="bg-background/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase tracking-wider">Slug</th>
                            <th className="px-4 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase tracking-wider">Target URL</th>
                            <th className="px-4 py-3 text-center text-xs font-medium font-heading text-primaryDark uppercase tracking-wider">Clicks</th>
                            <th className="px-4 py-3 text-center text-xs font-medium font-heading text-primaryDark uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-background">
                        {links.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-6 text-gray-500">No custom links created yet.</td>
                            </tr>
                        ) : (
                            links.map((link) => (
                                <tr key={link._id} className="hover:bg-background transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primaryDark">
                                        <div className="flex items-center space-x-2">
                                            <span>/{link.slug}</span>
                                            <button
                                                onClick={() => copyToClipboard(link.slug)}
                                                className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                                title="Copy Link"
                                            >
                                                <FaCopy />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2 max-w-xs md:max-w-md">
                                            <span className="truncate block" title={link.targetUrl}>{link.targetUrl}</span>
                                            <a
                                                href={link.targetUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-primary flex-shrink-0"
                                            >
                                                <FaExternalLinkAlt size={12} />
                                            </a>
                                        </div>
                                        {link.description && <div className="text-xs text-gray-400 mt-1">{link.description}</div>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-bold text-gray-700">
                                        {link.clicks}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button
                                                onClick={() => handleEdit(link)}
                                                className="text-pink-500 hover:text-pink-700 transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(link._id)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrashAlt size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default ManageShortLinks;
