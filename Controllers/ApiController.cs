using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KanjiraNotes.Data;
using KanjiraNotes.Models;

namespace KanjiraNotes.Controllers;

[Route("api")]
[ApiController]
public class ApiController : ControllerBase
{
    private readonly AppDbContext _db;

    public ApiController(AppDbContext db)
    {
        _db = db;
    }

    // POST: /api/patterns
    [HttpPost("patterns")]
    public async Task<IActionResult> CreatePattern([FromBody] CreatePatternRequest request)
    {
        var lesson = await _db.Lessons.FindAsync(request.LessonId);
        if (lesson == null) return NotFound(new { error = "Lesson not found" });

        var maxOrder = await _db.DrumPatterns
            .Where(p => p.LessonId == request.LessonId)
            .MaxAsync(p => (int?)p.SortOrder) ?? -1;

        var pattern = new DrumPattern
        {
            LessonId = request.LessonId,
            Name = request.Name ?? $"Pattern {maxOrder + 2}",
            BPM = request.BPM > 0 ? request.BPM : 80,
            BeatsPerCycle = request.BeatsPerCycle > 0 ? request.BeatsPerCycle : 4,
            NotesPerBeat = request.NotesPerBeat > 0 ? request.NotesPerBeat : 4,
            PatternData = "{}",
            SortOrder = maxOrder + 1,
            CreatedAt = DateTime.UtcNow
        };

        _db.DrumPatterns.Add(pattern);

        lesson.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            pattern.Id,
            pattern.Name,
            pattern.BPM,
            pattern.BeatsPerCycle,
            pattern.NotesPerBeat,
            pattern.PatternData,
            pattern.SortOrder
        });
    }

    // PUT: /api/patterns/{id}
    [HttpPut("patterns/{id}")]
    public async Task<IActionResult> UpdatePattern(int id, [FromBody] UpdatePatternRequest request)
    {
        var pattern = await _db.DrumPatterns.Include(p => p.Lesson).FirstOrDefaultAsync(p => p.Id == id);
        if (pattern == null) return NotFound(new { error = "Pattern not found" });

        if (!string.IsNullOrEmpty(request.Name)) pattern.Name = request.Name;
        if (request.BPM > 0) pattern.BPM = request.BPM;
        if (request.BeatsPerCycle > 0) pattern.BeatsPerCycle = request.BeatsPerCycle;
        if (request.NotesPerBeat > 0) pattern.NotesPerBeat = request.NotesPerBeat;

        pattern.Lesson.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { success = true });
    }

    // PUT: /api/patterns/{id}/grid
    [HttpPut("patterns/{id}/grid")]
    public async Task<IActionResult> UpdateGrid(int id, [FromBody] UpdateGridRequest request)
    {
        var pattern = await _db.DrumPatterns.Include(p => p.Lesson).FirstOrDefaultAsync(p => p.Id == id);
        if (pattern == null) return NotFound(new { error = "Pattern not found" });

        pattern.PatternData = request.PatternData ?? "{}";
        pattern.BPM = request.BPM > 0 ? request.BPM : pattern.BPM;
        pattern.BeatsPerCycle = request.BeatsPerCycle > 0 ? request.BeatsPerCycle : pattern.BeatsPerCycle;
        pattern.NotesPerBeat = request.NotesPerBeat > 0 ? request.NotesPerBeat : pattern.NotesPerBeat;

        pattern.Lesson.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { success = true });
    }

    // DELETE: /api/patterns/{id}
    [HttpDelete("patterns/{id}")]
    public async Task<IActionResult> DeletePattern(int id)
    {
        var pattern = await _db.DrumPatterns.Include(p => p.Lesson).FirstOrDefaultAsync(p => p.Id == id);
        if (pattern == null) return NotFound(new { error = "Pattern not found" });

        pattern.Lesson.UpdatedAt = DateTime.UtcNow;
        _db.DrumPatterns.Remove(pattern);
        await _db.SaveChangesAsync();

        return Ok(new { success = true });
    }
}

// Request DTOs
public record CreatePatternRequest(int LessonId, string? Name, int BPM, int BeatsPerCycle, int NotesPerBeat);
public record UpdatePatternRequest(string? Name, int BPM, int BeatsPerCycle, int NotesPerBeat);
public record UpdateGridRequest(string? PatternData, int BPM, int BeatsPerCycle, int NotesPerBeat);
