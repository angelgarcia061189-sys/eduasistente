const accessForm = document.getElementById("accessForm");
const accessStatus = document.getElementById("accessStatus");
const profileForm = document.getElementById("profileForm");
const promptForm = document.getElementById("promptForm");
const promptOutput = document.getElementById("promptOutput");
const copyPromptBtn = document.getElementById("copyPrompt");
const geminiLink = document.getElementById("geminiLink");
const buildPlanBtn = document.getElementById("buildPlan");
const studyPlanEl = document.getElementById("studyPlan");

const nivelSelect = document.getElementById("nivelSelect");
const anioSelect = document.getElementById("anioSelect");
const materiaPerfilSelect = document.getElementById("materiaPerfilSelect");
const materiaPromptSelect = document.getElementById("materiaPromptSelect");
const temaSelect = document.getElementById("temaSelect");
const objetivoSelect = document.getElementById("objetivoSelect");
const tipoActividadSelect = document.getElementById("tipoActividadSelect");

const xpEl = document.getElementById("xp");
const stageEl = document.getElementById("stage");
const streakEl = document.getElementById("streak");
const levelEl = document.getElementById("level");
const progressFill = document.getElementById("progressFill");
const achievementsEl = document.getElementById("achievements");
const missionsEl = document.getElementById("missions");

const STORAGE_KEY = "eduasistente_mx_state_v3";

const curriculum = {
  secundaria: {
    "1": {
      "Matemáticas": ["Fracciones", "Proporciones", "Ecuaciones básicas"],
      "Español": ["Comprensión lectora", "Tipos de texto", "Ortografía"],
      "Ciencias": ["Método científico", "Célula", "Ecosistemas"],
      "Historia": ["Mesoamérica", "Virreinato", "Independencia de México"]
    },
    "2": {
      "Matemáticas": ["Álgebra", "Sistemas de ecuaciones", "Geometría"],
      "Español": ["Argumentación", "Ensayo", "Conectores"],
      "Física": ["Movimiento", "Fuerza", "Energía"],
      "Formación Cívica y Ética": ["Derechos humanos", "Participación ciudadana", "Convivencia"]
    },
    "3": {
      "Matemáticas": ["Funciones", "Trigonometría básica", "Estadística"],
      "Español": ["Reseña", "Síntesis", "Debate"],
      "Química": ["Tabla periódica", "Enlaces químicos", "Reacciones"],
      "Historia": ["Reforma", "Revolución Mexicana", "México contemporáneo"]
    }
  },
  preparatoria: {
    "1": {
      "Matemáticas I": ["Ecuaciones lineales", "Inecuaciones", "Funciones"],
      "Taller de Lectura y Redacción": ["Textos expositivos", "Resumen", "Paráfrasis"],
      "Química I": ["Estructura atómica", "Nomenclatura", "Mol"],
      "Historia de México I": ["México prehispánico", "Conquista", "Virreinato"]
    },
    "2": {
      "Matemáticas II": ["Funciones cuadráticas", "Trigonometría", "Geometría analítica"],
      "Física I": ["Cinemática", "Dinámica", "Trabajo y energía"],
      "Biología": ["Genética", "Evolución", "Ecología"],
      "Literatura": ["Géneros literarios", "Análisis de texto", "Comentario crítico"]
    },
    "3": {
      "Matemáticas III": ["Límites", "Derivadas", "Aplicaciones"],
      "Física II": ["Electricidad", "Magnetismo", "Óptica"],
      "Química II": ["Estequiometría", "Soluciones", "Equilibrio químico"],
      "Historia de México II": ["Independencia", "Reforma", "Revolución"]
    }
  }
};

const goalsByActivity = {
  tarea: ["Resolver ejercicios correctamente", "Entregar trabajo completo", "Entender procedimiento paso a paso"],
  proyecto: ["Definir estructura del proyecto", "Investigar fuentes confiables", "Presentar conclusiones claras"],
  trabajo_en_clase: ["Participar activamente", "Completar actividad en tiempo", "Explicar mi respuesta al grupo"],
  resumen: ["Identificar ideas principales", "Redactar síntesis breve", "Usar lenguaje claro y ordenado"],
  ensayo: ["Construir tesis sólida", "Argumentar con evidencias", "Cerrar con conclusión crítica"],
  cuestionario: ["Contestar con precisión", "Corregir errores frecuentes", "Aumentar porcentaje de aciertos"],
  preparacion_examen: ["Repasar temas clave", "Practicar tipo examen", "Diseñar plan intensivo de estudio"]
};

const missionCatalog = [
  { id: "gmail", label: "Validar correo Gmail", xp: 15 },
  { id: "perfil", label: "Completar perfil académico", xp: 20 },
  { id: "prompt", label: "Generar primer prompt", xp: 25 },
  { id: "copiar", label: "Copiar prompt", xp: 10 },
  { id: "plan", label: "Crear micro-plan", xp: 15 }
];

