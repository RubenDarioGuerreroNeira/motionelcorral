"""Renderiza el reel de El Corral: 60 fps, 3 subcuadros por cuadro (motion blur con ffmpeg tmix) + audio.
Uso:  python render.py            -> reel_el_corral.mp4 (15 s)
      python render.py --end 90   -> prueba rápida (solo los primeros 3 segundos)"""
import argparse, base64, glob, multiprocessing as mp, os, shutil, subprocess, time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(HERE, 'el_corral_reel.html')
N, SUB, TMP = 900, 3, os.path.join(HERE, 'tmp')

def worker(a):
    frames, = a
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1080, 'height': 1920})
        pg.goto(URL)
        pg.evaluate('window.ready')
        cv = pg.locator('#c')
        for i in frames:
            for s in range(SUB):
                t = min(max((i + (s - 1) / SUB) / N, 0), 1)
                pg.evaluate(f'window.seek({t})')
                cv.screenshot(path=f'{TMP}/sub_{i*SUB+s:05d}.png')
        b.close()

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--start', type=int, default=0)
    ap.add_argument('--end', type=int, default=N)
    ap.add_argument('--workers', type=int, default=max(1, os.cpu_count() or 1))
    ap.add_argument('--out', default='reel_el_corral.mp4')
    a = ap.parse_args()
    
    shutil.rmtree(TMP, ignore_errors=True)
    os.makedirs(TMP)
    t0 = time.time()
    
    print('1/3 Generando audio...')
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.goto(URL)
        pg.evaluate('window.ready')
        audio_b64 = pg.evaluate(open(os.path.join(HERE, 'audio.js')).read())
        open(os.path.join(HERE, 'audio.wav'), 'wb').write(base64.b64decode(audio_b64))
        b.close()
        
    print(f'2/3 Renderizando cuadros {a.start}-{a.end} con {a.workers} procesos...')
    fr = list(range(a.start, a.end))
    chunks = [fr[k::a.workers] for k in range(a.workers)]
    with mp.get_context('spawn').Pool(a.workers) as pool:
        pool.map(worker, [(c,) for c in chunks if c])
        
    print('3/3 Procesando con ffmpeg (motion blur + mux)...')
    cmd = [
        'ffmpeg', '-y', '-loglevel', 'error',
        '-framerate', str(60 * SUB), '-start_number', str(a.start * SUB),
        '-i', f'{TMP}/sub_%05d.png',
        '-ss', str(a.start / 60), '-i', f'{HERE}/audio.wav',
        '-vf', f"tmix=frames={SUB},select='eq(mod(n\\,{SUB})\\,{SUB-1})',setpts=N/60/TB",
        '-r', '60', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium',
        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest',
        os.path.join(HERE, a.out)
    ]
    subprocess.run(cmd, check=True)
    shutil.rmtree(TMP, ignore_errors=True)
    print(f'✅ Listo: {a.out}  ({time.time()-t0:.0f} s)')