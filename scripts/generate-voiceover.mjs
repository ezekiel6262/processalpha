import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = await fs.readFile(path.join(root, "demo", "narration.txt"), "utf8");
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set in this process");

const response = await fetch("https://api.openai.com/v1/audio/speech", {
  method: "POST",
  headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
  body: JSON.stringify({
    model: "gpt-4o-mini-tts",
    voice: "cedar",
    input,
    instructions: "Speak with calm authority and warm energy. Use a polished product-demo pace, clear diction, short pauses between sections, and no exaggerated sales tone.",
    response_format: "mp3"
  })
});

if (!response.ok) throw new Error(`Voice generation failed with status ${response.status}`);
const output = path.join(root, "demo", "processalpha-demo-voiceover.mp3");
await fs.writeFile(output, Buffer.from(await response.arrayBuffer()));
console.log(`Created ${output}`);
