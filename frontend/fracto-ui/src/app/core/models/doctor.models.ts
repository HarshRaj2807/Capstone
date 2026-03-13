import { Rating } from './rating.models';

export interface Doctor {
  doctorId: number;
  fullName: string;
  specializationId: number;
  specializationName: string;
  city: string;
  experienceYears: number;
  consultationFee: number;
  averageRating: number;
  totalReviews: number;
  consultationStartTime: string;
  consultationEndTime: string;
  slotDurationMinutes: number;
  profileImagePath?: string | null;
  availableSlots: string[];
}

export interface Specialization {
  specializationId: number;
  specializationName: string;
  description?: string | null;
}

export interface DoctorFormValue {
  fullName: string;
  specializationId: number;
  city: string;
  experienceYears: number;
  consultationFee: number;
  consultationStartTime: string;
  consultationEndTime: string;
  slotDurationMinutes: number;
  profileImagePath?: string | null;
  isActive: boolean;
}

export interface DoctorRatingsResponse {
  doctorId: number;
  averageRating: number;
  totalReviews: number;
  items: Rating[];
}
