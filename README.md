# Gym Progress Tracker

A simple workout logging app built with React Native and Expo. Log your exercises, track total volume, and keep your history saved on your device.

## Features

- Add workout entries with exercise name, sets, reps, weight, and notes
- Workout history displayed as clean cards with date and total volume (sets × reps × weight)
- Summary bar showing total workouts and total volume across all entries
- Delete entries with confirmation
- Input validation with friendly error alerts
- Local persistence with AsyncStorage — entries survive closing and reopening the app

## Tech Stack

- React Native (Expo, SDK 54)
- JavaScript
- Functional components with React hooks (useState, useEffect)
- AsyncStorage for local data persistence

## Running Locally

```bash
npm install
npx expo start
```

Then scan the QR code with the Expo Go app on your phone, or press `w` to run in the browser.

## How It Works

All app logic lives in `App.js`. Workouts are held in a `useState` array — the single source of truth for the UI. A `useEffect` loads saved data from AsyncStorage on startup. Adding a workout validates the input, builds a new array (state is never mutated), and saves it back to AsyncStorage as JSON. Summary stats like total volume are derived with `reduce` on each render rather than stored, so they can never go out of sync.

## Possible Improvements

- Extract WorkoutCard and form into separate components
- Edit existing entries
- Group history by date
- Progress charts over time
- TypeScript migration
