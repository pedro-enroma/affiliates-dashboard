# Admin Affiliate Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the admin affiliate management page — invite new affiliates via Supabase email invite, edit details/commission, toggle active status.

**Architecture:** A Nuxt server API route (`/api/admin/invite-affiliate`) handles the invite flow using the Supabase service role key (never exposed to client). The client-side page uses `useAdminData` composable for listing, editing, and toggling affiliates. A shared modal component handles both invite and edit forms.

**Tech Stack:** Nuxt 3, Supabase (service role for invites, anon key + admin RLS for CRUD), TypeScript

**Note:** No test framework. Verify via dev server (port 6500).

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `nuxt.config.ts` | Modify | Add `supabaseServiceRoleKey` to server-only runtimeConfig |
| `.env.example` | Modify | Add `SUPABASE_SERVICE_ROLE_KEY` placeholder |
| `server/api/admin/invite-affiliate.post.ts` | Create | Server route: verify admin, invite user, create affiliate + commission rows |
| `composables/useAdminData.ts` | Modify | Add `updateAffiliate`, `updateAffiliateCommission`, `fetchAllCommissions` |
| `components/admin/AffiliateModal.vue` | Create | Modal form for invite/edit affiliate |
| `pages/admin/affiliates/index.vue` | Modify | Replace placeholder with management table + modals |

---

### Task 1: Add Service Role Key to Config

**Files:**
- Modify: `nuxt.config.ts`
- Modify: `.env.example`

- [ ] **Step 1: Update nuxt.config.ts**

Add `supabaseServiceRoleKey` to the server-only `runtimeConfig` (NOT inside `public`):

```typescript
  runtimeConfig: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    public: {
      baseUrl: process.env.BASE_URL || 'https://enroma.com',
      bookingsSupabaseUrl: process.env.BOOKINGS_SUPABASE_URL || '',
      bookingsSupabaseKey: process.env.BOOKINGS_SUPABASE_KEY || '',
    },
  },
```

- [ ] **Step 2: Update .env.example**

Add after the `SUPABASE_KEY` line:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 3: Commit**

```bash
git add nuxt.config.ts .env.example
git commit -m "feat: add supabaseServiceRoleKey to server-only runtimeConfig"
```

---

### Task 2: Create Server API Route for Invite

**Files:**
- Create: `server/api/admin/invite-affiliate.post.ts`

- [ ] **Step 1: Create the server route**

```typescript
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Read the request body
  const body = await readBody<{
    email: string
    displayName: string
    affiliateId: string
    commissionPercentage: number
    websiteUrl?: string
  }>(event)

  if (!body.email || !body.displayName || !body.affiliateId || body.commissionPercentage == null) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  // Get the caller's auth token from the Authorization header
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  const token = authHeader.slice(7)

  // Create a client with the anon key to verify the caller
  const anonClient = createClient(
    config.public.supabaseUrl || process.env.SUPABASE_URL || '',
    config.public.supabaseKey || process.env.SUPABASE_KEY || '',
  )

  // Verify the token and get the user
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
  if (authError || !user) {
    throw createError({ statusCode: 401, message: 'Invalid token' })
  }

  // Check if the caller is an admin
  const { data: adminRow } = await anonClient
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) {
    throw createError({ statusCode: 403, message: 'Not an admin' })
  }

  // Create a service role client for admin operations
  const serviceClient = createClient(
    process.env.SUPABASE_URL || '',
    config.supabaseServiceRoleKey,
  )

  // Invite the user by email
  const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(body.email)
  if (inviteError) {
    throw createError({ statusCode: 400, message: inviteError.message })
  }

  const newUserId = inviteData.user.id

  // Insert the affiliate profile
  const { error: affiliateError } = await serviceClient
    .from('affiliates')
    .insert({
      id: newUserId,
      affiliate_id: body.affiliateId,
      display_name: body.displayName,
      email: body.email,
      website_url: body.websiteUrl || null,
      is_active: true,
    })

  if (affiliateError) {
    throw createError({ statusCode: 400, message: affiliateError.message })
  }

  // Insert the commission rate
  const { error: commissionError } = await serviceClient
    .from('affiliate_commissions')
    .insert({
      affiliate_id: body.affiliateId,
      commission_percentage: body.commissionPercentage,
    })

  if (commissionError) {
    throw createError({ statusCode: 400, message: commissionError.message })
  }

  return { success: true }
})
```

