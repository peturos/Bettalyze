# Bettalyze Technical Stack Documentation

## 1. High-Level Architecture
Bettalyze is a real-time sports analytics platform built on a modern **Next.js 16 (App Router)** & **React 19** stack. It uses a **Hybrid AI/SQL** architecture where the Large Language Model (Wizardinho) interacts directly with a Postgres database via a specialized "Justice Engine" view layer.

## 2. Core Technology Stack

### Frontend & Application Framework
*   **Next.js 16**: Utilizing the App Router for server-centric rendering and API routes.
*   **React 19**: Leveraging latest features (Server Components, Actions) for high-performance UI.
*   **TypeScript**: Application-wide type safety.
*   **Lucide React**: Iconography.

### AI & Agents
*   **Vercel AI SDK (Core)**: The backbone for the chat interface. It manages:
    *   Prompt construction.
    *   Tool calling / Function binding.
    *   Response streaming (or generation).
*   **@ai-sdk/openai**: Provider for accessing GPT-4o models.
*   **@tavily/core**: Specialized search API for real-time web context (News, Weather, Injuries).
*   **Zod**: Schema declaration library used to define tool inputs for the LLM.

### Database Layer
*   **PostgreSQL (Supabase)**: The primary data store.
*   **pg (node-postgres)**: Low-level client for executing queries from the Next.js backend.
    *   *Connection Pooling*: **CRITICAL**: Must use Supabase's **Transaction Pooler** (Port 6543) or **Session Pooler** (Port 5432) for serverless environments.
    *   *IPv4 Compatibility*: Vercel and many local dev environments are IPv4-only. You CANNOT use the direct IPv6 database URL. You must use the **IPv4-compatible Shared Pooler URL** (e.g., `aws-0-eu-central-1.pooler.supabase.com`).

## 3. The "Justice Engine" (Database Architecture)
The "Justice Engine" is an abstraction layer in Postgres designed to sanitize complex data for LLM consumption. It prevents the AI from needing to understand complex normalized schemas (joins, foreign keys) by providing flat, semantic Views.

### Key Components
*   **SQL Views**: The primary interface for data access. Examples:
    *   `v_player_stats_cleaned`: Aggregates goals, xG, assists for player queries.
    *   `v_season_leaderboard`: Pre-calculated rankings.
    *   `v_team_trends`: Derived metrics for hot/cold streaks.
*   **Tool Registry (`TOOL_REGISTRY.json`)**:
    *   Acts as the bridge between SQL and AI.
    *   Maps an Intent (e.g., `get_player_briefing`) to a specific **SQL Query Template** and a **Zod Schema**.
    *   Enables dynamic tool generation at runtime (`runtime_tools.ts`).

## 4. External Connections & Integrations

### 1. Supabase (Data)
*   **Connection**: TLS-enabled Postgres connection.
*   **Role**: Stores digested API-Football data, generated stats, and historical match logs.
*   **Flow**: `User Query` -> `LLM Tool Call` -> `Next.js API` -> `pg client` -> `Supabase View` -> `Result JSON`.

### 2. OpenAI (Intelligence)
*   **Connection**: HTTPS API.
*   **Role**: Processes natural language, determines which tools to call, and generates the final conversational response.

### 3. Tavily (Live Context)
*   **Connection**: API Call via `@tavily/core`.
*   **Role**: Provides "internet access" to the agent for data not in the database (e.g., "Is Palmer injured today?").
*   **Isolation**: This tool is distinct from the SQL tools and is injected alongside them.

## 5. Security & Environment
*   **.env.local**: Manages sensitive keys:
    *   `DATABASE_URL`: Connection string for Supabase pooling (Session or Transaction mode).
    *   `TAVILY_API_KEY`: Auth for search.
    *   `OPENAI_API_KEY`: Auth for model access.