const state = {
  access: { gmail: "", verified: false },
  profile: { nombre: "", nivel: "secundaria", anio: "1", materiaPerfil: "" },
  prompt: { tipoActividad: "tarea", materia: "", tema: "", objetivo: "" },
  game: { xp: 0, stage: 1, streak: 0, level: "Inicial" },
  achievements: [],
  missionsDone: {}
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const parsed = JSON.parse(raw);
  Object.assign(state.access, parsed.access || {});
  Object.assign(state.profile, parsed.profile || {});
  Object.assign(state.prompt, parsed.prompt || {});
  Object.assign(state.game, parsed.game || {});
  state.achievements = parsed.achievements || [];
  state.missionsDone = parsed.missionsDone || {};
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setOptions(selectEl, options, selectedValue = "") {
  selectEl.innerHTML = "";
  options.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    if (item === selectedValue) option.selected = true;
    selectEl.appendChild(option);
  });
}

function syncAcademicSelectors() {
  const { nivel, anio } = state.profile;
  const yearData = curriculum[nivel][anio];
  const materias = Object.keys(yearData);

  if (!materias.includes(state.profile.materiaPerfil)) state.profile.materiaPerfil = materias[0];
  if (!materias.includes(state.prompt.materia)) state.prompt.materia = state.profile.materiaPerfil;

  setOptions(materiaPerfilSelect, materias, state.profile.materiaPerfil);
  setOptions(materiaPromptSelect, materias, state.prompt.materia);

  const temas = yearData[state.prompt.materia] || [];
  if (!temas.includes(state.prompt.tema)) state.prompt.tema = temas[0] || "";
  setOptions(temaSelect, temas, state.prompt.tema);

  const goals = goalsByActivity[state.prompt.tipoActividad] || [];
  if (!goals.includes(state.prompt.objetivo)) state.prompt.objetivo = goals[0] || "";
  setOptions(objetivoSelect, goals, state.prompt.objetivo);
}

function grantMission(missionId) {
  if (state.missionsDone[missionId]) return;
  const mission = missionCatalog.find((m) => m.id === missionId);
  if (!mission) return;
  state.missionsDone[missionId] = true;
  state.game.xp += mission.xp;
}

function calculateLevel() {
  const xp = state.game.xp;
  if (xp >= 500) return "Maestría";
  if (xp >= 300) return "Avanzado";
  if (xp >= 160) return "Intermedio";
  return "Inicial";
}

function maybeUnlockAchievements() {
  const { xp, streak } = state.game;
  const unlock = (name) => {
    if (!state.achievements.includes(name)) state.achievements.push(name);
  };
  if (xp >= 100) unlock("Primer impulso");
  if (xp >= 220) unlock("Estratega académico");
  if (xp >= 380) unlock("Racha académica");
  if (streak >= 5) unlock("Constancia 5 días");
  if (Object.keys(state.missionsDone).length === missionCatalog.length) unlock("Misiones completadas");
}

function renderAccess() {
  if (!state.access.gmail) {
    accessStatus.textContent = "Aún no validas tu correo.";
    return;
  }
  accessStatus.textContent = state.access.verified
    ? `Acceso habilitado para ${state.access.gmail}`
    : "Correo no válido: usa una cuenta @gmail.com";
}

function renderProfile() {
  profileForm.elements.nombre.value = state.profile.nombre;
  nivelSelect.value = state.profile.nivel;
  anioSelect.value = state.profile.anio;

  const gmailInput = accessForm.elements.gmail;
  if (gmailInput) gmailInput.value = state.access.gmail;

  tipoActividadSelect.value = state.prompt.tipoActividad;
  syncAcademicSelectors();
}

function renderMissions() {
  missionsEl.innerHTML = "";
  missionCatalog.forEach((m) => {
    const li = document.createElement("li");
    const done = Boolean(state.missionsDone[m.id]);
    li.className = `mission ${done ? "done" : "pending"}`;
    li.textContent = `${done ? "✅" : "⬜"} ${m.label} (+${m.xp} XP)`;
    missionsEl.appendChild(li);
  });
}

function renderGame() {
  state.game.level = calculateLevel();
  state.game.stage = Math.max(1, Math.floor(state.game.xp / 100) + 1);
  xpEl.textContent = state.game.xp;
  stageEl.textContent = state.game.stage;
  streakEl.textContent = state.game.streak;
  levelEl.textContent = state.game.level;

  const progress = Math.min((state.game.xp % 100) / 100, 1) * 100;
  progressFill.style.width = `${progress}%`;

  achievementsEl.innerHTML = "";
  if (!state.achievements.length) {
    achievementsEl.innerHTML = '<span class="badge">Sin logros aún</span>';
  } else {
    state.achievements.forEach((a) => {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = a;
      achievementsEl.appendChild(badge);
    });
  }

  renderMissions();
}

