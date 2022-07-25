const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    fname: {
        type: String,
        required: true,
        trim: true
    },

    lname: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },

    profileImage: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        min: 8,
        max: 15,
        required: true
    },

    address: {
        shipping: {
            street: { type: String, trim: true, required: true },
            city: { type: String, trim: true, required: true },
            pincode: { type: Number, required: true }
        },
        billing: {
            street: { type: String, trim: true, required: true },
            city: { type: String, trim: true, required: true },
            pincode: { type: Number, required: true }
        }
    }

}, { timestamps: true })

module.exports = mongoose.model('user', userSchema)