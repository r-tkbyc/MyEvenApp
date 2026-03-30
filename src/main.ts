import type { AppModule } from '../_shared/app-types'

function updateStatus(text: string) {
  console.log(`[ui] ${text}`)
  const el = document.getElementById('status')
  if (el) el.textContent = text
}

async function boot() {
  const module = await import('../g2/index')
  const app: AppModule = module.app ?? module.default

  document.title = `${app.name} \u2013 Even G2`
  updateStatus(app.initialStatus ?? `${app.name} app ready`)

  const actions = await app.createActions(updateStatus)
  await actions.connect()
  
  // The 'action' function will be bound to Reset for the browser
  const btn = document.getElementById('btn-reset')
  if (btn) {
    btn.onclick = () => {
      actions.action()
    }
  }
}

void boot().catch((error) => {
  console.error('[app-loader] boot failed', error)
  updateStatus('App boot failed')
})
