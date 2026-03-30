# Admin Affiliate Management — Design Spec

**Date:** 2026-03-30
**Scope:** Sub-project 3. Admin can invite new affiliates (via Supabase email invite), edit affiliate details, toggle active status, and set commission rates. Includes a server API route for the invite flow (requires service role key).

---

## 1. Affiliates List Page (`pages/admin/affiliates/index.vue`)

Replace the placeholder with a full management page.

### Layout

- "Invite Affiliate" primary button at the top-right
- Full-width table with columns: Name, Affiliate ID, Email, Commission %, Status, Actions
- Each row is clickable → navigates to drill-down (`/admin/affiliates/[affiliate_id]`)
- Actions column: Edit button (opens modal), Toggle Active button

### Table Styling

Same Stitch design system as other tables: shadow card, uppercase tracking-widest headers, hover states, status badges (Active = green, Inactive = red).

---

## 2. Invite Affiliate Modal

A modal overlay with a form. Opens when "Invite Affiliate" is clicked.

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Email | email input | Yes | Must be unique |
| Display Name | text input | Yes | |
| Affiliate ID | text input | Yes | Slug format, e.g. "amalfi-tours". Must be unique. |
| Commission % | number input | Yes | Default: 10. Range: 0-100. |
| Website URL | url input | No | |

### Submit Flow

1. POST to `/api/admin/invite-affiliate` with the form data
2. Server route:
   a. Verifies caller is admin (validates Supabase auth token against `admins` table)
   b. Calls `supabase.auth.admin.inviteUserByEmail(email)` using the service role client
   c. Inserts row into `affiliates` table with the returned user UUID as `id`
   d. Inserts row into `affiliate_commissions` table
   e. Returns `{ success: true, affiliate }` or `{ error: string }`
3. On success: close modal, refresh the affiliates list, show success feedback
4. On error: show error message in the modal

The affiliate receives a Supabase invite email with a link to set their password.

---

## 3. Edit Affiliate Modal

Same modal component as invite but in "edit" mode.

### Editable Fields

- Display Name
- Commission %
- Website URL
- Bio (textarea)

### Non-Editable (shown but disabled)

- Email
- Affiliate ID

### Submit Flow

1. Call Supabase client directly (admin RLS allows updates on `affiliates` and `affiliate_commissions`)
2. Update `affiliates` row: display_name, website_url, bio
3. Update `affiliate_commissions` row: commission_percentage
4. On success: close modal, refresh list

No server route needed — admin RLS policies from sub-project 1 allow direct updates.

---

## 4. Toggle Active Status

A button/switch in the actions column. Calls Supabase client to update `affiliates.is_active`. Admin RLS allows this directly.

---

## 5. Server API Route

**File:** `server/api/admin/invite-affiliate.post.ts`

### Environment Variable

Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` (server-side only, never exposed to client).

Add to `nuxt.config.ts` `runtimeConfig` (NOT `runtimeConfig.public`):
```typescript
runtimeConfig: {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  public: { ... }
}
```

### Route Logic

```
1. Read the Authorization header (Bearer token from the client's Supabase session)
2. Create a Supabase client with the anon key, verify the token to get the user
3. Check if the user is in the admins table — if not, return 403
4. Create a service role Supabase client
5. Call auth.admin.inviteUserByEmail(email) → get user UUID
6. Insert into affiliates: { id: user.id, affiliate_id, display_name, email, website_url }
7. Insert into affiliate_commissions: { affiliate_id, commission_percentage }
8. Return { success: true }
```

### Request Body

```typescript
{
  email: string
  displayName: string
  affiliateId: string
  commissionPercentage: number
  websiteUrl?: string
}
```

---

## 6. Composable Updates

### `useAdminData.ts` — Add Functions

```typescript
// Update affiliate profile
async function updateAffiliate(id: string, updates: { display_name?: string; website_url?: string; bio?: string; is_active?: boolean }): Promise<void>

// Update affiliate commission rate
async function updateAffiliateCommission(affiliateId: string, commissionPercentage: number): Promise<void>

// Fetch all commissions (for the list page)
async function fetchAllCommissions(): Promise<AffiliateCommission[]>
```

---

## 7. Component: `AdminAffiliateModal.vue`

**File:** `components/admin/AffiliateModal.vue`

Props:
```typescript
defineProps<{
  open: boolean
  mode: 'invite' | 'edit'
  affiliate?: Affiliate       // populated in edit mode
  commission?: number          // populated in edit mode
}>()
```

Emits: `close`, `saved`

Shared form for both invite and edit. In invite mode, all fields editable + submit POSTs to API. In edit mode, email/affiliate_id disabled + submit updates directly via Supabase.

---

## 8. Files Summary

| File | Action | Description |
|------|--------|-------------|
| `server/api/admin/invite-affiliate.post.ts` | Create | Server route for inviting affiliates (service role key) |
| `components/admin/AffiliateModal.vue` | Create | Modal for invite/edit affiliate |
| `pages/admin/affiliates/index.vue` | Modify | Replace placeholder with management table + modals |
| `composables/useAdminData.ts` | Modify | Add updateAffiliate, updateAffiliateCommission, fetchAllCommissions |
| `nuxt.config.ts` | Modify | Add supabaseServiceRoleKey to runtimeConfig |
| `.env` | Modify | Add SUPABASE_SERVICE_ROLE_KEY |
| `.env.example` | Modify | Add SUPABASE_SERVICE_ROLE_KEY placeholder |

---

## 9. Out of Scope

- Deleting affiliates (deactivate instead)
- Resending invite emails
- Bulk operations
- Campaign management for affiliates (sub-project 4)
