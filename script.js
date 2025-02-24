let startTime = null;
let elapsed = 0;
let timerInterval = null;
let isPaused = false;
let logEntries = [];

function formatDate(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return dd + '/' + mm + '/' + yy + ' ' + hours + ':' + minutes + ':' + seconds;
}

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

function logEvent(eventType) {
    const now = new Date();
    const logText = formatDate(now) + ' - ' + eventType;
    logEntries.push(logText);
    const logContainer = document.getElementById('logContainer');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = logText;
    logContainer.appendChild(entry);
}

document.getElementById('startBtn').addEventListener('click', function () {
    const username = document.getElementById('usernameInput').value.trim();
    if (username === "") {
        alert("Please enter your name before starting.");
        return;
    }
    startTime = new Date();
    isPaused = false;
    logEvent('Started');
    timerInterval = setInterval(updateTimerDisplay, 1000);
    this.disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('downloadBtn').disabled = true;
});

document.getElementById('pauseBtn').addEventListener('click', function () {
    if (!isPaused) {
        isPaused = true;
        elapsed += new Date() - startTime;
        clearInterval(timerInterval);
        logEvent('Paused');
        this.disabled = true;
        document.getElementById('resumeBtn').disabled = false;
    }
});

document.getElementById('resumeBtn').addEventListener('click', function () {
    if (isPaused) {
        isPaused = false;
        startTime = new Date();
        timerInterval = setInterval(updateTimerDisplay, 1000);
        logEvent('Resumed');
        this.disabled = true;
        document.getElementById('pauseBtn').disabled = false;
    }
});

document.getElementById('stopBtn').addEventListener('click', function () {
    if (!isPaused && startTime !== null) {
        elapsed += new Date() - startTime;
    }
    clearInterval(timerInterval);
    logEvent('Stopped');
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('resumeBtn').disabled = true;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('downloadBtn').disabled = false;
    startTime = null;
});

document.getElementById('downloadBtn').addEventListener('click', function () {
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
});
