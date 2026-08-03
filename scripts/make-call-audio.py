#!/usr/bin/env python3
"""
Genera el audio de una llamada a dos voces a partir de un guion JSON.

    export OPENAI_API_KEY="sk-tu-clave-real-aqui"
    python3 scripts/make-call-audio.py scripts/call-floridian-max.json

Salida: public/recordings/<id>.<ext>, listo para servir desde la app.

No requiere instalar NADA: usa solo la librería estándar de Python.
Si tienes ffmpeg lo aprovecha para exportar MP3; si no, usa afconvert
(incluido en macOS) para exportar M4A; y si no hay ninguno, deja un WAV.
Todos esos formatos los reproduce el navegador sin problema.
"""

import array
import json
import math
import os
import shutil
import struct
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
import wave
from pathlib import Path

OPENAI_TTS_URL = "https://api.openai.com/v1/audio/speech"
DEFAULT_VOICES = {"agent": "nova", "customer": "shimmer"}


def die(msg: str) -> None:
    print(f"\n  Error: {msg}\n", file=sys.stderr)
    sys.exit(1)


# ---------------------------------------------------------------- TTS

def synthesize(text: str, voice: str, api_key: str, speed: float) -> bytes:
    """Pide un WAV a la API de OpenAI. WAV para poder procesarlo sin ffmpeg."""
    payload = json.dumps({
        "model": "gpt-4o-mini-tts",
        "voice": voice,
        "input": text,
        "response_format": "wav",
        "speed": speed,
    }).encode()

    req = urllib.request.Request(
        OPENAI_TTS_URL,
        data=payload,
        headers={"Authorization": f"Bearer {api_key}",
                 "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as res:
            return res.read()
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:400]
        if e.code == 401:
            die("OpenAI rechazó la API key (401).\n"
                "  Revisa que exportaste tu clave real, no el texto de ejemplo:\n"
                '    export OPENAI_API_KEY="sk-proj-..."')
        die(f"OpenAI respondió {e.code}: {body}")
    except urllib.error.URLError as e:
        die(f"No se pudo conectar con OpenAI: {e.reason}")


# ------------------------------------------------------------- audio

def read_wav(data: bytes) -> tuple[array.array, int]:
    """Devuelve (muestras int16 mono, sample_rate)."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(data)
        tmp = f.name
    try:
        with wave.open(tmp, "rb") as w:
            if w.getsampwidth() != 2:
                die("Se esperaba audio de 16 bits desde la API.")
            rate = w.getframerate()
            channels = w.getnchannels()
            raw = w.readframes(w.getnframes())
    finally:
        os.unlink(tmp)

    samples = array.array("h")
    samples.frombytes(raw)

    if channels == 2:  # a mono, promediando canales
        mono = array.array("h", [0] * (len(samples) // 2))
        for i in range(len(mono)):
            mono[i] = (samples[2 * i] + samples[2 * i + 1]) // 2
        samples = mono

    return samples, rate


def biquad(samples: array.array, rate: int, freq: float, kind: str,
           q: float = 0.7071) -> array.array:
    """Filtro biquad (recetario RBJ). kind: 'high' o 'low'."""
    w0 = 2.0 * math.pi * freq / rate
    cos_w0 = math.cos(w0)
    alpha = math.sin(w0) / (2.0 * q)

    if kind == "high":
        b0 = (1 + cos_w0) / 2
        b1 = -(1 + cos_w0)
        b2 = (1 + cos_w0) / 2
    else:
        b0 = (1 - cos_w0) / 2
        b1 = 1 - cos_w0
        b2 = (1 - cos_w0) / 2

    a0 = 1 + alpha
    a1 = -2 * cos_w0
    a2 = 1 - alpha
    b0, b1, b2, a1, a2 = b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0

    out = array.array("h", bytes(len(samples) * 2))
    x1 = x2 = y1 = y2 = 0.0
    for i, x0 in enumerate(samples):
        y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1 = x1, float(x0)
        y2, y1 = y1, y0
        out[i] = 32767 if y0 > 32767 else (-32768 if y0 < -32768 else int(y0))
    return out


def compress_and_normalize(samples: array.array, target_peak: float = 0.89,
                           threshold: float = 0.35, ratio: float = 3.0) -> array.array:
    """Compresión suave por muestra y normalización de pico."""
    thr = threshold * 32767.0
    out = array.array("h", bytes(len(samples) * 2))
    peak = 1.0

    for i, s in enumerate(samples):
        a = abs(float(s))
        if a > thr:
            a = thr + (a - thr) / ratio
        v = math.copysign(a, s)
        if abs(v) > peak:
            peak = abs(v)
        out[i] = int(v)

    gain = (target_peak * 32767.0) / peak
    for i in range(len(out)):
        v = out[i] * gain
        out[i] = 32767 if v > 32767 else (-32768 if v < -32768 else int(v))
    return out


def write_wav(path: Path, samples: array.array, rate: int) -> None:
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(samples.tobytes())


def to_compressed(wav_path: Path, out_dir: Path, call_id: str) -> Path:
    """MP3 con ffmpeg si existe; si no, M4A con afconvert (macOS); si no, WAV."""
    if shutil.which("ffmpeg"):
        out = out_dir / f"{call_id}.mp3"
        subprocess.run(["ffmpeg", "-v", "error", "-i", str(wav_path),
                        "-c:a", "libmp3lame", "-b:a", "96k", str(out), "-y"], check=True)
        wav_path.unlink()
        return out

    if shutil.which("afconvert"):
        out = out_dir / f"{call_id}.m4a"
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "96000",
                        str(wav_path), str(out)], check=True)
        wav_path.unlink()
        return out

    print("  (sin ffmpeg ni afconvert: se deja en WAV, pesa más pero funciona)")
    return wav_path


# -------------------------------------------------------------- main

def main() -> None:
    if len(sys.argv) < 2:
        die("Falta el guion.\n  Uso: python3 scripts/make-call-audio.py <guion.json>")

    script_path = Path(sys.argv[1])
    if not script_path.exists():
        die(f"No existe el archivo {script_path}")

    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        die('Falta OPENAI_API_KEY.\n  export OPENAI_API_KEY="sk-proj-..."')
    if api_key in ("sk-...", "sk-tu-clave-real-aqui") or api_key.endswith("..."):
        die("OPENAI_API_KEY tiene el texto de ejemplo, no tu clave real.\n"
            "  Cópiala de https://platform.openai.com/api-keys y exporta:\n"
            '    export OPENAI_API_KEY="sk-proj-..."')

    script = json.loads(script_path.read_text())
    turns = script["turns"]
    voices = {**DEFAULT_VOICES, **script.get("voices", {})}
    speed = float(script.get("speed", 1.0))
    gap = float(script.get("gap_seconds", 0.35))
    phone_filter = bool(script.get("phone_filter", True))
    call_id = script.get("id", script_path.stem)

    out_dir = Path(__file__).resolve().parent.parent / "public" / "recordings"
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n  Generando {len(turns)} turnos: {voices['agent']} (agente) / "
          f"{voices['customer']} (cliente)\n")

    combined = array.array("h")
    rate = None

    for i, turn in enumerate(turns):
        speaker = turn["speaker"]
        if speaker not in voices:
            die(f"Turno {i + 1}: el hablante '{speaker}' no tiene voz asignada.")
        preview = turn["text"][:56].replace("\n", " ")
        print(f"   [{i + 1:2d}/{len(turns)}] {speaker:8s} {preview}...")

        wav_bytes = synthesize(turn["text"], voices[speaker], api_key, speed)
        samples, r = read_wav(wav_bytes)
        if rate is None:
            rate = r
        elif r != rate:
            die(f"La API devolvió {r} Hz y antes {rate} Hz; no se pueden unir.")

        combined.extend(samples)
        if i < len(turns) - 1:
            combined.extend(array.array("h", bytes(int(rate * gap) * 2)))

    if rate is None:
        die("El guion no tiene turnos.")

    if phone_filter:
        print("\n  Aplicando banda telefónica 300-3400 Hz...")
        combined = biquad(combined, rate, 300.0, "high")
        combined = biquad(combined, rate, 300.0, "high")   # 24 dB/oct
        combined = biquad(combined, rate, 3400.0, "low")
        combined = biquad(combined, rate, 3400.0, "low")

    print("  Nivelando volumen...")
    combined = compress_and_normalize(combined)

    wav_path = out_dir / f"{call_id}.wav"
    write_wav(wav_path, combined, rate)
    final = to_compressed(wav_path, out_dir, call_id)

    seconds = len(combined) / rate
    size_kb = final.stat().st_size // 1024
    print(f"\n  Listo: {final}")
    print(f"  Duración: {seconds:.1f} s · {size_kb} KB\n")
    print("  Ahora actualiza la llamada en Supabase:")
    print(f"    UPDATE calls SET recording_url = '/recordings/{final.name}',")
    print(f"                     duration_sec = {int(seconds)},")
    print(f"                     recording_duration = {int(seconds)}")
    print("     WHERE id = 'call_floridian_max';\n")


if __name__ == "__main__":
    main()
