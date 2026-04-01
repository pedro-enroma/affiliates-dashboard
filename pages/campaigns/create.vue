<template>
  <div class="space-y-8">
    <div class="flex items-center gap-4">
      <NuxtLink to="/campaigns" class="text-zinc-400 hover:text-primary transition-colors">
        <span class="material-symbols-outlined">arrow_back</span>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-on-surface font-headline">{{ $t('campaigns_page.create_campaign') }}</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Left: Form -->
      <form @submit.prevent="handleCreate" class="lg:col-span-5 bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8 space-y-5 self-start">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">{{ $t('campaigns_page.campaign_name') }}</label>
          <input
            v-model="form.campaign_name"
            required
            class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
            :placeholder="$t('campaigns_page.campaign_name_placeholder')"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
            {{ $t('campaigns_page.source') }}
          </label>
          <input
            v-model="form.utm_source"
            required
            class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
            :placeholder="$t('campaigns_page.source_placeholder')"
          />
          <p class="text-xs text-zinc-400 mt-1">{{ $t('campaigns_page.source_help') }}</p>
        </div>

        <!-- Selected product display -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">{{ $t('campaigns_page.selected_product') }}</label>
          <div v-if="selectedProduct" class="p-3 bg-primary-container/10 border border-primary-container/30 rounded-xl text-sm text-on-surface font-semibold flex items-center justify-between">
            <span>{{ selectedProduct.name }}</span>
            <button type="button" class="text-zinc-400 hover:text-error" @click="form.destination_url = ''">
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <p v-else class="text-sm text-zinc-400 py-2">{{ $t('campaigns_page.select_product') }}</p>
        </div>

        <!-- UTM Preview -->
        <div class="p-4 bg-surface-container-low rounded-xl space-y-3">
          <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('campaigns_page.utm_parameters') }}</p>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <span class="text-on-surface-variant">affiliate_id</span>
            <span class="font-mono text-on-surface">{{ affiliate?.affiliate_id || '...' }}</span>
            <span class="text-on-surface-variant">utm_medium</span>
            <span class="font-mono text-on-surface">affiliate</span>
            <span class="text-on-surface-variant">utm_source</span>
            <span class="font-mono text-on-surface">{{ form.utm_source ? form.utm_source.toLowerCase().trim() : '...' }}</span>
            <span class="text-on-surface-variant">utm_campaign</span>
            <span class="font-mono text-on-surface">{{ utmCampaign || '...' }}</span>
          </div>
        </div>

        <!-- Generated Link Preview -->
        <div v-if="previewLink" class="p-4 bg-surface-container-low rounded-xl">
          <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{{ $t('campaigns_page.generated_link') }}</p>
          <code class="text-sm text-on-surface break-all font-mono">{{ previewLink }}</code>
        </div>

        <p v-if="error" class="text-sm text-error">{{ error }}</p>

        <div class="flex gap-3 pt-2">
          <NuxtLink
            to="/campaigns"
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-zinc-500 bg-surface-container-low hover:bg-surface-container-high transition-colors text-center"
          >
            {{ $t('campaigns_page.cancel') }}
          </NuxtLink>
          <button
            type="submit"
            :disabled="loading || !form.destination_url"
            class="flex-1 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {{ loading ? $t('campaigns_page.creating') : $t('campaigns_page.create_campaign') }}
          </button>
        </div>
      </form>

      <!-- Right: Product Grid -->
      <div class="lg:col-span-7">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <button
            v-for="p in products"
            :key="p.url"
            type="button"
            :class="[
              'p-5 rounded-xl text-left transition-all duration-200 border-2',
              form.destination_url === p.url
                ? 'bg-primary-container/10 border-primary-container shadow-md'
                : 'bg-surface-container-lowest border-transparent shadow-[0px_20px_40px_rgba(25,28,28,0.03)] hover:border-outline-variant/30 hover:shadow-md',
            ]"
            @click="form.destination_url = p.url"
          >
            <div class="flex items-start gap-3">
              <div
                :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                  form.destination_url === p.url ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-on-surface-variant',
                ]"
              >
                <span class="material-symbols-outlined text-lg">{{ getProductIcon(p.name) }}</span>
              </div>
              <div class="min-w-0">
                <p :class="['text-sm font-semibold leading-tight', form.destination_url === p.url ? 'text-primary' : 'text-on-surface']">
                  {{ p.name }}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { affiliate } = useAffiliate()
const { createCampaign, generateLink } = useCampaigns()

