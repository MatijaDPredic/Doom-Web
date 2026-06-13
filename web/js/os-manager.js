// OS Manager - Handles boot sequence, window management, and OS state

const OSManager = {
  state: {
    powered: false,
    booted: false,
    windows: {
      terminal: { visible: false, minimized: false, maximized: false, x: 100, y: 50 },
      logs: { visible: false, minimized: false, maximized: false, x: 150, y: 100 },
      status: { visible: false, minimized: false, maximized: false, x: 200, y: 70 },
      doom: { visible: false, minimized: false, maximized: false, x: 20, y: 20 }
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
      startMenu: document.getElementById("os-start-menu"),
      startMenuItems: document.querySelectorAll(".os-start-menu-item"),
      terminalInput: document.getElementById("os-terminal-input"),
      terminalOutput: document.getElementById("os-terminal-output"),
      doomContent: document.getElementById("os-doom-content")
    };
  },

  setupEventListeners() {
    if (this.elements.powerButton) {
      this.elements.powerButton.addEventListener("click", () => this.runBootSequence());
    }

    // Start menu toggle
    if (this.elements.startButton && this.elements.startMenu) {
      this.elements.startButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleStartMenu();
      });
    }

    // Start menu item clicks
    this.elements.startMenuItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        var app = item.dataset.startApp;
        if (app) this.openWindow(app);
        this.closeStartMenu();
      });
    });

    // Desktop area: click to blur + close start menu
    if (this.elements.desktopArea) {
      this.elements.desktopArea.addEventListener("click", (e) => {
        if (e.target === this.elements.desktopArea || e.target.classList.contains("os-desktop")) {
          this.deselectAllIcons();
          this.closeStartMenu();
        }
      });
    }
    // Close start menu when clicking elsewhere
    document.addEventListener("click", () => {
      this.closeStartMenu();
    });

    // Desktop icons: single-click to select, double-click to open
    this.elements.icons.forEach(icon => {
      icon.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectIcon(icon);
      });
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
  },

  // === Start Menu ===
  toggleStartMenu() {
    if (!this.elements.startMenu) return;
    this.elements.startMenu.classList.toggle('hidden');
  },

  closeStartMenu() {
    if (this.elements.startMenu) {
      this.elements.startMenu.classList.add('hidden');
    }
  },

  // === Desktop Icons ===
  selectIcon(icon) {
    this.deselectAllIcons();
    icon.classList.add('selected');
  },

  deselectAllIcons() {
    this.elements.icons.forEach(function(ic) {
      ic.classList.remove('selected');
    });
  },


  initDoom() {
    const container = this.elements.doomContent;
    if (!container) return;

    // If there's already an iframe, don't create another
    if (container.querySelector('iframe')) return;

    // Create iframe that loads the standalone DOOM WASM build
    const iframe = document.createElement('iframe');
    iframe.id = 'doom-iframe';
    // Dwasm WASM build output lives at web/doom/ — served as ./doom/ relative to index.html
    iframe.src = './doom/index.html';
    iframe.style.cssText = 'width:100%; height:100%; border:none; display:block;';
    iframe.allow = 'autoplay; fullscreen';
    iframe.setAttribute('tabindex', '0');
    iframe.setAttribute('scrolling', 'no');

    // Inject CSS + dynamic canvas scaling into the iframe
    iframe.addEventListener('load', () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      // Inject scaling styles (no static canvas sizing — JS handles it dynamically)
      if (!iframeDoc.getElementById('doom-scale-style')) {
        const style = iframeDoc.createElement('style');
        style.id = 'doom-scale-style';
        style.textContent = [
          'html, body {',
          '  margin: 0; padding: 0;',
          '  width: 100%; height: 100%;',
          '  overflow: hidden;',
          '  background: #000;',
          '  display: flex;',
          '  align-items: center;',
          '  justify-content: center;',
          '}',
          'canvas {',
          '  image-rendering: pixelated;',
          '  display: block;',
          '}',
          '#output { display: none !important; }'
        ].join('\n');
        iframeDoc.head.appendChild(style);
      }

      // Dynamic canvas scaling — grows AND shrinks with the window
      const canvas = iframeDoc.getElementById('canvas');
      const body = iframeDoc.body;

      function scaleCanvas() {
        if (!canvas || !body) return;
        const cw = canvas.width;   // drawing-buffer width (e.g. 640)
        const ch = canvas.height;  // drawing-buffer height (e.g. 400)
        if (!cw || !ch) return;
        const ratio = cw / ch;
        const bw = body.clientWidth;
        const bh = body.clientHeight;
        let displayW, displayH;
        if (bw / bh > ratio) {
          // body is wider than canvas ratio — height is the constraint
          displayH = bh;
          displayW = Math.floor(bh * ratio);
        } else {
          // body is taller than canvas ratio — width is the constraint
          displayW = bw;
          displayH = Math.floor(bw / ratio);
        }
        canvas.style.width = displayW + 'px';
        canvas.style.height = displayH + 'px';
      }

      scaleCanvas();

      // Re-scale whenever the iframe body changes size (window resize / maximize)
      if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => scaleCanvas());
        ro.observe(body);
      }

      // Re-scale when the WASM engine changes canvas resolution after init
      if (window.MutationObserver && canvas) {
        const mo = new MutationObserver(() => scaleCanvas());
        mo.observe(canvas, { attributes: true, attributeFilter: ['width', 'height'] });
      }

      iframe.focus();
      if (canvas) canvas.focus();
    });

    // Re-focus canvas when user clicks back into the doom area
    container.addEventListener('click', () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const canvas = iframeDoc.getElementById('canvas');
      if (canvas) canvas.focus();
    });

    // Set up keyboard forwarding (only once)
    if (!this._doomKeyboardSetup) {
      this.setupDoomKeyboard();
      this._doomKeyboardSetup = true;
    }

    // Wire up controls reference toggle buttons (only once)
    if (!this._controlsCloseSetup) {
      var self = this;
      var closeBtn = document.getElementById('controls-ref-close');
      var showBtn = document.getElementById('controls-ref-show');
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          self.hideControlsWithToggle();
        });
      }
      if (showBtn) {
        showBtn.addEventListener('click', function() {
          self.showControlsRef();
        });
      }
      this._controlsCloseSetup = true;
    }

    container.innerHTML = '';
    container.appendChild(iframe);

    console.log('[OS] Doom session launched via iframe.');
  },

  closeDoom() {
    const container = this.elements.doomContent;
    if (!container) return;

    // Remove all content (destroys iframe and its Doom session)
    container.innerHTML = '';

    console.log('[OS] Doom session terminated.');
  },

  // Show the controls reference overlay (outside the OS, like the dialogue box)
  showControlsRef() {
    const ref = document.getElementById('controls-reference');
    var showBtn = document.getElementById('controls-ref-show');
    if (ref) ref.classList.add('active');
    if (showBtn) showBtn.classList.remove('active');
  },

  // Hide the controls reference overlay
  hideControlsRef() {
    const ref = document.getElementById('controls-reference');
    var showBtn = document.getElementById('controls-ref-show');
    if (ref) ref.classList.remove('active');
    if (showBtn) showBtn.classList.remove('active');
  },

  // Hide controls but show the floating toggle so the user can bring it back
  hideControlsWithToggle() {
    const ref = document.getElementById('controls-reference');
    var showBtn = document.getElementById('controls-ref-show');
    if (ref) ref.classList.remove('active');
    if (showBtn) showBtn.classList.add('active');
  },

  // Forward keyboard events from the parent document into the DOOM iframe.
  // This is necessary because keyboard events don't automatically reach
  // iframe content — the iframe's canvas must have focus, which is unreliable
  // in a multi-window fake-OS environment.
  setupDoomKeyboard() {
    var self = this;

    function getDoomCanvas() {
      var doomWin = document.querySelector('.os-window[data-window="doom"]');
      if (!doomWin || doomWin.classList.contains('hidden')) return null;
      var iframe = doomWin.querySelector('iframe');
      if (!iframe) return null;
      var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      return iframeDoc ? iframeDoc.getElementById('canvas') : null;
    }

    function doomIsTopmost() {
      var doomState = self.state.windows.doom;
      if (!doomState || !doomState.visible || doomState.minimized) return false;
      // Don't forward if terminal input is focused
      if (document.activeElement === self.elements.terminalInput) return false;
      return true;
    }

    function forwardKey(e) {
      if (!doomIsTopmost()) return;
      // Only block Escape when a drag/resize is in progress;
      // otherwise forward it so DOOM's in-game menu works
      if (e.key === 'Escape' && document.body.classList.contains('is-resizing')) return;

      var canvas = getDoomCanvas();
      if (!canvas) return;

      // Try to focus the canvas so the engine sees it
      try { canvas.focus(); } catch (_) {}

      // Dispatch a clone into the iframe canvas
      canvas.dispatchEvent(new KeyboardEvent(e.type, {
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        which: e.which,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        repeat: e.repeat,
        bubbles: true
      }));

      // Prevent the parent from also handling game keys (e.g. arrow keys scrolling)
      e.preventDefault();
    }

    document.addEventListener('keydown', forwardKey);
    document.addEventListener('keyup', forwardKey);
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

    var winState = this.state.windows[name];
    winState.visible = true;
    winState.minimized = false;

    const win = document.querySelector(`.os-window[data-window="${name}"]`);
    if (win) {
      // Apply saved position/size from state as inline styles (first open or after close)
      if (winState.x !== undefined && !win.style.left) {
        win.style.left = winState.x + 'px';
        win.style.top = winState.y + 'px';
        if (winState.w !== undefined) win.style.width = winState.w + 'px';
        if (winState.h !== undefined) win.style.height = winState.h + 'px';
      }

      win.classList.remove("hidden");
      this.focusWindow(name);
      this.ensureTaskButton(name);

      if (name === "terminal" && this.elements.terminalInput) {
        this.elements.terminalInput.focus();
      }

      // Launch Doom as an app: create iframe on first open
      if (name === "doom") {
        this.initDoom();
        this.showControlsRef();
      }
    }
  },

  closeWindow(name) {
    if (!this.state.windows[name]) return;

    this.state.windows[name].visible = false;
    this.state.windows[name].minimized = false;
    this.state.windows[name].maximized = false;

    const win = document.querySelector(`.os-window[data-window="${name}"]`);
    if (win) {
      win.classList.add("hidden");
      win.classList.remove("maximized");
      win.style.removeProperty("inset");
    }

    const btn = document.querySelector(`.os-task-btn[data-app="${name}"]`);
    if (btn) btn.remove();

    // Close Doom: destroy iframe and hide controls reference
    if (name === "doom") {
      this.closeDoom();
      this.hideControlsRef();
    }
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

    // Hide controls reference when DOOM is minimized
    if (name === "doom") this.hideControlsRef();
  },

  maximizeWindow(name) {
    if (!this.state.windows[name]) return;

    var winState = this.state.windows[name];
    var win = document.querySelector('.os-window[data-window="' + name + '"]');
    if (!win) return;

    if (!winState.maximized) {
      // Save current position/size from state or inline styles before maximizing
      winState.savedX = winState.x;
      winState.savedY = winState.y;
      winState.savedW = win.offsetWidth;
      winState.savedH = win.offsetHeight;

      // Write current inline position so offsetLeft/offsetTop are correct on restore
      win.style.left = winState.x + 'px';
      win.style.top = winState.y + 'px';
      win.style.width = winState.savedW + 'px';
      win.style.height = winState.savedH + 'px';

      winState.maximized = true;
      win.classList.add('maximized');

      if (name === 'doom') {
        // Doom: fill entire OS screen area — override CSS !important with inline !important
        win.style.setProperty('inset', '0', 'important');
      }
    } else {
      winState.maximized = false;
      win.classList.remove('maximized');

      // Remove Doom fullscreen override
      win.style.removeProperty('inset');

      // Restore saved position/size to state AND inline styles
      winState.x = winState.savedX;
      winState.y = winState.savedY;
      win.style.left = winState.savedX + 'px';
      win.style.top = winState.savedY + 'px';
      win.style.width = winState.savedW + 'px';
      win.style.height = winState.savedH + 'px';
    }

    this.focusWindow(name);
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
    var self = this;
    var dragInfo = null;

    this.elements.windows.forEach(function(win) {
      var titlebar = win.querySelector(".os-titlebar");
      var buttons = win.querySelectorAll("[data-action]");

      win.addEventListener("mousedown", function() {
        self.focusWindow(win.dataset.window);
      });

      titlebar.addEventListener("mousedown", function(e) {
        if (e.target.closest("[data-action]")) return;
        var name = win.dataset.window;
        if (self.state.windows[name] && self.state.windows[name].maximized) return;

        dragInfo = {
          win: win,
          startX: e.clientX,
          startY: e.clientY,
          startLeft: win.offsetLeft,
          startTop: win.offsetTop
        };
        document.body.classList.add('is-resizing');
        self.focusWindow(name);
        e.preventDefault();
      });

      buttons.forEach(function(btn) {
        btn.addEventListener("click", function() {
          var action = btn.dataset.action;
          var name = win.dataset.window;
          if (action === "close") self.closeWindow(name);
          if (action === "minimize") self.minimizeWindow(name);
          if (action === "maximize") self.maximizeWindow(name);
        });
      });
    });

    // Single shared document-level listeners for drag
    document.addEventListener("mousemove", function(e) {
      if (!dragInfo) return;
      var desktopArea = self.elements.desktopArea;
      var nextLeft = dragInfo.startLeft + (e.clientX - dragInfo.startX);
      var nextTop = dragInfo.startTop + (e.clientY - dragInfo.startY);
      var maxLeft = desktopArea ? desktopArea.clientWidth - dragInfo.win.offsetWidth : 500;
      var maxTop = desktopArea ? desktopArea.clientHeight - dragInfo.win.offsetHeight : 300;
      var left = Math.max(80, Math.min(nextLeft, maxLeft));
      var top = Math.max(0, Math.min(nextTop, maxTop));
      dragInfo.win.style.left = left + 'px';
      dragInfo.win.style.top = top + 'px';
    });

    document.addEventListener("mouseup", function() {
      if (dragInfo) {
        var name = dragInfo.win.dataset.window;
        if (self.state.windows[name]) {
          self.state.windows[name].x = dragInfo.win.offsetLeft;
          self.state.windows[name].y = dragInfo.win.offsetTop;
        }
      }
      dragInfo = null;
      document.body.classList.remove('is-resizing');
    });

    // Clean up drag state on Escape so iframes don't stay locked
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && dragInfo) {
        dragInfo = null;
        document.body.classList.remove('is-resizing');
      }
    });
  },

  setupWindowResize() {
    var self = this;
    var resizeInfo = null;

    // 8 resize directions: n, ne, e, se, s, sw, w, nw
    var directions = ['n','e','s','w'];

    this.elements.windows.forEach(function(win) {
      var name = win.dataset.window;
      directions.forEach(function(dir) {
        var handle = document.createElement('div');
        handle.className = 'os-resize-handle';
        handle.setAttribute('data-resize', dir);
        handle.addEventListener('mousedown', function(e) {
          if (self.state.windows[name] && self.state.windows[name].maximized) return;
          resizeInfo = {
            win: win,
            dir: dir,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: win.offsetWidth,
            startHeight: win.offsetHeight,
            startLeft: win.offsetLeft,
            startTop: win.offsetTop
          };
          document.body.classList.add('is-resizing');
          self.focusWindow(name);
          e.preventDefault();
          e.stopPropagation();
        });
        win.appendChild(handle);
      });
    });

    document.addEventListener('mousemove', function(e) {
      if (!resizeInfo) return;
      var dx = e.clientX - resizeInfo.startX;
      var dy = e.clientY - resizeInfo.startY;
      var newW = resizeInfo.startWidth;
      var newH = resizeInfo.startHeight;
      var newL = resizeInfo.startLeft;
      var newT = resizeInfo.startTop;
      var dir = resizeInfo.dir;

      // East edge (right side affected)
      if (dir.indexOf('e') !== -1) {
        newW = resizeInfo.startWidth + dx;
      }
      // West edge (left side affected)
      if (dir.indexOf('w') !== -1) {
        newW = resizeInfo.startWidth - dx;
        newL = resizeInfo.startLeft + dx;
      }
      // South edge (bottom affected)
      if (dir.indexOf('s') !== -1) {
        newH = resizeInfo.startHeight + dy;
      }
      // North edge (top affected)
      if (dir.indexOf('n') !== -1) {
        newH = resizeInfo.startHeight - dy;
        newT = resizeInfo.startTop + dy;
      }

      // Enforce minimums
      if (newW < 200) {
        if (dir.indexOf('w') !== -1) newL = resizeInfo.startLeft + resizeInfo.startWidth - 200;
        newW = 200;
      }
      if (newH < 100) {
        if (dir.indexOf('n') !== -1) newT = resizeInfo.startTop + resizeInfo.startHeight - 100;
        newH = 100;
      }

      resizeInfo.win.style.width = newW + 'px';
      resizeInfo.win.style.height = newH + 'px';
      resizeInfo.win.style.left = newL + 'px';
      resizeInfo.win.style.top = newT + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (resizeInfo) {
        var name = resizeInfo.win.dataset.window;
        if (self.state.windows[name]) {
          self.state.windows[name].x = resizeInfo.win.offsetLeft;
          self.state.windows[name].y = resizeInfo.win.offsetTop;
          self.state.windows[name].w = resizeInfo.win.offsetWidth;
          self.state.windows[name].h = resizeInfo.win.offsetHeight;
        }
      }
      resizeInfo = null;
      document.body.classList.remove('is-resizing');
    });

    // Clean up on Escape so iframes don't stay locked
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        resizeInfo = null;
        document.body.classList.remove('is-resizing');
      }
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
doom
open logs
open status`,
      clear: "",
      status: `System status:
CRT: online
Demon link: unstable
Security: degraded
User: guest`,
      doom: "OPEN_DOOM",
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
        } else if (result === "OPEN_DOOM") {
          this.openWindow("doom");
          terminalOutput.textContent += "launching doom.exe...\n";
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
