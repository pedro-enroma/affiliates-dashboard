<template>
  <section class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] overflow-hidden">
    <div class="p-8 border-b border-outline-variant/10">
      <h3 class="text-xl font-bold text-on-surface font-headline">Affiliates</h3>
    </div>

    <div v-if="sortedAffiliates.length" class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-surface-container-low/50">
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant cursor-pointer hover:text-primary transition-colors select-none"
              @click="toggleSort(col.key)"
            >
              <div class="flex items-center gap-1">
                {{ col.label }}
                <span v-if="sortKey === col.key" class="material-symbols-outlined text-xs">
                  {{ sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/5">
          <tr
            v-for="(row, i) in sortedAffiliates"
            :key="row.affiliate.affiliate_id"
            :class="[
              'hover:bg-primary-container/5 transition-colors cursor-pointer',
              i % 2 === 1 ? 'bg-surface-container-low/30' : '',
            ]"
            @click="navigateTo(`/admin/affiliates/${row.affiliate.affiliate_id}`)"
          >
            <td class="px-8 py-5 text-sm font-semibold text-on-surface">{{ row.affiliate.display_name }}</td>
            <td class="px-8 py-5 text-sm text-on-surface-variant font-mono">{{ row.affiliate.affiliate_id }}</td>
            <td class="px-8 py-5 text-sm">{{ row.sessions.toLocaleString() }}</td>
            <td class="px-8 py-5 text-sm">{{ row.bookings.toLocaleString() }}</td>
            <td class="px-8 py-5 text-sm font-bold text-on-surface">{{ formatCurrency(row.revenue) }}</td>
            <td class="px-8 py-5">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                  row.affiliate.is_active
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700',
                ]"
              >
                {{ row.affiliate.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-12 text-zinc-400 text-sm">
      No affiliates found
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AffiliateRow } from '~/types'

const props = defineProps<{ affiliates: AffiliateRow[] }>()

const columns = [
  { key: 'name', label: 'Affiliate Name' },
  { key: 'id', label: 'Affiliate ID' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'revenue', label: 'Revenue (EUR)' },
  { key: 'status', label: 'Status' },
]

const sortKey = ref<string>('revenue')
const sortDir = ref<'asc' | 'desc'>('desc')

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
}

const sortedAffiliates = computed(() => {
  const rows = [...props.affiliates]
  const dir = sortDir.value === 'asc' ? 1 : -1

  return rows.sort((a, b) => {
    switch (sortKey.value) {
      case 'name':
        return dir * a.affiliate.display_name.localeCompare(b.affiliate.display_name)
      case 'id':
        return dir * a.affiliate.affiliate_id.localeCompare(b.affiliate.affiliate_id)
      case 'sessions':
        return dir * (a.sessions - b.sessions)
      case 'bookings':
        return dir * (a.bookings - b.bookings)
      case 'revenue':
        return dir * (a.revenue - b.revenue)
      case 'status':
        return dir * (Number(a.affiliate.is_active) - Number(b.affiliate.is_active))
      default:
        return 0
    }
  })
})

function formatCurrency(val: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val)
}
</script>
