# Security Guidelines

## ⚠️ IMPORTANT: Exposed Credentials

If you cloned this repository before the security fixes, please note that **Strava API credentials were exposed in the git history**.

### Immediate Actions Required:

1. **Regenerate Strava API Credentials**
   - Go to https://www.strava.com/settings/api
   - Delete the old application or regenerate the Client Secret
   - Update your `.env.local` file with new credentials

2. **Never Commit Sensitive Data**
   - Always use `.env.local` for secrets (already in `.gitignore`)
   - Use `.example` files for configuration templates
   - Review files before committing

## Protected Files

The following files are excluded from git and should contain your actual credentials:

- `.env.local` - All environment variables and secrets
- `get-strava-token.ps1` - Script with actual Strava credentials
- `debug-strava.ps1` - Debug script (uses .env.local)
- `sync-local.ps1` - Sync script with actual token
- `test-firebase-data.ps1` - Firebase test script (uses .env.local)
- `*firebase-adminsdk*.json` - Firebase service account files
- `service-account*.json` - Any service account credentials

## Setup Instructions

1. Copy example files to actual files:
   ```powershell
   Copy-Item get-strava-token.ps1.example get-strava-token.ps1
   Copy-Item debug-strava.ps1.example debug-strava.ps1
   Copy-Item sync-local.ps1.example sync-local.ps1
   Copy-Item test-firebase-data.ps1.example test-firebase-data.ps1
   ```

2. Edit each file and replace placeholder values with your actual credentials

3. Create `.env.local` file with all required environment variables (see `.env.example` if available)

## What to Do If You Accidentally Commit Secrets

1. **Immediately rotate/regenerate the exposed credentials**
2. Remove the file from git history:
   ```bash
   git rm --cached <file>
   git commit -m "Remove sensitive file"
   git push
   ```
3. Consider using `git filter-branch` or `BFG Repo-Cleaner` to remove from history
4. Update `.gitignore` to prevent future commits

## Best Practices

- ✅ Use environment variables for all secrets
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Use `.example` files for templates
- ✅ Review changes before committing (`git diff`)
- ✅ Use GitHub secret scanning alerts
- ✅ Rotate credentials regularly
- ❌ Never hardcode credentials in source files
- ❌ Never commit `.env.local` or similar files
- ❌ Never share credentials in chat or email

## Environment Variables Required

Create a `.env.local` file with:

```env
# Strava API
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_ACCESS_TOKEN=your_access_token
STRAVA_REFRESH_TOKEN=your_refresh_token
STRAVA_CLUB_ID=your_club_id

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"

# Cron Secret
CRON_SECRET=your_secret_token

# Twitch API (optional)
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```

## Reporting Security Issues

If you discover a security vulnerability, please email the repository owner directly instead of opening a public issue.

