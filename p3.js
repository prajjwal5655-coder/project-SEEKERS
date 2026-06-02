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
        comments: [{ author: "night_owl", text: "Anyone else coding late tonight?" }]
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

let profileDirectoryDB = {
    "r/indiasocial": { title: "r/indiasocial", avatar: "✨", bannerBg: "#4A4A4A", stats: "1,245,892 Members • 4.2K Online", description: "A casual, friendly space for Indians and anyone interested in India to hang out.", moderators: "u/night_owl, u/early_adopter" },
    "u/QVAC_Official": { title: "u/QVAC_Official (Verified Dev)", avatar: "⬛", bannerBg: "#111111", stats: "Official Enterprise Profile", description: "Engineers of the localized QVAC SDK ecosystem.", moderators: "QVAC Dev-Relations Core Team" },
    "r/AskReddit": { title: "r/AskReddit", avatar: "👽", bannerBg: "#0079D3", stats: "58,713,100 members", description: "The place to ask and answer thought-provoking questions.", moderators: "u/AutoModerator" },
    "r/leagueoflegends": { title: "r/leagueoflegends", avatar: "L", bannerBg: "#112233", stats: "8,384,910 members", description: "The premier community for the game League of Legends.", moderators: "u/RiotGames" },
    "r/OutOfTheLoop": { title: "r/OutOfTheLoop", avatar: "🔄", bannerBg: "#445566", stats: "3,695,458 members", description: "Have you ever seen a whole bunch of news stories/reddit posts/memes and had no idea what everyone was talking about?", moderators: "u/Mods" },
    "r/discordapp": { title: "r/discordapp", avatar: "👾", bannerBg: "#5865F2", stats: "1,514,906 members", description: "Dedicated to the chat application Discord.", moderators: "u/Discord_Staff" },
    "r/Twitch": { title: "r/Twitch", avatar: "🟣", bannerBg: "#9146FF", stats: "2,876,716 members", description: "Community-driven anchor for tracking Twitch.", moderators: "u/Twitch_Ambassador" }
};

let friendsList = ["night_owl", "early_adopter"];
let activeChatFriend = null;
let directMessages = {
    "night_owl": [{ sender: "night_owl", text: "Hey! Did you check out the new SEEKERS UI?" }],
    "early_adopter": [{ sender: "early_adopter", text: "Are we still coding tonight?" }]
};
let groupMembersList = ["night_owl", "System", "early_adopter"];
let groupMessages = [{ sender: "System", text: "Welcome to the community!" }];
let followingList = [];
let pendingRequests = [];
let targetActionUser = "";

