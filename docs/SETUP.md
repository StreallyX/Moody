# Moody - Setup Guide

This guide will help you set up the Moody drinking game app for local development.

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Supabase account (free tier available)

## 1. Clone the Repository

```bash
git clone https://github.com/StreallyX/Moody.git
cd Moody
```

## 2. Install Dependencies

```bash
npm install
# or
yarn install
```

## 3. Supabase Setup

### 3.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and API keys from Settings > API

### 3.2 Run Database Migrations

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Run migrations:
   ```bash
   supabase db push
   ```

   Or manually run the SQL in `supabase/migrations/001_initial_schema.sql` via the Supabase SQL Editor.

### 3.3 Seed the Database (Optional)

For development, you can seed the database with sample content:

```bash
# Via Supabase CLI
supabase db seed

# Or run supabase/seed.sql manually in the SQL Editor
```

## 4. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   APP_ENV=development
   ```

   > **Note**: The `SUPABASE_SERVICE_KEY` should only be used server-side. Never expose it in the client app.

## 5. Running the App

### Development

```bash
# Start Expo development server
npx expo start

# Run on iOS Simulator
npx expo run:ios

# Run on Android Emulator
npx expo run:android
```

### Using Expo Go

1. Install Expo Go on your physical device
2. Scan the QR code from the terminal
3. The app will load on your device

## 6. Project Structure

```
Moody/
├── app/                    # Expo Router screens
│   ├── auth/              # Authentication screens
│   ├── game/              # Game screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   └── minigames/        # Mini-game components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
├── supabase/
│   ├── migrations/       # Database migrations
│   └── seed.sql          # Sample data
└── docs/                  # Documentation
```

## 7. Firebase Migration (Legacy)

The app is transitioning from Firebase to Supabase. During the migration period:

- Firebase credentials in `.env` are for legacy support
- New features should use Supabase
- See the migration guide in `docs/MIGRATION.md` (coming soon)

## 8. Troubleshooting

### Common Issues

**"Unable to connect to Supabase"**
- Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check that your Supabase project is active

**"Permission denied" errors**
- Ensure Row Level Security (RLS) policies are set up correctly
- Check that the user is authenticated for protected routes

**Build errors on iOS**
- Run `cd ios && pod install && cd ..`
- Clean build: `npx expo run:ios --clean`

**Build errors on Android**
- Clean build: `npx expo run:android --clean`
- Check Android SDK is properly configured

## 9. Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Submit a pull request

## 10. Support

For questions or issues:
- Open a GitHub issue
- Contact the development team

---

**Happy coding! 🎉🍻**
