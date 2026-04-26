<script setup lang="ts">
useSeoMeta({
  title: 'Cookie Policy',
  description: 'Learn how Cafe Prana uses necessary local storage and privacy-friendly Vercel Web Analytics.'
})
</script>

<template>
  <UPage>
    <UPageHero
      title="Cookie Policy"
      description="How this website uses necessary local storage and anonymous analytics."
      headline="Privacy notice"
      :links="[{
        label: 'Contact us',
        to: 'mailto:info@cafeprana.de',
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
            title="Summary"
            icon="i-lucide-shield-check"
            variant="subtle"
            :ui="{ root: 'rounded-lg' }"
          >
            <div class="space-y-4 text-sm leading-7 text-muted">
              <p>
                Cafe Prana keeps tracking intentionally small. This website uses Vercel Web Analytics to understand anonymous, aggregated website usage such as visited pages, referrers, browser type, device type, and approximate region.
              </p>
              <p>
                Vercel states that Web Analytics does not use cookies and does not collect or store information that identifies or re-identifies individual visitors. We use it as a privacy-friendly, GDPR-conscious analytics setup.
              </p>
              <p>
                This page is provided for transparency and is not formal legal advice.
              </p>
            </div>
          </UPageCard>

          <UPageCard
            title="Necessary local storage"
            icon="i-lucide-lock"
            variant="naked"
            :ui="{ root: 'rounded-lg border border-default bg-default p-6' }"
          >
            <div class="space-y-4 text-sm leading-7 text-muted">
              <p>
                The site uses browser localStorage only to remember that you acknowledged the cookie and analytics notice, so the notice does not keep appearing on every visit.
              </p>
              <div class="overflow-hidden rounded-lg border border-default">
                <table class="w-full text-left text-sm">
                  <thead class="bg-muted/50 text-highlighted">
                    <tr>
                      <th class="p-3 font-medium">
                        Name
                      </th>
                      <th class="p-3 font-medium">
                        Purpose
                      </th>
                      <th class="p-3 font-medium">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-default">
                    <tr>
                      <td class="p-3 align-top font-medium text-highlighted">
                        cafe-prana-cookie-notice-v1
                      </td>
                      <td class="p-3 align-top">
                        Stores that the cookie and analytics notice has been acknowledged.
                      </td>
                      <td class="p-3 align-top">
                        Browser localStorage
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </UPageCard>

          <UPageCard
            title="Anonymous analytics"
            icon="i-lucide-chart-no-axes-column"
            variant="naked"
            :ui="{ root: 'rounded-lg border border-default bg-default p-6' }"
          >
            <div class="space-y-4 text-sm leading-7 text-muted">
              <p>
                Vercel Web Analytics helps Cafe Prana understand whether the website is useful and working well. It records aggregated statistics for page views and basic technical context.
              </p>
              <p>
                According to Vercel, visitors are identified by a request-based hash instead of cookies, and that hash resets automatically. Analytics data is used for aggregated statistics, not individual visitor profiles.
              </p>
              <p>
                The analytics integration is limited to Vercel Web Analytics. No advertising pixels, profiling tools, or cross-site tracking cookies are added here.
              </p>
            </div>
          </UPageCard>

          <UPageCard
            title="Show the notice again"
            icon="i-lucide-refresh-cw"
            variant="naked"
            :ui="{ root: 'rounded-lg border border-default bg-default p-6' }"
          >
            <div class="space-y-4 text-sm leading-7 text-muted">
              <p>
                You can reset the saved acknowledgement on this page. Resetting it does not disable analytics; it only makes the notice appear again so you can review the information.
              </p>
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
