import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DoctorService } from '../../core/services/doctor.service';
import { Doctor, DoctorRatingsResponse } from '../../core/models/doctor.models';

@Component({
  selector: 'app-doctor-reviews-page',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div class="header-left">
          <a routerLink="/doctors" class="back-link"><- Back to Doctors</a>
          <p class="eyebrow">Patient Feedback</p>
          <h1>Reviews for {{ doctorName() }}</h1>
        </div>

        @if (ratings(); as data) {
          <div class="stats-card">
            <div class="stat-item">
              <span class="stat-value">{{ data.averageRating | number: '1.1-1' }}</span>
              <span class="stat-label">Average Rating</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ data.totalReviews }}</span>
              <span class="stat-label">Total Reviews</span>
            </div>
          </div>
        }
      </header>

      @if (errorMessage()) {
        <div class="feedback error">{{ errorMessage() }}</div>
      }

      <div class="reviews-stack">
        @if (loading()) {
          <div class="loading-state">Loading reviews...</div>
        } @else if (ratings()?.items?.length === 0) {
          <article class="empty-state">
            <h3>No reviews yet.</h3>
            <p>Be the first to rate your experience after your consultation.</p>
          </article>
        } @else {
          @for (review of ratings()?.items; track review.ratingId) {
            <article class="review-card">
              <div class="review-header">
                <div class="reviewer-info">
                  <div class="avatar">{{ review.userName.charAt(0) }}</div>
                  <div>
                    <h3>{{ review.userName }}</h3>
                    <p class="date">{{ review.createdAtUtc | date: 'longDate' }}</p>
                  </div>
                </div>
                <div class="rating-badge">{{ review.ratingValue }} *</div>
              </div>
              <p class="comment">{{ review.reviewComment || 'No comment provided.' }}</p>
            </article>
          }
        }
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .page-shell { display: grid; gap: 1.5rem; }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      gap: 2rem;
      align-items: center;
      padding: 2rem 2.5rem;
      border-radius: 2rem;
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
    }

    .back-link {
      display: inline-block;
      margin-bottom: 1rem;
      color: #0066cc;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      transition: transform 0.2s ease;
    }
    .back-link:hover { transform: translateX(-4px); }

    .eyebrow { margin: 0 0 0.5rem; text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.76rem; color: #86868b; font-weight: 600; }
    h1 { margin: 0; font-size: 2.2rem; font-weight: 700; color: #1d1d1f; letter-spacing: -0.02em; }

    .stats-card {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 1rem 2rem;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 1.5rem;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    .stat-item { display: flex; flex-direction: column; align-items: center; }
    .stat-value { font-size: 1.8rem; font-weight: 700; color: #1d1d1f; }
    .stat-label { font-size: 0.8rem; color: #86868b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    .stat-divider { width: 1px; height: 2.5rem; background: rgba(0, 0, 0, 0.1); }

    .reviews-stack { display: grid; gap: 1.25rem; }
    
    .review-card {
      padding: 1.75rem;
      border-radius: 1.75rem;
      border: 1px solid rgba(0, 0, 0, 0.08);
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(24px) saturate(180%);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .review-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06); }

    .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .reviewer-info { display: flex; gap: 1rem; align-items: center; }
    .avatar {
      width: 3.2rem;
      height: 3.2rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #0066cc, #54aaff);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
    }
    .reviewer-info h3 { margin: 0; font-size: 1.1rem; font-weight: 600; color: #1d1d1f; }
    .date { margin: 0.1rem 0 0; font-size: 0.9rem; color: #86868b; }
    
    .rating-badge {
      padding: 0.4rem 0.8rem;
      background: #f5f5f7;
      border-radius: 999px;
      font-weight: 700;
      color: #1d1d1f;
      font-size: 0.95rem;
    }

    .comment {
      margin: 0;
      line-height: 1.6;
      color: #424245;
      font-size: 1.05rem;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem;
      border-radius: 2rem;
      background: rgba(255, 255, 255, 0.45);
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    @media (max-width: 860px) {
      .page-header { flex-direction: column; align-items: flex-start; padding: 1.5rem; }
      .stats-card { width: 100%; justify-content: space-around; }
    }
  `]
})
export class DoctorReviewsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly doctorService = inject(DoctorService);

  readonly ratings = signal<DoctorRatingsResponse | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly doctorName = signal('Doctor');

  ngOnInit(): void {
    const doctorId = Number(this.route.snapshot.paramMap.get('id'));
    if (!doctorId) {
      this.errorMessage.set('Invalid doctor identifier.');
      this.loading.set(false);
      return;
    }

    this.loadReviews(doctorId);
  }

  private loadReviews(doctorId: number): void {
    this.doctorService.fetchRatingsByDoctorId(doctorId).subscribe({
      next: (response: DoctorRatingsResponse) => {
        this.ratings.set(response);
        this.fetchDoctorName(doctorId);
        this.loading.set(false);
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message ?? 'Unable to load reviews.');
        this.loading.set(false);
      }
    });
  }

  private fetchDoctorName(doctorId: number): void {
    this.doctorService.fetchSingleDoctorDetails(doctorId).subscribe({
      next: (doc: Doctor) => this.doctorName.set(doc.fullName),
      error: () => {} // Fallback to "Doctor"
    });
  }
}




