const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    country: { type: String, required: true },
    address: String,
    contact: String,
    email: String,
    phone: String,
    vat: String,
    agentName: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Supplier', SupplierSchema);