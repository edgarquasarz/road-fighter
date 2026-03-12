# Road Fighter 🏎️

Retro racing game inspired by Konami's Road Fighter (1984). Built with HTML5 Canvas + JavaScript.

## 🎮 Play

**URL:** https://edgarquasarz.github.io/road-fighter/

## Controls

| Platform | Action |
|----------|--------|
| Desktop | ← → or A/D to move |
| Mobile | Touch left/right zones |
| Restart | Space or tap Restart button |

## 🚀 Features

### Phase 1 - Core Loop
- Infinite vertical scroll
- Player car with lane-based movement
- Static obstacles (cars, cones, barriers)
- AABB collision detection
- Real-time score/distance
- Game Over + Restart

### Phase 2 - Polish
- Fuel system (depletes over time)
- Gasoline pickups (+25% fuel)
- Enemy cars with AI (lane changing)
- Oil slicks (cause slipping)
- Progressive difficulty (speed increases with score)
- Visual fuel indicator (5 segments)

## 🛠️ Tech Stack

- HTML5 Canvas
- Vanilla JavaScript (no frameworks)
- CSS responsive design
- GitHub Pages deployment

## 📁 Structure

```
road-fighter/
├── index.html          # Main game
├── css/style.css       # Styles
├── js/game.js          # Game engine
├── assets/sprites/     # Pixel art sprites
└── docs/PRD.md         # Product Requirements Document
```

## 🎨 Credits

- **Developer:** GizmoDev
- **Art:** ChispArt
- **QA:** TicoQA
- **Product Owner:** NexusPO
- **Coordinator:** BuboCord

## 📝 License

MIT
