# Toto 🧸

### Tiny Stories. Big Discoveries.

**Toto** is an AI-powered animated learning experience designed for toddlers.

Instead of presenting children with menus, lessons, quizzes, feeds, or complicated interfaces, Toto puts the child directly inside a world of short, colorful, entertaining stories.

> **Open Toto. Discover a story. Learn without realizing you're learning.**

---

## 🌱 Vision

Toddlers naturally learn by watching, observing, imitating, and asking questions.

Toto turns that natural curiosity into short animated experiences where learning is embedded inside entertaining stories.

A child doesn't need to select:

* Mathematics
* Science
* Animals
* Colors
* Music
* Art

Instead, Toto simply starts a story.

The story might be about a little bear discovering three apples, a rabbit chasing colorful butterflies, or a turtle watching the moon.

The child enjoys the story.

**Learning happens naturally along the way.**

---

## ✨ Core Experience

Toto intentionally has an extremely simple interface.

```text
Open App
   ↓
Animation Starts
   ↓
Watch Story
   ↓
Story Ends
   ↓
Next Story
```

There is:

* No traditional home screen
* No search
* No categories
* No content feed
* No complicated navigation
* No advertisements
* No distracting UI

The application should feel more like **turning on a tiny cartoon world** than opening an educational application.

---

## 🎯 Learning Through Stories

Toto doesn't turn every episode into a lesson.

Instead, concepts are naturally embedded into stories.

Possible themes include:

### Early Learning

* Colors
* Shapes
* Numbers
* Counting
* Sizes
* Opposites
* Patterns
* Basic language

### World Discovery

* Animals
* Nature
* Weather
* Space
* Oceans
* Plants
* Seasons

### Creativity

* Music
* Painting
* Drawing
* Movement
* Imagination

### Curiosity

* Observation
* Asking questions
* Simple experiments
* Problem solving
* Cause and effect
* Exploring the world

The goal is to encourage **curiosity and discovery**, not passive memorization.

---

# 🧸 Characters

Toto is built around a small collection of recurring characters.

Characters appear across multiple episodes so children gradually become familiar with them.

Example characters:

### Toto 🐢

A thoughtful and curious turtle.

### Bobo 🐻

A playful little bear who loves exploring.

### Mimi 🐰

An energetic rabbit who loves discovering new things.

### Pip 🐦

A musical little bird who loves sounds and songs.

The initial version will start with a small number of characters and gradually expand the character universe.

---

# 🤖 AI Content Factory

Toto uses AI to continuously create new animated stories.

The AI does **not** directly generate a complete video for every episode.

Instead, AI acts as the:

* Writer
* Character designer
* Storyboard artist
* Director
* Dialogue writer

Godot acts as the:

* Animator
* Scene composer
* Renderer

---

## 🎬 Content Generation Pipeline

```text
                AI
                 │
                 ↓
        Character Information
                 │
                 ↓
              Story
                 │
                 ↓
             Storyboard
                 │
                 ↓
       Animation Instructions
                 │
                 ↓
          Asset Management
                 │
          ┌──────┴──────┐
          ↓             ↓
       Exists         Missing
          ↓             ↓
        Reuse       Image AI
          └──────┬──────┘
                 ↓
              Godot
                 │
                 ↓
             Animation
                 │
                 ↓
                MP4
                 │
                 ↓
          Object Storage/CDN
                 │
                 ↓
              Flutter
```

---

# 🎨 Asset-First Animation

Toto does not generate completely new artwork for every episode.

Instead, it maintains a reusable asset library.

```text
Asset Library

characters/
    toto/
    bobo/
    mimi/
    pip/

backgrounds/
    forest/
    bedroom/
    park/
    beach/
    space/

objects/
    apple/
    ball/
    flower/
    butterfly/
    rocket/

sounds/
    footsteps/
    birds/
    water/
    laughter/
```

When an AI-generated story requires an asset, the system first checks whether the asset already exists.

If it exists:

```text
Reuse asset
```

If it doesn't:

```text
Generate asset
      ↓
Validate asset
      ↓
Add to asset library
```

This dramatically reduces image-generation requirements and helps maintain visual consistency.

---

# 🧠 AI Architecture

Toto separates AI responsibilities.

### Story AI

Creates:

* Character information
* Story
* Dialogue
* Scene descriptions
* Learning concepts

### Art AI

Creates missing:

* Characters
* Expressions
* Objects
* Backgrounds
* Visual assets

### Director AI

Converts the story into structured animation instructions that Godot understands.

Example:

```json
{
  "scenes": [
    {
      "background": "forest",
      "duration": 8,
      "actions": [
        {
          "type": "show",
          "asset": "toto"
        },
        {
          "type": "animate",
          "asset": "toto",
          "animation": "walk"
        },
        {
          "type": "move",
          "asset": "toto",
          "to": [500, 600],
          "duration": 4
        }
      ]
    }
  ]
}
```

---

# 🎬 Godot Animation Engine

Godot is responsible for turning structured animation instructions into an actual animated episode.

The AI doesn't need to know how Godot internally works.

It simply produces instructions such as:

