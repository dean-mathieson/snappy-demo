<template>
  <div class="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 text-white">
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-2">🎉 Snappy Demo - Real-time Emoji Board</h1>
      <p class="text-xl opacity-90 mb-4">Click an emoji to see it appear instantly for everyone!</p>
      <div class="flex justify-center gap-8 mt-4 text-sm">
        <span class="flex items-center gap-2" :class="{ 'text-green-400': isConnected }">
          {{ isConnected ? `● Connected (${connectedUsers})` : '○ Connecting...' }}
        </span>
        <span class="opacity-80">{{ liveEmojis.length }} emojis shown</span>
      </div>
    </header>

    <main class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <section class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
        <h2 class="text-2xl mb-6 text-center">Click an Emoji</h2>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4">
          <button
            v-for="emoji in emojiList"
            :key="emoji"
            class="text-5xl bg-white/20 border-2 border-white/30 rounded-xl p-4 cursor-pointer transition-all duration-200 backdrop-blur-sm hover:bg-white/30 hover:border-white/50 hover:scale-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            @click="handleEmojiClick(emoji)"
            :disabled="isSubmitting"
          >
            {{ emoji }}
          </button>
        </div>
      </section>

      <section class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
        <h2 class="text-2xl mb-6 text-center">Live Emojis</h2>
        <div ref="liveEmojisContainer" class="max-h-[500px] overflow-y-auto p-4 bg-black/20 rounded-lg scrollbar-thin scrollbar-track-black/10 scrollbar-thumb-white/30 hover:scrollbar-thumb-white/50">
          <transition-group name="emoji-fade" tag="div" class="flex flex-wrap gap-3 min-h-[100px]">
            <span
              v-for="emojiEvent in liveEmojis"
              :key="emojiEvent.id"
              class="text-4xl inline-block animate-emoji-pop"
              :class="{ 'opacity-70 animate-emoji-pulse': emojiEvent.pending }"
            >
              {{ emojiEvent.emoji }}
            </span>
          </transition-group>
          <div v-if="liveEmojis.length === 0" class="text-center py-8 opacity-70 italic">
            No emojis yet. Click one above to get started!
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
// SEO Meta Information
useHead({
  title: 'Snappy Demo - Real-time Emoji Board',
  style: [
    {
      children: `
        html, body {
          background: linear-gradient(to bottom right, #667eea, #764ba2) !important;
          min-height: 100vh;
          margin: 0;
          padding: 0;
        }
        body > div#__nuxt {
          background: linear-gradient(to bottom right, #667eea, #764ba2);
          min-height: 100vh;
        }
        .min-h-screen {
          min-height: 100vh;
        }
        .bg-gradient-to-br {
          background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
        }
        .from-\\[\\#667eea\\] {
          --tw-gradient-from: #667eea var(--tw-gradient-from-position);
          --tw-gradient-to: rgb(102 126 234 / 0) var(--tw-gradient-to-position);
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
        }
        .to-\\[\\#764ba2\\] {
          --tw-gradient-to: #764ba2 var(--tw-gradient-to-position);
        }
      `
    }
  ],
  meta: [
    {
      name: 'description',
      content: 'Experience real-time emoji interactions! Click emojis and watch them appear instantly for everyone. A live collaborative emoji board demo powered by Snappy.'
    },
    {
      name: 'keywords',
      content: 'emoji board, real-time, collaborative, interactive demo, snappy, live updates, emoji sharing'
    },
    {
      name: 'author',
      content: 'Snappy'
    },
    {
      property: 'og:title',
      content: 'Snappy Demo - Real-time Emoji Board'
    },
    {
      property: 'og:description',
      content: 'Experience real-time emoji interactions! Click emojis and watch them appear instantly for everyone.'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:image',
      content: '/og-image.png' // You can add an actual OG image later
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image'
    },
    {
      name: 'twitter:title',
      content: 'Snappy Demo - Real-time Emoji Board'
    },
    {
      name: 'twitter:description',
      content: 'Experience real-time emoji interactions! Click emojis and watch them appear instantly for everyone.'
    },
    {
      name: 'theme-color',
      content: '#667eea'
    }
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://snappy-demo.vercel.app' // Update with your actual domain
    }
  ]
})

interface EmojiEvent {
  id: string
  emoji: string
  timestamp: number
  pending?: boolean
}

interface VotingSession {
  type: 'add' | 'remove'
  candidates: string[]
  votes: Record<string, number>
  startTime: number
  endTime: number
  timeRemaining: number
}

const emojiList = ref<string[]>([]) // Will be populated from polling
const liveEmojis = ref<EmojiEvent[]>([])
const isConnected = ref(false)
const isSubmitting = ref(false)
const isVoting = ref(false)
const connectedUsers = ref(0)
const eventSource = ref<any>(null) // EventSource is browser-only, use any to avoid SSR issues
const liveEmojisContainer = ref<HTMLElement | null>(null)
const votingSession = ref<VotingSession | null>(null)
const userVote = ref<string | null>(null)
const clientId = ref<string>('')

