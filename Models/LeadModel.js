const mongoose = require('mongoose');
const lead = mongoose.Schema({
    leadName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, default: 'New' },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    nextfollowupdate: { type: Date },
    nextfollowuptime: { type: String },
    leadSource: { type: String, required: true },
    conversionDate: { type: Date },
    leadNotes: { type: String },
    customerType: { type: String, required: true },
    purchaseHistory: { type: Array },
    // , required: true
    medicalNeeds: { type: Array },
    // , required: true
    notified: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('lead', lead);