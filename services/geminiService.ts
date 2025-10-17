import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client, which will be used to create a chat session in the app.
export const ai = new GoogleGenAI({ apiKey: "AIzaSyBpypGwmpsAx3VwyPwuGrtuQiZIv716lnk" });

// Define an interface for the structured code response that the AI will return.
export interface WebsiteCode {
    html: string;
    css: string;
    javascript: string;
    explanation: string;
}
