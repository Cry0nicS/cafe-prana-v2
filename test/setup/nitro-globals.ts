// Server code relies on Nitro auto-imports (`defineEventHandler`, `readBody`,
// `createError`, `useRuntimeConfig`). Those only exist inside a Nitro build, so
// expose the real h3 implementations plus a runtime-config stub as globals for
// the Node test project.
import { createError, defineEventHandler, getQuery, readBody, sendError, setResponseStatus } from 'h3'
import { testRuntimeConfig } from '../utils/runtime-config'

Object.assign(globalThis, {
  createError,
  defineEventHandler,
  getQuery,
  readBody,
  sendError,
  setResponseStatus,
  useRuntimeConfig: () => testRuntimeConfig
})
