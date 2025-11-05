const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Configure multer for profile images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5242880 }, // 5MB limit for profile images
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        // Get user info
        const [users] = await db.query(
            'SELECT id, name, username, is_admin, profile_image, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Get upload count
        const [uploadCount] = await db.query(
            'SELECT COUNT(*) as count FROM files WHERE user_id = ?',
            [req.user.id]
        );

        // Get message count
        const [messageCount] = await db.query(
            'SELECT COUNT(*) as count FROM messages WHERE user_id = ?',
            [req.user.id]
        );

        // Get user's files
        const [userFiles] = await db.query(
            `SELECT f.*, u.username 
             FROM files f 
             JOIN users u ON f.user_id = u.id 
             WHERE f.user_id = ? 
             ORDER BY f.created_at DESC`,
            [req.user.id]
        );

        res.json({
            ...user,
            upload_count: uploadCount[0].count,
            message_count: messageCount[0].count,
            user_files: userFiles
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
});

// Upload profile image
router.post('/profile-image', authenticateToken, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        // Update user's profile image
        await db.query(
            'UPDATE users SET profile_image = ? WHERE id = ?',
            [req.file.filename, req.user.id]
        );

        res.json({
            message: 'Profile image updated successfully',
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload profile image error:', error);
        res.status(500).json({ message: 'Failed to upload profile image' });
    }
});

module.exports = router;