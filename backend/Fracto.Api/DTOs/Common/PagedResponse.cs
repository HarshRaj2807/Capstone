namespace Fracto.Api.DTOs.Common;

public sealed class PagedResponse<T>
{
    public int PageNumber { get; set; }

    public int PageSize { get; set; }

    public int TotalRecords { get; set; }

    public IReadOnlyCollection<T> Items { get; set; } = Array.Empty<T>();
}
