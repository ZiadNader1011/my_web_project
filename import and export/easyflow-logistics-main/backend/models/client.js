const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    company: { 
        type: String, 
        trim: true 
    },
    email: { 
        type: String, 
        lowercase: true, 
        trim: true 
    },
    phone: { 
        type: String, 
        trim: true 
    },
    address: { 
        type: String 
    },
    vatNumber: { 
        type: String // رقم التسجيل الضريبي إذا وجد
    },
    balance: { 
        type: Number, 
        default: 0 // رصيد العميل (مدين أو دائن)
    },
    notes: { 
        type: String 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Client', ClientSchema);