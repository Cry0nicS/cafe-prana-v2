import { type EventHandler, createApp, toWebHandler } from 'h3'

type JsonResponse = {
  status: number
  body: any
}

// Runs an event handler through a real h3 app so `readBody`, `createError` and
// the status codes behave exactly like they do in Nitro.
export const postJson = async (handler: EventHandler, body: unknown): Promise<JsonResponse> => {
  const app = createApp()

  app.use('/', handler)

  const response = await toWebHandler(app)(new Request('http://test.local/', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  }))

  const text = await response.text()

  return {
    status: response.status,
    body: text ? JSON.parse(text) : undefined
  }
}
