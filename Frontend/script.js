const API_BASE_URL = 'http://127.0.0.1:8000';

// Global toast notifier
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Session Helpers
function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('user');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Render Uniform Navbar
document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    
    // Page routing triggers
    const path = window.location.pathname;
    const page = path.split("/").pop();

    if (page === 'index.html' || page === '') {
        initHomePage();
    } else if (page === 'login.html') {
        initLoginPage();
    } else if (page === 'register.html') {
        initRegisterPage();
    } else if (page === 'trains.html') {
        initTrainsPage();
    } else if (page === 'train_details.html') {
        initTrainDetailsPage();
    } else if (page === 'booking.html') {
        initBookingPage();
    } else if (page === 'payment.html') {
        initPaymentPage();
    } else if (page === 'booking_history.html') {
        initBookingHistoryPage();
    } else if (page === 'passenger_dashboard.html') {
        initPassengerDashboardPage();
    } else if (page === 'admin_dashboard.html') {
        initAdminDashboardPage();
    }
});

function setupNavbar() {
    const header = document.querySelector('header');
    if (!header) return;

    const user = getUser();
    let menuHTML = `
        <li><a href="index.html" class="${isActivePage('index.html')}">Home</a></li>
        <li><a href="trains.html" class="${isActivePage('trains.html')}">Search Trains</a></li>
    `;

    if (user) {
        if (user.role === 'admin') {
            menuHTML += `
                <li><a href="admin_dashboard.html" class="${isActivePage('admin_dashboard.html')}">Admin Dashboard</a></li>
                <li><a href="#" onclick="logout()" class="nav-btn">Logout</a></li>
            `;
        } else {
            menuHTML += `
                <li><a href="passenger_dashboard.html" class="${isActivePage('passenger_dashboard.html')}">Dashboard</a></li>
                <li><a href="booking_history.html" class="${isActivePage('booking_history.html')}">My Bookings</a></li>
                <li><a href="#" onclick="logout()" class="nav-btn">Logout</a></li>
            `;
        }
    } else {
        menuHTML += `
            <li><a href="login.html" class="${isActivePage('login.html')}">Login</a></li>
            <li><a href="register.html" class="nav-btn">Register</a></li>
        `;
    }

    header.innerHTML = `
        <div class="nav-container">
            <a href="index.html" class="logo-link">
                <span class="logo-text">🚄 RailVibe</span>
            </a>
            <ul class="nav-menu">
                ${menuHTML}
            </ul>
        </div>
    `;
}

function isActivePage(filename) {
    return window.location.pathname.endsWith(filename) ? 'active' : '';
}

// ----------------- HOME PAGE CODE -----------------
function initHomePage() {
    const searchForm = document.getElementById('home-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const source = document.getElementById('source').value.trim();
            const destination = document.getElementById('destination').value.trim();
            const date = document.getElementById('journey_date').value;

            if (!source || !destination || !date) {
                showToast('Please fill in all search details', 'danger');
                return;
            }

            sessionStorage.setItem('search_source', source);
            sessionStorage.setItem('search_destination', destination);
            sessionStorage.setItem('search_date', date);

            window.location.href = 'trains.html';
        });
    }
}

// ----------------- LOGIN PAGE CODE -----------------
function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const role = document.getElementById('role').value;
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (role === 'admin') {
            if (email === 'admin@railway.com' && password === 'admin123') {
                setUser({ role: 'admin', full_name: 'System Admin', email: email });
                showToast('Admin Logged in successfully!', 'success');
                setTimeout(() => window.location.href = 'admin_dashboard.html', 1000);
            } else {
                showToast('Invalid Admin Credentials!', 'danger');
            }
        } else {
            try {
                const response = await fetch(`${API_BASE_URL}/passengers/`);
                const passengers = await response.json();
                const passenger = passengers.find(p => p.email === email && p.password === password);

                if (passenger) {
                    setUser({ ...passenger, role: 'passenger' });
                    showToast(`Welcome back, ${passenger.full_name}!`, 'success');
                    setTimeout(() => window.location.href = 'passenger_dashboard.html', 1000);
                } else {
                    showToast('Invalid email or password!', 'danger');
                }
            } catch (err) {
                console.error(err);
                showToast('Unable to reach server. Try checking backend is running.', 'danger');
            }
        }
    });
}

