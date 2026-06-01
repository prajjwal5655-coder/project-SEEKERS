// --- 1. Global State & DB ---
let currentUser = JSON.parse(localStorage.getItem('reddit_active_user')) || null;
let currentAuthMode = 'google_preview'; 
const expandedComments = new Set(); 

let postsData = [
    {
        id: 1,
        subreddit: "r/indiasocial",
        icon: "✨",
        time: "2 hr. ago",
        title: "Late Night Random Discussion Thread - 01 June, 2026",
        body: "Place for Random Thoughts. Share away anything you want, and make some new friends along the way :) Rules | Commands | Helpline | Wiki",
        votes: 16,
        awards: 1,
        isPromoted: false,
        comments: [
            { author: "night_owl", text: "Anyone else coding late tonight?" }
        ]
    },
    {
        id: 2,
        subreddit: "u/QVAC_Official",
        icon: "⬛",
        time: "Promoted",
        title: "Why pay per token or per minute when you can run it on your own hardware? QVAC SDK is built for developers who want to cut the cord from centralized cloud providers.",
        body: "",
        votes: 124,
        awards: 0,
        isPromoted: true,
        comments: []
    }
];

// --- Chat DB State ---
let friendsList = ["night_owl", "early_adopter"];
let activeChatFriend = null;
let directMessages = {
    "night_owl": [
        { sender: "night_owl", text: "Hey! Did you check out the new SEEKER UI?" }
    ],
    "early_adopter": [
        { sender: "early_adopter", text: "Are we still coding tonight?" }
    ]
};
let groupMessages = [
    { sender: "System", text: "Welcome to the r/indiasocial Community Chat!" },
    { sender: "night_owl", text: "Hello everyone!" }
];

