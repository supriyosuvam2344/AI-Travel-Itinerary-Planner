import { GoogleGenAI, Type } from "@google/genai";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateWithRetry(ai, prompt, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
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
      return response;
    } catch (error) {
      if (attempt < retries && (error.message.includes('503') || error.message.includes('UNAVAILABLE') || error.message.includes('high demand'))) {
        console.log(`Attempt ${attempt} failed, retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY);
      } else {
        throw error;
      }
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    const response = await generateWithRetry(ai, prompt);

    const responseText = typeof response.text === "function" ? response.text() : response.text;
    if (!responseText || !String(responseText).trim()) {
      return res.status(502).json({ error: "No response from AI provider" });
    }

    const cleanedText = String(responseText)
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch {
      return res.status(502).json({ error: "AI returned invalid JSON" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Failed to generate itinerary", error);
    return res.status(500).json({ error: error?.message || "Failed to generate itinerary" });
  }
}
