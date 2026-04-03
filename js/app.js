import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  push,
  query,
  orderByChild,
  limitToLast,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCN-U4_DmOIpdZxLpsZMejYfAWjvTVZPBo",
  authDomain: "daily-streak-app.firebaseapp.com",
  databaseURL: "https://daily-streak-app-default-rtdb.firebaseio.com",
  projectId: "daily-streak-app",
  storageBucket: "daily-streak-app.firebasestorage.app",
  messagingSenderId: "398776168775",
  appId: "1:398776168775:web:b8fb249259685adc2b9c62",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let currentUser = null;
// Sons
let checkinSound = null;
let achievementSound = null;

// Elementos DOM
const btnCheckin = document.getElementById("btnCheckin");
const streakCount = document.getElementById("streakCount");
const pointsSpan = document.getElementById("points");
const bestStreakSpan = document.getElementById("bestStreak");
const achievementsDiv = document.getElementById("achievements");
const rankingDiv = document.getElementById("ranking");
const flame = document.getElementById("flame");
const checkinMessage = document.getElementById("checkinMessage");
const btnTheme = document.getElementById("btnTheme");
const btnLogout = document.getElementById("btnLogout");

// Conquistas predefinidas
const ACHIEVEMENTS = [
  { id: "first", name: "🔥 Primeira Chama", target: 1, icon: "🔥" },
  { id: "week", name: "⭐ Semana de Fogo", target: 7, icon: "⭐" },
  { id: "month", name: "🏆 Lenda Mensal", target: 30, icon: "🏆" },
  { id: "100days", name: "💎 Centenário", target: 100, icon: "💎" },
  {
    id: "halfYear",
    name: "🌟 Meio Ano",
    target: 183,
    icon: "🌟",
    points: 2000,
  },
  {
    id: "year",
    name: "👑 Mestre do Ano",
    target: 365,
    icon: "👑",
    points: 5000,
  },
  {
    id: "earlyBird",
    name: "🌅 Madrugador",
    target: 1,
    special: "checkinBefore8am",
    icon: "🌅",
    points: 25,
  },
  {
    id: "nightOwl",
    name: "🦉 Coruja Noturna",
    target: 1,
    special: "checkinAfter11pm",
    icon: "🦉",
    points: 25,
  },
];

// Inicialização
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  document.getElementById("userName").innerText =
    user.displayName || user.email;
  document.getElementById("userAvatar").src =
    user.photoURL || "https://via.placeholder.com/48";

  await loadUserData();
  await loadRanking();
  updateFlameVisual();
});

// Carregar dados do usuário
async function loadUserData() {
  const userRef = ref(database, `users/${currentUser.uid}`);
  const snapshot = await get(userRef);

  let userData = snapshot.val();

  if (!userData) {
    userData = {
      streak: 0,
      bestStreak: 0,
      points: 0,
      achievements: {},
      lastCheckin: null,
    };

    // Calcular progresso para próxima conquista
    const streak = userData.streak || 0;
    let nextTarget = 7;
    if (streak >= 7) nextTarget = 30;
    if (streak >= 30) nextTarget = 100;
    if (streak >= 100) nextTarget = 365;

    const progressPercent = Math.min((streak / nextTarget) * 100, 100);
    const progressBar = document.getElementById("streakProgress");
    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
      const nextLabel = document.querySelector(".progress-label");
      if (nextLabel)
        nextLabel.innerHTML = `📈 ${streak}/${nextTarget} dias para ${nextTarget} dias 🔥`;
    }

    // Notificações
    if (
      "Notification" in window &&
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      setTimeout(() => {
        Notification.requestPermission();
      }, 5000);
    }

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🔥 Daily Streak", {
        body: `Você está há ${newStreak} dias seguidos! +${pointsGain} pontos!`,
        icon: "https://cdn-icons-png.flaticon.com/512/1828/1828970.png",
      });
    }
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🏆 CONQUISTA DESBLOQUEADA!", {
        body: `${ach.name} - ${ach.target} dias de sequência!`,
        icon: "https://cdn-icons-png.flaticon.com/512/1828/1828970.png",
      });
    }
    await set(userRef, userData);
  }

  // Atualizar UI
  streakCount.innerText = userData.streak || 0;
  pointsSpan.innerText = userData.points || 0;
  bestStreakSpan.innerText = userData.bestStreak || 0;

  // Verificar check-in de hoje
  const today = new Date().toDateString();
  const lastCheckin = userData.lastCheckin;

  if (lastCheckin === today) {
    btnCheckin.disabled = true;
    btnCheckin.innerText = "✅ Check-in já feito hoje!";
    checkinMessage.innerText = "Volte amanhã para continuar sua sequência!";
  } else {
    btnCheckin.disabled = false;
    btnCheckin.innerText = "🔥 Fazer Check-in";
    checkinMessage.innerText = "";
  }

  // Calcular conquistas
  const currentStreak = userData.streak || 0;
  const unlockedAchievements = userData.achievements || {};

  for (const ach of ACHIEVEMENTS) {
    if (currentStreak >= ach.target && !unlockedAchievements[ach.id]) {
      unlockedAchievements[ach.id] = true;
      await update(userRef, { [`achievements/${ach.id}`]: true });

      // Bônus de pontos ao conquistar
      const bonus =
        ach.target === 1
          ? 10
          : ach.target === 7
            ? 50
            : ach.target === 30
              ? 200
              : 1000;
      await update(userRef, { points: (userData.points || 0) + bonus });
      pointsSpan.innerText = (userData.points || 0) + bonus;
      checkinMessage.innerText = `🎉 CONQUISTA DESBLOQUEADA: ${ach.name} +${bonus} pontos! 🎉`;
      playSound("achievement");
    }
  }

  renderAchievements(currentStreak, unlockedAchievements);
}

