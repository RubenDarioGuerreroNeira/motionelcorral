# Render del reel de El Corral en GitHub Codespaces

Archivos: `el_corral_reel.html` (el video, hecho con código), `audio.js` (la música, hecha con código) y `render.py` (lo convierte todo en un .mp4).

## Pasos
1. Crea un repositorio nuevo en GitHub y sube estos 4 archivos (`el_corral_reel.html`, `audio.js`, `render.py`, `LEEME.md`).
2. En el repo: botón verde **Code → Codespaces → Create codespace**. Espera a que abra el editor.
3. En la terminal del Codespace, instala las herramientas (una sola vez):
   ```
   pip install playwright && playwright install --with-deps chromium && sudo apt-get install -y ffmpeg
   ```
4. Prueba rápida (3 segundos de video, para ver que todo funciona):
   ```
   python render.py --end 90 --out prueba.mp4
   ```
5. Render completo (15 s, unos 10 a 15 minutos):
   ```
   python render.py
   ```
6. Descarga `reel_el_corral.mp4`: clic derecho sobre el archivo en el explorador de la izquierda → **Download**.
7. **Apaga el Codespace** al terminar (botón abajo a la izquierda → Stop current codespace) para no gastar tus horas gratis.

## Por qué cada paso
- **Playwright** abre el HTML en un navegador sin pantalla y le pide cada cuadro exacto (`seek(t)`), uno por uno.
- Saca 3 imágenes por cuadro y **ffmpeg** las mezcla: eso crea el desenfoque de movimiento real. Luego une el audio.
- Un Codespace tiene 2 núcleos, así que `render.py` usa 2 procesos a la vez y termina en la mitad de tiempo.
