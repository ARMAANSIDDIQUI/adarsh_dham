const LiveLink = require('../models/liveLinkModel');

exports.createLiveLink = async (req, res) => {
    // Now only expecting name, url, liveFrom, liveTo in req.body
    try {
        const newLiveLink = new LiveLink(req.body);
        await newLiveLink.save();
        res.status(201).json({ message: 'Live link created successfully', link: newLiveLink });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getLiveLinks = async (req, res) => {
    try {
        // Fetches all links; populate is removed
        const liveLinks = await LiveLink.find();
        res.status(200).json(liveLinks || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// This function is now redundant and can be removed, but I'll comment it out
// for context. It is no longer possible to filter by eventId.
// exports.getLinksByEvent = async (req, res) => { ... };

// New function to get currently active live links for the marquee
exports.getActiveLiveLinks = async (req, res) => {
    try {
        const now = new Date();
        const liveLinks = await LiveLink.find({ 
            liveFrom: { $lte: now }, 
            liveTo: { $gte: now }    
        });
        res.status(200).json(liveLinks || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateLiveLink = async (req, res) => {
    // Now only expecting name, url, liveFrom, and liveTo in req.body
    try {
        const link = await LiveLink.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!link) {
            return res.status(404).json({ message: 'Live link not found' });
        }
        res.status(200).json({ message: 'Live link updated successfully', link });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteLiveLink = async (req, res) => {
    try {
        const deletedLink = await LiveLink.findByIdAndDelete(req.params.id);
        if (!deletedLink) {
            return res.status(404).json({ message: 'Live link not found' });
        }
        res.status(200).json({ message: 'Live link deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};