// Renderizar conquistas
// Renderizar conquistas
function renderAchievements(streak, unlocked) {
  achievementsDiv.innerHTML = "";
  for (const ach of ACHIEVEMENTS) {
    const unlockedFlag = unlocked[ach.id] || streak >= ach.target;

    // PRIMEIRO: criar o elemento div
    const div = document.createElement("div");
    div.className = `achievement-card ${unlockedFlag ? "unlocked" : ""}`;
    div.innerHTML = `
            <div class="icon">${ach.icon}</div>
            <div class="name">${ach.name}</div>
            <div class="progress">${Math.min(streak, ach.target)}/${ach.target}</div>
        `;

    // SEGUNDO: se estiver desbloqueada, adicionar botão de compartilhar
    if (unlockedFlag) {
      const shareBtn = document.createElement("button");
      shareBtn.className = "share-achievement-btn";
      shareBtn.innerHTML = "📤 Compartilhar";
      shareBtn.onclick = () => shareAchievement(ach.name, streak);
      div.appendChild(shareBtn);
    }

    // TERCEIRO: adicionar ao container principal
    achievementsDiv.appendChild(div);
  }
}

// Botão de Check-in
btnCheckin.onclick = async () => {
  if (btnCheckin.disabled) return;

  const userRef = ref(database, `users/${currentUser.uid}`);
  const snapshot = await get(userRef);
  let userData = snapshot.val() || { streak: 0, points: 0, bestStreak: 0 };

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const lastCheckin = userData.lastCheckin;

  let newStreak = 1;
  let pointsGain = 10;

  if (lastCheckin === yesterday) {
    newStreak = (userData.streak || 0) + 1;
    pointsGain = 10 + Math.floor(newStreak / 10) * 5;
  } else if (lastCheckin !== today) {
    newStreak = 1;
  } else {
    return;
  }

  const newPoints = (userData.points || 0) + pointsGain;
  const newBest = Math.max(newStreak, userData.bestStreak || 0);

  await update(userRef, {
    streak: newStreak,
    points: newPoints,
    bestStreak: newBest,
    lastCheckin: today,
  });

  // Atualizar ranking
  const rankRef = ref(database, `ranking/${currentUser.uid}`);
  await set(rankRef, {
    name: currentUser.displayName || currentUser.email,
    points: newPoints,
    photoURL: currentUser.photoURL || "",
    lastActive: Date.now(),
  });

  playSound("checkin");

  // Feedback visual
  streakCount.innerText = newStreak;
  pointsSpan.innerText = newPoints;
  bestStreakSpan.innerText = newBest;
  btnCheckin.disabled = true;
  btnCheckin.innerText = "✅ Check-in já feito hoje!";
  checkinMessage.innerHTML = `🔥 +${pointsGain} pontos! Sequência: ${newStreak} dias! 🔥`;
  updateFlameVisual();

  await loadUserData();
  await loadRanking();
};

