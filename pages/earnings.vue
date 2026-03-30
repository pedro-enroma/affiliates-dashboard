<template>
  <div class="space-y-8">
    <!-- Summary KPIs -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardKpiCard label="Total Revenue" :value="totals.revenue" format="currency" />
      <DashboardKpiCard label="Total Commission" :value="totals.commission" format="currency" highlight />
      <DashboardKpiCard label="Bookings" :value="totals.bookings" />
      <DashboardKpiCard label="Commission Rate" :value="commissionRate" format="percent" />
    </section>

    <!-- Monthly summary -->
    <section class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] overflow-hidden">
      <div class="p-8 border-b border-outline-variant/10">
        <h3 class="text-lg font-bold text-on-surface font-headline">Monthly Summary</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low/50">
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Month</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Bookings</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Revenue</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Commission</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/5">
            <tr
              v-for="(row, i) in monthlySummary"
              :key="row.month"
              :class="['hover:bg-primary-container/5 transition-colors', i % 2 === 1 ? 'bg-surface-container-low/30' : '']"
            >
              <td class="px-8 py-5 text-sm font-semibold text-on-surface">{{ formatMonth(row.month) }}</td>
              <td class="px-8 py-5 text-sm text-right">{{ row.bookings }}</td>
              <td class="px-8 py-5 text-sm text-right">{{ formatCurrency(row.revenue) }}</td>
              <td class="px-8 py-5 text-sm text-right font-bold text-primary">{{ formatCurrency(row.commission) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Individual bookings -->
    <section class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] overflow-hidden">
      <div class="p-8 border-b border-outline-variant/10">
        <h3 class="text-lg font-bold text-on-surface font-headline">Bookings ({{ bookings.length }})</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low/50">
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Travel Date</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Booking Date</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tour</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Price</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Commission</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Campaign</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/5">
            <tr
              v-for="(b, i) in bookings"
              :key="b.id"
              :class="['hover:bg-primary-container/5 transition-colors', i % 2 === 1 ? 'bg-surface-container-low/30' : '']"
            >
              <td class="px-8 py-5 text-sm">{{ formatDate(b.start_date_time) }}</td>
              <td class="px-8 py-5 text-sm text-on-surface-variant">{{ formatDate(b.created_at) }}</td>
              <td class="px-8 py-5 text-sm font-semibold text-on-surface max-w-[250px] truncate">{{ b.product_title }}</td>
              <td class="px-8 py-5 text-sm text-right">{{ formatCurrency(b.total_price) }}</td>
              <td class="px-8 py-5 text-sm text-right font-bold text-primary">{{ formatCurrency(b.affiliate_commission || 0) }}</td>
              <td class="px-8 py-5 text-sm text-on-surface-variant">{{ b.first_campaign || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ActivityBooking } from '~/types'

const { range } = useDateRange()
const { affiliate, commissionRate } = useAffiliate()
const { fetchBookings, summarizeByMonth } = useEarnings()
const { formatDate } = useFormatDate()

const bookings = ref<ActivityBooking[]>([])
const monthlySummary = computed(() => summarizeByMonth(bookings.value))

const totals = computed(() => {
  const revenue = bookings.value.reduce((sum, b) => sum + b.total_price, 0)
  const commission = bookings.value.reduce((sum, b) => sum + (b.affiliate_commission || 0), 0)
  return { revenue, commission, bookings: bookings.value.length }
})

function formatCurrency(val: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val)
}

function formatMonth(ym: string) {
  const [y, m] = ym.split('-')
  const date = new Date(parseInt(y), parseInt(m) - 1)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

async function loadData() {
  const aid = affiliate.value?.affiliate_id
  if (!aid) return
  bookings.value = await fetchBookings(range.value, aid)
}

watch([range, () => affiliate.value?.affiliate_id], loadData, { immediate: true })
</script>
