using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models;

public class TodoItem
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(10)] // Stored as YYYY-MM-DD string
    public string? Date { get; set; }

    public bool Done { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string UserId { get; set; } = string.Empty;
}
