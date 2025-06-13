# SMS Dashboard

**Security Access Monitor** - Real-time access logging and threat detection dashboard.

---

## 🛡️ Features

- **Real-time Access Monitoring** – Live dashboard showing access attempts
- **Country-based Filtering** – Filter by destination countries
- **Origin Filtering** – Filter by access origins (apps, services, platforms)
- **Advanced Search** – Search through access logs instantly
- **Live Statistics** – Real-time analytics and metrics
- **Modern UI** – Dark glassmorphism theme with smooth animations
- **Responsive Design** – Works perfectly on all devices
- **Auto-refresh** – Data updates every 60 seconds

---

## 🚀 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (existing setup)
- **Styling**: CSS-in-JS with glassmorphism effects
- **Icons**: Lucide React icons

---

## 📊 Database Integration

> The PostgreSQL database is already set up and populated with access data. You do not need to create tables manually.

### Existing Configuration

```js
// Database configuration
const pool = new Pool({
    host: process.env.DB_HOST || '78.26.183.187',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'Access_list_DB',
    user: process.env.DB_USER || 'rico2',
    password: process.env.DB_PASSWORD || 'Hys7ghh$90hasygHen$$101',
    ssl: false,
});
```

Table used: `access_entries`

| Column              | Type                        |
|---------------------|-----------------------------|
| `id`                | SERIAL PRIMARY KEY          |
| `timestamp`         | TIMESTAMP                   |
| `access_origin`     | TEXT                        |
| `access_destination`| TEXT                        |
| `message`           | TEXT                        |

---

## 🔧 Setup Instructions

### Prerequisites
- Node.js 16+ installed
- Access to existing PostgreSQL database

### Backend Setup

```bash
cd backend
npm install
```

1. **Set environment variables** (recommended):
   Create a `.env` file:

```env
DB_HOST=78.26.183.187
DB_PORT=5432
DB_NAME=Access_list_DB
DB_USER=rico2
DB_PASSWORD=Hys7ghh$90hasygHen$$101
PORT=3001
```

2. **Start the backend server:**

```bash
npm start
```

- Runs at: `http://localhost:3001`

---

### Frontend Setup

```bash
cd frontend
npm install
```

1. **Place data files into `public/` folder**:
   - `Daily_sid_gather.txt`
   - `access_destination.txt`

2. **Start frontend:**

```bash
npm start
```

- Runs at: `http://localhost:3000`

---

## 📁 Project Structure

```
SMS_dashboard/
├── backend/
│   ├── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── Daily_sid_gather.txt
│   │   └── access_destination.txt
│   ├── src/
│   │   ├── App.js
│   │   └── index.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## 🎨 Dashboard Highlights

- **Dark Theme** – Sleek glassmorphism UI
- **Live Statistics** – Animated access counters
- **Filters** – Time, Origin, Destination
- **Search** – Fast full-text filter
- **CSV Export** – Filtered data download
- **Auto-Refresh** – Every 60 seconds

---

## 🔐 Security Features

- Real-time connection monitoring
- Input validation & SQL injection protection
- Graceful error handling
- Private repository

---

## 📱 Responsive Design

- Desktop, Tablet, Mobile friendly
- Fluid layouts & animations

---

## 🔄 Data Files

| File                   | Purpose                | Format         | Frequency      |
|------------------------|------------------------|----------------|----------------|
| `Daily_sid_gather.txt` | Access origins         | One per line   | Every few hours|
| `access_destination.txt` | Country destinations | One per line   | As needed      |

---

## 🐛 Troubleshooting

| Issue                    | Solution |
|--------------------------|----------|
| **Backend not starting** | Check DB credentials & connection |
| **Frontend can't connect** | Verify backend is running at port 3001 |
| **Filters not loading** | Ensure `.txt` files exist and are formatted |

---

## 📄 License

Private repository – All rights reserved.

## 👥 Contributors

Internal development team only.

---

**SMS Dashboard** – Professional-grade access visibility and threat detection 🛡️