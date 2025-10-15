# Frontend Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+
- React Native development environment
- Backend server running on port 3001

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install iOS Dependencies (macOS only)
```bash
cd ios && pod install && cd ..
```

### 4. Start Metro Bundler
```bash
npm start
```

### 5. Run the App

**For iOS:**
```bash
npm run ios
```

**For Android:**
```bash
npm run android
```

## 📱 What You'll See

The app includes three main screens:

### Home Screen
- Dashboard with pantry statistics
- Total items, expiring items, expired items
- Recent items list
- Refresh button to sync with backend

### Pantry Screen
- Complete list of all pantry items
- Item details (name, brand, quantity, category, expiration)
- Clean, card-based layout

### Settings Screen
- API health check (tests backend connection)
- Cache management
- App information

## Backend Connection

The app automatically connects to your backend API at `http://localhost:3001`. Make sure your backend server is running before starting the frontend.

### Test Backend Connection
1. Go to Settings screen
2. Tap "API Health Check"
3. Should show "Status: healthy" if backend is running

## Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── navigation/          # App navigation setup
├── screens/            # Main app screens
├── services/           # API communication
├── store/              # Redux state management
└── types/              # TypeScript definitions
```

### Key Files
- `App.tsx` - Main app entry point
- `src/navigation/AppNavigator.tsx` - Navigation setup
- `src/services/api.service.ts` - Backend API integration
- `src/store/pantrySlice.ts` - State management

## Troubleshooting

### Metro Bundler Issues
```bash
npx react-native start --reset-cache
```

### iOS Build Issues
```bash
cd ios && pod install && cd ..
```

### Android Build Issues
```bash
cd android && ./gradlew clean && cd ..
```

### API Connection Issues
- Ensure backend is running: `cd backend && npm run dev`
- Check backend health: `curl http://localhost:3001/health`
- Verify API endpoints in `src/services/api.service.ts`

## Next Steps

1. **Test the app** - Make sure all screens load correctly
2. **Check API connection** - Use the health check in Settings
3. **View sample data** - The app will show seeded pantry items
4. **Ready for development** - Start adding new features!
