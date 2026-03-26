import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for waitlist submission and "email sending"
  app.post("/api/waitlist", async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    console.log(`[WAITLIST] New signup: ${email}`);
    
    // SIMULATED EMAIL SENDING
    // In a real app, you'd use Resend, SendGrid, or similar here.
    console.log(`[EMAIL] Sending welcome email to: ${email}`);
    console.log(`
      Subject: Welcome to Longday
      Body: Hey there! Thanks for joining the Longday waitlist. 
      We're excited to have you on board. We'll let you know as soon as we're ready for you.
      
      Stay focused,
      The Longday Team
    `);

    res.json({ success: true, message: "Welcome email 'sent' and logged." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
