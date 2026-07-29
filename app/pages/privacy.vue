<script setup lang="ts">
import { CAFE_CONTACT_EMAIL } from '#shared/utils/constants'

const { locale } = useI18n()
const localePath = useLocalePath()

const OWNER_NAME_EN = 'Café Prana — Owner: [add full legal name]'
const OWNER_NAME_DE = 'Café Prana — Inhaberin: [Vor- und Nachname eintragen]'
const cookiesPath = computed(() => localePath('/cookies'))

const en = {
  title: 'Privacy Policy',
  intro: 'I take your privacy seriously. This page explains what personal data is processed on cafeprana.de, why, on what legal basis, and what rights you have under the GDPR.',
  updated: 'Last updated: 29 July 2026',
  contact: {
    heading: 'Data controller',
    lines: [OWNER_NAME_EN, 'Pasteurstraße 2', '10407 Berlin', 'Germany'],
    email: CAFE_CONTACT_EMAIL
  },
  sections: [
    {
      title: 'Hosting and server logs',
      paragraphs: [
        'This website is hosted by Vercel Inc. When you visit the site, the hosting provider automatically processes technical data such as your IP address, browser type, the pages requested and the time of the request, in order to deliver the site securely and reliably.',
        'Legal basis: Art. 6 (1)(f) GDPR (legitimate interest in a secure, functioning website). A data processing agreement is in place with the provider; processing may involve transfer to servers outside the EU under appropriate safeguards (EU Standard Contractual Clauses).'
      ]
    },
    {
      title: 'Reservation and contact forms',
      paragraphs: [
        'When you send a reservation request or a contact message, I process the details you enter — for example your name, email address, phone number, party size, preferred date and time, and your message.',
        'This data is used solely to handle your request and to reply to you. It is stored in a database (Supabase) and delivered to me by email (Mailgun, EU region). Legal basis: Art. 6 (1)(b) GDPR (steps prior to a contract / to answer your enquiry) and Art. 6 (1)(f) GDPR.',
        'The data is kept only as long as needed to handle your request and to meet any legal retention obligations, then deleted.'
      ]
    },
    {
      title: 'Web analytics',
      paragraphs: [
        'I use Vercel Web Analytics to understand, in aggregate, how the site is used. It is privacy-friendly: it does not set cookies, does not build visitor profiles, and does not track you across other websites. No data that identifies you personally is collected.',
        'Legal basis: Art. 6 (1)(f) GDPR (legitimate interest in understanding and improving the site).'
      ]
    },
    {
      title: 'Cookies and local storage',
      paragraphs: [
        'The site does not use advertising or tracking cookies. It only stores your cookie-notice choice in your browser so the notice is not shown again. This storage is essential and requires no consent.'
      ],
      link: { label: 'Cookie policy', href: cookiesPath.value }
    },
    {
      title: 'Map',
      paragraphs: [
        'The location map is embedded from Google Maps (Google Ireland Ltd.). When the map loads, your IP address is transmitted to Google. This is used only to display where the café is. Please see Google’s privacy policy for details of their processing.'
      ],
      link: { label: 'Google Privacy Policy', href: 'https://policies.google.com/privacy' }
    },
    {
      title: 'External links and social media',
      paragraphs: [
        'The site links to external services such as Instagram and Google. Once you follow such a link, the respective provider’s privacy policy applies; I have no control over their processing.'
      ]
    },
    {
      title: 'Your rights',
      paragraphs: [
        'Under the GDPR you have the right to access, rectification, erasure, restriction of processing, data portability, and objection, and the right to withdraw consent at any time.',
        `To exercise any of these rights, contact me at ${CAFE_CONTACT_EMAIL}.`
      ]
    },
    {
      title: 'Right to lodge a complaint',
      paragraphs: [
        'You have the right to lodge a complaint with a data protection supervisory authority. The authority responsible for Berlin is the Berlin Commissioner for Data Protection and Freedom of Information (Berliner Beauftragte für Datenschutz und Informationsfreiheit).'
      ],
      link: { label: 'datenschutz-berlin.de', href: 'https://www.datenschutz-berlin.de' }
    },
    {
      title: 'Data security',
      paragraphs: [
        'The site is served exclusively over encrypted HTTPS connections. I take reasonable technical and organisational measures to protect personal data against loss, misuse and unauthorised access.'
      ]
    },
    {
      title: 'Changes to this policy',
      paragraphs: [
        'I may update this privacy policy when the website or legal requirements change. The current version always applies and is dated above.'
      ]
    }
  ]
}

