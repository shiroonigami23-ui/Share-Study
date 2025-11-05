const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get all messages
router.get('/messages', authenticateToken, async (req, res) => {
    try {
        const [messages] = await db.query(`
            SELECT m.*, u.username, u.is_admin 
            FROM messages m 
            JOIN users u ON m.user_id = u.id 
            ORDER BY m.created_at ASC
        `);

        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// Send message
router.post('/send', authenticateToken, [
    body('message').trim().notEmpty().withMessage('Message cannot be empty')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { message } = req.body;

        const [result] = await db.query(
            'INSERT INTO messages (user_id, message) VALUES (?, ?)',
            [req.user.id, message]
        );

        res.status(201).json({
            message: 'Message sent successfully',
            messageId: result.insertId
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// Delete message
router.delete('/messages/:id', authenticateToken, async (req, res) => {
    try {
        const [messages] = await db.query(
            'SELECT * FROM messages WHERE id = ?',
            [req.params.id]
        );

        if (messages.length === 0) {
            return res.status(404).json({ message: 'Message not found' });
        }

        const message = messages[0];

        // Check if user owns the message or is admin
        if (message.user_id !== req.user.id && !req.user.is_admin) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        await db.query('DELETE FROM messages WHERE id = ?', [req.params.id]);

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ message: 'Failed to delete message' });
    }
});

module.exports = router;