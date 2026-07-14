# 🎬 Watchlist - Movie Tracking Mobile App

A modern, cross-platform mobile application built with React Native and Expo that allows users to discover movies, manage their personal watchlists, and receive weekly movie recommendations. 

## ✨ Key Features

*   **Authentication:** Secure Email/Password login and Native Google Sign-in integration.
*   **Movie Discovery:** Browse Popular, Top Rated, and Recommended movies seamlessly using the TMDB API.
*   **Personalized Watchlist:** Save and manage favorite movies. Data is synchronized in real-time across devices using Firebase Firestore.
*   **Dynamic Theming:** Fully reactive Light and Dark mode UI, managed via global state.
*   **Smart Search & Filtering:** Search for movies by title or filter by specific genres with a beautifully crafted UI.
*   **Local Push Notifications:** Automated weekly weekend reminders to check out new movies, utilizing local device schedulers (No external servers needed).
*   **Custom Typography:** Cinematic UI aesthetics using custom Google Fonts (`Bebas Neue`, `Jersey 25`).

## 🛠️ Technology Stack

**Frontend (Mobile App):**
*   [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (Managed Workflow)
*   [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing, Drawer & Tab Navigation)
*   [Zustand](https://github.com/pmndrs/zustand) (Lightweight Global State Management for Auth & Theme)

**Backend & Database:**
*   [Firebase Authentication](https://firebase.google.com/docs/auth) (Email & Google OAuth 2.0)
*   [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore) (NoSQL Database for user data)

**APIs & Services:**
*   [TMDB REST API](https://developer.themoviedb.org/docs) (Movie Data Fetching)
*   [Expo Application Services (EAS)](https://expo.dev/eas) (Cloud APK Building)
*   Expo Notifications (Local Push Notifications)

## 🚀 Getting Started

### Prerequisites
*   Node.js installed
*   Expo CLI installed globally
*   A Firebase Project with Authentication and Firestore enabled
*   A TMDB API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/watchlist-app.git](https://github.com/yourusername/watchlist-app.git)
   cd watchlist-app