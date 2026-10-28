// A failed send carries the provider's own detail (or names a missing Mailgun
// setting), which belongs in the server log, not in front of a visitor. The
// response says only that sending failed, so the forms show their own copy.
export const emailFailure = (statusMessage: string, error: unknown) => {
  console.error(statusMessage, error)

  return createError({
    statusCode: 500,
    statusMessage
  })
}
