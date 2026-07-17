import { useCallback, useEffect, useRef, useState } from 'react'

// Duration (ms) for transient success flags like "✓ Added". One value for the
// whole app so the UI feels consistent.
export const FLAG_DURATION = 1500

// A boolean that flips true when `trigger()` is called and resets after
// `duration` ms. Used for "added to cart" / "address saved" confirmations.
export function useTemporaryFlag(duration = FLAG_DURATION) {
  const [on, setOn] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const trigger = useCallback(() => {
    setOn(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOn(false), duration)
  }, [duration])

  return [on, trigger]
}
