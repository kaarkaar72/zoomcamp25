# 🎵 Music Guessing Game

A fun, multiplayer mobile game where friends can play a music guessing game together! Players submit songs and try to guess who submitted each track.

## 🎮 Features

- **Real-time Multiplayer**: Play with 4-10 friends in the same room
- **Music Integration**: Submit songs via YouTube or Spotify links
- **Interactive Gameplay**: Listen to 20-30 second clips and guess the submitter
- **Scoring System**: Earn points for correct guesses
- **Live Leaderboard**: See real-time scores and final rankings
- **Push Notifications**: Get notified when players join or games start
- **Persistent Scores**: Track your total score across multiple games
- **Clean UI**: Modern, minimalist design optimized for mobile

## 📱 Screenshots

*Add screenshots here when available*

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Firebase project with Firestore enabled
- iOS/Android device or emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/music-guessing-game.git
   cd music-guessing-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Copy your Firebase config and replace the placeholder in `App.js`:
   
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device**
   - Download Expo Go app on your mobile device
   - Scan the QR code from the terminal
   - Or run `npm run ios` / `npm run android` for simulators

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
│   ├── AuthContext.js  # Authentication state management
│   └── GameContext.js  # Game state and real-time updates
├── screens/            # App screens
│   ├── LoginScreen.js  # Authentication
│   ├── HomeScreen.js   # Main menu
│   ├── CreateRoomScreen.js
│   ├── JoinRoomScreen.js
│   ├── GameRoomScreen.js
│   ├── GameplayScreen.js
│   └── LeaderboardScreen.js
├── services/           # External services
│   └── NotificationService.js
└── theme/              # UI theme configuration
    └── theme.js
```

## 🎯 How to Play

1. **Create or Join a Room**
   - Host creates a room and shares the 6-character room code
   - Friends join using the room code

2. **Submit Your Song**
   - Each player submits one song (YouTube or Spotify link)
   - Enter the song title and paste the URL

3. **Start the Game**
   - Host starts the game when all players have submitted songs
   - Songs are shuffled and played anonymously

4. **Make Your Guesses**
   - Listen to 20-30 second clips of each song
   - Guess which player submitted each song
   - Earn 10 points for each correct guess

5. **See Results**
   - View the final leaderboard with rankings
   - Check your total score across all games

## 🔧 Configuration

### Firebase Setup

1. **Firestore Collections Structure**:
   ```
   rooms/
   ├── {roomCode}/
   │   ├── code: string
   │   ├── hostId: string
   │   ├── players: array
   │   ├── songs: array
   │   ├── gameState: string
   │   └── guesses: object
   
   users/
   ├── {userId}/
   │   ├── username: string
   │   ├── email: string
   │   ├── totalScore: number
   │   └── gamesPlayed: number
   ```

2. **Security Rules** (add to Firestore):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /rooms/{roomId} {
         allow read, write: if request.auth != null;
       }
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### Push Notifications

To enable push notifications:

1. Configure Expo notifications in `app.json`
2. For production builds, set up Firebase Cloud Messaging
3. Update the notification service with your server endpoints

## 📦 Building for Production

### Create Production Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

### Submit to App Stores

```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios
```

## 🛠️ Technical Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Firestore, Authentication)
- **UI Library**: React Native Paper
- **Navigation**: React Navigation v6
- **Audio**: Expo AV
- **Notifications**: Expo Notifications
- **State Management**: React Context API

## 🔄 Real-time Features

The app uses Firebase Firestore real-time listeners for:
- Player join/leave notifications
- Game state synchronization
- Live score updates
- Song progression tracking

## 🎵 Music Integration

Currently supports:
- YouTube URLs (youtube.com, youtu.be)
- Spotify URLs (open.spotify.com)

*Note: In the demo version, audio playback uses placeholder sounds. For production, you would need to integrate with YouTube API or Spotify Web API to extract actual audio clips.*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/yourusername/music-guessing-game/issues) page
2. Create a new issue with detailed information
3. Include device information and error logs

## 🎉 Acknowledgments

- Thanks to the React Native and Expo communities
- Firebase for real-time database capabilities
- React Native Paper for beautiful UI components

---

**Ready to guess some music? 🎵 Start playing now!**