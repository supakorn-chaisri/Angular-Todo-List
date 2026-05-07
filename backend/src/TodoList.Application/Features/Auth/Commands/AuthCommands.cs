using MediatR;
using TodoList.Application.Common;
using TodoList.Application.Common.Exceptions;
using TodoList.Application.Common.Interfaces;
using TodoList.Application.Features.Auth.DTOs;
using TodoList.Domain.Entities;
using TodoList.Domain.Interfaces;

namespace TodoList.Application.Features.Auth.Commands;

// --- Register ---
public record RegisterCommand(string Email, string Password) : IRequest<ApiResponse<AuthResponse>>;

public class RegisterHandler : IRequestHandler<RegisterCommand, ApiResponse<AuthResponse>>
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;
    private readonly IRefreshTokenRepository _refreshTokens;

    public RegisterHandler(IUserRepository users, IPasswordHasher hasher, IJwtTokenService jwt, IRefreshTokenRepository refreshTokens)
    {
        _users = users; _hasher = hasher; _jwt = jwt; _refreshTokens = refreshTokens;
    }

    public async Task<ApiResponse<AuthResponse>> Handle(RegisterCommand req, CancellationToken ct)
    {
        if (await _users.ExistsByEmailAsync(req.Email, ct))
            throw new UnauthorizedException("Email already registered.");

        var user = new User { Email = req.Email.ToLower(), PasswordHash = _hasher.Hash(req.Password) };
        await _users.CreateAsync(user, ct);

        var accessToken = _jwt.GenerateAccessToken(user);
        var rawRefresh = _jwt.GenerateRefreshToken();
        await _refreshTokens.CreateAsync(new RefreshToken
        {
            UserId = user.Id,
            Token = rawRefresh,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7)
        }, ct);

        return ApiResponse<AuthResponse>.Ok(new AuthResponse(accessToken, rawRefresh, user.Email, user.Id), "Registered successfully.");
    }
}

// --- Login ---
public record LoginCommand(string Email, string Password) : IRequest<ApiResponse<AuthResponse>>;

public class LoginHandler : IRequestHandler<LoginCommand, ApiResponse<AuthResponse>>
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;
    private readonly IRefreshTokenRepository _refreshTokens;

    public LoginHandler(IUserRepository users, IPasswordHasher hasher, IJwtTokenService jwt, IRefreshTokenRepository refreshTokens)
    {
        _users = users; _hasher = hasher; _jwt = jwt; _refreshTokens = refreshTokens;
    }

    public async Task<ApiResponse<AuthResponse>> Handle(LoginCommand req, CancellationToken ct)
    {
        var user = await _users.GetByEmailAsync(req.Email.ToLower(), ct)
            ?? throw new UnauthorizedException("Invalid credentials.");

        if (!_hasher.Verify(req.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid credentials.");

        var accessToken = _jwt.GenerateAccessToken(user);
        var rawRefresh = _jwt.GenerateRefreshToken();
        await _refreshTokens.RevokeAllByUserAsync(user.Id, ct);
        await _refreshTokens.CreateAsync(new RefreshToken
        {
            UserId = user.Id,
            Token = rawRefresh,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7)
        }, ct);

        return ApiResponse<AuthResponse>.Ok(new AuthResponse(accessToken, rawRefresh, user.Email, user.Id), "Login successful.");
    }
}

// --- Refresh Token ---
public record RefreshTokenCommand(string RefreshToken) : IRequest<ApiResponse<AuthResponse>>;

public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, ApiResponse<AuthResponse>>
{
    private readonly IRefreshTokenRepository _refreshTokens;
    private readonly IUserRepository _users;
    private readonly IJwtTokenService _jwt;

    public RefreshTokenHandler(IRefreshTokenRepository refreshTokens, IUserRepository users, IJwtTokenService jwt)
    {
        _refreshTokens = refreshTokens; _users = users; _jwt = jwt;
    }

    public async Task<ApiResponse<AuthResponse>> Handle(RefreshTokenCommand req, CancellationToken ct)
    {
        var token = await _refreshTokens.GetByTokenAsync(req.RefreshToken, ct)
            ?? throw new UnauthorizedException("Invalid refresh token.");

        if (token.IsRevoked || token.ExpiresAt < DateTimeOffset.UtcNow)
            throw new UnauthorizedException("Refresh token expired or revoked.");

        var user = await _users.GetByIdAsync(token.UserId, ct)
            ?? throw new UnauthorizedException("User not found.");

        await _refreshTokens.RevokeAsync(token, ct);
        var newRefresh = _jwt.GenerateRefreshToken();
        await _refreshTokens.CreateAsync(new RefreshToken
        {
            UserId = user.Id,
            Token = newRefresh,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7)
        }, ct);

        return ApiResponse<AuthResponse>.Ok(new AuthResponse(_jwt.GenerateAccessToken(user), newRefresh, user.Email, user.Id));
    }
}
