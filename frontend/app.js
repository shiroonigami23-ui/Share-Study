// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
let currentUser = null;
let allFiles = [];
let allMessages = [];

// Authentication Functions
function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
}

function showSignup() {
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
}

function showChange() {
    // Your code here
}

async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('loginError');

    if (!username || !password) {
        errorMsg.textContent = 'Please fill all fields';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showMainApp();  // ✅ Correct function name
        } else {
            errorMsg.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        errorMsg.textContent = 'Connection error. Please try again.';
        console.error('Login error:', error);
    }
}

async function signup() {
    const name = document.getElementById('signupName').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const errorMsg = document.getElementById('signupError');

    if (!name || !username || !password || !confirmPassword) {
        errorMsg.textContent = 'Please fill all fields';
        return;
    }

    if (password !== confirmPassword) {
        errorMsg.textContent = 'Passwords do not match';
        return;
    }

    if (password.length < 4) {
        errorMsg.textContent = 'Password must be at least 4 characters';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showMainApp();  // ✅ Correct function name
        } else {
            errorMsg.textContent = data.message || 'Signup failed';
        }
    } catch (error) {
        errorMsg.textContent = 'Connection error. Please try again.';
        console.error('Signup error:', error);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.getElementById('authContainer').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

function showMainApp() {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser.name;
    loadFiles();
    loadMessages();
    loadProfile();
    setInterval(loadMessages, 5000); // Refresh messages every 5 seconds
}

// Navigation
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    if (section === 'home') {
        document.getElementById('homeSection').classList.add('active');
        document.querySelectorAll('.nav-btn')[0].classList.add('active');
    } else if (section === 'community') {
        document.getElementById('communitySection').classList.add('active');
        document.querySelectorAll('.nav-btn')[1].classList.add('active');
        loadMessages();
    } else if (section === 'profile') {
        document.getElementById('profileSection').classList.add('active');
        document.querySelectorAll('.nav-btn')[2].classList.add('active');
        loadProfile();
    }
}

// File Management
async function loadFiles() {
    try {
        const response = await fetch(`${API_BASE_URL}/files`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            allFiles = await response.json();
            displayFiles(allFiles);
        }
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

function displayFiles(files) {
    const filesList = document.getElementById('filesList');
    filesList.innerHTML = '';

    if (files.length === 0) {
        filesList.innerHTML = '<p style="text-align:center;color:#888;padding:40px;">No files uploaded yet. Be the first to share!</p>';
        return;
    }

    files.forEach(file => {
        const fileCard = createFileCard(file);
        filesList.appendChild(fileCard);
    });
}

function createFileCard(file) {
    const card = document.createElement('div');
    card.className = 'file-card';

    const icon = getFileIcon(file.file_type);
    const canDelete = currentUser.is_admin || file.user_id === currentUser.id;

    card.innerHTML = `
        <div class="file-icon">${icon}</div>
        <h4>${file.title}</h4>
        <p>${file.description || 'No description'}</p>
        <p><strong>Category:</strong> ${file.category}</p>
        <div class="file-meta">
            <span class="file-author">By: ${file.username}</span>
            <div class="file-actions">
                <button class="download-btn" onclick="downloadFile(${file.id}, '${file.file_name}')">📥 Download</button>
                ${canDelete ? `<button class="delete-btn" onclick="deleteFile(${file.id})">🗑️ Delete</button>` : ''}
            </div>
        </div>
    `;

    return card;
}

function getFileIcon(fileType) {
    const icons = {
        'pdf': '📄',
        'image': '🖼️',
        'document': '📝',
        'video': '🎥',
        'audio': '🎵',
        'archive': '📦',
        'code': '💻',
        'other': '📎'
    };
    return icons[fileType] || icons['other'];
}

function filterFiles() {
    const searchTerm = document.getElementById('searchFiles').value.toLowerCase();
    const filterType = document.getElementById('filterType').value;

    let filtered = allFiles.filter(file => {
        const matchesSearch = file.title.toLowerCase().includes(searchTerm) || 
                            file.description.toLowerCase().includes(searchTerm);
        const matchesType = filterType === 'all' || file.file_type === filterType;
        return matchesSearch && matchesType;
    });

    displayFiles(filtered);
}

function showUploadModal() {
    document.getElementById('uploadModal').style.display = 'block';
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
    document.getElementById('uploadForm').reset();
}

document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('fileTitle').value);
    formData.append('description', document.getElementById('fileDescription').value);
    formData.append('category', document.getElementById('fileCategory').value);
    formData.append('file', document.getElementById('fileUpload').files[0]);

    try {
        const response = await fetch(`${API_BASE_URL}/files/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });

        if (response.ok) {
            alert('File uploaded successfully!');
            closeUploadModal();
            loadFiles();
            loadProfile(); // Refresh profile to update stats and badges
        } else {
            const data = await response.json();
            alert(data.message || 'Upload failed');
        }
    } catch (error) {
        alert('Upload error. Please try again.');
        console.error('Upload error:', error);
    }
});

async function downloadFile(fileId, fileName) {
    try {
        const response = await fetch(`${API_BASE_URL}/files/download/${fileId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        }
    } catch (error) {
        console.error('Download error:', error);
        alert('Failed to download file');
    }
}

async function deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            alert('File deleted successfully');
            loadFiles();
            loadProfile();
        } else {
            const data = await response.json();
            alert(data.message || 'Delete failed');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete file');
    }
}

