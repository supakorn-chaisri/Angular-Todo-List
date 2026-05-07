using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoList.Application.Features.Todos.Commands;
using TodoList.Application.Features.Todos.DTOs;
using TodoList.Domain.Enums;

namespace TodoList.WebAPI.Controllers;

[ApiController]
[Route("api/v1/todos")]
[Authorize]
public class TodosController : ControllerBase
{
    private readonly IMediator _mediator;
    public TodosController(IMediator mediator) => _mediator = mediator;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? category,
        [FromQuery] Priority? priority,
        [FromQuery] bool? isCompleted,
        [FromQuery] string? search,
        CancellationToken ct)
        => Ok(await _mediator.Send(new GetTodosQuery(UserId, category, priority, isCompleted, search), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetTodoByIdQuery(id, UserId), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTodoRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(
            new CreateTodoCommand(UserId, req.Title, req.Description, req.Priority, req.DueDate, req.CategoryId), ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTodoRequest req, CancellationToken ct)
        => Ok(await _mediator.Send(
            new UpdateTodoCommand(id, UserId, req.Title, req.Description, req.Priority, req.DueDate, req.CategoryId), ct));

    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new ToggleTodoCommand(id, UserId), ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new DeleteTodoCommand(id, UserId), ct));
}
