interface EmojiEvent {
  id: string
  emoji: string
  timestamp: number
}

// In-memory store for emoji events
const emojiEvents: EmojiEvent[] = []

// Set of connected SSE clients (EventSource connections)
type SSEClient = {
  send: (data: string) => void
  close: () => void
}

const sseClients = new Set<SSEClient>()

// Maximum age for emoji events (5 minutes in milliseconds)
const MAX_AGE_MS = 5 * 60 * 1000

/**
 * Subscribe a new SSE client to receive emoji events
 */
export function subscribeSSEClient(client: SSEClient): void {
  sseClients.add(client)
  console.log(`SSE client connected. Total clients: ${sseClients.size}`)
  // Broadcast updated client count
  broadcastClientCount()
}

/**
 * Unsubscribe an SSE client
 */
export function unsubscribeSSEClient(client: SSEClient): void {
  sseClients.delete(client)
  console.log(`SSE client disconnected. Total clients: ${sseClients.size}`)
  // Broadcast updated client count
  broadcastClientCount()
}

/**
 * Get the current number of connected clients
 */
export function getConnectedClientCount(): number {
  return sseClients.size
}

/**
 * Broadcast the current client count to all connected clients
 */
function broadcastClientCount(): void {
  const count = sseClients.size
  const message = `data: ${JSON.stringify({ type: 'client_count', count })}\n\n`
  
  sseClients.forEach(client => {
    try {
      client.send(message)
    } catch (error) {
      console.error('Error sending client count to SSE client:', error)
      sseClients.delete(client)
    }
  })
}

/**
 * Broadcast an emoji event to all connected SSE clients
 */
function broadcastEvent(event: EmojiEvent): void {
  const message = `data: ${JSON.stringify(event)}\n\n`
  
  // Send to all connected clients
  sseClients.forEach(client => {
    try {
      client.send(message)
    } catch (error) {
      // If sending fails, remove the client
      console.error('Error sending to SSE client:', error)
      sseClients.delete(client)
    }
  })
}

/**
 * Add a new emoji event to the store and broadcast it to all connected clients
 */
export function addEmojiEvent(emoji: string): EmojiEvent {
  const event: EmojiEvent = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    emoji,
    timestamp: Date.now()
  }
  
  emojiEvents.push(event)
  
  // Broadcast to all connected SSE clients
  broadcastEvent(event)
  
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

