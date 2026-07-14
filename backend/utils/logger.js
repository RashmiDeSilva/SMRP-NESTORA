const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

const logActivity = async ({ action, targetModel, targetId, details, user, req }) => {
  try {
    let resolvedUser = user;

    // Resolve user from express request if not passed explicitly
    if (!resolvedUser && req) {
      if (req.user) {
        resolvedUser = req.user;
      } else {
        // Fallback to searching by body.owner or query.owner (email string passed from legacy/fallback frontend code)
        const ownerEmail = (req.body && req.body.owner) || (req.query && req.query.owner);
        if (ownerEmail) {
          resolvedUser = await User.findOne({ email: ownerEmail });
        }
      }
    }

    const ownerDetails = resolvedUser
      ? {
          userId: resolvedUser._id,
          name: resolvedUser.name,
          email: resolvedUser.email,
          role: resolvedUser.role,
        }
      : undefined;

    await AuditLog.create({
      action,
      targetModel,
      targetId,
      details,
      owner: ownerDetails,
    });
  } catch (error) {
    console.error('Error creating audit log:', error.message);
  }
};

module.exports = logActivity;
