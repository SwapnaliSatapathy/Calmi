import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to frontend
const frontendPath = path.join(__dirname, '../frontend');

// List files in frontend folder
if (fs.existsSync(frontendPath)) {
  const files = fs.readdirSync(frontendPath);
  console.log("Files inside frontend:", files);
} else {
  console.log("Frontend folder not found!");
}
