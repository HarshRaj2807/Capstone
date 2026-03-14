const API_BASE = 'http://localhost:5104/api';

const commentsPool = [
    "Great experience, very professional.",
    "The doctor listened carefully to my concerns.",
    "Highly recommended for their expertise.",
    "Wait time was minimal, and the staff was friendly.",
    "Clear explanation of the diagnosis and treatment.",
    "Very attentive and knowledgeable.",
    "Excellent consultation, felt very comfortable.",
    "Thorough examination and good follow-up advice.",
    "The clinic environment was very clean and well-maintained.",
    "Compassionate care and effective treatment plan.",
    "Helpful and patient with all my questions.",
    "Very satisfied with the visit and the doctor's approach.",
    "A very skilled and polite doctor.",
    "Got relief after the first visit itself. Very happy.",
    "Highly recommended for specialization. Truly an expert."
];

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
        throw new Error(`HTTP ${res.status} ${url}: ${text}`);
    }
    return res.json();
}

async function bulkSeed() {
  try {
    console.log('--- Logging in as Admin ---');
    const adminLogin = await request(`${API_BASE}/Auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@fracto.com', password: 'Admin@123' })
    });
    const adminToken = adminLogin.token;
    console.log('Admin logged in.');

    const patientPool = [];
    console.log('--- Registering Test Patients ---');
    for (let i = 1; i <= 3; i++) {
        const email = `patient${i}_${Date.now()}@test.com`;
        const res = await request(`${API_BASE}/Auth/register`, {
            method: 'POST',
            body: JSON.stringify({
                firstName: 'Test',
                lastName: `Patient ${i}`,
                email: email,
                password: 'Password@123',
                city: 'Bengaluru'
            })
        });
        patientPool.push({ email, token: res.token });
        console.log(`Registered: ${email}`);
    }

    console.log('--- Fetching All Doctors ---');
    const doctorsRes = await request(`${API_BASE}/Doctors?pageSize=100`);
    const doctors = doctorsRes.items;
    console.log(`Found ${doctors.length} doctors.`);

    for (const doc of doctors) {
        console.log(`\nProcessing: ${doc.fullName} (ID: ${doc.doctorId})`);
        
        // Target 25 reviews per doctor (minus current if any)
        const reviewsNeeded = Math.max(0, 25 - doc.totalReviews);
        console.log(`Generating ${reviewsNeeded} new reviews...`);

        for (let j = 0; j < reviewsNeeded; j++) {
            const patient = patientPool[Math.floor(Math.random() * patientPool.length)];
            
            // Generate a date in the past to avoid cluttering future slots, 
            // but the backend might check for past dates during booking.
            // Let's use future dates or today but different offsets.
            const date = new Date();
            date.setDate(date.getDate() + (j % 5) + 1); // 1-5 days in future
            const dateString = date.toISOString().split('T')[0];
            
            // Vary time slot
            const hour = 9 + (j % 4);
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;

            try {
                // 1. Book
                const booking = await request(`${API_BASE}/Appointments/book`, {
                    method: 'POST',
                    body: JSON.stringify({
                        doctorId: doc.doctorId,
                        appointmentDate: dateString,
                        timeSlot: timeSlot,
                        reasonForVisit: 'General checkup'
                    }),
                    headers: { Authorization: `Bearer ${patient.token}` }
                });

                const apptId = booking.appointment.appointmentId;

                // 2. Complete (Admin)
                await request(`${API_BASE}/Appointments/${apptId}/status`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: 'Completed' }),
                    headers: { Authorization: `Bearer ${adminToken}` }
                });

                // 3. Rate
                const ratingValue = 4 + (Math.random() > 0.7 ? 1 : 0); // 70% 4, 30% 5
                const comment = commentsPool[Math.floor(Math.random() * commentsPool.length)];
                
                await request(`${API_BASE}/Ratings`, {
                    method: 'POST',
                    body: JSON.stringify({
                        appointmentId: apptId,
                        doctorId: doc.doctorId,
                        ratingValue: ratingValue,
                        reviewComment: comment
                    }),
                    headers: { Authorization: `Bearer ${patient.token}` }
                });

                if ((j + 1) % 5 === 0) process.stdout.write('.');
            } catch (innerErr) {
                // If slot is taken or other error, just skip
                continue;
            }
        }
        console.log(`\nFinished ${doc.fullName}`);
    }

    console.log('\n--- ALL BULK RATINGS COMPLETED ---');
  } catch (err) {
    console.error('Fatal Error during bulk seeding:', err.message);
  }
}

bulkSeed();
