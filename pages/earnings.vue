<template>
  <div class="space-y-6">
    <!-- Page content (date picker is in TopBar) -->

    <!-- Summary KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardKpiCard label="Total Revenue" :value="totals.revenue" format="currency" />
      <DashboardKpiCard label="Total Commission" :value="totals.commission" format="currency" />
      <DashboardKpiCard label="Bookings" :value="totals.bookings" />
      <DashboardKpiCard
        label="Commission Rate"
        :value="commissionRate"
        format="percent"
      />
    </div>

    <!-- Monthly summary -->
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <h3 class="text-sm font-medium text-gray-500 mb-4">Monthly Summary</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b border-gray-100">
              <th class="pb-2 font-medium">Month</th>
              <th class="pb-2 font-medium text-right">Bookings</th>
              <th class="pb-2 font-medium text-right">Revenue</th>
              <th class="pb-2 font-medium text-right">Commission</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in monthlySummary" :key="row.month" class="border-b border-gray-50">
              <td class="py-2 text-gray-900 font-medium">{{ formatMonth(row.month) }}</td>
              <td class="py-2 text-right text-gray-600">{{ row.bookings }}</td>
              <td class="py-2 text-right text-gray-600">{{ formatCurrency(row.revenue) }}</td>
              <td class="py-2 text-right text-green-600 font-medium">{{ formatCurrency(row.commission) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Individual bookings -->
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <h3 class="text-sm font-medium text-gray-500 mb-4">Bookings ({{ bookings.length }})</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b border-gray-100">
              <th class="pb-2 font-medium">Date</th>
              <th class="pb-2 font-medium">Tour</th>
              <th class="pb-2 font-medium text-right">Price</th>
              <th class="pb-2 font-medium text-right">Commission</th>
              <th class="pb-2 font-medium">Campaign</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in bookings" :key="b.id" class="border-b border-gray-50">
              <td class="py-2 text-gray-600">{{ b.start_date_time?.slice(0, 10) }}</td>
              <td class="py-2 text-gray-900 max-w-[250px] truncate">{{ b.product_title }}</td>
              <td class="py-2 text-right text-gray-600">{{ formatCurrency(b.total_price) }}</td>
              <td class="py-2 text-right text-green-600 font-medium">
                {{ formatCurrency(b.affiliate_commission || 0) }}
              </td>
              <td class="py-2 text-gray-500">{{ b.first_campaign || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityBooking } from '~/types'

const { range } = useDateRange()
const { affiliate, commissionRate } = useAffiliate()
const { fetchBookings, summarizeByMonth } = useEarnings()

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
