# VeritasAI – AI Hallucination Detection System

VeritasAI is a backend system designed to detect hallucinations in Large Language Model (LLM) responses using retrieval-based verification and scoring techniques.

## 🚀 Core Idea

LLMs often generate incorrect or fabricated information ("hallucinations").
VeritasAI extracts claims from responses and verifies them using vector search + scoring.

---

## ⚙️ How It Works

1. **Claim Extraction**

   * Breaks AI response into verifiable claims

2. **Embedding Generation**

   * Converts claims into vector embeddings

3. **Vector Search (Pinecone)**

   * Finds relevant real-world data

4. **Verification Engine**

   * Compares claim vs retrieved data

5. **Scoring System**

   * Assigns confidence score

6. **Audit Logging**

   * Stores results for tracking & analysis

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* Pinecone (Vector DB)
* OpenAI / LLM APIs
* JavaScript (Modular Architecture)

---

## 📂 Project Structure

```
src/
 ├── config/        # DB & Pinecone setup
 ├── middleware/    # Auth & verification pipeline
 ├── models/        # Data models (AuditLog)
 ├── routes/        # API endpoints
 ├── services/      # Core logic (extract, verify, score)
 └── utils/         # Helpers (embeddings, retry, errors)
```

---

## 🔌 API Endpoint

### POST `/verify`

Processes LLM response and checks hallucination:

```json
{
  "input": "AI generated text here"
}
```

---

## ⚙️ Setup

```bash
git clone https://github.com/Ishant8287/VeritasAI-AI-Hallucination-Detection.git
cd VeritasAI-AI-Hallucination-Detection

npm install
npm start
```

---

## 📌 Environment Variables

Create `.env`:

```
GROQ_API_KEY=your_key
PINECONE_API_KEY=your_key
```

---

## 🎯 Future Improvements

* Frontend dashboard
* Better scoring model
* Multi-model support
* Real-time monitoring

---

## 👨‍💻 Author

Ishant Singh