function buildPrompt(data) {
  const { nombre, nivel, anio } = state.profile;

  return `Actúa como tutor experto para ${nivel} ${anio}° en México con enfoque de autoaprendizaje.

Datos del estudiante:
- Nombre: ${nombre || "Estudiante"}
- Nivel: ${nivel}
- Año: ${anio}

Actividad solicitada:
- Tipo: ${data.tipoActividad}
- Materia: ${data.materia}
- Tema: ${data.tema}
- Objetivo: ${data.objetivo}
- Dificultad: ${data.dificultad}

Instrucciones:
1) Guíame paso a paso para que yo aprenda por mi cuenta.
2) Usa ejemplos claros aplicados al contexto escolar en México.
3) Incluye mini práctica de 5 reactivos con respuestas.
4) Cierra con checklist de verificación para validar que cumplí el objetivo.

Formato:
- Explicación breve
- Desarrollo guiado
- Práctica
- Respuestas
- Checklist final`;
}

function buildStudyPlan() {
  const { materia, tema, tipoActividad } = state.prompt;
  return [
    `5 min: repaso rápido de ${tema} en ${materia}.`,
    `8 min: práctica guiada enfocada en ${tipoActividad}.`,
    "4 min: autoevaluación con 3 preguntas clave.",
    "3 min: resumen final + siguiente duda para preguntar a Gemini."
  ];
}

accessForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const gmail = String(new FormData(accessForm).get("gmail") || "").trim().toLowerCase();
  state.access.gmail = gmail;
  state.access.verified = /^[^\s@]+@gmail\.com$/.test(gmail);
  if (state.access.verified) {
    grantMission("gmail");
    maybeUnlockAchievements();
  }
  saveState();
  renderAccess();
  renderGame();
});

nivelSelect.addEventListener("change", () => {
  state.profile.nivel = nivelSelect.value;
  state.profile.anio = "1";
  anioSelect.value = "1";
  syncAcademicSelectors();
  saveState();
});

anioSelect.addEventListener("change", () => {
  state.profile.anio = anioSelect.value;
  syncAcademicSelectors();
  saveState();
});

materiaPerfilSelect.addEventListener("change", () => {
  state.profile.materiaPerfil = materiaPerfilSelect.value;
  state.prompt.materia = materiaPerfilSelect.value;
  syncAcademicSelectors();
  saveState();
});

materiaPromptSelect.addEventListener("change", () => {
  state.prompt.materia = materiaPromptSelect.value;
  syncAcademicSelectors();
  saveState();
});

tipoActividadSelect.addEventListener("change", () => {
  state.prompt.tipoActividad = tipoActividadSelect.value;
  syncAcademicSelectors();
  saveState();
});

temaSelect.addEventListener("change", () => {
  state.prompt.tema = temaSelect.value;
  saveState();
});

objetivoSelect.addEventListener("change", () => {
  state.prompt.objetivo = objetivoSelect.value;
  saveState();
});

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(profileForm);
  state.profile.nombre = String(data.get("nombre") || "").trim();
  state.profile.nivel = String(data.get("nivel") || "secundaria");
  state.profile.anio = String(data.get("anio") || "1");
  state.profile.materiaPerfil = String(data.get("materiaPerfil") || state.profile.materiaPerfil);
  state.prompt.materia = String(data.get("materiaPerfil") || state.prompt.materia);

  syncAcademicSelectors();
  grantMission("perfil");
  maybeUnlockAchievements();
  saveState();
  renderGame();
});

promptForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(promptForm).entries());

  state.prompt.tipoActividad = data.tipoActividad;
  state.prompt.materia = data.materia;
  state.prompt.tema = data.tema;
  state.prompt.objetivo = data.objetivo;

  promptOutput.value = buildPrompt(data);
  state.game.streak += 1;
  grantMission("prompt");
  maybeUnlockAchievements();
  saveState();
  renderGame();
});

copyPromptBtn.addEventListener("click", async () => {
  const text = promptOutput.value;
  if (!text.trim()) return;
  await navigator.clipboard.writeText(text);
  grantMission("copiar");
  maybeUnlockAchievements();
  saveState();
  renderGame();
  copyPromptBtn.textContent = "¡Copiado!";
  setTimeout(() => (copyPromptBtn.textContent = "Copiar prompt"), 1200);
});

geminiLink.addEventListener("click", () => {
  state.game.xp += 10;
  maybeUnlockAchievements();
  saveState();
  renderGame();
});

buildPlanBtn.addEventListener("click", () => {
  const plan = buildStudyPlan();
  studyPlanEl.innerHTML = "";
  plan.forEach((item) => {
    const li = document.createElement("li");
    li.className = "mission done";
    li.textContent = item;
    studyPlanEl.appendChild(li);
  });
  grantMission("plan");
  maybeUnlockAchievements();
  saveState();
  renderGame();
});

loadState();
renderAccess();
renderProfile();
renderGame();
