// Scene Manager - Handles scene switching and hotspot logic

const SceneManager = {
  currentScene: 'outside',
  sceneHistory: [],

  scenes: {
    outside: document.getElementById("scene-outside"),
    hallway: document.getElementById("scene-hallway"),
    doom: document.getElementById("scene-doom"),
    monitor: document.getElementById("scene-monitor"),
    study: document.getElementById("scene-study"),
    portrait: document.getElementById("scene-portrait")
  },

  hotspots: {
    outside: {
      'front-door': 'hallway'
    },
    hallway: {
      'exit-hall': 'doom',
      'hallway-powerpanel-hotspot': 'panel',
      'hallway-study-hotspot': 'study',
      'back-to-outside': 'outside'
    },
    doom: {
      'enter-monitor': 'monitor',
      'back-to-hallway': 'hallway'
    },
    monitor: {
      'exit-monitor': 'doom'
    },
    panel: {
      'exit-panel': 'hallway'
    },
    study: {
      'study-portrait-hotspot': 'portrait',
      'study-to-hallway': 'hallway'
    },
    portrait: {
      'portrait-to-study': 'study'
    }
  },

  init() {
    this.scenes.panel = document.getElementById("scene-panel");
    this.setupHotspots();
    this.showScene('outside');
  },

  setupHotspots() {
    for (const sceneName in this.hotspots) {
      for (const hotspotId in this.hotspots[sceneName]) {
        const element = document.getElementById(hotspotId);
        if (element) {
          this.makeAccessibleTrigger(element, () => {
            this.navigateTo(this.hotspots[sceneName][hotspotId]);
          });
        }
      }
    }
  },

  makeAccessibleTrigger(element, action) {
    element.addEventListener("click", action);
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        action();
      }
    });
  },

  navigateTo(sceneName) {
    if (this.currentScene === sceneName) return;

    this.sceneHistory.push(this.currentScene);
    this.showScene(sceneName);
  },

  showScene(sceneName) {
    for (const scene of Object.values(this.scenes)) {
      if (scene) {
        scene.classList.remove("scene-active");
      }
    }

    const targetScene = this.scenes[sceneName];
    if (targetScene) {
      targetScene.classList.add("scene-active");
      this.currentScene = sceneName;

      // Show/hide OS container based on scene
      const osContainer = document.getElementById("os-container");
      if (osContainer) {
        if (sceneName === 'monitor') {
          osContainer.classList.add("visible");
        } else {
          osContainer.classList.remove("visible");
        }
      }

      // Notify OS manager when entering monitor scene
      if (sceneName === 'monitor') {
        OSManager.onSceneEnter();
      }
    }
  },

  goBack() {
    if (this.sceneHistory.length > 0) {
      const previousScene = this.sceneHistory.pop();
      this.showScene(previousScene);
    }
  }
};