// ----------------- REGISTER PAGE CODE -----------------
function initRegisterPage() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const full_name = document.getElementById('full_name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const gender = document.getElementById('gender').value;
        const age = document.getElementById('age').value;
        const address = document.getElementById('address').value.trim();
        const password = document.getElementById('password').value.trim();

        const payload = { full_name, email, phone, gender, age: parseInt(age), address, password };

        try {
            const response = await fetch(`${API_BASE_URL}/passengers/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (response.ok) {
                showToast('Registration successful! Please login.', 'success');
                setTimeout(() => window.location.href = 'login.html', 1500);
            } else {
                showToast(result.error || 'Registration failed', 'danger');
            }
        } catch (err) {
            console.error(err);
            showToast('Connection to Backend server failed.', 'danger');
        }
    });
}

// ----------------- TRAIN SEARCH RESULTS PAGE CODE -----------------
async function initTrainsPage() {
    // Populate form with search details from index if present
    const srcInput = document.getElementById('source-input');
    const destInput = document.getElementById('dest-input');
    const dateInput = document.getElementById('date-input');

    if (srcInput && destInput && dateInput) {
        srcInput.value = sessionStorage.getItem('search_source') || '';
        destInput.value = sessionStorage.getItem('search_destination') || '';
        dateInput.value = sessionStorage.getItem('search_date') || '';
    }

    const triggerSearch = async () => {
        const source = srcInput.value.trim();
        const destination = destInput.value.trim();
        const date = dateInput.value;

        if (!source || !destination) {
            showToast('Please specify Source and Destination', 'warning');
            return;
        }

        const trainListDiv = document.getElementById('trains-list-results');
        trainListDiv.innerHTML = '<div style="text-align:center; padding: 2rem;">Searching trains...</div>';

        try {
            // Fetch Schedules
            const schRes = await fetch(`${API_BASE_URL}/schedules/`);
            const schedules = await schRes.json();

            // Fetch all trains to know available seats
            const trainRes = await fetch(`${API_BASE_URL}/trains/`);
            const allTrains = await trainRes.json();

            // Fetch Bookings to subtract occupied seats
            const bookRes = await fetch(`${API_BASE_URL}/bookings/`);
            const bookings = await bookRes.json();

            // Filter schedules matching source & destination
            const matchedSchedules = schedules.filter(s => 
                s.source.toLowerCase() === source.toLowerCase() && 
                s.destination.toLowerCase() === destination.toLowerCase()
            );

            if (matchedSchedules.length === 0) {
                trainListDiv.innerHTML = `
                    <div class="glass-card" style="text-align:center; padding: 3rem;">
                        <h3>No Trains Found</h3>
                        <p style="color:var(--text-secondary); margin-top:0.5rem;">There are no routes matching "${source}" to "${destination}".</p>
                    </div>
                `;
                return;
            }

            trainListDiv.innerHTML = '';
            matchedSchedules.forEach(schedule => {
                // Find matching train details
                const train = allTrains.find(t => t.train_name === schedule.train_name) || {
                    total_seats: 100,
                    train_number: 'N/A',
                    train_type: 'Express'
                };

                // Compute occupancy
                const occupiedCount = bookings.filter(b => 
                    b.train_name === schedule.train_name && 
                    b.journey_date === date && 
                    b.booking_status !== 'Cancelled'
                ).length;
                const remainingSeats = Math.max(0, train.total_seats - occupiedCount);

                let trainImg = 'images/vande_bharat.png';
                if (train.train_type === 'Rajdhani') {
                    trainImg = 'images/rajdhani.png';
                } else if (train.train_type === 'Shatabdi') {
                    trainImg = 'images/shatabdi.png';
                }

                const card = document.createElement('div');
                card.className = 'glass-card train-card';
                
                card.innerHTML = `
                    <div class="train-card-image" style="background: url('${trainImg}') no-repeat center center; background-size: cover;"></div>
                    <div class="train-card-info">
                        <div class="train-card-header">
                            <div class="train-title-sec">
                                <h3 class="train-name-tag">${schedule.train_name}</h3>
                                <div class="train-meta">
                                    <span>#${train.train_number}</span>
                                    <span>${train.train_type}</span>
                                </div>
                            </div>
                            <div style="text-align:right;">
                                <span class="route-badge">${train.train_type}</span>
                            </div>
                        </div>
                        
                        <div class="train-timeline">
                            <div class="timeline-station">
                                <h4>${schedule.departure_time}</h4>
                                <p>${schedule.source}</p>
                                <span style="font-size:0.8rem; color:var(--text-secondary);">${schedule.departure_date}</span>
                            </div>
                            <div class="timeline-path">
                                <span class="timeline-duration">Direct</span>
                                <div class="timeline-line"></div>
                                <span class="timeline-duration">Fare: ₹${schedule.fare}</span>
                            </div>
                            <div class="timeline-station">
                                <h4>${schedule.arrival_time}</h4>
                                <p>${schedule.destination}</p>
                                <span style="font-size:0.8rem; color:var(--text-secondary);">${schedule.arrival_date}</span>
                            </div>
                        </div>
                        
                        <div class="coaches-availability">
                            <div class="coach-box">
                                <h5>Sleeper</h5>
                                <span class="seats-left">${Math.max(1, Math.round(remainingSeats * 0.4))} left</span>
                                <div class="fare-amt">₹${schedule.fare}</div>
                            </div>
                            <div class="coach-box">
                                <h5>AC 3 Tier</h5>
                                <span class="seats-left">${Math.max(1, Math.round(remainingSeats * 0.25))} left</span>
                                <div class="fare-amt">₹${Math.round(schedule.fare * 1.8)}</div>
                            </div>
                            <div class="coach-box">
                                <h5>AC 2 Tier</h5>
                                <span class="seats-left">${Math.max(1, Math.round(remainingSeats * 0.2))} left</span>
                                <div class="fare-amt">₹${Math.round(schedule.fare * 2.5)}</div>
                            </div>
                            <div class="coach-box">
                                <h5>AC First Class</h5>
                                <span class="seats-left">${Math.max(1, Math.round(remainingSeats * 0.1))} left</span>
                                <div class="fare-amt">₹${Math.round(schedule.fare * 3.5)}</div>
                            </div>
                        </div>
                        
                        <div class="train-card-footer">
                            <button class="btn btn-primary" onclick="selectTrainForBooking(${JSON.stringify(schedule).replace(/"/g, '&quot;')}, '${date}')">Book Ticket</button>
                        </div>
                    </div>
                `;
                trainListDiv.appendChild(card);
            });
        } catch (err) {
            console.error(err);
            trainListDiv.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--danger);">Failed to query timetables. Check backend status.</div>';
        }
    };

    const searchBtn = document.getElementById('search-trains-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', triggerSearch);
    }

    // Auto-search if we have criteria
    if (sessionStorage.getItem('search_source')) {
        triggerSearch();
    }
}

window.selectTrainForBooking = function(schedule, journeyDate) {
    const user = getUser();
    if (!user) {
        showToast('Please login to book a ticket', 'danger');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    // Store selected schedule and date in sessionStorage
    sessionStorage.setItem('selected_schedule', JSON.stringify(schedule));
    sessionStorage.setItem('journey_date', journeyDate || schedule.departure_date);
    window.location.href = 'train_details.html';
};

// ----------------- TRAIN DETAILS PAGE CODE -----------------
function initTrainDetailsPage() {
    const detailData = sessionStorage.getItem('selected_schedule');
    if (!detailData) {
        showToast('No train selected', 'danger');
        setTimeout(() => window.location.href = 'trains.html', 1000);
        return;
    }

    const schedule = JSON.parse(detailData);
    const date = sessionStorage.getItem('journey_date');

    document.getElementById('train-name').innerText = schedule.train_name;
    document.getElementById('train-route').innerText = `${schedule.source} ➔ ${schedule.destination}`;
    document.getElementById('train-dep').innerText = `${schedule.departure_date} at ${schedule.departure_time}`;
    document.getElementById('train-arr').innerText = `${schedule.arrival_date} at ${schedule.arrival_time}`;
    
    // Set up coach selectors and show fare details
    const coachElements = document.querySelectorAll('.coach-box');
    let selectedCoach = 'Sleeper';
    let currentFare = schedule.fare;

    const updateFareDisplay = () => {
        document.getElementById('summary-coach').innerText = selectedCoach;
        document.getElementById('summary-fare').innerText = `₹${currentFare}`;
    };

    updateFareDisplay();

    coachElements.forEach(box => {
        box.addEventListener('click', () => {
            coachElements.forEach(b => b.classList.remove('selected'));
            box.classList.add('selected');
            selectedCoach = box.getAttribute('data-coach');
            const multiplier = parseFloat(box.getAttribute('data-mult') || '1.0');
            currentFare = Math.round(schedule.fare * multiplier);
            updateFareDisplay();
        });
    });

    const bookBtn = document.getElementById('proceed-to-booking-btn');
    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            sessionStorage.setItem('booking_coach', selectedCoach);
            sessionStorage.setItem('booking_fare', currentFare);
            window.location.href = 'booking.html';
        });
    }
}

// ----------------- TICKET RESERVATION PAGE CODE -----------------
function initBookingPage() {
    const user = getUser();
    const scheduleStr = sessionStorage.getItem('selected_schedule');
    const coach = sessionStorage.getItem('booking_coach');
    const fare = sessionStorage.getItem('booking_fare');
    const journeyDate = sessionStorage.getItem('journey_date');

    if (!user || !scheduleStr || !coach) {
        showToast('Session expired. Select train again.', 'danger');
        setTimeout(() => window.location.href = 'trains.html', 1500);
        return;
    }

    const schedule = JSON.parse(scheduleStr);
    
    // Fill Booking Summary
    document.getElementById('summary-train').innerText = schedule.train_name;
    document.getElementById('summary-route').innerText = `${schedule.source} to ${schedule.destination}`;
    document.getElementById('summary-date').innerText = journeyDate;
    document.getElementById('summary-coach').innerText = coach;
    document.getElementById('summary-total').innerText = `₹${fare}`;

    // Fill passenger profile form with defaults
    document.getElementById('p-name').value = user.full_name;
    document.getElementById('p-age').value = user.age || '';
    document.getElementById('p-gender').value = user.gender || 'Male';

    // Interactive Seat map click
    const seatContainer = document.querySelector('.seat-map-container');
    let selectedSeat = '';

    if (seatContainer) {
        // Create 20 simulated seats
        for (let i = 1; i <= 20; i++) {
            const seatNum = `${coach[0]}${i}`;
            const seatBox = document.createElement('div');
            seatBox.className = 'seat-box';
            
            // Randomly set some seats occupied
            const occupied = Math.random() < 0.25;
            if (occupied) {
                seatBox.classList.add('occupied');
                seatBox.innerText = 'X';
            } else {
                seatBox.innerText = seatNum;
                seatBox.addEventListener('click', () => {
                    document.querySelectorAll('.seat-box').forEach(s => s.classList.remove('selected'));
                    seatBox.classList.add('selected');
                    selectedSeat = seatNum;
                    document.getElementById('summary-seat').innerText = selectedSeat;
                });
            }
            seatContainer.appendChild(seatBox);
        }
    }

    const confirmBtn = document.getElementById('confirm-booking-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            const pName = document.getElementById('p-name').value.trim();
            const pAge = document.getElementById('p-age').value;
            const pGender = document.getElementById('p-gender').value;

            if (!pName || !pAge) {
                showToast('Please fill passenger name and age', 'warning');
                return;
            }

            if (!selectedSeat) {
                showToast('Please select a seat preference from map', 'warning');
                return;
            }

            const payload = {
                passenger_name: pName,
                train_name: schedule.train_name,
                journey_date: journeyDate,
                source: schedule.source,
                destination: schedule.destination,
                coach_type: coach,
                seat_number: selectedSeat,
                total_fare: parseFloat(fare),
                booking_status: 'Confirmed'
            };

            try {
                const response = await fetch(`${API_BASE_URL}/bookings/add/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                
                if (response.ok) {
                    showToast('Ticket reserved successfully! Proceeding to Payment.', 'success');
                    setTimeout(() => {
                        window.location.href = `payment.html?booking_id=${result.booking_id}`;
                    }, 1500);
                } else {
                    showToast(result.error || 'Failed to place booking', 'danger');
                }
            } catch (err) {
                console.error(err);
                showToast('Server connection failed.', 'danger');
            }
        });
    }
}

