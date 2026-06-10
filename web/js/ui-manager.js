// UI Manager - Handles DOM updates and visibility states

const UIManager = {
  init() {
    this.startClock();
  },

  startClock() {
    const clockTop = document.getElementById("os-clock-top");
    const clockBottom = document.getElementById("os-clock-bottom");

    function updateClock() {
      const now = new Date();
      const t = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (clockTop) clockTop.textContent = t;
      if (clockBottom) clockBottom.textContent = t;
    }

    setInterval(updateClock, 1000);
    updateClock();
  },

  updateSceneVisibility(sceneName) {
    // Scene visibility is handled by CSS classes via SceneManager
    // This method can be used for additional UI updates if needed
  },

  updateOSVisibility() {
    // OS visibility is handled by OSManager state
    // This method can be used for additional UI updates if needed
  }
};
