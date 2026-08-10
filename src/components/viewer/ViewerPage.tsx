import { DigestiveCanvas } from './DigestiveCanvas'
import { OrganInfoCard } from './OrganInfoCard'
import { ViewerAnnotation } from './ViewerAnnotation'
import { ViewerChatbot } from './ViewerChatbot'
import { ViewerGenAIDialog } from './ViewerGenAIDialog'
import { ViewerInfoDialog } from './ViewerInfoDialog'
import { ViewerMenu } from './ViewerMenu'
import { ViewerProvider } from './ViewerContext.tsx'
import { ViewerQuizDialog } from './ViewerQuizDialog'
import { ViewerSettings } from './ViewerSettings'
import { ViewerVideoDialog } from './ViewerVideoDialog'

export function ViewerPage() {
  return (
    <ViewerProvider>
      <section className="flex h-screen w-screen overflow-hidden">
        <ViewerMenu />
        <div className="relative h-full min-h-[24rem] flex-1 overflow-hidden">
          <DigestiveCanvas />
          <ViewerAnnotation />
          <OrganInfoCard />
          <ViewerInfoDialog />
          <ViewerQuizDialog />
          <ViewerChatbot />
          <ViewerGenAIDialog />
          <ViewerVideoDialog />
          <ViewerSettings />
        </div>
      </section>
    </ViewerProvider>
  )
}
