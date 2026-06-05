// ==========================================
// 1. PROFESSIONAL STATE SECURITY & CACHING
// ==========================================
// 🔒 Anti-XSS Sanitization Protocol (Secures against script injections)
const escapeHTML = str => str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
);

// 💾 Local Storage Hooks (Memory Persistence)
function loadDbState(key, fallback) {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
}

function saveDbState() {
    localStorage.setItem('seekers_posts', JSON.stringify(postsData));
    localStorage.setItem('seekers_dms', JSON.stringify(directMessages));
    localStorage.setItem('seekers_groups', JSON.stringify(allGroupChats));
    localStorage.setItem('seekers_profile_db', JSON.stringify(profileDirectoryDB));
}

// --- 2. Global State & Databases ---
let currentUser = JSON.parse(localStorage.getItem('reddit_active_user')) || null;
let currentAuthMode = 'google_preview'; 
const expandedComments = new Set(); 

// Load from cache or use default fallbacks
let postsData = loadDbState('seekers_posts', [
    { id: 1, subreddit: "r/indiasocial", icon: "✨", time: "2 hr. ago", title: "Late Night Random Discussion Thread - 01 June, 2026", body: "Place for Random Thoughts. Share away anything you want, and make some new friends along the way :)", votes: 116, awards: 1, category: "general", comments: [{ author: "night_owl", text: "Anyone else coding late tonight?" }] },
    { id: 2, subreddit: "u/QVAC_Official", icon: "⬛", time: "Promoted", title: "Why pay per token or per minute when you can run it on your own hardware? QVAC SDK is built for developers.", body: "", votes: 124, awards: 0, category: "tech", comments: [] },
    { id: 3, subreddit: "r/programming", icon: "👨‍💻", time: "5 hr. ago", title: "Bypassing compilation recursion depth limit checks in standard structural scripting environments.", body: "A clean architectural workaround mapping environment memory addresses dynamically via local pointer stacks to achieve direct inline looping optimizations.", votes: 89, awards: 2, category: "tech", comments: [{ author: "prajjwal_m", text: "Incredible speed up on standard HP setups." }] },
    { id: 4, subreddit: "r/gamingmemes", icon: "😹", time: "10 hr. ago", title: "When you run an infinite loop in your code on production server...", body: "🔥 Total server meltdown sequence initiated. RIP hosting credit tokens.", votes: 342, awards: 1, category: "memes", comments: [] }
]);

let profileDirectoryDB = loadDbState('seekers_profile_db', {
    "r/indiasocial": { title: "r/indiasocial", avatar: "✨", bannerBg: "#4A4A4A", stats: "1,245,892 Members • 4.2K Online", description: "A casual, friendly space for Indians and anyone interested in India to hang out.", moderators: "u/night_owl, u/early_adopter", joined: true },
    "u/QVAC_Official": { title: "u/QVAC_Official (Verified Dev)", avatar: "⬛", bannerBg: "#111111", stats: "Official Enterprise Profile", description: "Engineers of the localized QVAC SDK ecosystem.", moderators: "QVAC Dev-Relations Core Team", joined: false },
    "r/AskReddit": { title: "r/AskReddit", avatar: "👽", bannerBg: "#0079D3", stats: "58,713,100 members", description: "The place to ask and answer thought-provoking questions.", moderators: "u/AutoModerator", joined: false },
    "r/leagueoflegends": { title: "r/leagueoflegends", avatar: "L", bannerBg: "#112233", stats: "8,384,910 members", description: "The premier community for the game League of Legends.", moderators: "u/RiotGames", joined: false },
    "r/OutOfTheLoop": { title: "r/OutOfTheLoop", avatar: "🔄", bannerBg: "#445566", stats: "3,695,458 members", description: "Have you ever seen a whole bunch of news stories/reddit posts/memes and had no idea what everyone was talking about?", moderators: "u/Mods", joined: false },
    "r/discordapp": { title: "r/discordapp", avatar: "👾", bannerBg: "#5865F2", stats: "1,514,906 members", description: "Dedicated to the chat application Discord.", moderators: "u/Discord_Staff", joined: false },
    "r/Twitch": { title: "r/Twitch", avatar: "🟣", bannerBg: "#9146FF", stats: "2,876,716 members", description: "Community-driven anchor for tracking Twitch.", moderators: "u/Twitch_Ambassador", joined: false }
});

