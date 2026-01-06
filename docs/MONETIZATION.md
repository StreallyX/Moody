# Moody Monetization Setup Guide

This guide covers setting up RevenueCat for in-app purchases and subscriptions in Moody.

## Overview

Moody uses RevenueCat to manage:
- Premium subscriptions (monthly, annual, lifetime)
- Mini-games pack (one-time purchase)
- Caliente mode (one-time purchase)

## Prerequisites

- Apple Developer Account (for iOS)
- Google Play Developer Account (for Android)
- RevenueCat account (free tier available)

## 1. RevenueCat Dashboard Setup

### Create Project

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Create a new project named "Moody"
3. Note your API keys for iOS and Android

### Configure Entitlements

Create the following entitlements:

| Identifier | Description |
|------------|-------------|
| `premium` | Full premium access |
| `mini_games_pack` | Mini-games feature |
| `caliente_mode` | Caliente mode feature |

### Configure Offerings

Create a "default" offering with these packages:

| Package | Type | Products |
|---------|------|----------|
| Monthly | MONTHLY | iOS + Android monthly subscription |
| Annual | ANNUAL | iOS + Android annual subscription |
| Lifetime | LIFETIME | iOS + Android lifetime purchase |

## 2. App Store Connect Setup (iOS)

### Create Products

1. Go to App Store Connect > Your App > Features > In-App Purchases
2. Create the following products:

| Product ID | Type | Price |
|------------|------|-------|
| `com.tonorga.moody.premium.monthly` | Auto-Renewable Subscription | $4.99/month |
| `com.tonorga.moody.premium.annual` | Auto-Renewable Subscription | $29.99/year |
| `com.tonorga.moody.premium.lifetime` | Non-Consumable | $79.99 |
| `com.tonorga.moody.minigames` | Non-Consumable | $2.99 |
| `com.tonorga.moody.caliente` | Non-Consumable | $1.99 |

### Create Subscription Group

1. Create a subscription group named "Moody Premium"
2. Add monthly and annual subscriptions to this group
3. Set subscription rank (annual > monthly)

### Connect to RevenueCat

1. In RevenueCat, go to Project Settings > Apps > iOS
2. Add your App Store Connect API Key:
   - Go to App Store Connect > Users and Access > Keys
   - Generate an API key with "App Manager" role
   - Download the .p8 file
   - Enter Key ID, Issuer ID, and upload .p8 in RevenueCat

## 3. Google Play Console Setup (Android)

### Create Products

1. Go to Google Play Console > Your App > Monetize > Products
2. Create subscriptions:

| Product ID | Type | Price |
|------------|------|-------|
| `moody_premium_monthly` | Subscription | $4.99/month |
| `moody_premium_annual` | Subscription | $29.99/year |
| `moody_premium_lifetime` | In-app product | $79.99 |
| `moody_minigames` | In-app product | $2.99 |
| `moody_caliente` | In-app product | $1.99 |

### Connect to RevenueCat

1. In RevenueCat, go to Project Settings > Apps > Android
2. Add your Google Play credentials:
   - Create a service account in Google Cloud Console
   - Grant "Financial Data" access in Play Console
   - Upload the JSON key file to RevenueCat

## 4. Environment Configuration

Add to your `.env` file:

```bash
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxxx
```

## 5. Testing Purchases

### iOS Sandbox Testing

1. Create sandbox tester in App Store Connect:
   - Users and Access > Sandbox > Testers
   - Add a new tester with a unique email

2. On test device:
   - Sign out of App Store (Settings > Media & Purchases)
   - When prompted during purchase, sign in with sandbox account

3. Sandbox subscription timing:
   - 1 week = 3 minutes
   - 1 month = 5 minutes
   - 1 year = 1 hour

### Android Testing

1. Add license testers in Play Console:
   - Settings > License Testing
   - Add tester email addresses

2. Use test cards:
   - Card number: 4242 4242 4242 4242
   - Any future expiry and CVC

3. Test subscription timing:
   - Similar accelerated renewal periods

### RevenueCat Sandbox Mode

1. In RevenueCat dashboard, toggle "View Sandbox Data"
2. Monitor test purchases in real-time
3. Use RevenueCat debugger for troubleshooting

## 6. Integration with Affiliate System

Purchases automatically sync with the affiliate system:

1. When a purchase completes, `syncPurchaseWithAffiliate()` is called
2. If user has an affiliate code applied, conversion is tracked
3. Commission is calculated based on affiliate's rate

See `services/affiliateService.ts` for details.

## 7. Webhooks (Optional)

For server-side purchase validation:

1. In RevenueCat, go to Project Settings > Integrations > Webhooks
2. Add your webhook URL
3. Select events to receive:
   - INITIAL_PURCHASE
   - RENEWAL
   - CANCELLATION
   - EXPIRATION

## 8. Analytics

RevenueCat provides built-in analytics:

- Revenue metrics
- Subscriber counts
- Churn rates
- Trial conversions

Access via RevenueCat Dashboard > Charts.

## Troubleshooting

### Common Issues

**"No offerings available"**
- Ensure products are approved in App Store Connect / Play Console
- Check product IDs match exactly
- Verify RevenueCat API keys are correct

**"Purchase failed"**
- Check sandbox/test account is properly configured
- Ensure device is signed in with test account
- Review RevenueCat debug logs

**"Entitlement not active after purchase"**
- Verify entitlement is linked to product in RevenueCat
- Check offering configuration
- Wait a few seconds and refresh customer info

### Debug Mode

Enable debug logs in development:

```typescript
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
Purchases.setLogLevel(LOG_LEVEL.DEBUG);
```

## Resources

- [RevenueCat Documentation](https://docs.revenuecat.com)
- [React Native SDK Reference](https://docs.revenuecat.com/docs/reactnative)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
