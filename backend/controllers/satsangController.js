const LiveLink = require('../models/liveLinkModel');

exports.createLiveLink = async (req, res) => {
  try {
    const newLiveLink = new LiveLink(req.body);
    await newLiveLink.save();
    res.status(201).json({ message: 'Live link created successfully', link: newLiveLink });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getLiveLinks = async (req, res) => {
  try {
    const liveLinks = await LiveLink.find().populate('eventId');
    res.status(200).json(liveLinks || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getLinksByEvent = async (req, res) => {
    try {
        const liveLinks = await LiveLink.find({ eventId: req.params.eventId });
        res.status(200).json(liveLinks || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.updateLiveLink = async (req, res) => {
  try {
    const link = await LiveLink.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!link) {
      return res.status(404).json({ message: 'Live link not found' });
    }
    res.status(200).json({ message: 'Live link updated successfully', link });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
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
    res.status(500).json({ message: 'Server error', error });
  }
};