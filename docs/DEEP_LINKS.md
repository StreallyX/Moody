# Deep Links Configuration for Moody

This document explains how to set up deep links for password reset and other authentication flows.

## Overview

Moody uses deep links to handle password reset flows. When a user requests a password reset, Supabase sends an email with a link that opens the app directly.

## URL Scheme

The app uses the `moody://` URL scheme for deep links.

### Supported Deep Links

- `moody://reset-password` - Password reset callback
- `moody://auth/callback` - General auth callback

## Configuration

### app.json Configuration

The `scheme` is already configured in `app.json`:

```json
{
  "expo": {
    "scheme": "moody"
  }
}
```

### Android Configuration

For Android App Links (verified deep links), add intent filters to `android/app/src/main/AndroidManifest.xml`:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="moody" />
</intent-filter>

<!-- For HTTPS links (optional, for web fallback) -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="your-domain.com" android:pathPrefix="/auth" />
</intent-filter>
```

### iOS Configuration

For iOS Universal Links, you need to:

1. **Add Associated Domains capability** in Xcode:
   - Open your project in Xcode
   - Go to Signing & Capabilities
   - Add "Associated Domains"
   - Add `applinks:your-domain.com`

2. **Create apple-app-site-association file** on your server:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.tonorga.moody",
        "paths": ["/auth/*", "/reset-password"]
      }
    ]
  }
}
```

Host this file at `https://your-domain.com/.well-known/apple-app-site-association`

## Supabase Configuration

1. Go to your Supabase Dashboard
2. Navigate to Authentication > URL Configuration
3. Add `moody://reset-password` to the Redirect URLs
4. For production, also add your web domain URLs

## Handling Deep Links in the App

The app uses `expo-linking` to handle incoming deep links. The password reset flow:

1. User requests password reset
2. Supabase sends email with `moody://reset-password?token=...` link
3. User clicks link, app opens
4. App extracts token and allows user to set new password

### Example Deep Link Handler

```typescript
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useDeepLinkHandler() {
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { path, queryParams } = Linking.parse(event.url);
      
      if (path === 'reset-password') {
        // Handle password reset
        // The token is automatically handled by Supabase
      }
    };

    // Handle initial URL
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Listen for URL changes
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    return () => subscription.remove();
  }, []);
}
```

## Testing Deep Links

### Android

```bash
# Test with adb
adb shell am start -W -a android.intent.action.VIEW -d "moody://reset-password" com.tonorga.moody
```

### iOS

```bash
# Test with xcrun
xcrun simctl openurl booted "moody://reset-password"
```

### Expo Go

In development with Expo Go, use:
```
exp://127.0.0.1:8081/--/reset-password
```

## Troubleshooting

1. **Link not opening app**: Ensure the scheme is correctly configured in app.json
2. **Android not verifying**: Check that assetlinks.json is properly hosted
3. **iOS not working**: Verify apple-app-site-association file and Associated Domains
4. **Supabase redirect failing**: Ensure the redirect URL is added to Supabase dashboard
