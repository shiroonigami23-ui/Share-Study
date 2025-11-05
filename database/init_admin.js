const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initializeAdmin() {
    let connection;

    try {
        // Connect to database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'studyshare_db'
        });

        console.log('✅ Connected to database');

        // Hash the admin password
        const hashedPassword = await bcrypt.hash('Shiro', 10);

        // Check if admin already exists
        const [existingAdmin] = await connection.query(
            'SELECT id FROM users WHERE username = ?',
            ['ShiroOni']
        );

        if (existingAdmin.length > 0) {
            // Update existing admin
            await connection.query(
                'UPDATE users SET password = ?, is_admin = TRUE WHERE username = ?',
                [hashedPassword, 'ShiroOni']
            );
            console.log('✅ Admin user updated successfully');
        } else {
            // Create new admin
            await connection.query(
                'INSERT INTO users (name, username, password, is_admin) VALUES (?, ?, ?, ?)',
                ['Shiro Oni', 'ShiroOni', hashedPassword, true]
            );
            console.log('✅ Admin user created successfully');
        }

        console.log('\n🔐 Admin Credentials:');
        console.log('   Username: ShiroOni');
        console.log('   Password: Shiro');
        console.log('\n✨ You can now login with these credentials!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initializeAdmin();