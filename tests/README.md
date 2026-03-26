# Fracto API Tests

This directory contains comprehensive test coverage for the Fracto API backend.

## Project Structure

```text
Fracto.Api.Tests/
  Infrastructure/
    SqliteTestDbContextFactory.cs    Factory for in-memory SQLite test database
  Services/
    AuthServiceTests.cs              Tests for authentication logic
    DoctorServiceTests.cs            Tests for doctor management
    AppointmentServiceTests.cs       Tests for appointment booking
    RatingServiceTests.cs            Tests for ratings and reviews
    SpecializationServiceTests.cs   Tests for medical specializations
    UserServiceTests.cs              Tests for user management
    FileStorageServiceTests.cs       Tests for file handling
```

## Running Tests

### Run All Tests

```bash
cd tests
dotnet test
```

### Run Tests with Detailed Output

```bash
dotnet test --verbosity detailed
```

### Run Specific Test File

```bash
dotnet test --filter FullyQualifiedName~AuthServiceTests
```

### Run Tests with Code Coverage

```bash
dotnet test /p:CollectCoverageMetrics=true
```

## Test Infrastructure

### SqliteTestDbContextFactory

The test infrastructure uses an in-memory SQLite database to ensure:

- **Isolation**: Each test runs with a fresh database
- **Speed**: SQLite in-memory is significantly faster than SQL Server
- **Consistency**: Tests don't interfere with each other
- **Simplicity**: No external dependencies or setup required

### Example Test Structure

```csharp
[Fact]
public async Task RegisterAsync_CreatesUserAndRefreshToken()
{
    // Arrange
    await using var dbFactory = new SqliteTestDbContextFactory();
    await using var dbContext = await dbFactory.CreateDbContextAsync();
    var service = CreateAuthService(dbContext);

    // Act
    var session = await service.RegisterAsync(new RegisterRequestDto { ... });

    // Assert
    Assert.False(string.IsNullOrWhiteSpace(session.Auth.Token));
    Assert.Single(dbContext.Users);
}
```

## Test Coverage

The test suite covers critical functionality:

- ✅ User authentication (registration, login, refresh)
- ✅ Token refresh and rotation
- ✅ Doctor filtering and search
- ✅ Appointment booking and management
- ✅ User ratings and reviews
- ✅ File uploads and storage
- ✅ Authorization and permissions
- ✅ Error handling and validation

## Writing New Tests

### Guidelines

1. **Use descriptive names**: `[MethodName]_[Scenario]_[ExpectedResult]`
   - Example: `BookAppointmentAsync_WithConflictingSlot_ThrowsException`

2. **Follow AAA pattern**:
   - **Arrange**: Set up test data and services
   - **Act**: Execute the code under test
   - **Assert**: Verify the results

3. **One assertion focus**: Each test should verify one behavior

4. **Use factories**: Leverage `SqliteTestDbContextFactory` for database setup

5. **Clean database state**: Each test gets a fresh database via `using`

### Example Test

```csharp
[Fact]
public async Task BookAppointmentAsync_WithAvailableSlot_CreatesBooking()
{
    // Arrange
    await using var dbFactory = new SqliteTestDbContextFactory();
    await using var dbContext = await dbFactory.CreateDbContextAsync();
    
    var doctor = new Doctor { /* ... */ };
    await dbContext.Doctors.AddAsync(doctor);
    await dbContext.SaveChangesAsync();

    var service = CreateAppointmentService(dbContext);
    var bookingRequest = new BookAppointmentRequestDto { /* ... */ };

    // Act
    var result = await service.BookAsync(bookingRequest);

    // Assert
    Assert.NotNull(result.AppointmentId);
    Assert.Single(dbContext.Appointments);
}
```

## Continuous Integration

Tests are meant to be run in CI/CD pipelines before deployment. Ensure:

- ✅ All tests pass before merging
- ✅ No skipped tests (`[Fact(Skip = "...")]`) in production code
- ✅ Code coverage is adequate (aim for 80%+)
- ✅ Tests run on multiple environments

## Troubleshooting

### Tests Timeout

- Check for infinite loops or blocking calls
- Increase timeout in test configuration if needed
- Verify async operations complete properly

### Database Lock Errors

- Ensure proper disposal of `DbContext` using `using` or `await using`
- Check that tests aren't sharing database instances

### Entity Not Tracked

- Verify entities are added to DbContext before querying
- Ensure `SaveChangesAsync()` is called after modifications

## Best Practices

1. **Isolate tests**: Each test should be independently runnable
2. **Avoid test interdependencies**: Tests shouldn't rely on execution order
3. **Mock external services**: Don't call real APIs in unit tests
4. **Use factories**: Create services with consistent dependencies
5. **Test edge cases**: Empty results, null values, boundary conditions
6. **Document complex tests**: Add comments explaining non-obvious test logic

## References

- [xUnit.net Documentation](https://xunit.net/)
- [Entity Framework Core Testing](https://docs.microsoft.com/en-us/ef/core/testing/)
- [ASP.NET Core Unit Testing Best Practices](https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)
