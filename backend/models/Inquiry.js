import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Single Item', 'Set', 'General'],
        default: 'Single Item'
    },
    contactInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    baseItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jewelry',
        required: false
    },
    baseItemName: String, // Snapshot in case item is deleted
    selectedDiamonds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Diamond'
    }],
    customNotes: { type: String },
    attachments: [{
        url: String,
        fileType: { type: String, enum: ['image', 'video', 'document'] },
        originalName: String
    }],
    status: {
        type: String,
        enum: ['New', 'In Progress', 'Completed', 'Archived'],
        default: 'New'
    }
}, { timestamps: true });

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
