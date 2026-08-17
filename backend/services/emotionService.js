import fetch from "node-fetch";

export async function getEmotion(text) {
  try {
    const response = await fetch(
      "https://Subhra-123-Distilbert-Emotion.hf.space/run/predict/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [text] })
      }
    );

    const json = await response.json();
    // The structure may vary, check console.log(json) first
    const emotion = json?.data?.[0]; 
    return emotion || null;

  } catch (err) {
    console.error("Gradio API error:", err);
    return null;
  }
}
