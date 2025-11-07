# Snappy Demo - Real-time Emoji Board

A Nuxt 4 demo application showcasing real-time emoji broadcasting. Users can click emojis that appear instantly for all connected users.

## Features

- 🎯 **Optimistic UI Updates**: Emojis appear instantly when clicked (before server confirmation)
- ⚡ **Real-time Sync**: 500ms polling for near-instant updates from other users
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations
- 🚀 **Vercel Ready**: Configured for seamless deployment on Vercel

## Tech Stack

- **Nuxt 4**: Full-stack Vue framework
- **TypeScript**: Type-safe development
- **Vercel**: Serverless deployment platform

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000/demo` to see the demo page.

### Build

```bash
npm run build
```

### Deployment

This project is configured for Vercel deployment. Simply:

1. Push your code to a Git repository
2. Import the project in Vercel
3. Vercel will automatically detect Nuxt and deploy

Or use the Vercel CLI:

```bash
vercel
```

## Project Structure

```
snappy-demo/
├── server/
│   ├── api/
│   │   ├── emoji.post.ts      # API endpoint to submit emojis
│   │   └── emojis.get.ts      # API endpoint to fetch recent emojis
│   └── utils/
│       └── emojiStore.ts      # In-memory emoji event store
├── pages/
│   └── demo.vue               # Main demo page
├── nuxt.config.ts              # Nuxt configuration
└── vercel.json                 # Vercel deployment config
```

## How It Works

1. **Optimistic Updates**: When a user clicks an emoji, it's immediately added to the UI with a "pending" state
2. **Server Submission**: The emoji is sent to the server via POST `/api/emoji`
3. **Real-time Sync**: All clients poll GET `/api/emojis` every 500ms to receive emojis from other users
4. **In-Memory Store**: Emojis are stored in memory (no database needed for this demo)

## Future Enhancements

- Whiteboard feature for collaborative drawing
- User identification and names
- Emoji reactions and animations
- Persistent storage option

## License

See LICENSE.md for details.

