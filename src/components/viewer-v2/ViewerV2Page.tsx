import { ViewerV2Canvas } from './ViewerV2Canvas'
import { ViewerV2Overlay } from './ui/ViewerV2Overlay'
import { ViewerV2Provider } from './ViewerV2Provider'

export function ViewerV2Page() {
  return (
    <ViewerV2Provider>
      <section className="flex h-screen w-screen overflow-hidden">
        <div className="relative h-full min-h-[24rem] flex-1 overflow-hidden">
          <ViewerV2Canvas />
          <ViewerV2Overlay />
        </div>
      </section>
    </ViewerV2Provider>
  )
}