// ----------------- PAYMENT PAGE CODE -----------------
async function initPaymentPage() {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('booking_id');

    if (!bookingId) {
        showToast('No booking specified', 'danger');
        setTimeout(() => window.location.href = 'index.html', 1000);
        return;
    }

    // Retrieve booking details
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/`);
        const bookings = await response.json();
        const booking = bookings.find(b => b.booking_id === parseInt(bookingId));

        if (!booking) {
            showToast('Booking not found', 'danger');
            return;
        }

        document.getElementById('pay-booking-id').innerText = booking.booking_id;
        document.getElementById('pay-train').innerText = booking.train_name;
        document.getElementById('pay-passenger').innerText = booking.passenger_name;
        document.getElementById('pay-amount').innerText = `₹${booking.total_fare}`;

        const payForm = document.getElementById('payment-form');
        if (payForm) {
            payForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const payMethod = document.getElementById('payment-method').value;
                const txnId = 'TXN' + Math.floor(Math.random() * 1000000000);
                const today = new Date().toISOString().split('T')[0];

                const payload = {
                    booking_id: booking.booking_id,
                    passenger_name: booking.passenger_name,
                    amount: booking.total_fare,
                    payment_method: payMethod,
                    payment_status: 'Success',
                    transaction_id: txnId,
                    payment_date: today
                };

                try {
                    const payRes = await fetch(`${API_BASE_URL}/payments/add/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const payResult = await payRes.json();

                    if (payRes.ok) {
                        showToast('Payment successful!', 'success');
                        setTimeout(() => {
                            window.location.href = 'booking_history.html';
                        }, 1500);
                    } else {
                        showToast(payResult.error || 'Payment failed', 'danger');
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Connection to server failed during payment transaction.', 'danger');
                }
            });
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to fetch booking metadata.', 'danger');
    }
}

