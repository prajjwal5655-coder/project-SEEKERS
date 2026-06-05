# SEEKER ⬛⬜

A premium, modern social platform frontend built entirely with **HTML, CSS, and Vanilla JavaScript**. Originally inspired by the layout of Reddit, this project has been heavily customized and rebranded into "SEEKER"—featuring a sleek monochromatic UI, a dynamic feed, and a fully functional local chat engine.

## ✨ Features

### 🔐 Dynamic Mock Authentication
* **Sign Up & Log In:** Fully functional mock authentication system using browser `localStorage`.
* **State Management:** The UI dynamically updates based on the user's authentication state (showing the user profile when logged in, or the auth buttons when logged out).
* **Protected Actions:** Users are prompted to log in or sign up before they can create posts, leave comments, or send messages.

### 📰 Interactive Feed
* **Create Posts:** Users can publish new posts that instantly render at the top of the feed.
* **Upvote / Downvote:** Fully working vote counters attached to each post.
* **Comment Engine:** Users can expand posts to leave replies, which dynamically append to the specific post's comment thread.

### 💬 Local Chat Engine
* **Direct Messages (DMs):** Add friends to a contact list and seamlessly send direct messages. The active chat dynamically highlights, and messages align as sent/received bubbles.
* **Community Group Chat:** A global chat room mimicking a subreddit lounge, where the community can chat together.

### 🎨 Premium UI / UX
* **Monochromatic Theme:** A professional, minimalist black-and-white color palette.
* **Pill-shaped UI Elements:** Modern, rounded buttons and hover states for all interactive elements.
* **Sticky Layout:** Engineered with a responsive grid and `position: sticky;` sidebars that stay perfectly anchored while scrolling the main feed.
* **Responsive Design:** Sidebars gracefully hide on smaller screens and mobile devices to prioritize readability.
* **SPA Routing (Single Page Application):** Clicking sidebar links (Home, Popular, News, Explore, Resources) instantly swaps the main content view without reloading the page.

## 🛠️ Tech Stack

This project deliberately avoids heavy frameworks to demonstrate a strong mastery of core web technologies and DOM manipulation:
* **HTML5:** Semantic structure and layout.
* **CSS3:** Advanced flexbox/grid layouts, sticky positioning, media queries, and modern UI styling.
* **Vanilla JavaScript (ES6+):** Event listeners, array manipulation, state management, and `localStorage` database simulation.

## 🚀 How to Run Locally

Because this project uses browser `localStorage` as its database, you do not need a backend server to test the core features.

1. **Clone the repository:**
```bash
   git clone [https://github.com/yourusername/seeker-social-ui.git](https://github.com/yourusername/seeker-social-ui.git)


# 🛸 SEEKERS - Decentralized Knowledge Ecosystem

SEEKERS is a lightweight, zero-latency single-page application (SPA) built with pure HTML, CSS, and Vanilla JavaScript. It serves as a modern, professional community platform featuring dynamic content rendering, isolated communication pipelines, and an integrated AI assistant powered by Google Gemini.

## ✨ Core Features

* **Dynamic SPA Routing:** Seamlessly switch between 15+ different views (Feed, Profile, Chat, Tech, Memes, News, Settings) without page reloads.
* **State Persistence:** Fully utilizes browser `localStorage` to save user identities, posts, comments, upvotes, and chat history.
* **Isolated Gaming Chat Hubs:** 15 dedicated, separated real-time chat rooms for top world-champion esports titles (BGMI, Valorant, CS2, LoL, etc.).
* **SeekerBot AI Integration:** A built-in floating AI assistant connected to a local Python backend routing to the `gemini-2.5-flash` model.
* **Dark Mode Engine:** Hardware-accelerated, smooth transition CSS theme mutation.
* **Security Built-in:** Custom anti-XSS string sanitization for all user inputs.
* **Interactive Tooling:** * *Tech Sandbox:* Live JavaScript execution terminal inside the browser.
    * *Meme Generator:* HTML5 Canvas-based image and text overlay engine.
    * *Developer Hub:* Simulated OAuth token generation.

---

## 📂 Project Architecture

The platform is strictly separated into a client-side frontend and an AI-bridge backend.

### Frontend
* `index.html` - The master structural DOM layer.
* `p2.css` - Global stylesheets, layout grids, and Dark Theme overrides.
* `p3.js` - The master state machine handling routing, memory caching, DOM mutation, and chat logic.

### Backend (AI Bridge)
* `p.py` - The Flask Python server that acts as a secure middleman between the frontend and Google's servers.
* `config.json` - Secure credential vault holding the Google Generative AI API key.

---

## 🚀 Installation & Setup

### 1. Frontend Execution
No Node.js or React setup is required. The frontend is pure native code.
1. Clone this repository to your local machine.
2. Open `index.html` in any modern web browser (Chrome, Edge, Brave, Firefox).
3. Alternatively, use the **Live Server** extension in VS Code for hot-reloading.

### 2. Backend Execution (SeekerBot AI)
To enable the SeekerBot chatbot, you must run the local Python server.

**Prerequisites:**
* Python 3.8+ installed.
* An active Google AI Studio account.

**Setup Steps:**
1. Open your terminal in the project folder.
2. Install the required Python packages:
   ```bash
   pip install flask flask-cors google-gena
