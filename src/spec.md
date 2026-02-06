# Specification

## Summary
**Goal:** Fix the production “black screen on load” after Version 47 so the app reliably renders its initial UI and does not crash during startup.

**Planned changes:**
- Diagnose and fix the fatal frontend startup error that prevents React from mounting in production.
- Add a safe `process.env` polyfill that runs before the React bundle executes to prevent `process is not defined` crashes (without modifying immutable hook files).
- Replace editable frontend references to `process.env.NODE_ENV` (e.g., in `frontend/src/App.tsx`) with a Vite-compatible environment check.
- Add/ensure an error fallback UI is shown if an unexpected runtime error occurs (instead of a blank screen).

**User-visible outcome:** Loading the deployed app shows the normal initial UI (not a blank black screen), and unexpected startup/runtime errors show a visible fallback screen rather than preventing the app from rendering.
