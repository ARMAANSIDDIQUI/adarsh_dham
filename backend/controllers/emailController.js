const emailService = require('../utils/emailService');

exports.sendEmail = async (req, res) => {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
        return res.status(400).json({ message: 'Please provide to, subject, and either text or html content.' });
    }

    try {
        await emailService.sendEmail(to, subject, text, html);
        res.status(200).json({ message: 'Email sent successfully.' });
    } catch (error) {
        console.error('Email controller error:', error);
        res.status(500).json({ message: 'Failed to send email.', error: error.message });
    }
};
