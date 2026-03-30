<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5">
    <h3 class="text-sm font-medium text-gray-500 mb-4">Recent Bookings</h3>
    <div v-if="bookings.length" class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b border-gray-100">
            <th class="pb-2 font-medium">Date</th>
            <th class="pb-2 font-medium">Tour</th>
            <th class="pb-2 font-medium text-right">Price</th>
            <th class="pb-2 font-medium">Campaign</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="b in bookings.slice(0, 10)"
            :key="b.id"
            class="border-b border-gray-50"
          >
            <td class="py-2 text-gray-600">{{ b.start_date_time?.slice(0, 10) }}</td>
            <td class="py-2 text-gray-900 max-w-[200px] truncate">{{ b.product_title }}</td>
            <td class="py-2 text-right text-gray-900 font-medium">
              {{ formatCurrency(b.total_price) }}
            </td>
            <td class="py-2 text-gray-500">{{ b.first_campaign || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center py-8 text-gray-400 text-sm">
      No bookings yet
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityBooking } from '~/types'

defineProps<{ bookings: ActivityBooking[] }>()

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(val)
}
</script>
