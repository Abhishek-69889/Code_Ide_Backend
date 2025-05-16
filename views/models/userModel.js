const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));


let userSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    date: {
        type: Date,
        default: Date.now
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    resetToken: String,
    resetTokenExpiration: Date
});

module.exports = mongoose.model("user", userSchema);
