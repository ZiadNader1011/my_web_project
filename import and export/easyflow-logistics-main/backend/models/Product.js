const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: String,
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }, // ربط المنتج بالمورد
    price: Number,
    currency: { type: String, default: 'USD' }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);