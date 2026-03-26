using System.Text;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Implementations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;

namespace Fracto.Api.Tests.Services;

using ApiValidationException = Fracto.Api.Helpers.ValidationException;

public sealed class FileStorageServiceTests
{
    [Fact]
    public async Task SaveImageAsync_SavesFileAndReturnsRelativePath()
    {
        var root = CreateTempRoot();
        try
        {
            var environment = new TestEnvironment(root);
            var service = new FileStorageService(environment);
            await using var stream = new MemoryStream(Encoding.UTF8.GetBytes("image"));
            var file = new FormFile(stream, 0, stream.Length, "file", "profile.png");

            var path = await service.SaveImageAsync(file, "profiles");

            Assert.StartsWith("/uploads/profiles/", path);

            var localPath = Path.Combine(environment.WebRootPath!, path.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            Assert.True(File.Exists(localPath));
        }
        finally
        {
            Directory.Delete(root, true);
        }
    }

    [Fact]
    public async Task SaveImageAsync_RejectsUnsupportedExtensions()
    {
        var root = CreateTempRoot();
        try
        {
            var environment = new TestEnvironment(root);
            var service = new FileStorageService(environment);
            await using var stream = new MemoryStream(new byte[] { 1, 2, 3 });
            var file = new FormFile(stream, 0, stream.Length, "file", "document.txt");

            var exception = await Assert.ThrowsAsync<ApiValidationException>(() => service.SaveImageAsync(file, "profiles"));

            Assert.Equal("Only JPG, JPEG, PNG, and WEBP images are allowed.", exception.Message);
        }
        finally
        {
            Directory.Delete(root, true);
        }
    }

    [Fact]
    public async Task SaveImageAsync_RejectsOversizedFiles()
    {
        var root = CreateTempRoot();
        try
        {
            var environment = new TestEnvironment(root);
            var service = new FileStorageService(environment);
            var bigBuffer = new byte[6 * 1024 * 1024];
            await using var stream = new MemoryStream(bigBuffer);
            var file = new FormFile(stream, 0, stream.Length, "file", "large.jpg");

            var exception = await Assert.ThrowsAsync<ApiValidationException>(() => service.SaveImageAsync(file, "profiles"));

            Assert.Equal("Image size must be 5 MB or less.", exception.Message);
        }
        finally
        {
            Directory.Delete(root, true);
        }
    }

    private static string CreateTempRoot()
    {
        var root = Path.Combine(Path.GetTempPath(), "fracto-tests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);
        Directory.CreateDirectory(Path.Combine(root, "wwwroot"));
        return root;
    }

    private sealed class TestEnvironment : IWebHostEnvironment
    {
        public TestEnvironment(string contentRoot)
        {
            ContentRootPath = contentRoot;
            WebRootPath = Path.Combine(contentRoot, "wwwroot");
        }

        public string ApplicationName { get; set; } = "Fracto.Tests";
        public IFileProvider WebRootFileProvider { get; set; } = new Microsoft.Extensions.FileProviders.NullFileProvider();
        public string WebRootPath { get; set; }
        public string EnvironmentName { get; set; } = "Development";
        public string ContentRootPath { get; set; }
        public IFileProvider ContentRootFileProvider { get; set; } =
            new Microsoft.Extensions.FileProviders.NullFileProvider();
    }
}