- [ ] **Step 2: Commit**

```bash
git add server/api/admin/invite-affiliate.post.ts
git commit -m "feat: add server route for inviting affiliates via Supabase"
```

---

### Task 3: Add CRUD Functions to useAdminData

**Files:**
- Modify: `composables/useAdminData.ts`

- [ ] **Step 1: Add three new functions after the existing ones**

Add these functions before the `return` statement:

```typescript
  async function updateAffiliate(
    userId: string,
    updates: { display_name?: string; website_url?: string; bio?: string; is_active?: boolean },
  ): Promise<void> {
    const { error } = await client
      .from('affiliates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error
  }

  async function updateAffiliateCommission(affiliateId: string, commissionPercentage: number): Promise<void> {
    const { error } = await client
      .from('affiliate_commissions')
      .update({ commission_percentage: commissionPercentage, updated_at: new Date().toISOString() })
      .eq('affiliate_id', affiliateId)

    if (error) throw error
  }

  async function fetchAllCommissions(): Promise<AffiliateCommission[]> {
    const { data, error } = await client
      .from('affiliate_commissions')
      .select('*')

    if (error) throw error
    return (data || []) as AffiliateCommission[]
  }
```

Update the return statement:

```typescript
  return {
    fetchAllAffiliates,
    fetchAffiliateCommission,
    groupTrafficByAffiliate,
    groupBookingsByAffiliate,
    updateAffiliate,
    updateAffiliateCommission,
    fetchAllCommissions,
  }
```

- [ ] **Step 2: Commit**

```bash
git add composables/useAdminData.ts
git commit -m "feat: add updateAffiliate, updateAffiliateCommission, fetchAllCommissions to useAdminData"
```

---

### Task 4: Create AffiliateModal Component

**Files:**
- Create: `components/admin/AffiliateModal.vue`

- [ ] **Step 1: Create the modal component**

