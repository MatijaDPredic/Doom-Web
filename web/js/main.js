// Main entry point - Initializes all modules

document.addEventListener("DOMContentLoaded", () => {
  // Initialize modules in order
  UIManager.init();
  OSManager.init();
  SceneManager.init();
  PortraitManager.init();
  PuzzleManager.init();
});