// --- 2. Feed Rendering & Interactions ---
function renderFeed() {
    const container = document.getElementById("feed-container");
    container.innerHTML = ""; 

    postsData.forEach(post => {
        const isExpanded = expandedComments.has(post.id);
        const displayStyle = isExpanded ? "block" : "none";
        
        let commentsHTML = post.comments.map(c => `
            <div class="comment-item">
                <span class="comment-author">${c.author}</span>
                <span>${c.text}</span>
            </div>
        `).join('');

        if (post.comments.length === 0) {
            commentsHTML = `<div class="comment-item" style="color: #878A8C; font-style: italic;">No comments yet. Be the first!</div>`;
        }

        const card = document.createElement("div");
        card.className = `post-card`;
        
        let joinButtonHtml = post.isPromoted ? '' : `<button class="btn-join">Join</button>`;
        let awardHtml = post.awards > 0 ? `<button class="pill-btn">🏆 ${post.awards}</button>` : '';
        let bodyHtml = post.body ? `<p class="post-body">${post.body}</p>` : '';

        card.innerHTML = `
            <div class="post-header">
                <div class="header-left-info">
                    <div class="subreddit-icon" style="background: #EAEAEA;">${post.icon}</div>
                    <span class="subreddit-name">${post.subreddit}</span>
                    <span style="color:#1c1c1c">·</span>
                    <span>${post.time} ${post.isPromoted ? '<span class="promoted-tag">Promoted</span>' : ''}</span>
                </div>
                <div>
                    ${joinButtonHtml}
                    <span class="dot-menu">•••</span>
                </div>
            </div>
            <h2 class="post-title">${post.title}</h2>
            ${bodyHtml}
            
            <div class="post-footer">
                <div class="action-pill vote-pill">
                    <button class="vote-btn up" onclick="handleVote(${post.id}, 1)">⇧</button>
                    <span id="vote-${post.id}" style="font-weight: bold;">${post.votes}</span>
                    <button class="vote-btn down" onclick="handleVote(${post.id}, -1)">⇩</button>
                </div>
                <div class="action-pill">
                    <button class="pill-btn" onclick="toggleComments(${post.id})">💬 ${post.comments.length}</button>
                </div>
                ${post.awards > 0 ? `<div class="action-pill">${awardHtml}</div>` : ''}
                <div class="action-pill">
                    <button class="pill-btn">↪ Share</button>
                </div>
            </div>

            <div class="comments-section" style="display: ${displayStyle};">
                <div class="comments-list">${commentsHTML}</div>
                <div class="add-comment-box">
                    <input type="text" id="comment-input-${post.id}" placeholder="What are your thoughts?">
                    <button class="btn-reply" onclick="submitComment(${post.id})">Reply</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function handleVote(postId, amount) {
    if (!currentUser) return openAuthModal('google_preview');
    const post = postsData.find(p => p.id === postId);
    if (!post) return;
    post.votes += amount; 
    document.getElementById(`vote-${postId}`).textContent = post.votes;
}

function toggleComments(postId) {
    if (expandedComments.has(postId)) {
        expandedComments.delete(postId);
    } else {
        expandedComments.add(postId);
    }
    renderFeed();
}

function submitComment(postId) {
    if (!currentUser) return openAuthModal('google_preview');
    const inputField = document.getElementById(`comment-input-${postId}`);
    const text = inputField.value.trim();
    if (text !== "") {
        const post = postsData.find(p => p.id === postId);
        post.comments.push({ author: currentUser.username, text: text });
        renderFeed();
    }
}

function submitNewPost() {
    if (!currentUser) return openAuthModal('google_preview');
    const titleInput = document.getElementById("post-title-input");
    const bodyInput = document.getElementById("post-body-input");
    
    if (titleInput.value.trim() !== "") {
        const newPost = {
            id: Date.now(), 
            subreddit: `u/${currentUser.username}`,
            icon: currentUser.initial,
            time: "Just now",
            title: titleInput.value.trim(),
            body: bodyInput.value.trim(),
            votes: 1,
            awards: 0,
            isPromoted: false,
            comments: []
        };
        postsData.unshift(newPost);
        renderFeed(); 
        titleInput.value = ""; bodyInput.value = "";
    } else {
        alert("Please enter a title for your post.");
    }
}

// Left Sidebar Navigation
function switchPage(pageId) {
    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active-page'));
    const target = document.getElementById(`page-${pageId}`);
    if (target) target.classList.add('active-page');

    document.querySelectorAll('.left-sidebar .nav-links li').forEach(i => i.classList.remove('active'));
    
    if(event && event.currentTarget && event.currentTarget.tagName === 'LI') {
        event.currentTarget.classList.add('active');
    } else {
        const navEl = document.getElementById(`nav-${pageId}`);
        if(navEl) navEl.classList.add('active');
    }

    if (pageId === 'chat') renderFriendsList();
    if (pageId === 'groupchat') renderGroupChat();
}

// --- 3. Chat Logic Engine ---
function renderFriendsList() {
    const list = document.getElementById('friends-list');
    list.innerHTML = "";
    
    friendsList.forEach(friend => {
        const li = document.createElement('li');
        if (friend === activeChatFriend) li.className = 'active-chat';
        
        li.innerHTML = `
            <div class="contact-avatar">${friend.charAt(0).toUpperCase()}</div>
            <span>${friend}</span>
        `;
        li.onclick = () => openDirectMessage(friend);
        list.appendChild(li);
    });
}

function addFriend() {
    if (!currentUser) return openAuthModal('google_preview');
    const input = document.getElementById('new-friend-input');
    const name = input.value.trim();
    if (name && !friendsList.includes(name)) {
        friendsList.push(name);
        directMessages[name] = []; 
        input.value = "";
        renderFriendsList();
    }
}

function openDirectMessage(friendName) {
    activeChatFriend = friendName;
    document.getElementById('chat-header-title').textContent = `Chatting with ${friendName}`;
    document.getElementById('dm-message-input').disabled = false;
    document.getElementById('btn-send-dm').disabled = false;
    renderFriendsList();
    renderDMMessages();
}

function renderDMMessages() {
    const container = document.getElementById('dm-messages-container');
    container.innerHTML = "";
    
    if (!activeChatFriend || !directMessages[activeChatFriend]) return;

    directMessages[activeChatFriend].forEach(msg => {
        const isMe = msg.sender === (currentUser ? currentUser.username : "");
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${isMe ? 'sent' : 'received'}`;
        wrapper.innerHTML = `
            <span class="message-sender-name">${msg.sender}</span>
            <div class="message-bubble">${msg.text}</div>
        `;
        container.appendChild(wrapper);
    });
    container.scrollTop = container.scrollHeight; 
}

function sendDM() {
    if (!currentUser) return openAuthModal('google_preview');
    if (!activeChatFriend) return;
    
    const input = document.getElementById('dm-message-input');
    const text = input.value.trim();
    if (text !== "") {
        directMessages[activeChatFriend].push({ sender: currentUser.username, text: text });
        input.value = "";
        renderDMMessages();
    }
}

