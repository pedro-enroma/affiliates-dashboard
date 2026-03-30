<template>
  <section class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] overflow-hidden">
    <div class="p-8 border-b border-outline-variant/10">
      <h3 class="text-xl font-bold text-on-surface font-headline">Recent Bookings</h3>
    </div>

    <div v-if="bookings.length" class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-container-low/50">
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Booking ID</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Travel Date</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Booking Date</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tour Name</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Price (EUR)</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Campaign</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/5">
          <tr
            v-for="(b, i) in bookings.slice(0, 10)"
            :key="b.id"
            :class="[
              'hover:bg-primary-container/5 transition-colors',
              i % 2 === 1 ? 'bg-surface-container-low/30' : '',
            ]"
          >
            <td class="px-8 py-5 text-sm font-mono text-on-surface-variant">{{ b.booking_id }}</td>
            <td class="px-8 py-5 text-sm">{{ formatDate(b.start_date_time) }}</td>
            <td class="px-8 py-5 text-sm text-on-surface-variant">{{ formatDate(b.created_at) }}</td>
            <td class="px-8 py-5 text-sm font-semibold">{{ b.product_title }}</td>
            <td class="px-8 py-5 text-sm">{{ formatCurrency(b.total_price) }}</td>
            <td class="px-8 py-5 text-sm text-on-surface-variant">{{ b.first_campaign || '-' }}</td>
            <td class="px-8 py-5">
              <span :class="statusBadgeClass(b.status)">
                {{ normalizeStatus(b.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-12 text-zinc-400 text-sm">
      No bookings yet
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ActivityBooking } from '~/types'

defineProps<{ bookings: ActivityBooking[] }>()

function formatCurrency(val: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val)
}

const { formatDate } = useFormatDate()

function normalizeStatus(status: string): string {
  const s = status.toLowerCase()
  if (s === 'confirmed') return 'Confirmed'
  if (s === 'pending') return 'Pending'
  if (s === 'cancelled' || s === 'canceled') return 'Cancelled'
  return status
}

function statusBadgeClass(status: string): string {
  const base = 'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider'
  const s = status.toLowerCase()
  if (s === 'confirmed') return `${base} bg-emerald-100 text-emerald-700`
  if (s === 'pending') return `${base} bg-amber-100 text-amber-700`
  if (s === 'cancelled' || s === 'canceled') return `${base} bg-red-100 text-red-700`
  return `${base} bg-zinc-100 text-zinc-600`
}
</script>
