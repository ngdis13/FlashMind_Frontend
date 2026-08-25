import fs from "fs";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: "vite-plugin-html-string",
      closeBundle() {
        const bundle = fs.readFileSync("dist/index.html", "utf8");

        const escaped = JSON.stringify(bundle);
        const js = `// AUTO-GENERATED FILE (npm run build внутри lexical-editor). Не редактировать вручную.\nexport default ${escaped};\n`;

        fs.mkdirSync("../shared/generated", { recursive: true });
        fs.writeFileSync("../shared/generated/lexicalHtmlString.ts", js);
      },
    },
  ],
});
