export function appendEventLog(message: string): void {
  const ts = new Date().toISOString().substring(11, 23)
  console.log(`[${ts}] ${message}`)
}
