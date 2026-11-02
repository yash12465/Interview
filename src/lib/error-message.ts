// Message to show for a caught value. Supabase throws both Error instances and plain
// `{ message }` objects (PostgrestError), so both are handled.
export function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const { message } = err
    if (typeof message === 'string' && message) return message
  }
  return fallback
}
