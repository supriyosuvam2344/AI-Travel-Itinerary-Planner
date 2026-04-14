import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/generate-itinerary", async (req, res) => {
    try {
      const { destination, duration, travelers, budget, interests } = req.body || {};
      if (!destination || !duration || !travelers || !budget) {
        return res.status(400).json({ error: "Missing required trip fields" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Server Gemini key is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const interestsText = Array.isArray(interests) && interests.length > 0
        ? interests.join(", ")
        : "general";

      const prompt = `You are an expert AI Travel Planner. Generate a detailed travel itinerary for ${destination} for ${duration} days for a group of ${travelers} traveler(s).
The absolute maximum TOTAL budget for the ENTIRE GROUP combined is ₹${budget} INR. You must divide this total budget realistically among the ${travelers} people. Please provide all costs and budget figures in Indian Rupees (INR). The traveler(s) are looking for ${interestsText} activities.

Your response must be a valid JSON object matching this structure:
{
  "destination": string,
  "duration": number,
  "budget": string,
  "totalEstimatedCost": string,
  "currency": string,
  "dailyPlans": [
    {
      "day": number,
      "theme": string,
      "activities": [
        {
          "time": string,
          "title": string,
          "description": string,
          "cost": string,
          "location": string
        }
      ]
    }
  ],
  "travelTips": string[],
  "budgetBreakdown": {
    "accommodation": string,
    "food": string,
    "activities": string,
    "transport": string
  }
}

Use your knowledge of local prices and popular spots. Group activities logically and ensure the total cost fits within the budget.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              destination: { type: Type.STRING },
              duration: { type: Type.NUMBER },
              budget: { type: Type.STRING },
              totalEstimatedCost: { type: Type.STRING },
              currency: { type: Type.STRING },
              dailyPlans: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.NUMBER },
                    theme: { type: Type.STRING },
                    activities: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          cost: { type: Type.STRING },
                          location: { type: Type.STRING },
                        },
                      },
                    },
                  },
                },
              },
              travelTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              budgetBreakdown: {
                type: Type.OBJECT,
                properties: {
                  accommodation: { type: Type.STRING },
                  food: { type: Type.STRING },
                  activities: { type: Type.STRING },
                  transport: { type: Type.STRING },
                },
              },
            },
            required: ["destination", "dailyPlans", "budgetBreakdown"],
          },
        },
      });

      if (!response.text) {
        return res.status(502).json({ error: "No response from AI provider" });
      }

      const data = JSON.parse(response.text);
      return res.json(data);
    } catch (error) {
      console.error("Failed to generate itinerary", error);
      return res.status(500).json({ error: "Failed to generate itinerary" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
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