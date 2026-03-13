export interface Appointment {
  appointmentId: number;
  userId: number;
  userName: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  timeSlot: string;
  status: 'Booked' | 'Confirmed' | 'Completed' | 'Cancelled';
  reasonForVisit?: string | null;
  cancellationReason?: string | null;
  canRate: boolean;
}

export interface BookAppointmentRequest {
  doctorId: number;
  appointmentDate: string;
  timeSlot: string;
  reasonForVisit?: string | null;
}

export interface UpdateAppointmentStatusRequest {
  status: string;
  cancellationReason?: string | null;
}