// ----------------- BOOKING HISTORY PAGE CODE -----------------
async function initBookingHistoryPage() {
    const user = getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const upcomingDiv = document.getElementById('upcoming-journeys-list');
    const pastDiv = document.getElementById('past-journeys-list');

    if (!upcomingDiv || !pastDiv) return;

    try {
        const bookRes = await fetch(`${API_BASE_URL}/bookings/`);
        const allBookings = await bookRes.json();

        // Get matching payments
        const payRes = await fetch(`${API_BASE_URL}/payments/`);
        const allPayments = await payRes.json();

        // Filter bookings for logged in passenger
        const myBookings = allBookings.filter(b => b.passenger_name === user.full_name);

        upcomingDiv.innerHTML = '';
        pastDiv.innerHTML = '';

        if (myBookings.length === 0) {
            upcomingDiv.innerHTML = '<tr><td colspan="7" style="text-align:center;">No upcoming bookings found.</td></tr>';
            pastDiv.innerHTML = '<tr><td colspan="7" style="text-align:center;">No previous history found.</td></tr>';
            return;
        }

        const todayStr = new Date().toISOString().split('T')[0];

        myBookings.forEach(booking => {
            const payment = allPayments.find(p => p.booking_id === booking.booking_id);
            const payStatus = payment ? payment.payment_status : 'Pending';
            
            const isUpcoming = booking.journey_date >= todayStr && booking.booking_status !== 'Cancelled';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${booking.booking_id}</strong></td>
                <td>${booking.train_name}</td>
                <td>${booking.journey_date}</td>
                <td>${booking.source} ➔ ${booking.destination}</td>
                <td>${booking.coach_type} (${booking.seat_number})</td>
                <td>₹${booking.total_fare}</td>
                <td><span class="badge badge-${booking.booking_status.toLowerCase()}">${booking.booking_status}</span></td>
                <td><span class="badge badge-${payStatus.toLowerCase()}">${payStatus}</span></td>
                <td>
                    ${isUpcoming ? `<button class="btn btn-danger btn-sm" onclick="cancelTicket(${booking.booking_id})">Cancel</button>` : 'N/A'}
                </td>
            `;

            if (isUpcoming) {
                upcomingDiv.appendChild(tr);
            } else {
                pastDiv.appendChild(tr);
            }
        });

        if (upcomingDiv.children.length === 0) {
            upcomingDiv.innerHTML = '<tr><td colspan="9" style="text-align:center;">No upcoming bookings.</td></tr>';
        }
        if (pastDiv.children.length === 0) {
            pastDiv.innerHTML = '<tr><td colspan="9" style="text-align:center;">No historical bookings.</td></tr>';
        }

    } catch (err) {
        console.error(err);
        showToast('Error loading booking history.', 'danger');
    }
}

window.cancelTicket = async function(bookingId) {
    if (!confirm('Are you sure you want to cancel this ticket?')) return;

    try {
        // Fetch original booking first
        const bRes = await fetch(`${API_BASE_URL}/bookings/`);
        const bookings = await bRes.json();
        const booking = bookings.find(b => b.booking_id === bookingId);

        if (!booking) {
            showToast('Booking not found', 'danger');
            return;
        }

        booking.booking_status = 'Cancelled';

        // Update booking status
        const updateRes = await fetch(`${API_BASE_URL}/bookings/update/${bookingId}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking)
        });

        if (updateRes.ok) {
            showToast('Ticket cancelled successfully!', 'success');
            initBookingHistoryPage();
        } else {
            showToast('Failed to cancel ticket', 'danger');
        }
    } catch (err) {
        console.error(err);
        showToast('Error canceling ticket.', 'danger');
    }
};

// ----------------- PASSENGER DASHBOARD PAGE CODE -----------------
async function initPassengerDashboardPage() {
    const user = getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Set greeting & profile
    document.getElementById('dash-passenger-name').innerText = user.full_name;
    document.getElementById('prof-name').value = user.full_name;
    document.getElementById('prof-email').value = user.email;
    document.getElementById('prof-phone').value = user.phone;
    document.getElementById('prof-gender').value = user.gender;
    document.getElementById('prof-age').value = user.age;
    document.getElementById('prof-address').value = user.address;

    const refreshDashboardData = async () => {
        try {
            // Bookings stats
            const bRes = await fetch(`${API_BASE_URL}/bookings/`);
            const bookings = await bRes.json();
            const myBookings = bookings.filter(b => b.passenger_name === user.full_name);

            // Payments stats
            const pRes = await fetch(`${API_BASE_URL}/payments/`);
            const payments = await pRes.json();
            const myPayments = payments.filter(p => p.passenger_name === user.full_name);

            const totalBookings = myBookings.length;
            const todayStr = new Date().toISOString().split('T')[0];

            const upcomingTrips = myBookings.filter(b => b.journey_date >= todayStr && b.booking_status !== 'Cancelled').length;
            const cancelledTrips = myBookings.filter(b => b.booking_status === 'Cancelled').length;
            const totalSpent = myPayments.filter(p => p.payment_status === 'Success').reduce((sum, p) => sum + p.amount, 0);

            document.getElementById('stat-total-bookings').innerText = totalBookings;
            document.getElementById('stat-upcoming-trips').innerText = upcomingTrips;
            document.getElementById('stat-cancelled').innerText = cancelledTrips;
            document.getElementById('stat-spent').innerText = `₹${totalSpent}`;

            // Render Payment History
            const payList = document.getElementById('dash-payment-history-list');
            if (payList) {
                payList.innerHTML = '';
                if (myPayments.length === 0) {
                    payList.innerHTML = '<tr><td colspan="5" style="text-align:center;">No payment records.</td></tr>';
                    return;
                }
                myPayments.forEach(p => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>#${p.payment_id}</strong></td>
                        <td>#${p.booking_id}</td>
                        <td>${p.payment_date}</td>
                        <td>${p.payment_method}</td>
                        <td>₹${p.amount}</td>
                        <td><span class="badge badge-${p.payment_status.toLowerCase()}">${p.payment_status}</span></td>
                    `;
                    payList.appendChild(tr);
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    await refreshDashboardData();

    // Profile form submit update
    const profForm = document.getElementById('profile-update-form');
    if (profForm) {
        profForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const full_name = document.getElementById('prof-name').value.trim();
            const email = document.getElementById('prof-email').value.trim();
            const phone = document.getElementById('prof-phone').value.trim();
            const gender = document.getElementById('prof-gender').value;
            const age = document.getElementById('prof-age').value;
            const address = document.getElementById('prof-address').value.trim();
            const password = user.password; // Keep same password

            const payload = { full_name, email, phone, gender, age: parseInt(age), address, password };

            try {
                const res = await fetch(`${API_BASE_URL}/passengers/update/${user.passenger_id}/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    // Update user session storage
                    const updatedUser = { ...user, ...payload };
                    setUser(updatedUser);
                    showToast('Profile updated successfully!', 'success');
                    document.getElementById('dash-passenger-name').innerText = updatedUser.full_name;
                    await refreshDashboardData();
                } else {
                    const errRes = await res.json();
                    showToast(errRes.error || 'Failed to update profile', 'danger');
                }
            } catch (err) {
                console.error(err);
                showToast('Unable to save profile.', 'danger');
            }
        });
    }
}

