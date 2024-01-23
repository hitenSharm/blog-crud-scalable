const { secretKey } = require("../../config/config");
const User = require("../../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // User already exists check
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // If not, create a new user
        const user = new User({ email, password });
        await user.save();

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            //user is not there
            return res.status(401).json({ message: 'Invalid email' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id, email: email }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser
}