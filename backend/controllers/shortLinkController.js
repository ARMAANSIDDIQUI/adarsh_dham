const ShortLink = require('../models/shortLinkModel');

// --- ADMIN CONTROLLERS ---

// Create a new short link
exports.createShortLink = async (req, res) => {
    try {
        const { slug, targetUrl, description } = req.body;

        // Check if slug already exists
        const existingLink = await ShortLink.findOne({ slug });
        if (existingLink) {
            return res.status(400).json({ message: 'Slug already in use.' });
        }

        const newLink = new ShortLink({
            slug,
            targetUrl,
            description,
        });

        await newLink.save();
        res.status(201).json(newLink);
    } catch (error) {
        console.error('Error creating short link:', error);
        res.status(500).json({ message: 'Server error creating short link.' });
    }
};

// Get all short links
exports.getAllShortLinks = async (req, res) => {
    try {
        const links = await ShortLink.find().sort({ createdAt: -1 });
        res.status(200).json(links);
    } catch (error) {
        console.error('Error fetching short links:', error);
        res.status(500).json({ message: 'Server error fetching short links.' });
    }
};

// Update a short link
exports.updateShortLink = async (req, res) => {
    try {
        const { id } = req.params;
        const { slug, targetUrl, description, active } = req.body;

        // Check if slug is taken by another link (if slug is being changed)
        if (slug) {
            const existingLink = await ShortLink.findOne({ slug, _id: { $ne: id } });
            if (existingLink) {
                return res.status(400).json({ message: 'Slug already in use by another link.' });
            }
        }

        const updatedLink = await ShortLink.findByIdAndUpdate(
            id,
            { slug, targetUrl, description, active },
            { new: true }
        );

        if (!updatedLink) {
            return res.status(404).json({ message: 'Short link not found.' });
        }

        res.status(200).json(updatedLink);
    } catch (error) {
        console.error('Error updating short link:', error);
        res.status(500).json({ message: 'Server error updating short link.' });
    }
};

// Delete a short link
exports.deleteShortLink = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedLink = await ShortLink.findByIdAndDelete(id);

        if (!deletedLink) {
            return res.status(404).json({ message: 'Short link not found.' });
        }

        res.status(200).json({ message: 'Short link deleted successfully.' });
    } catch (error) {
        console.error('Error deleting short link:', error);
        res.status(500).json({ message: 'Server error deleting short link.' });
    }
};

// --- PUBLIC REDIRECT CONTROLLER ---

exports.handleRedirect = async (req, res, next) => {
    const { slug } = req.params;

    try {
        const link = await ShortLink.findOne({ slug, active: true });

        if (link) {
            // Increment click count asynchronously
            link.clicks += 1;
            await link.save();

            // Perform 302 Found redirect
            return res.redirect(link.targetUrl);
        }

        // If no link found, call next() to let other handlers (like static files or React app) handle the request
        next();
    } catch (error) {
        console.error('Error handling redirect:', error);
        // In case of error, we can also just pass to next() so the user sees a 404/Error page from React
        next();
    }
};


