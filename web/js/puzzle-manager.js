// Puzzle Manager - Persistent State Machine Implementation

const PuzzleManager = {
  // Debug mode: Set to true to see hotspot regions
  debug: false,
  
  // State Definitions: 'unsolved', 'solved_on', 'solved_open', 'solved_closed'
  states: {
    UNSOLVED: 'unsolved',
    SOLVED_ON: 'solved_on',
    SOLVED_OPEN: 'solved_open',
    SOLVED_CLOSED: 'solved_closed'
  },

  currentState: 'unsolved',

  // Toggle state for 'unsolved' phase
  switches: {
    left: false,
    center: false,
    right: false
  },

  config: {
    switchPath: 'assets/first puzzle/switches/'
  },

  elements: {},

  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.updateVisuals();
    
    if (this.debug) {
      document.body.classList.add('debug');
    }
  },

  // RESET FUNCTION FOR TESTING: Call PuzzleManager.reset() from console
  reset() {
    this.currentState = this.states.UNSOLVED;
    this.switches = { left: false, center: false, right: false };
    this.updateVisuals();
    console.log("Puzzle Reset!");
  },

  cacheElements() {
    this.elements = {
      panelBase: document.getElementById('panel-base'),
      panelOn: document.getElementById('panel-on'),
      panelOpen: document.getElementById('panel-open'),
      
      switchGroup: document.getElementById('switch-group'),
      switchLeft: document.getElementById('switch-left'),
      switchCenter: document.getElementById('switch-center'),
      switchRight: document.getElementById('switch-right'),
      
      hotspotGroup: document.getElementById('hotspot-group'),
      hotspotLeft: document.getElementById('hotspot-left'),
      hotspotCenter: document.getElementById('hotspot-center'),
      hotspotRight: document.getElementById('hotspot-right'),
      
      hotspotInteract: document.getElementById('hotspot-panel-interact'),
      exitPanel: document.getElementById('exit-panel')
    };
  },

  setupEventListeners() {
    // Switch Toggles (UNSOLVED state)
    this.elements.hotspotLeft?.addEventListener('click', () => this.toggleSwitch('left'));
    this.elements.hotspotCenter?.addEventListener('click', () => this.toggleSwitch('center'));
    this.elements.hotspotRight?.addEventListener('click', () => this.toggleSwitch('right'));
    
    // Panel Interaction (SOLVED states)
    this.elements.hotspotInteract?.addEventListener('click', () => this.progressState());
  },

  toggleSwitch(name) {
    if (this.currentState !== this.states.UNSOLVED) return;

    this.switches[name] = !this.switches[name];
    this.updateVisuals();
    this.checkSolution();
  },

  checkSolution() {
    if (this.switches.left && this.switches.center && this.switches.right) {
      this.currentState = this.states.SOLVED_ON;
      this.updateVisuals();
      console.log("Puzzle Solved: Switch State Completed.");
    }
  },

  progressState() {
    // Cycle through solved states
    if (this.currentState === this.states.SOLVED_ON) {
      this.currentState = this.states.SOLVED_OPEN;
    } else if (this.currentState === this.states.SOLVED_OPEN) {
      this.currentState = this.states.SOLVED_CLOSED;
    } else if (this.currentState === this.states.SOLVED_CLOSED) {
      // Locked: do nothing
      return;
    }
    
    this.updateVisuals();
  },

  updateVisuals() {
    const { 
      switchGroup, hotspotGroup, hotspotInteract, exitPanel,
      panelOn, panelOpen,
      switchLeft, switchCenter, switchRight
    } = this.elements;

    // Reset visibility of overlays and interaction hotspots
    [switchGroup, hotspotGroup, hotspotInteract, panelOn, panelOpen].forEach(el => {
      if (el) el.style.display = 'none';
    });

    // Default: Exit panel is visible
    if (exitPanel) exitPanel.style.display = 'block';

    if (this.currentState === this.states.UNSOLVED) {
      if (switchGroup) switchGroup.style.display = 'block';
      if (hotspotGroup) hotspotGroup.style.display = 'block';
      
      // Update individual switches
      if (switchLeft) switchLeft.setAttribute('href', `${this.config.switchPath}left_${this.switches.left ? 'on' : 'off'}.png`);
      if (switchCenter) switchCenter.setAttribute('href', `${this.config.switchPath}center_${this.switches.center ? 'on' : 'off'}.png`);
      if (switchRight) switchRight.setAttribute('href', `${this.config.switchPath}right_${this.switches.right ? 'on' : 'off'}.png`);

    } else if (this.currentState === this.states.SOLVED_ON) {
      if (hotspotInteract) hotspotInteract.style.display = 'block';
      if (panelOn) panelOn.style.display = 'block';

    } else if (this.currentState === this.states.SOLVED_OPEN) {
      if (hotspotInteract) hotspotInteract.style.display = 'block';
      if (panelOpen) panelOpen.style.display = 'block';
      
      // PLAYER CAN'T RETURN TO HALL IF OPEN
      if (exitPanel) exitPanel.style.display = 'none';

    } else if (this.currentState === this.states.SOLVED_CLOSED) {
      // Panel goes to turned off state (show base panel, hide overlays)
      // hotspotInteract is hidden (locked)
      // exitPanel is shown
      console.log("Panel closed and locked.");
    }
  }
};
