# 🚀 Render del Reel de El Corral en GitHub Codespaces

Archivos incluidos:
- `el_corral_reel.html`: El video, generado 100% con código (Canvas + `window.seek`).
- `audio.js`: La banda sonora procedural (120 BPM), generada con Web Audio API.
- `render.py`: El script que orquesta Playwright + ffmpeg para crear el .mp4 con motion blur real.
- `LEEME.md`: Estas instrucciones.

---

## 📂 PASO 1: Subir estos archivos a tu repositorio de GitHub

Si tienes estos 4 archivos en una carpeta local en tu computadora, abre la terminal en esa carpeta y ejecuta estos comandos para vincularlos a tu repo:

```bash
# 1. Inicializa el repositorio de Git en la carpeta local
git init

# 2. Agrega todos los archivos al área de preparación
git add .

# 3. Realiza el primer commit
git commit -m "Initial commit: El Corral motion reel pipeline"

# 4. Renombra la rama a 'main' (estándar de GitHub)
git branch -M main

# 5. Vincula esta carpeta con tu repositorio remoto
git remote add origin https://github.com/RubenDarioGuerreroNeira/motionelcorral.git

# 6. Sube los archivos a GitHub
git push -u origin main