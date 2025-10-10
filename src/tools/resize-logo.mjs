// tools/resize-logo.mjs
// Genera versiones @1x (32px alto) y @2x (64px alto) del logo
// partiendo del archivo fuente (por defecto: public/logo/ecoq-logo@2x-transparent.png)

import sharp from "sharp";
import { existsSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";

const SRC = process.env.LOGO_SRC ?? "public/logo/ecoq-logo@2x-transparent.png";
const OUT_2X = process.env.LOGO_OUT_2X ?? "public/logo/ecoq-logo@2x-transparent-64h.png";
const OUT_1X = process.env.LOGO_OUT_1X ?? "public/logo/ecoq-logo@1x-transparent-32h.png";

async function ensureDir(filePath) {
  const dir = dirname(filePath);
  mkdirSync(dir, { recursive: true });
}

async function make(outPath, heightPx) {
  await ensureDir(outPath);
  await sharp(SRC)
    .resize({ height: heightPx, withoutEnlargement: false, fit: "contain" })
    .png()
    .toFile(outPath);
  console.log(`✅ OK -> ${outPath} (height=${heightPx}px)`);
}

async function main() {
  const absSrc = resolve(SRC);
  if (!existsSync(absSrc)) {
    console.error(`❌ No se encontró el archivo fuente: ${absSrc}
Asegúrate de que exista o exporta LOGO_SRC con la ruta correcta.`);
    process.exit(1);
  }

  try {
    await make(OUT_2X, 64); // @2x
    await make(OUT_1X, 32); // @1x
    console.log("🎉 Listo. Actualiza tu <img src/srcset> para usar estos archivos.");
  } catch (err) {
    console.error("❌ Error generando imágenes:", err);
    process.exit(1);
  }
}

main();
