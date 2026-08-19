import { useLocation } from 'react-router-dom'
import { ViewerV2Canvas } from './ViewerV2Canvas'
import { ViewerV2Overlay } from './ui/ViewerV2Overlay'
import { ViewerV2Provider } from './ViewerV2Provider'

interface ViewerRouteState {
  openSettings?: boolean
}

export function ViewerV2Page() {
  const location = useLocation()
  const routeState = location.state as ViewerRouteState | null
  const initialActiveSheet = routeState?.openSettings ? 'settings' : null

  return (
    <ViewerV2Provider initialActiveSheet={initialActiveSheet}>
      <section className="flex h-screen w-screen overflow-hidden">
        <div className="relative h-full min-h-[24rem] flex-1 overflow-hidden">
          <ViewerV2Canvas />
          <ViewerV2Overlay />
        </div>
      </section>
    </ViewerV2Provider>
  )
}
