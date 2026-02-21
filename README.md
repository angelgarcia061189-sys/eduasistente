# EduAsistente MX

Aplicación educativa (MVP avanzado) para estudiantes de **secundaria y bachillerato en México** con enfoque en personalización, guía de IA y gamificación.

## Qué hace esta versión

- Flujo de **acceso Gmail simulado** (validación de correo `@gmail.com` en frontend).
- Perfil académico personalizable por nivel, grado, estilo y meta semanal.
- **Prompt builder guiado** por tipo de necesidad (diagnóstico, explicación, plan, examen, socrático).
- Botón directo para abrir Gemini y pegar el prompt generado.
- Micro-plan automático de estudio de 20 minutos.
- Gamificación con XP, etapa, racha, logros y misiones.

## Alcance actual

- Frontend estático.
- Persistencia local con `localStorage`.
- Sin backend y sin OAuth real todavía.

## Ejecución local

```bash
python3 -m http.server 4173
```

Abrir: `http://localhost:4173`.

## Siguiente fase recomendada

1. Integrar Google OAuth real (login solo Gmail).
2. Guardar progreso en backend (multi-dispositivo).
3. Motor de recomendación de prompts por desempeño.
4. Ajuste de rutas de estudio por competencias SEP.
