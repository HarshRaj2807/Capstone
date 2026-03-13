using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.Entities;

public sealed class Specialization
{
    public int SpecializationId { get; set; }

    [MaxLength(150)]
    public string SpecializationName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}
