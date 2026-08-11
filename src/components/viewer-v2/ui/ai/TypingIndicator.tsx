export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2" aria-label="AI is thinking" role="status">
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
    </div>
  )
}
