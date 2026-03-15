const API_BASE = 'http://localhost:5104/api';

async function request(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json();
}

async function seed() {
  try {
    console.log('--- Logging in as Admin ---');
    const adminLogin = await request(`${API_BASE}/Auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@fracto.com', password: 'Admin@123' })
    });
    const adminToken = adminLogin.token;
    console.log('Admin logged in.');

    const doctorsData = [
      { fullName: 'Dr. Alice Smith', specializationId: 1, city: 'Bengaluru', experienceYears: 10, consultationFee: 500, consultationStartTime: '09:00', consultationEndTime: '17:00', slotDurationMinutes: 30 },
      { fullName: 'Dr. Bob Johnson', specializationId: 2, city: 'Mumbai', experienceYears: 8, consultationFee: 600, consultationStartTime: '10:00', consultationEndTime: '18:00', slotDurationMinutes: 30 },
      { fullName: 'Dr. Charlie Brown', specializationId: 3, city: 'Delhi', experienceYears: 15, consultationFee: 800, consultationStartTime: '08:00', consultationEndTime: '16:00', slotDurationMinutes: 30 },
      { fullName: 'Dr. Diana Prince', specializationId: 4, city: 'Pune', experienceYears: 5, consultationFee: 400, consultationStartTime: '11:00', consultationEndTime: '19:00', slotDurationMinutes: 30 },
      { fullName: 'Dr. Edward Norton', specializationId: 5, city: 'Chennai', experienceYears: 12, consultationFee: 700, consultationStartTime: '09:00', consultationEndTime: '17:00', slotDurationMinutes: 30 }
    ];

    const doctorIds = [];
    console.log('--- Creating Doctors ---');
    for (const doc of doctorsData) {
      const res = await request(`${API_BASE}/Doctors`, {
          method: 'POST',
          body: JSON.stringify(doc),
          headers: { Authorization: `Bearer ${adminToken}` }
      });
      doctorIds.push(res.doctorId);
      console.log(`Created Doctor: ${doc.fullName} (ID: ${res.doctorId})`);
    }

    console.log('--- Logging in as User ---');
    const userLogin = await request(`${API_BASE}/Auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: 'user@fracto.com', password: 'User@123' })
    });
    const userToken = userLogin.token;
    console.log('User logged in.');

    const appointmentIds = [];
    console.log('--- Booking Appointments ---');
    const today = new Date().toISOString().split('T')[0];
    for (const doctorId of doctorIds) {
      const res = await request(`${API_BASE}/Appointments/book`, {
          method: 'POST',
          body: JSON.stringify({
              doctorId,
              appointmentDate: today,
              timeSlot: '11:00',
              reasonForVisit: 'General checkup'
          }),
          headers: { Authorization: `Bearer ${userToken}` }
      });
      appointmentIds.push(res.appointment.appointmentId);
      console.log(`Booked Appointment for Doctor ID ${doctorId} (Appt ID: ${res.appointment.appointmentId})`);
    }

    console.log('--- Completing Appointments (as Admin) ---');
    for (const apptId of appointmentIds) {
      await request(`${API_BASE}/Appointments/${apptId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'Completed' }),
          headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`Completed Appointment ID: ${apptId}`);
    }

    console.log('--- Submitting Ratings ---');
    for (let i = 0; i < appointmentIds.length; i++) {
        const ratingValue = 4 + (i % 2); // alternating 4 and 5
      await request(`${API_BASE}/Ratings`, {
          method: 'POST',
          body: JSON.stringify({
              appointmentId: appointmentIds[i],
              doctorId: doctorIds[i],
              ratingValue: ratingValue,
              reviewComment: 'Excellent service and very professional.'
          }),
          headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log(`Submitted ${ratingValue}-star rating for Doctor ID ${doctorIds[i]}`);
    }

    console.log('--- ALL TASKS COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Error during seeding:', err.message);
  }
}

seed();
