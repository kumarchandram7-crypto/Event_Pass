/**
 * EventPass - Student Portal Logic & Dynamic QR Generator
 * 
 * Function Breakdown: generateDynamicQR()
 * ---------------------------------------
 * INPUT       : studentId (string), name (string), eventId (string), ticketCode (string)
 * PROCESS     : Encodes ticket details into a JSON string and renders it into a QR code matrix using QRCode library.
 * OUTPUT      : Interactive scannable QR Code image inside the DOM.
 * PURPOSE     : Creates a unique, verifiable digital ticket pass for touchless event check-in.
 * ERROR CASE  : Displays a user-friendly alert if fields are missing or QR rendering fails.
 */

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const qrSection = document.getElementById('qrPassSection');
    const qrcodeContainer = document.getElementById('qrcodeContainer');
    
    // Default student record state
    let currentPass = JSON.parse(localStorage.getItem('eventpass_student_pass')) || null;

    if (currentPass) {
        renderPassUI(currentPass);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const studentId = document.getElementById('studentId').value.trim();
            const studentName = document.getElementById('studentName').value.trim();
            const studentEmail = document.getElementById('studentEmail').value.trim();
            const selectedEvent = document.getElementById('eventSelect').value;

            // Simple Frontend Validation
            if (!studentId || !studentName || !studentEmail || !selectedEvent) {
                alert('Please fill out all required fields before generating your pass.');
                return;
            }

            // Generate unique ticket hash / code
            const ticketCode = 'EP-' + selectedEvent.toUpperCase() + '-' + Math.floor(100000 + Math.random() * 900000);

            const passData = {
                ticketCode: ticketCode,
                studentId: studentId,
                name: studentName,
                email: studentEmail,
                event: selectedEvent,
                status: 'Pending', // Default status: Pending check-in
                issuedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
            };

            // Save to localStorage for demo persistence
            localStorage.setItem('eventpass_student_pass', JSON.stringify(passData));
            
            // Render Pass and Dynamic QR
            renderPassUI(passData);
        });
    }
});

/**
 * Render Digital Pass Card and trigger Dynamic QR Generator
 */
function renderPassUI(passData) {
    const qrSection = document.getElementById('qrPassSection');
    const passStudentName = document.getElementById('passStudentName');
    const passStudentId = document.getElementById('passStudentId');
    const passEvent = document.getElementById('passEvent');
    const passCode = document.getElementById('passCode');
    const passStatusBadge = document.getElementById('passStatusBadge');

    if (passStudentName) passStudentName.textContent = passData.name;
    if (passStudentId) passStudentId.textContent = passData.studentId;
    if (passEvent) passEvent.textContent = passData.event;
    if (passCode) passCode.textContent = passData.ticketCode;
    
    if (passStatusBadge) {
        passStatusBadge.textContent = passData.status;
        passStatusBadge.className = passData.status === 'Checked-In' ? 'badge badge-checkedin' : 'badge badge-pending';
    }

    if (qrSection) {
        qrSection.style.display = 'block';
    }

    // Generate Dynamic QR Code
    generateDynamicQR(passData);
}

/**
 * Core Dynamic QR Code Generator Function
 */
function generateDynamicQR(passData) {
    const qrcodeContainer = document.getElementById('qrcodeContainer');
    if (!qrcodeContainer) return;

    // Clear previous QR code canvas
    qrcodeContainer.innerHTML = '';

    try {
        // Payload string encoded into QR matrix
        const qrPayload = JSON.stringify({
            ticketCode: passData.ticketCode,
            studentId: passData.studentId,
            event: passData.event
        });

        // Use QRCode library if loaded
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrcodeContainer, {
                text: qrPayload,
                width: 180,
                height: 180,
                colorDark: "#1e2538",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            // Fallback rendering using SVG API service if local library CDN is offline
            const fallbackImg = document.createElement('img');
            fallbackImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(qrPayload);
            fallbackImg.alt = 'Digital Event Pass QR Code';
            qrcodeContainer.appendChild(fallbackImg);
        }
    } catch (err) {
        console.error('QR Generation Error:', err);
        qrcodeContainer.innerHTML = '<p class="alert alert-warning">Failed to render QR Code. Please refresh.</p>';
    }
}
