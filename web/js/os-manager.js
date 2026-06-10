// OS Manager - Handles boot sequence, window management, and OS state

const OSManager = {
  state: {
    powered: false,
    booted: false,
    windows: {
      terminal: { visible: false, minimized: false, maximized: false, x: 100, y: 50 },
      logs: { visible: false, minimized: false, maximized: false, x: 150, y: 100 },
      status: { visible: false, minimized: false, maximized: false, x: 200, y: 70 }
    },
    highestZ: 20
  },

  elements: {},

  init() {
    this.cacheElements();
    this.setupEventListeners();
  },

  cacheElements() {
    this.elements = {
      powerOverlay: document.getElementById("os-power-overlay"),
      powerButton: document.getElementById("os-power-button"),
      bootScreen: document.getElementById("os-boot-screen"),
      bootLog: document.getElementById("os-boot-log"),
      bootFill: document.getElementById("os-boot-fill"),
      desktop: document.getElementById("os-desktop"),
      desktopArea: document.getElementById("os-desktop-area"),
      icons: document.querySelectorAll(".os-icon"),
      windows: document.querySelectorAll(".os-window"),
      taskButtons: document.getElementById("os-task-buttons"),
      startButton: document.getElementById("os-start-button"),
      terminalInput: document.getElementById("os-terminal-input"),
      terminalOutput: document.getElementById("os-terminal-output")
    };
  },

  setupEventListeners() {
    if (this.elements.powerButton) {
      this.elements.powerButton.addEventListener("click", () => this.runBootSequence());
    }

    if (this.elements.startButton) {
      this.elements.startButton.addEventListener("click", () => {
        this.openWindow("status");
        this.openWindow("logs");
      });
    }

    this.elements.icons.forEach(icon => {
      icon.addEventListener("dblclick", () => {
        this.openWindow(icon.dataset.app);
      });
    });

    this.setupWindowDrag();
    this.setupWindowResize();
    this.setupTerminal();
  },

  onSceneEnter() {
    // Called when entering monitor scene
    // OS is already initialized, no action needed
  },

  async runBootSequence() {
    if (this.state.booted) return;
    this.state.booted = true;
    this.state.powered = true;

    const { powerOverlay, bootScreen, bootLog, bootFill, desktop } = this.elements;

    const bootLines = [
      "power rail .............. ok",
      "demon detection ....... ok",
      "portal stability ....... ok",
      "security systems ...... ok",
      "memory check ......... ok",
      "desktop shell ........ ok"
    ];

    if (powerOverlay) {
      powerOverlay.style.opacity = "0";
      setTimeout(() => {
        powerOverlay.style.display = "none";
      }, 350);
    }

    if (bootLog) bootLog.textContent = "";
    if (bootFill) bootFill.style.width = "0%";
    if (bootScreen) bootScreen.style.display = "flex";

    for (let i = 0; i < bootLines.length; i++) {
      if (bootLog) bootLog.textContent += bootLines[i] + "\n";
      if (bootFill) bootFill.style.width = `${((i + 1) / bootLines.length) * 100}%`;
      await new Promise(resolve => setTimeout(resolve, 550));
    }

    await new Promise(resolve => setTimeout(resolve, 400));
    if (bootScreen) bootScreen.style.opacity = "0";

    setTimeout(() => {
      if (bootScreen) bootScreen.style.display = "none";
      if (desktop) desktop.classList.add("visible");
      this.openWindow("terminal");
    }, 420);
  },

  openWindow(name) {
    if (!this.state.windows[name]) return;

    this.state.windows[name].visible = true;
    this.state.windows[name].minimized = false;

    const win = document.querySelector(`.os-window[data-window="${name}"]`);
    if (win) {
      win.classList.remove("hidden");
      this.focusWindow(name);
      this.ensureTaskButton(name);

      if (name === "terminal" && this.elements.terminalInput) {
        this.elements.terminalInput.focus();
      }
    }
  },

  closeWindow(name) {
    if (!this.state.windows[name]) return;

    this.state.windows[name].visible = false;
    this.state.windows[name].minimized = false;

    const win = document.querySelector(`.os-window[data-window="${name}"]`);
    if (win) {
      win.classList.add("hidden");
    }

    const btn = document.querySelector(`.os-task-btn[data-app="${name}"]`);
    if (btn) btn.remove();
  },

  minimizeWindow(name) {
    if (!this.state.windows[name]) return;

    this.state.windows[name].visible = false;
    this.state.windows[name].minimized = true;

    const win = document.querySelector(`.os-window[data-window="${name}"]`);
    if (win) {
      win.classList.add("hidden");
    }

    this.ensureTaskButton(name);
    document.querySelectorAll(".os-task-btn").forEach(b => b.classList.remove("active"));
    const btn = document.querySelector(`.os-task-btn[data-app="${name}"]`);
    if (btn) btn.classList.remove("active");
  },

  maximizeWindow(name) {
    if (!this.state.windows[name]) return;

    this.state.windows[name].maximized = !this.state.windows[name].maximized;

    const win = document.querySelector(`.os-window[data-window="${name}"]`);
    if (win) {
      win.classList.toggle("maximized");
      this.focusWindow(name);
    }
  },

  focusWindow(name) {
    this.state.highestZ += 1;

    const win = document.querySelector(`.os-window[data-window="${name}"]`);
    if (win) {
      win.style.zIndex = this.state.highestZ;
    }

    document.querySelectorAll(".os-task-btn").forEach(btn => btn.classList.remove("active"));
    const taskBtn = document.querySelector(`.os-task-btn[data-app="${name}"]`);
    if (taskBtn) taskBtn.classList.add("active");
  },

  ensureTaskButton(name) {
    let btn = document.querySelector(`.os-task-btn[data-app="${name}"]`);
    if (btn) return btn;

    btn = document.createElement("button");
    btn.className = "os-task-btn";
    btn.dataset.app = name;
    btn.textContent = name;
    btn.addEventListener("click", () => {
      this.openWindow(name);
    });

    if (this.elements.taskButtons) {
      this.elements.taskButtons.appendChild(btn);
    }
    return btn;
  },

  setupWindowDrag() {
    const { windows, desktopArea } = this.elements;

    windows.forEach(win => {
      const titlebar = win.querySelector(".os-titlebar");
      const buttons = win.querySelectorAll("[data-action]");
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let startLeft = 0;
      let startTop = 0;

      win.addEventListener("mousedown", () => {
        const name = win.dataset.window;
        this.focusWindow(name);
      });

      titlebar.addEventListener("mousedown", (e) => {
        if (e.target.closest("[data-action]")) return;
        const name = win.dataset.window;
        if (this.state.windows[name]?.maximized) return;

        dragging = true;
        this.focusWindow(name);

        startX = e.clientX;
        startY = e.clientY;
        startLeft = win.offsetLeft;
        startTop = win.offsetTop;

        e.preventDefault();
      });

      document.addEventListener("mousemove", (e) => {
        if (!dragging) return;

        const nextLeft = startLeft + (e.clientX - startX);
        const nextTop = startTop + (e.clientY - startY);

        let maxLeft = desktopArea ? desktopArea.clientWidth - win.offsetWidth : 500;
        let maxTop = desktopArea ? desktopArea.clientHeight - win.offsetHeight - 22 : 300;

        win.style.left = `${Math.max(80, Math.min(nextLeft, maxLeft))}px`;
        win.style.top = `${Math.max(0, Math.min(nextTop, maxTop))}px`;
      });

      document.addEventListener("mouseup", () => {
        dragging = false;
      });

      buttons.forEach(btn => {
        btn.addEventListener("click", () => {
          const action = btn.dataset.action;
          const name = win.dataset.window;

          if (action === "close") this.closeWindow(name);
          if (action === "minimize") this.minimizeWindow(name);
          if (action === "maximize") this.maximizeWindow(name);
        });
      });
    });
  },

  setupWindowResize() {
    const { windows } = this.elements;

    windows.forEach(win => {
      let resizing = false;
      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;

      const resizeHandle = document.createElement("div");
      resizeHandle.className = "os-resize-handle";
      win.appendChild(resizeHandle);

      resizeHandle.addEventListener("mousedown", e => {
        resizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = win.offsetWidth;
        startHeight = win.offsetHeight;
        e.preventDefault();
        e.stopPropagation();
      });

      document.addEventListener("mousemove", e => {
        if (!resizing) return;
        const newWidth = Math.max(200, startWidth + (e.clientX - startX));
        const newHeight = Math.max(100, startHeight + (e.clientY - startY));
        win.style.width = newWidth + "px";
        win.style.height = newHeight + "px";
      });

      document.addEventListener("mouseup", () => {
        resizing = false;
      });
    });
  },

  setupTerminal() {
    const { terminalInput, terminalOutput } = this.elements;

    if (!terminalInput || !terminalOutput) return;

    const commands = {
      help: `Available commands:
help
clear
status
open logs
open status`,
      clear: "",
      status: `System status:
CRT: online
Demon link: unstable
Security: degraded
User: guest`,
      "open logs": "OPEN_LOGS",
      "open status": "OPEN_STATUS"
    };

    terminalInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;

      const input = terminalInput.value.trim().toLowerCase();
      if (!input) return;

      terminalOutput.textContent += `\n> ${input}\n`;

      if (input in commands) {
        const result = commands[input];

        if (result === "") {
          terminalOutput.textContent = "";
        } else if (result === "OPEN_LOGS") {
          this.openWindow("logs");
          terminalOutput.textContent += "opening logs...\n";
        } else if (result === "OPEN_STATUS") {
          this.openWindow("status");
          terminalOutput.textContent += "opening status...\n";
        } else {
          terminalOutput.textContent += result + "\n";
        }
      } else {
        terminalOutput.textContent += "unknown command\n";
      }

      terminalInput.value = "";
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    });
  }
};
