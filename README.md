# SMS Dashboard - Security Access Monitor

**Real-time access logging and threat detection dashboard** for monitoring security access attempts across multiple platforms and destinations.

---

## 🛡️ Features

- **Real-time Access Monitoring** – Live dashboard showing access attempts with auto-refresh
- **Advanced Filtering** – Filter by time range, origin, destination, and search messages
- **Country-based Analysis** – Monitor access attempts by destination countries
- **Origin Tracking** – Track access attempts from various platforms and services
- **Live Statistics** – Real-time analytics showing total records, time spans, and unique origins
- **Modern UI** – Dark glassmorphism theme with smooth animations and responsive design
- **Data Export** – Export filtered data to CSV format
- **Auto-refresh** – Data updates automatically every 60 seconds

---

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework with custom glassmorphism effects
- **Lucide React** - Beautiful, customizable icons
- **CSS-in-JS** - Custom animations and transitions

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **PostgreSQL** - Robust relational database
- **CORS** - Cross-origin resource sharing middleware

---

## 📊 Database Schema

The application connects to an existing PostgreSQL database with the following configuration:

```javascript
// Database Configuration
const pool = new Pool({
    host: '78.26.183.187',
    port: 5432,
    database: 'Access_list_DB',
    user: 'rico',
    password: 'Hys7ghh$90hasygHen$$101',
    ssl: false,
});
```

### Table Structure: `access_entries`

| Column              | Type                        | Description                    |
|---------------------|-----------------------------|--------------------------------|
| `id`                | SERIAL PRIMARY KEY          | Unique identifier              |
| `timestamp`         | TIMESTAMP                   | When the access attempt occurred |
| `access_origin`     | TEXT                        | Source of the access attempt   |
| `access_destination`| TEXT                        | Destination country/location   |
| `message`           | TEXT                        | Additional details or logs     |

---

## 🔧 Installation & Setup

### Prerequisites
- **Node.js 16+** installed on your system
- Access to the existing PostgreSQL database
- Git for version control

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sms-dashboard
```

### 2. Install Dependencies

Install all dependencies for both frontend and backend:

```bash
npm run install:all
```

Or install manually:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=78.26.183.187
DB_PORT=5432
DB_NAME=Access_list_DB
DB_USER=rico
DB_PASSWORD=Hys7ghh$90hasygHen$$101

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 4. Data Files Setup

Ensure the following files are present in `frontend/public/`:

- **`Daily_sid_gather.txt`** - List of access origins (platforms, services)
- **`access_destination.txt`** - List of destination countries

These files are automatically loaded by the frontend for filtering options.

### 5. Start the Application

#### Development Mode (Recommended)
```bash
npm run dev
```

This starts both backend and frontend concurrently:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

#### Production Mode
```bash
npm start
```

---

## 📁 Project Structure

```
sms-dashboard/
├── backend/                    # Express.js API server
│   ├── server.js              # Main server file
│   ├── .env                   # Environment variables
│   ├── .env.example           # Environment template
│   └── package.json           # Backend dependencies
├── frontend/                   # React application
│   ├── public/                # Static assets
│   │   ├── Daily_sid_gather.txt    # Access origins data
│   │   ├── access_destination.txt  # Countries data
│   │   └── index.html         # HTML template
│   ├── src/                   # React source code
│   │   ├── App.js             # Main dashboard component
│   │   ├── App.css            # Custom styles and animations
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Global styles
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── postcss.config.js      # PostCSS configuration
│   └── package.json           # Frontend dependencies
├── package.json               # Root package.json with scripts
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

---

## 🎨 Dashboard Features

### Real-time Monitoring
- **Live Data Updates** - Automatic refresh every 60 seconds
- **Connection Status** - Visual indicators for database connectivity
- **Error Handling** - Graceful error messages and retry mechanisms

### Advanced Filtering
- **Time Range Filter** - Last 1 Hour, 6 Hours, 24 Hours, 7 Days, 30 Days
- **Search Messages** - Full-text search across all message content
- **Access Origin Filter** - Filter by specific platforms or services
- **Country Destination Filter** - Filter by destination countries

### Data Visualization
- **Live Statistics** - Real-time counters for records, time spans, and origins
- **Color-coded Badges** - Visual indicators for different types of access attempts
- **Responsive Tables** - Mobile-friendly data presentation
- **Export Functionality** - Download filtered data as CSV

### User Experience
- **Dark Theme** - Professional glassmorphism design
- **Smooth Animations** - Subtle transitions and loading states
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Keyboard Navigation** - Full accessibility support

---

## 🔐 Security Features

- **SQL Injection Protection** - Parameterized queries and input validation
- **CORS Configuration** - Controlled cross-origin access
- **Environment Variables** - Secure credential management
- **Error Handling** - No sensitive information exposed in errors
- **Connection Pooling** - Efficient database connection management

---

## 📊 API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and timestamp.

### Get All Tables
```
GET /api/tables
```
Returns list of available database tables.

### Get Table Data
```
GET /api/data/:tableName?limit=100
```
Returns data from specified table with optional limit.

### Get Table Statistics
```
GET /api/stats/:tableName
```
Returns statistics for specified table.

---

## 🚀 Deployment

### Frontend Build
```bash
cd frontend
npm run build
```

### Production Considerations
- Set `NODE_ENV=production` in backend environment
- Configure reverse proxy (nginx/Apache) for production
- Set up SSL certificates for HTTPS
- Configure database connection pooling
- Set up monitoring and logging

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Backend won't start** | Check database credentials and network connectivity |
| **Frontend can't connect to API** | Verify backend is running on port 3001 |
| **Filters not loading** | Ensure `.txt` files exist in `frontend/public/` |
| **Database connection errors** | Verify PostgreSQL server is accessible |
| **Build failures** | Clear `node_modules` and reinstall dependencies |

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
```

### Database Connection Test
```bash
cd backend
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: '78.26.183.187',
  port: 5432,
  database: 'Access_list_DB',
  user: 'rico',
  password: 'Hys7ghh$90hasygHen$$101'
});
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? err : res.rows[0]);
  pool.end();
});
"
```

---

## 📈 Performance Optimization

- **Database Indexing** - Ensure proper indexes on timestamp and origin columns
- **Connection Pooling** - Configured for optimal database performance
- **Frontend Caching** - Static assets cached for faster loading
- **Lazy Loading** - Large datasets loaded incrementally
- **Debounced Search** - Optimized search input handling

---

## 🔄 Data Management

### Data Sources
- **Access Origins** - Loaded from `Daily_sid_gather.txt`
- **Destination Countries** - Loaded from `access_destination.txt`
- **Access Logs** - Retrieved from PostgreSQL database

### Data Refresh
- **Automatic** - Every 60 seconds
- **Manual** - Click refresh button
- **On Filter Change** - Immediate update

---

## 📄 License

**Private Repository** - All rights reserved.

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 👥 Support

For technical support or questions:
- Check the troubleshooting section above
- Review server logs for error details
- Verify database connectivity and credentials

---

**SMS Dashboard** - Professional-grade security access monitoring and threat detection 🛡️

*Built with modern web technologies for real-time security monitoring and analysis.*