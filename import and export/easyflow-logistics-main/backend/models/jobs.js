const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    // رقم المهمة أو الشحنة
    jobNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    
    // عنوان المهمة (مهم جداً للتوافق مع الفرونت اند)
    title: {
        type: String,
        required: true
    },

    // الحقول الحسابية الجديدة (تم ترتيبها وتصحيحها)
    discountPercentage: { 
        type: Number, 
        default: 0 
    },
    rawMaterialWeight: { 
        type: Number, 
        default: 0 
    },
    rawMaterialPricePerTon: { 
        type: Number, 
        default: 0 
    },
    supplierDiscountPercentage: { 
        type: Number, 
        default: 0 
    },
    pettyCash: { 
        type: Number, 
        default: 0 
    },
    
    // ربط المهمة بعميل (جعلته اختيارياً لضمان عدم حدوث Error لو العميل فارغ)
    clientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Client', 
        required: false 
    },

    // ربط المهمة بمورد
    supplierId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Supplier', 
        required: false 
    },

    // تفاصيل الشحنة والتشغيل
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled', 'active'], 
        default: 'active' 
    },
    operationType: {
        type: String,
        enum: ['export', 'import', 'supply'],
        default: 'export'
    },
    origin: { type: String, default: '' }, 
    destination: { type: String, default: '' }, 
    shippingMethod: { 
        type: String, 
        enum: ['Air', 'Sea', 'Land'], 
        default: 'Sea' 
    },

    // تفاصيل مالية ومنتجات
    products: [
        {
            productId: String,
            quantity: Number,
            unitPrice: Number,
            currency: String
        }
    ],
    totalPrice: { type: Number, default: 0 }, // اجمالي سعر المنتجات
    currency: { type: String, default: 'USD' },

    // ملاحظات وملحقات
    notes: { type: String },
    attachments: [
        {
            id: String,
            url: String,
            description: String,
            createdAt: { type: Date, default: Date.now }
        }
    ],

    // تواريخ
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);