```vue
<template>
  <div v-if="open" class="fixed inset-0 z-[60] flex items-center justify-center">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/50" @click="$emit('close')" />

    <!-- Modal -->
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-8 z-10">
      <h2 class="text-xl font-bold text-on-surface font-headline mb-6">
        {{ mode === 'invite' ? 'Invite Affiliate' : 'Edit Affiliate' }}
      </h2>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Email -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            :disabled="mode === 'edit'"
            :class="[
              'w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all',
              mode === 'edit' ? 'bg-surface-container-low text-zinc-400' : '',
            ]"
            placeholder="affiliate@example.com"
          />
        </div>

        <!-- Display Name -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Display Name</label>
          <input
            v-model="form.displayName"
            type="text"
            required
            class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
            placeholder="John's Travel Blog"
          />
        </div>

        <!-- Affiliate ID -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Affiliate ID</label>
          <input
            v-model="form.affiliateId"
            type="text"
            required
            :disabled="mode === 'edit'"
            :class="[
              'w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all font-mono',
              mode === 'edit' ? 'bg-surface-container-low text-zinc-400' : '',
            ]"
            placeholder="johns-travel-blog"
          />
        </div>

        <!-- Commission % -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Commission %</label>
          <input
            v-model.number="form.commissionPercentage"
            type="number"
            required
            min="0"
            max="100"
            step="0.1"
            class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
          />
        </div>

        <!-- Website URL -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Website URL</label>
          <input
            v-model="form.websiteUrl"
            type="url"
            class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
            placeholder="https://example.com"
          />
        </div>

        <!-- Bio (edit mode only) -->
        <div v-if="mode === 'edit'">
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Bio</label>
          <textarea
            v-model="form.bio"
            rows="3"
            class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all resize-none"
            placeholder="Short bio..."
          />
        </div>

        <!-- Error -->
        <p v-if="error" class="text-sm text-error">{{ error }}</p>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-zinc-500 bg-surface-container-low hover:bg-surface-container-high transition-colors"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="flex-1 py-2.5 rounded-xl text-sm font-bold text-on-primary bg-primary hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {{ saving ? 'Saving...' : mode === 'invite' ? 'Send Invite' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Affiliate } from '~/types'

const props = defineProps<{
  open: boolean
  mode: 'invite' | 'edit'
  affiliate?: Affiliate
  commission?: number
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const client = useSupabaseClient()
const { updateAffiliate, updateAffiliateCommission } = useAdminData()

const form = reactive({
  email: '',
  displayName: '',
  affiliateId: '',
  commissionPercentage: 10,
  websiteUrl: '',
  bio: '',
})

const error = ref('')
const saving = ref(false)

// Populate form when opening in edit mode
watch(() => props.open, (isOpen) => {
  if (isOpen && props.mode === 'edit' && props.affiliate) {
    form.email = props.affiliate.email
    form.displayName = props.affiliate.display_name
    form.affiliateId = props.affiliate.affiliate_id
    form.commissionPercentage = props.commission || 0
    form.websiteUrl = props.affiliate.website_url || ''
    form.bio = props.affiliate.bio || ''
  } else if (isOpen && props.mode === 'invite') {
    form.email = ''
    form.displayName = ''
    form.affiliateId = ''
    form.commissionPercentage = 10
    form.websiteUrl = ''
    form.bio = ''
  }
  error.value = ''
})

async function handleSubmit() {
  error.value = ''
  saving.value = true

  try {
    if (props.mode === 'invite') {
      await inviteAffiliate()
    } else {
      await editAffiliate()
    }
    emit('saved')
    emit('close')
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Something went wrong'
  } finally {
    saving.value = false
  }
}

async function inviteAffiliate() {
  const session = useSupabaseSession()
  const token = session.value?.access_token
  if (!token) throw new Error('Not authenticated')

  const res = await $fetch('/api/admin/invite-affiliate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      email: form.email,
      displayName: form.displayName,
      affiliateId: form.affiliateId,
      commissionPercentage: form.commissionPercentage,
      websiteUrl: form.websiteUrl || undefined,
    },
  })

  if (!(res as any).success) {
    throw new Error((res as any).error || 'Invite failed')
  }
}

async function editAffiliate() {
  if (!props.affiliate) return

  await updateAffiliate(props.affiliate.id, {
    display_name: form.displayName,
    website_url: form.websiteUrl || null,
    bio: form.bio || null,
  })

  await updateAffiliateCommission(props.affiliate.affiliate_id, form.commissionPercentage)
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/AffiliateModal.vue
git commit -m "feat: add AffiliateModal component for invite and edit flows"
```

---

### Task 5: Build Affiliates Management Page

**Files:**
- Modify: `pages/admin/affiliates/index.vue`

- [ ] **Step 1: Replace the placeholder entirely**

