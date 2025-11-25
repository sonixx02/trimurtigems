import express from 'express';
import Inquiry from '../models/Inquiry.js';
import upload from '../middleware/uploadMiddleware.js';
import { protect, admin } from '../middleware/authMiddleware.js'; // Import middleware
import fs from 'fs';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
    const logMsg = `[Inquiry API] ${new Date().toISOString()} ${req.method} ${req.url}\n`;
    console.log(logMsg);
    try {
        fs.appendFileSync('debug.log', logMsg);
    } catch (e) {
        console.error("Failed to write to debug log", e);
    }
    next();
});

// Create a new inquiry (with optional file uploads)
router.post('/create', upload.array('attachments', 10), async (req, res) => {
    try {
        const {
            type,
            name,
            email,
            phone,
            baseItemId,
            baseItemName,
            selectedDiamonds,
            customNotes,
            userId // Optional userId from frontend if we want to pass it explicitly, or we can use req.user if protected
        } = req.body;

        const attachments = req.files ? req.files.map(file => {
            let fileType = 'document';
            if (file.mimetype.startsWith('image/')) fileType = 'image';
            else if (file.mimetype.startsWith('video/')) fileType = 'video';

            return {
                url: `/uploads/${file.filename}`,
                fileType,
                originalName: file.originalname
            };
        }) : [];

        // selectedDiamonds might come as a JSON string if sent via FormData
        let diamondIds = [];
        if (selectedDiamonds) {
            try {
                diamondIds = JSON.parse(selectedDiamonds);
            } catch (e) {
                diamondIds = [selectedDiamonds];
            }
        }

        const newInquiry = new Inquiry({
            type,
            contactInfo: { name, email, phone },
            userId: userId || null, // Store userId if provided
            baseItemId: baseItemId || null,
            baseItemName,
            selectedDiamonds: diamondIds,
            customNotes,
            attachments
        });

        await newInquiry.save();
        res.status(201).json({ message: 'Inquiry submitted successfully', inquiry: newInquiry });
    } catch (error) {
        console.error('Error creating inquiry:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Get all inquiries (Admin)
router.get('/', async (req, res) => {
    try {
        const inquiries = await Inquiry.find()
            .sort({ createdAt: -1 })
            .populate('selectedDiamonds')
            .populate('userId', 'name email'); // Populate user details
        res.status(200).json(inquiries);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Get my inquiries (User)
router.get('/my-inquiries', protect, async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .populate('selectedDiamonds');
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Get single inquiry by ID
router.get('/:id', async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id)
            .populate('selectedDiamonds')
            .populate('userId', 'name email');

        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }
        res.status(200).json(inquiry);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Update inquiry status (Admin)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const inquiry = await Inquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.status(200).json(inquiry);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Delete inquiry
router.delete('/:id', async (req, res) => {
    try {
        await Inquiry.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Inquiry deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

export default router;
