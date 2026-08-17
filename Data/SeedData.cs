using KanjiraNotes.Data;
using KanjiraNotes.Models;
using System.Text.Json;

namespace KanjiraNotes;

public static class SeedData
{
    public static void Initialize(AppDbContext db)
    {
        // Only seed if no lessons exist
        if (db.Lessons.Any()) return;

        // =============================================
        // Lesson 1 — Ola (Basics) — Adi Tala 8/8
        // =============================================
        var lesson1 = new Lesson
        {
            Title = "Lesson 1 — Ola (Basics)",
            Description = "Fundamental Kanjira strokes in Adi Tala. Progressive exercises building from 1 note per beat to 3 notes per beat. Master the four core syllables: Tha, Thi, Thom, Naam.",
            Tala = "Adi Tala (8 beats)",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Lessons.Add(lesson1);
        db.SaveChanges();

        // Exercise 1: Single stroke per beat (1 note/beat × 8 beats)
        // Tha | Thi | Thom | Naam | Tha | Thi | Thom | Naam
        db.DrumPatterns.Add(new DrumPattern
        {
            LessonId = lesson1.Id,
            Name = "Exercise 1 — Single Strokes",
            BPM = 60,
            BeatsPerCycle = 8,
            NotesPerBeat = 1,
            SortOrder = 0,
            PatternData = JsonSerializer.Serialize(new Dictionary<string, bool[]>
            {
                ["Tha"]  = new[] { true,  false, false, false, true,  false, false, false },
                ["Thi"]  = new[] { false, true,  false, false, false, true,  false, false },
                ["Thom"] = new[] { false, false, true,  false, false, false, true,  false },
                ["Naam"] = new[] { false, false, false, true,  false, false, false, true  }
            }),
            CreatedAt = DateTime.UtcNow
        });

        // Exercise 2: Double strokes per beat (2 notes/beat × 8 beats = 16 positions)
        // ThaThi | ThomNaam | ThaThi | ThomNaam | ThaThi | ThomThi | ThaThi | ThomNaam
        db.DrumPatterns.Add(new DrumPattern
        {
            LessonId = lesson1.Id,
            Name = "Exercise 2 — Double Strokes",
            BPM = 60,
            BeatsPerCycle = 8,
            NotesPerBeat = 2,
            SortOrder = 1,
            PatternData = JsonSerializer.Serialize(new Dictionary<string, bool[]>
            {
                //            B1      B2        B3      B4        B5      B6        B7      B8
                ["Tha"]  = new[] { true,false, false,false, true,false, false,false, true,false, false,false, true,false, false,false },
                ["Thi"]  = new[] { false,true, false,false, false,true, false,false, false,true, false,true,  false,true, false,false },
                ["Thom"] = new[] { false,false, true,false, false,false, true,false, false,false, true,false, false,false, true,false },
                ["Naam"] = new[] { false,false, false,true, false,false, false,true, false,false, false,false, false,false, false,true }
            }),
            CreatedAt = DateTime.UtcNow
        });

        // Exercise 3: Triple strokes per beat (3 notes/beat × 8 beats = 24 positions)
        // ThaThiThom | ThaThiThom | ThaThiThom | ThaThiNaam | ThaThiThom | ThaThiNaam | ThaThaTham | ThomThomNaam
        db.DrumPatterns.Add(new DrumPattern
        {
            LessonId = lesson1.Id,
            Name = "Exercise 3 — Triple Strokes",
            BPM = 60,
            BeatsPerCycle = 8,
            NotesPerBeat = 3,
            SortOrder = 2,
            PatternData = JsonSerializer.Serialize(new Dictionary<string, bool[]>
            {
                //             B1          B2          B3          B4          B5          B6          B7          B8
                ["Tha"]  = new[] { true,false,false, true,false,false, true,false,false, true,false,false, true,false,false, true,false,false, true,true,false, false,false,false },
                ["Thi"]  = new[] { false,true,false, false,true,false, false,true,false, false,true,false, false,true,false, false,true,false, false,false,false, false,false,false },
                ["Thom"] = new[] { false,false,true,  false,false,true,  false,false,true,  false,false,false, false,false,true,  false,false,false, false,false,true,  true,true,false },
                ["Naam"] = new[] { false,false,false, false,false,false, false,false,false, false,false,true,  false,false,false, false,false,true,  false,false,false, false,false,true  }
            }),
            CreatedAt = DateTime.UtcNow
        });

        db.SaveChanges();

        // =============================================
        // Lesson 2 — Paired Strokes — Adi Tala 8/8
        // =============================================
        var lesson2 = new Lesson
        {
            Title = "Lesson 2 — Paired Strokes",
            Description = "Practice repeating each stroke in pairs. Builds consistency and control for each of the four Kanjira syllables in Adi Tala.",
            Tala = "Adi Tala (8 beats)",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Lessons.Add(lesson2);
        db.SaveChanges();

        // Exercise 1: Paired strokes (2 notes/beat × 8 beats = 16 positions)
        // ThaTha | ThiThi | ThomThom | NaamNaam | ThaTha | ThiThi | Thom | Naam
        db.DrumPatterns.Add(new DrumPattern
        {
            LessonId = lesson2.Id,
            Name = "Exercise 1 — Paired Strokes",
            BPM = 60,
            BeatsPerCycle = 8,
            NotesPerBeat = 2,
            SortOrder = 0,
            PatternData = JsonSerializer.Serialize(new Dictionary<string, bool[]>
            {
                //            B1        B2        B3          B4          B5        B6        B7        B8
                ["Tha"]  = new[] { true,true,  false,false, false,false, false,false, true,true,  false,false, false,false, false,false },
                ["Thi"]  = new[] { false,false, true,true,  false,false, false,false, false,false, true,true,  false,false, false,false },
                ["Thom"] = new[] { false,false, false,false, true,true,  false,false, false,false, false,false, true,false,  false,false },
                ["Naam"] = new[] { false,false, false,false, false,false, true,true,  false,false, false,false, false,false, true,false  }
            }),
            CreatedAt = DateTime.UtcNow
        });

        db.SaveChanges();

        // =============================================
        // Lesson 3 — GS Advanced Exercises — Adi Tala
        // =============================================
        var lesson3 = new Lesson
        {
            Title = "Lesson 3 — GS Advanced Exercises",
            Description = "Advanced combination patterns from the GS series. Complex stroke combinations with varying density across the Adi Tala cycle. Focus on transitions between strokes at higher speeds.",
            Tala = "Adi Tala (8 beats)",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Lessons.Add(lesson3);
        db.SaveChanges();

        // GS Exercise 1: Mixed density pattern (4 notes/beat × 8 beats = 32 positions)
        // ThaNaamThaThi | ThiThiThi_ | ThomThom__ | Naam____ | Tha_____ | Thi_____ | ThomNaam__ | ________
        db.DrumPatterns.Add(new DrumPattern
        {
            LessonId = lesson3.Id,
            Name = "GS Exercise 1 — Mixed Density",
            BPM = 70,
            BeatsPerCycle = 8,
            NotesPerBeat = 4,
            SortOrder = 0,
            PatternData = JsonSerializer.Serialize(new Dictionary<string, bool[]>
            {
                ["Tha"]  = new[] { true,false,true,false, false,false,false,false, false,false,false,false, false,false,false,false, true,false,false,false, false,false,false,false, false,false,false,false, false,false,false,false },
                ["Thi"]  = new[] { false,false,false,true, true,true,true,false,   false,false,false,false, false,false,false,false, false,false,false,false, true,false,false,false, false,false,false,false, false,false,false,false },
                ["Thom"] = new[] { false,false,false,false, false,false,false,false, true,true,false,false,  false,false,false,false, false,false,false,false, false,false,false,false, true,false,false,false, false,false,false,false },
                ["Naam"] = new[] { false,true,false,false,  false,false,false,false, false,false,false,false, true,false,false,false,  false,false,false,false, false,false,false,false, false,true,false,false, false,false,false,false }
            }),
            CreatedAt = DateTime.UtcNow
        });

        // GS Exercise 2: Grouped repetitions (4 notes/beat × 8 beats = 32 positions)
        db.DrumPatterns.Add(new DrumPattern
        {
            LessonId = lesson3.Id,
            Name = "GS Exercise 2 — Grouped Repetitions",
            BPM = 70,
            BeatsPerCycle = 8,
            NotesPerBeat = 4,
            SortOrder = 1,
            PatternData = JsonSerializer.Serialize(new Dictionary<string, bool[]>
            {
                ["Tha"]  = new[] { true,true,true,true,   false,false,false,false, true,true,true,true,   true,true,true,true,   false,false,false,false, false,false,false,false, false,false,false,false, true,false,false,false },
                ["Thi"]  = new[] { false,false,false,false, false,false,false,false, false,false,false,false, false,false,false,false, false,false,false,false, false,false,false,false, false,false,false,false, false,false,false,false },
                ["Thom"] = new[] { false,false,false,false, false,false,false,false, false,false,false,false, false,false,false,false, true,false,false,false,  true,false,false,false,  true,false,false,false, false,false,false,false },
                ["Naam"] = new[] { false,false,false,false, true,true,true,true,    false,false,false,false, false,false,false,false, false,true,false,false,  false,true,false,false,  false,true,false,false, false,true,false,false }
            }),
            CreatedAt = DateTime.UtcNow
        });

        // GS Exercise 3: Layer building (4 notes/beat × 8 beats = 32 positions)
        // Progressive layering — each stroke enters one at a time
        db.DrumPatterns.Add(new DrumPattern
        {
            LessonId = lesson3.Id,
            Name = "GS Exercise 3 — Layer Building",
            BPM = 70,
            BeatsPerCycle = 8,
            NotesPerBeat = 4,
            SortOrder = 2,
            PatternData = JsonSerializer.Serialize(new Dictionary<string, bool[]>
            {
                ["Tha"]  = new[] { true,true,true,true,   true,false,false,false, true,false,false,false, true,false,false,false, true,false,false,false, true,false,false,false, true,false,true,false, true,false,false,false },
                ["Thi"]  = new[] { false,false,false,false, true,true,true,true,   true,true,true,true,   true,true,true,true,   true,false,false,false, true,false,false,false, true,false,true,false, true,true,false,false },
                ["Thom"] = new[] { false,false,false,false, false,false,false,false, false,false,false,false, true,true,true,true,   true,true,true,true,   true,false,false,false, true,false,false,false, true,true,true,false },
                ["Naam"] = new[] { false,false,false,false, false,false,false,false, false,false,false,false, false,false,false,false, false,false,false,false, true,true,true,true,   true,false,true,false, true,false,true,true  }
            }),
            CreatedAt = DateTime.UtcNow
        });

        db.SaveChanges();
    }
}
