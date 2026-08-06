# 🎯 Scavenger Hunt

Eine moderne Full-Stack-Webanwendung zum Erstellen, Teilen und Spielen standortbasierter Schnitzeljagden mit Multimedia-Inhalten, QR-Code-Unterstützung, Fortschrittsverfolgung sowie responsivem Light und Dark Mode.

## 🚀 Features

### Für Hunt-Ersteller
- 🗺️ **Interaktive Karten**: Erstelle Schnitzeljagden mit Leaflet-Kartenintegration
- 🎵 **Multimedia-Hinweise**: Füge Audiodateien und Bilder zu Hinweisen hinzu
- 🎯 **Drag & Drop**: Einfache Bedienung mit @hello-pangea/dnd
- 📱 **QR-Code-Generierung**: Automatische QR-Code-Erstellung für einfaches Teilen
- 👥 **Benutzerverwaltung**: Sichere Authentifizierung mit FastAPI-Users

### Für Spieler
- 🎮 **Intuitive Benutzeroberfläche**: Moderne React-basierte Spieloberfläche
- 🌍 **Geolocation**: Standortbasierte Hinweise und Überprüfungen
- 🌐 **Mehrsprachigkeit**: Benutzeroberfläche auf Deutsch, Englisch und Polnisch
- 📱 **Mobile-Optimiert**: Responsive Design für alle Geräte
- 📷 **QR-Code-Scanner**: Teilnahme durch Scannen eines QR-Codes mit der Gerätekamera oder durch Auswahl eines QR-Code-Bildes
- 🌗 **Light und Dark Mode**: Auswahl zwischen einem hellen Farbschema und einem Dark Mode im dunklen Holzstil

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Moderne, schnelle Python Web-Framework
- **PostgreSQL** - Robuste relationale Datenbank
- **SQLAlchemy** - ORM mit Async-Unterstützung
- **FastAPI-Users** - Benutzerauthentifizierung und -verwaltung
- **Pydantic** - Datenvalidierung und -serialisierung

### Frontend
- **React 19** - Moderne UI-Bibliothek
- **Vite** - Schnelles Build-Tool
- **React Router** - Client-seitiges Routing
- **Leaflet** - Interaktive Karten
- **React-QR-Code** - QR-Code-Generierung
- **jsQR** - Auslesen von QR-Codes aus Kamerabildern und hochgeladenen Bildern
- **MediaDevices API** - Browserbasierter Kamerazugriff und Kamerawechsel
- **i18next & react-i18next** - Mehrsprachigkeit und Sprachwechsel
- **@hello-pangea/dnd** - Drag-and-Drop-Funktionalität
- **React Icons** - Icons für die Benutzeroberfläche

### Infrastruktur
- **Docker & Docker Compose** - Containerisierung
- **Traefik** - Reverse Proxy mit automatischen SSL-Zertifikaten
- **Let's Encrypt** - Kostenlose SSL-Zertifikate
- **db** - PostgreSQL-Datenbank
- **frontend** - React-Anwendung mit Vite-Build

## 📦 Installation & Setup

### Voraussetzungen
- Docker & Docker Compose
- Node.js 18+ (für lokale Entwicklung)
- Python 3.8+ (für lokale Entwicklung)

1. **Repository klonen**
   ```bash
   git clone https://github.com/notWetro/scavenger_hunt.git
   cd scavenger_hunt
   ```

### Produktionsdeployment

2. **Domain konfigurieren** (Ersetze `deine.domain` mit deiner echten Domain):
   - **Backend** (`backend/main.py`): CORS origins aktualisieren, `localhost:3000` entfernen
   - **Frontend** (`frontend/vite.config.js`): `allowedHosts: ['deine.domain']` aktualisieren
   - **Docker Compose** (`docker-compose.yaml`):
     ```yaml
     frontend:
       environment:
         - VITE_API_BASE=https://deine.domain/api
       labels:
         - "traefik.http.routers.frontend.rule=Host(`deine.domain`)"

     backend:
       labels:
         - "traefik.http.routers.backend.rule=Host(`deine.domain`) && PathPrefix(`/api`)"

     traefik:
       command:
         - "--certificatesresolvers.letsencrypt.acme.email=deine-email@domain.com"
     ```

3. **Produktionsumgebung starten**
   ```bash
   docker-compose up -d
   ```

Die Anwendung ist dann unter `https://deine.domain` erreichbar.

### Lokale Entwicklung

```bash
docker-compose -f docker-compose-local.yaml up -d
```

## 🔧 Konfiguration

### Umgebungsvariablen

**Backend:**
- `DATABASE_URL` - PostgreSQL-Verbindungsstring
- `SECRET` - JWT-Secret für Authentifizierung

**Frontend:**
- `VITE_API_BASE=https://deine.domain/api` - Backend-API-URL

### Docker Compose Services

- **traefik** - Reverse Proxy (Port 80, 443)
- **db** - PostgreSQL Datenbank
- **backend** - FastAPI-Anwendung
- **frontend** - React-Anwendung (Vite Build)

## 🗂️ Projektstruktur

```
scavenger_hunt/
├── backend/                  # FastAPI Backend
│   ├── main.py              # Haupt-API-Datei
│   ├── schemas.py           # Pydantic-Modelle
│   ├── requirements.txt     # Python-Dependencies
│   └── dockerfile           # Backend Docker-Image
├── frontend/                 # React Frontend
│   ├── src/                 # Quellcode
│   ├── public/              # Statische Assets
│   ├── package.json         # Node.js Dependencies
│   └── Dockerfile           # Frontend Docker-Image
├── media/                    # Upload-Verzeichnis für Medien
├── docker-compose.yaml       # Produktions-Setup
└── docker-compose-local.yaml # Entwicklungs-Setup
```

## 🎮 Verwendung

1. **Account erstellen** - Registriere dich auf der Plattform
2. **Schnitzeljagd erstellen** - Nutze den Hunt-Editor zum Erstellen
3. **Hinweise hinzufügen** - Füge Standorte, Texte, Bilder und Audiodateien hinzu
4. **Schnitzeljagd teilen** - Generiere einen QR-Code oder teile den sechsstelligen Hunt-Code
5. **Beitreten und spielen** - Andere Spieler können den Hunt-Code eingeben oder den zugehörigen QR-Code scannen

## 👥 Projektbeteiligte

Die ursprüngliche Anwendung wurde von Hikmet Gözaydin und Niklas Fichtner an der Hochschule Aalen unter der Leitung von Dr. Marc Hermann entwickelt.

Fabian Wottke ergänzte das Farbkonzept, responsive Designverbesserungen, den Light und Dark Mode sowie die Integration des QR-Code-Scanners.

## 📄 Dokumentation

Die Projektdokumentationen befinden sich im Verzeichnis `docs`:

- **QR-Code-Scanner und Designverbesserungen – Sommersemester 2026**  
  `docs/SoSe26/Projektbericht.pdf`

- **Ursprüngliche Projektdokumentation von Hikmet Gözaydin und Niklas Fichtner – Sommersemester 2025**  
  `docs/legacy/SoSe25/Projektbericht.pdf`