export function serializeError(err: unknown) {
  if (err instanceof Error) { //niet elke error is een error object
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return { message: String(err) };
}