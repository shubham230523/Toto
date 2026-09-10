# Toto Backend & Render Service Stabilization Plan

The goal is to start the backend and render services, then run a stabilization loop that generates learning episodes. If errors occur during generation, the code will be analyzed and fixed iteratively until all stories are successfully generated.

## User Review Required

> [!IMPORTANT]
> The stabilization loop `npm run generate:loop` will run until all concepts are "ready". This might involve multiple code fixes if the generation or rendering pipeline crashes.

> [!NOTE]
> I will start the services in background processes using PowerShell `Start-Process`. You will not see their output in the main console unless I fetch the logs or check the specific process.

## Proposed Changes

### Backend Service
- Start the service using `npm run dev` in the `backend/` directory.
- This service handles API requests and AI content generation.

### Render Service
- Start the service using `npm run dev` in the `render-service/` directory.
- This service orchestrates the Godot renderer to create video/image assets.

### Stabilization Loop
- Run `npm run generate:loop` in the `backend/` directory.
- Monitor the output.
- If a crash or failure occurs:
    1. Analyze backend/render logs.
    2. Identify the bug.
    3. Apply fixes using code modification tools.
    4. Rerun/Continue the loop.

## Verification Plan

### Automated Verification
- The `generate:loop` script provides a clear success message: `--- ALL EPISODES GENERATED SUCCESSFULLY ---`.
- I will check the `READY` status of all generated episodes in the database/API.

### Manual Verification
- Check the `backend/uploads` directory for generated assets (audio, images, videos).
