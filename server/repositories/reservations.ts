import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '#shared/utils/types'

type ReservationInsert = Database['public']['Tables']['reservations']['Insert']
type ReservationRow = Database['public']['Tables']['reservations']['Row']

export const insertReservation = async (
  client: SupabaseClient<Database>,
  reservation: ReservationInsert
): Promise<ReservationRow> => {
  const { data, error } = await client
    .from('reservations')
    .insert(reservation)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return data
}
