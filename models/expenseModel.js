let mongoose = require('mongoose');

let expenseSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    title:{
        type:String , 
        required: true
    },
    amount: { 
        type: Number, 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    paymentMethod: { 
        type: String, 
        enum: ['cash', 'credit', 'Cash', 'Credit'], 
        required: true 
    },
    description: { 
        type: String 
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
}, { timestamps: true });

let Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
