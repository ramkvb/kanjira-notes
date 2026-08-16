using Microsoft.EntityFrameworkCore;
using KanjiraNotes.Models;

namespace KanjiraNotes.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<DrumPattern> DrumPatterns => Set<DrumPattern>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Lesson>(entity =>
        {
            entity.HasIndex(e => e.CreatedAt);
            entity.HasMany(e => e.Patterns)
                  .WithOne(p => p.Lesson)
                  .HasForeignKey(p => p.LessonId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DrumPattern>(entity =>
        {
            entity.HasIndex(e => e.LessonId);
        });
    }
}
