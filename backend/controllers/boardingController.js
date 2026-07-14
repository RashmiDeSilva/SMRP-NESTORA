const Boarding = require('../models/Boarding');
const Booking = require('../models/Booking');
const logActivity = require('../utils/logger');
const mongoose = require('mongoose');

// @desc  Create a new boarding
// @route POST /api/boardings
const createBoarding = async (req, res) => {
    try {
        // Resolve owner email string to User ObjectId to avoid CastError
        if (req.user) {
            req.body.owner = req.user._id;
        } else if (req.body.owner && typeof req.body.owner === 'string' && req.body.owner.includes('@')) {
            const User = require('../models/User');
            let user = await User.findOne({ email: req.body.owner });
            if (!user) {
                user = await User.create({
                    name: req.body.owner.split('@')[0],
                    email: req.body.owner,
                    password: 'defaultpassword123',
                    role: 'owner'
                });
            }
            req.body.owner = user._id;
        }

        const boarding = await Boarding.create(req.body);
        
        await logActivity({
            action: 'CREATE',
            targetModel: 'Boarding',
            targetId: boarding._id,
            details: boarding,
            req
        });

        res.status(201).json({ boarding });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get all boardings
// @route GET /api/boardings
const getBoardings = async (req, res) => {
    try {
        let filter = {};
        if (req.query.owner) {
            const User = require('../models/User');
            let user = await User.findOne({ email: req.query.owner });
            if (!user) {
                if (req.query.owner.includes('@')) {
                    user = await User.create({
                        name: req.query.owner.split('@')[0],
                        email: req.query.owner,
                        password: 'defaultpassword123',
                        role: 'owner'
                    });
                } else if (mongoose.Types.ObjectId.isValid(req.query.owner)) {
                    filter.owner = req.query.owner;
                } else {
                    return res.json({ boardings: [] });
                }
            }
            if (user) {
                filter.owner = user._id;
            }
        } else {
            // Only show boardings that have a valid owner
            filter.owner = { $ne: null };
        }

        // Add search filtering if query exists
        if (req.query.search) {
            const searchRegex = { $regex: req.query.search, $options: 'i' };
            filter.$or = [
                { boardingName: searchRegex },
                { location: searchRegex },
                { description: searchRegex },
                { boardingType: searchRegex }
            ];
        }

        // Sort by createdAt descending so newly added boardings appear at the top
        const boardings = await Boarding.find(filter)
            .sort({ createdAt: -1 })
            .populate('owner');

        await logActivity({
            action: 'READ',
            targetModel: 'Boarding',
            details: { count: boardings.length, query: req.query },
            req
        });

        res.json({ boardings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Delete a boarding
// @route DELETE /api/boardings/:id
const deleteBoarding = async (req, res) => {
    try {
        const boarding = await Boarding.findById(req.params.id);

        if (!boarding) {
            return res.status(404).json({ message: 'Boarding not found' });
        }

        // Resolve user to check ownership
        let user;
        if (req.user) {
            user = req.user;
        } else if (req.body && req.body.owner && typeof req.body.owner === 'string' && req.body.owner.includes('@')) {
            const User = require('../models/User');
            user = await User.findOne({ email: req.body.owner });
        }

        // Check ownership authorization
        if (user && boarding.owner && boarding.owner.toString() !== user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this boarding place' });
        }

        await boarding.deleteOne();

        // Also delete any bookings related to this boarding place
        await Booking.deleteMany({ boarding: boarding._id });

        await logActivity({
            action: 'DELETE',
            targetModel: 'Boarding',
            targetId: boarding._id,
            details: { name: boarding.name, address: boarding.address },
            req
        });

        res.json({ message: 'Boarding removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Update a boarding
// @route PUT /api/boardings/:id
const updateBoarding = async (req, res) => {
    try {
        const boarding = await Boarding.findById(req.params.id);

        if (!boarding) {
            return res.status(404).json({ message: 'Boarding not found' });
        }

        // Resolve owner email string to User ObjectId to avoid CastError
        if (req.user) {
            req.body.owner = req.user._id;
        } else if (req.body.owner && typeof req.body.owner === 'string' && req.body.owner.includes('@')) {
            const User = require('../models/User');
            let user = await User.findOne({ email: req.body.owner });
            if (!user) {
                user = await User.create({
                    name: req.body.owner.split('@')[0],
                    email: req.body.owner,
                    password: 'defaultpassword123',
                    role: 'owner'
                });
            }
            req.body.owner = user._id;
        }

        // Check ownership authorization
        if (boarding.owner && req.body.owner && boarding.owner.toString() !== req.body.owner.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this boarding place' });
        }

        const updatedBoarding = await Boarding.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        await logActivity({
            action: 'UPDATE',
            targetModel: 'Boarding',
            targetId: updatedBoarding._id,
            details: { before: boarding, after: updatedBoarding },
            req
        });

        res.json({ boarding: updatedBoarding });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get boarding place by name
// @route GET /api/boardings/name/:name
const getBoardingByName = async (req, res) => {
    try {
        const { name } = req.params;
        if (!name) {
            return res.status(400).json({ message: 'Boarding name is required' });
        }
        
        // Use a case-insensitive regex match to be more flexible, or exact match depending on needs
        const boardings = await Boarding.find({
            boardingName: { $regex: new RegExp(`^${name}$`, 'i') }
        }).populate('owner');

        await logActivity({
            action: 'READ',
            targetModel: 'Boarding',
            details: { count: boardings.length, query: { name } },
            req
        });

        res.json({ boardings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createBoarding, getBoardings, deleteBoarding, updateBoarding, getBoardingByName };