# ThreadFlow Studio - Deployment Guide

This guide walks you through deploying ThreadFlow Studio to production.

## Prerequisites

- Node.js 18+ installed
- Supabase account (https://supabase.com)
- OpenAI API account (https://platform.openai.com)
- Vercel or Netlify account (for frontend hosting)

## Step 1: Secure Your Credentials

### IMPORTANT: API Key Security

⚠️ **The `.env.backup` file has been removed** as it contained exposed credentials. If you need to rotate keys:

**Rotate Supabase Keys:**
1. Go to Supabase Dashboard > Project Settings > API
2. Click "Generate new keys"
3. Update your `.env` file with new keys
4. Update deployment platform environment variables

**Rotate OpenAI API Key:**
1. Go to OpenAI Platform > API Keys
2. Revoke the old key
3. Create a new API key
4. Update Supabase Edge Function secret (see below)

## Step 2: Set Up Supabase (Backend)

### 2.1 Create Supabase Project

```bash
# Option A: Via Dashboard
# Go to https://supabase.com/dashboard
# Click "New Project" and follow prompts

# Option B: Via CLI (if you have an org)
supabase projects create threadflow-production
```

### 2.2 Link Local Project to Supabase

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID
```

### 2.3 Apply Database Migrations

```bash
# Push migrations to production
supabase db push

# Verify tables were created
# Go to: Supabase Dashboard > Table Editor
# You should see: profiles, projects tables
```

### 2.4 Verify RLS Policies

In Supabase Dashboard > Authentication > Policies:

**profiles table:**
- ✅ "Users can view their own profile" (SELECT)
- ✅ "Users can update their own profile" (UPDATE)
- ✅ "Users can insert their own profile" (INSERT)

**projects table:**
- ✅ "Users can view their own projects" (SELECT)
- ✅ "Users can create their own projects" (INSERT)
- ✅ "Users can update their own projects" (UPDATE)
- ✅ "Users can delete their own projects" (DELETE)

### 2.5 Deploy Edge Function

```bash
# Deploy the generate-script function
supabase functions deploy generate-script

# Set OpenAI API key secret (REQUIRED)
supabase secrets set OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY

# Verify secret is set
supabase secrets list

# Test the function
supabase functions logs generate-script
```

### 2.6 Get Production Credentials

Go to: Supabase Dashboard > Project Settings > API

Copy these values:
- **Project URL:** `https://[PROJECT_ID].supabase.co`
- **Anon/Public Key:** `eyJhbGc...` (long string)

## Step 3: Configure Environment Variables

### 3.1 Create Local .env File

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your production values
# VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### 3.2 Test Locally

```bash
# Install dependencies
npm install

# Build and preview production build
npm run build
npm run preview

# Test:
# - Signup/signin works
# - Script generation works
# - Credits deduct properly
```

## Step 4: Deploy Frontend

### Option A: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts, then set environment variables:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY

# Deploy to production
vercel --prod
```

**Or via Vercel Dashboard:**
1. Go to https://vercel.com/new
2. Import your Git repository
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
7. Click "Deploy"

### Option B: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Set environment variables
netlify env:set VITE_SUPABASE_URL "https://YOUR_PROJECT_ID.supabase.co"
netlify env:set VITE_SUPABASE_PUBLISHABLE_KEY "your_anon_key"
```

**Or via Netlify Dashboard:**
1. Go to https://app.netlify.com/start
2. Connect to Git repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Click "Deploy site"

## Step 5: Post-Deployment Verification

### 5.1 Test Authentication
- [ ] Visit your production URL
- [ ] Sign up with a new email
- [ ] Verify email (if email confirmation enabled)
- [ ] Check Supabase Dashboard > Authentication > Users (user should appear)
- [ ] Check profile was auto-created with 50 credits

### 5.2 Test Script Generation
- [ ] Paste a thread (50+ characters)
- [ ] Select a vibe
- [ ] Click "Generate Production Blueprint"
- [ ] Verify script generates successfully
- [ ] Check credits decreased by 1
- [ ] Verify project saved in Supabase Dashboard > Table Editor > projects

### 5.3 Test Edge Function
```bash
# Check function logs for errors
supabase functions logs generate-script --limit 50

# Look for:
# - No "OpenAI API key not configured" errors
# - Successful generation logs
# - No CORS errors
```

### 5.4 Test Mobile Responsiveness
- [ ] Open on mobile device or use Chrome DevTools
- [ ] Test viewport < 640px (mobile)
- [ ] Test viewport 640-1024px (tablet)
- [ ] Verify sidebar behavior
- [ ] Test script/preview toggle on mobile

## Step 6: Configure Production Settings

### 6.1 Supabase Auth Settings

Go to: Supabase Dashboard > Authentication > Settings

**Recommended Settings:**
- ✅ Enable Email Confirmations (reduces spam signups)
- ✅ Enable Rate Limiting (prevents abuse)
- ⚠️ Configure Site URL to your production URL
- ⚠️ Add Redirect URLs for OAuth (if using social login)

### 6.2 OpenAI Usage Monitoring

Go to: https://platform.openai.com/usage

- Set up usage limits to prevent unexpected charges
- Monitor daily/monthly usage
- Set up email alerts for high usage

### 6.3 Supabase Project Settings

**Rate Limiting (Free Tier):**
- API requests: Check limits in dashboard
- Edge Functions: Check invocation limits

**Pause Protection:**
- Supabase free tier pauses after 7 days of inactivity
- Set up a cron job to ping your app daily (or upgrade to Pro)

## Troubleshooting

### "Invalid Supabase URL" Error
- Verify environment variables are set correctly
- Check you're using the **Anon/Public** key, not the service role key
- Restart your deployment after changing environment variables

### Edge Function Fails
```bash
# Check logs
supabase functions logs generate-script

# Common issues:
# - OPENAI_API_KEY not set: Run supabase secrets set
# - OpenAI rate limit hit: Check OpenAI dashboard
# - OpenAI API key invalid: Regenerate key
```

### Authentication Not Working
- Verify Supabase Site URL matches your deployment URL
- Check CORS settings in Supabase Dashboard
- Verify RLS policies are enabled
- Check browser console for errors

### Credits Not Deducting
- Verify RLS UPDATE policy on profiles table
- Check user_id matches between session and profile
- Look for errors in browser console Network tab

## Maintenance

### Regular Tasks

**Weekly:**
- Monitor OpenAI API usage and costs
- Check Supabase project usage (database size, API requests)
- Review error logs in Supabase functions

**Monthly:**
- Rotate OpenAI API key (security best practice)
- Review user growth and credit usage patterns
- Update dependencies: `npm outdated` and `npm update`

**As Needed:**
- Apply database migrations: `supabase db push`
- Deploy function updates: `supabase functions deploy`
- Redeploy frontend: `vercel --prod` or `netlify deploy --prod`

## Scaling Considerations

### When to Upgrade Supabase Plan
- Free tier: 50,000 monthly active users, 500 MB database
- If you hit limits, upgrade to Pro ($25/month)

### Performance Optimization
- Enable Supabase connection pooling (Pro tier)
- Add database indexes for large tables:
  ```sql
  CREATE INDEX idx_projects_user_id ON projects(user_id);
  CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
  ```

### Cost Management
- Monitor OpenAI costs (GPT-4o is expensive)
- Consider adding rate limiting to edge function
- Implement caching for repeated requests (future enhancement)

## Security Checklist

- [x] .env files not committed to git
- [x] .env.backup removed (contained exposed keys)
- [x] RLS policies enabled on all tables
- [x] OpenAI key stored as Supabase secret (not in frontend)
- [x] CORS headers configured
- [ ] Email verification enabled in Supabase Auth
- [ ] Rate limiting enabled in Supabase Auth
- [ ] HTTPS enforced (automatic with Vercel/Netlify)
- [ ] Content Security Policy headers (optional, recommended)

## Rollback Plan

If something goes wrong:

```bash
# Rollback Vercel deployment
vercel rollback

# Rollback Netlify deployment
netlify rollback

# Rollback database migration (CAREFUL - may lose data)
supabase db reset  # Local only
# For production, manually run previous migration

# Rollback edge function
supabase functions deploy generate-script --previous
```

## Support

- **Supabase Issues:** https://github.com/supabase/supabase/issues
- **Deployment Issues:** Check platform docs (Vercel/Netlify)
- **OpenAI Issues:** https://help.openai.com

## Next Steps

After successful deployment:
1. Set up monitoring (Sentry, LogRocket, etc.)
2. Configure analytics (Google Analytics, Plausible, etc.)
3. Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
4. Plan payment integration for credit purchases (Stripe)
5. Implement project library/history view
6. Add social login (Google, GitHub OAuth)
