# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ThreadFlow Studio is a React + TypeScript application that converts social media threads (Reddit, X/Twitter) into production-ready video scripts optimized for TikTok and Instagram Reels. The app uses AI to analyze thread content and generate scene-by-scene breakdowns with dialogue, visual instructions, and timing.

**Tech Stack:**
- Frontend: React 18 + TypeScript, Vite (SWC), React Router v6
- UI: shadcn/ui components, Radix UI primitives, Tailwind CSS
- Animations: Framer Motion
- Backend: Supabase (PostgreSQL + Auth + Edge Functions)
- AI: OpenAI GPT-4o (via Supabase Edge Function)
- State Management: TanStack React Query v5
- Build Tool: Vite 5.4+ with SWC plugin

## Development Commands

```bash
# Install dependencies
npm i

# Start development server (port 8080)
npm run dev

# Build for production
npm run build

# Build in development mode (preserves source maps)
npm run build:dev

# Run ESLint
npm run lint

# Preview production build locally
npm run preview
```

## Pre-Deployment Checklist

Before deploying to production:

- [ ] **Remove/secure .env.backup** - Contains exposed API keys (see Security section)
- [ ] Run `npm run build` and verify no errors
- [ ] Test authentication flow (signup, signin, signout)
- [ ] Test script generation with real OpenAI API key
- [ ] Verify credit deduction works correctly
- [ ] Check RLS policies are enabled on all tables
- [ ] Set up Supabase Edge Function secrets (OPENAI_API_KEY)
- [ ] Configure production environment variables
- [ ] Test on mobile viewport (responsive design critical)
- [ ] Verify character limit validation (50-10k chars)
- [ ] Test copy-to-clipboard functionality
- [ ] Check CORS headers in edge function
- [ ] Remove any console.log statements (optional)
- [ ] Update VITE_SUPABASE_PROJECT_ID in .env with production project

## Deployment

### Deploy to Vercel (Recommended for Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# VITE_SUPABASE_URL
# VITE_SUPABASE_PUBLISHABLE_KEY
```

**Vercel Settings:**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm i`
- Node Version: 18.x or higher

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Build settings in netlify.toml or dashboard:
# Build command: npm run build
# Publish directory: dist
```

### Supabase Setup & Deployment

1. **Create Supabase Project:**
   ```bash
   # Login to Supabase CLI
   supabase login

   # Link to existing project
   supabase link --project-ref YOUR_PROJECT_ID

   # OR create new project via dashboard: https://supabase.com/dashboard
   ```

2. **Apply Database Migrations:**
   ```bash
   # Push migrations to production
   supabase db push

   # OR manually run migration SQL in Supabase SQL editor
   # File: supabase/migrations/20260113104212_b8af6104-bb48-4c00-bc56-e50d1df5bfdb.sql
   ```

3. **Deploy Edge Function:**
   ```bash
   # Deploy generate-script function
   supabase functions deploy generate-script

   # Set secrets (REQUIRED)
   supabase secrets set OPENAI_API_KEY=your_openai_api_key
   ```

4. **Verify RLS Policies:**
   - Check that Row Level Security is enabled on `profiles` and `projects` tables
   - Test policies by signing up as a new user
   - Verify users can only access their own data

5. **Get Production Credentials:**
   - Project URL: `https://[PROJECT_ID].supabase.co`
   - Anon/Public Key: Found in Project Settings > API
   - Update frontend `.env` with production values

### Environment Variables Setup

**Frontend (.env):**
```env
# Required for frontend
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[ANON_KEY]

# Get these from: Supabase Dashboard > Project Settings > API
# Use different projects for dev/staging/production
```

**Supabase Edge Function Secrets:**
```bash
# Set via Supabase CLI (stored securely in Supabase)
supabase secrets set OPENAI_API_KEY=sk-proj-...

# Verify secrets are set
supabase secrets list

# For local development, create .env file in supabase/functions/generate-script/
# NOT committed to git
```

**Platform Environment Variables (Vercel/Netlify):**
- Set environment variables in platform dashboard
- Prefix must be `VITE_` for Vite to expose them to client
- Never expose server-side keys (OpenAI key stays in Supabase)
- Redeploy after changing environment variables

**Security Notes:**
- ⚠️ **CRITICAL:** The `.env.backup` file currently contains EXPOSED credentials:
  - OpenAI API key: `sk-proj-R-oPldKft0Cc1bS0hSim...` (partial shown)
  - Supabase credentials exposed
  - **IMMEDIATE ACTION REQUIRED:** Delete file OR rotate ALL keys
