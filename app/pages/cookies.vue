<script setup lang="ts">
import { CAFE_CONTACT_MAILTO } from '#shared/utils/constants'

const { t } = useI18n()

useCafeSeo({
  title: () => t('cookies.seoTitle'),
  description: () => t('cookies.seoDescription'),
  noindex: true
})
</script>

<template>
  <UPage>
    <UPageHero
      :title="t('cookies.title')"
      :description="t('cookies.description')"
      :headline="t('cookies.headline')"
      :links="[{
        label: t('cookies.contact'),
        to: CAFE_CONTACT_MAILTO,
        icon: 'i-lucide-mail',
        color: 'neutral',
        variant: 'outline'
      }]"
      :ui="{
        title: 'mx-0! text-left',
        description: 'mx-0! text-left',
        links: 'justify-start'
      }"
    />

    <UPageSection
      :ui="{
        container: 'pt-0!'
      }"
    >
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div class="space-y-6">
          <UPageCard
            :title="t('cookies.summaryTitle')"
            icon="i-lucide-shield-check"
            variant="subtle"
            :ui="{ root: 'rounded-lg' }"
          >
            <div class="space-y-4 text-sm leading-7 text-muted">
              <p>{{ t('cookies.summaryP1') }}</p>
              <p>{{ t('cookies.summaryP2') }}</p>
              <p>{{ t('cookies.summaryP3') }}</p>
            </div>
          </UPageCard>

          <UPageCard
            :title="t('cookies.storageTitle')"
            icon="i-lucide-lock"
            variant="naked"
            :ui="{ root: 'rounded-lg border border-default bg-default p-6' }"
          >
            <div class="space-y-4 text-sm leading-7 text-muted">
              <p>{{ t('cookies.storageP1') }}</p>
              <div class="overflow-hidden rounded-lg border border-default">
                <table class="w-full text-left text-sm">
                  <thead class="bg-muted/50 text-highlighted">
                    <tr>
                      <th class="p-3 font-medium">
                        {{ t('cookies.tableName') }}
                      </th>
                      <th class="p-3 font-medium">
                        {{ t('cookies.tablePurpose') }}
                      </th>
                      <th class="p-3 font-medium">
                        {{ t('cookies.tableType') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-default">
                    <tr>
                      <td class="p-3 align-top font-medium text-highlighted">
                        cafe-prana-cookie-notice-v1
                      </td>
                      <td class="p-3 align-top">
                        {{ t('cookies.storagePurpose') }}
                      </td>
                      <td class="p-3 align-top">
                        {{ t('cookies.storageType') }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </UPageCard>

          <UPageCard
            :title="t('cookies.analyticsTitle')"
            icon="i-lucide-chart-no-axes-column"
            variant="naked"
            :ui="{ root: 'rounded-lg border border-default bg-default p-6' }"
          >
            <div class="space-y-4 text-sm leading-7 text-muted">
              <p>{{ t('cookies.analyticsP1') }}</p>
              <p>{{ t('cookies.analyticsP2') }}</p>
              <p>{{ t('cookies.analyticsP3') }}</p>
            </div>
          </UPageCard>

          <UPageCard
            :title="t('cookies.resetTitle')"
            icon="i-lucide-refresh-cw"
            variant="naked"
            :ui="{ root: 'rounded-lg border border-default bg-default p-6' }"
          >
            <div class="space-y-4 text-sm leading-7 text-muted">
              <p>{{ t('cookies.resetP1') }}</p>
            </div>
          </UPageCard>
        </div>

        <aside class="lg:sticky lg:top-24">
          <CookiePreferencePanel />
        </aside>
      </div>
    </UPageSection>
  </UPage>
</template>
