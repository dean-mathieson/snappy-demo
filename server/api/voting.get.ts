import { getCurrentVotingSession, getActiveEmojis } from '../utils/emojiStore'

export default defineEventHandler(async (event) => {
  const session = getCurrentVotingSession()
  
  return {
    session: session ? {
      type: session.type,
      candidates: session.candidates,
      votes: Object.fromEntries(session.votes),
      startTime: session.startTime,
      endTime: session.endTime,
      timeRemaining: Math.max(0, session.endTime - Date.now())
    } : null,
    activeEmojis: getActiveEmojis()
  }
})

