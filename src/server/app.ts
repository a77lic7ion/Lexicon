import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

export async function createApp() {
  const app = express();

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Word validation proxy (no keys required)
  app.get("/api/validate", async (req, res) => {
    try {
      const word = String(req.query.word || "").trim();
      if (!/^[A-Za-z]{3,}$/.test(word)) {
        res.json({ valid: false });
        return;
      }
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
      const r = await fetch(url, { headers: { "accept": "application/json" } });
      if (!r.ok) {
        res.json({ valid: false });
        return;
      }
      const data = await r.json();
      const valid = Array.isArray(data) && data.length > 0 && data[0]?.word;
      res.json({ valid: !!valid });
    } catch (e) {
      // Network/integration failure: be permissive rather than blocking gameplay
      res.json({ valid: true, offline: true });
    }
  });

  // Google Gemini 1.5 word validation against TWL/SOWPODS (heuristic; relies on model knowledge)
  app.get("/api/validate-google", async (req, res) => {
    try {
      const word = String(req.query.word || "").trim();
      if (!/^[A-Za-z]{3,}$/.test(word)) {
        res.json({ valid: false, dictionaries: [] });
        return;
      }
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        res.status(501).json({ valid: false, reason: "no_api_key" });
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are a strict Scrabble word validator.
Given a single token, determine if it is a valid playable word in at least one of the official Scrabble dictionaries:
- TWL (NASPA Word List / North America)
- SOWPODS (Collins Scrabble Words / International)

Rules:
- Return ONLY a compact JSON object on a single line.
- Shape: {"valid": boolean, "dictionaries": ["TWL","SOWPODS"] }
- "dictionaries" lists which sets accept the word (empty if none).
- Consider only alphabetic words; no proper nouns, abbreviations, prefixes/suffixes, or hyphenated forms.
- If uncertain, set valid=false.

Word: ${word.toUpperCase()}
`;
      const out: any = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }]}],
      });
      const text = typeof out.text === "string" ? out.text.trim() : "";
      let parsed: any = null;
      try { parsed = JSON.parse(text); } catch {}
      const valid = !!parsed?.valid;
      const dictionaries: string[] = Array.isArray(parsed?.dictionaries) ? parsed.dictionaries.filter((d: any) => typeof d === "string") : [];
      res.json({ valid, dictionaries, source: "gemini" });
    } catch (e) {
      res.status(500).json({ valid: false, error: "gemini_error" });
    }
  });

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Vercel handles routing via vercel.json, but we keep this for local prod testing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}