function renderGroupChat() {
    const container = document.getElementById('group-messages-container');
    container.innerHTML = "";
    
    groupMessages.forEach(msg => {
        const isMe = currentUser && msg.sender === currentUser.username;
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${isMe ? 'sent' : 'received'}`;
        wrapper.innerHTML = `
            <span class="message-sender-name">${msg.sender}</span>
            <div class="message-bubble">${msg.text}</div>
        `;
        container.appendChild(wrapper);
    });
    container.scrollTop = container.scrollHeight;
}

function sendGroupMessage() {
    if (!currentUser) return openAuthModal('google_preview');
    
    const input = document.getElementById('group-message-input');
    const text = input.value.trim();
    if (text !== "") {
        groupMessages.push({ sender: currentUser.username, text: text });
        input.value = "";
        renderGroupChat();
    }
}


// --- 4. Authentication UI & State Logic ---
function updateNavigationUI() {
    const authContainer = document.getElementById('nav-auth-container');
    const postAvatar = document.getElementById('post-avatar');
    
    if (currentUser) {
        authContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <div class="avatar-small" style="width: 32px; height: 32px; background: #1c1c1c;">${currentUser.initial}</div>
                <button class="btn-login" onclick="logoutUser()">Log Out</button>
            </div>
        `;
        if (postAvatar) {
            postAvatar.textContent = currentUser.initial;
            postAvatar.style.background = "#1c1c1c";
        }
    } else {
        authContainer.innerHTML = `
            <button class="btn-login" onclick="openAuthModal('google_preview')">Log In</button>
            <button class="btn-signup" onclick="openAuthModal('signup')">Sign Up</button>
        `;
        if (postAvatar) {
            postAvatar.textContent = "U";
            postAvatar.style.background = "#1c1c1c";
        }
    }
}

function openAuthModal(mode) {
    currentAuthMode = mode;
    const modal = document.getElementById('auth-modal');
    const googleSection = document.getElementById('google-preview-section');
    const manualSection = document.getElementById('manual-auth-section');
    const titleText = document.getElementById('modal-title-text');
    const errorMsg = document.getElementById('auth-error');
    
    errorMsg.style.display = 'none';

    if (mode === 'google_preview') {
        titleText.textContent = "Sign in to SEEKER with Google";
        googleSection.style.display = 'block';
        manualSection.style.display = 'none';
    } else {
        googleSection.style.display = 'none';
        manualSection.style.display = 'block';
        
        const isSignUp = mode === 'signup';
        titleText.textContent = isSignUp ? "Create an Account" : "Log In";
        document.getElementById('auth-username').style.display = isSignUp ? 'block' : 'none';
        document.getElementById('auth-submit-btn').textContent = isSignUp ? 'Sign Up' : 'Log In';
        document.getElementById('auth-switch-prompt').textContent = isSignUp ? 'Already a Seeker?' : 'New to SEEKER?';
        document.getElementById('auth-switch-link').textContent = isSignUp ? 'Log In' : 'Sign Up';
    }
    modal.style.display = 'block';
}

function toggleAuthMode(event) {
    event.preventDefault();
    openAuthModal(currentAuthMode === 'login' ? 'signup' : 'login');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

function processAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const pass = document.getElementById('auth-password').value.trim();
    const user = document.getElementById('auth-username').value.trim();
    const errorMsg = document.getElementById('auth-error');

    let usersDB = JSON.parse(localStorage.getItem('reddit_users_db')) || {};

    if (currentAuthMode === 'signup') {
        if (!email || !pass || !user) return showError("All fields required.");
        if (usersDB[email]) return showError("Email already registered.");
        usersDB[email] = { email, pass, username: user };
        localStorage.setItem('reddit_users_db', JSON.stringify(usersDB));
        completeLogin(user, email);
    } else {
        if (!email || !pass) return showError("Email and Password required.");
        if (usersDB[email] && usersDB[email].pass === pass) {
            completeLogin(usersDB[email].username, email);
        } else {
            showError("Invalid credentials.");
        }
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
    }
}

function completeLogin(username, email) {
    const userData = { username, email, initial: username.charAt(0).toUpperCase() };
    localStorage.setItem('reddit_active_user', JSON.stringify(userData));
    currentUser = userData;
    closeModal('auth-modal');
    updateNavigationUI();
    
    if (document.getElementById('page-chat').classList.contains('active-page')) renderDMMessages();
    if (document.getElementById('page-groupchat').classList.contains('active-page')) renderGroupChat();
}

function logoutUser() {
    localStorage.removeItem('reddit_active_user');
    currentUser = null;
    updateNavigationUI();
}

window.onclick = function(event) {
    const modal = document.getElementById('auth-modal');
    if (event.target === modal) modal.style.display = "none";
}

// --- 5. Boot Up ---
document.addEventListener("DOMContentLoaded", () => {
    updateNavigationUI();
    renderFeed();
});