import { getEmojiEventsSince } from '../utils/emojiStore'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const since = query.since ? Number(query.since) : undefined
  
  // Validate since parameter if provided
  if (since !== undefined && (isNaN(since) || since < 0)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid since parameter. Must be a valid timestamp.'
    })
  }
  
  // Get emoji events
  const events = getEmojiEventsSince(since)
  
  return {
    events,
    count: events.length,
    timestamp: Date.now()
  }
})

