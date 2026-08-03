# Generador de audio de llamadas a dos voces

Crea una grabación realista de una llamada, con una voz distinta para el
agente y para el cliente, y textura de línea telefónica.

## Requisitos

Solo Python 3 (ya viene en macOS) y una API key de OpenAI.
**No necesitas instalar Homebrew ni ffmpeg.**

```bash
export OPENAI_API_KEY="sk-proj-..."   # tu clave real, no este texto
```

La clave se saca de https://platform.openai.com/api-keys

## Uso

```bash
python3 scripts/make-call-audio.py scripts/call-floridian-max.json
```

El resultado queda en `public/recordings/`. Al terminar imprime la duración
exacta y el SQL listo para copiar y pegar en Supabase.

### Formato de salida

El script elige el mejor disponible, en este orden:

| Herramienta | Formato | Tamaño aprox. |
|---|---|---|
| ffmpeg (si lo tienes) | MP3 | ~1 MB |
| afconvert (viene en macOS) | M4A | ~1 MB |
| ninguna | WAV | ~4 MB |

Los tres los reproduce el navegador sin problema. El WAV solo pesa más.

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
    { "speaker": "customer", "text": "Hi, I am calling about..." }
  ]
}
```

**Voces** (OpenAI): `nova` y `shimmer` son femeninas y se distinguen bien
entre sí; `alloy` es neutra; `echo` y `onyx` masculinas; `fable` británica.
Elige dos que contrasten para que se note el cambio de turno.

**`phone_filter`** aplica una banda de 300–3400 Hz, el rango real de una
línea telefónica. Medido sobre tonos puros:

| Frecuencia | Cambio |
|---|---|
| 100 Hz | −38 dB |
| 200 Hz | −16 dB |
| 1–2 kHz (voz) | 0 dB |
| 5 kHz | −18 dB |
| 8 kHz | −45 dB |

Sin esto el audio suena a locutor en estudio, no a grabación de call center.

## Consejos para que suene natural

- Escribe los números como se pronuncian: `nine fifteen`, no `9:15`;
  `three oh five` en vez de `305`.
- Deja las muletillas (`um`, `yeah`): son lo que hace creíble la grabación.
- `speed` entre 0.95 y 1.05. Más rápido suena atropellado.

## Costo

Unos $0.015 por cada 1.000 caracteres. El guion de ejemplo tiene ~1.450
caracteres: unos 2 centavos por generación, así que puedes iterar tranquilo.