// Reconnection state
let reconnectTimeout: any = null
let isReconnecting = false

// Optimistic UI: Add emoji immediately when clicked
const handleEmojiClick = async (emoji: string) => {
  // Create optimistic event
  const optimisticEvent: EmojiEvent = {
    id: `pending-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    emoji,
    timestamp: Date.now(),
    pending: true
  }
  
  // Add to live emojis immediately (optimistic update)
  liveEmojis.value.push(optimisticEvent)
  
  // Scroll to show new emoji (client-side only)
  await nextTick()
  scrollToLatest()
  
  // Submit to server (non-blocking)
  isSubmitting.value = true
  try {
    const response = await $fetch<{ success: boolean; event: EmojiEvent }>('/api/emoji', {
      method: 'POST',
      body: { emoji }
    } as any)
    
    // Replace optimistic event with server event
    const index = liveEmojis.value.findIndex((e: EmojiEvent) => e.id === optimisticEvent.id)
    if (index !== -1) {
      // Replace with server event (has real ID, no pending flag)
      liveEmojis.value[index] = response.event
    }
  } catch (error) {
    console.error('Failed to submit emoji:', error)
    // Remove the optimistic emoji on error
    const index = liveEmojis.value.findIndex((e: EmojiEvent) => e.id === optimisticEvent.id)
    if (index !== -1) {
      liveEmojis.value.splice(index, 1)
    }
    // Could show an error message to the user here
  } finally {
    isSubmitting.value = false
  }
}

// Process a new emoji event from SSE
const processEmojiEvent = (event: EmojiEvent) => {
  // Check if we already have this event
  const existingIndex = liveEmojis.value.findIndex((e: EmojiEvent) => e.id === event.id)
  
  if (existingIndex !== -1) {
    // Event already exists, skip
    return
  }
  
  // Check if we have a pending event with the same emoji and similar timestamp
  const pendingIndex = liveEmojis.value.findIndex(
    (e: EmojiEvent) => e.pending && e.emoji === event.emoji && Math.abs(e.timestamp - event.timestamp) < 2000
  )
  
  if (pendingIndex !== -1) {
    // Replace pending event with server event
    liveEmojis.value[pendingIndex] = event
  } else {
    // Add as new event (from another user)
    liveEmojis.value.push(event)
  }
  
  // Limit the number of displayed emojis (keep last 200)
  if (liveEmojis.value.length > 200) {
    liveEmojis.value = liveEmojis.value.slice(-200)
  }
  
  // Scroll to show latest
  nextTick(() => {
    scrollToLatest()
  })
}

// Connect to SSE stream (client-side only)
const connectToSSE = () => {
  // Prevent multiple simultaneous reconnection attempts
  if (isReconnecting) {
    return
  }
  
  try {
    // Close existing connection if any
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
    }
    
    const es = new EventSource('/api/emojis/stream')
    eventSource.value = es
    
    es.onopen = () => {
      isConnected.value = true
      isReconnecting = false
      console.log('SSE connection opened')
    }
    
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        
        // Handle different message types
        if (data.type === 'connected') {
          console.log('SSE connected:', data.message)
          if (typeof data.count === 'number') {
            connectedUsers.value = data.count
          }
        } else if (data.type === 'client_count') {
          // Update connected user count
          if (typeof data.count === 'number') {
            connectedUsers.value = data.count
          }
        } else if (data.type === 'initial') {
          // Initial batch of events
          if (data.events && Array.isArray(data.events)) {
            data.events.forEach((event: EmojiEvent) => {
              processEmojiEvent(event)
            })
          }
        } else if (data.type === 'voting_session') {
          // Voting session update
          if (data.session) {
            const session = data.session as VotingSession
            votingSession.value = session
            // Reset user vote if session changed (new candidates)
            if (session.candidates.length > 0 && userVote.value && !session.candidates.includes(userVote.value)) {
              userVote.value = null
            }
          }
        } else if (data.type === 'emoji_list_update') {
          // Emoji list update from polling
          if (data.activeEmojis && Array.isArray(data.activeEmojis)) {
            emojiList.value = data.activeEmojis
          }
        } else if (data.id && data.emoji && data.timestamp) {
          // Single emoji event
          processEmojiEvent(data as EmojiEvent)
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }
    
    es.onerror = (error) => {
      // EventSource fires error events when connection closes
      // Check readyState to determine if we should reconnect
      // EventSource.CONNECTING = 0, EventSource.OPEN = 1, EventSource.CLOSED = 2
      const CLOSED = 2
      const CONNECTING = 0
      
      if (es.readyState === CLOSED) {
        isConnected.value = false
        console.log('SSE connection closed')
        
        // Only reconnect if we're not already reconnecting and connection is actually closed
        if (!isReconnecting && reconnectTimeout === null) {
          isReconnecting = true
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null
            console.log('Attempting to reconnect SSE...')
            connectToSSE()
          }, 3000)
        }
      } else if (es.readyState === CONNECTING) {
        // Connection is in progress, just update status
        isConnected.value = false
        console.log('SSE connecting...')
      }
    }
  } catch (error) {
    console.error('Failed to connect to SSE:', error)
    isConnected.value = false
    isReconnecting = false
    
    // Retry connection after error
    if (reconnectTimeout === null) {
      isReconnecting = true
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null
        connectToSSE()
      }, 3000)
    }
  }
}

// Scroll to latest emoji (client-side only)
const scrollToLatest = () => {
  if (liveEmojisContainer.value) {
    liveEmojisContainer.value.scrollTop = liveEmojisContainer.value.scrollHeight
  }
}

// Handle voting
const handleVote = async (emoji: string) => {
  if (!clientId.value || isVoting.value) {
    return
  }

  isVoting.value = true
  try {
    const response = await $fetch<{ success: boolean; session: VotingSession | null }>('/api/vote', {
      method: 'POST',
      body: {
        emoji,
        clientId: clientId.value
      }
    } as any)

    if (response.success && response.session) {
      votingSession.value = response.session
      userVote.value = emoji
    }
  } catch (error) {
    console.error('Failed to vote:', error)
  } finally {
    isVoting.value = false
  }
}

// Format time remaining
const formatTimeRemaining = (ms: number): string => {
  const seconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Calculate vote percentage for a candidate
const getVotePercentage = (candidate: string): number => {
  if (!votingSession.value) {
    return 0
  }

  const totalVotes = votingSession.value.candidates.reduce((sum: number, c: string) => {
    return sum + (votingSession.value?.votes[c] || 0)
  }, 0)

  if (totalVotes === 0) {
    return 0
  }

  const candidateVotes = votingSession.value.votes[candidate] || 0
  return Math.round((candidateVotes / totalVotes) * 100)
}

// Fetch initial voting session and emoji list
const fetchInitialData = async () => {
  try {
    const data = await $fetch<{ session: VotingSession | null; activeEmojis: string[] }>('/api/voting')
    if (data.session) {
      votingSession.value = data.session
    }
    if (data.activeEmojis && Array.isArray(data.activeEmojis)) {
      emojiList.value = data.activeEmojis
    }
  } catch (error) {
    console.error('Failed to fetch initial data:', error)
  }
}

// Timer to update time remaining
let timeRemainingInterval: any = null

// Update time remaining for voting session
const updateTimeRemaining = () => {
  if (votingSession.value) {
    const now = Date.now()
    const remaining = Math.max(0, votingSession.value.endTime - now)
    votingSession.value.timeRemaining = remaining
    
    if (remaining === 0) {
      // Session ended, clear interval
      if (timeRemainingInterval) {
        clearInterval(timeRemainingInterval)
        timeRemainingInterval = null
      }
    }
  }
}

// Watch voting session to start/stop timer
watch(votingSession, (newSession: VotingSession | null) => {
  if (timeRemainingInterval) {
    clearInterval(timeRemainingInterval)
    timeRemainingInterval = null
  }
  
  if (newSession) {
    // Update immediately
    updateTimeRemaining()
    // Update every second
    timeRemainingInterval = setInterval(updateTimeRemaining, 1000)
  }
})

// Connect to SSE on mount (client-side only - onMounted only runs on client)
onMounted(() => {
  // Generate or retrieve client ID
  if (typeof window !== 'undefined') {
    let storedClientId = localStorage.getItem('emoji_client_id')
    if (!storedClientId) {
      storedClientId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem('emoji_client_id', storedClientId)
    }
    clientId.value = storedClientId
  }

  // Fetch initial data
  fetchInitialData()

  // Connect to SSE
  connectToSSE()
})

// Clean up SSE connection on unmount
onUnmounted(() => {
  // Clear any pending reconnection attempts
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
  isReconnecting = false
  
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }
})
</script>

<style>
/* Critical CSS for SSR - ensure background is visible immediately */
html, body {
  background: linear-gradient(to bottom right, #667eea, #764ba2) !important;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

body > div#__nuxt {
  background: linear-gradient(to bottom right, #667eea, #764ba2);
  min-height: 100vh;
}
</style>

<style scoped>
/* Vue transition classes */
.emoji-fade-enter-active,
.emoji-fade-leave-active {
  transition: all 0.3s ease;
}

.emoji-fade-enter-from {
  opacity: 0;
  transform: scale(0) translateY(-20px);
}

.emoji-fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

/* Custom scrollbar styling */
.max-h-\[500px\]::-webkit-scrollbar {
  width: 8px;
}

.max-h-\[500px\]::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.max-h-\[500px\]::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.max-h-\[500px\]::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
