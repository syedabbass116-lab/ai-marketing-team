# Ghostscribe Autonomous Content Engine - Setup Instructions

## Overview

The Ghostscribe autonomous content engine is **already implemented** in your codebase! The backend has the full pipeline (transcription → insight extraction → opportunity scoring → post generation) and the frontend has the "Today's Post" dashboard with capture functionality.

## What's Already Implemented

### Backend (FastAPI)
- ✅ `services/engine_routes.py` - Full API endpoints for the engine
- ✅ `services/transcription.py` - Provider-agnostic speech-to-text (Groq/OpenAI/fallback)
- ✅ `services/pipeline.py` - Chunking, insight extraction, opportunity scoring
- ✅ `services/memory.py` - Content memory and repetition detection
- ✅ `services/integrations.py` - Integration abstraction for Zoom/LinkedIn/Google
- ✅ `agents/engine_agent.py` - Grounded post generation with provenance
- ✅ Database migration: `database_migration_engine.sql`

### Frontend (React + Vite)
- ✅ `src/components/views/Home.tsx` - Today's Post dashboard
- ✅ `src/hooks/useEngine.ts` - Engine state management
- ✅ `src/components/engine/` - TodaysPostCard, CaptureModal, ProcessingBanner
- ✅ `src/lib/engineApi.ts` - API client with fallback data
- ✅ `src/components/views/CaptureView.tsx` - Audio recording UI
- ✅ `src/components/views/OpportunitiesView.tsx` - Content opportunities
- ✅ `src/components/views/SourcesView.tsx` - Source management

## Setup Steps

### 1. Run Database Migration

Go to your Supabase SQL Editor and run:

```sql
-- Copy contents from database_migration_engine.sql
-- This creates: sources, transcripts, insights, content_opportunities, engine_posts, content_memory, integrations tables
```

### 2. Configure Backend Environment Variables

Edit `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
TRANSCRIPTION_PROVIDER=groq
```

### 3. Configure Frontend Environment Variables

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

### 4. Start Backend Server

```bash
cd backend
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Start Frontend Server

```bash
cd frontend
npm run dev
```

### 6. Test the Workflow

1. Open `http://localhost:5173`
2. Navigate to Home (you should see "Today's Post" dashboard)
3. Click "Start 60-Sec Voice Note" or "Upload Audio File"
4. Record/upload audio
5. Watch the processing banner (transcribing → extracting → scoring → generating)
6. See "Today's Post" appear with provenance and metrics
7. Approve, Edit, or Regenerate the post
8. Copy to clipboard

## API Endpoints

- `GET /api/engine/todays-post` - Get today's recommended post
- `POST /api/engine/capture/upload` - Upload audio for processing
- `POST /api/engine/capture/quick-thought` - Submit quick text thought
- `GET /api/engine/jobs/{job_id}` - Poll job status
- `POST /api/engine/posts/{post_id}/action` - Approve/edit/regenerate post
- `GET /api/engine/opportunities` - Get content opportunities
- `POST /api/engine/opportunities/{opp_id}/generate` - Generate post from opportunity
- `GET /api/engine/sources` - Get all sources
- `DELETE /api/engine/sources/{source_id}` - Delete source
- `GET /api/engine/integrations` - Get integration statuses
- `GET /api/engine/memory` - Get content memory

## Architecture

### Audio Processing Pipeline

```
Audio Upload
→ Transcription (Groq Whisper / OpenAI / Fallback)
→ Semantic Chunking
→ Insight Extraction (LLM)
→ Opportunity Scoring (9 factors)
→ Angle Selection
→ Post Generation (Grounded in source)
→ Today's Post
```

### Content Scoring Factors

- ICP relevance
- Originality
- Personal experience
- Credibility
- Story potential
- Educational value
- Novelty
- Repetition risk
- Privacy risk

### Available Angles

- Contrarian
- Story
- Educational
- Framework
- Case study
- Prediction
- Personal lesson

## Privacy & Consent

- ✅ No covert recording
- ✅ Explicit user action required for recording
- ✅ Recording state clearly visible
- ✅ Source retention controls
- ✅ Delete functionality for sources
- ✅ Privacy risk scoring for insights

## Production Deployment

### Backend (Render/Railway)

Set environment variables:
- `GROQ_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_JWT_SECRET`
- `TRANSCRIPTION_PROVIDER`

### Frontend (Vercel)

Set environment variables:
- `VITE_API_URL=https://your-backend-domain.com`

Update CORS in `backend/main.py` to include your Vercel domain.

## Troubleshooting

### Backend won't start
- Check Python dependencies: `pip install -r requirements.txt`
- Verify GROQ_API_KEY is set
- Check port 8000 is not in use

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check CORS configuration in `backend/main.py`
- Ensure backend is running

### Transcription fails
- Check GROQ_API_KEY is valid
- Fallback transcription will work if API fails
- Check audio file format (webm, wav, mp4 supported)

### No posts generated
- Check Supabase database tables exist
- Verify workspace_id is passed correctly
- Check browser console for errors

## Next Steps

The autonomous content engine is fully functional. To enhance it further:

1. **Phase 2**: Add Zoom integration (OAuth/webhook ingestion)
2. **Phase 2**: Implement content memory with semantic retrieval
3. **Phase 2**: Add repetition detection across all posts
4. **Phase 3**: LinkedIn publishing/scheduling
5. **Phase 3**: More sources (calendar, email)

## Success Criteria

✅ User sees "Today's Post" on dashboard
✅ Can record/upload audio
✅ Processing states are visible
✅ Post is grounded in source material
✅ Provenance is clickable
✅ Can approve/edit/regenerate
✅ Can copy to clipboard
✅ Source can be deleted

**The autonomous content engine is ready to use!**