const products = [
  { name: 'Visita Guiada Museos Vaticanos y Capilla Sixtina', url: 'https://www.enroma.com/reserva/museos-vaticanos-sixtina-san-pedro/' },
  { name: 'Visita Guiada Coliseo, Foro Romano y Palatino', url: 'https://www.enroma.com/reserva/coliseo-foro-y-palatino/' },
  { name: 'Descuento de 5 € – Tour Vaticano y Coliseo en días distintos', url: 'https://www.enroma.com/reserva/oferta-vaticano-y-coliseo/' },
  { name: 'Visita Coliseo con Arena de Gladiadores, Foro y Palatino', url: 'https://www.enroma.com/reserva/tour-coliseo-con-arena-de-gladiadores/' },
  { name: 'Excursión a Pompeya y Nápoles desde Roma en tren de alta velocidad', url: 'https://www.enroma.com/reserva/excursion-pompeya-desde-roma/' },
  { name: 'Tour Exclusivo: Museos Vaticanos, Capilla Sixtina y Basílica de San Pedro', url: 'https://www.enroma.com/reserva/tour-exclusivo-por-el-vaticano/' },
  { name: 'Excursión a Florencia y Pisa con subida a la Torre Inclinada desde Roma', url: 'https://www.enroma.com/reserva/excursion-florencia-pisa-desde-roma/' },
  { name: 'Descuento de 10 € – Oferta Tour Coliseo con Arena y Museos Vaticanos', url: 'https://www.enroma.com/reserva/oferta-tour-coliseo-con-arena-y-museos-vaticanos/' },
  { name: 'Tour Museos Vaticanos en grupo reducido', url: 'https://www.enroma.com/reserva/tour-vaticano-en-grupo-reducido/' },
  { name: 'Tour Coliseo y Foro Romano adaptado a niños – Tour de grupo', url: 'https://www.enroma.com/reserva/tour-coliseo-para-ninos/' },
  { name: 'Tour por la Via Appia y las Catacumbas de Roma', url: 'https://www.enroma.com/reserva/basilicas-y-catacumbas/' },
  { name: 'Viaje al Centro del Mundo: Tour de grupo centro de Roma para niños', url: 'https://www.enroma.com/reserva/tour-centro-de-roma-para-ninos/' },
  { name: 'Oferta: Coliseo y Vaticano adaptado a niños – Descubre Roma en familia', url: 'https://www.enroma.com/reserva/coliseo-vaticano-adaptado-a-ninos/' },
  { name: 'Menú degustación en Osteria Oliva (cerca del Coliseo)', url: 'https://www.enroma.com/reserva/menu-degustacion-en-osteria-oliva-cerca-del-coliseo/' },
  { name: 'Excursión a Venecia desde Roma en tren de alta velocidad', url: 'https://www.enroma.com/reserva/excursion-a-venecia-desde-roma/' },
  { name: 'Tour Museos Vaticanos y Capilla Sixtina adaptado a niños: en grupo', url: 'https://www.enroma.com/reserva/tour-museos-vaticanos-y-capilla-sixtina-adaptado-a-ninos-en-grupo/' },
  { name: 'Excursión a la Toscana desde Roma con degustación de productos y vinos locales', url: 'https://www.enroma.com/reserva/excursion-de-la-toscana-desde-roma/' },
  { name: 'Tour Coliseo Subterráneo, Arena, Foro y Palatino en grupo súper reducido', url: 'https://www.enroma.com/reserva/visita-coliseo-subterraneo-foro-y-palatino/' },
]

const form = reactive({
  campaign_name: '',
  utm_source: '',
  destination_url: '',
})

const error = ref('')
const loading = ref(false)

const selectedProduct = computed(() => products.find((p) => p.url === form.destination_url))

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getProductIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('vaticano') || n.includes('museos') || n.includes('sixtina')) return 'church'
  if (n.includes('coliseo') || n.includes('foro') || n.includes('gladiador') || n.includes('subterráneo')) return 'account_balance'
  if (n.includes('pompeya') || n.includes('florencia') || n.includes('pisa') || n.includes('venecia') || n.includes('toscana')) return 'train'
  if (n.includes('niño') || n.includes('familia')) return 'family_restroom'
  if (n.includes('catacumba') || n.includes('appia')) return 'explore'
  if (n.includes('menú') || n.includes('osteria')) return 'restaurant'
  return 'tour'
}

const utmCampaign = computed(() => slugify(form.campaign_name))

const previewLink = computed(() => {
  if (!affiliate.value || !form.destination_url || !form.campaign_name || !form.utm_source) return ''
  try {
    return generateLink(
      affiliate.value.affiliate_id,
      form.utm_source.toLowerCase().trim(),
      utmCampaign.value,
      form.destination_url,
    )
  } catch {
    return ''
  }
})

async function handleCreate() {
  error.value = ''
  loading.value = true

  const campaignSlug = form.utm_source.toLowerCase().trim() + '_' + utmCampaign.value

  try {
    await createCampaign({
      campaign_slug: campaignSlug,
      campaign_name: form.campaign_name,
      destination_url: form.destination_url,
      campaign_type: 'link',
    })
    router.push('/campaigns')
  } catch (e: any) {
    error.value = e.message
  }
  loading.value = false
}
</script>
