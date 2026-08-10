import { useCallback, useEffect, useRef, useState } from 'react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createTranslator } from '@/lib/i18n'
import { DEFAULT_GENAI_PROMPT, chat } from '@/services/ai'

interface GenAIPanelProps {
  onClose: () => void
}

export function GenAIPanel({ onClose }: GenAIPanelProps) {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const isMountedRef = useRef(false)
  const requestIdRef = useRef(0)
  const hasStartedInitialFetchRef = useRef(false)

  const generate = useCallback(async () => {
    if (isLoading) return

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    if (!isMountedRef.current) return

    setIsLoading(true)
    setHasError(false)

    try {
      const nextResponse = await chat(DEFAULT_GENAI_PROMPT)
      if (!isMountedRef.current || requestId !== requestIdRef.current) return
      setResponse(nextResponse)
    } catch (error) {
      if (!isMountedRef.current || requestId !== requestIdRef.current) return
      console.error(error)
      setResponse(null)
      setHasError(true)
    } finally {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        setIsLoading(false)
      }
    }
  }, [isLoading])

  useEffect(() => {
    isMountedRef.current = true
    if (!hasStartedInitialFetchRef.current) {
      hasStartedInitialFetchRef.current = true
      void generate()
    }
    return () => {
      isMountedRef.current = false
    }
  }, [generate])

  return (
    <Card
      role="dialog"
      aria-modal="false"
      aria-labelledby="viewer-genai-panel-title"
      className="absolute right-4 top-4 z-20 w-[min(30rem,calc(100vw-2rem))] bg-card/95 shadow-lg backdrop-blur"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle id="viewer-genai-panel-title" className="text-sm font-semibold">
          {t('viewer.genai.title')}
        </CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t('common.close')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div role="status" aria-live="polite">
          {isLoading ? <p>{t('viewer.genai.loading')}</p> : null}
          {response ? <p className="whitespace-pre-wrap">{response}</p> : null}
        </div>
        {hasError ? <p role="alert">{t('viewer.genai.error')}</p> : null}
        <Button type="button" variant="outline" size="sm" onClick={generate} disabled={isLoading}>
          {t('viewer.genai.regenerate')}
        </Button>
      </CardContent>
    </Card>
  )
}
