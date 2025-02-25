/*****************************
 * Variáveis de Estado
 *****************************/
let startTime = null;   // Instante em que o timer foi iniciado ou retomado
let elapsed = 0;        // Tempo acumulado (em milissegundos)
let timerInterval = null;
let isPaused = false;
let logEntries = [];

/*****************************
 * Funções de Formatação
 *****************************/
function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return dd + '/' + mm + '/' + yy + ' ' + hours + ':' + minutes + ':' + seconds;
}

/*****************************
 * Atualiza exibição do timer
 *****************************/
function updateTimerDisplay() {
  const now = new Date();
  let diff = elapsed;
  if (!isPaused && startTime !== null) {
    diff += now - startTime;
  }
  const totalSeconds = Math.floor(diff / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = hours + ':' + minutes + ':' + seconds;
}

/*****************************
 * Registra eventos no log
 *****************************/
function logEvent(eventType) {
  const now = new Date();
  const logText = formatDate(now) + ' - ' + eventType;
  logEntries.push(logText);
  const logContainer = document.getElementById('logContainer');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = logText;
  logContainer.appendChild(entry);
  saveState();
}

/*****************************
 * Salva estado no Local Storage
 *****************************/
function saveState() {
  const username = document.getElementById('usernameInput').value.trim();
  const state = {
    startTime: startTime ? startTime.getTime() : null,
    elapsed: elapsed,
    isPaused: isPaused,
    logEntries: logEntries,
    username: username
  };
  localStorage.setItem('workTraceState', JSON.stringify(state));
}

/*****************************
 * Carrega estado do Local Storage
 *****************************/
function loadState() {
  const stateStr = localStorage.getItem('workTraceState');
  if (stateStr) {
    const state = JSON.parse(stateStr);
    elapsed = state.elapsed || 0;
    isPaused = state.isPaused || false;
    logEntries = state.logEntries || [];
    document.getElementById('usernameInput').value = state.username || "";
    
    // Recria o log na tela
    const logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = "";
    logEntries.forEach(function(text) {
      const entry = document.createElement('div');
      entry.className = 'log-entry';
      entry.textContent = text;
      logContainer.appendChild(entry);
    });
    
    // Se havia um timer rodando, restaura startTime e continua a contagem
    if (state.startTime && !isPaused) {
      startTime = new Date(state.startTime);
      const now = new Date();
      elapsed += now - startTime;
      startTime = now;
      timerInterval = setInterval(updateTimerDisplay, 1000);
    }
    updateTimerDisplay();
  }
  updateButtonStates();
}

/*****************************
 * Atualiza estado dos botões
 *****************************/
function updateButtonStates() {
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const stopBtn = document.getElementById('stopBtn');
  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  // Estado inicial: timer não iniciado
  if (startTime === null && elapsed === 0) {
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    stopBtn.disabled = true;
    resetBtn.disabled = false;
    downloadBtn.disabled = true;
  }
  // Timer rodando (não pausado)
  else if (startTime !== null && !isPaused) {
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
    stopBtn.disabled = false;
    resetBtn.disabled = false;
    downloadBtn.disabled = true;
  }
  // Timer pausado
  else if (isPaused) {
    startBtn.disabled = true;
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
    stopBtn.disabled = false;
    resetBtn.disabled = false;
    downloadBtn.disabled = true;
  }
}

/*****************************
 * Reseta estado (após Stop ou Reset)
 *****************************/
function resetState() {
  startTime = null;
  elapsed = 0;
  isPaused = false;
  logEntries = [];
  clearInterval(timerInterval);
  document.getElementById('logContainer').innerHTML = "";
  updateTimerDisplay();
  localStorage.removeItem('workTraceState');
  updateButtonStates();
}

/*****************************
 * Eventos dos Botões
 *****************************/
document.getElementById('startBtn').addEventListener('click', function () {
  const username = document.getElementById('usernameInput').value.trim();
  if (username === "") {
    alert("Please enter your name before starting.");
    return;
  }
  if (startTime === null) {
    startTime = new Date();
    isPaused = false;
    logEvent('Started');
    timerInterval = setInterval(updateTimerDisplay, 1000);
    saveState();
  }
  updateButtonStates();
});

document.getElementById('pauseBtn').addEventListener('click', function () {
  if (!isPaused && startTime !== null) {
    isPaused = true;
    elapsed += new Date() - startTime;
    clearInterval(timerInterval);
    logEvent('Paused');
    startTime = null;
    saveState();
  }
  updateButtonStates();
});

document.getElementById('resumeBtn').addEventListener('click', function () {
  if (isPaused) {
    isPaused = false;
    startTime = new Date();
    timerInterval = setInterval(updateTimerDisplay, 1000);
    logEvent('Resumed');
    saveState();
  }
  updateButtonStates();
});

document.getElementById('stopBtn').addEventListener('click', function () {
  if (!isPaused && startTime !== null) {
    elapsed += new Date() - startTime;
  }
  clearInterval(timerInterval);
  logEvent('Stopped');
  saveState();

  // Gera e baixa o log em arquivo TXT
  const now = new Date();
  const fileDate = String(now.getDate()).padStart(2, '0') + '/' +
      String(now.getMonth() + 1).padStart(2, '0') + '/' +
      String(now.getFullYear()).slice(-2);
  const totalHours = (elapsed / 3600000).toFixed(2);
  const username = document.getElementById('usernameInput').value.trim();
  let logContent = "";
  logContent += "=============================================================\n";
  logContent += "[" + fileDate + "]\n";
  logContent += "=============================================================\n";
  logContent += "                         - Logs -\n";
  logContent += logEntries.join('\n') + "\n\n";
  logContent += "          - Hours worked on this day -\n\n";
  logContent += username + " worked " + totalHours + " hours this day.\n\n";
  logContent += "Good job " + username + "!\n\n";
  logContent += "==============================================================\n";
  const fileDateForName = fileDate.replace(/\//g, "-");
  const fileName = "ActivityLog_" + fileDateForName + "_" + username + ".txt";
  const blob = new Blob([logContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Reseta o estado para nova contagem
  resetState();
});

document.getElementById('resetBtn').addEventListener('click', function () {
  if (confirm("Are you sure you want to reset the timer and log?")) {
    clearInterval(timerInterval);
    resetState();
  }
});

/*****************************
 * Carrega estado ao iniciar
 *****************************/
window.addEventListener('DOMContentLoaded', loadState);
