export interface Rating {
  ratingId: number;
  userName: string;
  ratingValue: number;
  reviewComment?: string | null;
  createdAtUtc: string;
}

export interface CreateRatingRequest {
  appointmentId: number;
  doctorId: number;
  ratingValue: number;
  reviewComment?: string | null;
}
