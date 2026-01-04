# AI Movie Recommender

**A high-performance discovery engine for cinema buffs.**

![Project Status](https://img.shields.io/badge/Status-In%20Development-orange)
![Tech](https://img.shields.io/badge/Stack-FastAPI%20%7C%20Next.js%20%7C%20PostgreSQL-blue)

## The Problem

Movie lovers often spend 20 minutes scrolling through streaming apps before actually picking a film. Current "trending" lists are often generic and don't account for deep genre-specific moods.

## The Solution

This is a Full-Stack AI Discovery Engine designed to end "choice paralysis." By combining an automated background data factory with a high-performance backend, the system builds a massive, searchable library of cinema without manual effort.

The Interface (Next.js): Built for a smooth experience. The sleek, dark-mode design eliminates clunky page reloads, allowing users to glide through categories and watch trailers instantly in a seamless single-page environment.

The Engine (FastAPI): The high-speed brain of the operation. It handles the "heavy lifting"—from scanning thousands of titles to delivering sub-millisecond search results—ensuring that finding the right movie feels instantaneous.

## Tech Stack

- **Frontend:** Next.js & Tailwind CSS(Modern, high-speed UI)
- **Backend:** FastAPI (Python), SQLAlchemy(Scalable, asynchronous logic)
- **Database:** PostgreSQL(Relational data & metadata storage)
- **API:** TMDB (The Movie Database)

## Project Structure

This project is organized as a monorepo for clean separation of concerns:

- **`backend/`**: FastAPI server, database models, and automated data scripts.
- **`frontend/`**: Next.js application (App Router) and Tailwind CSS styling.

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Darius1604/AI_Movie_Recommender.git](https://github.com/Darius1604/ AI_Movie_Recommender.git)
   cd AI_Movie_Recommender
   ```
2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   # Ensure your .env file is configured with DATABASE_URL and TMDB_API_KEY
   uvicorn main:app --reload
   ```
3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## API Endpoints

The backend exposes several key endpoints for the frontend to consume:

- `GET /movies/trending`: Fetches the top-rated and popular movies currently in the database.
- `GET /movies/search?query=`: High-speed search across thousands of movie titles.
- `GET /genres`: Retrieves the full list of genres for the category navigation bar.

## Roadmap

### Phase 1: Immersive Discovery Interface

- Dynamic Media Carousels: Implement high-performance, responsive front-end components for categorized content discovery.

- Client-Side Hydration: Optimize movie data fetching using Next.js Server Components and SWR/React Query for a seamless user experience.

- Embedded Media Integration: Develop a synchronized video overlay system for instantaneous trailer playback without page navigation.

### Phase 2: Intelligent Recommendation Engine

- Semantic Vector Embeddings: Integrate Natural Language Processing (NLP) to analyze movie descriptions and map them into a high-dimensional vector space.

- Similarity Scoring Logic: Develop a backend service in FastAPI that calculates Cosine Similarity to provide hyper-relevant "Discover Similar" recommendations.

- Content-Based Filtering: Refine the recommendation logic to weigh genre metadata and user preferences for higher accuracy.

### Phase 3: User Personalization & Identity

- Identity & Access Management (IAM): Secure the platform using OAuth2/JWT or NextAuth.js to enable personalized user sessions.

- Persistence Layer for User Data: Extend the PostgreSQL schema to support user-specific collections, including "Watchlists" and "Curated Favorites."

- Stateful Personalization: Implement logic to track user interactions and adjust the discovery feed in real-time.

### Phase 4: DevOps & Production Deployment

- CI/CD Pipeline: Automate testing and deployment workflows using GitHub Actions.

- Cloud Infrastructure: Deploy the containerized FastAPI backend to Railway/Render and the Next.js frontend to Vercel for global edge performance.

- Performance Monitoring: Integrate logging and error tracking to ensure 99.9% uptime during background data enrichment tasks.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Darius - [GitHub Profile](https://github.com/Darius1604)
Project Link: [https://github.com/Darius1604/AI_Movie_Recommender](https://github.com/Darius1604/AI_Movie_Recommender)
