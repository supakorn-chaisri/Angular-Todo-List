FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/TodoList.WebAPI/TodoList.WebAPI.csproj", "src/TodoList.WebAPI/"]
COPY ["src/TodoList.Application/TodoList.Application.csproj", "src/TodoList.Application/"]
COPY ["src/TodoList.Infrastructure/TodoList.Infrastructure.csproj", "src/TodoList.Infrastructure/"]
COPY ["src/TodoList.Domain/TodoList.Domain.csproj", "src/TodoList.Domain/"]
RUN dotnet restore "src/TodoList.WebAPI/TodoList.WebAPI.csproj"
COPY . .
WORKDIR "/src/src/TodoList.WebAPI"
RUN dotnet build "TodoList.WebAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TodoList.WebAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TodoList.WebAPI.dll"]