- NEVER commit `.env` files to git (.gitignore already configured)
- Use separate Supabase projects for dev/staging/production
- Rotate OpenAI API keys regularly (monthly recommended)
- Monitor OpenAI API usage in dashboard
- Set up spending limits in OpenAI dashboard

## Architecture

### Frontend Structure

The app uses a **single-page layout** with conditional rendering:
- `Dashboard.tsx` is the main page component that handles all routes
- View toggles between **ThreadInput** (content entry) and **ScriptEditor** (generated output)
- State managed locally in Dashboard with React hooks
- Authentication handled via Supabase Auth with automatic session management

### Key Components

**Dashboard** (`src/pages/Dashboard.tsx`):
- Central orchestrator that manages auth state, profile data, and view switching
- Handles generation flow: calls edge function → saves to DB → deducts credits → updates UI
- Contains credit system logic (default: 50 free credits)
- Uses AnimatePresence to smoothly transition between input and editor views

**ThreadInput** (`src/components/ThreadInput.tsx`):
- Validates input length: MIN_CHARS=50, MAX_CHARS=10,000
- Offers vibe selection: cinematic, minimalist, fast-paced
- Shows real-time character count with color-coded validation states
- Keyboard shortcut: Cmd/Ctrl+Enter to generate

**ScriptEditor** (`src/components/ScriptEditor.tsx`):
- Displays generated scenes in a timeline on left, preview on right
- Mobile: toggle between Script and Preview views
- Copy full script button with clipboard API
- Free/Pro tier toggle (Pro shows placeholder for AI-generated visuals)
- Scene data structure: `{ id, dialogue, visualInstruction, duration }`

### Supabase Integration

**Database Schema** (`supabase/migrations/`):
- `profiles` table: user_id, display_name, avatar_url, credits (default 50), tier
- `projects` table: user_id, title, thread_content, video_vibe, status, script_data (JSONB)
- RLS policies: users can only access their own data
- Auto-profile creation trigger on user signup

**Edge Function** (`supabase/functions/generate-script/index.ts`):
- Deno-based serverless function
- Calls OpenAI GPT-4o with structured JSON output
- System prompt instructs AI to create scene-based scripts under 60 seconds
- Returns JSON: `{ scenes: [{ id, dialogue, visualInstruction, duration }] }`
- Requires `OPENAI_API_KEY` environment variable

**Configuration**: `supabase/config.toml` defines the edge function with JWT verification enabled.

### Authentication Flow

1. User lands on `/` → Dashboard checks session via `supabase.auth.getSession()`
2. If no session → redirect to `/auth`
3. Auth page handles signup/signin (managed by Supabase Auth component)
4. On successful auth → profile fetched → Dashboard renders with user data
5. Session persisted in localStorage with auto-refresh

### Generation Flow

1. User enters thread content (50-10k chars) + selects vibe
2. Click "Generate" → checks credits > 0
3. Invokes `supabase.functions.invoke('generate-script', { body: { thread_content, video_vibe } })`
4. Edge function calls OpenAI → parses JSON response
5. Save project to DB with `script_data` JSONB field
6. Deduct 1 credit from profile
7. Refresh profile to update UI credit count
8. Show ScriptEditor with generated scenes

### State Management Pattern