// --- 2. Feed & Pages Logic ---
function renderFeed() {
    const container = document.getElementById("feed-container");
    container.innerHTML = ""; 

    postsData.forEach(post => {
        const isExpanded = expandedComments.has(post.id);
        const displayStyle = isExpanded ? "block" : "none";
        
        let commentsHTML = post.comments.map(c => `<div class="comment-item"><span class="comment-author">${c.author}</span><span>${c.text}</span></div>`).join('');
        if (post.comments.length === 0) commentsHTML = `<div class="comment-item" style="color: #878A8C; font-style: italic;">No comments yet. Be the first!</div>`;

        const card = document.createElement("div");
        card.className = `post-card`;
        
        let joinButtonHtml = post.isPromoted ? '' : `<button class="btn-join">Join</button>`;
        let awardHtml = post.awards > 0 ? `<button class="pill-btn">🏆 ${post.awards}</button>` : '';

        card.innerHTML = `
            <div class="post-header">
                <div class="header-left-info">
                    <div class="subreddit-icon" style="background: #EAEAEA;">${post.icon}</div>
                    <span class="subreddit-name" onclick="openCommunityPage('${post.subreddit}')">${post.subreddit}</span>
                    <span style="color:#1c1c1c">·</span>
                    <span>${post.time} ${post.isPromoted ? '<span class="promoted-tag">Promoted</span>' : ''}</span>
                </div>
                <div>${joinButtonHtml}<span class="dot-menu">•••</span></div>
            </div>
            <h2 class="post-title">${post.title}</h2>
            <p class="post-body">${post.body}</p>
            <div class="post-footer">
                <div class="action-pill vote-pill">
                    <button class="vote-btn up" onclick="handleVote(${post.id}, 1)">⇧</button>
                    <span id="vote-${post.id}" style="font-weight: bold;">${post.votes}</span>
                    <button class="vote-btn down" onclick="handleVote(${post.id}, -1)">⇩</button>
                </div>
                <div class="action-pill"><button class="pill-btn" onclick="toggleComments(${post.id})">💬 ${post.comments.length}</button></div>
                ${post.awards > 0 ? `<div class="action-pill">${awardHtml}</div>` : ''}
                <div class="action-pill"><button class="pill-btn">↪ Share</button></div>
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

function openCommunityPage(idName) {
    let isUser = idName.startsWith('u/');
    let data = profileDirectoryDB[idName] || {
        title: idName, 
        avatar: idName.replace('u/', '').charAt(0).toUpperCase(), 
        bannerBg: "#1c1c1c", 
        stats: isUser ? "SEEKERS Member" : "Newly Formed Identifier Space",
        description: isUser ? "This user hasn't added a bio yet." : "No description available yet.", 
        moderators: isUser ? "Self-managed account." : "Autonomous configuration."
    };
    
    document.getElementById('hub-title').textContent = data.title;
    document.getElementById('hub-avatar').textContent = data.avatar;
    document.getElementById('hub-banner-bg').style.backgroundColor = data.bannerBg;
    document.getElementById('hub-meta-stats').textContent = data.stats;
    document.getElementById('hub-description').textContent = data.description;
    document.getElementById('hub-moderators').textContent = data.moderators;
    switchPage('community-view');
}

function openUserProfilePage(username) {
    if (username === "System") return; 
    openCommunityPage(`u/${username}`);
}

function handleVote(postId, amount) {
    if (!currentUser) return openAuthModal('google_preview');
    const post = postsData.find(p => p.id === postId);
    if (!post) return;
    post.votes += amount; 
    document.getElementById(`vote-${postId}`).textContent = post.votes;
}

function toggleComments(postId) {
    if (expandedComments.has(postId)) expandedComments.delete(postId);
    else expandedComments.add(postId);
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
            id: Date.now(), subreddit: `u/${currentUser.username}`, icon: currentUser.initial, time: "Just now",
            title: titleInput.value.trim(), body: bodyInput.value.trim(), votes: 1, awards: 0, isPromoted: false, comments: []
        };
        postsData.unshift(newPost);
        renderFeed(); 
        titleInput.value = ""; bodyInput.value = "";
    }
}

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
    if (pageId === 'groupchat') { renderGroupChat(); renderGroupMembers(); }
    if (pageId === 'profile') renderPersonalProfile();
}

// --- 3. Personal Profile Logic ---
function renderPersonalProfile() {
    if (!currentUser) {
        openAuthModal('google_preview');
        switchPage('home');
        return;
    }
    document.getElementById('my-profile-avatar').textContent = currentUser.initial;
    document.getElementById('my-profile-name').textContent = currentUser.username;
    document.getElementById('my-profile-pronouns').textContent = currentUser.pronouns || "Add Pronouns";
    document.getElementById('my-profile-bio').textContent = currentUser.bio || "Click the pencil to add your professional headline or bio.";
    document.getElementById('my-profile-location').textContent = currentUser.location || "Add Location";
    document.getElementById('my-profile-email').textContent = currentUser.email;
}

function openEditProfileModal() {
    document.getElementById('edit-name').value = currentUser.username;
    document.getElementById('edit-pronouns').value = currentUser.pronouns || "";
    document.getElementById('edit-bio').value = currentUser.bio || "";
    document.getElementById('edit-location').value = currentUser.location || "";
    document.getElementById('edit-email').value = currentUser.email;
    document.getElementById('edit-profile-modal').style.display = 'flex';
}

function saveProfileChanges() {
    const newName = document.getElementById('edit-name').value.trim();
    const newEmail = document.getElementById('edit-email').value.trim();
    if(!newName || !newEmail) return alert("Name and Email are required fields.");

    currentUser.username = newName;
    currentUser.initial = newName.charAt(0).toUpperCase();
    currentUser.pronouns = document.getElementById('edit-pronouns').value.trim();
    currentUser.bio = document.getElementById('edit-bio').value.trim();
    currentUser.location = document.getElementById('edit-location').value.trim();
    currentUser.email = newEmail;

    localStorage.setItem('reddit_active_user', JSON.stringify(currentUser));
    let usersDB = JSON.parse(localStorage.getItem('reddit_users_db')) || {};
    if(usersDB[currentUser.email]) {
        usersDB[currentUser.email] = {...usersDB[currentUser.email], ...currentUser};
        localStorage.setItem('reddit_users_db', JSON.stringify(usersDB));
    }
    renderPersonalProfile();
    updateNavigationUI();
    closeModal('edit-profile-modal');
}

// --- 4. User Interactions Menu ---
function openUserActionMenu(context, directUsername = null) {
    if (!currentUser) return openAuthModal('google_preview');
    
    let name = directUsername;
    if (!name) {
        let inputId = context === 'dm' ? 'new-friend-input' : 'new-group-member-input';
        let input = document.getElementById(inputId);
        name = input.value.trim();
        if (input) input.value = "";
    }
    
    if (!name) return alert("Please type a username to search first.");
    
    if (name.toLowerCase() === currentUser.username.toLowerCase() || name === "System") {
        if (name !== "System") switchPage('profile');
        return;
    }
    
    targetActionUser = name;
    document.getElementById('action-username').textContent = name;
    document.getElementById('action-user-avatar').textContent = name.charAt(0).toUpperCase();
    
    let followBtn = document.getElementById('btn-action-follow');
    if (followingList.includes(name)) {
        followBtn.textContent = "Following"; followBtn.style.background = "#1c1c1c"; followBtn.style.color = "white";
    } else {
        followBtn.textContent = "Follow"; followBtn.style.background = "#F2F2F2"; followBtn.style.color = "#1c1c1c";
    }
    
    let requestBtn = document.getElementById('btn-action-request');
    if (friendsList.includes(name)) {
        requestBtn.textContent = "Already Friends"; requestBtn.disabled = true;
    } else if (pendingRequests.includes(name)) {
        requestBtn.textContent = "Request Sent"; requestBtn.disabled = true;
    } else {
        requestBtn.textContent = "Send Friend Request"; requestBtn.disabled = false;
    }
    
    let groupBtn = document.getElementById('btn-action-add-group');
    if (context === 'group' || context === 'list') {
        groupBtn.style.display = 'block';
        if (groupMembersList.includes(name)) {
            groupBtn.textContent = "Already in Group"; groupBtn.disabled = true;
        } else {
            groupBtn.textContent = "Add to Community Chat"; groupBtn.disabled = false;
        }
    } else {
        groupBtn.style.display = 'none';
    }
    
    document.getElementById('user-action-modal').style.display = 'flex';
}

function viewActionUserProfile() {
    closeModal('user-action-modal');
    openUserProfilePage(targetActionUser);
}

function toggleFollow() {
    let followBtn = document.getElementById('btn-action-follow');
    if (followingList.includes(targetActionUser)) {
        followingList = followingList.filter(u => u !== targetActionUser);
        followBtn.textContent = "Follow"; followBtn.style.background = "#F2F2F2"; followBtn.style.color = "#1c1c1c";
    } else {
        followingList.push(targetActionUser);
        followBtn.textContent = "Following"; followBtn.style.background = "#1c1c1c"; followBtn.style.color = "white";
    }
}

function sendFriendRequest() {
    pendingRequests.push(targetActionUser);
    document.getElementById('btn-action-request').textContent = "Request Sent";
    document.getElementById('btn-action-request').disabled = true;
    const newlyRequestedUser = targetActionUser; 
    setTimeout(() => {
        if (!friendsList.includes(newlyRequestedUser)) {
            friendsList.push(newlyRequestedUser);
            directMessages[newlyRequestedUser] = [{ sender: "System", text: `${newlyRequestedUser} accepted your friend request!` }];
            if (document.getElementById('page-chat').classList.contains('active-page')) renderFriendsList();
            alert(`${newlyRequestedUser} has accepted your friend request!`);
        }
    }, 2000);
}

function confirmAddGroup() {
    if (!groupMembersList.includes(targetActionUser)) {
        groupMembersList.push(targetActionUser);
        groupMessages.push({ sender: "System", text: `${currentUser.username} added ${targetActionUser} to the community.` });
        document.getElementById('btn-action-add-group').textContent = "Added to Group";
        document.getElementById('btn-action-add-group').disabled = true;
        if (document.getElementById('page-groupchat').classList.contains('active-page')) {
            renderGroupMembers(); renderGroupChat();
        }
    }
}

// --- 5. Chat Core Engines ---
function renderFriendsList() {
    const list = document.getElementById('friends-list');
    list.innerHTML = "";
    friendsList.forEach(friend => {
        const li = document.createElement('li');
        if (friend === activeChatFriend) li.className = 'active-chat';
        li.innerHTML = `<div class="contact-avatar">${friend.charAt(0).toUpperCase()}</div><span>${friend}</span>`;
        li.onclick = () => openDirectMessage(friend);
        list.appendChild(li);
    });
}

function openDirectMessage(friendName) {
    activeChatFriend = friendName;
    document.getElementById('chat-header-title').textContent = `Chatting with ${friendName}`;
    document.getElementById('dm-message-input').disabled = false;
    document.getElementById('btn-send-dm').disabled = false;
    renderFriendsList(); renderDMMessages();
}

function renderDMMessages() {
    const container = document.getElementById('dm-messages-container');
    container.innerHTML = "";
    if (!activeChatFriend || !directMessages[activeChatFriend]) return;
    directMessages[activeChatFriend].forEach(msg => {
        const isMe = msg.sender === (currentUser ? currentUser.username : "");
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${isMe ? 'sent' : 'received'}`;
        if (msg.sender === "System") {
            wrapper.style.alignSelf = "center";
            wrapper.innerHTML = `<span style="font-size: 12px; color: #878A8C; font-style: italic; margin: 10px 0;">${msg.text}</span>`;
        } else {
            wrapper.innerHTML = `<span class="message-sender-name" onclick="openUserProfilePage('${msg.sender}')">${msg.sender}</span><div class="message-bubble">${msg.text}</div>`;
        }
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
        input.value = ""; renderDMMessages();
    }
}

function renderGroupMembers() {
    const list = document.getElementById('group-members-list');
    list.innerHTML = "";
    let displayList = [...groupMembersList];
    if (currentUser && !displayList.includes(currentUser.username)) displayList.unshift(currentUser.username);
    
    displayList.forEach(member => {
        const li = document.createElement('li');
        li.innerHTML = `<div class="contact-avatar">${member.charAt(0).toUpperCase()}</div><span>${member}</span>`;
        li.onclick = () => openUserActionMenu('list', member);
        list.appendChild(li);
    });
}

function renderGroupChat() {
    const container = document.getElementById('group-messages-container');
    container.innerHTML = "";
    groupMessages.forEach(msg => {
        const isMe = currentUser && msg.sender === currentUser.username;
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${isMe ? 'sent' : 'received'}`;
        if (msg.sender === "System") {
            wrapper.style.alignSelf = "center";
            wrapper.innerHTML = `<span style="font-size: 12px; color: #878A8C; font-style: italic; margin: 10px 0;">${msg.text}</span>`;
        } else {
            wrapper.innerHTML = `<span class="message-sender-name" onclick="openUserProfilePage('${msg.sender}')">${msg.sender}</span><div class="message-bubble">${msg.text}</div>`;
        }
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
        input.value = ""; renderGroupChat();
    }
}

// --- 6. Auth Logic ---
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
        if (postAvatar) { postAvatar.textContent = currentUser.initial; postAvatar.style.background = "#1c1c1c"; }
    } else {
        authContainer.innerHTML = `<button class="btn-login" onclick="openAuthModal('google_preview')">Log In</button><button class="btn-signup" onclick="openAuthModal('signup')">Sign Up</button>`;
        if (postAvatar) { postAvatar.textContent = "U"; postAvatar.style.background = "#1c1c1c"; }
    }
}

function openAuthModal(mode) {
    currentAuthMode = mode;
    const modal = document.getElementById('auth-modal');
    document.getElementById('auth-error').style.display = 'none';

    if (mode === 'google_preview') {
        document.getElementById('modal-title-text').textContent = "Sign in to SEEKERS with Google";
        document.getElementById('google-preview-section').style.display = 'block';
        document.getElementById('manual-auth-section').style.display = 'none';
    } else {
        document.getElementById('google-preview-section').style.display = 'none';
        document.getElementById('manual-auth-section').style.display = 'block';
        const isSignUp = mode === 'signup';
        document.getElementById('modal-title-text').textContent = isSignUp ? "Create an Account" : "Log In";
        document.getElementById('auth-username').style.display = isSignUp ? 'block' : 'none';
        document.getElementById('auth-submit-btn').textContent = isSignUp ? 'Sign Up' : 'Log In';
        document.getElementById('auth-switch-prompt').textContent = isSignUp ? 'Already a Seeker?' : 'New to SEEKERS?';
        document.getElementById('auth-switch-link').textContent = isSignUp ? 'Log In' : 'Sign Up';
    }
    modal.style.display = 'flex';
}

function toggleAuthMode(event) {
    event.preventDefault(); openAuthModal(currentAuthMode === 'login' ? 'signup' : 'login');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

function processAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const pass = document.getElementById('auth-password').value.trim();
    const user = document.getElementById('auth-username').value.trim();
    let usersDB = JSON.parse(localStorage.getItem('reddit_users_db')) || {};

    if (currentAuthMode === 'signup') {
        if (!email || !pass || !user) return document.getElementById('auth-error').style.display = 'block';
        if (usersDB[email]) return document.getElementById('auth-error').style.display = 'block';
        usersDB[email] = { email, pass, username: user };
        localStorage.setItem('reddit_users_db', JSON.stringify(usersDB));
        completeLogin(user, email);
    } else {
        if (!email || !pass) return document.getElementById('auth-error').style.display = 'block';
        if (usersDB[email] && usersDB[email].pass === pass) {
            completeLogin(usersDB[email].username, email);
        } else {
            document.getElementById('auth-error').style.display = 'block';
        }
    }
}

function completeLogin(username, email) {
    let usersDB = JSON.parse(localStorage.getItem('reddit_users_db')) || {};
    let existingData = usersDB[email] || {};

    let defaultBio = "A passionate SEEKERS member.";
    let defaultLocation = "Planet Earth";
    let defaultPronouns = "They/Them";

    if (email === 'prajjwal5655@gmail.com' || username === 'Prajjwal Maurya') {
        defaultBio = "B.Tech 1st year CSE AI/ML student at Galgotias college programming with hands-on experience in machine learning & data science. | Eager to contribute to AI-driven solutions.";
        defaultLocation = "Varanasi, Uttar Pradesh, India";
        defaultPronouns = "He/Him";
    }

    const userData = { 
        username: existingData.username || username, 
        email: email, 
        initial: (existingData.username || username).charAt(0).toUpperCase(),
        bio: existingData.bio || defaultBio,
        location: existingData.location || defaultLocation,
        pronouns: existingData.pronouns || defaultPronouns
    };

    localStorage.setItem('reddit_active_user', JSON.stringify(userData));
    currentUser = userData;
    closeModal('auth-modal');
    updateNavigationUI();
    
    if (document.getElementById('page-chat').classList.contains('active-page')) renderDMMessages();
    if (document.getElementById('page-groupchat').classList.contains('active-page')) { renderGroupChat(); renderGroupMembers(); }
    if (document.getElementById('page-profile').classList.contains('active-page')) renderPersonalProfile();
}

function logoutUser() {
    localStorage.removeItem('reddit_active_user');
    currentUser = null;
    updateNavigationUI();
    if (document.getElementById('page-profile').classList.contains('active-page')) switchPage('home');
}

window.onclick = function(event) {
    if (event.target.classList.contains('floating-modal-overlay')) event.target.style.display = "none";
}

// --- 7. Boot Up ---
document.addEventListener("DOMContentLoaded", () => {
    updateNavigationUI();
    renderFeed();
});

// ==========================================
// 8. PYTHON BACKEND CHATBOT CONNECTION
// ==========================================

const BOT_CONFIG = {
    // ⚠️ Replace this with your actual Python API URL
    API_URL: "http://localhost:5000/api/chat", 
    // ⚠️ Replace this with your actual AI Model name
    MODEL_NAME: "gemini-1.5-flash"       
};

function toggleChatbot() {
    const widget = document.getElementById('chatbot-widget');
    widget.classList.toggle('chatbot-hidden');
    if (!widget.classList.contains('chatbot-hidden')) {
        document.getElementById('chatbot-input-field').focus();
    }
}

function handleBotKeyPress(e) {
    if (e.key === 'Enter') sendBotMessage();
}

async function sendBotMessage() {
    const inputField = document.getElementById('chatbot-input-field');
    const sendButton = inputField.nextElementSibling;
    const text = inputField.value.trim();
    if (!text) return;

    // 1. Show user message
    appendBotMessage(text, 'user-msg');
    inputField.value = '';

    // Lock inputs
    inputField.disabled = true;
    sendButton.disabled = true;

    // 2. Show thinking indicator
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'bot-typing';
    typingIndicator.id = 'bot-typing-indicator';
    typingIndicator.textContent = 'SeekerBot is thinking...';
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 3. Fetch from API
    const reply = await fetchAIResponse(text);

    // 4. Remove indicator and show reply
    const indicator = document.getElementById('bot-typing-indicator');
    if (indicator) indicator.remove();
    
    appendBotMessage(reply, 'bot-msg');

    // Unlock inputs
    inputField.disabled = false;
    sendButton.disabled = false;
    inputField.focus();
}

function appendBotMessage(text, className) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = className;
    msgDiv.textContent = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 🧠 NEW: Sending data to your Python Server
async function fetchAIResponse(userText) {
    try {
        const response = await fetch(BOT_CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                model: BOT_CONFIG.MODEL_NAME, 
                message: userText 
            })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        
        // Fallback to data.response or data.reply depending on your custom API structure
        return data.reply || data.response || "Received an empty response from the AI.";
        
    } catch (error) {
        console.error("AI API Connection Failed:", error);
        return "My backend is currently offline! Ensure your API server is running at " + BOT_CONFIG.API_URL;
    }
}