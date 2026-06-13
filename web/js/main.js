// Main entry point - Initializes all modules

document.addEventListener("DOMContentLoaded", () => {
  // Initialize modules in order
  UIManager.init();
  OSManager.init();
  SceneManager.init();
  PortraitManager.init();
  DialogueManager.init();
  GameManager.init();
  ItemManager.init();
  PuzzleManager.init();

  // Show intro sequence if starting outside
  if (SceneManager.currentScene === 'outside') {
    GameManager.showIntro();
  }
});