// Atualizar visual do foguinho conforme streak
function updateFlameVisual() {
  const streak = parseInt(streakCount.innerText) || 0;

  // Tamanho do foguinho
  flame.style.fontSize = `${Math.min(5 + streak / 20, 7)}rem`;
  flame.style.filter = `drop-shadow(0 0 ${Math.min(10 + streak / 5, 40)}px rgba(255, 100, 0, 0.8))`;

  // Emoji da streak
  if (streak >= 365) {
    flame.innerText = "👑🔥🏆";
    document.querySelector(".streak-label").innerHTML = "CAMPEÃO ANUAL! 🎉";
  } else if (streak >= 100) {
    flame.innerText = "💎🔥";
    document.querySelector(".streak-label").innerHTML = "LENDA VIVA!";
  } else if (streak >= 30) {
    flame.innerText = "🏆🔥";
    document.querySelector(".streak-label").innerHTML = "MÊS DE FOGO!";
  } else if (streak >= 7) {
    flame.innerText = "⭐🔥";
    document.querySelector(".streak-label").innerHTML = "SEMANA DE FOGO!";
  } else {
    flame.innerText = "🔥";
    document.querySelector(".streak-label").innerHTML = "DIAS SEGUIDOS";
  }
}

// Carregar ranking online
async function loadRanking() {
  const rankingRef = query(
    ref(database, "ranking"),
    orderByChild("points"),
    limitToLast(50),
  );
  const snapshot = await get(rankingRef);
  const ranking = [];

  snapshot.forEach((child) => {
    ranking.push({ id: child.key, ...child.val() });
  });

  ranking.sort((a, b) => b.points - a.points);

  rankingDiv.innerHTML = "";
  ranking.slice(0, 20).forEach((user, idx) => {
    const div = document.createElement("div");
    div.className = "rank-item";
    div.innerHTML = `
            <div class="rank-number">${idx + 1}º</div>
            <div class="rank-name">${user.name?.substring(0, 20) || "Usuário"}</div>
            <div class="rank-score">${user.points} pts</div>
        `;
    rankingDiv.appendChild(div);
  });
}

// Dark mode
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") document.body.classList.remove("dark");
else document.body.classList.add("dark");

btnTheme.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light",
  );
  btnTheme.innerText = document.body.classList.contains("dark") ? "☀️" : "🌙";
};

function playSound(type) {
  try {
    if (type === "checkin") {
      if (!checkinSound) checkinSound = document.getElementById("checkinSound");
      checkinSound.currentTime = 0;
      checkinSound.play().catch((e) => console.log("Som não reproduzido"));
    } else if (type === "achievement") {
      if (!achievementSound)
        achievementSound = document.getElementById("achievementSound");
      achievementSound.currentTime = 0;
      achievementSound.play().catch((e) => console.log("Som não reproduzido"));
    }
  } catch (e) {
    console.log("Erro ao tocar som");
  }
}

function shareAchievement(achievementName, streak) {
  const text = `🔥 Conquistei "${achievementName}" no Daily Streak! Minha sequência: ${streak} dias seguidos! 🔥`;

  if (navigator.share) {
    navigator
      .share({
        title: "Daily Streak - Conquista!",
        text: text,
        url: window.location.href,
      })
      .catch((e) => console.log("Compartilhamento cancelado"));
  } else {
    // Fallback: copiar para clipboard
    navigator.clipboard.writeText(text);
    alert("Texto copiado! Cole onde quiser compartilhar.");
  }
}

window.addEventListener("beforeinstallprompt", (e) => {
  const installPrompt = e;
  console.log("Chrome detectou PWA! Pode instalar.");

  // Opcional: mostrar botão de instalação
  const installBtn = document.createElement("button");
  installBtn.innerText = "📱 Instalar App";
  installBtn.className = "install-btn";
  installBtn.onclick = () => {
    installPrompt.prompt();
    installPrompt.userChoice.then((choice) => {
      if (choice.outcome === "accepted") {
        console.log("Usuário aceitou instalar PWA");
      }
      installBtn.remove();
    });
  };

  // Adicionar botão após o login (opcional)
  // document.querySelector('.user-info').appendChild(installBtn);
});

// Logout
btnLogout.onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

