// Portrait Manager - Handles portrait overlay assets and state

const PortraitManager = {
  // Configuration for portrait assets
  config: {
    basePath: 'assets/study_room_riddle/portraits/',
    // The current active portrait filename
    activePortrait: 'portrait_base.png'
  },

  /**
   * Initializes the portrait manager
   */
  init() {
    this.updateAllOverlays();
  },

  /**
   * Updates all portrait overlay elements in the DOM with the current active portrait
   */
  updateAllOverlays() {
    const fullPath = this.config.basePath + this.config.activePortrait;
    const overlays = document.querySelectorAll('.portrait-overlay');
    
    overlays.forEach(overlay => {
      overlay.setAttribute('href', fullPath);
    });
  },

  /**
   * Sets a new active portrait and refreshes the overlays
   * @param {string} filename - The filename of the portrait in the portraits folder
   */
  setPortrait(filename) {
    this.config.activePortrait = filename;
    this.updateAllOverlays();
  }
};
