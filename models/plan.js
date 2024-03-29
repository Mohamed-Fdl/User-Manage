const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true
    },
    options: {
        type: Array,
        required: true
    }
});

const Plan = mongoose.model('Plan', PlanSchema);

module.exports = Plan