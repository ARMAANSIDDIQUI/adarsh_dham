import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api.js'; 
import Button from '../common/Button.jsx';
import { FaEdit, FaTrashAlt, FaPlus, FaSpinner, FaLink, FaClock, FaYoutube } from 'react-icons/fa';

// Helper function to format ISO dates for datetime-local input
const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Extracts the URL from an iframe's src attribute.
 * @param {string} inputString - The iframe HTML string or a regular URL.
 * @returns {string} The extracted URL or the original string if no iframe is found.
 */
const extractSrcFromIframe = (inputString) => {
    // If the input doesn't look like an iframe tag, return it as is.
    if (!inputString || !inputString.trim().startsWith('<iframe')) {
        return inputString;
    }
    
    const srcRegex = /src="([^"]+)"/;
    const match = inputString.match(srcRegex);
    
    // Return the captured group (the URL) if found, otherwise return an empty string
    // indicating a failed extraction from an iframe tag.
    return match && match[1] ? match[1] : '';
};


// Custom Modal Component for Delete Confirmation and Alerts
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, isAlert = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-[1000]">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm m-4 transform transition-all"
            >
                <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    {!isAlert && (
                        <Button 
                            onClick={onCancel} 
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium transition-colors"
                        >
                            Cancel
                        </Button>
                    )}
                    <Button 
                        onClick={onConfirm} 
                        className={`font-medium transition-colors 
                            ${isAlert ? 'bg-pink-500 hover:bg-pink-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                    >
                        {confirmText}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

const ManageSatsang = () => {
    const [liveLinks, setLiveLinks] = useState([]);
    const [newLink, setNewLink] = useState({ name: '', url: '', youtubeEmbedUrl: '', liveFrom: '', liveTo: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingLink, setEditingLink] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ 
        title: '', 
        message: '', 
        onConfirm: () => {}, 
        onCancel: () => {}, 
        confirmText: '', 
        isAlert: false,
    });

    const fetchLiveLinks = async () => {
        try {
            const linksRes = await api.get('/satsang/live-links');
            setLiveLinks(linksRes.data || []);
        } catch (err) {
            console.error("Failed to fetch live links:", err);
            setError('Failed to fetch live links.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLiveLinks();
    }, []);

    const handleAddLink = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        const processedUrl = extractSrcFromIframe(newLink.youtubeEmbedUrl);

        // Check if the user entered an iframe but extraction failed
        if (newLink.youtubeEmbedUrl && newLink.youtubeEmbedUrl.includes('<iframe') && !processedUrl) {
            setError("Invalid iframe code. Could not find a valid 'src' URL inside the tag.");
            return; // Stop the submission
        }

        const linkToSubmit = { ...newLink, youtubeEmbedUrl: processedUrl };

        try {
            await api.post('/satsang/live-links', linkToSubmit);
            setNewLink({ name: '', url: '', youtubeEmbedUrl: '', liveFrom: '', liveTo: '' }); 
            fetchLiveLinks();
        } catch (err) {
            setError('Failed to add live link.');
        }
    };

    const handleUpdateLink = async (e) => {
        e.preventDefault();
        setError(null);

        const processedUrl = extractSrcFromIframe(editingLink.youtubeEmbedUrl);
        
        if (editingLink.youtubeEmbedUrl && editingLink.youtubeEmbedUrl.includes('<iframe') && !processedUrl) {
            setError("Invalid iframe code. Could not find a valid 'src' URL inside the tag.");
            // Don't close the modal, let the user fix it. Or close it and show the error. Let's close it.
            setEditingLink(null);
            return;
        }

        const linkToSubmit = { ...editingLink, youtubeEmbedUrl: processedUrl };
        
        try {
            await api.put(`/satsang/live-links/${editingLink._id}`, linkToSubmit);
            setEditingLink(null);
            fetchLiveLinks();
        } catch (err) {
            setError('Failed to update live link.');
        }
    };

    const openEditModal = (link) => {
        setEditingLink({
            ...link,
            youtubeEmbedUrl: link.youtubeEmbedUrl || '',
            liveFrom: formatDateTimeLocal(link.liveFrom),
            liveTo: formatDateTimeLocal(link.liveTo),
        });
    };

    const confirmDelete = async (id) => {
        setIsModalOpen(false);
        try {
            await api.delete(`/satsang/live-links/${id}`);
            fetchLiveLinks();
        } catch (err) {
            setModalData({
                title: 'Deletion Failed',
                message: err.response?.data?.message || 'Failed to delete live link.',
                confirmText: 'Got It',
                isAlert: true,
                onConfirm: () => setIsModalOpen(false),
                onCancel: () => setIsModalOpen(false),
            });
            setIsModalOpen(true);
        }
    };

    const handleDeleteLink = (id) => {
        const linkName = liveLinks.find(l => l._id === id)?.name || 'this link';
        setModalData({
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete the link "${linkName}"? This action cannot be undone.`,
            confirmText: 'Delete',
            isAlert: false,
            onConfirm: () => confirmDelete(id),
            onCancel: () => setIsModalOpen(false),
        });
        setIsModalOpen(true);
    };

    if (loading) return <div className="text-center mt-10 text-xl text-pink-500"><FaSpinner className="animate-spin inline mr-2" /> Loading Links...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 border-b-2 border-pink-400 pb-2">
                Manage Satsang Live Links
            </h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center shadow-md">{error}</div>}

            {/* Add New Link Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-xl font-semibold text-pink-500 mb-4">Add New Live Link</h3>
                <form onSubmit={handleAddLink} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Link Name</label>
                        <input type="text" value={newLink.name} onChange={(e) => setNewLink({ ...newLink, name: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
                    </div>
                    
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Marquee URL</label>
                        <input type="url" value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
                    </div>
                    
                    <div className="md:col-span-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center"><FaYoutube className="mr-1 text-red-500"/> YouTube Embed (Optional)</label>
                        <input type="text" placeholder="Paste full <iframe> code or just the URL" value={newLink.youtubeEmbedUrl} onChange={(e) => setNewLink({ ...newLink, youtubeEmbedUrl: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" />
                    </div>
                    
                    <div className="md:col-span-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center"><FaClock className="mr-1 text-gray-500"/> Live From</label>
                        <input type="datetime-local" value={newLink.liveFrom} onChange={(e) => setNewLink({ ...newLink, liveFrom: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
                    </div>

                    <div className="md:col-span-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center"><FaClock className="mr-1 text-gray-500"/> Live To</label>
                        <input type="datetime-local" value={newLink.liveTo} onChange={(e) => setNewLink({ ...newLink, liveTo: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
                    </div>
                    
                    <div className="md:col-span-1 self-end">
                        <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-md transition-colors">
                            <FaPlus className="inline mr-2" /> Add Link
                        </Button>
                    </div>
                </form>
            </div>

            {/* Existing Links Table */}
            <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
                <h3 className="text-xl font-semibold p-4 text-gray-800 border-b border-gray-200">Existing Live Links</h3>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Marquee URL</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Live From</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Live To</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(liveLinks || []).map(link => (
                            <tr key={link._id} className="hover:bg-pink-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{link.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-700 flex items-center space-x-1">
                                        <FaLink className="inline text-xs" />
                                        <span className="truncate max-w-[200px]">{link.url}</span>
                                    </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(link.liveFrom).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(link.liveTo).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex space-x-3">
                                        <button onClick={() => openEditModal(link)} className="text-pink-500 hover:text-pink-700 transition-colors" title="Edit Link">
                                            <FaEdit className="text-lg" />
                                        </button>
                                        <button onClick={() => handleDeleteLink(link._id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete Link">
                                            <FaTrashAlt className="text-lg" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {liveLinks.length === 0 && (
                            <tr className="border-b-0">
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No live links have been set up yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Link Modal */}
            <AnimatePresence>
            {editingLink && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-[1000]">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="relative p-8 bg-white w-full max-w-lg rounded-xl shadow-2xl m-4"
                    >
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Live Link: {editingLink.name}</h3>
                        <form onSubmit={handleUpdateLink} className="space-y-4">
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Link Name</label>
                                <input type="text" name="name" value={editingLink.name} onChange={(e) => setEditingLink({ ...editingLink, name: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Marquee URL</label>
                                <input type="url" name="url" value={editingLink.url} onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 flex items-center"><FaYoutube className="mr-1 text-red-500"/> YouTube Embed (Optional)</label>
                                <input type="text" name="youtubeEmbedUrl" placeholder="Paste full <iframe> code or just the URL" value={editingLink.youtubeEmbedUrl} onChange={(e) => setEditingLink({ ...editingLink, youtubeEmbedUrl: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" />
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 flex items-center"><FaClock className="mr-1 text-gray-500"/> Live From</label>
                                    <input type="datetime-local" name="liveFrom" value={editingLink.liveFrom} onChange={(e) => setEditingLink({ ...editingLink, liveFrom: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-700 flex items-center"><FaClock className="mr-1 text-gray-500"/> Live To</label>
                                    <input type="datetime-local" name="liveTo" value={editingLink.liveTo} onChange={(e) => setEditingLink({ ...editingLink, liveTo: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 pt-4">
                                <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white font-medium">Update Link</Button>
                                <Button type="button" onClick={() => setEditingLink(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium">Cancel</Button>
                            </div>
                        </form>
                        <button onClick={() => setEditingLink(null)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-xl">&times;</button>
                    </motion.div>
                </div>
            )}
            </AnimatePresence>
                
            <ConfirmationModal 
                isOpen={isModalOpen}
                title={modalData.title}
                message={modalData.message}
                onConfirm={modalData.onConfirm}
                onCancel={modalData.onCancel}
                confirmText={modalData.confirmText}
                isAlert={modalData.isAlert}
            />
        </motion.div>
    );
};

export default ManageSatsang;