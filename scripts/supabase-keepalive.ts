// Decides whether the keep-alive's secrets look right and what Supabase's
// answer means. Split out of `ping-supabase.ts` so both are unit-testable: this
// module owns the verdicts and their wording, the script owns the request and
// the reporting.
//
// The wording names the secret to fix, because the person reading a failed run
// can see the secret names in GitHub but never their values. No message ever
// includes the key itself.
import { supabaseKeyKind } from '../shared/utils/supabase-key'

export type KeepAliveConfig = {
  url: string
  key: string
}

export type KeepAliveResponse = {
  // 0 when no HTTP answer came back at all.
  status: number
  error?: string
}

export type KeepAliveVerdict = {
  ok: boolean
  message: string
}

const checkUrl = (url: string) => {
  if (!url) {
    return 'SUPABASE_URL is empty. Set it to the project URL, e.g. https://<project-ref>.supabase.co.'
  }

  let parsed: URL

  try {
    parsed = new URL(url)
  } catch {
    return 'SUPABASE_URL is not a URL. Set it to the project URL, e.g. https://<project-ref>.supabase.co.'
  }

  if (parsed.protocol !== 'https:') {
    return 'SUPABASE_URL must start with https://.'
  }

  // The dashboard lists the REST endpoint (`.../rest/v1`) next to the project
  // URL, and pasting that one doubles the path on every request.
  if (parsed.pathname !== '/' || parsed.search || parsed.hash) {
    return 'SUPABASE_URL must be the bare project URL with no path, e.g. https://<project-ref>.supabase.co, not the REST endpoint.'
  }

  return null
}

const checkKey = (key: string) => {
  if (!key) {
    return 'SUPABASE_SERVICE_ROLE_KEY is empty.'
  }

  switch (supabaseKeyKind(key)) {
    case 'public':
      return 'SUPABASE_SERVICE_ROLE_KEY holds the anon or publishable key. Use the service_role (or sb_secret_...) key from the project\'s API settings.'
    case 'malformed':
      return 'SUPABASE_SERVICE_ROLE_KEY is not a complete key; it was probably cut short while copying. Paste the whole service_role key again.'
    default:
      return null
  }
}

// Every problem at once, so one failed run is enough to fix both secrets.
export const checkKeepAliveConfig = ({ url, key }: KeepAliveConfig): string[] => {
  return [checkUrl(url), checkKey(key)].filter((problem): problem is string => problem !== null)
}

export const describeKeepAliveResponse = ({ status, error }: KeepAliveResponse): KeepAliveVerdict => {
  if (status === 0) {
    return {
      ok: false,
      message: `Could not reach Supabase (${error ?? 'no response'}). Check that SUPABASE_URL is this project's URL.`
    }
  }

  if (status >= 200 && status < 300) {
    return { ok: true, message: `Supabase answered ${status}; the project counts as active.` }
  }

  if (status === 401 || status === 403) {
    return {
      ok: false,
      message: `Supabase refused the key (${status}). Check that SUPABASE_SERVICE_ROLE_KEY is the service_role key of the project SUPABASE_URL points at.`
    }
  }

  // The reservations table exists in the right project, so a missing one means
  // the URL leads somewhere else.
  if (status === 404) {
    return {
      ok: false,
      message: 'Supabase has no reservations table at this address (404). Check that SUPABASE_URL is the right project.'
    }
  }

  if (status >= 500) {
    return {
      ok: false,
      message: `Supabase answered ${status}. If the project is paused, restore it in the Supabase dashboard; a keep-alive cannot wake it.`
    }
  }

  return { ok: false, message: `Supabase answered ${status}${error ? `: ${error}` : ''}.` }
}
