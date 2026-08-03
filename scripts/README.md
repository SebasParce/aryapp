# Generador de audio de llamadas a dos voces

Crea una grabación realista de una llamada, con una voz distinta para el
agente y para el cliente, y textura de línea telefónica.

## Requisitos

```bash
brew install ffmpeg
export OPENAI_API_KEY="sk-..."
```

## Uso

```bash
python3 scripts/make-call-audio.py scripts/call-floridian-max.json
```

El resultado queda en `public/recordings/<id>.mp3`, listo para que la app
lo sirva. El script imprime al final la duración exacta y el SQL que hay
que correr en Supabase para asociarlo a la llamada.

## Formato del guion

```json
{
  "id": "nombre-del-archivo-de-salida",
  "voices": { "agent": "nova", "customer": "shimmer" },
  "speed": 1.0,
  "gap_seconds": 0.35,
  "phone_filter": true,
  "turns": [
    { "speaker": "agent",    "text": "Thank you for calling..." },
    { "speaker": "customer", "text": "Hi, I'm calling about..." }
  ]
}
```

**Voces disponibles** (OpenAI): `nova` y `shimmer` (femeninas, se distinguen
bien entre sí), `alloy` (neutra), `echo` y `onyx` (masculinas), `fable`
(británica). Elige dos que contrasten para que se note el cambio de turno.

**`phone_filter`** aplica una banda de 300–3400 Hz, que es el rango real de
una línea telefónica, más compresión suave. Verificado: a 6 kHz atenúa
48 dB y a 150 Hz unos 8 dB, mientras que la banda de voz (1–3 kHz) pasa
intacta. Sin esto el audio suena a locutor en estudio, no a call center.

**Consejos para que suene natural**
- Escribe los números como se pronuncian: `nine fifteen`, no `9:15`;
  `three oh five` en vez de `305`.
- Deja las muletillas (`um`, `yeah`) — son lo que hace creíble la grabación.
- `speed` entre 0.95 y 1.05. Más rápido suena atropellado.

## Costo

OpenAI TTS cuesta unos $0.015 por cada 1.000 caracteres. El guion de
ejemplo tiene ~1.450 caracteres, o sea unos 2 centavos por generación.
