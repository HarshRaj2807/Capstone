namespace Fracto.Api.DTOs.Specializations;

public sealed class SpecializationResponseDto
{
    public int SpecializationId { get; set; }

    public string SpecializationName { get; set; } = string.Empty;

    public string? Description { get; set; }
}
