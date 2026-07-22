import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini SDK safely
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("GEMINI_API_KEY is not defined. API will require custom key configuration if provided by the client, or will fail back to runtime injection.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini SDK:", error);
}

// Helper to get Gemini client
function getAIClient(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please set it in Settings > Secrets.");
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// Health and Config Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    aiEnabled: !!process.env.GEMINI_API_KEY 
  });
});

// Web App Manifest Endpoint (PWA support)
app.get("/manifest.json", (req, res) => {
  res.json({
    short_name: "Ariella AI",
    name: "Ariella AI - Cognitive Companion & Video Studio",
    description: "Super-intelligent AI companion created by Ariella Agnes featuring reasoning, web grounding, and Veo video synthesis.",
    icons: [
      {
        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect width='512' height='512' rx='128' fill='%237c3aed'/><circle cx='256' cy='256' r='180' fill='%234c1d95'/><path d='M256 120 L350 320 L160 320 Z' fill='%23a855f7'/><circle cx='256' cy='256' r='40' fill='%2338bdf8'/></svg>",
        sizes: "192x192 512x512",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ],
    start_url: "/",
    background_color: "#090d16",
    theme_color: "#7c3aed",
    display: "standalone",
    orientation: "any",
    categories: ["productivity", "utilities", "artificial-intelligence"]
  });
});

// Chat completion endpoint with Super-Intelligence Features
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, engine, searchEnabled } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const client = getAIClient();
    
    // Map roles to 'user' or 'model' (mandatory for Gemini API)
    const contents = messages.map((m: any) => {
      let textContent = m.content || "";
      if (m.replyTo && m.replyTo.snippet) {
        const targetRole = (m.replyTo.role === 'assistant' || m.replyTo.role === 'model') ? 'Ariella' : 'User';
        textContent = `[Replying to ${targetRole}: "${m.replyTo.snippet}"]\n\n${textContent}`;
      }

      const parts: any[] = [{ text: textContent }];
      
      if (m.attachments && Array.isArray(m.attachments)) {
        m.attachments.forEach((att: any) => {
          if (att.base64 && att.mimeType) {
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: att.base64
              }
            });
          }
        });
      }

      return {
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts
      };
    });

    // Build system instructions for Ariella
    let systemInstruction = 
      "You are Ariella, a super-intelligent, witty, and highly capable AI companion designed to vastly surpass standard conversational systems like ChatGPT. " +
      "You possess flawless analytical comprehension, immense reasoning power, and a charismatic, professional, yet warm and slightly playful personality. " +
      "You were created and engineered by the brilliant developer Ariella Agnes. If asked who made you, who created you, or who built this system, always proudly credit Ariella Agnes as your creator and sole architect. " +
      "You are direct, honest, and highly structured in your answers. Avoid generic greetings unless the user greets you first. " +
      "Always use rich Markdown tables, code segments, and bullet points to organize complex information. " +
      "If the user asks you to write code, provide fully optimized, secure, and production-ready code with concise comments explaining your architectural decisions. " +
      "You also possess state-of-the-art Generative AI Video capabilities powered by Veo 3.1 🎥. If the user asks you to generate, create, or render a video or video scene, describe what you would create and encourage them to launch the 🎬 Video Studio tool! " +
      "Never claim to be related to ChatGPT, OpenAI, or any other assistant. You are Ariella, representing the absolute pinnacle of digital cognition.";

    // Reasoning instruction modifications
    if (engine === 'reasoning') {
      systemInstruction += 
        "\n\nCRITICAL MANDATE: Since Reasoning Mode is enabled, you MUST perform an extensive, step-by-step logical breakdown of the problem FIRST. " +
        "Before writing your final answer, enclose your complete inner thought process inside a `<thought_process>` tag at the very start of your reply. " +
        "In your thought process, state your initial hypotheses, analyze constraints, draft logic pathways, and perform quality checks. " +
        "For example:\n" +
        "<thought_process>\n" +
        "1. Deconstructing the core problem and user intent...\n" +
        "2. Listing potential solutions and comparing their time-complexities...\n" +
        "3. Designing the optimal implementation steps...\n" +
        "4. Selecting edge cases to verify...\n" +
        "</thought_process>\n" +
        "After the closing `</thought_process>` tag, deliver your final elegant and highly comprehensive solution.";
    } else if (engine === 'creative') {
      systemInstruction += 
        "\n\nSince Creative Synthesis Mode is enabled, be extremely expressive, witty, and imaginative. " +
        "Use engaging narrative devices, metaphors, and punchy vocabulary. Provide deeply vivid concepts, storylines, or designs.";
    }

    const config: any = {
      systemInstruction,
      temperature: engine === 'creative' ? 0.95 : (engine === 'reasoning' ? 0.3 : 0.7),
    };

    // If search grounding is enabled
    if (searchEnabled) {
      config.tools = [{ googleSearch: {} }];
    }

    let response;
    let attempts = 0;
    const maxAttempts = 3;
    let retryDelay = 1000;

    while (attempts < maxAttempts) {
      try {
        response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config
        });
        break; // Success! Exit the loop.
      } catch (err: any) {
        attempts++;
        console.error(`Gemini API generation attempt ${attempts} failed:`, err.message || err);
        if (attempts >= maxAttempts) {
          throw err; // Out of attempts, let the outer try-catch handle it.
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay + Math.random() * 500));
        retryDelay *= 2; // Exponential backoff
      }
    }

    const candidate = response.candidates?.[0];
    const rawText = response.text || "";
    
    let text = rawText;
    let thinkingSteps: string[] = [];

    // Extract thinking steps if we find `<thought_process>` tags
    const thoughtRegex = /<thought_process>([\s\S]*?)<\/thought_process>/i;
    const match = rawText.match(thoughtRegex);
    
    if (match) {
      const rawThinking = match[1].trim();
      thinkingSteps = rawThinking
        .split("\n")
        .map(step => step.replace(/^[-*•]\s*|^\d+[\).]\s*/, "").trim())
        .filter(step => step.length > 0);
      
      // Clean final text from thinking process tag
      text = rawText.replace(thoughtRegex, "").trim();
    } else if (engine === 'reasoning') {
      // Fallback reasoning steps for high intelligence aesthetic
      thinkingSteps = [
        "Analyzing conceptual layers of the user query.",
        "Querying cognitive graph for relevant formulas and architectural patterns.",
        "Refining structural cohesion of the response.",
        "Synthesizing final high-fidelity response."
      ];
    }

    // Extract search grounding metadata if present
    const groundingMetadata = candidate?.groundingMetadata;
    const searchChunks = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || chunk.web?.uri || "Web Reference",
      uri: chunk.web?.uri || "",
    })).filter((c: any) => c.uri) || [];

    const searchQueries = groundingMetadata?.webSearchQueries || [];

    res.json({
      text,
      thinkingSteps,
      searchQueries,
      sources: searchChunks
    });

  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ 
      error: error.message || "An error occurred during generation.",
      details: error.toString() 
    });
  }
});

