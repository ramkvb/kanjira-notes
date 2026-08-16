# 🥁 Kanjira Notes

A web/mobile compatible **ASP.NET Core 8 MVC** application for Kanjira (South Indian frame drum) practice with interactive drum notation, a built-in metronome, looping playback, and structured lesson management.

## Features

- **Interactive Drum Grid** — Toggle Kanjira strokes (Tha, Thi, Thom, Naam) on a visual grid
- **Precision Metronome** — Web Audio API powered with configurable BPM and lookahead scheduling
- **Cycle Looping** — Configurable beats per cycle and notes per beat with play/stop toggle
- **Lesson Management** — Full CRUD operations to organize practice sessions
- **Tala Support** — Built-in Carnatic talas (Adi, Rupaka, Misra Chapu, etc.)
- **Mobile Ready** — PWA support, responsive design, touch-optimized (44px+ tap targets)
- **Auto-Save** — Pattern changes saved automatically via AJAX
- **Offline Support** — Service worker caches assets for offline use

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core 8 MVC (C#) |
| Database | SQLite via Entity Framework Core |
| Frontend | Razor Views + Vanilla JS + CSS |
| Audio | Web Audio API (synthesized drum sounds) |
| Mobile | Progressive Web App (PWA) |

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

### Run Locally

```bash
git clone https://github.com/ramkvb/kanjira-notes.git
cd kanjira-notes
dotnet run
```

The app will start at `http://localhost:5000`.

### Build

```bash
dotnet build
```

## Project Structure

```
kanjira-notes/
├── Controllers/
│   ├── HomeController.cs         # Landing page
│   ├── LessonsController.cs      # CRUD for lessons
│   └── ApiController.cs          # REST API for patterns
├── Data/
│   └── AppDbContext.cs            # EF Core context (SQLite)
├── Models/
│   ├── Lesson.cs                  # Lesson entity
│   └── DrumPattern.cs             # Pattern entity
├── Views/
│   ├── Home/Index.cshtml          # Landing page
│   ├── Lessons/                   # CRUD views + drum grid
│   └── Shared/_Layout.cshtml     # Responsive layout
├── wwwroot/
│   ├── css/site.css               # Dark theme CSS
│   ├── js/
│   │   ├── kanjira-sounds.js      # Synthesized strokes
│   │   ├── metronome.js           # Audio scheduler
│   │   ├── drum-grid.js           # Grid controller
│   │   └── service-worker.js     # PWA caching
│   └── manifest.json             # PWA manifest
└── Program.cs                     # App configuration
```

## License

MIT
