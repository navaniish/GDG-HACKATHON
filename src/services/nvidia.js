const API_KEY = import.meta.env.VITE_NVIDIA_API_KEY;
const API_URL = "/api/nvidia/chat/completions";

export async function analyzeDistressSignal(input) {
  console.log("SENTINEL-X Pilot: Sending signal to NVIDIA NIM...", { inputLen: input.length });
  
  if (!API_KEY || API_KEY === "undefined") {
    console.error("NVIDIA API Key is missing from environment variables.");
    throw new Error("NVIDIA_API_KEY_MISSING");
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct", 
        messages: [
          {
            role: "system",
            content: `You are the SENTINEL-X Autonomous Building Pilot. Analyze the distress signal and return ONLY a valid JSON object.
            Fields: 
            'category': (Fire|Terrorist|Medical|Structural|Unknown)
            'priority': (1-10)
            'autonomous_actions': (List 3 specific physical actions)
            'responder_brief': (A 10-word tactical summary)
            Strict JSON format only.`
          },
          {
            role: "user",
            content: input
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("NVIDIA NIM Error Status:", response.status, errorData);
      throw new Error(`NVIDIA_API_ERROR_${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Improved JSON cleaning
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("INVALID_AI_RESPONSE_FORMAT");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("SENTINEL-X Pilot: Intelligence Link Failure:", error);
    throw error;
  }
}

export async function detectVisualThreats(imageData) {
  // Vision simulation
  return new Promise((resolve) => {
    setTimeout(() => {
      const threats = [];
      if (Math.random() > 0.8) threats.push({ type: "ABANDONED_LUGGAGE", x: 30 + Math.random()*40, y: 40 + Math.random()*30 });
      resolve({ status: threats.length > 0 ? "THREAT_DETECTED" : "SECURE", threats });
    }, 450);
  });
}
