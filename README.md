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
