
// Simple in-memory store for DEV / pruebas (se borra al reiniciar el servidor)
type Visit = {
  id: string
  createdAt: string
  patient?: { firstName?: string; lastName?: string; email?: string }
  bodyRegion?: string
  intake?: any
  consent?: { email: string; signaturePng: string; text: string; timestamp: string }
  ddxJSON?: { ddx: { label:string; prob:number; why?:string }[] }
  assessment?: any
  report?: { summaryMD: string; patientBrief: string; planPhases: any; createdAt: string }
}

type Store = { visits: Record<string, Visit> }

declare global {
  // eslint-disable-next-line no-var
  var __PODIUM_STORE__: Store | undefined;
}

export function getStore(): Store {
  if (!global.__PODIUM_STORE__) {
    global.__PODIUM_STORE__ = { visits: {} }
  }
  return global.__PODIUM_STORE__!
}

export function getOrCreateVisit(id:string): Visit {
  const store = getStore()
  if(!store.visits[id]){
    store.visits[id] = { id, createdAt: new Date().toISOString() }
  }
  return store.visits[id]
}
