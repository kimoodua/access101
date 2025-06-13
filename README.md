# SMS Dashboard

Security Access Monitor - Real-time access logging and threat detection dashboard.

## 🛡️ Features

- **Real-time Access Monitoring** - Live dashboard showing access attempts
- **Country-based Filtering** - Filter by destination countries
- **Origin Filtering** - Filter by access origins (apps, services, platforms)
- **Advanced Search** - Search through access logs instantly
- **Live Statistics** - Real-time analytics and metrics
- **Modern UI** - Dark glassmorphism theme with smooth animations
- **Responsive Design** - Works perfectly on all devices
- **Auto-refresh** - Real-time data updates every 60 seconds

## 🚀 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, PostgreSQL
- **Database**: PostgreSQL with access_entries table
- **Styling**: CSS-in-JS with glassmorphism effects
- **Icons**: Lucide React icons

## 📊 Database Schema

```sql
CREATE TABLE access_entries (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP,
    access_origin TEXT,
    access_destination TEXT,
    message TEXT
);
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 16+ installed
- PostgreSQL database running
- Access to database with provided credentials

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure database connection:**
   - Update database credentials in `server.js`
   - Or create `.env` file with your database configuration

4. **Start the backend server:**
```bash
npm start
```

Backend will run on `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Add data files to public folder:**
   - Place `Daily_sid_gather.txt` in `public/` folder
   - Place `access_destination.txt` in `public/` folder

4. **Start the frontend:**
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
SMS_dashboard/
├── backend/
│   ├── server.js           # Express server with PostgreSQL connection
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables (optional)
├── frontend/
│   ├── public/
│   │   ├── index.html             # Main HTML template
│   │   ├── Daily_sid_gather.txt   # Access origins data
│   │   └── access_destination.txt # Countries data
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── App.css         # Custom styling
│   │   └── index.js        # React entry point
│   ├── package.json        # Frontend dependencies
│   └── tailwind.config.js  # Tailwind configuration
├── README.md              # This file
└── .gitignore            # Git ignore rules
```

## 🎨 Features Overview

### Dashboard Interface
- **Modern Dark Theme** - Professional glassmorphism design
- **Real-time Statistics** - Live counters with animations
- **Color-coded Badges** - Visual indicators for different access types
- **Responsive Layout** - Adapts to all screen sizes

### Filtering System
- **Time Range Filter** - Last 1 hour, 6 hours, 24 hours, etc.
- **Search Messages** - Full-text search through all access data
- **Access Origin Filter** - Filter by thousands of different origins
- **Country Destination** - Filter by 190+ countries worldwide

### Data Management
- **Dynamic File Loading** - Origins and countries loaded from files
- **Auto-refresh** - Data updates every 60 seconds
- **Export Functionality** - Download filtered data as CSV
- **Real-time Updates** - Live connection status monitoring

## 🔐 Security Features

- **Connection Monitoring** - Real-time database connection status
- **Error Handling** - Graceful error handling and fallbacks
- **Data Validation** - Input validation and SQL injection protection
- **Private Repository** - Secure code storage

## 📱 Responsive Design

The dashboard works perfectly on:
- **Desktop** - Full feature set with hover effects
- **Tablet** - Optimized layout for medium screens
- **Mobile** - Touch-friendly interface with stacked layout

## 🎯 Color Coding System

- 🔴 **Red badges** - External access (security alerts)
- 🟢 **Green badges** - Internal access (safe operations)
- 🟣 **Purple badges** - Admin access (elevated permissions)
- 🔵 **Blue badges** - Standard access (neutral)

## 🔄 Data Updates

### Access Origins
- File: `Daily_sid_gather.txt`
- Update frequency: Every few hours
- Format: One origin per line

### Country Destinations  
- File: `access_destination.txt`
- Update frequency: As needed
- Format: One country per line

## 🛠️ Configuration

### Database Configuration
Update the database connection settings in `backend/server.js`:

```javascript
const pool = new Pool({
  host: 'your-host',
  port: 5432,
  database: 'your-database',
  user: 'your-username',
  password: 'your-password',
  ssl: false
});
```

### Environment Variables (Recommended)
Create a `.env` file in the backend directory:

```env
DB_HOST=your-host
DB_PORT=5432
DB_NAME=your-database
DB_USER=your-username
DB_PASSWORD=your-password
PORT=3001
```

## 📈 Performance

- **Fast Loading** - Optimized queries and efficient rendering
- **Smooth Animations** - 60fps animations and transitions
- **Memory Efficient** - Clean up resources and prevent memory leaks
- **Scalable** - Handles thousands of access entries efficiently

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check database credentials
- Ensure PostgreSQL is running
- Verify database permissions

**Frontend shows "Connection Failed":**
- Ensure backend is running on port 3001
- Check CORS configuration
- Verify API endpoints are accessible

**Filters not loading:**
- Check if data files exist in `public/` folder
- Verify file format (one entry per line)
- Check browser console for errors

## 📄 License

Private repository - All rights reserved.

## 👥 Contributors

Internal development team only.

---

**SMS Dashboard** - Professional security access monitoring solution 🛡️
