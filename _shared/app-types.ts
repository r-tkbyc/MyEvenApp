export interface AppModule {
  name: string
  initialStatus?: string
  createActions: (updateStatus: (text: string) => void) => Promise<{
    connect: () => Promise<void>
    action: () => void
  }>
}