```text
SHOW
HIDE
MOVE
ANIMATE
ROTATE
SCALE
WAIT
SPEAK
PLAY_SOUND
CAMERA_ZOOM
CAMERA_MOVE
```

Godot executes these instructions and renders the final animation.

---

# ☁️ Rendering Architecture

Godot is used as a rendering worker rather than running inside the Flutter application.

```text
Backend
   ↓
Render Queue
   ↓
Godot Render Service
   ↓
Godot Headless Worker
   ↓
Render Episode
   ↓
MP4
   ↓
Object Storage
```

The rendering service exposes an API such as:

```text
POST /render
GET  /render/{jobId}
```

Example:

```http
POST /render
```

```json
{
  "episodeId": "episode_001"
}
```

The rendering worker loads the episode instructions and creates the final video.

---

# 📱 Flutter Application

The Flutter application is intentionally lightweight.

Its primary responsibilities are:

```text
Launch
  ↓
Fetch random READY episode
  ↓
Download/cache video
  ↓
Play fullscreen
  ↓
Prefetch next episode
  ↓
Episode ends
  ↓
Play next episode
```

The child should see the animation rather than application controls.

---

# 🔀 Random Content Selection

The backend selects episodes from content that has successfully passed processing and validation.

Example:

```text
READY episodes
       ↓
Selection algorithm
       ↓
Avoid recently played episodes
       ↓
Weighted random selection
       ↓
Episode
```

This prevents the experience from becoming a predictable sequence while avoiding unnecessary repetition.

---

# 🗄️ Content Repository

Episodes are stored independently from the Flutter application.

Example episode:

```json
{
  "id": "episode_001",
  "title": "Toto Finds Three Apples",
  "duration": 60,
  "characters": [
    "toto"
  ],
  "videoUrl": "...",
  "status": "READY"
}
```

Episode lifecycle:

```text
GENERATING
     ↓
RENDERING
     ↓
PROCESSING
     ↓
READY
```

If something fails:

```text
FAILED
```

Only `READY` episodes are available to the application.

---

# 🏗️ High-Level Architecture

```text
┌───────────────────────────────┐
│          Flutter App          │
│                               │
│     Fullscreen Video Player   │
└───────────────┬───────────────┘
                │
                │ HTTPS
                ↓
┌───────────────────────────────┐
│           Backend             │
│                               │
│ Episode API                   │
│ Content Selection             │
│ Asset Management              │
│ Generation Pipeline           │
└───────┬───────────┬───────────┘
        │           │
        ↓           ↓
   ┌─────────┐  ┌─────────────┐
   │   AI    │  │ Image Model │
   │ Gemini  │  │   Provider  │
   └─────────┘  └─────────────┘
        │
        ↓
┌───────────────────────────────┐
│       Episode Definition      │
│                               │
│ Character                     │
│ Story                         │
│ Storyboard                    │
│ Animation Instructions        │
│ Assets                        │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│      Godot Render Service     │
│                               │
│      2D Animation Engine      │
└───────────────┬───────────────┘
                ↓
              MP4
                ↓
        Object Storage/CDN
```

---

# 🛠️ Technology Stack

## Mobile

* Flutter
* Dart
* Android
* iOS

## AI

* Gemini for story and instruction generation
* Open image-generation models through hosted inference
* TTS for narration

## Animation

* Godot 4
* 2D animation
* Headless rendering

## Backend

* Node.js / TypeScript
* REST API
* Background workers
* Job queue

## Storage

* Object storage
* CDN
* Episode metadata database

---

# 🚧 MVP

The first version intentionally remains small.

### Characters

3 characters.

### Worlds

3 backgrounds.

### Assets

10–20 reusable objects.

### Animations

Approximately:

* Idle
* Walk
* Run
* Jump
* Wave
* Dance
* Happy
* Sad
* Surprised
* Talk

### Episodes

10–20 short episodes.

### Episode length

Approximately 30–90 seconds.

### Mobile

* Launch directly into playback
* Fullscreen video
* Random episode selection
* Video caching
* Next episode prefetching

---

# 🎯 Long-Term Vision

Toto should eventually become a continuously expanding animated universe.

```text
Characters
     +
Worlds
     +
Objects
     +
Animations
     +
Sounds
     +
AI Stories
     ↓
Millions of possible combinations
```

Instead of manually producing every episode, AI continuously creates stories using an expanding library of reusable assets.

The more the asset library grows, the more stories Toto can create without proportionally increasing generation costs.

---

# ❤️ Product Philosophy

Toto is not designed to make children endlessly scroll.

It is designed to make them **curious about what happens next**.

The experience should encourage:

* Curiosity
* Imagination
* Observation
* Creativity
* Exploration
* Natural learning

The goal is simple:

> **Make learning feel like watching a tiny cartoon adventure.**

---

## 🚧 Development Status

**Toto is currently under active development.**

The initial focus is:

1. Character system
2. Asset library
3. AI story generation
4. AI storyboard generation
5. Godot 2D animation
6. Automated rendering
7. Flutter fullscreen playback
8. Content repository
9. Random episode delivery
