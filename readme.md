# HealthGuard

HealthGuard is a family-focused health companion built with Expo React Native and a Node.js/Express backend. It helps users manage profiles, emergency information, medications, child growth records, clinic visits, and health metrics in one mobile app.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Notes](#api-notes)
- [Troubleshooting](#troubleshooting)

## Overview

This repository contains:

- Mobile app: Expo + React Native (TypeScript, Expo Router)
- Backend API: Express + Prisma + PostgreSQL

The mobile app communicates with the backend through REST endpoints under `/api/v1`.

## Core Features

- Authentication and profile management
- Emergency card with public share route
- Medication management, schedules, and logs
- Appointments and clinic visits
- Child growth records and vaccination tracking
- Health metrics and AI-assisted trend analysis (Gemini)

## Tech Stack

### Mobile

- Expo SDK 54
- React Native 0.81
- Expo Router
- Zustand
- AsyncStorage
- Expo Notifications

### Backend

- Node.js 20+
- Express
- Prisma ORM
- PostgreSQL
- Zod validation
- JWT authentication

## Project Structure

```
.
|-- app/                          # Expo Router pages and route groups
|   |-- (auth)/                   # Authentication routes
|   |-- (tabs)/                   # Main tab routes
|   |-- _layout.tsx               # Root router layout
|-- src/
|   |-- components/               # Feature UI components
|   |   |-- child-growth/
|   |   |-- dashboard/
|   |   |-- emergency/
|   |   |-- health-dashboard/
|   |   |-- med-manager/
|   |   |-- shared/
|   |-- lib/                      # Mobile API clients and utilities
|   |-- store/                    # Client state
|   |-- theme/                    # Design tokens/theme
|-- services/                     # App services (notifications, misc)
|-- storage/                      # Local storage helpers
|-- backend/
|   |-- prisma/                   # Prisma schema + migrations
|   |-- src/
|   |   |-- routes/               # Express route modules
|   |   |-- middleware/           # Auth and error middleware
|   |   |-- lib/                  # Backend utility libraries
|   |   |-- index.ts              # API entrypoint
|-- assets/                       # Static assets
|-- patches/                      # patch-package patches
```

## Prerequisites

- Node.js 20 or newer
- npm 9+
- Expo Go app on Android/iOS (for quick mobile testing)
- PostgreSQL database for backend

## Getting Started

### 1. Install dependencies

From the project root:

```bash
npm install
```

Then install backend dependencies:

```bash
cd backend
npm install
cd ..
```

### 2. Configure environment variables

Create `backend/.env` and configure required keys (see Environment Variables section).

Optionally, create root `.env` for Expo public variables.

### 3. Run database migrations

```bash
cd backend
npm run prisma:migrate
cd ..
```

### 4. Start backend API

```bash
cd backend
npm run dev
```

Backend default port is `4000` unless `PORT` is set.

### 5. Start mobile app

Open a second terminal in the project root:

```bash
npm run start
```

Scan the QR code with Expo Go on Android/iOS.

## Environment Variables

### Mobile (root `.env`)

- `EXPO_PUBLIC_API_URL`: Base URL for backend API
  - Local example: `http://localhost:4000`
  - If testing on physical device, use your machine's LAN IP (for example `http://192.168.1.10:4000`)

If not set, the app falls back to a predefined deployed API URL in [src/lib/api.ts](src/lib/api.ts).

### Backend (`backend/.env`)

- `DATABASE_URL`: PostgreSQL connection string used by Prisma
- `JWT_SECRET`: Secret for signing/verifying JWT tokens
- `GOOGLE_API_KEY`: Key for Gemini health analysis route
- `PORT` (optional): API server port (defaults to `4000`)

## Available Scripts

### Root scripts

- `npm run start` - Start Expo dev server
- `npm run android` - Build/run Android locally
- `npm run ios` - Build/run iOS locally
- `npm run web` - Start Expo web

### Backend scripts

Run these in [backend/package.json](backend/package.json):

- `npm run dev` - Start backend with watch mode
- `npm run start` - Start backend once
- `npm run prisma:migrate` - Create/apply local Prisma migrations
- `npm run prisma:deploy` - Apply migrations in deployment environment
- `npm run prisma:studio` - Open Prisma Studio

## API Notes

- Health endpoints:
  - `GET /health`
  - `GET /api/v1/health`
- Main API namespace: `/api/v1`
- Public emergency route: `/emergency/:token`

Main backend entry point: [backend/src/index.ts](backend/src/index.ts)

## Troubleshooting

- App cannot reach backend:
  - Verify `EXPO_PUBLIC_API_URL`
  - Ensure backend is running and reachable from device/emulator
- Prisma connection errors:
  - Confirm `DATABASE_URL` is valid and database is available
- Unauthorized responses:
  - Verify `JWT_SECRET` is set and consistent across restarts
