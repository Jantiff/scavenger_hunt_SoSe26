# 🎯 Scavenger Hunt

A modern full-stack web application for creating, sharing, and playing location-based scavenger hunts with multimedia clues, QR code support, multilingual navigation, progress tracking, and responsive light and dark themes.

## 🚀 Features

### For Hunt Creators
- 🗺️ **Interactive Maps**: Create scavenger hunts with Leaflet map integration
- 🎵 **Multimedia Clues**: Add audio files and images to clues
- 🎯 **Drag & Drop**: Easy interaction with @hello-pangea/dnd
- 📱 **QR Code Generation**: Automatic QR code creation for easy sharing
- 👥 **User Management**: Secure authentication with FastAPI-Users

### For Players
- 🎮 **Intuitive Interface**: Modern React-based gaming interface
- 🌍 **Geolocation**: Location-based clues and verification
- 🌐 **Multi-language Support**: English, German and Polish interface translation support
- 📱 **Mobile-Optimized**: Responsive design for all devices
- 📷 **QR Code Scanner**: Join hunts by scanning a QR code with the device camera or selecting a QR code image
- 🌗 **Light & Dark Mode**: Switch between a light theme and a dark wood-inspired theme

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - ORM with async support
- **FastAPI-Users** - User authentication and management
- **Pydantic** - Data validation and serialization

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Leaflet** - Interactive maps
- **React-QR-Code** - QR code generation
- **jsQR** - QR code decoding from camera frames and uploaded images
- **MediaDevices API** - Browser-based camera access and camera switching
- **i18next & react-i18next** - Internationalization and language switching
- **@hello-pangea/dnd** - Drag-and-drop question management
- **React Icons** - Interface icons

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Traefik** - Reverse proxy with automatic SSL certificates
- **Let's Encrypt** - Free SSL certificates

## 📦 Installation & Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.8+ (for local development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jantiff/scavenger_hunt_SoSe26.git
   cd scavenger_hunt_SoSe26
   ```

### Production Deployment

2. **Configure your domain** (Replace `your.domain` with your actual domain):
   - **Backend** (`backend/main.py`): Update CORS origins, remove `localhost:3000`
   - **Frontend** (`frontend/vite.config.js`): Update `allowedHosts: ['your.domain']`
   - **Docker Compose** (`docker-compose.yaml`):
     ```yaml
     frontend:
       environment:
         - VITE_API_BASE=https://your.domain/api
       labels:
         - "traefik.http.routers.frontend.rule=Host(`your.domain`)"

     backend:
       labels:
         - "traefik.http.routers.backend.rule=Host(`your.domain`) && PathPrefix(`/api`)"

     traefik:
       command:
         - "--certificatesresolvers.letsencrypt.acme.email=your-email@domain.com"
     ```

3. **Start production environment**
   ```bash
   docker-compose up -d
   ```

The application will be available at `https://your.domain`.

### Local Development

```bash
docker-compose -f docker-compose-local.yaml up -d
```

## 🔧 Configuration

### Environment Variables

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET` - JWT secret for authentication

**Frontend:**
- `VITE_API_BASE=https://your.domain/api` - Backend API URL

### Docker Compose Services

- **traefik** - Reverse proxy (Port 80, 443)
- **db** - PostgreSQL database
- **backend** - FastAPI application
- **frontend** - React application (Vite build)

## 🗂️ Project Structure

```
scavenger_hunt/
├── backend/                  # FastAPI Backend
│   ├── main.py              # Main API file
│   ├── schemas.py           # Pydantic models
│   ├── requirements.txt     # Python dependencies
│   └── dockerfile           # Backend Docker image
├── frontend/                 # React Frontend
│   ├── src/                 # Source code
│   ├── public/              # Static assets
│   ├── package.json         # Node.js dependencies
│   └── Dockerfile           # Frontend Docker image
├── media/                    # Upload directory for media
├── docker-compose.yaml       # Production setup
└── docker-compose-local.yaml # Development setup
```

## 🎮 Usage

1. **Create Account** - Register on the platform
2. **Create Scavenger Hunt** - Use the hunt editor to create hunts
3. **Add Clues** - Add locations, texts, images, and audio
4. **Share the Hunt** - Generate a QR code, copy the share link, or provide the six-digit hunt code
5. **Join and Play** - Players can enter the hunt code or scan its QR code and complete the questions in sequence

## 👥 Project Contributors

The original application was developed by Hikmet Gözaydin and Niklas Fichtner at Aalen University under the supervision of Dr. Marc Hermann.

Fabian Wottke subsequently contributed the application’s color concept, responsive design improvements, light and dark themes, and the integration of the QR code scanner.

## 📄 Documentation

The project documentation is located in the `docs` directory:

- **Original project documentation by Hikmet Gözaydin and Niklas Fichtner – Summer Semester 2025**  
  `docs/legacy/SoSe25/Projektbericht.pdf`

  - **QR Code Scanner and design improvements – Summer Semester 2026**  
  `docs/SoSe26/Projektbericht.pdf`

