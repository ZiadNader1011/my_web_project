const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    country: { type: String, required: true },
    address: String,
    contact: String,
    email: String,
    phone: String,
    telephone: String,
    fax: String,
    vat: String,
    dhl: String,
    agentName: String,
    createdAt: { type: Date, default: Date.now }
});

// هنغير الاسم لـ Client عشان يكون منطقي أكتر
module.exports = mongoose.model('Client', ClientSchema);