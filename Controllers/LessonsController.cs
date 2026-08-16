using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KanjiraNotes.Data;
using KanjiraNotes.Models;

namespace KanjiraNotes.Controllers;

public class LessonsController : Controller
{
    private readonly AppDbContext _db;

    public LessonsController(AppDbContext db)
    {
        _db = db;
    }

    // GET: /Lessons
    public async Task<IActionResult> Index()
    {
        var lessons = await _db.Lessons
            .Include(l => l.Patterns)
            .OrderByDescending(l => l.UpdatedAt)
            .ToListAsync();
        return View(lessons);
    }

    // GET: /Lessons/Details/5
    public async Task<IActionResult> Details(int? id)
    {
        if (id == null) return NotFound();

        var lesson = await _db.Lessons
            .Include(l => l.Patterns.OrderBy(p => p.SortOrder))
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lesson == null) return NotFound();

        return View(lesson);
    }

    // GET: /Lessons/Create
    public IActionResult Create()
    {
        return View();
    }

    // POST: /Lessons/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Title,Description,Tala")] Lesson lesson)
    {
        if (ModelState.IsValid)
        {
            lesson.CreatedAt = DateTime.UtcNow;
            lesson.UpdatedAt = DateTime.UtcNow;
            _db.Lessons.Add(lesson);
            await _db.SaveChangesAsync();
            return RedirectToAction(nameof(Details), new { id = lesson.Id });
        }
        return View(lesson);
    }

    // GET: /Lessons/Edit/5
    public async Task<IActionResult> Edit(int? id)
    {
        if (id == null) return NotFound();

        var lesson = await _db.Lessons.FindAsync(id);
        if (lesson == null) return NotFound();

        return View(lesson);
    }

    // POST: /Lessons/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, [Bind("Id,Title,Description,Tala")] Lesson lesson)
    {
        if (id != lesson.Id) return NotFound();

        if (ModelState.IsValid)
        {
            try
            {
                var existing = await _db.Lessons.FindAsync(id);
                if (existing == null) return NotFound();

                existing.Title = lesson.Title;
                existing.Description = lesson.Description;
                existing.Tala = lesson.Tala;
                existing.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _db.Lessons.AnyAsync(e => e.Id == id))
                    return NotFound();
                throw;
            }
            return RedirectToAction(nameof(Details), new { id });
        }
        return View(lesson);
    }

    // GET: /Lessons/Delete/5
    public async Task<IActionResult> Delete(int? id)
    {
        if (id == null) return NotFound();

        var lesson = await _db.Lessons
            .Include(l => l.Patterns)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lesson == null) return NotFound();

        return View(lesson);
    }

    // POST: /Lessons/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var lesson = await _db.Lessons.FindAsync(id);
        if (lesson != null)
        {
            _db.Lessons.Remove(lesson);
            await _db.SaveChangesAsync();
        }
        return RedirectToAction(nameof(Index));
    }
}
