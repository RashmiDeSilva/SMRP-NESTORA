const Booking = require('../models/Booking');
const Boarding = require('../models/Boarding');
const User = require('../models/User');
const logActivity = require('../utils/logger');

// @desc  Create a booking request
// @route POST /api/bookings
const createBooking = async (req, res) => {
    try {
        const { boardingId, message, studentEmail } = req.body;
        console.log(`[createBooking] boardingId=${boardingId} studentEmail=${studentEmail} req.user=${req.user?.email}`);

        // Resolve student ID — from JWT or email fallback
        let studentId = req.user ? req.user._id : null;
        if (!studentId && studentEmail) {
            const student = await User.findOne({ email: studentEmail });
            if (student) {
                studentId = student._id;
                console.log(`[createBooking] resolved student by email: ${student.email}`);
            }
        }

        if (!studentId) {
            console.log('[createBooking] No studentId found — returning 400');
            return res.status(400).json({ message: 'Valid student credentials required' });
        }

        const boarding = await Boarding.findById(boardingId);
        if (!boarding) {
            console.log(`[createBooking] Boarding not found: ${boardingId}`);
            return res.status(404).json({ message: 'Boarding place not found' });
        }

        // Resolve owner ObjectId — handles email strings and missing owners
        let ownerId = boarding.owner;
        console.log(`[createBooking] boarding.owner=${ownerId} type=${typeof ownerId}`);

        if (ownerId && typeof ownerId === 'string' && ownerId.includes('@')) {
            // owner stored as email string — look up the User
            let ownerUser = await User.findOne({ email: ownerId });
            if (!ownerUser) {
                ownerUser = await User.create({
                    name: ownerId.split('@')[0],
                    email: ownerId,
                    password: 'defaultpassword123',
                    role: 'owner',
                });
            }
            ownerId = ownerUser._id;
        } else if (!ownerId) {
            // no owner — assign to first available owner
            const firstOwner = await User.findOne({
                role: { $in: ['owner', 'Owner', 'Boarding Owner', 'boarding owner'] },
            });
            if (firstOwner) {
                ownerId = firstOwner._id;
                console.log(`[createBooking] no owner on boarding, assigned fallback: ${firstOwner.email}`);
            } else {
                return res.status(400).json({ message: 'No valid owner associated with this boarding place' });
            }
        }

        const booking = await Booking.create({
            student: studentId,
            boarding: boardingId,
            owner: ownerId,
            message: message || '',
            status: 'pending',
        });

        console.log(`[createBooking] Booking created: ${booking._id}`);

        await logActivity({
            action: 'CREATE',
            targetModel: 'Booking',
            targetId: booking._id,
            details: { message, boardingName: boarding.boardingName },
            req,
        });

        res.status(201).json({ booking });
    } catch (error) {
        console.error('[createBooking] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get bookings for student or owner
// @route GET /api/bookings
const getBookings = async (req, res) => {
    try {
        let filter = {};

        // Resolve user — from JWT or email query param
        let user = req.user;
        const email = req.query.email;
        if (!user && email) {
            user = await User.findOne({ email });
        }

        if (!user) {
            return res.status(400).json({ message: 'Valid user credentials required' });
        }

        // Case-insensitive owner role check
        const isOwner = user.role && (
            user.role.toLowerCase() === 'owner' ||
            user.role.toLowerCase() === 'boarding owner'
        );

        if (isOwner) {
            filter.owner = user._id;
        } else {
            filter.student = user._id;
        }

        const bookings = await Booking.find(filter)
            .populate('boarding')
            .populate('student')
            .populate('owner')
            .sort({ createdAt: -1 });

        console.log(`[getBookings] user=${user.email} role=${user.role} isOwner=${isOwner} count=${bookings.length}`);

        await logActivity({
            action: 'READ',
            targetModel: 'Booking',
            details: { count: bookings.length },
            req,
        });

        res.json({ bookings });
    } catch (error) {
        console.error('[getBookings] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc  Confirm or reject a booking request
// @route PUT /api/bookings/:id/status
const updateBookingStatus = async (req, res) => {
    try {
        const { status, ownerEmail } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Resolve owner — from JWT or email fallback
        let user = req.user;
        if (!user && ownerEmail) {
            user = await User.findOne({ email: ownerEmail });
        }

        // Validate owner authorization (only skip check if no owner on booking)
        if (user && booking.owner && booking.owner.toString() !== user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to modify this booking' });
        }

        booking.status = status;
        await booking.save();

        console.log(`[updateBookingStatus] booking=${booking._id} status=${status}`);

        await logActivity({
            action: 'UPDATE',
            targetModel: 'Booking',
            targetId: booking._id,
            details: { status },
            req,
        });

        res.json({ booking });
    } catch (error) {
        console.error('[updateBookingStatus] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createBooking, getBookings, updateBookingStatus };
