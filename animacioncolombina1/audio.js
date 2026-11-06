// Banda sonora hecha con código (120 BPM = un pulso cada 0.5 s). Devuelve el WAV en base64.
(async () => {
    const sr = 44100, B = 0.5, oc = new OfflineAudioContext(2, sr * 15, sr);
    const comp = oc.createDynamicsCompressor(); comp.connect(oc.destination);
    const master = oc.createGain(); master.gain.value = 0.55; master.connect(comp);
    
    const nb = oc.createBuffer(1, sr * 3, sr), nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    
    const env = (g, t, v, d) => {
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(v, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    };
    
    function kick(t, v) {
        const o = oc.createOscillator(), g = oc.createGain();
        o.frequency.setValueAtTime(170, t);
        o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
        env(g, t, v, 0.38);
        o.connect(g).connect(master); o.start(t); o.stop(t + 0.4);
    }
    
    function hit(t, v) {
        const n = oc.createBufferSource(), f = oc.createBiquadFilter(), g = oc.createGain();
        n.buffer = nb; f.type = 'highpass'; f.frequency.value = 900;
        env(g, t, v, 0.28); n.connect(f).connect(g).connect(master); n.start(t); n.stop(t + 0.3);
        const o = oc.createOscillator(), g2 = oc.createGain();
        o.frequency.setValueAtTime(70, t);
        o.frequency.exponentialRampToValueAtTime(28, t + 0.5);
        env(g2, t, v * 1.2, 0.6); o.connect(g2).connect(master); o.start(t); o.stop(t + 0.65);
    }
    
    function riser(t0, t1) {
        const n = oc.createBufferSource(), f = oc.createBiquadFilter(), g = oc.createGain();
        n.buffer = nb; n.loop = true; f.type = 'bandpass'; f.Q.value = 2;
        f.frequency.setValueAtTime(300, t0);
        f.frequency.exponentialRampToValueAtTime(7000, t1);
        g.gain.setValueAtTime(0.001, t0);
        g.gain.exponentialRampToValueAtTime(0.45, t1);
        g.gain.setValueAtTime(0, t1 + 0.01);
        n.connect(f).connect(g).connect(master); n.start(t0); n.stop(t1 + 0.02);
        
        const o = oc.createOscillator(), g3 = oc.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(110, t0);
        o.frequency.exponentialRampToValueAtTime(880, t1);
        g3.gain.setValueAtTime(0.001, t0);
        g3.gain.exponentialRampToValueAtTime(0.12, t1);
        g3.gain.setValueAtTime(0, t1 + 0.01);
        o.connect(g3).connect(master); o.start(t0); o.stop(t1 + 0.02);
    }
    
    for (let i = 0; i < 30; i++) kick(i * B, i >= 24 ? 1 : 0.85);
    for (const b of [4, 8, 12, 16, 20, 28]) hit(b * B, 0.35);
    hit(24 * B, 0.8); hit(25 * B, 0.4); hit(26 * B, 0.4);
    riser(20 * B, 24 * B);
    
    const buf = await oc.startRendering(), L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length;
    const out = new DataView(new ArrayBuffer(44 + n * 4));
    const s = (o, t) => [...t].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
    
    s(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); s(8, 'WAVEfmt ');
    out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true);
    out.setUint32(24, sr, true); out.setUint32(28, sr * 4, true);
    out.setUint16(32, 4, true); out.setUint16(34, 16, true); s(36, 'data');
    out.setUint32(40, n * 4, true);
    
    for (let i = 0; i < n; i++) {
        out.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true);
        out.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true);
    }
    
    const u = new Uint8Array(out.buffer); let bin = '';
    for (let i = 0; i < u.length; i += 8192) bin += String.fromCharCode.apply(null, u.subarray(i, i + 8192));
    return btoa(bin);
})();