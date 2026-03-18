# Lexicon: Word-Harvesting Battle

A strategic word-building battle game.

## Hosting on Vercel

This project is configured for seamless hosting on Vercel.

### Steps to Deploy:

1. **Push to GitHub**: Ensure all changes are committed and pushed to your GitHub repository.
2. **Import to Vercel**:
   - Go to [Vercel](https://vercel.com/new).
   - Select your GitHub repository.
   - Vercel should automatically detect the **Vite** framework.
3. **Configure Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Environment Variables**:
   - If you add any third-party API keys (e.g., for Gemini), add them in the Vercel project settings.
5. **Deploy**: Click **Deploy**.

### How it works:
- **Frontend**: The Vite build is served as static files.
- **Backend**: The `api/` folder contains a Vercel Serverless Function that runs the Express logic for any `/api/*` routes.
- **Routing**: `vercel.json` handles the SPA routing (redirecting all non-API requests to `index.html`).
