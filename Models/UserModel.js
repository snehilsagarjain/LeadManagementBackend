const mongoose = require('mongoose');
const user = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    status: { type: String, default: 'active' },
}, { timestamps: true });
module.exports = mongoose.model('user', user);