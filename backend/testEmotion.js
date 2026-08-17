import { getEmotion } from "./services/emotionService.js";

async function test() {
  const messages = [
    "I'm feeling great today!",
    "I am so sad and lonely.",
    "I'm angry at what happened.",
    "This is so boring...",
    "I’m a little scared about tomorrow."
  ];

  for (const msg of messages) {
    const emotion = await getEmotion(msg);
    console.log(`Message: "${msg}" → Emotion: ${emotion}`);
  }
}

test();
