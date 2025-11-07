interface EmojiEvent {
  id: string
  emoji: string
  timestamp: number
}

interface Vote {
  emoji: string
  type: 'add' | 'remove'
  timestamp: number
  clientId: string
}

// Expanded emoji bank
const EMOJI_BANK = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
  '🤧', '🥵', '🥶', '😶‍🌫️', '😵', '😵‍💫', '🤯', '🤠', '🥳', '😎',
  '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳',
  '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
  '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬',
  '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽',
  '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
  '😾', '🙈', '🙉', '🙊', '💋', '💌', '💘', '💝', '💖', '💗',
  '💓', '💞', '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚',
  '💙', '💜', '🖤', '🤍', '🤎', '💯', '💢', '💥', '💫', '💦',
  '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '🔥',
  '⭐', '🌟', '✨', '⚡', '☄️', '💥', '💫', '💢', '💯', '🎉',
  '🎊', '🎈', '🎁', '🎀', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀',
  '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒',
  '🏑', '🏏', '⛳', '🏹', '🎣', '🥊', '🥋', '🎽', '🏋️', '🤼',
  '🤸', '🤺', '🤾', '🤹', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗',
  '🚵', '🚴', '🏇', '🤹', '🎪', '🎭', '🩰', '🎨', '🎬', '🎤',
  '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲',
  '🎯', '🎳', '🎮', '🎰', '🧩', '🚗', '🚕', '🚙', '🚌', '🚎',
  '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲',
  '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠',
  '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆',
  '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🚁', '🚟',
  '🚀', '🛸', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '⛽', '🚧',
  '🚦', '🚥', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡',
  '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️',
  '🗻', '🏕️', '⛺', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢',
  '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒',
  '🏛️', '⛪', '🕌', '🕍', '🕋', '⛩️', '🛤️', '🛣️', '🗾', '🎑',
  '🏞️', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🏙️', '🌃',
  '🌌', '🌉', '🌁', '🌊', '🌋', '🌍', '🌎', '🌏', '🌐', '🗺️',
  '🗾', '🧭', '🏔️', '⛰️', '🌲', '🌳', '🌴', '🌵', '🌶️', '🌷',
  '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜',
  '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙',
  '🌎', '🌍', '🌏', '🪐', '💫', '⭐', '🌟', '✨', '⚡', '☄️',
  '💥', '🔥', '🌈', '☀️', '⛅', '☁️', '⛈️', '🌤️', '🌦️', '🌧️',
  '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦',
  '☔', '☂️', '🌊', '🌫️', '🍏', '🍎', '🍐', '🍊', '🍋', '🍌',
  '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝',
  '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🥔',
  '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥞',
  '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙',
  '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣',
  '🍱', '🍘', '🍙', '🍚', '🍙', '🍢', '🍡', '🍧', '🍨', '🍦',
  '🥧', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪',
  '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🥤', '🍶', '🍺',
  '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧃', '🧉', '🧊', '🥄',
  '🍴', '🍽️', '🥢', '🥣', '🥡', '🥧', '🔪', '🏺', '🌍', '🌎',
  '🌏', '🌐', '🗺️', '🧭', '🏔️', '⛰️', '🌋', '🗻', '🏕️', '⛺',
  '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤',
  '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌',
  '🕍', '🕋', '⛩️', '🛤️', '🛣️', '🗾', '🎑', '🏞️', '🌅', '🌄',
  '🌠', '🎇', '🎆', '🌇', '🌆', '🏙️', '🌃', '🌌', '🌉', '🌁'
]

// In-memory store for emoji events
const emojiEvents: EmojiEvent[] = []

// Active emoji list (the ones users can click)
let activeEmojis: string[] = EMOJI_BANK.slice(0, 20) // Start with first 20

// Current voting session
interface VotingSession {
  type: 'add' | 'remove'
  candidates: string[]
  votes: Map<string, number> // emoji -> vote count
  startTime: number
  endTime: number
  clientVotes: Map<string, string> // clientId -> emoji they voted for
}

let currentVotingSession: VotingSession | null = null
let pollingInterval: NodeJS.Timeout | null = null
let isAddingMode = true // Alternate between adding and removing

// Set of connected SSE clients (EventSource connections)
type SSEClient = {
  send: (data: string) => void
  close: () => void
}

const sseClients = new Set<SSEClient>()

// Maximum age for emoji events (5 minutes in milliseconds)
const MAX_AGE_MS = 5 * 60 * 1000

// Polling interval (1 minute)
const POLLING_INTERVAL_MS = 60 * 1000

/**
 * Initialize polling system
 */
export function initializePolling(): void {
  if (pollingInterval) {
    return // Already initialized
  }

  // Start first voting session
  startVotingSession()

  // Set up polling interval
  pollingInterval = setInterval(() => {
    endCurrentVotingSession()
    isAddingMode = !isAddingMode // Alternate
    startVotingSession()
  }, POLLING_INTERVAL_MS)

  console.log('Polling system initialized')
}

/**
 * Start a new voting session
 */
