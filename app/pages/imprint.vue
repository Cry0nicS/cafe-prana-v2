<script setup lang="ts">
import { CAFE_CONTACT_EMAIL, CAFE_PHONE, CAFE_SITE_URL } from '#shared/utils/constants'

const { locale } = useI18n()

// German law requires the full name of the natural person operating a sole
// proprietorship in the imprint.
const OWNER_NAME = 'Café Prana — Inhaberin: Sarah Frankenreiter'
const OWNER_NAME_EN = 'Café Prana — Owner: Sarah Frankenreiter'

const en = {
  title: 'Imprint',
  intro: 'Legal information for cafeprana.de in accordance with § 5 DDG (Digital Services Act, Germany).',
  contact: {
    heading: 'Provider (§ 5 DDG)',
    lines: [OWNER_NAME_EN, 'Pasteurstraße 2', '10407 Berlin', 'Germany'],
    email: CAFE_CONTACT_EMAIL,
    phone: CAFE_PHONE,
    website: CAFE_SITE_URL
  },
  sections: [
    {
      title: 'Responsible for content (§ 18 (2) MStV)',
      paragraphs: ['Sarah Frankenreiter\nPasteurstraße 2\n10407 Berlin\nGermany']
    },
    {
      title: 'Supervisory authority',
      paragraphs: ['Ordnungsamt Pankow (Bezirksamt Pankow von Berlin)']
    },
    {
      title: 'VAT',
      paragraphs: ['As a small business under § 19 UStG, no value-added tax is charged and no VAT identification number is issued.']
    },
    {
      title: 'Liability for content',
      paragraphs: [
        'As a service provider I am responsible for my own content on these pages in accordance with § 7 (1) DDG and general laws. Under §§ 8 to 10 DDG, however, I am not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.',
        'Obligations to remove or block the use of information under general laws remain unaffected. Liability in this respect is only possible from the moment I become aware of a specific infringement. Upon becoming aware of such violations, I will remove the content immediately.'
      ]
    },
    {
      title: 'Liability for links',
      paragraphs: [
        'This website contains links to external websites of third parties over whose content I have no control. I therefore cannot accept any liability for this external content. The respective provider or operator of the linked pages is always responsible for their content.',
        'The linked pages were checked for possible legal violations at the time of linking; no illegal content was recognisable. Permanent monitoring of the linked pages is not reasonable without concrete evidence of an infringement. Upon becoming aware of any violations, I will remove such links immediately.'
      ]
    },
    {
      title: 'Copyright',
      paragraphs: [
        'The content and works created by the operator on these pages are subject to German copyright law. Duplication, processing, distribution and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.',
        'Downloads and copies of this site are only permitted for private, non-commercial use. Where content on this site was not created by the operator, the copyrights of third parties are respected and marked accordingly. If you become aware of a copyright infringement, please let me know and I will remove the content immediately.'
      ]
    },
    {
      title: 'Consumer dispute resolution',
      paragraphs: [
        'I am neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board (§ 36 VSBG).'
      ]
    }
  ]
}

const de = {
  title: 'Impressum',
  intro: 'Rechtliche Angaben zu cafeprana.de gemäß § 5 DDG (Digitale-Dienste-Gesetz).',
  contact: {
    heading: 'Diensteanbieter (§ 5 DDG)',
    lines: [OWNER_NAME, 'Pasteurstraße 2', '10407 Berlin', 'Deutschland'],
    email: CAFE_CONTACT_EMAIL,
    phone: CAFE_PHONE,
    website: CAFE_SITE_URL
  },
  sections: [
    {
      title: 'Inhaltlich verantwortlich (§ 18 Abs. 2 MStV)',
      paragraphs: ['Sarah Frankenreiter\nPasteurstraße 2\n10407 Berlin\nDeutschland']
    },
    {
      title: 'Aufsichtsbehörde',
      paragraphs: ['Ordnungsamt Pankow (Bezirksamt Pankow von Berlin)']
    },
    {
      title: 'Umsatzsteuer',
      paragraphs: ['Als Kleinunternehmerin im Sinne von § 19 UStG wird keine Umsatzsteuer erhoben und keine Umsatzsteuer-Identifikationsnummer ausgewiesen.']
    },
    {
      title: 'Haftung für Inhalte',
      paragraphs: [
        'Als Dienstanbieterin bin ich gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG bin ich jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.',
        'Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine Haftung ist jedoch erst ab dem Zeitpunkt möglich, ab dem ich von einer konkreten Rechtsverletzung Kenntnis erlange. Bei Bekanntwerden entsprechender Verstöße entferne ich diese Inhalte umgehend.'
      ]
    },
    {
      title: 'Haftung für Links',
      paragraphs: [
        'Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Deshalb kann ich für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.',
        'Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte waren nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen entferne ich derartige Links umgehend.'
      ]
    },
    {
      title: 'Urheberrecht',
      paragraphs: [
        'Die durch die Betreiberin erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung der jeweiligen Autorin bzw. Erstellerin.',
        'Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht von der Betreiberin erstellt wurden, werden die Urheberrechte Dritter beachtet und entsprechend gekennzeichnet. Solltest du dennoch auf eine Urheberrechtsverletzung aufmerksam werden, bitte ich um einen Hinweis; bei Bekanntwerden entferne ich solche Inhalte umgehend.'
      ]
    },
    {
      title: 'Verbraucherstreitbeilegung',
      paragraphs: [
        'Ich bin weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).'
      ]
    }
  ]
}

const doc = computed(() => (locale.value === 'de' ? de : en))

useCafeSeo({
  title: () => doc.value.title,
  description: () => (locale.value === 'de'
    ? 'Impressum und rechtliche Angaben zum Café Prana in Berlin.'
    : 'Imprint and legal information for Café Prana in Berlin.'),
  noindex: true
})
</script>

<template>
  <LegalDocument
    :title="doc.title"
    :intro="doc.intro"
    :contact="doc.contact"
    :sections="doc.sections"
  />
</template>
