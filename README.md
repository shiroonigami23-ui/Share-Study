# 📚 StudyShare - Study Material Sharing Platform

A complete full-stack web application for sharing study materials with community chat, user profiles, and admin controls.
It now includes an **assembly learning toolkit** (`asm/`) for low-level systems study.

## 🌟 Features

### For All Users:
- ✅ User registration and login
- 📤 Upload study materials (PDFs, images, documents, etc.)
- 📥 Download shared files
- 💬 Community chat for discussions
- 👤 User profiles with customizable profile pictures
- 🏆 Achievement badges based on contributions
- 🔍 Search and filter files
- 📊 Personal statistics (uploads, messages)

### For Admin (ShiroOni):
- 🗑️ Delete any user's files
- 🗑️ Delete any user's messages
- 👑 Admin badge on profile
- 🛡️ Full moderation capabilities

## 📁 Project Structure

```
StudyShare_App/
├── frontend/           # Client-side application
│   ├── index.html     # Main HTML file
│   ├── styles.css     # Styling
│   └── app.js         # Frontend logic
│
├── backend/           # Server-side application
│   ├── server.js      # Main server file
│   ├── package.json   # Node.js dependencies
│   ├── .env          # Environment variables
│   ├── config/       # Database configuration
│   ├── routes/       # API routes
│   ├── middleware/   # Authentication middleware
│   └── uploads/      # File storage
│
└── database/         # Database files
    ├── schema.sql    # Database schema
    ├── init_admin.js # Admin initialization
    └── README.md     # Database setup guide

├── asm/              # Assembly language enrichment toolkit
│   ├── x86_64/       # NASM sources
│   ├── aarch64/      # ARM64 sources
│   ├── build.sh      # Build helper
│   └── README.md     # Assembly docs
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL or MariaDB
- npm or yarn

### Step 1: Database Setup

1. Install MySQL/MariaDB
2. Create database:
```bash
mysql -u root -p
CREATE DATABASE studyshare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

3. Import schema:
```bash
cd database
mysql -u root -p studyshare_db < schema.sql
```

4. Initialize admin user:
```bash
node init_admin.js
```

### Step 2: Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=studyshare_db
DB_PORT=3306

PORT=3000
NODE_ENV=development

JWT_SECRET=change_this_to_random_secret_key

MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

4. Start backend server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

### Step 3: Frontend Setup

1. Open `frontend/app.js` and verify API_BASE_URL:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

2. Serve the frontend:

**Option A - Using Python:**
```bash
cd frontend
python -m http.server 8080
```

**Option B - Using Node.js:**
```bash
npm install -g http-server
cd frontend
http-server -p 8080
```

**Option C - Using VS Code Live Server:**
- Install Live Server extension
- Right-click on `index.html`
- Select "Open with Live Server"

3. Access the application at `http://localhost:8080`

## 🔐 Admin Credentials

- **Username:** ShiroOni
- **Password:** Shiro

## 🌐 AWS Deployment Guide

### Prerequisites for AWS:
- AWS Account
- EC2 instance (Ubuntu recommended)
- Security Group configured for ports: 22, 80, 443, 3000, 8080

### Deployment Steps:

#### 1. Launch EC2 Instance
- Choose Ubuntu Server 20.04 LTS or higher
- t2.micro or larger
- Configure security group to allow HTTP (80), HTTPS (443), and custom ports

#### 2. Connect to EC2 and Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server

# Secure MySQL
sudo mysql_secure_installation
```

#### 3. Upload Application Files
```bash
# From your local machine
scp -r StudyShare_App ubuntu@your-ec2-ip:/home/ubuntu/
```

Or use Git:
```bash
# On EC2 instance
git clone your-repository-url
cd StudyShare_App
```

#### 4. Setup Database on EC2
```bash
sudo mysql -u root -p
CREATE DATABASE studyshare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'studyshare_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON studyshare_db.* TO 'studyshare_user'@'localhost';
FLUSH PRIVILEGES;
exit;

# Import schema
cd database
mysql -u root -p studyshare_db < schema.sql

# Initialize admin
node init_admin.js
```

#### 5. Configure Backend
```bash
cd backend
npm install

# Update .env with production settings
nano .env
```

Update `.env`:
```env
DB_HOST=localhost
DB_USER=studyshare_user
DB_PASSWORD=secure_password
DB_NAME=studyshare_db

PORT=3000
NODE_ENV=production

JWT_SECRET=generate_random_secret_here
```

#### 6. Setup Process Manager (PM2)
```bash
# Install PM2
sudo npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name studyshare-api

# Set PM2 to start on boot
pm2 startup
pm2 save
```

#### 7. Setup Nginx for Frontend
```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/studyshare
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or EC2 public IP

    # Frontend
    location / {
        root /home/ubuntu/StudyShare_App/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:3000;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/studyshare /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. Configure Firewall
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### 9. Setup SSL (Optional but Recommended)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### Accessing Your Application
- Frontend: `http://your-ec2-ip` or `http://your-domain.com`
- API: `http://your-ec2-ip/api` or `http://your-domain.com/api`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Files
- `GET /api/files` - Get all files
- `POST /api/files/upload` - Upload file
- `GET /api/files/download/:id` - Download file
- `DELETE /api/files/:id` - Delete file

### Chat
- `GET /api/chat/messages` - Get all messages
- `POST /api/chat/send` - Send message
- `DELETE /api/chat/messages/:id` - Delete message

### Users
- `GET /api/users/profile` - Get user profile
- `POST /api/users/profile-image` - Upload profile image

## 🛠️ Technologies Used

### Frontend:
- HTML5
- CSS3 (with modern gradients and animations)
- Vanilla JavaScript (ES6+)
- Fetch API for HTTP requests

### Backend:
- Node.js
- Express.js
- MySQL2
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads

### Database:
- MySQL/MariaDB

## 🎨 Features in Detail

### Badge System
Users earn badges based on contributions:
- 🌟 First Upload - Upload first file
- 📚 Knowledge Sharer - Upload 5 files
- 🏆 Top Contributor - Upload 10 files
- 💎 Elite Member - Upload 20 files
- 👑 Administrator - Admin role

### File Type Support
- 📄 PDFs
- 🖼️ Images (JPG, PNG, GIF, WebP)
- 📝 Documents (DOC, DOCX, TXT)
- 🎥 Videos (MP4, AVI, MOV)
- 🎵 Audio (MP3, WAV, OGG)
- 📦 Archives (ZIP, RAR, 7Z)
- 💻 Code files (JS, PY, JAVA, etc.)

## 🔒 Security Features
- Password hashing with bcrypt
- JWT-based authentication
- File size limits
- SQL injection protection
- XSS protection
- CORS configured
- Admin-only routes protected

## 🐛 Troubleshooting

### Backend won't start
- Check if MySQL is running
- Verify .env configuration
- Ensure database exists
- Check if port 3000 is available

### Frontend can't connect to backend
- Verify backend is running
- Check API_BASE_URL in app.js
- Check browser console for CORS errors
- Ensure CORS is enabled in backend

### File upload fails
- Check file size limits
- Verify uploads directory exists and is writable
- Check disk space

### Database connection errors
- Verify MySQL credentials
- Check if database exists
- Ensure MySQL is running
- Check firewall settings

## 📝 License
MIT License - Feel free to use for educational purposes

## 👨‍💻 Developer
Created by ShiroOni

## 🤝 Contributing
This is a complete educational project. Feel free to fork and enhance!

---

**Happy Studying! 📚✨**
