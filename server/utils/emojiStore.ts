interface EmojiEvent {
  id: string
  emoji: string
  timestamp: number
}

// In-memory store for emoji events
const emojiEvents: EmojiEvent[] = []

// Maximum age for emoji events (5 minutes in milliseconds)
const MAX_AGE_MS = 5 * 60 * 1000

/**
 * Add a new emoji event to the store
 */
export function addEmojiEvent(emoji: string): EmojiEvent {
  const event: EmojiEvent = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    emoji,
    timestamp: Date.now()
  }
  
  emojiEvents.push(event)
  
  // Clean up old events periodically
  cleanupOldEvents()
  
  return event
}

/**
 * Get all emoji events since a given timestamp
 */
export function getEmojiEventsSince(since?: number): EmojiEvent[] {
  if (!since) {
    // Return all events from the last 30 seconds if no timestamp provided
    const cutoff = Date.now() - 30000
    return emojiEvents.filter(event => event.timestamp >= cutoff)
  }
  
  return emojiEvents.filter(event => event.timestamp >= since)
}

/**
 * Get all recent emoji events
 */
export function getRecentEmojiEvents(limit: number = 100): EmojiEvent[] {
  cleanupOldEvents()
  return emojiEvents.slice(-limit)
}

/**
 * Clean up events older than MAX_AGE_MS
 */
function cleanupOldEvents(): void {
  const cutoff = Date.now() - MAX_AGE_MS
  const initialLength = emojiEvents.length
  
  // Remove old events
  while (emojiEvents.length > 0 && emojiEvents[0].timestamp < cutoff) {
    emojiEvents.shift()
  }
  
  // Only log if we actually removed something (to avoid spam)
  if (emojiEvents.length < initialLength) {
    console.log(`Cleaned up ${initialLength - emojiEvents.length} old emoji events`)
  }
}

