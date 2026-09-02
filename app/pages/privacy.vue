<script setup lang="ts">
import { CAFE_CONTACT_EMAIL } from '#shared/utils/constants'

const { locale } = useI18n()
const localePath = useLocalePath()

const OWNER_NAME_EN = 'Café Prana — Owner: Sarah Frankenreiter'
const OWNER_NAME_DE = 'Café Prana — Inhaberin: Sarah Frankenreiter'
const cookiesPath = computed(() => localePath('/cookies'))

const en = {
  title: 'Privacy Policy',
  intro: 'I take your privacy seriously. This page explains what personal data is processed on cafeprana.de, why, on what legal basis, and what rights you have under the GDPR.',
  updated: 'Last updated: 2 September 2026',
  contact: {
    heading: 'Data controller',
    lines: [OWNER_NAME_EN, 'Pasteurstraße 2', '10407 Berlin', 'Germany'],
    email: CAFE_CONTACT_EMAIL
  },
  sections: [
    {
      title: 'Hosting and server logs',
      paragraphs: [
        'This website is hosted by Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA). When you visit the site, the hosting provider automatically processes technical data such as your IP address, browser type, the pages requested and the time of the request, in order to deliver the site securely and reliably.',
        'Legal basis: Art. 6 (1)(f) GDPR (legitimate interest in a secure, functioning website). Vercel processes this data on my behalf under its data processing addendum, which forms part of its terms of service (Art. 28 GDPR); processing may involve transfer to servers outside the EU under appropriate safeguards (EU Standard Contractual Clauses).'
      ]
    },
    {
      title: 'Reservation and contact forms',
      paragraphs: [
        'When you send a reservation request or a contact message, I process the details you enter: your first and last name, email address, optionally your phone number, and — for reservations — party size, preferred date and time and any message; for contact messages, the chosen subject and your message. The time at which you gave your consent is recorded together with your request.',
        'This data is used solely to handle your request and to reply to you. Legal basis: Art. 6 (1)(b) GDPR (steps prior to a contract / answering your enquiry). Both forms are processed by two service providers acting on my behalf (Art. 28 GDPR). Each provider’s data processing addendum, including the EU Standard Contractual Clauses, forms part of its terms of service:',
        'Database — reservation requests are stored with Supabase Pte. Ltd. (65 Chulia Street #38-02/03, OCBC Centre, Singapore 049513). The database itself is hosted in a data centre in the EU and is only accessible to me.',
        'Email delivery — your request is delivered to my mailbox through Mailgun (Sinch Email / Mailgun Technologies, Inc., 112 E. Pecan Street #1135, San Antonio, TX 78205, USA), using its EU region (servers in the EU). If you use the contact form, Mailgun also sends you a short confirmation email at the address you entered. Where a transfer to the USA occurs, it is covered by the EU Standard Contractual Clauses contained in the addendum.',
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
        'The homepage embeds a map from Google Maps (Google Ireland Ltd., Gordon House, Barrow Street, Dublin 4, Ireland). The map loads together with the page, so your IP address and browser details are transmitted to Google as soon as you open the homepage, and Google may set cookies in your browser. This is used only to show where the café is. Google may transfer data to its parent company Google LLC in the USA; Google LLC is certified under the EU-US Data Privacy Framework.',
        'Legal basis: Art. 6 (1)(f) GDPR (legitimate interest in showing visitors how to find the café). If you prefer not to load the map, you can use the “Get Directions” button instead, which opens Google Maps only when you click it. Please see Google’s privacy policy for details of their processing.'
      ],
      link: { label: 'Google Privacy Policy', href: 'https://policies.google.com/privacy' }
    },
    {
      title: 'Fonts',
      paragraphs: [
        'The fonts used on this site are served from the website’s own hosting. No connection to Google Fonts or any other font provider is made when you visit the site.'
      ]
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
  updated: 'Zuletzt aktualisiert: 2. September 2026',
  contact: {
    heading: 'Verantwortliche Stelle',
    lines: [OWNER_NAME_DE, 'Pasteurstraße 2', '10407 Berlin', 'Deutschland'],
    email: CAFE_CONTACT_EMAIL
  },
  sections: [
    {
      title: 'Hosting und Server-Logs',
      paragraphs: [
        'Diese Website wird von Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA) gehostet. Beim Besuch der Seite verarbeitet der Hosting-Anbieter automatisch technische Daten wie deine IP-Adresse, den Browsertyp, die aufgerufenen Seiten und den Zeitpunkt des Zugriffs, um die Website sicher und zuverlässig auszuliefern.',
        'Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren, funktionsfähigen Website). Vercel verarbeitet diese Daten in meinem Auftrag auf Grundlage seines Auftragsverarbeitungszusatzes, der Bestandteil seiner Nutzungsbedingungen ist (Art. 28 DSGVO); die Verarbeitung kann eine Übermittlung an Server außerhalb der EU unter geeigneten Garantien (EU-Standardvertragsklauseln) umfassen.'
      ]
    },
    {
      title: 'Reservierungs- und Kontaktformular',
      paragraphs: [
        'Wenn du eine Reservierungsanfrage oder eine Kontaktnachricht sendest, verarbeite ich die von dir eingegebenen Angaben: Vor- und Nachname, E-Mail-Adresse, optional deine Telefonnummer sowie bei Reservierungen Personenzahl, Wunschdatum und -uhrzeit und deine Nachricht; bei Kontaktnachrichten das gewählte Thema und deine Nachricht. Der Zeitpunkt deiner Einwilligung wird zusammen mit der Anfrage gespeichert.',
        'Diese Daten werden ausschließlich zur Bearbeitung und Beantwortung deiner Anfrage verwendet. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen / Beantwortung deiner Anfrage). Beide Formulare werden von zwei Dienstleistern in meinem Auftrag verarbeitet (Art. 28 DSGVO). Der Auftragsverarbeitungszusatz des jeweiligen Anbieters, einschließlich der EU-Standardvertragsklauseln, ist Bestandteil seiner Nutzungsbedingungen:',
        'Datenbank — Reservierungsanfragen werden bei Supabase Pte. Ltd. (65 Chulia Street #38-02/03, OCBC Centre, Singapur 049513) gespeichert. Die Datenbank selbst wird in einem Rechenzentrum in der EU betrieben und ist nur für mich zugänglich.',
        'E-Mail-Zustellung — deine Anfrage wird mir über Mailgun (Sinch Email / Mailgun Technologies, Inc., 112 E. Pecan Street #1135, San Antonio, TX 78205, USA) per E-Mail zugestellt, und zwar über die EU-Region des Dienstes (Server in der EU). Beim Kontaktformular sendet Mailgun außerdem eine kurze Bestätigungs-E-Mail an die von dir angegebene Adresse. Soweit dabei eine Übermittlung in die USA stattfindet, ist sie durch die im Zusatz enthaltenen EU-Standardvertragsklauseln abgesichert.',
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
        'Auf der Startseite ist eine Karte von Google Maps (Google Ireland Ltd., Gordon House, Barrow Street, Dublin 4, Irland) eingebettet. Die Karte wird zusammen mit der Seite geladen; dabei werden deine IP-Adresse und Browserdaten an Google übermittelt, sobald du die Startseite öffnest, und Google kann Cookies in deinem Browser setzen. Das dient ausschließlich dazu, den Standort des Cafés anzuzeigen. Google kann Daten an die Muttergesellschaft Google LLC in die USA übermitteln; Google LLC ist nach dem EU-US Data Privacy Framework zertifiziert.',
        'Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse, Besucherinnen und Besuchern den Weg zum Café zu zeigen). Wenn du die Karte nicht laden möchtest, kannst du stattdessen die Schaltfläche „Anfahrt“ nutzen, die Google Maps erst beim Klick öffnet. Einzelheiten zur Verarbeitung findest du in der Datenschutzerklärung von Google.'
      ],
      link: { label: 'Datenschutzerklärung von Google', href: 'https://policies.google.com/privacy' }
    },
    {
      title: 'Schriftarten',
      paragraphs: [
        'Die auf dieser Website verwendeten Schriftarten werden vom eigenen Hosting ausgeliefert. Beim Besuch der Website wird keine Verbindung zu Google Fonts oder einem anderen Schriftanbieter aufgebaut.'
      ]
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
