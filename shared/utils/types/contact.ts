import type * as z from 'zod'
import type { ContactSchema, ContactSubject } from '../schemas'

export type { ContactSubject }

export type ContactMessage = z.output<typeof ContactSchema>
export type ContactPayload = z.input<typeof ContactSchema>
