const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken, isAdmin } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/files/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 }, // 10MB default
    fileFilter: (req, file, cb) => {
        // Accept all file types for study materials
        cb(null, true);
    }
});

// Helper function to determine file type
function getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const docExts = ['.doc', '.docx', '.txt', '.rtf'];
    const videoExts = ['.mp4', '.avi', '.mov', '.wmv'];
    const audioExts = ['.mp3', '.wav', '.ogg', '.m4a'];
    const archiveExts = ['.zip', '.rar', '.7z', '.tar', '.gz'];
    const codeExts = ['.js', '.py', '.java', '.cpp', '.c', '.html', '.css'];

    if (ext === '.pdf') return 'pdf';
    if (imageExts.includes(ext)) return 'image';
    if (docExts.includes(ext)) return 'document';
    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    if (archiveExts.includes(ext)) return 'archive';
    if (codeExts.includes(ext)) return 'code';
    return 'other';
}

// Get all files
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [files] = await db.query(`
            SELECT f.*, u.username 
            FROM files f 
            JOIN users u ON f.user_id = u.id 
            ORDER BY f.created_at DESC
        `);

        res.json(files);
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ message: 'Failed to fetch files' });
    }
});

// Upload file
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, description, category } = req.body;

        if (!title || !category) {
            // Delete uploaded file if validation fails
            await fs.unlink(req.file.path);
            return res.status(400).json({ message: 'Title and category are required' });
        }

        const fileType = getFileType(req.file.originalname);

        const [result] = await db.query(
            `INSERT INTO files (user_id, title, description, category, file_name, file_path, file_type, file_size) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                title,
                description || '',
                category,
                req.file.originalname,
                req.file.path,
                fileType,
                req.file.size
            ]
        );

        res.status(201).json({
            message: 'File uploaded successfully',
            fileId: result.insertId
        });
    } catch (error) {
        console.error('Upload error:', error);
        // Try to delete file if database insert failed
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Failed to delete file:', unlinkError);
            }
        }
        res.status(500).json({ message: 'Failed to upload file' });
    }
});

// Download file
router.get('/download/:id', authenticateToken, async (req, res) => {
    try {
        const [files] = await db.query(
            'SELECT * FROM files WHERE id = ?',
            [req.params.id]
        );

        if (files.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = files[0];
        res.download(file.file_path, file.file_name);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Failed to download file' });
    }
});

// Delete file
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [files] = await db.query(
            'SELECT * FROM files WHERE id = ?',
            [req.params.id]
        );

        if (files.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = files[0];

        // Check if user owns the file or is admin
        if (file.user_id !== req.user.id && !req.user.is_admin) {
            return res.status(403).json({ message: 'Not authorized to delete this file' });
        }

        // Delete from database
        await db.query('DELETE FROM files WHERE id = ?', [req.params.id]);

        // Delete physical file
        try {
            await fs.unlink(file.file_path);
        } catch (unlinkError) {
            console.error('Failed to delete physical file:', unlinkError);
        }

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete file' });
    }
});

module.exports = router;