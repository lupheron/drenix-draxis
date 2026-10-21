<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- Install with `npm ci`. Start the app with `npm run dev` (Next.js 16 on port 3000). Open it at `http://localhost:3000`. The dev server hot-reload socket rejects a `127.0.0.1` browser origin.
- This repository is the portal UI only. Login and access requests call `NEXT_PUBLIC_API_URL`, which defaults to `http://127.0.0.1:8000/api`. No API server is included here.
- `GET /api/leads` serves bundled mock data unless `LEADS_SHEET_JM_ID` or `LEADS_SHEET_ID` is set. Attendance needs `ATTENDANCE_SHEET_ID`. Forecast explanations need `OPENAI_API_KEY`.
- `npx tsc --noEmit` and `npm run build` are the checks that pass today. `npm run lint` reports existing `react-hooks` errors in the app.
