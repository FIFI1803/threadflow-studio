# Security Guide - API Key Rotation & Best Practices

## CRITICAL: Exposed Credentials

⚠️ **IMMEDIATE ACTION REQUIRED**

The `.env.backup` file previously contained exposed production credentials. This file has been **removed**, but the following keys were potentially compromised:

- **OpenAI API Key:** `sk-proj-R-oPldKft0Cc1bS0hSim...`
- **Supabase Project ID:** `lmdmadsgculhtrettkwn`
- **Supabase Anon Key:** Exposed in .env.backup

### Immediate Steps (Do This Now)

1. **Rotate OpenAI API Key** (CRITICAL - prevents unauthorized charges)
2. **Rotate Supabase Keys** (if project was public/shared)
3. **Check git history** to ensure .env.backup was never committed
4. **Monitor OpenAI usage** for unauthorized API calls

---

## API Key Rotation Procedures

### 1. Rotate OpenAI API Key

**Why:** Prevents unauthorized usage and unexpected charges.

**Steps:**

1. **Go to OpenAI Platform:**
   ```
   https://platform.openai.com/api-keys
   ```

2. **Revoke Old Key:**
   - Find the key starting with `sk-proj-R-oPldKft0Cc1bS0hSim...`
   - Click "Revoke" or "Delete"
   - Confirm revocation

3. **Create New API Key:**
   - Click "Create new secret key"
   - Name it: `ThreadFlow Production - [DATE]`
   - Copy the key immediately (you won't see it again!)
   - Save it securely (password manager, not in code)

4. **Update Supabase Edge Function:**
   ```bash
   # Update the secret in Supabase
   supabase secrets set OPENAI_API_KEY=sk-proj-NEW_KEY_HERE

   # Verify it was set
   supabase secrets list
   # Should show: OPENAI_API_KEY (with masked value)
   ```

5. **Test the Function:**
   ```bash
   # Check logs to ensure new key works
   supabase functions logs generate-script --limit 10

   # Or test locally
   supabase functions serve generate-script
   ```

6. **Verify in Production:**
   - Go to your deployed app
   - Try generating a script
   - Check it works without errors

**Frequency:** Rotate monthly or immediately if compromised.

---

### 2. Rotate Supabase Keys

**Why:** If your anon key is exposed, anyone can access your Supabase project (within RLS limits).

**When to Rotate:**
- Keys were committed to public repo
- Keys were shared publicly
- Suspicious activity detected
- Regular security maintenance (quarterly)

**Steps:**

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/[PROJECT_ID]/settings/api
   ```

2. **Generate New Keys:**
   - Click "Generate new keys"
   - **WARNING:** This will invalidate the old keys immediately
   - Copy both:
     - `anon` (public) key
     - `service_role` key (if you use it)

3. **Update Environment Variables:**

   **Local Development:**
   ```bash
   # Edit .env file
   nano .env
   # Update VITE_SUPABASE_PUBLISHABLE_KEY with new anon key
   ```

   **Vercel:**
   ```bash
   vercel env rm VITE_SUPABASE_PUBLISHABLE_KEY production
   vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
   # Enter new key when prompted
   vercel --prod  # Redeploy
   ```

   **Netlify:**
   ```bash
   netlify env:set VITE_SUPABASE_PUBLISHABLE_KEY "new_anon_key"
   netlify deploy --prod  # Redeploy
   ```

4. **Redeploy Application:**
   - The old key stops working immediately
   - Users will get auth errors until redeployment completes
   - **Do this during low-traffic hours**

5. **Verify:**
   - Visit production site
   - Try signing in
   - Generate a script
   - Check for errors

**Downtime:** ~2-5 minutes (during redeployment)

---

### 3. Check Git History for Exposed Secrets

**Check if .env.backup was ever committed:**

```bash
# Search entire git history
git log --all --full-history -- .env.backup

# If found, check the content
git show <commit-hash>:.env.backup
```

**If secrets were committed to git:**

**Option A: Small Repository (Preferred)**
```bash
# Use BFG Repo-Cleaner to purge sensitive data
# https://rtyley.github.io/bfg-repo-cleaner/

# Download BFG
brew install bfg  # macOS
# or download jar from website

# Backup your repo first!
cd ..
cp -r threadflow-studio threadflow-studio-backup

# Remove .env.backup from history
cd threadflow-studio
bfg --delete-files .env.backup

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: Destructive)
git push --force
```

**Option B: Large Repository or Shared**
```bash
# Use git-filter-repo
pip install git-filter-repo

# Remove file from history
git filter-repo --invert-paths --path .env.backup

# Force push
git push --force
```

⚠️ **Warning:** Force pushing rewrites history. Coordinate with team members.

**After Purging:**
- Rotate ALL keys that were in the file
- Notify team members to re-clone the repo

---

## Security Best Practices

### Environment Variables

**DO:**
- ✅ Use `.env.example` as a template (no real values)
- ✅ Add `.env` to `.gitignore` (already done)
- ✅ Use platform environment variables (Vercel/Netlify)
- ✅ Store secrets in password manager
- ✅ Use different keys for dev/staging/production
- ✅ Rotate keys regularly (monthly recommended)

**DON'T:**
- ❌ Commit `.env` files to git
- ❌ Share API keys in Slack/Discord/email
- ❌ Use production keys in development
- ❌ Store keys in code comments
- ❌ Screenshot environment variables

### Supabase Security

**Row Level Security (RLS):**
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Both should return: rowsecurity = true
```

**Check for Policy Gaps:**
```sql
-- List all policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';

-- Ensure each table has SELECT, INSERT, UPDATE, DELETE policies
```

