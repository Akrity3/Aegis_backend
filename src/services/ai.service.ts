import { HttpException } from "../exceptions/http-exception";

export class AiService {
    async getChatResponse(message: string): Promise<string> {
        const clean = message.toLowerCase().trim();

        if (clean.includes("earthquake") || clean.includes("quake")) {
            return "Earthquake Safety Rules (Nepal): \n" +
                "1. Drop, Cover, and Hold on under a sturdy table or desk.\n" +
                "2. Stay indoors until the shaking stops and it is safe to exit.\n" +
                "3. If outdoors, move to an open area away from buildings, utility wires, and trees.\n" +
                "4. Nepal Emergency Hotline: 100 (Police), 101 (Fire), 102 (Ambulance).";
        }

        if (clean.includes("fire") || clean.includes("burn")) {
            return "Fire Safety Rules: \n" +
                "1. Get out immediately. If smoke is present, crawl low under it.\n" +
                "2. Call 101 for fire emergency in Nepal.\n" +
                "3. Do not open doors that feel hot to the touch.\n" +
                "4. If clothing catches fire: Stop, Drop, and Roll.";
        }

        if (clean.includes("attack") || clean.includes("harass") || clean.includes("assault") || clean.includes("danger")) {
            return "Active Danger & Self-Defense Actions:\n" +
                "1. Trigger the Aegis+ Emergency SOS immediately by holding the button on the dashboard or pressing the power button 3 times.\n" +
                "2. Try to run to a well-lit public area. Raise your voice and scream 'FIRE!' or 'HELP!' to draw attention.\n" +
                "3. Contact the Nepal Police Hotline immediately (100).\n" +
                "4. Keep your live location sharing turned on so your Trusted Contacts can track your position in real time.";
        }

        if (clean.includes("contact") || clean.includes("trusted")) {
            return "Managing Contacts in Aegis+:\n" +
                "1. Open the 'Safety Circle' or go to Profile -> Emergency Contacts.\n" +
                "2. Use the '➕ Add Trusted Contact' button to request a contact.\n" +
                "3. If they are registered, they will receive a request to accept. If they aren't registered, they will be saved as an offline Emergency Contact.";
        }

        if (clean.includes("hello") || clean.includes("hi") || clean.includes("hey")) {
            return "Hello! I am the Aegis+ AI Safety Assistant. Ask me any safety-related questions, such as:\n" +
                "- 'What to do in an earthquake?'\n" +
                "- 'How to handle a fire emergency?'\n" +
                "- 'What to do if I am followed or attacked?'\n" +
                "- 'How do I add a trusted contact?'";
        }

        // Generic safety assistant response
        return "I am the Aegis+ AI Safety Assistant. I can help guide you through safety emergencies, natural disasters, or application workflows. \n\n" +
            "If you are currently in active danger, please trigger the SOS Alert immediately and seek a secure public area.";
    }
}
