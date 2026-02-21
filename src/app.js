const accessForm = document.getElementById("accessForm");
const accessStatus = document.getElementById("accessStatus");
const profileForm = document.getElementById("profileForm");
const promptForm = document.getElementById("promptForm");
const promptOutput = document.getElementById("promptOutput");
const copyPromptBtn = document.getElementById("copyPrompt");
const geminiLink = document.getElementById("geminiLink");
const buildPlanBtn = document.getElementById("buildPlan");
const studyPlanEl = document.getElementById("studyPlan");

const xpEl = document.getElementById("xp");
const stageEl = document.getElementById("stage");
const streakEl = document.getElementById("streak");
const levelEl = document.getElementById("level");
const progressFill = document.getElementById("progressFill");
const achievementsEl = document.getElementById("achievements");
const missionsEl = document.getElementById("missions");

const STORAGE_KEY = "eduasistente_mx_state_v2";

const templates = {
  diagnostico: "Haz 10 preguntas para diagnosticar fortalezas, áreas de mejora y hábitos de estudio. Cierra con 3 prioridades semanales.",
  explicacion: "Explica el tema por nivel y grado con lenguaje simple, ejemplos de México y 5 preguntas de práctica con respuestas.",
  plan: "Diseña un plan semanal (lunes-domingo) con bloques de estudio y descanso según mi tiempo.",
  examen: "Propón estrategia intensiva de 5 días para examen: contenidos, ejercicios, errores comunes y simulacro.",
  socratico: "No des la respuesta directa; guía con preguntas paso a paso y valida mi razonamiento al final."
};

const missionCatalog = [
  { id: "gmail", label: "Validar correo Gmail", xp: 15 },
  { id: "perfil", label: "Completar perfil", xp: 20 },
  { id: "prompt", label: "Generar primer prompt", xp: 25 },
  { id: "copiar", label: "Copiar prompt", xp: 10 },
  { id: "plan", label: "Crear micro-plan", xp: 15 }
];

const state = {
  access: { gmail: "", verified: false },
  profile: {
    nombre: "",
    nivel: "secundaria",
    grado: "1",
    materiaFuerte: "",
    materiaReto: "",
    estilo: "visual",
    metaSemanal: ""
  },
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
  Object.assign(state.game, parsed.game || {});
  state.achievements = parsed.achievements || [];
  state.missionsDone = parsed.missionsDone || {};
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  Object.entries(state.profile).forEach(([key, value]) => {
    const input = profileForm.elements[key];
    if (input) input.value = value;
  });
  const gmailInput = accessForm.elements.gmail;
  if (gmailInput) gmailInput.value = state.access.gmail;
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
  const { nombre, nivel, grado, estilo, metaSemanal } = state.profile;
  const baseTemplate = templates[data.tipoPrompt] || templates.explicacion;

  return `Actúa como tutor experto en currículo mexicano (${nivel}).

Perfil:
- Nombre: ${nombre || "Estudiante"}
- Grado: ${grado}
- Estilo: ${estilo}
- Meta semanal: ${metaSemanal || "No definida"}

Solicitud:
- Tipo: ${data.tipoPrompt}
- Materia: ${data.materia}
- Tema: ${data.tema}
- Objetivo: ${data.objetivo}
- Dificultad: ${data.dificultad}
- Contexto extra: ${data.contextoExtra || "N/A"}

Instrucción principal:
${baseTemplate}

Formato de salida requerido:
1) Resumen breve
2) Explicación guiada
3) Actividad práctica
4) Evaluación rápida con respuestas
5) Siguiente paso personalizado`;
}

function buildStudyPlan() {
  const target = state.profile.materiaReto || "materia prioritaria";
  return [
    `5 min: repaso rápido de conceptos clave de ${target}.`,
    `8 min: práctica guiada de 2 ejercicios sobre ${target}.`,
    "4 min: autoevaluación (3 preguntas) y corrección de errores.",
    "3 min: resumen en tus palabras + duda para preguntar a Gemini."
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

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(profileForm);
  state.profile = {
    nombre: String(data.get("nombre") || "").trim(),
    nivel: String(data.get("nivel") || "secundaria"),
    grado: String(data.get("grado") || "1"),
    materiaFuerte: String(data.get("materiaFuerte") || ""),
    materiaReto: String(data.get("materiaReto") || ""),
    estilo: String(data.get("estilo") || "visual"),
    metaSemanal: String(data.get("metaSemanal") || "")
  };
  grantMission("perfil");
  maybeUnlockAchievements();
  saveState();
  renderGame();
});

promptForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(promptForm).entries());
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
