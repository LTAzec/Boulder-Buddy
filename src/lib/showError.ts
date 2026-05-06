export function showError(err: unknown) {
  console.error(err)

  let message = 'Unknown error'

  if (typeof err === 'string') {
    message = err
  } else if (err instanceof Error) {
    message = err.message
  } else if (typeof err === 'object' && err !== null) {
    try {
      message = JSON.stringify(err, null, 2)
    } catch {
      message = 'Unexpected error object'
    }
  }

  window.alert(message)
}
