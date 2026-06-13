const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    id: { type: String, unique: true, sparse: true },
    name: { type: String, required: true }, // display name
    dpId: { type: String, required: true }, // clientId
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // stored only for re-login convenience — see security note
    pin: { type: String, required: true }, // transaction PIN
    crn: { type: String, required: true },
    noOfShare: { type: Number, default: 0 },
    sessionId: { type: String, default: null },
    demat: { type: String, default: null },
    bankId: { type: String, required: true },
    boid: { type: String, default: null },
    loggedInName: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('MeroshareClient', clientSchema);