const de = {
  title: 'Datenschutzerklärung',
  intro: 'Dein Datenschutz ist mir wichtig. Hier erfährst du, welche personenbezogenen Daten auf cafeprana.de verarbeitet werden, warum, auf welcher Rechtsgrundlage und welche Rechte du nach der DSGVO hast.',
  updated: 'Zuletzt aktualisiert: 29. Juli 2026',
  contact: {
    heading: 'Verantwortliche Stelle',
    lines: [OWNER_NAME_DE, 'Pasteurstraße 2', '10407 Berlin', 'Deutschland'],
    email: CAFE_CONTACT_EMAIL
  },
  sections: [
    {
      title: 'Hosting und Server-Logs',
      paragraphs: [
        'Diese Website wird von Vercel Inc. gehostet. Beim Besuch der Seite verarbeitet der Hosting-Anbieter automatisch technische Daten wie deine IP-Adresse, den Browsertyp, die aufgerufenen Seiten und den Zeitpunkt des Zugriffs, um die Website sicher und zuverlässig auszuliefern.',
        'Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren, funktionsfähigen Website). Mit dem Anbieter besteht ein Auftragsverarbeitungsvertrag; die Verarbeitung kann eine Übermittlung an Server außerhalb der EU unter geeigneten Garantien (EU-Standardvertragsklauseln) umfassen.'
      ]
    },
    {
      title: 'Reservierungs- und Kontaktformular',
      paragraphs: [
        'Wenn du eine Reservierungsanfrage oder eine Kontaktnachricht sendest, verarbeite ich die von dir eingegebenen Angaben — zum Beispiel Name, E-Mail-Adresse, Telefonnummer, Personenzahl, Wunschdatum und -uhrzeit sowie deine Nachricht.',
        'Diese Daten werden ausschließlich zur Bearbeitung und Beantwortung deiner Anfrage verwendet. Sie werden in einer Datenbank (Supabase) gespeichert und mir per E-Mail (Mailgun, EU-Region) zugestellt. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen / Beantwortung deiner Anfrage) und Art. 6 Abs. 1 lit. f DSGVO.',
        'Die Daten werden nur so lange gespeichert, wie es zur Bearbeitung deiner Anfrage und zur Erfüllung gesetzlicher Aufbewahrungspflichten erforderlich ist, und anschließend gelöscht.'
      ]
    },
    {
      title: 'Reichweitenmessung',
      paragraphs: [
        'Ich nutze Vercel Web Analytics, um in aggregierter Form zu verstehen, wie die Website genutzt wird. Das Verfahren ist datenschutzfreundlich: Es setzt keine Cookies, erstellt keine Besucherprofile und verfolgt dich nicht über andere Websites hinweg. Es werden keine Daten erhoben, die dich persönlich identifizieren.',
        'Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Analyse und Verbesserung der Website).'
      ]
    },
    {
      title: 'Cookies und lokale Speicherung',
      paragraphs: [
        'Die Website verwendet keine Werbe- oder Tracking-Cookies. Es wird lediglich deine Auswahl zum Cookie-Hinweis in deinem Browser gespeichert, damit der Hinweis nicht erneut erscheint. Diese Speicherung ist technisch notwendig und einwilligungsfrei.'
      ],
      link: { label: 'Cookie-Richtlinie', href: cookiesPath.value }
    },
    {
      title: 'Karte',
      paragraphs: [
        'Die Standortkarte wird von Google Maps (Google Ireland Ltd.) eingebettet. Beim Laden der Karte wird deine IP-Adresse an Google übermittelt. Das dient ausschließlich dazu, den Standort des Cafés anzuzeigen. Einzelheiten zur Verarbeitung findest du in der Datenschutzerklärung von Google.'
      ],
      link: { label: 'Datenschutzerklärung von Google', href: 'https://policies.google.com/privacy' }
    },
    {
      title: 'Externe Links und soziale Medien',
      paragraphs: [
        'Die Website verlinkt auf externe Dienste wie Instagram und Google. Sobald du einem solchen Link folgst, gilt die Datenschutzerklärung des jeweiligen Anbieters; auf deren Verarbeitung habe ich keinen Einfluss.'
      ]
    },
    {
      title: 'Deine Rechte',
      paragraphs: [
        'Nach der DSGVO hast du das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht, eine erteilte Einwilligung jederzeit zu widerrufen.',
        `Zur Ausübung dieser Rechte wende dich bitte an ${CAFE_CONTACT_EMAIL}.`
      ]
    },
    {
      title: 'Beschwerderecht',
      paragraphs: [
        'Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Für Berlin zuständig ist die Berliner Beauftragte für Datenschutz und Informationsfreiheit.'
      ],
      link: { label: 'datenschutz-berlin.de', href: 'https://www.datenschutz-berlin.de' }
    },
    {
      title: 'Datensicherheit',
      paragraphs: [
        'Die Website wird ausschließlich über verschlüsselte HTTPS-Verbindungen ausgeliefert. Ich treffe angemessene technische und organisatorische Maßnahmen, um personenbezogene Daten vor Verlust, Missbrauch und unbefugtem Zugriff zu schützen.'
      ]
    },
    {
      title: 'Änderungen dieser Erklärung',
      paragraphs: [
        'Ich kann diese Datenschutzerklärung anpassen, wenn sich die Website oder die rechtlichen Anforderungen ändern. Es gilt jeweils die aktuelle, oben datierte Fassung.'
      ]
    }
  ]
}

const doc = computed(() => (locale.value === 'de' ? de : en))

useCafeSeo({
  title: () => doc.value.title,
  description: () => doc.value.intro,
  noindex: true
})
</script>

<template>
  <LegalDocument
    :title="doc.title"
    :intro="doc.intro"
    :updated="doc.updated"
    :contact="doc.contact"
    :sections="doc.sections"
  />
</template>
