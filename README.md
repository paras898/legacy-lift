# 🚀 LegacyLift

> **AI-powered legacy code migration platform** — Analyze, migrate, and compare legacy codebases to modern frameworks using Google Gemini LLM.

---

## 📌 Overview

**LegacyLift** is a full-stack AI-powered tool that helps developers migrate legacy code (VB6, COBOL, Classic ASP, etc.) to modern frameworks like **Spring Boot**. It leverages **Google Gemini LLM API** to intelligently analyze code, detect risks, generate migrated code, and produce a side-by-side diff comparison — all through a clean REST API pipeline and an intuitive frontend interface.

---

## ✨ Features

- 🔍 **Code Analysis** — Detect programming language, categorize code components (e.g., hardcoded DB credentials, business logic, UI layer), assess migration risk, and estimate how much of the code can be migrated
- 🔄 **AI-Driven Code Migration** — Generate equivalent modern code (Spring Boot / Java) from legacy source using Gemini LLM
- 📊 **Diff Comparison** — View the original legacy code and migrated code side by side with a structured comparison
- ⚡ **Chained API Pipeline** — 3-stage API flow where each stage builds on the previous result using a shared result ID
- 🔐 **Secure API Key Management** — Gemini API key handled securely via environment configuration

---

## 🏗️ Architecture

```
┌─────────────┐        ┌──────────────────────────────────────────────┐
│   Frontend  │◄──────►│              Spring Boot Backend              │
│  (React/FE) │        │                                              │
└─────────────┘        │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
                        │  │  API 1   │  │  API 2   │  │  API 3   │  │
                        │  │ Analyze  │→ │ Migrate  │→ │  Diff    │  │
                        │  └──────────┘  └──────────┘  └──────────┘  │
                        │                    │                         │
                        └────────────────────┼─────────────────────────┘
                                             │
                                    ┌────────▼────────┐
                                    │  Google Gemini  │
                                    │    LLM API      │
                                    └─────────────────┘
```

---

## 🔌 API Reference

### API 1 — Code Analysis
**`POST /api/v1/analyze`**

Submit legacy code for AI analysis.

**Request Body:**
```json
{
  "code": "<your legacy code here>"
}
```

**Response:**
```json
{
  "resultId": "abc123",
  "language": "VB6",
  "category": ["HARDCODED_DB", "BUSINESS_LOGIC", "UI_LAYER"],
  "canMigrate": true,
  "migrationPercentage": 78,
  "riskLevel": "MEDIUM",
  "riskDetails": "Hardcoded DB connection strings detected. UI layer tightly coupled with business logic."
}
```

---

### API 2 — Code Migration
**`POST /api/v1/migrate`**

Trigger AI-powered code migration using the result ID from API 1.

**Request Body:**
```json
{
  "resultId": "abc123"
}
```

**Response:**
```json
{
  "resultId": "abc123",
  "migratedCode": "// Spring Boot equivalent code...",
  "targetFramework": "Spring Boot",
  "status": "SUCCESS"
}
```

---

### API 3 — Code Comparison
**`GET /api/v1/compare/{resultId}`**

Fetch the original and migrated code with a structured diff comparison.

**Response:**
```json
{
  "resultId": "abc123",
  "originalCode": "// Legacy VB6 code...",
  "migratedCode": "// Spring Boot code...",
  "diff": [
    { "line": 1, "type": "REMOVED", "content": "Dim conn As ADODB.Connection" },
    { "line": 1, "type": "ADDED",   "content": "@Autowired private DataSource dataSource;" }
  ]
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java, Spring Boot |
| Frontend | React (or Angular) |
| AI / LLM | Google Gemini API |
| API Style | RESTful JSON APIs |
| Build Tool | Maven / Gradle |
| Config | Environment Variables (.env) |

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+ (for frontend)
- Google Gemini API Key → [Get one here](https://aistudio.google.com/app/apikey)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/LegacyLift.git
cd LegacyLift/backend

# Set your Gemini API key in application.properties or .env
GEMINI_API_KEY=your_api_key_here

# Run the Spring Boot application
./mvnw spring-boot:run
```

### Frontend Setup

```bash
cd LegacyLift/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` (or `3000` depending on your setup).

---

## 🔐 Environment Variables

Create an `application.properties` or `.env` file with the following:

```properties
# Gemini LLM API Key
GEMINI_API_KEY=your_google_gemini_api_key

# Server config
SERVER_PORT=8080
```

> ⚠️ **Never commit your API key to GitHub.** Add `.env` and `application-local.properties` to `.gitignore`.

---

## 📁 Project Structure

```
LegacyLift/
├── backend/
│   ├── src/
│   │   ├── main/java/com/legacylift/
│   │   │   ├── controller/          # REST API controllers (API 1, 2, 3)
│   │   │   ├── service/             # Business logic + Gemini integration
│   │   │   ├── model/               # Request/Response DTOs
│   │   │   └── config/              # Gemini API config
│   │   └── resources/
│   │       └── application.properties
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/              # UI components (Editor, Diff viewer, Results)
│   │   ├── pages/                   # Analyze, Migrate, Compare pages
│   │   └── services/                # API call functions
│   └── package.json
│
└── README.md
```

---

## 💡 How It Works

1. **Paste** your legacy code (VB6, COBOL, Classic ASP, etc.) into the UI
2. **API 1** sends the code to Gemini LLM → returns language detection, component categories, risk level, and migration feasibility
3. **API 2** uses the result ID to trigger Gemini to generate the migrated Spring Boot equivalent
4. **API 3** fetches both versions and renders a line-by-line diff comparison

---

## 🗺️ Roadmap

- [ ] Support for more target frameworks (Django, Node.js, .NET)
- [ ] File upload support for bulk migration
- [ ] Export migrated code as `.zip`
- [ ] Migration history dashboard
- [ ] Authentication & user sessions

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

[MIT](LICENSE)

---

## 👤 Author

**Your Name**  
[GitHub](https://github.com/paras898) · [LinkedIn](https://linkedin.com/in/paras898)

---

> *LegacyLift — Because legacy code deserves a second life.* 🔁
