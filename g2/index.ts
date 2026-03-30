import { createActions } from './main'
import type { AppModule } from '../_shared/app-types'

export const app: AppModule = {
  id: 'eventimer',
  name: 'EvenTimer',
  pageTitle: 'EvenTimer',
  autoConnect: true,
  initialStatus: 'Timer ready',
  createActions: createActions,
}

export default app
