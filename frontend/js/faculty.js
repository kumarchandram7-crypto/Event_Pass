/**
 * EventPass - Faculty Console Logic
 * 
 * Function Breakdown: verifyAndCheckIn()
 * ---------------------------------------
 * INPUT       : ticketCode (string)
 * PROCESS     : Searches attendee registry; checks current check-in status. Updates record status to 'Checked-In'.
 * OUTPUT      : Updated attendance counters, table row highlight, and status toast message.
 * PURPOSE     : Real-time QR entry verification & duplicate check-in prevention.
 * ERROR CASE  : Displays 'Already Checked-In' warning or 'Invalid Pass Code' error message.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initial mock dataset for demonstration
    let attendees = [
        { studentId: 'CS2026-001', name: 'Aarav Patel', event: 'TechFest 2026', ticketCode: 'EP-TECHFEST 2026-102941', status: 'Checked-In', time: '09:15 AM' },
        { studentId: 'CS2026-015', name: 'Priya Sharma', event: 'TechFest 2026', ticketCode: 'EP-TECHFEST 2026-849201', status: 'Checked-In', time: '09:22 AM' },
        { studentId: 'CS2026-042', name: 'Rahul Sharma', event: 'TechFest 2026', ticketCode: 'EP-TECHFEST 2026-391024', status: 'Pending', time: '-' },
        { studentId: 'EE2026-012', name: 'Ananya Roy', event: 'AI Workshop', ticketCode: 'EP-AI WORKSHOP-559102', status: 'Pending', time: '-' },
        { studentId: 'ME2026-008', name: 'Vikram Singh', event: 'Hackathon Blitz', ticketCode: 'EP-HACKATHON BLITZ-773019', status: 'Pending', time: '-' }
    ];

    // Check if student pass exists in localStorage and add to list if present
    const localPass = JSON.parse(localStorage.getItem('eventpass_student_pass'));
    if (localPass) {
        const exists = attendees.some(a => a.ticketCode === localPass.ticketCode);
        if (!exists) {
            attendees.push({
                studentId: localPass.studentId,
                name: localPass.name,
                event: localPass.event,
                ticketCode: localPass.ticketCode,
                status: localPass.status || 'Pending',
                time: localPass.status === 'Checked-In' ? localPass.checkInTime || 'Just now' : '-'
            });
        }
    }

    const manualPassInput = document.getElementById('manualPassInput');
    const btnManualVerify = document.getElementById('btnManualVerify');
    const searchInput = document.getElementById('searchInput');
    const scanAlertBox = document.getElementById('scanAlertBox');

    // Initial render
    updateDashboardStats(attendees);
    renderAttendeeTable(attendees);

    // Manual Pass Code Verification Event Handler
    if (btnManualVerify && manualPassInput) {
        btnManualVerify.addEventListener('click', () => {
            const code = manualPassInput.value.trim();
            if (!code) {
                showAlert('Please enter a ticket pass code.', 'alert-warning');
                return;
            }
            processCheckIn(code, attendees);
            manualPassInput.value = '';
        });
    }

    // Live Search Filter Handler
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = attendees.filter(a => 
                a.name.toLowerCase().includes(query) || 
                a.studentId.toLowerCase().includes(query) || 
                a.ticketCode.toLowerCase().includes(query)
            );
            renderAttendeeTable(filtered);
        });
    }
});

/**
 * Process Entry Check-in Verification
 */
function processCheckIn(scannedCode, attendees) {
    let attendee = attendees.find(a => a.ticketCode.toLowerCase() === scannedCode.toLowerCase());
    
    // Fallback search by raw code string if scanned via QR payload
    if (!attendee && scannedCode.includes('{')) {
        try {
            const parsed = JSON.parse(scannedCode);
            if (parsed.ticketCode) {
                attendee = attendees.find(a => a.ticketCode.toLowerCase() === parsed.ticketCode.toLowerCase());
            }
        } catch (e) {
            console.error('Invalid QR Payload', e);
        }
    }

    if (!attendee) {
        showAlert(`❌ Reject: Invalid or Unregistered Ticket Pass (${scannedCode})`, 'alert-warning');
        return;
    }

    if (attendee.status === 'Checked-In') {
        showAlert(`⚠️ Already Checked-In: ${attendee.name} (${attendee.studentId}) entry recorded at ${attendee.time}`, 'alert-warning');
        return;
    }

    // Perform Check-in
    attendee.status = 'Checked-In';
    attendee.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update Local Storage if this matches current student
    const localPass = JSON.parse(localStorage.getItem('eventpass_student_pass'));
    if (localPass && localPass.ticketCode === attendee.ticketCode) {
        localPass.status = 'Checked-In';
        localPass.checkInTime = attendee.time;
        localStorage.setItem('eventpass_student_pass', JSON.stringify(localPass));
    }

    showAlert(`✅ Access Granted: ${attendee.name} (${attendee.studentId}) successfully checked in!`, 'alert-success');
    updateDashboardStats(attendees);
    renderAttendeeTable(attendees);
}

/**
 * Recalculate and update dashboard stat counters
 */
function updateDashboardStats(attendees) {
    const totalCount = attendees.length;
    const checkedInCount = attendees.filter(a => a.status === 'Checked-In').length;
    const notArrivedCount = totalCount - checkedInCount;
    const attendancePercentage = totalCount > 0 ? ((checkedInCount / totalCount) * 100).toFixed(1) : 0;

    const totalEl = document.getElementById('statTotal');
    const checkedInEl = document.getElementById('statCheckedIn');
    const notArrivedEl = document.getElementById('statNotArrived');
    const percentageEl = document.getElementById('statPercentage');

    if (totalEl) totalEl.textContent = totalCount;
    if (checkedInEl) checkedInEl.textContent = checkedInCount;
    if (notArrivedEl) notArrivedEl.textContent = notArrivedCount;
    if (percentageEl) percentageEl.textContent = `${attendancePercentage}%`;
}

/**
 * Render attendee table rows
 */
function renderAttendeeTable(attendees) {
    const tbody = document.getElementById('attendeeTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (attendees.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim);">No attendee records found.</td></tr>`;
        return;
    }

    attendees.forEach((a, index) => {
        const tr = document.createElement('tr');
        const badgeClass = a.status === 'Checked-In' ? 'badge badge-checkedin' : 'badge badge-pending';

        tr.innerHTML = `
            <td>#${index + 1}</td>
            <td><strong>${escapeHtml(a.name)}</strong></td>
            <td><code>${escapeHtml(a.studentId)}</code></td>
            <td>${escapeHtml(a.event)}</td>
            <td><span class="${badgeClass}">${a.status}</span></td>
            <td>${a.time}</td>
        `;
        tbody.appendChild(tr);
    });
}

function showAlert(message, typeClass) {
    const box = document.getElementById('scanAlertBox');
    if (!box) return;
    box.className = `alert ${typeClass}`;
    box.textContent = message;
    box.style.display = 'block';
}

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}