let newsData = [
    { tag: "TECH", title: "New API Key Syntax Released by Cloud Infrastructure Giants", summary: "Legacy AI keys are being systematically replaced with modular tokens beginning with character arrays to optimize parsing efficiency.", icon: "📡" },
    { tag: "GAMING", title: "BGMI Championship Tournament Schedules Locked for July 2026", summary: "World Champion configurations are setting standard map loops as regional esports grids confirm team allocations this afternoon.", icon: "🏆" },
    { tag: "AI/ML", title: "Localized Large Language Models Execute Natively on Client Machines", summary: "Edge processing frameworks scale down compute demands, letting consumer setups manage continuous prompt iterations without latency hooks.", icon: "🧠" }
];

let friendsList = ["night_owl", "early_adopter"];
let activeChatFriend = null;
let directMessages = loadDbState('seekers_dms', {
    "night_owl": [{ sender: "night_owl", text: "Hey! Did you check out the new SEEKERS UI?" }],
    "early_adopter": [{ sender: "early_adopter", text: "Are we still coding tonight?" }]
});

let groupMembersList = ["night_owl", "System", "early_adopter"];
let followingList = [];
let pendingRequests = [];
let targetActionUser = "";

// --- 3. Custom Feed Builders & Page Engines ---
function renderFeed(targetCategory = "all", containerId = "feed-container") {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ""; 

    let filtered = postsData;
    if (targetCategory === "popular") {
        filtered = [...postsData].filter(p => p.votes >= 100).sort((a,b) => b.votes - a.votes);
    } else if (targetCategory !== "all") {
        filtered = postsData.filter(p => p.category === targetCategory);
    }

    if (filtered.length === 0) {
        container.innerHTML = `<p style="padding:20px; text-align:center; color:#5c5c5c; font-style:italic;">No structural thread entries registered in this array.</p>`;
        return;
    }

    filtered.forEach(post => {
        const isExpanded = expandedComments.has(post.id);
        const displayStyle = isExpanded ? "block" : "none";
        
        let commentsHTML = post.comments.map(c => `<div class="comment-item"><span class="comment-author">${escapeHTML(c.author)}</span><span>${escapeHTML(c.text)}</span></div>`).join('');
        if (post.comments.length === 0) commentsHTML = `<div class="comment-item" style="color: #878A8C; font-style: italic;">No comments yet. Be the first!</div>`;

        const card = document.createElement("div");
        card.className = `post-card`;
        
        let joinButtonHtml = post.isPromoted ? '' : `<button class="btn-join">Join</button>`;

        card.innerHTML = `
            <div class="post-header">
                <div class="header-left-info">
                    <div class="subreddit-icon" style="background: #EAEAEA;">${escapeHTML(post.icon)}</div>
                    <span class="subreddit-name" onclick="openCommunityPage('${escapeHTML(post.subreddit)}')">${escapeHTML(post.subreddit)}</span>
                    <span style="color:#1c1c1c">·</span>
                    <span>${escapeHTML(post.time)}</span>
                </div>
                <div>${joinButtonHtml}</div>
            </div>
            <h2 class="post-title">${escapeHTML(post.title)}</h2>
            <p class="post-body">${escapeHTML(post.body)}</p>
            <div class="post-footer">
                <div class="action-pill vote-pill">
                    <button class="vote-btn up" onclick="handleVote(${post.id}, 1, '${targetCategory}', '${containerId}')">⇧</button>
                    <span style="font-weight: bold;">${post.votes}</span>
                    <button class="vote-btn down" onclick="handleVote(${post.id}, -1, '${targetCategory}', '${containerId}')">⇩</button>
                </div>
                <div class="action-pill"><button class="pill-btn" onclick="toggleComments(${post.id}, '${targetCategory}', '${containerId}')">💬 ${post.comments.length}</button></div>
                <div class="action-pill"><button class="pill-btn">↪ Share</button></div>
            </div>
            <div class="comments-section" style="display: ${displayStyle};">
                <div class="comments-list">${commentsHTML}</div>
                <div class="add-comment-box">
                    <input type="text" id="comment-input-${post.id}" placeholder="What are your thoughts?" onkeypress="if(event.key === 'Enter') submitComment(${post.id}, '${targetCategory}', '${containerId}')">
                    <button class="btn-reply" onclick="submitComment(${post.id}, '${targetCategory}', '${containerId}')">Reply</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function handleVote(postId, amount, targetCategory, containerId) {
    if (!currentUser) return openAuthModal('google_preview');
    const post = postsData.find(p => p.id === postId);
    if (!post) return;
    post.votes += amount; 
    saveDbState();
    renderFeed(targetCategory, containerId);
}

function toggleComments(postId, targetCategory, containerId) {
    if (expandedComments.has(postId)) expandedComments.delete(postId);
    else expandedComments.add(postId);
    renderFeed(targetCategory, containerId);
}

function submitComment(postId, targetCategory, containerId) {
    if (!currentUser) return openAuthModal('google_preview');
    const inputField = document.getElementById(`comment-input-${postId}`);
    const text = inputField.value.trim();
    if (text !== "") {
        const post = postsData.find(p => p.id === postId);
        post.comments.push({ author: currentUser.username, text: text });
        saveDbState();
        renderFeed(targetCategory, containerId);
    }
}

function submitNewPost(category) {
    if (!currentUser) return openAuthModal('google_preview');
    
    let titleEl = document.getElementById(`${category}-title-input`);
    let bodyEl = document.getElementById(`${category}-body-input`);
    if (!titleEl || titleEl.value.trim() === "") return;

    const newPost = {
        id: Date.now(), subreddit: `u/${currentUser.username}`, icon: currentUser.initial, time: "Just now",
        title: titleEl.value.trim(), body: bodyEl.value.trim(), votes: 1, category: category, comments: []
    };
    
    postsData.unshift(newPost);
    saveDbState();
    titleEl.value = ""; bodyEl.value = "";
    
    if(category === "home") renderFeed("all", "feed-container");
    if(category === "tech") renderFeed("tech", "tech-feed-container");
    if(category === "memes") renderFeed("memes", "memes-feed-container");
}

function switchPage(pageId) {
    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active-page'));
    const target = document.getElementById(`page-${pageId}`);
    if (target) target.classList.add('active-page');

    document.querySelectorAll('.sidebar .nav-links li').forEach(i => i.classList.remove('active'));
    const navEl = document.getElementById(`nav-${pageId}`);
    if(navEl) navEl.classList.add('active');

    // Restore page state dynamically
    if (pageId === 'home') renderFeed("all", "feed-container");
    if (pageId === 'popular') renderFeed("popular", "popular-feed-container");
    if (pageId === 'tech') renderFeed("tech", "tech-feed-container");
    if (pageId === 'memes') { renderFeed("memes", "memes-feed-container"); drawMemeCanvas(); }
    if (pageId === 'news') renderNewsWire();
    if (pageId === 'explore') renderExploreDirectory();
    if (pageId === 'chat') renderFriendsList();
    if (pageId === 'groupchat') { renderGroupChat(); renderGroupMembers(); }
    if (pageId === 'profile') renderPersonalProfile();
}

// --- 4. Dynamic Sidebars Builders (News & Explore) ---
function renderNewsWire() {
    const container = document.getElementById('news-wire-container');
    if (!container) return;
    container.innerHTML = "";
    newsData.forEach(item => {
        container.innerHTML += `
            <div class="news-card">
                <div class="news-thumb-placeholder">${item.icon}</div>
                <div style="flex:1;">
                    <div class="news-meta-stamp">${item.tag} · LIVE</div>
                    <h4>${escapeHTML(item.title)}</h4>
                    <p>${escapeHTML(item.summary)}</p>
                </div>
            </div>
        `;
    });
}

function renderExploreDirectory() {
    const container = document.getElementById('explore-directory-container');
    if (!container) return;
    container.innerHTML = "";
    Object.keys(profileDirectoryDB).forEach(key => {
        let hub = profileDirectoryDB[key];
        let joinClass = hub.joined ? "btn-explore-join joined" : "btn-explore-join";
        let joinText = hub.joined ? "Joined" : "Join";
        container.innerHTML += `
            <div class="explore-card">
                <div class="explore-info-block">
                    <div class="avatar" style="width:36px; height:36px; background:#1c1c1c; color:white;">${hub.avatar}</div>
                    <div>
                        <strong>${escapeHTML(hub.title)}</strong>
                        <div style="font-size:12px; color:#5c5c5c;">${hub.stats.split('•')[0]}</div>
                    </div>
                </div>
                <button class="${joinClass}" onclick="toggleExploreJoin('${key}')">${joinText}</button>
            </div>
        `;
    });
}

function toggleExploreJoin(key) {
    if (!currentUser) return openAuthModal('google_preview');
    profileDirectoryDB[key].joined = !profileDirectoryDB[key].joined;
    saveDbState();
    renderExploreDirectory();
}

// --- 5. Interactive Toy Widgets (Sandbox & Canvas) ---
function runSandboxCode() {
    const code = document.getElementById('sandbox-code-input').value;
    const outputBox = document.getElementById('sandbox-output');
    
    // Controlled evaluation
    try {
        let logs = [];
        const mockConsole = { log: (msg) => logs.push(msg) };
        const executor = new Function('console', code);
        executor(mockConsole);
        outputBox.style.color = "#4ade80";
        outputBox.textContent = logs.length > 0 ? logs.join('\n') : "Script executed successfully. No output.";
    } catch(err) {
        outputBox.style.color = "#ef4444";
        outputBox.textContent = `Runtime Exception: ${err.message}`;
    }
}

function drawMemeCanvas() {
    const canvas = document.getElementById('memeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const text = document.getElementById('meme-text-field').value.toUpperCase();
    const template = document.getElementById('meme-template-select').value;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = "70px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(template, canvas.width/2, canvas.height/2 + 10);
    
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, canvas.width, 34);
    
    ctx.font = "bold 9px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width/2, 18, canvas.width - 20);
}

function openCommunityPage(idName) {
    let isUser = idName.startsWith('u/');
    let data = profileDirectoryDB[idName] || {
        title: idName, avatar: idName.replace('u/', '').charAt(0).toUpperCase(), bannerBg: "#1c1c1c", 
        stats: isUser ? "SEEKERS Member" : "Hub", description: "No description available yet.", moderators: "Autonomous"
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

// --- 6. Private Chat & Group System ---
let activeGroupChatId = "r/indiasocial"; 
let allGroupChats = loadDbState('seekers_groups', {
    "r/indiasocial": { icon: "👾", color: "#5865F2", title: "r/indiasocial - Community Lounge", messages: [{ sender: "System", text: "Welcome to the community lounge!" }] },
    "BGMI": { icon: "🪖", color: "#FF9900", title: "BGMI - Battlegrounds Mobile India", messages: [{ sender: "System", text: "Welcome to the BGMI drop zone!" }] },
    "Valorant": { icon: "🎯", color: "#FF4655", title: "Valorant - Radiant Chat", messages: [{ sender: "System", text: "Welcome to Valorant tactical command!" }] },
    "CSGO": { icon: "🔫", color: "#F59E0B", title: "CS:GO / CS2 - Global Offensive", messages: [{ sender: "System", text: "Rush B! Stay locked in." }] },
    "LoL": { icon: "🧙‍♂️", color: "#0BC6E3", title: "League of Legends - Summoner's Rift", messages: [{ sender: "System", text: "Welcome to LoL lane sync!" }] },
    "Dota2": { icon: "🛡️", color: "#B8362B", title: "Dota 2 - The Ancients", messages: [{ sender: "System", text: "Welcome to Dota 2 defensive lines!" }] },
    "Minecraft": { icon: "⛏️", color: "#4CAF50", title: "Minecraft - Builders Lounge", messages: [{ sender: "System", text: "Welcome to Minecraft architecture space!" }] },
    "Fortnite": { icon: "🚌", color: "#9C27B0", title: "Fortnite - Battle Bus", messages: [{ sender: "System", text: "Welcome to Fortnite active drop!" }] },
    "Apex": { icon: "🏃‍♂️", color: "#D32F2F", title: "Apex Legends - The Arena", messages: [{ sender: "System", text: "Welcome to Apex outlands!" }] },
    "CoD": { icon: "🎖️", color: "#424242", title: "Call of Duty - Warzone", messages: [{ sender: "System", text: "Welcome to Warzone drop coordinates!" }] },
    "FreeFire": { icon: "🔥", color: "#FFC107", title: "Free Fire - Booyah!", messages: [{ sender: "System", text: "Welcome to Free Fire grounds!" }] },
    "Overwatch": { icon: "🦍", color: "#FF8F00", title: "Overwatch 2 - Heroes Lounge", messages: [{ sender: "System", text: "Welcome to Overwatch command!" }] },
    "PUBG": { icon: "🍳", color: "#FBC02D", title: "PUBG: Battlegrounds", messages: [{ sender: "System", text: "Welcome to PUBG classic tables!" }] },
    "RocketLeague": { icon: "🚗", color: "#0288D1", title: "Rocket League - Champions Field", messages: [{ sender: "System", text: "Welcome to Rocket arena!" }] },
    "R6": { icon: "🔨", color: "#455A64", title: "Rainbow Six Siege - Tactical", messages: [{ sender: "System", text: "Welcome to Siege operation lines!" }] },
    "Genshin": { icon: "✨", color: "#673AB7", title: "Genshin Impact - Teyvat", messages: [{ sender: "System", text: "Welcome to Teyvat travels!" }] }
});

function renderFriendsList() {
    const list = document.getElementById('friends-list');
    list.innerHTML = "";
    friendsList.forEach(friend => {
        const li = document.createElement('li');
        if (friend === activeChatFriend) li.className = 'active-chat';
        li.innerHTML = `<div class="contact-avatar">${escapeHTML(friend.charAt(0).toUpperCase())}</div><span>${escapeHTML(friend)}</span>`;
        li.onclick = () => openDirectMessage(friend);
        list.appendChild(li);
    });
}

function openDirectMessage(friendName) {
    activeChatFriend = friendName;
    document.getElementById('chat-header-title').textContent = `Chatting with ${escapeHTML(friendName)}`;
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
        wrapper.innerHTML = `<span class="message-sender-name" onclick="openUserProfilePage('${escapeHTML(msg.sender)}')">${escapeHTML(msg.sender)}</span><div class="message-bubble">${escapeHTML(msg.text)}</div>`;
        container.appendChild(wrapper);
    });
    // UX Pro-fix: Wait for paint before scroll to assure accurate bottom geometry
    requestAnimationFrame(() => container.scrollTop = container.scrollHeight);
}

function sendDM() {
    if (!currentUser) return openAuthModal('google_preview');
    if (!activeChatFriend) return;
    const input = document.getElementById('dm-message-input');
    const text = input.value.trim();
    if (text !== "") {
        directMessages[activeChatFriend].push({ sender: currentUser.username, text: text });
        saveDbState();
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
        li.innerHTML = `<div class="contact-avatar">${escapeHTML(member.charAt(0).toUpperCase())}</div><span>${escapeHTML(member)}</span>`;
        li.onclick = () => openUserActionMenu('list', member);
        list.appendChild(li);
    });
}

function openDedicatedGroupChat(chatId) {
    activeGroupChatId = chatId;
    let chatData = allGroupChats[chatId];
    
    document.getElementById('groupchat-header-icon').textContent = chatData.icon;
    document.getElementById('groupchat-header-icon').style.background = chatData.color;
    document.getElementById('groupchat-header-title').textContent = chatData.title;
    
    switchPage('groupchat');
}

function renderGroupChat() {
    const container = document.getElementById('group-messages-container');
    container.innerHTML = "";
    let currentRoomMessages = allGroupChats[activeGroupChatId].messages;

    currentRoomMessages.forEach(msg => {
        const isMe = currentUser && msg.sender === currentUser.username;
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${isMe ? 'sent' : 'received'}`;
        wrapper.innerHTML = `<span class="message-sender-name" onclick="openUserProfilePage('${escapeHTML(msg.sender)}')">${escapeHTML(msg.sender)}</span><div class="message-bubble">${escapeHTML(msg.text)}</div>`;
        container.appendChild(wrapper);
    });
    requestAnimationFrame(() => container.scrollTop = container.scrollHeight);
}