// Chat Functions
async function loadMessages() {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/messages`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            allMessages = await response.json();
            displayMessages(allMessages);
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function displayMessages(messages) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';

    if (messages.length === 0) {
        chatMessages.innerHTML = '<p style="text-align:center;color:#888;padding:40px;">No messages yet. Start the conversation!</p>';
        return;
    }

    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';

        const canDelete = currentUser.is_admin || msg.user_id === currentUser.id;
        const adminBadge = msg.is_admin ? '<span class="admin-badge">ADMIN</span>' : '';

        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-author">${msg.username}${adminBadge}</span>
                <span class="message-time">${new Date(msg.created_at).toLocaleString()}</span>
            </div>
            <div class="message-content">${msg.message}</div>
            ${canDelete ? `
                <div class="message-actions">
                    <button class="delete-msg-btn" onclick="deleteMessage(${msg.id})">Delete</button>
                </div>
            ` : ''}
        `;

        chatMessages.appendChild(messageDiv);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const messageInput = document.getElementById('chatInput');
    const message = messageInput.value.trim();

    if (!message) return;

    try {
        const response = await fetch(`${API_BASE_URL}/chat/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ message })
        });

        if (response.ok) {
            messageInput.value = '';
            loadMessages();
            loadProfile(); // Update message count
        }
    } catch (error) {
        console.error('Send message error:', error);
        alert('Failed to send message');
    }
}

async function deleteMessage(messageId) {
    if (!confirm('Delete this message?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/chat/messages/${messageId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            loadMessages();
        }
    } catch (error) {
        console.error('Delete message error:', error);
    }
}

// Profile Functions
async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            const profileData = await response.json();
            displayProfile(profileData);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function displayProfile(profile) {
    document.getElementById('profileName').textContent = profile.name;
    document.getElementById('profileUsername').textContent = `@${profile.username}`;
    document.getElementById('profileRole').textContent = profile.is_admin ? 'Administrator' : 'Member';
    document.getElementById('uploadCount').textContent = profile.upload_count;
    document.getElementById('messageCount').textContent = profile.message_count;

    // Profile image
    const profileImg = document.getElementById('profileImage');
    if (profile.profile_image) {
        profileImg.src = `${API_BASE_URL.replace('/api', '')}/uploads/profiles/${profile.profile_image}`;
    } else {
        profileImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Ccircle cx="75" cy="75" r="75" fill="%23667eea"/%3E%3Ctext x="50%25" y="50%25" font-size="60" fill="white" text-anchor="middle" dy=".3em"%3E' + profile.name.charAt(0).toUpperCase() + '%3C/text%3E%3C/svg%3E';
    }

    // Badges
    displayBadges(profile.upload_count);

    // User files
    displayUserFiles(profile.user_files);
}

function displayBadges(uploadCount) {
    const badgesContainer = document.getElementById('badgesContainer');
    badgesContainer.innerHTML = '';

    const badges = [];

    if (uploadCount >= 1) badges.push({ name: '🌟 First Upload', desc: 'Uploaded first file' });
    if (uploadCount >= 5) badges.push({ name: '📚 Knowledge Sharer', desc: 'Uploaded 5 files' });
    if (uploadCount >= 10) badges.push({ name: '🏆 Top Contributor', desc: 'Uploaded 10 files' });
    if (uploadCount >= 20) badges.push({ name: '💎 Elite Member', desc: 'Uploaded 20 files' });
    if (currentUser.is_admin) badges.push({ name: '👑 Administrator', desc: 'Platform Admin' });

    if (badges.length === 0) {
        badgesContainer.innerHTML = '<p style="color:#888;">Upload files to earn badges!</p>';
    } else {
        badges.forEach(badge => {
            const badgeEl = document.createElement('div');
            badgeEl.className = 'badge';
            badgeEl.textContent = badge.name;
            badgeEl.title = badge.desc;
            badgesContainer.appendChild(badgeEl);
        });
    }
}

function displayUserFiles(files) {
    const userFilesList = document.getElementById('userFilesList');
    userFilesList.innerHTML = '';

    if (files.length === 0) {
        userFilesList.innerHTML = '<p style="text-align:center;color:#888;padding:40px;">You have not uploaded any files yet.</p>';
        return;
    }

    files.forEach(file => {
        const fileCard = createFileCard(file);
        userFilesList.appendChild(fileCard);
    });
}

function changeProfilePhoto() {
    document.getElementById('profilePhotoInput').click();
}

async function uploadProfilePhoto() {
    const fileInput = document.getElementById('profilePhotoInput');
    const file = fileInput.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
        const response = await fetch(`${API_BASE_URL}/users/profile-image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });

        if (response.ok) {
            alert('Profile photo updated!');
            loadProfile();
        } else {
            alert('Failed to update profile photo');
        }
    } catch (error) {
        console.error('Upload profile photo error:', error);
        alert('Failed to upload photo');
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('uploadModal');
    if (event.target === modal) {
        closeUploadModal();
    }
}