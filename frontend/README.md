# Pantry Manager - React Native Frontend

A React Native app for managing pantry inventory with barcode scanning and computer vision capabilities.

## Tech Stack

- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation and routing
- **Redux Toolkit** - State management
- **Axios** - HTTP client for API communication

## Features

### Current Features
- ✅ **Home Dashboard** - Overview of pantry statistics
- ✅ **Pantry Management** - View all pantry items
- ✅ **Settings** - App configuration and API health check
- ✅ **Redux State Management** - Centralized state management
- ✅ **API Integration** - Connected to backend API
- ✅ **TypeScript** - Full type safety

### Planned Features
- 🔄 **Add Items** - Manual item entry
- 🔄 **Barcode Scanning** - Quick item addition via barcode
- 🔄 **Photo Recognition** - Computer vision for food identification
- 🔄 **Expiration Tracking** - Smart notifications for expiring items
- 🔄 **Recipe Generation** - Suggest recipes based on available ingredients

## Getting Started

### Prerequisites
- Node.js 18+
- React Native development environment
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Install iOS dependencies** (macOS only):
```bash
cd ios && pod install && cd ..
```

3. **Start Metro bundler**:
```bash
npm start
```

4. **Run on iOS**:
```bash
npm run ios
```

5. **Run on Android**:
```bash
npm run android
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── navigation/          # Navigation configuration
├── screens/            # App screens
│   ├── HomeScreen.tsx
│   ├── PantryScreen.tsx
│   └── SettingsScreen.tsx
├── services/           # API and external services
│   └── api.service.ts
├── store/              # Redux store and slices
│   ├── index.ts
│   └── pantrySlice.ts
├── types/              # TypeScript type definitions
│   └── pantry.types.ts
└── utils/              # Utility functions
```

## 🔌 API Integration

The app connects to the backend API running on `http://localhost:3001`. 

### API Endpoints Used
- `GET /health` - Health check
- `GET /api/v1/pantry` - Get all pantry items
- `POST /api/v1/pantry` - Create new item
- `PUT /api/v1/pantry/:id` - Update item
- `DELETE /api/v1/pantry/:id` - Delete item
- `GET /api/v1/pantry/expiring` - Get expiring items
- `GET /api/v1/pantry/expired` - Get expired items

### State Management

The app uses Redux Toolkit for state management with the following structure:

```typescript
interface PantryState {
  items: PantryItem[];
  expiringItems: PantryItem[];
  expiredItems: PantryItem[];
  selectedItem: PantryItem | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  filters: PantryFilterOptions;
}
```

## 🎨 UI/UX

- **Modern Design** - Clean, intuitive interface
- **Responsive Layout** - Works on all screen sizes
- **Dark/Light Mode** - System theme support
- **Accessibility** - Screen reader support
- **Touch Gestures** - Native mobile interactions

## 🔧 Development

### Available Scripts
- `npm start` - Start Metro bundler
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for code formatting
- Consistent naming conventions

## 📱 Screens

### Home Screen
- Dashboard with pantry statistics
- Quick overview of expiring items
- Recent items list
- Refresh functionality

### Pantry Screen
- Complete list of all pantry items
- Item details (name, brand, quantity, category)
- Expiration date tracking
- Search and filter capabilities

### Settings Screen
- API health check
- Cache management
- App information
- User preferences

## 🔮 Future Enhancements

### Phase 2: Core Functionality
- [ ] Add/Edit/Delete pantry items
- [ ] Barcode scanning integration
- [ ] Photo capture and recognition
- [ ] Expiration notifications

### Phase 3: Advanced Features
- [ ] Recipe generation
- [ ] Shopping list creation
- [ ] Multi-user support
- [ ] Data synchronization

### Phase 4: AI Integration
- [ ] Computer vision for food recognition
- [ ] Smart expiration predictions
- [ ] Nutritional analysis
- [ ] Meal planning suggestions

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**:
```bash
npx react-native start --reset-cache
```

2. **iOS build issues**:
```bash
cd ios && pod install && cd ..
```

3. **Android build issues**:
```bash
cd android && ./gradlew clean && cd ..
```

4. **API connection issues**:
- Ensure backend server is running on port 3001
- Check network connectivity
- Verify API endpoints in `api.service.ts`

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API documentation in the backend folder