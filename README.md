# 🚀 VeritasAI — AI Hallucination Detection System

A full-stack middleware that detects and verifies hallucinations in LLM outputs by breaking responses into factual claims and validating them using vector search + LLM scoring.

> Built to solve a critical problem: LLMs generating incorrect or fabricated information.

---

## 🧠 Overview

VeritasAI acts as a verification layer between LLMs and end users.

Instead of blindly trusting LLM outputs:
- Extracts individual factual claims
- Matches them against a knowledge base (vector DB)
- Verifies each claim using evidence or LLM fallback
- Logs everything for auditing

Result: Reliable and explainable AI outputs.

---

## ⚙️ Tech Stack

- Backend: Node.js, Express  
- Frontend: React (Vite)  
- Database: MongoDB  
- Vector Database: Pinecone  
- LLM: Groq (Llama 3.3 70B)  
- Embeddings: MiniLM-L6-v2 (local via Transformers.js)

---

## 🔄 Verification Pipeline

1. Claim Extraction  
   Extracts factual claims from LLM response using Groq

2. Embedding  
   Converts each claim into 384-dimension vector (local, no API cost)

3. Vector Search  
   Retrieves top matches from Pinecone knowledge base

4. Verification Routing  
   - If similarity >= 0.75 → use KB evidence  
   - Else → fallback to LLM evaluation

5. Scoring  
   Returns verdict, confidence, and reasoning

6. Audit Logging  
   Stores all results in MongoDB (30-day TTL)

---

## 🔥 Key Features

- AI hallucination detection middleware  
- Claim-level verification (not whole response)  
- Hybrid verification (Vector DB + LLM fallback)  
- Auto-learning system (verified claims cached back to Pinecone)  
- Deduplication to prevent redundant API calls  
- Graceful degradation (handles API failures safely)  
- Role-ready API system for integration  

---

## 🏗️ Project Structure

veritasAI/
├── veritasAI-backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── scripts/
│   ├── app.js
│   ├── server.js
│   └── .env.example
└── veritasAI-frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   └── pages/
    └── .env.example

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js >= 18
- Pinecone account (index: 384 dimension, cosine metric)
- Groq API key
- MongoDB URI

---

### Backend Setup

cd veritasAI-backend  
npm install  

cp .env.example .env  

# Seed knowledge base  
npm run seed  

# Start server  
npm start  

---

### Frontend Setup

cd veritasAI-frontend  
npm install  

cp .env.example .env.local  

npm run dev  

---

## 🔌 API Reference

### POST /api/verify

Verifies claims in an LLM response.

Request:
```json
{
  "llmResponse": "The speed of light is 300,000 km/s"
}