- Local component state for UI (toggles, active scene, loading states)
- Supabase client for data fetching (no React Query hooks in current implementation)
- Manual refetch pattern after mutations (e.g., `fetchProfile()` after credit deduction)
- Auth state managed by Supabase's `onAuthStateChange` listener

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[ANON_KEY]
```

Required in Supabase Edge Function secrets:
```
OPENAI_API_KEY=[API_KEY]
```

## Important Implementation Notes

### Character Limit Validation
- Enforced in `ThreadInput` component with visual feedback
- Three states: too short (< 50), valid (50-10k), too long (> 10k)
- Generate button disabled when invalid
- Color-coded character counter

### Credit System
- Users start with 50 free credits
- 1 credit deducted per successful generation
- Credit check happens before generation
- Credits displayed in DashboardHeader
- On 0 credits → show "Out of credits" toast

### Script Data Structure
Scripts stored as JSONB in `projects.script_data`:
```typescript
{
  scenes: [
    {
      id: number,
      dialogue: string,
      visualInstruction: string,
      duration: string // e.g., "3s"
    }
  ]
}
```

### Error Handling
- Edge function errors caught and displayed as toasts
- Credit deduction failure logged but doesn't block UI update
- Auth errors automatically redirect to `/auth`
- DB errors shown as destructive toasts

## Styling System

### Design Tokens (CSS Variables in src/index.css)
- **Color Palette:**
  - Primary: `--electric-purple` (hsl 263 70% 66%) - Main brand color
  - Accent: `--neon-blue` (hsl 217 91% 60%) - Secondary brand color
  - Background: `--deep-slate` (hsl 222 47% 11%) - Dark base
  - Gradients: Purple-to-blue gradient used throughout

- **Custom Component Classes:**
  - `.glass-card` - Main glassmorphic card with backdrop blur and shadow
  - `.glass-card-subtle` - Lighter version for nested elements
  - `.gradient-text` - Text with purple-to-blue gradient
  - `.glow-button` - Primary CTA with glow effect and hover states
  - `.scene-card` - Individual scene cards with hover animations
  - `.preview-phone` - iPhone-style preview container (9:16 aspect ratio)
  - `.sidebar-item` - Navigation items with active states

- **Animations:**
  - Framer Motion for page transitions, scene changes, loading states
  - Custom keyframes: `fade-in`, `slide-in`, `pulse-glow`, `shimmer`
  - Accordion animations from Radix UI

- **Responsive Design:**
  - Mobile-first approach with Tailwind breakpoints (sm: 640px, md: 768px, lg: 1024px)
  - Mobile view has script/preview toggle
  - Desktop has split-screen layout
  - Hamburger menu on mobile, persistent sidebar on lg+

- **Theming:**
  - Dark theme only (no light mode)
  - Background features radial gradient overlays and dot pattern
  - Custom scrollbar styling (purple accent)
  - Focus-visible styles for accessibility

- **Font:**
  - Inter (loaded from Google Fonts)
  - Weights: 300, 400, 500, 600, 700, 800

## Common Modifications

**Adding a new vibe option**: Edit `vibeOptions` array in `ThreadInput.tsx`

**Changing credit defaults**: Modify `DEFAULT` value in profiles table migration

**Adjusting character limits**: Update `MIN_CHARS` and `MAX_CHARS` constants in `ThreadInput.tsx`

**Modifying AI prompt**: Edit `systemPrompt` in `supabase/functions/generate-script/index.ts`

**Adding fields to script data**: Update the Scene interface and OpenAI prompt to include new fields

## Testing Edge Functions Locally

```bash
# Start Supabase CLI (requires Docker)
supabase start

# Serve edge function locally
supabase functions serve generate-script --env-file .env

# Test with curl
curl -X POST http://localhost:54321/functions/v1/generate-script \
  -H "Content-Type: application/json" \
  -d '{"thread_content": "test content", "video_vibe": "cinematic"}'
```

## Build & Performance Optimization

### Production Build
```bash
# Clean build
rm -rf dist && npm run build

# Verify build output
ls -lh dist/

# Preview production build
npm run preview
```

**Build Output:**
- Vite automatically code-splits React Router routes
- SWC plugin provides faster compilation than Babel
- CSS is extracted and minified by Lightning CSS
- Assets hashed for cache busting
- Source maps available in dev mode (`build:dev`)

**Bundle Size Optimization:**
- Tree-shaking enabled by default (Vite)
- React Router lazy-loads NotFound component (if needed)
- Framer Motion is tree-shakeable (import specific components)
- Radix UI components are separate packages (reduces bundle)

**Performance Considerations:**
- Supabase client initialization happens once in `client.ts`
- React Query not actively used (consider adding for profile/projects caching)
- Profile fetched on every Dashboard mount (could be optimized with React Query)
- Large thread inputs (10k chars) may slow OpenAI response time

## Troubleshooting

### Build Errors

**"Module not found" errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm i
```

**TypeScript errors in production build:**
- Check `tsconfig.json` - strict mode is DISABLED (`noImplicitAny: false`, `strictNullChecks: false`)
- This allows looser typing but may hide bugs
- Consider enabling strict mode for better type safety

### Runtime Errors