**Service Role Key:**
- NEVER expose `service_role` key to frontend
- Only use server-side (edge functions, backend)
- Bypasses RLS - use with extreme caution

### OpenAI Security

**Usage Limits:**
1. Go to: https://platform.openai.com/account/limits
2. Set monthly spending limit (e.g., $50)
3. Enable email alerts at 50%, 75%, 90%

**Monitor Usage:**
```bash
# Check current usage
curl https://api.openai.com/v1/usage \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Rate Limiting:**
- Implement rate limiting in edge function
- Track requests per user
- Add cooldown periods

### CORS Configuration

**Current Settings (in edge function):**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // Allows all origins
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**For Production (Optional - More Restrictive):**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
```

### Authentication Security

**Enable Email Verification:**
```
Supabase Dashboard > Authentication > Settings
→ Enable "Email Confirmations"
```

**Enable Rate Limiting:**
```
Supabase Dashboard > Authentication > Rate Limits
→ Set limits for:
   - Sign ups per hour
   - Password recovery per hour
   - OTP/Magic link per hour
```

**Strong Password Policy:**
```
Supabase Dashboard > Authentication > Settings
→ Minimum password length: 8+
→ Require special characters (optional)
```

---

## Security Monitoring

### Weekly Checks

```bash
# Check OpenAI usage
# https://platform.openai.com/usage

# Check Supabase logs
supabase functions logs generate-script --limit 100

# Check for suspicious auth attempts
# Supabase Dashboard > Authentication > Users
# Look for: Mass signups, unusual patterns
```

### Monthly Audits

- [ ] Review OpenAI API usage and costs
- [ ] Check Supabase API request patterns
- [ ] Review user growth (spot bot signups)
- [ ] Audit database access logs
- [ ] Rotate OpenAI API key
- [ ] Update dependencies: `npm audit`
- [ ] Review Supabase RLS policies

### Automated Monitoring (Recommended)

**Set up alerts for:**
- Unusual API usage spikes
- High error rates in edge functions
- Database query slow downs
- Authentication failures

**Tools:**
- Supabase Dashboard Metrics
- OpenAI Usage Dashboard
- Sentry (error tracking)
- LogRocket (session replay)

---

## Incident Response Plan

### If API Keys Are Compromised

1. **Immediate (< 5 minutes):**
   - [ ] Revoke compromised keys (OpenAI, Supabase)
   - [ ] Generate new keys
   - [ ] Update production secrets

2. **Short-term (< 1 hour):**
   - [ ] Check usage logs for unauthorized access
   - [ ] Notify users if data breach occurred
   - [ ] Review git history and remove exposed secrets

3. **Follow-up (< 24 hours):**
   - [ ] Audit all credentials and rotate if needed
   - [ ] Review security practices with team
   - [ ] Document incident and lessons learned

### If Unusual Usage Detected

```bash
# Check OpenAI usage by date
# https://platform.openai.com/usage

# Check Supabase edge function logs
supabase functions logs generate-script --since "1 hour ago"

# Check for suspicious user signups
# Supabase Dashboard > Authentication > Users
# Sort by created_at, look for patterns
```

**Actions:**
- Enable rate limiting
- Add CAPTCHA to signup
- Temporarily disable new signups
- Review and optimize RLS policies

---

## Compliance & Privacy

### User Data Handling

**What we store:**
- Email (via Supabase Auth)
- Profile data (display_name, credits)
- Thread content (in projects table)
- Generated scripts (in projects.script_data)

**What we DON'T store:**
- Passwords (hashed by Supabase)
- Payment info (future: handled by Stripe)
- IP addresses (logged by Supabase/Vercel)

**Data Retention:**
- User data: Retained until account deletion
- Projects: Retained until user deletes
- Auth logs: 7 days (Supabase default)

### GDPR Compliance (if applicable)

**User Rights:**
- Right to access: Export data via Supabase API
- Right to deletion: Delete user triggers cascade delete (profile, projects)
- Right to portability: JSON export of projects

**Implement:**
```typescript
// Add to Dashboard.tsx
const exportUserData = async () => {
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
  const { data: projects } = await supabase.from('projects').select('*').eq('user_id', user.id);

  const exportData = { profile, projects };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'threadflow-data.json';
  a.click();
};
```

---

## Security Checklist

### Before Deployment
- [x] .env files in .gitignore
- [x] .env.backup removed
- [x] Production build succeeds
- [x] RLS enabled on all tables
- [x] RLS policies tested
- [x] CORS configured
- [x] OpenAI key in Supabase secrets (not frontend)
- [x] Character limit validation working
- [ ] Email verification enabled (optional)
- [ ] Rate limiting enabled (optional)
- [ ] CAPTCHA on signup (optional)

### Post-Deployment
- [ ] Test auth flow in production
- [ ] Test script generation
- [ ] Monitor OpenAI usage for 24 hours
- [ ] Set OpenAI spending limit
- [ ] Enable usage alerts
- [ ] Document incident response procedures
- [ ] Share security guide with team

### Ongoing
- [ ] Rotate OpenAI key monthly
- [ ] Run `npm audit` monthly
- [ ] Review Supabase logs weekly
- [ ] Monitor costs and usage weekly
- [ ] Update dependencies quarterly

---

## Resources

- **Supabase Security:** https://supabase.com/docs/guides/auth/row-level-security
- **OpenAI Security:** https://platform.openai.com/docs/guides/safety-best-practices
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Git Secret Scanning:** https://docs.github.com/en/code-security/secret-scanning

## Questions?

For security concerns, contact: [Your Security Team Email]

**Never share:**
- API keys
- Service role keys
- Database passwords
- JWT secrets

**When in doubt, rotate the key.**
