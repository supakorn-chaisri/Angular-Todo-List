using MediatR;
using TodoList.Application.Common;
using TodoList.Application.Common.Exceptions;
using TodoList.Application.Features.Categories.DTOs;
using TodoList.Domain.Entities;
using TodoList.Domain.Interfaces;

namespace TodoList.Application.Features.Categories.Commands;

// --- Get All ---
public record GetCategoriesQuery(Guid UserId) : IRequest<ApiResponse<IEnumerable<CategoryResponse>>>;

public class GetCategoriesHandler : IRequestHandler<GetCategoriesQuery, ApiResponse<IEnumerable<CategoryResponse>>>
{
    private readonly ICategoryRepository _repo;
    public GetCategoriesHandler(ICategoryRepository repo) => _repo = repo;

    public async Task<ApiResponse<IEnumerable<CategoryResponse>>> Handle(GetCategoriesQuery req, CancellationToken ct)
    {
        var cats = await _repo.GetAllByUserAsync(req.UserId, ct);
        var result = cats.Select(c => new CategoryResponse(c.Id, c.Name, c.ColorHex, c.CreatedAt));
        return ApiResponse<IEnumerable<CategoryResponse>>.Ok(result);
    }
}

// --- Create ---
public record CreateCategoryCommand(Guid UserId, string Name, string ColorHex) : IRequest<ApiResponse<CategoryResponse>>;

public class CreateCategoryHandler : IRequestHandler<CreateCategoryCommand, ApiResponse<CategoryResponse>>
{
    private readonly ICategoryRepository _repo;
    public CreateCategoryHandler(ICategoryRepository repo) => _repo = repo;

    public async Task<ApiResponse<CategoryResponse>> Handle(CreateCategoryCommand req, CancellationToken ct)
    {
        var cat = new Category { UserId = req.UserId, Name = req.Name, ColorHex = req.ColorHex };
        await _repo.CreateAsync(cat, ct);
        return ApiResponse<CategoryResponse>.Ok(new CategoryResponse(cat.Id, cat.Name, cat.ColorHex, cat.CreatedAt), "Category created.");
    }
}

// --- Update ---
public record UpdateCategoryCommand(Guid Id, Guid UserId, string Name, string ColorHex) : IRequest<ApiResponse<CategoryResponse>>;

public class UpdateCategoryHandler : IRequestHandler<UpdateCategoryCommand, ApiResponse<CategoryResponse>>
{
    private readonly ICategoryRepository _repo;
    public UpdateCategoryHandler(ICategoryRepository repo) => _repo = repo;

    public async Task<ApiResponse<CategoryResponse>> Handle(UpdateCategoryCommand req, CancellationToken ct)
    {
        var cat = await _repo.GetByIdAsync(req.Id, req.UserId, ct)
            ?? throw new NotFoundException(nameof(Category), req.Id);
        cat.Name = req.Name;
        cat.ColorHex = req.ColorHex;
        await _repo.UpdateAsync(cat, ct);
        return ApiResponse<CategoryResponse>.Ok(new CategoryResponse(cat.Id, cat.Name, cat.ColorHex, cat.CreatedAt), "Category updated.");
    }
}

// --- Delete ---
public record DeleteCategoryCommand(Guid Id, Guid UserId) : IRequest<ApiResponse<bool>>;

public class DeleteCategoryHandler : IRequestHandler<DeleteCategoryCommand, ApiResponse<bool>>
{
    private readonly ICategoryRepository _repo;
    public DeleteCategoryHandler(ICategoryRepository repo) => _repo = repo;

    public async Task<ApiResponse<bool>> Handle(DeleteCategoryCommand req, CancellationToken ct)
    {
        var cat = await _repo.GetByIdAsync(req.Id, req.UserId, ct)
            ?? throw new NotFoundException(nameof(Category), req.Id);
        await _repo.DeleteAsync(cat, ct);
        return ApiResponse<bool>.Ok(true, "Category deleted.");
    }
}
