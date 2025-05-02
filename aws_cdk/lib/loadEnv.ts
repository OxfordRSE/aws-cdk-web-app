import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import { existsSync } from "fs";
import { resolve } from "path";

// Read .env files into the environment in the correct override order
export function loadEnv(mode: string = "production") {
  const envDir = resolve(__dirname, "../"); // your project root

  const envFiles = [`.env.${mode}.local`, `.env.local`, `.env.${mode}`, `.env`];

  for (const file of envFiles) {
    const fullPath = resolve(envDir, file);
    if (existsSync(fullPath)) {
      const env = dotenv.config({ path: fullPath });
      dotenvExpand.expand(env);
    }
  }
}
