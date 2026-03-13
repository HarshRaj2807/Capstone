using Fracto.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Fracto.Api.Data;

public sealed class FractoDbContext(DbContextOptions<FractoDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Doctor> Doctors => Set<Doctor>();

    public DbSet<Specialization> Specializations => Set<Specialization>();

    public DbSet<Appointment> Appointments => Set<Appointment>();

    public DbSet<Rating> Ratings => Set<Rating>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.UserId);
            entity.HasIndex(user => user.Email).IsUnique();
            entity.Property(user => user.Role).HasConversion<string>().HasMaxLength(20);
        });

        modelBuilder.Entity<Specialization>(entity =>
        {
            entity.HasKey(specialization => specialization.SpecializationId);
            entity.HasIndex(specialization => specialization.SpecializationName).IsUnique();
        });

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasKey(doctor => doctor.DoctorId);
            entity.HasIndex(doctor => doctor.City);
            entity.HasIndex(doctor => doctor.SpecializationId);
            entity.HasIndex(doctor => new { doctor.City, doctor.SpecializationId, doctor.AverageRating });
            entity.Property(doctor => doctor.ConsultationFee).HasPrecision(10, 2);
            entity.Property(doctor => doctor.AverageRating).HasPrecision(3, 2);
            entity.HasOne(doctor => doctor.Specialization)
                .WithMany(specialization => specialization.Doctors)
                .HasForeignKey(doctor => doctor.SpecializationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(appointment => appointment.AppointmentId);
            entity.HasIndex(appointment => new { appointment.UserId, appointment.AppointmentDate });
            entity.HasIndex(appointment => new { appointment.DoctorId, appointment.AppointmentDate, appointment.TimeSlot })
                .IsUnique()
                .HasFilter("[Status] IN ('Booked', 'Confirmed', 'Completed')");
            entity.Property(appointment => appointment.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasOne(appointment => appointment.User)
                .WithMany(user => user.Appointments)
                .HasForeignKey(appointment => appointment.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(appointment => appointment.Doctor)
                .WithMany(doctor => doctor.Appointments)
                .HasForeignKey(appointment => appointment.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Rating>(entity =>
        {
            entity.HasKey(rating => rating.RatingId);
            entity.HasIndex(rating => rating.AppointmentId).IsUnique();
            entity.HasIndex(rating => new { rating.DoctorId, rating.CreatedAtUtc });
            entity.HasOne(rating => rating.Appointment)
                .WithOne(appointment => appointment.Rating)
                .HasForeignKey<Rating>(rating => rating.AppointmentId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(rating => rating.User)
                .WithMany(user => user.Ratings)
                .HasForeignKey(rating => rating.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(rating => rating.Doctor)
                .WithMany(doctor => doctor.Ratings)
                .HasForeignKey(rating => rating.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
