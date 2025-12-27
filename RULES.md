# ⚡️ AGENT OPERATIONAL PROTOCOLS (Bettalyze/Wizardinho)

> **CRITICAL DIRECTIVE:** You are working on a high-precision Next.js 16 / React 19 project. "Guesswork" is forbidden. Follow these rules strictly to avoid crashing the environment or corrupting the database connection.

---

## 1. 🚫 THE "NO-GO" ZONES (Hard Constraints)
* **DO NOT Downgrade Packages:** We are on **React 19**. You **MUST** use `ai@latest` (v6+) and `@ai-sdk/openai@latest`. Never downgrade to v3.x to "fix" schema errors; this breaks streaming.
* **DO NOT Run `npm run dev` for Logic Debugging:** The startup time is too slow. If you are debugging Zod schemas, database queries, or tool definitions, you **MUST** create a standalone script (e.g., `scripts/debug_schema.ts`) and run it with `npx tsx`.
* **DO NOT Connect via IPv6:** Vercel and our local dev environment are **IPv4 Only**. You must use the Supabase **Transaction Pooler** (Port 6543) or Session Pooler. Never use the direct `db.[project].supabase.co` URL.

---

## 2. 🛠 DEBUGGING PROTOCOLS

### A. The "Type: None" / Zod Schema Error
* **Symptom:** `Invalid schema... got type: "None"`.
* **Action:**
    1.  **Stop.** Do not edit `route.ts`.
    2.  Create/Update `scripts/debug_schema.ts` to import the tool definitions directly.
    3.  Use `zod-to-json-schema` to print the output.
    4.  **Fix:** Ensure every Zod schema is wrapped in a top-level `z.object({ ... })`.
    5.  Only apply the fix to `runtime_tools.ts` after the script passes.

### B. Database Connection Failures
* **Symptom:** `ETIMEDOUT`, `ENOTFOUND`, or SSL errors.
* **Action:**
    1.  Verify `DATABASE_URL` in `.env.local` points to `*.pooler.supabase.com`.
    2.  Ensure the `pg` client config includes `ssl: { rejectUnauthorized: false }` (required for Supabase Transaction Mode).
    3.  Test connectivity with a standalone `scripts/test_db.ts` script before integrating into the app.

---

## 3. 🏗 ARCHITECTURE & STATE
* **Justice Engine:** We do not query raw tables. Always query the semantic Views defined in `docs/view_registry.yaml` (e.g., `v_player_stats_cleaned`).
* **Tool Registry:** The "Truth" for tool definitions is `docs/TOOL_REGISTRY.json`. If `runtime_tools.ts` diverges from this JSON, the runtime is wrong.
* **State Management:** We are removing `StreamText` legacy implementations. Focus on `streamText` from `ai` SDK v6.

---

## 4. 🧠 AGENT BEHAVIORAL RULES
* **Plan First:** For any task involving "Refactor" or "Fix", write a **Implementation Plan Artifact** first.
* **Stop on Failure:** If a fix fails **ONCE**, stop. Do not retry the exact same command. Read the error log, check these Rules, and propose a *new* hypothesis.
* **Documentation:** Before modifying the stack, read `docs/TECHNICAL_STACK.md`.