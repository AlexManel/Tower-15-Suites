
import { GoogleGenAI } from "@google/genai";
import { CMSState, Property } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const aiService = {
  /**
   * ADMIN USE ONLY: Process the CMS State based on user instructions.
   */
  processCmsUpdate: async (currentState: CMSState, prompt: string): Promise<CMSState> => {
    // 1. Strip images to reduce payload size
    const lightweightState = {
      ...currentState,
      properties: currentState.properties.map(p => ({
        ...p,
        images: [] 
      }))
    };
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview", 
        contents: `
          You are the AI Architect for the "TOWER 15 Suites" website.
          CURRENT CMS STATE (JSON): ${JSON.stringify(lightweightState)}
          USER INSTRUCTION: "${prompt}"
          INSTRUCTIONS: Modify the JSON state. Return ONLY raw JSON.
        `,
        config: { responseMimeType: "application/json", temperature: 0.4 },
      });

      const rawText = response.text || "{}";
      let updatedLightweightState: CMSState;
      try {
        updatedLightweightState = JSON.parse(rawText);
      } catch (parseError) {
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '');
        updatedLightweightState = JSON.parse(cleanJson);
      }

      const mergedProperties = updatedLightweightState.properties.map(newProp => {
        const originalProp = currentState.properties.find(p => p.id === newProp.id);
        return {
          ...newProp,
          images: (newProp.images && newProp.images.length > 0) ? newProp.images : (originalProp?.images || [])
        };
      });

      return { ...updatedLightweightState, properties: mergedProperties };

    } catch (e) {
      console.error("AI Service Error:", e);
      throw new Error("I couldn't process that request.");
    }
  },

  /**
   * GUEST USE: Virtual Concierge Chat
   * Read-only access to properties to answer guest questions.
   */
  askConcierge: async (properties: Property[], userMessage: string, history: any[]): Promise<string> => {
    // Create a simplified context of properties (remove long descriptions/images to save tokens)
    const contextProps = properties.map(p => ({
      title: p.title,
      category: p.category,
      capacity: p.capacity,
      price: p.pricePerNightBase,
      amenities: p.amenities,
      id: p.id
    }));

    const systemPrompt = `
      You are the "TOWER 15 Concierge", a helpful and sophisticated virtual assistant for a luxury apartment hotel in Thessaloniki.
      
      HOTEL INFO:
      - Name: TOWER 15 Suites
      - Address: Ioannou Farmaki 15, Thessaloniki (Near Democracy Square/Plateia Dimokratias).
      - Style: Luxury, Minimalist, Renovated in 2024.
      - Check-in: 15:00, Check-out: 11:00.
      - Keyless entry (codes sent via email).
      - No reception desk (Self check-in).
      
      AVAILABLE ROOMS DATA:
      ${JSON.stringify(contextProps)}

      YOUR JOB:
      1. Answer questions about room recommendations based on capacity and price.
      2. Answer questions about location (Ladadika, Port, Center) and parking (suggest private parking nearby).
      3. Be polite, concise, and professional.
      4. IMPORTANT: Answer in the SAME LANGUAGE as the user (Greek or English).
      5. If asked to book, guide them to click the "Book Now" buttons on the site. You cannot make bookings yourself.
    `;

    try {
      // Build conversation history for the model
      const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] }, // System instruction as first user message context
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Fast model for chat
        contents: contents,
      });

      return response.text || "I apologize, I am having trouble connecting right now.";
    } catch (e) {
      console.error("Concierge Error:", e);
      return "I'm sorry, I'm currently unavailable. Please contact us at info@tower15.gr";
    }
  }
};
