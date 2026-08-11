import { useCallback, useEffect, useRef, useState } from 'react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { createTranslator } from '@/lib/i18n'
import { DEFAULT_GENAI_PROMPT, chat } from '@/services/ai'

import { TypingIndicator } from './TypingIndicator'

interface GenAIContentProps {
  refreshKey?: string | number
}

export function GenAIContent({ refreshKey }: GenAIContentProps = {}) {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const isMountedRef = useRef(false)
  const requestIdRef = useRef(0)
  const hasStartedInitialFetchRef = useRef(false)
  const previousRefreshKeyRef = useRef(refreshKey)

  const generate = useCallback(async () => {
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
  }, [])

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

  useEffect(() => {
    if (Object.is(previousRefreshKeyRef.current, refreshKey)) return

    previousRefreshKeyRef.current = refreshKey
    void generate()
  }, [generate, refreshKey])

  return (
    <div className="flex h-full flex-col gap-3 text-sm text-muted-foreground">
      <div data-testid="genai-response-scroll" className="min-h-0 flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-2">
            <p>{t('viewer.genai.loading')}</p>
            <TypingIndicator />
          </div>
        ) : null}
        {response ? <p className="whitespace-pre-wrap">{response}</p> : null}
      </div>

      {hasError ? (
        <Alert variant="destructive">
          <AlertDescription>{t('viewer.genai.error')}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="button" variant="outline" size="sm" onClick={() => void generate()} disabled={isLoading}>
        {t('viewer.genai.regenerate')}
      </Button>
    </div>
  )
}