// ----------------- ADMIN DASHBOARD PAGE CODE -----------------
let currentModalType = '';
let currentEditId = null;

async function initAdminDashboardPage() {
    const user = getUser();
    if (!user || user.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    // Tab switcher
    const tabButtons = document.querySelectorAll('.sidebar-menu a');
    const tabSections = document.querySelectorAll('.admin-section');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetSection = btn.getAttribute('data-section');
            tabSections.forEach(sec => {
                sec.style.display = sec.id === targetSection ? 'block' : 'none';
            });
            loadSectionData(targetSection);
        });
    });

    // Auto-load passengers tab
    loadSectionData('sec-passengers');

    // Attach form modal actions
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
}

async function loadSectionData(sectionId) {
    if (sectionId === 'sec-passengers') {
        await loadAdminPassengers();
    } else if (sectionId === 'sec-trains') {
        await loadAdminTrains();
    } else if (sectionId === 'sec-schedules') {
        await loadAdminSchedules();
    } else if (sectionId === 'sec-bookings') {
        await loadAdminBookings();
    } else if (sectionId === 'sec-payments') {
        await loadAdminPayments();
    }
}

// 1. Passengers CRUD
async function loadAdminPassengers() {
    const tbody = document.getElementById('admin-passengers-tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading passengers...</td></tr>';
    try {
        const res = await fetch(`${API_BASE_URL}/passengers/`);
        const passengers = await res.json();
        tbody.innerHTML = '';
        passengers.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${p.passenger_id}</strong></td>
                <td>${p.full_name}</td>
                <td>${p.email}</td>
                <td>${p.phone}</td>
                <td>${p.gender} (Age: ${p.age})</td>
                <td>${p.address}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditPassengerModal(${JSON.stringify(p).replace(/"/g, '&quot;')})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePassenger(${p.passenger_id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--danger)">Error loading.</td></tr>';
    }
}

window.openAddPassengerModal = function() {
    currentModalType = 'passenger';
    currentEditId = null;
    document.getElementById('modal-title').innerText = 'Add Passenger';
    const formDiv = document.getElementById('modal-form-content');
    formDiv.innerHTML = `
        <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="m-p-name" class="form-control" required>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="m-p-email" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="text" id="m-p-phone" class="form-control" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Gender</label>
                <select id="m-p-gender">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Age</label>
                <input type="number" id="m-p-age" class="form-control" required>
            </div>
        </div>
        <div class="form-group">
            <label>Address</label>
            <input type="text" id="m-p-address" class="form-control" required>
        </div>
        <div class="form-group">
            <label>Password</label>
            <input type="password" id="m-p-pass" class="form-control" required>
        </div>
    `;
    openModal();
};

window.openEditPassengerModal = function(p) {
    currentModalType = 'passenger';
    currentEditId = p.passenger_id;
    document.getElementById('modal-title').innerText = `Edit Passenger #${p.passenger_id}`;
    const formDiv = document.getElementById('modal-form-content');
    formDiv.innerHTML = `
        <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="m-p-name" class="form-control" value="${p.full_name}" required>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="m-p-email" class="form-control" value="${p.email}" required>
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="text" id="m-p-phone" class="form-control" value="${p.phone}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Gender</label>
                <select id="m-p-gender">
                    <option value="Male" ${p.gender === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Female" ${p.gender === 'Female' ? 'selected' : ''}>Female</option>
                    <option value="Other" ${p.gender === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Age</label>
                <input type="number" id="m-p-age" class="form-control" value="${p.age}" required>
            </div>
        </div>
        <div class="form-group">
            <label>Address</label>
            <input type="text" id="m-p-address" class="form-control" value="${p.address}" required>
        </div>
        <div class="form-group">
            <label>Password</label>
            <input type="password" id="m-p-pass" class="form-control" value="${p.password}" required>
        </div>
    `;
    openModal();
};

window.deletePassenger = async function(id) {
    if (!confirm('Delete passenger account?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/passengers/delete/${id}/`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Passenger deleted', 'success');
            loadAdminPassengers();
        } else {
            showToast('Failed to delete', 'danger');
        }
    } catch (err) {
        showToast('Error connection.', 'danger');
    }
};

// 2. Trains CRUD
async function loadAdminTrains() {
    const tbody = document.getElementById('admin-trains-tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading trains...</td></tr>';
    try {
        const res = await fetch(`${API_BASE_URL}/trains/`);
        const trains = await res.json();
        tbody.innerHTML = '';
        trains.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${t.train_id}</strong></td>
                <td>${t.train_name}</td>
                <td>${t.train_number}</td>
                <td>${t.train_type}</td>
                <td>${t.total_seats}</td>
                <td>${t.source} ➔ ${t.destination}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditTrainModal(${JSON.stringify(t).replace(/"/g, '&quot;')})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTrain(${t.train_id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--danger)">Error loading.</td></tr>';
    }
}

window.openAddTrainModal = function() {
    currentModalType = 'train';
    currentEditId = null;
    document.getElementById('modal-title').innerText = 'Add Train';
    const formDiv = document.getElementById('modal-form-content');
    formDiv.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Train Name</label>
                <input type="text" id="m-t-name" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Train Number</label>
                <input type="text" id="m-t-num" class="form-control" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Train Type</label>
                <select id="m-t-type">
                    <option value="Express">Express</option>
                    <option value="Superfast">Superfast</option>
                    <option value="Passenger">Passenger</option>
                    <option value="Rajdhani">Rajdhani</option>
                    <option value="Shatabdi">Shatabdi</option>
                    <option value="Vande Bharat">Vande Bharat</option>
                </select>
            </div>
            <div class="form-group">
                <label>Total Seats</label>
                <input type="number" id="m-t-seats" class="form-control" value="100" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Source Station</label>
                <input type="text" id="m-t-src" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Destination Station</label>
                <input type="text" id="m-t-dest" class="form-control" required>
            </div>
        </div>
    `;
    openModal();
};

window.openEditTrainModal = function(t) {
    currentModalType = 'train';
    currentEditId = t.train_id;
    document.getElementById('modal-title').innerText = `Edit Train #${t.train_id}`;
    const formDiv = document.getElementById('modal-form-content');
    formDiv.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Train Name</label>
                <input type="text" id="m-t-name" class="form-control" value="${t.train_name}" required>
            </div>
            <div class="form-group">
                <label>Train Number</label>
                <input type="text" id="m-t-num" class="form-control" value="${t.train_number}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Train Type</label>
                <select id="m-t-type">
                    <option value="Express" ${t.train_type === 'Express' ? 'selected' : ''}>Express</option>
                    <option value="Superfast" ${t.train_type === 'Superfast' ? 'selected' : ''}>Superfast</option>
                    <option value="Passenger" ${t.train_type === 'Passenger' ? 'selected' : ''}>Passenger</option>
                    <option value="Rajdhani" ${t.train_type === 'Rajdhani' ? 'selected' : ''}>Rajdhani</option>
                    <option value="Shatabdi" ${t.train_type === 'Shatabdi' ? 'selected' : ''}>Shatabdi</option>
                    <option value="Vande Bharat" ${t.train_type === 'Vande Bharat' ? 'selected' : ''}>Vande Bharat</option>
                </select>
            </div>
            <div class="form-group">
                <label>Total Seats</label>
                <input type="number" id="m-t-seats" class="form-control" value="${t.total_seats}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Source Station</label>
                <input type="text" id="m-t-src" class="form-control" value="${t.source}" required>
            </div>
            <div class="form-group">
                <label>Destination Station</label>
                <input type="text" id="m-t-dest" class="form-control" value="${t.destination}" required>
            </div>
        </div>
    `;
    openModal();
};

window.deleteTrain = async function(id) {
    if (!confirm('Remove this train from schedule database?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/trains/delete/${id}/`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Train deleted', 'success');
            loadAdminTrains();
        } else {
            showToast('Failed to delete train', 'danger');
        }
    } catch (err) {
        showToast('Error server.', 'danger');
    }
};

// 3. Schedules CRUD
async function loadAdminSchedules() {
    const tbody = document.getElementById('admin-schedules-tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading routes...</td></tr>';
    try {
        const res = await fetch(`${API_BASE_URL}/schedules/`);
        const schedules = await res.json();
        tbody.innerHTML = '';
        schedules.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${s.schedule_id}</strong></td>
                <td>${s.train_name}</td>
                <td>${s.source} ➔ ${s.destination}</td>
                <td>${s.departure_date} (${s.departure_time})</td>
                <td>${s.arrival_date} (${s.arrival_time})</td>
                <td>₹${s.fare}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditScheduleModal(${JSON.stringify(s).replace(/"/g, '&quot;')})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSchedule(${s.schedule_id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--danger)">Error loading.</td></tr>';
    }
}

window.openAddScheduleModal = async function() {
    currentModalType = 'schedule';
    currentEditId = null;
    document.getElementById('modal-title').innerText = 'Add Route Schedule';
    
    // Fetch train names to select
    const trainRes = await fetch(`${API_BASE_URL}/trains/`);
    const trains = await trainRes.json();
    let selectHTML = '';
    trains.forEach(t => {
        selectHTML += `<option value="${t.train_name}">${t.train_name}</option>`;
    });

    const formDiv = document.getElementById('modal-form-content');
    formDiv.innerHTML = `
        <div class="form-group">
            <label>Train name</label>
            <select id="m-s-train">${selectHTML}</select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Source Station</label>
                <input type="text" id="m-s-src" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Destination Station</label>
                <input type="text" id="m-s-dest" class="form-control" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Departure Date</label>
                <input type="date" id="m-s-dep-date" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Departure Time</label>
                <input type="time" id="m-s-dep-time" class="form-control" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Arrival Date</label>
                <input type="date" id="m-s-arr-date" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Arrival Time</label>
                <input type="time" id="m-s-arr-time" class="form-control" required>
            </div>
        </div>
        <div class="form-group">
            <label>Base Ticket Fare (₹)</label>
            <input type="number" id="m-s-fare" class="form-control" required>
        </div>
    `;
    openModal();
};

window.openEditScheduleModal = async function(s) {
    currentModalType = 'schedule';
    currentEditId = s.schedule_id;
    document.getElementById('modal-title').innerText = `Edit Route Schedule #${s.schedule_id}`;
    
    // Fetch train names
    const trainRes = await fetch(`${API_BASE_URL}/trains/`);
    const trains = await trainRes.json();
    let selectHTML = '';
    trains.forEach(t => {
        selectHTML += `<option value="${t.train_name}" ${t.train_name === s.train_name ? 'selected' : ''}>${t.train_name}</option>`;
    });

    const formDiv = document.getElementById('modal-form-content');
    formDiv.innerHTML = `
        <div class="form-group">
            <label>Train name</label>
            <select id="m-s-train">${selectHTML}</select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Source Station</label>
                <input type="text" id="m-s-src" class="form-control" value="${s.source}" required>
            </div>
            <div class="form-group">
                <label>Destination Station</label>
                <input type="text" id="m-s-dest" class="form-control" value="${s.destination}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Departure Date</label>
                <input type="date" id="m-s-dep-date" class="form-control" value="${s.departure_date}" required>
            </div>
            <div class="form-group">
                <label>Departure Time</label>
                <input type="time" id="m-s-dep-time" class="form-control" value="${s.departure_time}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Arrival Date</label>
                <input type="date" id="m-s-arr-date" class="form-control" value="${s.arrival_date}" required>
            </div>
            <div class="form-group">
                <label>Arrival Time</label>
                <input type="time" id="m-s-arr-time" class="form-control" value="${s.arrival_time}" required>
            </div>
        </div>
        <div class="form-group">
            <label>Base Ticket Fare (₹)</label>
            <input type="number" id="m-s-fare" class="form-control" value="${s.fare}" required>
        </div>
    `;
    openModal();
};

window.deleteSchedule = async function(id) {
    if (!confirm('Remove this route schedule?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/schedules/delete/${id}/`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Schedule deleted', 'success');
            loadAdminSchedules();
        } else {
            showToast('Failed to delete schedule', 'danger');
        }
    } catch (err) {
        showToast('Error server.', 'danger');
    }
};

// 4. Bookings CRUD
async function loadAdminBookings() {
    const tbody = document.getElementById('admin-bookings-tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading bookings...</td></tr>';
    try {
        const res = await fetch(`${API_BASE_URL}/bookings/`);
        const bookings = await res.json();
        tbody.innerHTML = '';
        bookings.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${b.booking_id}</strong></td>
                <td>${b.passenger_name}</td>
                <td>${b.train_name}</td>
                <td>${b.journey_date}</td>
                <td>${b.source} ➔ ${b.destination}</td>
                <td>${b.coach_type} (${b.seat_number})</td>
                <td>₹${b.total_fare}</td>
                <td><span class="badge badge-${b.booking_status.toLowerCase()}">${b.booking_status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditBookingModal(${JSON.stringify(b).replace(/"/g, '&quot;')})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBooking(${b.booking_id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--danger)">Error loading.</td></tr>';
    }
}

window.openAddBookingModal = function() {
    currentModalType = 'booking';
    currentEditId = null;
    document.getElementById('modal-title').innerText = 'Add Booking (Manual)';
    const formDiv = document.getElementById('modal-form-content');
    formDiv.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Passenger Name</label>
                <input type="text" id="m-b-passenger" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Train Name</label>
                <input type="text" id="m-b-train" class="form-control" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Source</label>
                <input type="text" id="m-b-src" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Destination</label>
                <input type="text" id="m-b-dest" class="form-control" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Journey Date</label>
                <input type="date" id="m-b-date" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Coach Type</label>
                <select id="m-b-coach">
                    <option value="Sleeper">Sleeper</option>
                    <option value="AC 3 Tier">AC 3 Tier</option>
                    <option value="AC 2 Tier">AC 2 Tier</option>
                    <option value="AC First Class">AC First Class</option>
                    <option value="Chair Car">Chair Car</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Seat Number</label>
                <input type="text" id="m-b-seat" class="form-control" value="S-15" required>
            </div>
            <div class="form-group">
                <label>Total Fare (₹)</label>
                <input type="number" id="m-b-fare" class="form-control" required>
            </div>
        </div>
        <div class="form-group">
            <label>Booking Status</label>
            <select id="m-b-status">
                <option value="Confirmed">Confirmed</option>
                <option value="RAC">RAC</option>
                <option value="Waiting List">Waiting List</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        </div>
    `;
    openModal();
};

window.openEditBookingModal = function(b) {
    currentModalType = 'booking';
    currentEditId = b.booking_id;
    document.getElementById('modal-title').innerText = `Edit Booking #${b.booking_id}`;
    const formDiv = document.getElementById('modal-form-content');
    formDiv.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Passenger Name</label>
                <input type="text" id="m-b-passenger" class="form-control" value="${b.passenger_name}" required>
            </div>
            <div class="form-group">
                <label>Train Name</label>
                <input type="text" id="m-b-train" class="form-control" value="${b.train_name}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Source</label>
                <input type="text" id="m-b-src" class="form-control" value="${b.source}" required>
            </div>
            <div class="form-group">
                <label>Destination</label>
                <input type="text" id="m-b-dest" class="form-control" value="${b.destination}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Journey Date</label>
                <input type="date" id="m-b-date" class="form-control" value="${b.journey_date}" required>
            </div>
            <div class="form-group">
                <label>Coach Type</label>
                <select id="m-b-coach">
                    <option value="Sleeper" ${b.coach_type === 'Sleeper' ? 'selected' : ''}>Sleeper</option>
                    <option value="AC 3 Tier" ${b.coach_type === 'AC 3 Tier' ? 'selected' : ''}>AC 3 Tier</option>
                    <option value="AC 2 Tier" ${b.coach_type === 'AC 2 Tier' ? 'selected' : ''}>AC 2 Tier</option>
                    <option value="AC First Class" ${b.coach_type === 'AC First Class' ? 'selected' : ''}>AC First Class</option>
                    <option value="Chair Car" ${b.coach_type === 'Chair Car' ? 'selected' : ''}>Chair Car</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Seat Number</label>
                <input type="text" id="m-b-seat" class="form-control" value="${b.seat_number}" required>
            </div>
            <div class="form-group">
                <label>Total Fare (₹)</label>
                <input type="number" id="m-b-fare" class="form-control" value="${b.total_fare}" required>
            </div>
        </div>
        <div class="form-group">
            <label>Booking Status</label>
            <select id="m-b-status">
                <option value="Confirmed" ${b.booking_status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="RAC" ${b.booking_status === 'RAC' ? 'selected' : ''}>RAC</option>
                <option value="Waiting List" ${b.booking_status === 'Waiting List' ? 'selected' : ''}>Waiting List</option>
                <option value="Cancelled" ${b.booking_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
        </div>
    `;
    openModal();
};

window.deleteBooking = async function(id) {
    if (!confirm('Remove this reservation from the system?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/bookings/delete/${id}/`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Booking deleted', 'success');
            loadAdminBookings();
        } else {
            showToast('Failed to delete booking', 'danger');
        }
    } catch (err) {
        showToast('Error server.', 'danger');
    }
};

// 5. Payments CRUD
async function loadAdminPayments() {
    const tbody = document.getElementById('admin-payments-tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading payments...</td></tr>';
    try {
        const res = await fetch(`${API_BASE_URL}/payments/`);
        const payments = await res.json();
        tbody.innerHTML = '';
        payments.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${p.payment_id}</strong></td>
                <td>#${p.booking_id}</td>
                <td>${p.passenger_name}</td>
                <td>₹${p.amount}</td>
                <td>${p.payment_method}</td>
                <td>${p.transaction_id}</td>
                <td>${p.payment_date}</td>
                <td><span class="badge badge-${p.payment_status.toLowerCase()}">${p.payment_status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditPaymentModal(${JSON.stringify(p).replace(/"/g, '&quot;')})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePayment(${p.payment_id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--danger)">Error loading.</td></tr>';
    }
}

window.openAddPaymentModal = function() {
    currentModalType = 'payment';
    currentEditId = null;
    document.getElementById('modal-title').innerText = 'Add Payment Record';
    const formDiv = document.getElementById('modal-form-content');
    formDiv.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Booking ID</label>
                <input type="number" id="m-pay-booking" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Passenger Name</label>
                <input type="text" id="m-pay-passenger" class="form-control" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Amount (₹)</label>
                <input type="number" id="m-pay-amount" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Payment Method</label>
                <select id="m-pay-method">
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Wallet">Wallet</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Transaction ID</label>
                <input type="text" id="m-pay-txn" class="form-control" value="TXN${Math.floor(Math.random() * 10000000)}" required>
            </div>
            <div class="form-group">
                <label>Payment Date</label>
                <input type="date" id="m-pay-date" class="form-control" required>
            </div>
        </div>
        <div class="form-group">
            <label>Payment Status</label>
            <select id="m-pay-status">
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
            </select>
        </div>
    `;
    openModal();
};

window.openEditPaymentModal = function(p) {
    currentModalType = 'payment';
    currentEditId = p.payment_id;
    document.getElementById('modal-title').innerText = `Edit Payment Record #${p.payment_id}`;
    const formDiv = document.getElementById('modal-form-content');
    formDiv.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Booking ID</label>
                <input type="number" id="m-pay-booking" class="form-control" value="${p.booking_id}" required>
            </div>
            <div class="form-group">
                <label>Passenger Name</label>
                <input type="text" id="m-pay-passenger" class="form-control" value="${p.passenger_name}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Amount (₹)</label>
                <input type="number" id="m-pay-amount" class="form-control" value="${p.amount}" required>
            </div>
            <div class="form-group">
                <label>Payment Method</label>
                <select id="m-pay-method">
                    <option value="UPI" ${p.payment_method === 'UPI' ? 'selected' : ''}>UPI</option>
                    <option value="Credit Card" ${p.payment_method === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                    <option value="Debit Card" ${p.payment_method === 'Debit Card' ? 'selected' : ''}>Debit Card</option>
                    <option value="Net Banking" ${p.payment_method === 'Net Banking' ? 'selected' : ''}>Net Banking</option>
                    <option value="Wallet" ${p.payment_method === 'Wallet' ? 'selected' : ''}>Wallet</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Transaction ID</label>
                <input type="text" id="m-pay-txn" class="form-control" value="${p.transaction_id}" required>
            </div>
            <div class="form-group">
                <label>Payment Date</label>
                <input type="date" id="m-pay-date" class="form-control" value="${p.payment_date}" required>
            </div>
        </div>
        <div class="form-group">
            <label>Payment Status</label>
            <select id="m-pay-status">
                <option value="Success" ${p.payment_status === 'Success' ? 'selected' : ''}>Success</option>
                <option value="Pending" ${p.payment_status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Failed" ${p.payment_status === 'Failed' ? 'selected' : ''}>Failed</option>
            </select>
        </div>
    `;
    openModal();
};

window.deletePayment = async function(id) {
    if (!confirm('Delete payment record?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/payments/delete/${id}/`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Payment record deleted', 'success');
            loadAdminPayments();
        } else {
            showToast('Failed to delete payment record', 'danger');
        }
    } catch (err) {
        showToast('Error server.', 'danger');
    }
};

// Modal handlers
function openModal() {
    document.querySelector('.modal-overlay').classList.add('active');
}

function closeModal() {
    document.querySelector('.modal-overlay').classList.remove('active');
}

// Modal Form Submit handler (Unified logic)
window.handleModalSubmit = async function(e) {
    if (e) e.preventDefault();

    let endpoint = '';
    let method = currentEditId ? 'PUT' : 'POST';
    let payload = {};

    if (currentModalType === 'passenger') {
        endpoint = currentEditId ? `/passengers/update/${currentEditId}/` : '/passengers/add/';
        payload = {
            full_name: document.getElementById('m-p-name').value.trim(),
            email: document.getElementById('m-p-email').value.trim(),
            phone: document.getElementById('m-p-phone').value.trim(),
            gender: document.getElementById('m-p-gender').value,
            age: parseInt(document.getElementById('m-p-age').value),
            address: document.getElementById('m-p-address').value.trim(),
            password: document.getElementById('m-p-pass').value.trim()
        };
    } else if (currentModalType === 'train') {
        endpoint = currentEditId ? `/trains/update/${currentEditId}/` : '/trains/add/';
        payload = {
            train_name: document.getElementById('m-t-name').value.trim(),
            train_number: document.getElementById('m-t-num').value.trim(),
            train_type: document.getElementById('m-t-type').value,
            total_seats: parseInt(document.getElementById('m-t-seats').value),
            source: document.getElementById('m-t-src').value.trim(),
            destination: document.getElementById('m-t-dest').value.trim()
        };
    } else if (currentModalType === 'schedule') {
        endpoint = currentEditId ? `/schedules/update/${currentEditId}/` : '/schedules/add/';
        payload = {
            train_name: document.getElementById('m-s-train').value,
            source: document.getElementById('m-s-src').value.trim(),
            destination: document.getElementById('m-s-dest').value.trim(),
            departure_date: document.getElementById('m-s-dep-date').value,
            departure_time: document.getElementById('m-s-dep-time').value,
            arrival_date: document.getElementById('m-s-arr-date').value,
            arrival_time: document.getElementById('m-s-arr-time').value,
            fare: parseFloat(document.getElementById('m-s-fare').value)
        };
    } else if (currentModalType === 'booking') {
        endpoint = currentEditId ? `/bookings/update/${currentEditId}/` : '/bookings/add/';
        payload = {
            passenger_name: document.getElementById('m-b-passenger').value.trim(),
            train_name: document.getElementById('m-b-train').value.trim(),
            journey_date: document.getElementById('m-b-date').value,
            source: document.getElementById('m-b-src').value.trim(),
            destination: document.getElementById('m-b-dest').value.trim(),
            coach_type: document.getElementById('m-b-coach').value,
            seat_number: document.getElementById('m-b-seat').value.trim(),
            total_fare: parseFloat(document.getElementById('m-b-fare').value),
            booking_status: document.getElementById('m-b-status').value
        };
    } else if (currentModalType === 'payment') {
        endpoint = currentEditId ? `/payments/update/${currentEditId}/` : '/payments/add/';
        payload = {
            booking_id: parseInt(document.getElementById('m-pay-booking').value),
            passenger_name: document.getElementById('m-pay-passenger').value.trim(),
            amount: parseFloat(document.getElementById('m-pay-amount').value),
            payment_method: document.getElementById('m-pay-method').value,
            payment_status: document.getElementById('m-pay-status').value,
            transaction_id: document.getElementById('m-pay-txn').value.trim(),
            payment_date: document.getElementById('m-pay-date').value
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok) {
            showToast(result.message || 'Operation successful', 'success');
            closeModal();
            // Refresh current tab data
            if (currentModalType === 'passenger') loadAdminPassengers();
            if (currentModalType === 'train') loadAdminTrains();
            if (currentModalType === 'schedule') loadAdminSchedules();
            if (currentModalType === 'booking') loadAdminBookings();
            if (currentModalType === 'payment') loadAdminPayments();
        } else {
            showToast(result.error || 'Operation failed', 'danger');
        }
    } catch (err) {
        console.error(err);
        showToast('Connection to backend failed.', 'danger');
    }
};
