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

  updateAllOverlays() {
    const fullPath = this.config.basePath + this.config.activePortrait;
    const overlays = document.querySelectorAll('.portrait-overlay');
    overlays.forEach(overlay => {
      overlay.setAttribute('href', fullPath);
    });
  },
};
