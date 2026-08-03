#!/usr/bin/env python3
"""
Genera el audio de una llamada a dos voces a partir de un guion JSON.

Uso:
    export OPENAI_API_KEY="sk-..."
    python3 scripts/make-call-audio.py scripts/call-floridian-max.json

Salida:
    public/recordings/<id>.mp3   (listo para servir desde la app)

Requisitos: Python 3.9+ y ffmpeg (brew install ffmpeg).
No necesita librerías de Python: usa urllib y ffmpeg directamente.
"""

import json
import os
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

OPENAI_TTS_URL = "https://api.openai.com/v1/audio/speech"

# Voces de OpenAI. 'nova' y 'shimmer' son femeninas y se distinguen bien
# entre sí; 'onyx' y 'echo' son masculinas por si cambias de personaje.
DEFAULT_VOICES = {"agent": "nova", "customer": "shimmer"}


def die(msg: str) -> None:
    print(f"\n  Error: {msg}\n", file=sys.stderr)
    sys.exit(1)


def check_ffmpeg() -> None:
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
    except (FileNotFoundError, subprocess.CalledProcessError):
        die("No se encontró ffmpeg. Instálalo con:  brew install ffmpeg")


def synthesize(text: str, voice: str, out_path: Path, api_key: str, speed: float) -> None:
    """Una petición a la API de TTS de OpenAI por cada turno del diálogo."""
    payload = json.dumps({
        "model": "gpt-4o-mini-tts",
        "voice": voice,
        "input": text,
        "response_format": "mp3",
        "speed": speed,
    }).encode()

    req = urllib.request.Request(
        OPENAI_TTS_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as res:
            out_path.write_bytes(res.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:400]
        die(f"OpenAI respondió {e.code}: {body}")
    except urllib.error.URLError as e:
        die(f"No se pudo conectar con OpenAI: {e.reason}")


def silence(seconds: float, out_path: Path) -> None:
    subprocess.run(
        ["ffmpeg", "-v", "error", "-f", "lavfi", "-i",
         "anullsrc=channel_layout=mono:sample_rate=24000",
         "-t", f"{seconds}", "-c:a", "libmp3lame", "-b:a", "96k", str(out_path), "-y"],
        check=True,
    )


def main() -> None:
    if len(sys.argv) < 2:
        die("Falta el archivo de guion.\n  Uso: python3 scripts/make-call-audio.py <guion.json>")

    script_path = Path(sys.argv[1])
    if not script_path.exists():
        die(f"No existe el archivo {script_path}")

    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        die("Falta la variable OPENAI_API_KEY.\n"
            '  Ponla con:  export OPENAI_API_KEY="sk-..."')

    check_ffmpeg()

    script = json.loads(script_path.read_text())
    turns = script["turns"]
    voices = {**DEFAULT_VOICES, **script.get("voices", {})}
    speed = float(script.get("speed", 1.0))
    gap = float(script.get("gap_seconds", 0.35))
    phone_filter = bool(script.get("phone_filter", True))
    call_id = script.get("id", script_path.stem)

    out_dir = Path(__file__).resolve().parent.parent / "public" / "recordings"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / f"{call_id}.mp3"

    print(f"\n  Generando {len(turns)} turnos con las voces "
          f"{voices['agent']} (agente) y {voices['customer']} (cliente)...\n")

    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        pieces: list[Path] = []
        gap_file = tmp_dir / "gap.mp3"
        silence(gap, gap_file)

        for i, turn in enumerate(turns):
            speaker = turn["speaker"]
            if speaker not in voices:
                die(f"Turno {i + 1}: hablante '{speaker}' sin voz asignada.")
            piece = tmp_dir / f"{i:03d}.mp3"
            preview = turn["text"][:58].replace("\n", " ")
            print(f"   [{i + 1:2d}/{len(turns)}] {speaker:8s} {preview}...")
            synthesize(turn["text"], voices[speaker], piece, api_key, speed)
            pieces.append(piece)
            if i < len(turns) - 1:
                pieces.append(gap_file)

        listing = tmp_dir / "list.txt"
        listing.write_text("".join(f"file '{p}'\n" for p in pieces))

        # Cadena de filtros: banda telefónica 300-3400 Hz, compresión suave para
        # emparejar volúmenes y un piso de ruido muy bajo para que no suene "muerto".
        if phone_filter:
            af = (
                "highpass=f=300,lowpass=f=3400,"
                "acompressor=threshold=-18dB:ratio=3:attack=5:release=120,"
                "volume=1.6,"
                "aresample=8000,aresample=44100"
            )
        else:
            af = "acompressor=threshold=-18dB:ratio=2:attack=5:release=120"

        print("\n  Uniendo y aplicando el filtro de teléfono...")
        subprocess.run(
            ["ffmpeg", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(listing),
             "-af", af, "-c:a", "libmp3lame", "-b:a", "96k", "-ar", "44100", "-ac", "1",
             str(out_file), "-y"],
            check=True,
        )

    dur = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(out_file)],
        capture_output=True, text=True, check=True,
    ).stdout.strip()

    size_kb = out_file.stat().st_size // 1024
    print(f"\n  Listo: {out_file}")
    print(f"  Duración: {float(dur):.1f} s · {size_kb} KB\n")
    print("  Siguiente paso: actualiza la llamada en Supabase con")
    print(f"    recording_url = '/recordings/{call_id}.mp3'")
    print(f"    duration_sec  = {int(float(dur))}\n")


if __name__ == "__main__":
    main()
