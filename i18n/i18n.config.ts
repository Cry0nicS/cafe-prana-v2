export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      nav: {
        home: 'Home',
        menu: 'Menu',
        events: 'Events',
        reservations: 'Reservations',
        contact: 'Contact'
      },
      language: {
        label: 'Language',
        switch: 'Switch language'
      },
      footer: {
        description: 'A gluten-free and vegan haven in the heart of Berlin',
        cookiePolicy: 'Cookie policy'
      },
      menu: {
        itemCount: '{count} item | {count} items',
        ingredients: 'Ingredients'
      },
      event: {
        upcoming: 'Upcoming',
        past: 'Past',
        pastEvent: 'Past event',
        date: 'Date',
        time: 'Time',
        price: 'Price',
        format: 'Format',
        cafeGatherings: 'Cafe gatherings',
        noBookingNeeded: 'No booking needed',
        reservationRequired: 'Reservation required',
        reservationRecommended: 'Reservation recommended',
        viewDetails: 'View details',
        viewEvent: 'View event',
        backToEvents: 'Events',
        about: 'About this event',
        concept: 'Concept',
        forWho: 'Who this is for',
        expectations: 'What to expect',
        tags: 'Event tags',
        more: 'More events',
        moreDescription: 'Browse other gatherings from Cafe Prana.',
        noTime: 'Time to be announced',
        categories: {
          breakfast: 'Breakfast',
          brunch: 'Brunch',
          dinner: 'Dinner',
          workshop: 'Workshop',
          community: 'Community',
          seasonal: 'Seasonal',
          event: 'Event'
        },
        tagLabels: {
          'vegan': 'Vegan',
          'gluten-free': 'Gluten-free',
          'organic': 'Organic',
          'seasonal': 'Seasonal',
          'community': 'Community',
          'limited-seats': 'Limited seats',
          'reservation-required': 'Reservation required',
          'special-guests': 'Special guests',
          'workshop': 'Workshop'
        }
      },
      reservations: {
        seoTitle: 'Reservations | Cafe Prana',
        seoDescription: 'Plan your visit to Cafe Prana in Berlin and request a table for a special moment, relaxed gathering, or quiet date.',
        headline: 'Reservations',
        title: 'Plan Your Visit to Cafe Prana',
        description: 'Whether you are planning a special moment, a relaxed gathering, or a quiet date, reserving your table helps me prepare a comfortable setting just for you.',
        email: 'Email Cafe Prana',
        backHome: 'Back home',
        features: {
          request: {
            title: 'Request a Table',
            description: 'Choose date, time and party size to request a reservation. I try to accommodate all requests.'
          },
          confirmation: {
            title: 'Confirmation within 24 hours',
            description: 'Reservations are confirmed within 24 hours. Please allow up to a day for final confirmation.'
          },
          email: {
            title: 'Email Confirmation',
            description: 'You will receive an email to confirm the reservation with all details and any follow-up instructions.'
          },
          special: {
            title: 'Special Requests & Allergies',
            description: 'Use the message section to tell me about allergies, accessibility needs, or other special requests.'
          },
          changes: {
            title: 'Changes & Cancellation',
            description: 'Need to change or cancel? Please notify me as soon as possible so I can free the table for others.'
          }
        },
        form: {
          firstName: 'First name',
          lastName: 'Last name',
          email: 'Email',
          phone: 'Phone Number (with country code)',
          date: 'Reservation Date',
          time: 'Time',
          guests: 'Guests',
          message: 'Message (optional)',
          messagePlaceholder: 'Allergies, accessibility needs, or anything else I should know.',
          privacyPrefix: 'I have read and accept the',
          privacyLink: 'privacy and cookie policy',
          privacySuffix: 'It is agreed that the voluntarily provided data may be stored and used to contact you. Processing can be revoked at any time.',
          mondayUnavailable: 'Reservations are not available on Mondays. Please choose another date.',
          info: 'Reservations are requests first. Cafe Prana confirms availability by email, usually within 24 hours.',
          urgent: 'For urgent changes, please email info{\'@\'}cafeprana.de.',
          submit: 'Submit',
          validationTitle: 'Form error',
          successTitle: 'Reservation sent successfully',
          successDescription: 'I will get back to you as soon as I processed your request.',
          errorTitle: 'Error sending request',
          errorDescription: 'Please try again later.',
          modalTitle: 'Reservation request received',
          modalDescription: 'Thank you! I have received your reservation request.',
          modalBody: 'I will check availability and send a confirmation email within 24 hours. If you do not receive a confirmation, please check your spam folder or contact me.',
          modalClose: 'Okay',
          errors: {
            firstName: { required: 'First name is required.' },
            lastName: { required: 'Last name is required.' },
            email: {
              required: 'Email is required.',
              invalid: 'Please provide a valid email address.'
            },
            phone: { invalid: 'Please provide a valid phone number with country code.' },
            guests: {
              min: 'At least 1 guest is required.',
              max: 'Maximum 20 guests allowed.'
            },
            date: { invalid: 'Please choose a valid date today or later.' },
            time: { invalid: 'Please choose a valid time between 07:00 and 16:00.' },
            privacy: { required: 'Please confirm the privacy policy and consent to be contacted.' }
          }
        }
      },
      cookies: {
        seoTitle: 'Cookie Policy',
        seoDescription: 'Learn how Cafe Prana uses necessary local storage and privacy-friendly Vercel Web Analytics.',
        headline: 'Privacy notice',
        title: 'Cookie Policy',
        description: 'How this website uses necessary local storage and anonymous analytics.',
        contact: 'Contact us',
        summaryTitle: 'Summary',
        summaryP1: 'Cafe Prana keeps tracking intentionally small. This website uses Vercel Web Analytics to understand anonymous, aggregated website usage such as visited pages, referrers, browser type, device type, and approximate region.',
        summaryP2: 'Vercel states that Web Analytics does not use cookies and does not collect or store information that identifies or re-identifies individual visitors. We use it as a privacy-friendly, GDPR-conscious analytics setup.',
        summaryP3: 'This page is provided for transparency and is not formal legal advice.',
        storageTitle: 'Necessary local storage',
        storageP1: 'The site uses browser localStorage only to remember that you acknowledged the cookie and analytics notice, so the notice does not keep appearing on every visit.',
        tableName: 'Name',
        tablePurpose: 'Purpose',
        tableType: 'Type',
        storagePurpose: 'Stores that the cookie and analytics notice has been acknowledged.',
        storageType: 'Browser localStorage',
        analyticsTitle: 'Anonymous analytics',
        analyticsP1: 'Vercel Web Analytics helps Cafe Prana understand whether the website is useful and working well. It records aggregated statistics for page views and basic technical context.',
        analyticsP2: 'According to Vercel, visitors are identified by a request-based hash instead of cookies, and that hash resets automatically. Analytics data is used for aggregated statistics, not individual visitor profiles.',
        analyticsP3: 'The analytics integration is limited to Vercel Web Analytics. No advertising pixels, profiling tools, or cross-site tracking cookies are added here.',
        resetTitle: 'Show the notice again',
        resetP1: 'You can reset the saved acknowledgement on this page. Resetting it does not disable analytics; it only makes the notice appear again so you can review the information.',
        statusTitle: 'Cookie notice status',
        loading: 'Loading notice status...',
        acknowledged: 'Notice acknowledged',
        notAcknowledged: 'Notice not yet acknowledged',
        understand: 'I understand',
        showAgain: 'Show notice again',
        bannerTitle: 'Cookie notice',
        bannerDescription: 'We use Vercel Web Analytics for anonymous, aggregated visitor statistics. It does not use analytics cookies or identify individual visitors, supporting a GDPR-conscious setup.',
        readPolicy: 'Read the cookie policy',
        acknowledgeLabel: 'Acknowledge cookie and analytics notice'
      }
    },
    de: {
      nav: {
        home: 'Start',
        menu: 'Menü',
        events: 'Events',
        reservations: 'Reservieren',
        contact: 'Kontakt'
      },
      language: {
        label: 'Sprache',
        switch: 'Sprache wechseln'
      },
      footer: {
        description: 'Ein glutenfreies und veganes Café im Herzen von Berlin',
        cookiePolicy: 'Cookie-Richtlinie'
      },
      menu: {
        itemCount: '{count} Gericht | {count} Gerichte',
        ingredients: 'Zutaten'
      },
      event: {
        upcoming: 'Bevorstehend',
        past: 'Vergangen',
        pastEvent: 'Vergangenes Event',
        date: 'Datum',
        time: 'Uhrzeit',
        price: 'Preis',
        format: 'Format',
        cafeGatherings: 'Café-Treffen',
        noBookingNeeded: 'Keine Reservierung nötig',
        reservationRequired: 'Reservierung erforderlich',
        reservationRecommended: 'Reservierung empfohlen',
        viewDetails: 'Details ansehen',
        viewEvent: 'Event ansehen',
        backToEvents: 'Events',
        about: 'Über dieses Event',
        concept: 'Konzept',
        forWho: 'Für wen ist das Event?',
        expectations: 'Was dich erwartet',
        tags: 'Event-Tags',
        more: 'Weitere Events',
        moreDescription: 'Entdecke weitere Zusammenkünfte im Cafe Prana.',
        noTime: 'Uhrzeit wird noch bekannt gegeben',
        categories: {
          breakfast: 'Frühstück',
          brunch: 'Brunch',
          dinner: 'Dinner',
          workshop: 'Workshop',
          community: 'Community',
          seasonal: 'Saisonal',
          event: 'Event'
        },
        tagLabels: {
          'vegan': 'Vegan',
          'gluten-free': 'Glutenfrei',
          'organic': 'Bio',
          'seasonal': 'Saisonal',
          'community': 'Community',
          'limited-seats': 'Begrenzte Plätze',
          'reservation-required': 'Reservierung erforderlich',
          'special-guests': 'Besondere Gäste',
          'workshop': 'Workshop'
        }
      },
      reservations: {
        seoTitle: 'Reservierungen | Cafe Prana',
        seoDescription: 'Plane deinen Besuch im Cafe Prana in Berlin und frage einen Tisch für einen besonderen Moment, ein entspanntes Treffen oder ein ruhiges Date an.',
        headline: 'Reservierungen',
        title: 'Plane deinen Besuch im Cafe Prana',
        description: 'Ob besonderer Moment, entspanntes Treffen oder ruhiges Date: Mit einer Reservierungsanfrage kann ich einen passenden Platz für dich vorbereiten.',
        email: 'Cafe Prana kontaktieren',
        backHome: 'Zur Startseite',
        features: {
          request: {
            title: 'Tisch anfragen',
            description: 'Wähle Datum, Uhrzeit und Personenzahl aus. Ich versuche, alle Anfragen möglich zu machen.'
          },
          confirmation: {
            title: 'Bestätigung innerhalb von 24 Stunden',
            description: 'Reservierungen werden innerhalb von 24 Stunden bestätigt. Bitte plane bis zu einen Tag für die finale Bestätigung ein.'
          },
          email: {
            title: 'Bestätigung per E-Mail',
            description: 'Du erhältst eine E-Mail mit allen Details und möglichen Rückfragen zur Reservierung.'
          },
          special: {
            title: 'Wünsche & Allergien',
            description: 'Nutze das Nachrichtenfeld für Allergien, Barrierefreiheit oder andere besondere Wünsche.'
          },
          changes: {
            title: 'Änderungen & Stornierung',
            description: 'Wenn du ändern oder absagen musst, melde dich bitte so früh wie möglich.'
          }
        },
        form: {
          firstName: 'Vorname',
          lastName: 'Nachname',
          email: 'E-Mail',
          phone: 'Telefonnummer (mit Ländervorwahl)',
          date: 'Reservierungsdatum',
          time: 'Uhrzeit',
          guests: 'Gäste',
          message: 'Nachricht (optional)',
          messagePlaceholder: 'Allergien, Wünsche oder alles, was ich wissen sollte.',
          privacyPrefix: 'Ich habe die',
          privacyLink: 'Datenschutz- und Cookie-Richtlinie',
          privacySuffix: 'gelesen und akzeptiere sie. Die freiwillig angegebenen Daten dürfen gespeichert und zur Kontaktaufnahme genutzt werden. Die Verarbeitung kann jederzeit widerrufen werden.',
          mondayUnavailable: 'Montags sind keine Reservierungen möglich. Bitte wähle ein anderes Datum.',
          info: 'Reservierungen sind zunächst Anfragen. Cafe Prana bestätigt die Verfügbarkeit in der Regel innerhalb von 24 Stunden per E-Mail.',
          urgent: 'Für dringende Änderungen schreibe bitte an info{\'@\'}cafeprana.de.',
          submit: 'Absenden',
          validationTitle: 'Formularfehler',
          successTitle: 'Reservierungsanfrage gesendet',
          successDescription: 'Ich melde mich, sobald ich deine Anfrage bearbeitet habe.',
          errorTitle: 'Fehler beim Senden',
          errorDescription: 'Bitte versuche es später erneut.',
          modalTitle: 'Reservierungsanfrage erhalten',
          modalDescription: 'Danke! Ich habe deine Reservierungsanfrage erhalten.',
          modalBody: 'Ich prüfe die Verfügbarkeit und sende dir innerhalb von 24 Stunden eine Bestätigung per E-Mail. Falls du keine Bestätigung erhältst, prüfe bitte deinen Spam-Ordner oder kontaktiere mich.',
          modalClose: 'Okay',
          errors: {
            firstName: { required: 'Bitte gib deinen Vornamen ein.' },
            lastName: { required: 'Bitte gib deinen Nachnamen ein.' },
            email: {
              required: 'Bitte gib deine E-Mail-Adresse ein.',
              invalid: 'Bitte gib eine gültige E-Mail-Adresse ein.'
            },
            phone: { invalid: 'Bitte gib eine gültige Telefonnummer mit Ländervorwahl ein.' },
            guests: {
              min: 'Mindestens 1 Gast ist erforderlich.',
              max: 'Maximal 20 Gäste sind möglich.'
            },
            date: { invalid: 'Bitte wähle ein gültiges Datum ab heute.' },
            time: { invalid: 'Bitte wähle eine gültige Uhrzeit zwischen 07:00 und 16:00.' },
            privacy: { required: 'Bitte bestätige die Datenschutzrichtlinie und die Kontaktaufnahme.' }
          }
        }
      },
      cookies: {
        seoTitle: 'Cookie-Richtlinie',
        seoDescription: 'Erfahre, wie Cafe Prana notwendige lokale Speicherung und datenschutzfreundliche Vercel Web Analytics nutzt.',
        headline: 'Datenschutzhinweis',
        title: 'Cookie-Richtlinie',
        description: 'Wie diese Website notwendige lokale Speicherung und anonyme Analytics nutzt.',
        contact: 'Kontakt aufnehmen',
        summaryTitle: 'Kurzfassung',
        summaryP1: 'Cafe Prana hält Tracking bewusst klein. Diese Website nutzt Vercel Web Analytics, um anonyme, aggregierte Nutzungsdaten zu verstehen, zum Beispiel besuchte Seiten, Verweise, Browsertyp, Gerätetyp und ungefähre Region.',
        summaryP2: 'Vercel gibt an, dass Web Analytics keine Cookies verwendet und keine Informationen sammelt oder speichert, mit denen einzelne Besucher identifiziert oder re-identifiziert werden können. Wir nutzen es als datenschutzfreundliche, DSGVO-bewusste Analytics-Lösung.',
        summaryP3: 'Diese Seite dient der Transparenz und ist keine formelle Rechtsberatung.',
        storageTitle: 'Notwendige lokale Speicherung',
        storageP1: 'Die Website nutzt localStorage im Browser nur, um zu merken, dass du den Cookie- und Analytics-Hinweis bestätigt hast, damit der Hinweis nicht bei jedem Besuch erneut erscheint.',
        tableName: 'Name',
        tablePurpose: 'Zweck',
        tableType: 'Typ',
        storagePurpose: 'Speichert, dass der Cookie- und Analytics-Hinweis bestätigt wurde.',
        storageType: 'Browser localStorage',
        analyticsTitle: 'Anonyme Analytics',
        analyticsP1: 'Vercel Web Analytics hilft Cafe Prana zu verstehen, ob die Website nützlich ist und gut funktioniert. Erfasst werden aggregierte Statistiken zu Seitenaufrufen und grundlegender technischer Kontext.',
        analyticsP2: 'Laut Vercel werden Besucher über einen anfragebasierten Hash statt über Cookies erkannt; dieser Hash wird automatisch zurückgesetzt. Die Daten werden für aggregierte Statistiken genutzt, nicht für individuelle Besucherprofile.',
        analyticsP3: 'Die Analytics-Integration ist auf Vercel Web Analytics beschränkt. Es werden keine Werbepixel, Profiling-Tools oder seitenübergreifenden Tracking-Cookies eingebunden.',
        resetTitle: 'Hinweis erneut anzeigen',
        resetP1: 'Du kannst die gespeicherte Bestätigung auf dieser Seite zurücksetzen. Dadurch wird Analytics nicht deaktiviert; der Hinweis wird nur erneut angezeigt, damit du die Informationen noch einmal lesen kannst.',
        statusTitle: 'Status des Cookie-Hinweises',
        loading: 'Status wird geladen...',
        acknowledged: 'Hinweis bestätigt',
        notAcknowledged: 'Hinweis noch nicht bestätigt',
        understand: 'Verstanden',
        showAgain: 'Hinweis erneut anzeigen',
        bannerTitle: 'Cookie-Hinweis',
        bannerDescription: 'Wir nutzen Vercel Web Analytics für anonyme, aggregierte Besucherstatistiken. Es werden keine Analytics-Cookies gesetzt und einzelne Besucher werden nicht identifiziert; das unterstützt eine DSGVO-bewusste Lösung.',
        readPolicy: 'Cookie-Richtlinie lesen',
        acknowledgeLabel: 'Cookie- und Analytics-Hinweis bestätigen'
      }
    }
  }
}))