```vue
<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-on-surface font-headline">Affiliates</h1>
      <button
        class="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
        @click="openInvite"
      >
        <span class="material-symbols-outlined text-sm">person_add</span>
        Invite Affiliate
      </button>
    </div>

    <!-- Table -->
    <section class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] overflow-hidden">
      <div v-if="affiliates.length" class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-surface-container-low/50">
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Name</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Affiliate ID</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Email</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Commission %</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/5">
            <tr
              v-for="(aff, i) in affiliates"
              :key="aff.id"
              :class="[
                'hover:bg-primary-container/5 transition-colors cursor-pointer',
                i % 2 === 1 ? 'bg-surface-container-low/30' : '',
              ]"
              @click="navigateTo(`/admin/affiliates/${aff.affiliate_id}`)"
            >
              <td class="px-8 py-5 text-sm font-semibold text-on-surface">{{ aff.display_name }}</td>
              <td class="px-8 py-5 text-sm text-on-surface-variant font-mono">{{ aff.affiliate_id }}</td>
              <td class="px-8 py-5 text-sm text-on-surface-variant">{{ aff.email }}</td>
              <td class="px-8 py-5 text-sm font-semibold">{{ getCommission(aff.affiliate_id) }}%</td>
              <td class="px-8 py-5">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                    aff.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
                  ]"
                >
                  {{ aff.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-8 py-5" @click.stop>
                <div class="flex items-center gap-2">
                  <button
                    class="p-2 text-zinc-400 hover:text-primary transition-colors rounded-lg hover:bg-surface-container-low"
                    title="Edit"
                    @click="openEdit(aff)"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    :class="[
                      'p-2 transition-colors rounded-lg',
                      aff.is_active
                        ? 'text-zinc-400 hover:text-error hover:bg-red-50'
                        : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50',
                    ]"
                    :title="aff.is_active ? 'Deactivate' : 'Activate'"
                    @click="toggleActive(aff)"
                  >
                    <span class="material-symbols-outlined text-lg">
                      {{ aff.is_active ? 'person_off' : 'person' }}
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-12 text-zinc-400 text-sm">
        No affiliates yet. Invite your first affiliate to get started.
      </div>
    </section>

    <!-- Modal -->
    <AdminAffiliateModal
      :open="modalOpen"
      :mode="modalMode"
      :affiliate="editingAffiliate"
      :commission="editingCommission"
      @close="modalOpen = false"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { Affiliate, AffiliateCommission } from '~/types'

definePageMeta({ layout: 'admin' })

const { fetchAllAffiliates, fetchAllCommissions, updateAffiliate } = useAdminData()

const affiliates = ref<Affiliate[]>([])
const commissions = ref<AffiliateCommission[]>([])

const modalOpen = ref(false)
const modalMode = ref<'invite' | 'edit'>('invite')
const editingAffiliate = ref<Affiliate | undefined>()
const editingCommission = ref<number>(0)

function getCommission(affiliateId: string): number {
  const comm = commissions.value.find((c) => c.affiliate_id === affiliateId)
  return comm?.commission_percentage || 0
}

function openInvite() {
  modalMode.value = 'invite'
  editingAffiliate.value = undefined
  editingCommission.value = 10
  modalOpen.value = true
}

function openEdit(aff: Affiliate) {
  modalMode.value = 'edit'
  editingAffiliate.value = aff
  editingCommission.value = getCommission(aff.affiliate_id)
  modalOpen.value = true
}

async function toggleActive(aff: Affiliate) {
  await updateAffiliate(aff.id, { is_active: !aff.is_active })
  await loadData()
}

async function onSaved() {
  await loadData()
}

async function loadData() {
  const [affs, comms] = await Promise.all([
    fetchAllAffiliates(),
    fetchAllCommissions(),
  ])
  affiliates.value = affs
  commissions.value = comms
}

loadData()
</script>
```

- [ ] **Step 2: Commit**

```bash
git add pages/admin/affiliates/index.vue
git commit -m "feat: build affiliate management page with invite, edit, and toggle active"
```

---

### Task 6: Verify

- [ ] **Step 1: Restart dev server (picks up new runtimeConfig)**

```bash
# kill existing, restart
npm run dev
```

- [ ] **Step 2: Test the flows**

1. Navigate to `/admin/affiliates` — should show empty table with "Invite Affiliate" button
2. Click "Invite Affiliate" — modal opens with form fields
3. Fill in: email, display name, affiliate ID, commission %, submit
4. Check Supabase dashboard → new user in Auth, new row in `affiliates` and `affiliate_commissions`
5. The affiliate receives an invite email
6. Edit an affiliate → modal pre-fills, save updates the data
7. Toggle active → status badge changes
8. Click a row → navigates to drill-down page

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: admin affiliate management complete"
```
