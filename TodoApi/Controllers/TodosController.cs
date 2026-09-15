using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;

namespace TodoApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TodosController : ControllerBase
{
    private readonly AppDbContext _db;

    public TodosController(AppDbContext db) => _db = db;

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    // GET /api/todos
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var todos = await _db.Todos
            .Where(t => t.UserId == UserId)
            .OrderBy(t => t.CreatedAt)
            .ToListAsync();
        return Ok(todos);
    }

    // POST /api/todos
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TodoItem item)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        item.Id = Guid.NewGuid().ToString();
        item.UserId = UserId;
        item.CreatedAt = DateTime.UtcNow;

        _db.Todos.Add(item);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = item.Id }, item);
    }

    // PUT /api/todos/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] TodoItem item)
    {
        var existing = await _db.Todos.FirstOrDefaultAsync(t => t.Id == id && t.UserId == UserId);
        if (existing == null) return NotFound();

        existing.Title = item.Title;
        existing.Description = item.Description;
        existing.Date = item.Date;
        existing.Done = item.Done;

        await _db.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE /api/todos/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await _db.Todos.FirstOrDefaultAsync(t => t.Id == id && t.UserId == UserId);
        if (existing == null) return NotFound();

        _db.Todos.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
