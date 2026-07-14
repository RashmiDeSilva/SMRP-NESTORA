const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logActivity = require('../utils/logger');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Map database roles to frontend expected strings
const getDisplayRole = (dbRole) => {
  if (dbRole === 'owner') return 'Boarding Owner';
  if (dbRole === 'student') return 'Student';
  if (dbRole === 'intern') return 'Intern';
  if (dbRole === 'employee') return 'Employee';
  return dbRole;
};

// @desc  Register a new user
// @route POST /api/auth/signup
const registerUser = async (req, res) => {
  const { email, password, role } = req.body;
  const name = req.body.name || req.body.fullName;

  // Normalize role for database persistence
  let normalizedRole = 'student';
  if (role) {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('owner')) {
      normalizedRole = 'owner';
    } else if (roleLower.includes('student')) {
      normalizedRole = 'student';
    } else if (roleLower.includes('intern')) {
      normalizedRole = 'intern';
    } else if (roleLower.includes('employee')) {
      normalizedRole = 'employee';
    } else if (roleLower.includes('admin')) {
      normalizedRole = 'admin';
    }
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole,
    });

    if (user) {
      const displayRole = getDisplayRole(user.role);

      await logActivity({
        action: 'CREATE',
        targetModel: 'User',
        targetId: user._id,
        details: { name: user.name, email: user.email, role: user.role },
        user: user,
      });

      res.status(201).json({
        user: {
          _id: user._id,
          name: user.name,
          fullName: user.name,
          email: user.email,
          role: displayRole,
          savedBoardingIds: (user.savedBoardings || []).map((id) => id.toString()),
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const displayRole = getDisplayRole(user.role);

      await logActivity({
        action: 'READ',
        targetModel: 'User',
        targetId: user._id,
        details: { email: user.email, actionType: 'login' },
        user: user,
      });

      res.json({
        user: {
          _id: user._id,
          name: user.name,
          fullName: user.name,
          email: user.email,
          role: displayRole,
          savedBoardingIds: (user.savedBoardings || []).map((id) => id.toString()),
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Toggle a boarding place in saved list
// @route POST /api/auth/saved
const toggleSavedBoarding = async (req, res) => {
  try {
    const { boardingId, email: bodyEmail } = req.body;
    console.log(`[toggleSaved] boardingId=${boardingId} bodyEmail=${bodyEmail} req.user=${req.user?.email}`);

    // Resolve user — from JWT or email fallback
    let user = req.user;
    const email = bodyEmail || req.query.email;
    if (!user && email) {
      user = await User.findOne({ email });
      console.log(`[toggleSaved] resolved user by email: ${user?.email} _id=${user?._id}`);
    }
    if (!user) {
      console.log('[toggleSaved] No user found — returning 400');
      return res.status(400).json({ message: 'Valid user credentials required' });
    }

    // Check if already saved using string comparison
    const alreadySaved = user.savedBoardings.some(
      (id) => id.toString() === boardingId.toString()
    );
    console.log(`[toggleSaved] alreadySaved=${alreadySaved} currentSaved=[${user.savedBoardings.map(i=>i.toString()).join(',')}]`);

    // Use atomic update — bypasses Mongoose enum validation entirely
    const updated = await User.findByIdAndUpdate(
      user._id,
      alreadySaved
        ? { $pull: { savedBoardings: boardingId } }
        : { $addToSet: { savedBoardings: boardingId } },
      { new: true }
    );
    console.log(`[toggleSaved] after update savedBoardings=[${updated.savedBoardings.map(i=>i.toString()).join(',')}]`);

    await logActivity({
      action: 'UPDATE',
      targetModel: 'User',
      targetId: user._id,
      details: { action: alreadySaved ? 'unsave' : 'save', boardingId },
      req,
    });

    // Return plain strings so frontend .includes() works
    res.json({
      savedBoardingIds: updated.savedBoardings.map((id) => id.toString()),
    });
  } catch (error) {
    console.error('toggleSavedBoarding error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get saved boarding places for a user
// @route GET /api/auth/saved
const getSavedBoardings = async (req, res) => {
  try {
    let user = req.user;
    const email = req.query.email;
    
    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ message: 'Valid user credentials required' });
    }

    res.json({
      savedBoardingIds: (user.savedBoardings || []).map((id) => id.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, toggleSavedBoarding, getSavedBoardings };