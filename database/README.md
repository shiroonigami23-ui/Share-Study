# StudyShare Database Setup

## Prerequisites
- MySQL or MariaDB installed
- MySQL running on localhost:3306 (default port)

## Setup Instructions

### 1. Create Database
First, login to MySQL and create the database:

```bash
mysql -u root -p
```

Then run:

```sql
CREATE DATABASE studyshare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 2. Import Schema
Import the database schema:

```bash
mysql -u root -p studyshare_db < schema.sql
```

### 3. Initialize Admin User
From the `database` directory, run:

```bash
node init_admin.js
```

This will create the admin user:
- **Username:** ShiroOni
- **Password:** Shiro

### 4. Verify Setup
Login to MySQL and verify:

```bash
mysql -u root -p studyshare_db
```

```sql
SHOW TABLES;
SELECT * FROM users;
```

You should see the admin user created.

## Database Structure

### Tables:

#### users
- Stores user information
- Includes admin flag
- Profile image support

#### files
- Stores uploaded study materials
- Links to users
- Tracks file metadata

#### messages
- Community chat messages
- Links to users
- Timestamped

## Configuration

Update the `.env` file in the backend folder with your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=studyshare_db
DB_PORT=3306
```

## Troubleshooting

### Connection Issues
- Ensure MySQL is running
- Check credentials in `.env`
- Verify database name matches

### Permission Issues
- Grant necessary permissions to MySQL user
- Ensure user can create/modify tables

### Port Conflicts
- Check if port 3306 is available
- Update DB_PORT in `.env` if needed