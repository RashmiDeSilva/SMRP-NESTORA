const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String, // 'CREATE', 'READ', 'UPDATE', 'DELETE'
      required: true,
    },
    targetModel: {
      type: String, // 'Boarding', 'User', etc.
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    owner: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      role: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