**"Invalid Supabase URL" or Auth errors:**
- Verify `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- Restart dev server after changing `.env` (`npm run dev`)
- Check Supabase project is not paused (free tier auto-pauses after inactivity)

**Edge Function errors:**
- Check function logs: `supabase functions logs generate-script`
- Verify `OPENAI_API_KEY` secret is set: `supabase secrets list`
- Test function locally: `supabase functions serve generate-script`
- Check CORS headers are correct in `index.ts`

**Credit deduction not working:**
- Verify RLS policies allow UPDATE on profiles table
- Check user_id matches between session and profile
- Look for errors in browser console (Network tab)

**Copy to clipboard not working:**
- Requires HTTPS or localhost (Clipboard API restriction)
- Check browser permissions for clipboard access
- Fallback: manually select and copy text

### Database Issues

**Profile not created on signup:**
- Check `handle_new_user()` trigger is active
- Verify trigger is on `auth.users` table
- Manually create profile in Supabase Table Editor if needed

**Projects not saving:**
- Verify RLS policies allow INSERT for authenticated users
- Check `user_id` in JWT matches `auth.uid()`
- Test policy in Supabase SQL editor

**Migrations not applying:**
```bash
# Check migration status
supabase migration list

# Reset database (DESTRUCTIVE - dev only)
supabase db reset

# Apply specific migration
supabase migration up
```

## Security Best Practices

### Critical Security Issues to Fix

1. **EXPOSED API KEYS in .env.backup:**
   - File contains real OpenAI API key and Supabase keys
   - **Action Required:** Delete file OR rotate all keys immediately
   - Check git history: `git log -- .env.backup` (may need to purge history)

2. **API Key Rotation:**
   ```bash
   # Rotate Supabase keys (if exposed)
   # Go to: Supabase Dashboard > Settings > API > Generate new keys

   # Rotate OpenAI key
   # Go to: OpenAI Dashboard > API Keys > Revoke and create new

   # Update secrets
   supabase secrets set OPENAI_API_KEY=new_key
   ```

3. **RLS Policy Verification:**
   - Test policies by creating a second test user
   - Verify users CANNOT see other users' projects/profiles
   - Check policies in Supabase Dashboard > Authentication > Policies

4. **Edge Function Security:**
   - JWT verification is ENABLED (`verify_jwt: true` in config.toml)
   - CORS allows all origins (`*`) - restrict in production if needed
   - OpenAI API key stored as secret (not in code)

5. **XSS Prevention:**
   - User input (thread_content) sent to OpenAI but not rendered directly
   - Generated script dialogue rendered as text (React escapes by default)
   - No `dangerouslySetInnerHTML` usage (good!)

### Recommended Security Enhancements

- Add rate limiting to edge function (prevent abuse)
- Implement CAPTCHA on signup (prevent bot signups)
- Add email verification before allowing generation
- Set up Supabase Auth rate limiting
- Monitor OpenAI API usage (set spending limits)
- Add Content Security Policy headers
- Implement request logging for audit trail

## Database Schema Reference

### Tables

**profiles:**
```sql
- id: UUID (PK, auto-generated)
- user_id: UUID (FK to auth.users, UNIQUE)
- display_name: TEXT
- avatar_url: TEXT (not currently used)
- credits: INTEGER (default: 50)
- tier: TEXT (default: 'free')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP (auto-updated via trigger)
```

**projects:**
```sql
- id: UUID (PK, auto-generated)
- user_id: UUID (FK to auth.users)
- title: TEXT
- thread_content: TEXT (50-10000 chars)
- video_vibe: TEXT ('cinematic', 'minimalist', 'fast-paced')
- tier: TEXT (default: 'free')
- status: TEXT (default: 'draft')
- script_data: JSONB (structure: { scenes: [...] })
- created_at: TIMESTAMP
- updated_at: TIMESTAMP (auto-updated via trigger)
```

### Indexes
- `profiles.user_id` - Unique index for auth lookups
- `projects.user_id` - Index for user's project queries (add if performance issues)

### Triggers
- `on_auth_user_created` - Creates profile when user signs up
- `update_profiles_updated_at` - Updates timestamp on profile changes
- `update_projects_updated_at` - Updates timestamp on project changes

## Testing Strategy

### Manual Testing Checklist

**Authentication:**
- [ ] Signup with new email
- [ ] Signin with existing user
- [ ] Signout redirects to /auth
- [ ] Profile auto-created with 50 credits
- [ ] Session persists on page reload

**Script Generation:**
- [ ] Input validation (too short, too long, valid)
- [ ] Character counter updates in real-time
- [ ] Vibe selector changes value
- [ ] Generate button disabled when invalid
- [ ] Loading state shows during generation
- [ ] Credits decrease after successful generation
- [ ] Toast notifications show correctly
- [ ] Editor shows generated scenes
- [ ] Can switch back to input view

**Script Editor:**
- [ ] Scenes display correctly
- [ ] Scene navigation works
- [ ] Preview updates when scene changes
- [ ] Copy button copies full script
- [ ] Free/Pro toggle shows/hides features
- [ ] Mobile view toggles between script/preview
- [ ] Back button returns to input

**Responsive Design:**
- [ ] Test on mobile (< 640px)
- [ ] Test on tablet (640-1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Sidebar behavior on different sizes
- [ ] Button text shortens on mobile

### Edge Function Testing

```bash
# Local testing
supabase functions serve generate-script

