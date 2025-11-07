<template>
  <div class="demo-container">
    <header class="demo-header">
      <h1>🎉 Snappy Demo - Real-time Emoji Board</h1>
      <p class="subtitle">Click an emoji to see it appear instantly for everyone!</p>
      <div class="status-bar">
        <span class="status-indicator" :class="{ active: isConnected }">
          {{ isConnected ? '● Connected' : '○ Connecting...' }}
        </span>
        <span class="emoji-count">{{ liveEmojis.length }} emojis shown</span>
      </div>
    </header>

    <main class="demo-main">
      <section class="emoji-grid-section">
        <h2>Click an Emoji</h2>
        <div class="emoji-grid">
          <button
            v-for="emoji in emojiList"
            :key="emoji"
            class="emoji-button"
            @click="handleEmojiClick(emoji)"
            :disabled="isSubmitting"
          >
            {{ emoji }}
          </button>
        </div>
      </section>

      <section class="live-emojis-section">
        <h2>Live Emojis</h2>
        <div class="live-emojis-container">
          <transition-group name="emoji-fade" tag="div" class="live-emojis-list">
            <span
              v-for="emojiEvent in liveEmojis"
              :key="emojiEvent.id"
              class="live-emoji"
              :class="{ 'pending': emojiEvent.pending }"
            >
              {{ emojiEvent.emoji }}
            </span>
          </transition-group>
          <div v-if="liveEmojis.length === 0" class="empty-state">
            No emojis yet. Click one above to get started!
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
interface EmojiEvent {
  id: string
  emoji: string
  timestamp: number
  pending?: boolean
}

const emojiList = ['😀', '😂', '😍', '😎', '😢', '😮', '🤔', '😴', '🤗', '😋', '🥳', '🤩', '😇', '🤪', '😏', '😭', '😱', '🤯', '💯', '🔥']

const liveEmojis = ref<EmojiEvent[]>([])
const isConnected = ref(false)
const isSubmitting = ref(false)
const lastPollTimestamp = ref<number>(Date.now())
const pollInterval = ref<NodeJS.Timeout | null>(null)

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
  
  // Scroll to show new emoji
  await nextTick()
  scrollToLatest()
  
  // Submit to server (non-blocking)
  isSubmitting.value = true
  try {
    const response = await $fetch<{ success: boolean; event: EmojiEvent }>('/api/emoji', {
      method: 'POST',
      body: { emoji }
    })
    
    // Replace optimistic event with server event
    const index = liveEmojis.value.findIndex(e => e.id === optimisticEvent.id)
    if (index !== -1) {
      // Replace with server event (has real ID, no pending flag)
      liveEmojis.value[index] = response.event
    }
  } catch (error) {
    console.error('Failed to submit emoji:', error)
    // Remove the optimistic emoji on error
    const index = liveEmojis.value.findIndex(e => e.id === optimisticEvent.id)
    if (index !== -1) {
      liveEmojis.value.splice(index, 1)
    }
    // Could show an error message to the user here
  } finally {
    isSubmitting.value = false
  }
}

// Poll for new emojis from other users
const pollForEmojis = async () => {
  try {
    const response = await $fetch<{
      events: EmojiEvent[]
      count: number
      timestamp: number
    }>('/api/emojis', {
      query: {
        since: lastPollTimestamp.value
      }
    })
    
    isConnected.value = true
    
    // Add new events that we don't already have
    const existingIds = new Set(liveEmojis.value.map(e => e.id))
    const newEvents = response.events.filter(e => !existingIds.has(e.id))
    
    // Process new events - replace pending ones or add new ones
    for (const event of newEvents) {
      // Check if we have a pending event with the same emoji and similar timestamp
      const pendingIndex = liveEmojis.value.findIndex(
        e => e.pending && e.emoji === event.emoji && Math.abs(e.timestamp - event.timestamp) < 2000
      )
      
      if (pendingIndex !== -1) {
        // Replace pending event with server event
        liveEmojis.value[pendingIndex] = event
      } else {
        // Add as new event (from another user)
        liveEmojis.value.push(event)
      }
    }
    
    // Update last poll timestamp
    if (response.events.length > 0) {
      lastPollTimestamp.value = Math.max(...response.events.map(e => e.timestamp))
    }
    
    // Limit the number of displayed emojis (keep last 200)
    if (liveEmojis.value.length > 200) {
      liveEmojis.value = liveEmojis.value.slice(-200)
    }
    
    // Scroll to show latest if new emojis were added
    if (newEvents.length > 0) {
      await nextTick()
      scrollToLatest()
    }
  } catch (error) {
    console.error('Failed to poll for emojis:', error)
    isConnected.value = false
  }
}

// Scroll to latest emoji
const scrollToLatest = () => {
  const container = document.querySelector('.live-emojis-container')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

// Start polling on mount
onMounted(() => {
  // Initial poll
  pollForEmojis()
  
  // Set up polling interval (500ms for near-instant updates)
  pollInterval.value = setInterval(pollForEmojis, 500)
})

// Clean up polling on unmount
onUnmounted(() => {
  if (pollInterval.value) {
    clearInterval(pollInterval.value)
  }
})
</script>

<style scoped>
.demo-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  color: white;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.status-bar {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator.active {
  color: #4ade80;
}

.emoji-count {
  opacity: 0.8;
}

.demo-main {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .demo-main {
    grid-template-columns: 1fr;
  }
}

.emoji-grid-section,
.live-emojis-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.emoji-grid-section h2,
.live-emojis-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1rem;
}

.emoji-button {
  font-size: 3rem;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.emoji-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.emoji-button:active:not(:disabled) {
  transform: scale(0.95);
}

.emoji-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.live-emojis-container {
  max-height: 500px;
  overflow-y: auto;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
}

.live-emojis-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  min-height: 100px;
}

.live-emoji {
  font-size: 2.5rem;
  display: inline-block;
  animation: emojiPop 0.3s ease-out;
  opacity: 1;
}

.live-emoji.pending {
  opacity: 0.7;
  animation: emojiPulse 1s ease-in-out infinite;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  opacity: 0.7;
  font-style: italic;
}

/* Animations */
@keyframes emojiPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes emojiPulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

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

/* Scrollbar styling */
.live-emojis-container::-webkit-scrollbar {
  width: 8px;
}

.live-emojis-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.live-emojis-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.live-emojis-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
