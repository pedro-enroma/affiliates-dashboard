# Auth, Roles & Data Isolation — Design Spec

**Date:** 2026-03-30
**Scope:** Sub-project 1 of the admin/affiliate role system. Establishes the `admins` table, `useAuth` composable, middleware guards (no unauthenticated access to anything), admin layout/routes shell, and affiliate data isolation (explicit `affiliate_id` filtering + RLS verification).

**Constraint:** Nothing is accessible without login. Every non-public route requires authentication. Admin routes additionally require admin role.

---

## 1. `admins` Table (Supabase)

Create via SQL migration:

```sql
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: only the authenticated user can check if they are an admin
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own admin status"
  ON admins FOR SELECT
  USING (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies — only service role (Supabase dashboard) can manage admins
```

To make yourself admin, insert your `user_id` via the Supabase SQL editor or dashboard table editor.

---

## 2. `useAuth` Composable

**File:** `composables/useAuth.ts`

Determines whether the current user is admin or affiliate. Queries the `admins` table once per session and caches the result.

```typescript
export function useAuth() {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  const isAdmin = useState<boolean>('auth-is-admin', () => false)
  const authLoading = useState<boolean>('auth-loading', () => true)
  const authChecked = useState<boolean>('auth-checked', () => false)

  async function checkRole() {
    if (!user.value) {
      isAdmin.value = false
      authLoading.value = false
      authChecked.value = true
      return
    }

    if (authChecked.value) {
      authLoading.value = false
      return
    }

    const { data } = await client
      .from('admins')
      .select('id')
      .eq('user_id', user.value.id)
      .maybeSingle()

    isAdmin.value = !!data
    authLoading.value = false
    authChecked.value = true
  }

  const isAffiliate = computed(() => !isAdmin.value)
  const role = computed(() => isAdmin.value ? 'admin' as const : 'affiliate' as const)

  return { isAdmin, isAffiliate, role, authLoading, authChecked, checkRole }
}
```

**Key behaviors:**
- `checkRole()` is called in middleware before any route renders
- Result cached in `useState` — survives client-side navigation, only re-checks on full page refresh
- `maybeSingle()` returns null if no admin row (not an error)
- `authChecked` prevents redundant queries on subsequent navigations

---

## 3. Middleware

**File:** `middleware/auth.ts`

Replace the current middleware entirely. The new middleware enforces:

1. **Unauthenticated users** → redirect to `/login` (for any non-public route)
2. **Admin accessing `/admin/*`** → allowed
3. **Admin accessing affiliate routes (`/`, `/traffic`, etc.)** → redirect to `/admin`
4. **Affiliate accessing `/admin/*`** → redirect to `/`
5. **Public routes** → no auth check needed

```
Public routes: /login, /forgot-password, /reset-password, /confirm
Admin routes:  /admin, /admin/*
Affiliate routes: everything else (/, /traffic, /earnings, /campaigns, /settings)
```

The middleware must call `useAuth().checkRole()` to determine the role before routing decisions. Since `checkRole` is async, the middleware must await it.

**Important:** The middleware runs on EVERY navigation. The `useAuth` composable caches the admin check so it only queries Supabase once per session. Subsequent middleware runs use the cached value.

---

## 4. Login Redirect

**File:** `pages/login.vue`

After successful Supabase auth:
1. Call `useAuth().checkRole()` to determine role
2. If admin → `navigateTo('/admin')`
3. If affiliate → `navigateTo('/')`

Currently the login page likely just redirects to `/` — update it to be role-aware.

---

## 5. Admin Layout

**File:** `layouts/admin.vue`

Same visual structure as `layouts/default.vue` (sidebar + top bar + content area) but with:
- Different nav items: Dashboard, Affiliates, Campaigns, Settings
- "Admin" badge next to the NUMAtours logo in the sidebar
- No "New Campaign" button (admin creates campaigns from the Affiliates section)
- Sign out in the sidebar (same as affiliate layout)

The admin layout reuses the same Stitch design system (emerald tokens, Material icons, Plus Jakarta Sans + Manrope).

Admin nav items:
```
- /admin           → Dashboard       icon: dashboard
- /admin/affiliates → Affiliates     icon: group
- /admin/campaigns  → Campaigns      icon: campaign
- /admin/settings   → Settings       icon: settings
```

---

## 6. Admin Pages (Shell Only)

Create placeholder pages for the admin routes so the layout and navigation work. Each page just shows the page title — actual functionality comes in sub-projects 2-4.

