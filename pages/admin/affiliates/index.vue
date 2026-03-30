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
