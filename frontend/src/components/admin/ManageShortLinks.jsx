import React, { useState, useEffect } from 'react';
import shortLinkService from '../../api/shortLinkService';
import { toast } from 'react-toastify';
import { FaTrash, FaEdit, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';

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

    return (
        <div className="p-4 md:p-6 bg-white shadow-xl rounded-xl">
            <h2 className="text-2xl font-bold font-heading mb-6 text-gray-800 border-b pb-2">Manage Short Links</h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Slug (e.g., is-live)</label>
                        <div className="flex items-center">
                            <span className="bg-gray-200 px-3 py-2 rounded-l-md text-gray-600 border border-r-0 border-gray-300">/</span>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="my-link"
                                className="w-full px-4 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-gray-700 font-medium mb-1">Description (Optional)</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Link for live stream..."
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="mt-6 flex justify-end">
                    {isEditing && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setFormData({ slug: '', targetUrl: '', description: '' });
                            }}
                            className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-all shadow-md hover:shadow-lg"
                    >
                        {isEditing ? 'Update Link' : 'Create Link'}
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                        <tr>
                            <th className="py-3 px-6 text-left">Slug</th>
                            <th className="py-3 px-6 text-left">Target URL</th>
                            <th className="py-3 px-6 text-center">Clicks</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-6">Loading...</td>
                            </tr>
                        ) : links.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-6">No custom links created yet.</td>
                            </tr>
                        ) : (
                            links.map((link) => (
                                <tr key={link._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-6 text-left whitespace-nowrap font-medium text-primaryDark">
                                        <div className="flex items-center space-x-2">
                                            <span>/{link.slug}</span>
                                            <button
                                                onClick={() => copyToClipboard(link.slug)}
                                                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                                title="Copy Link"
                                            >
                                                <FaCopy />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-3 px-6 text-left">
                                        <div className="flex items-center space-x-2 max-w-xs truncate">
                                            <span className="truncate" title={link.targetUrl}>{link.targetUrl}</span>
                                            <a
                                                href={link.targetUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-primary"
                                            >
                                                <FaExternalLinkAlt size={12} />
                                            </a>
                                        </div>
                                        {link.description && <div className="text-xs text-gray-400 mt-1">{link.description}</div>}
                                    </td>
                                    <td className="py-3 px-6 text-center bg-gray-50 font-bold">
                                        {link.clicks}
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <div className="flex item-center justify-center">
                                            <button
                                                onClick={() => handleEdit(link)}
                                                className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 mr-2 transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(link._id)}
                                                className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageShortLinks;
