// Scene Manager - Handles scene switching and hotspot logic

const SceneManager = {
  currentScene: 'outside',

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

    // Progression Logic: Study Room Exit Interruption
    if (this.currentScene === 'study' && sceneName === 'hallway') {
      if (GameManager.state.portraitExamined && !GameManager.state.portraitRiddleCompleted) {
        GameManager.triggerPortraitRiddle();
        return;
      }
    }

    // Progression Logic: Study Room Entry
    if (sceneName === 'study' && !GameManager.state.keyObtained) {
      DialogueManager.show([
        { text: "The heavy oak door is locked tight. You'll need a key to get in here." }
      ]);
      return;
    }

    // Progression Logic: PC Room (Doom Room)
    if (sceneName === 'doom') {
      if (!GameManager.state.portraitRiddleCompleted) {
        if (!GameManager.state.pcRoomPowered) {
          DialogueManager.show([
            { text: "The door doesn't appear to be locked, but it won't budge." },
            { text: "It's as if something on the other side is holding it shut." }
          ]);
        } else {
          DialogueManager.show([
            { text: "Even with the power restored, the door remains immovable." },
            { text: "A faint blue light flickers through the gap, but the way is barred." }
          ]);
        }
        return;
      } else if (!GameManager.state.pcRoomUnlockRemarkSeen) {
        // First try after riddle completion
        GameManager.state.pcRoomUnlockRemarkSeen = true;
        DialogueManager.show([
          { text: "The pressure's gone. Whatever was holding it shut... has stopped." }
        ]);
        // We still let them through after this remark
      }
    }

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
      // Track previous scene before updating
      const previousScene = this.currentScene;
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

      // Narration triggers
      if (sceneName === 'hallway' && !GameManager.state.hallwayRemarkSeen) {
        GameManager.state.hallwayRemarkSeen = true;
        DialogueManager.show([
          { text: "The hallway is thick with dust. It hasn't seen a broom in decades." }
        ]);
      }

      if (sceneName === 'portrait') {
        GameManager.onPortraitExamined();
      }

      if (sceneName === 'study') {
        if (previousScene === 'portrait') {
          GameManager.onReturnToStudy();
        } else if (!this.studyRoomVisited) {
          this.studyRoomVisited = true;
          DialogueManager.show([
            { text: "The study room is silent, smelling of old paper and stale tobacco." },
            { text: "You feel an inexplicable chill as you step across the threshold." }
          ]);
        }
      }

      if (sceneName === 'doom' && !GameManager.state.pcRoomFirstEntrySeen) {
        GameManager.state.pcRoomFirstEntrySeen = true;
        DialogueManager.show([
          { text: "I can hear it now. Something in here is running." },
          { text: "Power. And something waiting behind it." }
        ]);
      }
    }
  },

};
