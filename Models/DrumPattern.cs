using System.ComponentModel.DataAnnotations;

namespace KanjiraNotes.Models;

public class DrumPattern
{
    public int Id { get; set; }

    public int LessonId { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = "Pattern 1";

    [Range(30, 300)]
    public int BPM { get; set; } = 80;

    [Range(1, 16)]
    public int BeatsPerCycle { get; set; } = 4;

    [Range(1, 8)]
    public int NotesPerBeat { get; set; } = 4;

    /// <summary>
    /// JSON string mapping stroke names to boolean arrays.
    /// Example: {"Ta":[true,false,...],"Di":[false,true,...], ...}
    /// </summary>
    public string PatternData { get; set; } = "{}";

    public int SortOrder { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Lesson Lesson { get; set; } = null!;
}
