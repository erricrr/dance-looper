[![Netlify Status](https://api.netlify.com/api/v1/badges/cf727465-510a-45ac-8880-5f1b427d6eef/deploy-status)](https://app.netlify.com/projects/dalooper/deploys)

# Dalooper

A YouTube video looper designed to help you master any skill through the power of repetition. Break down complex videos into digestible, loopable clips and practice at your own rhythm.

## About

**Dalooper** was born from the desire to master steps in "salsa caleña" videos, transforming complex choreography into digestible, loopable moments. Mirror the video to follow along naturally, practice at your own rhythm, and repeat until perfect.

### Beyond Dance

While born for salsa, Dalooper excels with any repetitive learning:
- Language pronunciation
- Music performances
- Sports techniques
- Analyzing detailed movements

## Features

- **YouTube Integration**: Paste any YouTube link to get started
- **Clip Creation**: Break videos into custom time segments
- **Loop Practice**: Repeat specific sections at your own pace
- **Playback Control**: Adjust speed from 0.25x to 1x
- **Mirror Mode**: Flip the video horizontally for easier following
- **URL History**: Save and quickly access your favorite videos
- **Responsive Design**: Works seamlessly on desktop and mobile

## Getting Started

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Comes with Node.js

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dance-looper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:9002](http://localhost:9002)

### Available Scripts

- `npm run dev` - Start development server with Turbopack on port 9002
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Production Build

To create a production build:

```bash
npm run build
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000) (default Next.js port for production).

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **UI Components**: Radix UI with Tailwind CSS
- **Video Player**: React YouTube
- **Form Handling**: React Hook Form with Zod validation
- **AI Integration**: Google AI via Genkit (ability to integrate, but not integrated)

## Contact

Questions, feedback, or improvement ideas? Get in touch at [voicevoz321@gmail.com](mailto:voicevoz321@gmail.com)

---

Dalooper &copy; 2025
