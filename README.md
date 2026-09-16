# 🎟️ Box Booking Web Application (React + Node.js + MySQL)

A full-stack box/seat booking application featuring 3 dedicated webpages, real-time box state tracking, popups for user actions, payment simulation, and persistent storage in MySQL.

---

## 🚀 Features & Pages

### 1. **Username Page (`/`)**
- Unique username input with an **"Enter"** action button.
- Validates input and initializes a user session.
- Seamlessly redirects to the **Booking Grid** page.

### 2. **Booking Page (`/booking`)**
- **36 Interactive Boxes** with real-time color coding:
  - ⚪ **White Box (Available)**: Free to be selected. Clicking toggles selection with a glowing highlight.
  - 🔴 **Red Box (Booked by Others)**: Clicking triggers a popup: *"This has been booked by someone else."*
  - 🟢 **Green Box (Booked by You)**: Clicking triggers a popup: *"You have already booked this box"* with an option to **"Revoke Booking"** (releasing it back to white).
- **Payment Button (Bottom Center)**:
  - If **no boxes are selected**: Displays a popup alert: *"Please select at least one box to proceed."*
  - If boxes are selected: Routes to the **Payment Page**.

### 3. **Payment Page (`/payment`)**
- Displays order breakdown: username, selected box IDs, price per box, tax, and total.
- **Two Decision Buttons**:
  - **"Payment Done"**: Confirms booking in MySQL, triggers celebratory confetti + *"Payment Successful"* modal, and redirects to the booking page where selected boxes turn **Green**.
  - **"Payment Cannot Be Done"**: Displays *"Payment Unsuccessful"* modal and redirects back to the booking page without booking (boxes stay **White**).

---

## 📂 Project Structure

```
box-booking-app/
├── backend/
│   ├── .env                # MySQL connection configuration
│   ├── db.js               # MySQL connection & auto-table initializers
│   ├── schema.sql          # MySQL database & table definitions
│   ├── server.js           # Express REST API
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Modal.jsx   # Interactive popup modals for alerts/revoking/payment
    │   │   └── Navbar.jsx  # Header with active user and DB status
    │   ├── context/
    │   │   └── AuthContext.jsx # User & selection state management
    │   ├── pages/
    │   │   ├── UsernamePage.jsx # Page 1: Unique username input
    │   │   ├── BookingPage.jsx  # Page 2: Interactive box grid
    │   │   └── PaymentPage.jsx  # Page 3: Payment confirmation
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    └── package.json
```

---

## 🛠️ How to Run

### Step 1: Start the Backend
Open a terminal in `backend/`:
```bash
cd backend
npm install
node server.js
```
*(By default, connects to MySQL at `localhost:3306` with user `root`. If MySQL is not running locally, it automatically falls back to instant persistent local storage so you can test immediately without setup).*

### Step 2: Start the Frontend
Open a second terminal in `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:3000** in your browser!