function startVotingSession(): void {
  const type = isAddingMode ? 'add' : 'remove'
  let candidates: string[] = []

  if (type === 'add') {
    // Get 3 random emojis from bank that are not in active list
    const availableEmojis = EMOJI_BANK.filter(emoji => !activeEmojis.includes(emoji))
    candidates = shuffleArray(availableEmojis).slice(0, 3)
  } else {
    // Get 3 random emojis from active list
    candidates = shuffleArray([...activeEmojis]).slice(0, 3)
  }

  // Ensure we have at least 3 candidates
  if (candidates.length < 3) {
    if (type === 'add') {
      // If not enough to add, switch to remove mode
      candidates = shuffleArray([...activeEmojis]).slice(0, Math.min(3, activeEmojis.length))
      isAddingMode = false
    } else {
      // If not enough to remove, switch to add mode
      const availableEmojis = EMOJI_BANK.filter(emoji => !activeEmojis.includes(emoji))
      candidates = shuffleArray(availableEmojis).slice(0, 3)
      isAddingMode = true
    }
  }

  currentVotingSession = {
    type: isAddingMode ? 'add' : 'remove',
    candidates,
    votes: new Map(),
    startTime: Date.now(),
    endTime: Date.now() + POLLING_INTERVAL_MS,
    clientVotes: new Map()
  }

  // Broadcast voting session start
  broadcastVotingSession()
  console.log(`Voting session started: ${type} mode with candidates:`, candidates)
}

/**
 * End current voting session and apply results
 */
function endCurrentVotingSession(): void {
  if (!currentVotingSession) {
    return
  }

  // Find winner (emoji with most votes)
  let winner: string | null = null
  let maxVotes = 0

  currentVotingSession.votes.forEach((votes, emoji) => {
    if (votes > maxVotes) {
      maxVotes = votes
      winner = emoji
    }
  })

  // Apply result
  if (winner) {
    if (currentVotingSession.type === 'add') {
      // Add winner to active list
      if (!activeEmojis.includes(winner)) {
        activeEmojis.push(winner)
        console.log(`Added emoji ${winner} to active list`)
      }
    } else {
      // Remove winner from active list
      const index = activeEmojis.indexOf(winner)
      if (index !== -1) {
        activeEmojis.splice(index, 1)
        console.log(`Removed emoji ${winner} from active list`)
      }
    }

    // Broadcast emoji list update
    broadcastEmojiListUpdate()
  }

  // Clear voting session
  currentVotingSession = null
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Vote for an emoji in the current voting session
 */
export function voteForEmoji(emoji: string, clientId: string): { success: boolean; message: string } {
  if (!currentVotingSession) {
    return { success: false, message: 'No active voting session' }
  }

  if (!currentVotingSession.candidates.includes(emoji)) {
    return { success: false, message: 'Emoji is not a candidate in this voting session' }
  }

  // Check if client already voted
  const previousVote = currentVotingSession.clientVotes.get(clientId)
  if (previousVote) {
    // Remove previous vote
    const previousCount = currentVotingSession.votes.get(previousVote) || 0
    currentVotingSession.votes.set(previousVote, Math.max(0, previousCount - 1))
  }

  // Add new vote
  currentVotingSession.clientVotes.set(clientId, emoji)
  const currentCount = currentVotingSession.votes.get(emoji) || 0
  currentVotingSession.votes.set(emoji, currentCount + 1)

  // Broadcast updated voting session
  broadcastVotingSession()

  return { success: true, message: 'Vote recorded' }
}

/**
 * Get current voting session
 */
export function getCurrentVotingSession(): VotingSession | null {
  return currentVotingSession
}

/**
 * Get active emoji list
 */
export function getActiveEmojis(): string[] {
  return [...activeEmojis]
}

/**
 * Broadcast voting session to all connected clients
 */
function broadcastVotingSession(): void {
  if (!currentVotingSession) {
    return
  }

  const message = `data: ${JSON.stringify({
    type: 'voting_session',
    session: {
      type: currentVotingSession.type,
      candidates: currentVotingSession.candidates,
      votes: Object.fromEntries(currentVotingSession.votes),
      startTime: currentVotingSession.startTime,
      endTime: currentVotingSession.endTime,
      timeRemaining: Math.max(0, currentVotingSession.endTime - Date.now())
    }
  })}\n\n`

  sseClients.forEach(client => {
    try {
      client.send(message)
    } catch (error) {
      console.error('Error sending voting session to SSE client:', error)
      sseClients.delete(client)
    }
  })
}

/**
 * Broadcast emoji list update to all connected clients
 */
function broadcastEmojiListUpdate(): void {
  const message = `data: ${JSON.stringify({
    type: 'emoji_list_update',
    activeEmojis: activeEmojis
  })}\n\n`

  sseClients.forEach(client => {
    try {
      client.send(message)
    } catch (error) {
      console.error('Error sending emoji list update to SSE client:', error)
      sseClients.delete(client)
    }
  })
}

/**
 * Subscribe a new SSE client to receive emoji events
 */
export function subscribeSSEClient(client: SSEClient): void {
  sseClients.add(client)
  console.log(`SSE client connected. Total clients: ${sseClients.size}`)
  // Broadcast updated client count
  broadcastClientCount()
  
  // Send current voting session if exists
  if (currentVotingSession) {
    const message = `data: ${JSON.stringify({
      type: 'voting_session',
      session: {
        type: currentVotingSession.type,
        candidates: currentVotingSession.candidates,
        votes: Object.fromEntries(currentVotingSession.votes),
        startTime: currentVotingSession.startTime,
        endTime: currentVotingSession.endTime,
        timeRemaining: Math.max(0, currentVotingSession.endTime - Date.now())
      }
    })}\n\n`
    try {
      client.send(message)
    } catch (error) {
      console.error('Error sending voting session to new client:', error)
    }
  }

  // Send current active emoji list
  const emojiListMessage = `data: ${JSON.stringify({
    type: 'emoji_list_update',
    activeEmojis: activeEmojis
  })}\n\n`
  try {
    client.send(emojiListMessage)
  } catch (error) {
    console.error('Error sending emoji list to new client:', error)
  }
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

// Initialize polling on module load
initializePolling()