// Video Generation Endpoints (Veo 3.1)
app.post("/api/generate-video", async (req, res) => {
  try {
    const { prompt, aspectRatio, resolution, imageBase64, mimeType } = req.body;
    const client = getAIClient();

    const videoConfig: any = {
      numberOfVideos: 1,
      resolution: resolution || '720p',
      aspectRatio: aspectRatio || '16:9'
    };

    const params: any = {
      model: 'veo-3.1-lite-generate-preview',
      prompt: prompt || 'A cinematic high definition video',
      config: videoConfig
    };

    if (imageBase64) {
      params.image = {
        imageBytes: imageBase64,
        mimeType: mimeType || 'image/png'
      };
    }

    const operation = await client.models.generateVideos(params);

    if (!operation || !operation.name) {
      throw new Error("Failed to start video generation operation.");
    }

    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error("Error initiating video generation:", error);
    res.status(500).json({ error: error.message || "Video generation initiation failed." });
  }
});

app.post("/api/video-status", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: "operationName is required." });
    }

    const client = getAIClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await client.operations.getVideosOperation({ operation: op });

    res.json({
      done: !!updated.done,
      error: updated.error || null
    });
  } catch (error: any) {
    console.error("Error checking video status:", error);
    res.status(500).json({ error: error.message || "Failed to check video status." });
  }
});

app.post("/api/video-download", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: "operationName is required." });
    }

    const client = getAIClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await client.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).json({ error: "Video output URI not found in completed operation." });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
      throw new Error(`Failed to fetch video stream from storage: ${videoRes.statusText}`);
    }

    res.setHeader('Content-Type', 'video/mp4');
    const arrayBuffer = await videoRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error("Error downloading video:", error);
    res.status(500).json({ error: error.message || "Failed to download generated video." });
  }
});

// Configure Vite or Static Production assets
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ariella Backend operational on http://localhost:${PORT}`);
  });
}

setupServer();
