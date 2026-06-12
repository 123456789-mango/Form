const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    permissions: [{
        feature: { type: String }, // 'posts', 'clients', 'users', 'roles'
        canCreate: { type: Boolean, default: false },
        canRead: { type: Boolean, default: false },
        canUpdate: { type: Boolean, default: false },
        canDelete: { type: Boolean, default: false }
    }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
