# 🚀 EventPass — QR-Based Digital Event Registration & Entry System

EventPass simplifies campus event registration and entry management using unique digital QR passes, touchless gate scanning, and live attendance analytics.

---

## 📂 Project Architecture

```
eventpass/
│
├── frontend/
│   ├── index.html              # Landing Page & Role Selector
│   ├── student_dashboard.html  # Student Registration & Dynamic QR Pass View
│   ├── faculty_dashboard.html  # Faculty Gate Control & Live Attendance Stats
│   ├── css/
│   │   └── style.css           # Modern, separated CSS stylesheet
│   └── js/
│       ├── student.js          # Dynamic QR Code Generator logic
│       └── faculty.js          # Entry verification & Live Stats logic
│
├── backend/                    # Flask backend (Step 3+)
│
└── README.md                   # Documentation
```

---

## 🚀 How to Run the Frontend Prototype (Step 1 & Step 2)

1. Open `frontend/index.html` in any web browser.
2. Select **Student Portal**:
   - Fill out your details and select a campus event.
   - Click **Generate Dynamic QR Pass**.
   - Your personalized QR Pass with unique ticket code will render instantly.
3. Select **Faculty Portal**:
   - Inspect live attendance metrics (Total Registered, Checked In, Attendance Rate).
   - Enter your pass code (e.g. `EP-TECHFEST 2026-391024`) or copy the code from your generated pass.
   - Click **Verify Pass & Allow Entry** to record check-in and update attendance live.
