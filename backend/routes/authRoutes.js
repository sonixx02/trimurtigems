import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { protect } from '../middleware/authMiddleware.js'; // We'll need to create this middleware

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});

// @desc    Add to favorites
// @route   POST /api/auth/favorites
// @access  Private
router.post('/favorites', protect, async (req, res) => {
    const { itemId, itemType } = req.body;
    try {
        const user = req.user;

        // Check if already in favorites
        const exists = user.favorites.find(f => f.itemId.toString() === itemId);
        if (exists) {
            return res.status(400).json({ message: 'Item already in favorites' });
        }

        user.favorites.push({ itemId, itemType });
        await user.save();

        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Remove from favorites
// @route   DELETE /api/auth/favorites/:itemId
// @access  Private
router.delete('/favorites/:itemId', protect, async (req, res) => {
    try {
        const user = req.user;
        user.favorites = user.favorites.filter(f => f.itemId.toString() !== req.params.itemId);
        await user.save();
        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get favorites
// @route   GET /api/auth/favorites
// @access  Private
router.get('/favorites', protect, async (req, res) => {
    try {
        // Populate favorites details? For now just return the list, frontend can fetch details or we can populate here.
        // Let's keep it simple and return the list.
        res.json(req.user.favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