- `pages/admin/index.vue` — "Admin Dashboard" placeholder
- `pages/admin/affiliates/index.vue` — "Affiliates" placeholder
- `pages/admin/campaigns/index.vue` — "Campaigns" placeholder
- `pages/admin/settings.vue` — "Settings" placeholder

---

## 7. Affiliate Data Isolation

### 7a. Explicit `affiliate_id` Filtering in Composables

Currently, `useTraffic` and `useEarnings` queries don't include an `affiliate_id` filter — they rely on Supabase RLS. Add explicit filtering as defense-in-depth.

**Modified composables:** `useTraffic.ts`, `useEarnings.ts`, `useCampaigns.ts`

Each fetch function gains an optional `affiliateId?: string` parameter:
- If provided → filter by that affiliate_id (used by admin drill-down later)
- If not provided → get the current user's affiliate_id from `useAffiliate()` and filter by it

Example for `fetchDailyTraffic`:
```typescript
async function fetchDailyTraffic(range: DateRange, affiliateId?: string): Promise<DailyTraffic[]> {
  const id = affiliateId || affiliate.value?.affiliate_id
  if (!id) return []

  let query = client
    .from('affiliate_daily_traffic')
    .select('*')
    .eq('affiliate_id', id)
    .gte('date', range.start)
    .lte('date', range.end)
    .order('date', { ascending: true })

  const { data, error } = await query
  if (error) throw error
  return (data || []) as DailyTraffic[]
}
```

The same pattern applies to: `fetchDailyEvents`, `fetchDemographics`, `fetchBookings`, `fetchAllBookings`, `fetchCampaigns`.

Note: `useTraffic` and `useEarnings` currently don't have access to the affiliate object. They'll need to either accept it as a parameter or import `useAffiliate`. Since the composables are called from page-level code which already has the affiliate, passing `affiliateId` explicitly from the page is cleaner.

**For the dashboard page (`pages/index.vue`):** Update `loadData()` to pass `affiliate.value.affiliate_id` to all fetch calls.

### 7b. RLS Verification

Provide SQL statements to verify/create RLS policies on all data tables. These should be run in the Supabase SQL editor:

Tables requiring RLS with `affiliate_id` filtering:
- `affiliate_daily_traffic`
- `affiliate_daily_events`
- `affiliate_traffic_demographics`
- `activity_bookings`
- `affiliate_campaigns`
- `affiliate_commissions`
- `affiliates`

The RLS policy pattern for each:
```sql
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

-- Affiliates can read their own data
CREATE POLICY "affiliate_read_own" ON <table_name>
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

-- Admins can read all data
CREATE POLICY "admin_read_all" ON <table_name>
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );
```

For the `affiliates` table itself:
```sql
-- Affiliates can read their own profile
CREATE POLICY "affiliate_read_own_profile" ON affiliates
  FOR SELECT USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "admin_read_all_profiles" ON affiliates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- Admins can insert/update affiliates
CREATE POLICY "admin_manage_affiliates" ON affiliates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );
```

The spec provides the SQL but it must be run manually in Supabase — this project has no migration system.

---

## 8. Files Summary

| File | Action | Description |
|------|--------|-------------|
| `composables/useAuth.ts` | Create | Admin/affiliate role check, cached per session |
| `middleware/auth.ts` | Modify | Full rewrite: auth + role-based routing |
| `layouts/admin.vue` | Create | Admin layout with admin nav items |
| `pages/login.vue` | Modify | Role-aware redirect after login |
| `pages/admin/index.vue` | Create | Admin dashboard placeholder |
| `pages/admin/affiliates/index.vue` | Create | Affiliates list placeholder |
| `pages/admin/campaigns/index.vue` | Create | Campaigns placeholder |
| `pages/admin/settings.vue` | Create | Admin settings placeholder |
| `composables/useTraffic.ts` | Modify | Add optional `affiliateId` param to all fetch functions |
| `composables/useEarnings.ts` | Modify | Add optional `affiliateId` param to fetch functions |
| `composables/useCampaigns.ts` | Modify | Add optional `affiliateId` param to fetchCampaigns |
| `pages/index.vue` | Modify | Pass affiliate_id explicitly to all data fetches |
| `docs/rls-policies.sql` | Create | SQL for RLS verification/creation (run manually in Supabase) |

---

## 9. Out of Scope

- Admin dashboard content (sub-project 2)
- Affiliate CRUD UI (sub-project 3)
- Campaign management for other affiliates (sub-project 4)
- Supabase auth provider changes (stays email/password)
- Dark mode
