import { subscribeSSEClient, unsubscribeSSEClient, getRecentEmojiEvents, getConnectedClientCount } from '../../utils/emojiStore'

export default defineEventHandler((event) => {
  // Set SSE headers
  setResponseHeader(event, 'Content-Type', 'text/event-stream')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Connection', 'keep-alive')
  setResponseHeader(event, 'X-Accel-Buffering', 'no') // Disable nginx buffering
  
  // Create SSE client interface that writes to the response
  const sseClient = {
    send: (data: string) => {
      try {
        if (!event.node.res.closed) {
          event.node.res.write(data)
        }
      } catch (error) {
        console.error('Error sending SSE data:', error)
      }
    },
    close: () => {
      try {
        if (!event.node.res.closed) {
          event.node.res.end()
        }
      } catch (error) {
        console.error('Error closing SSE stream:', error)
      }
    }
  }
  
  // Subscribe this client
  subscribeSSEClient(sseClient)
  
  // Send initial connection message with current client count
  const clientCount = getConnectedClientCount()
  sseClient.send(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to emoji stream', count: clientCount })}\n\n`)
  
  // Send recent emojis on connection
  const recentEmojis = getRecentEmojiEvents(50)
  if (recentEmojis.length > 0) {
    sseClient.send(`data: ${JSON.stringify({ type: 'initial', events: recentEmojis })}\n\n`)
  }
  
  // Keep connection alive with periodic heartbeat
  const heartbeatInterval = setInterval(() => {
    try {
      if (!event.node.res.closed) {
        sseClient.send(`: heartbeat\n\n`)
      } else {
        clearInterval(heartbeatInterval)
        unsubscribeSSEClient(sseClient)
      }
    } catch (error) {
      clearInterval(heartbeatInterval)
      unsubscribeSSEClient(sseClient)
    }
  }, 30000) // Send heartbeat every 30 seconds
  
  // Handle client disconnect
  const cleanup = () => {
    clearInterval(heartbeatInterval)
    unsubscribeSSEClient(sseClient)
    try {
      if (!event.node.res.closed) {
        event.node.res.end()
      }
    } catch (error) {
      // Response might already be closed
    }
  }
  
  event.node.req.on('close', cleanup)
  event.node.req.on('aborted', cleanup)
  
  // Return a promise that never resolves (keeps the connection open)
  return new Promise(() => {
    // Connection stays open until client disconnects
  })
})

