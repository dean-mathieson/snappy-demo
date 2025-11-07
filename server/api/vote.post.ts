import { voteForEmoji, getCurrentVotingSession } from '../utils/emojiStore'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Validate input
  if (!body.emoji || typeof body.emoji !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Emoji is required and must be a string'
    })
  }

  if (!body.clientId || typeof body.clientId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Client ID is required and must be a string'
    })
  }

  // Get current voting session
  const session = getCurrentVotingSession()
  if (!session) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No active voting session'
    })
  }

  // Vote for emoji
  const result = voteForEmoji(body.emoji, body.clientId)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.message
    })
  }

  // Return updated voting session
  const updatedSession = getCurrentVotingSession()
  
  return {
    success: true,
    message: result.message,
    session: updatedSession ? {
      type: updatedSession.type,
      candidates: updatedSession.candidates,
      votes: Object.fromEntries(updatedSession.votes),
      startTime: updatedSession.startTime,
      endTime: updatedSession.endTime,
      timeRemaining: Math.max(0, updatedSession.endTime - Date.now())
    } : null
  }
})