function sendGroupMessage() {
    if (!currentUser) return openAuthModal('google_preview');
    const input = document.getElementById('group-message-input');
    const text = input.value.trim();
    if (text !== "") {
        allGroupChats[activeGroupChatId].messages.push({ sender: currentUser.username, text: text });
        saveDbState();
        input.value = ""; renderGroupChat();
    }
}

// --- 7. Authentication Architecture ---
function updateNavigationUI() {
    const authContainer = document.getElementById('nav-auth-container');
    const postAvatar = document.getElementById('post-avatar');
    if (currentUser) {
        authContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="switchPage('profile')">
                <div class="avatar-small" style="width: 32px; height: 32px; background: #1c1c1c;">${currentUser.initial}</div>
                <button class="btn-login" onclick="logoutUser(); event.stopPropagation();">Log Out</button>
            </div>
        `;
        if (postAvatar) postAvatar.textContent = currentUser.initial;
    } else {
        authContainer.innerHTML = `<button class="btn-login" onclick="openAuthModal('google_preview')">Log In</button><button class="btn-signup" onclick="openAuthModal('signup')">Sign Up</button>`;
        if (postAvatar) postAvatar.textContent = "U";
    }
}

function openAuthModal(mode) {
    currentAuthMode = mode;
    const modal = document.getElementById('auth-modal');
    document.getElementById('auth-error').style.display = 'none';

    if (mode === 'google_preview') {
        document.getElementById('google-preview-section').style.display = 'block';
        document.getElementById('manual-auth-section').style.display = 'none';
    } else {
        document.getElementById('google-preview-section').style.display = 'none';
        document.getElementById('manual-auth-section').style.display = 'block';
        const isSignUp = mode === 'signup';
        document.getElementById('auth-username').style.display = isSignUp ? 'block' : 'none';
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
    const user = document.getElementById('auth-username').value.trim();
    if (!email) return;
    completeLogin(user || "User", email);
}

function completeLogin(username, email) {
    let defaultBio = "A passionate SEEKERS member.";
    let defaultLocation = "Planet Earth";
    let defaultPronouns = "They/Them";

    if (email === 'prajjwal5655@gmail.com' || username === 'Prajjwal Maurya') {
        defaultBio = "B.Tech 1st year CSE AI/ML student at Galgotias college programming with hands-on experience in machine learning & data science. | Eager to contribute to AI-driven solutions.";
        defaultLocation = "Varanasi, Uttar Pradesh, India";
        defaultPronouns = "He/Him";
    }

    const userData = { 
        username, email, initial: username.charAt(0).toUpperCase(),
        bio: defaultBio, location: defaultLocation, pronouns: defaultPronouns
    };

    localStorage.setItem('reddit_active_user', JSON.stringify(userData));
    currentUser = userData;
    closeModal('auth-modal');
    updateNavigationUI();
    switchPage('home');
}

function logoutUser() {
    localStorage.removeItem('reddit_active_user');
    currentUser = null;
    updateNavigationUI();
    switchPage('home');
}

window.onclick = function(event) {
    if (event.target.classList.contains('floating-modal-overlay')) event.target.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    updateNavigationUI();
    renderFeed("all", "feed-container");
});

// --- 8. Profile Rendering Additions ---
function renderPersonalProfile() {
    if (!currentUser) {
        openAuthModal('google_preview');
        switchPage('home');
        return;
    }
    document.getElementById('my-profile-avatar').textContent = currentUser.initial;
    document.getElementById('my-profile-name').textContent = escapeHTML(currentUser.username);
    document.getElementById('my-profile-pronouns').textContent = escapeHTML(currentUser.pronouns || "Add Pronouns");
    document.getElementById('my-profile-bio').textContent = escapeHTML(currentUser.bio || "Headline summary context.");
    document.getElementById('my-profile-location').textContent = escapeHTML(currentUser.location || "Add Location");
    document.getElementById('my-profile-email').textContent = escapeHTML(currentUser.email);
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
    renderPersonalProfile();
    updateNavigationUI();
    closeModal('edit-profile-modal');
}

// ==========================================
// 9. SECURE PYTHON CHATBOT TRANSACTIONS
// ==========================================
const BOT_CONFIG = {
    API_URL: "http://localhost:5000/api/chat", 
    MODEL_NAME: "gemini-2.5-flash"       
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

    appendBotMessage(text, 'user-msg');
    inputField.value = '';

    inputField.disabled = true;
    sendButton.disabled = true;

    const messagesContainer = document.getElementById('chatbot-messages');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'bot-typing';
    typingIndicator.id = 'bot-typing-indicator';
    typingIndicator.textContent = 'SeekerBot is thinking...';
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const reply = await fetchAIResponse(text);

    const indicator = document.getElementById('bot-typing-indicator');
    if (indicator) indicator.remove();
    
    appendBotMessage(reply, 'bot-msg');

    inputField.disabled = false;
    sendButton.disabled = false;
    inputField.focus();
}

function appendBotMessage(text, className) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = className;
    msgDiv.innerHTML = escapeHTML(text).replace(/\n/g, '<br>');
    messagesContainer.appendChild(msgDiv);
    // Ensure accurate bottom pinning
    requestAnimationFrame(() => messagesContainer.scrollTop = messagesContainer.scrollHeight);
}

async function fetchAIResponse(userText) {
    try {
        const response = await fetch(BOT_CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: BOT_CONFIG.MODEL_NAME, message: userText })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data.reply || data.response || "No generation parsed.";
        
    } catch (error) {
        console.error("AI Server Route Fault:", error);
        return "My backend is currently offline! Ensure your Python server (`p.py`) is running at " + BOT_CONFIG.API_URL;
    }
}

// ========================================================
// 10. SUBSYSTEM UTILITIES & COMPONENT MODERATION
// ========================================================
function executeAdLaunch() {
    const title = document.getElementById('ad-title').value.trim();
    const budget = document.getElementById('ad-budget').value.trim();
    if(!title || !budget) return alert("System requires structural headline parameters.");
    alert(`Campaign "${title}" successfully integrated.`);
}

function generateDeveloperToken() {
    const generatedId = "cli_" + Math.random().toString(36).substring(2, 15) + "_sdk";
    const generatedSecret = "sec_token_" + Math.random().toString(36).substring(2, 18);
    document.getElementById('dev-client-id').textContent = generatedId;
    document.getElementById('dev-client-secret').textContent = generatedSecret;
    document.getElementById('dev-credentials-display').style.display = 'block';
}

function processProUpgrade() {
    if(!currentUser) return openAuthModal('google_preview');
    alert(`Account allocated to pro channels.`);
}

function toggleFaqAccordion(element) {
    const answerPanel = element.querySelector('.faq-answer');
    const symbolIndicator = element.querySelector('.faq-question span');
    const isActive = answerPanel.style.display === "block";
    answerPanel.style.display = isActive ? "none" : "block";
    symbolIndicator.textContent = isActive ? "+" : "-";
}

function filterFaqKnowledgebase() {
    const needle = document.getElementById('faq-search').value.toLowerCase();
    const rows = document.querySelectorAll('.faq-item');
    rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(needle) ? "block" : "none";
    });
}

function submitJobApplication(positionTitle) {
    if(!currentUser) return openAuthModal('google_preview');
    alert(`Application indexed for ${positionTitle}.`);
}

function executeThemeMutation() {
    const trigger = document.getElementById('dark-mode-checkbox');
    document.body.classList.toggle('dark-theme', trigger.checked);
}

function executeGlobalSearch() {
    const val = document.getElementById('global-search-bar').value.toLowerCase();
    const activePage = document.querySelector('.page-view.active-page');
    if(!activePage) return;
    
    const cards = activePage.querySelectorAll('.post-card, .news-card, .explore-card, .faq-item');
    cards.forEach(c => {
        c.style.display = c.textContent.toLowerCase().includes(val) ? "" : "none";
    });
}

function purgeUserData() {
    if(confirm("CRITICAL WARNING: This will permanently delete your local identity, posts cache, and chat history. Proceed?")) {
        localStorage.clear();
        alert("Local tracking hashes cleared. Reloading layout.");
        location.reload();
    }
}