# Test with curl
curl -X POST http://localhost:54321/functions/v1/generate-script \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "thread_content": "This is a test thread about tech startups...",
    "video_vibe": "cinematic"
  }'

# Check logs
supabase functions logs generate-script --follow
```

## Known Issues / Future Enhancements

### Current Limitations
- Mock scenes in `Dashboard.tsx` are fallback data (not used in normal flow)
- All routes (`/scripts`, `/library`, `/settings`) currently render Dashboard component
- AppSidebar exists but navigation functionality not fully implemented
- Pro tier toggle is UI-only (no backend gating or payment integration)
- Profile avatar_url field exists but not used in current UI
- No project history/library view (projects saved but not displayed)
- No edit functionality for generated scripts (read-only)
- Credit purchases not implemented (no Stripe/payment integration)

### Planned Features (Based on Code Structure)
- Project library view at `/scripts` route
- Script editing capabilities (modify dialogue/visuals)
- AI-generated visuals for Pro tier (placeholder exists)
- Avatar upload functionality
- Settings page for profile management
- Project search/filtering
- Export options (PDF, Markdown, JSON)
- Video preview playback (currently static)
- Collaboration features (share projects)

### Technical Debt
- TypeScript strict mode disabled (consider enabling)
- React Query installed but not utilized (manual fetching)
- Profile refetch after credit deduction (could use optimistic updates)
- No error boundary components (app crashes on errors)
- No loading states for profile fetch (shows nothing while loading)
- Edge function error handling could be more granular
- No retry logic for failed OpenAI requests
- Console.error statements in production build

## File Structure Overview

```
threadflow-studio/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components (auto-generated)
│   │   ├── AppSidebar.tsx   # Navigation sidebar
│   │   ├── DashboardHeader.tsx  # User info + credit display
│   │   ├── LoadingScreen.tsx    # Auth loading state
│   │   ├── ScriptEditor.tsx     # Generated script viewer
│   │   └── ThreadInput.tsx      # Main input form
│   ├── hooks/
│   │   └── use-toast.ts     # Toast notification hook
│   ├── integrations/supabase/
│   │   ├── client.ts        # Supabase client setup
│   │   └── types.ts         # Auto-generated DB types
│   ├── lib/
│   │   └── utils.ts         # Utility functions (cn helper)
│   ├── pages/
│   │   ├── Auth.tsx         # Login/signup page
│   │   ├── Dashboard.tsx    # Main app page
│   │   └── NotFound.tsx     # 404 page
│   ├── App.tsx              # Root component + routing
│   ├── index.css            # Global styles + Tailwind
│   └── main.tsx             # React entry point
├── supabase/
│   ├── functions/
│   │   └── generate-script/ # OpenAI edge function
│   ├── migrations/          # Database schema
│   └── config.toml          # Supabase configuration
├── public/                  # Static assets
├── .env                     # Environment variables (gitignored)
├── package.json             # Dependencies + scripts
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript config
└── vite.config.ts           # Vite build config
```

## Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev
- **shadcn/ui Components:** https://ui.shadcn.com
- **Framer Motion:** https://www.framer.com/motion
- **OpenAI API:** https://platform.openai.com/docs
- **React Router v6:** https://reactrouter.com

## Quick Reference Commands

```bash
# Development
npm run dev                  # Start dev server
npm run build               # Production build
npm run lint                # Run ESLint

# Supabase
supabase start              # Start local Supabase
supabase db reset           # Reset local DB
supabase functions serve    # Test functions locally
supabase db push            # Push migrations to production
supabase functions deploy   # Deploy edge functions
supabase secrets set KEY=val # Set edge function secrets

# Deployment
vercel                      # Deploy to Vercel
netlify deploy --prod       # Deploy to Netlify

# Troubleshooting
rm -rf node_modules && npm i  # Clean reinstall
rm -rf dist && npm run build  # Clean build
supabase functions logs      # View function logs
```
