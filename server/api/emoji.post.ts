import { addEmojiEvent } from '../utils/emojiStore'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Validate emoji input
  if (!body.emoji || typeof body.emoji !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Emoji is required and must be a string'
    })
  }
  
  // Basic emoji validation - check if it's a single emoji character
  // This is a simple check; emojis can be complex (multi-byte, modifiers, etc.)
  const emoji = body.emoji.trim()
  
  if (emoji.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Emoji cannot be empty'
    })
  }
  
  // Add to store
  const emojiEvent = addEmojiEvent(emoji)
  
  return {
    success: true,
    event: emojiEvent
  }
})

