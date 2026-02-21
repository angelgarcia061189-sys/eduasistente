# EduAsistente MX

Aplicación educativa (MVP) para estudiantes de secundaria y preparatoria en México, con enfoque de autoaprendizaje y prompts guiados para Gemini.

## Qué hace esta versión

- Acceso Gmail simulado (validación `@gmail.com`).
- Perfil rápido por **nivel** (secundaria/preparatoria) y **año** (1°, 2°, 3°).
- Catálogo guiado de **materias por nivel/año**.
- Prompt builder por tipo de actividad: tarea, proyecto, trabajo en clase, resumen, ensayo, cuestionario o preparación para examen.
- Selector guiado de **materia + tema + objetivo** para evitar capturas manuales largas.
- Micro-plan automático de estudio de 20 minutos.
- Gamificación con XP, etapa, racha, misiones y logros.

## Alcance actual

- Frontend estático.
- Persistencia local con `localStorage`.
- Sin backend y sin OAuth real todavía.

## Ejecución local

```bash
python3 -m http.server 4173
```

Abrir: `http://localhost:4173`.
