using FluentAssertions;
using TodoList.Domain.Entities;
using TodoList.Domain.Enums;
using Xunit;

namespace TodoList.UnitTests;

public class TodoTests
{
    [Fact]
    public void Todo_ShouldBeCreated_WithDefaultValues()
    {
        // Arrange
        var title = "Test Todo";

        // Act
        var todo = new Todo
        {
            Title = title,
            Priority = Priority.Medium
        };

        // Assert
        todo.Title.Should().Be(title);
        todo.Priority.Should().Be(Priority.Medium);
        todo.IsCompleted.Should().BeFalse();
    }
}
