// Game Manager - Tracks central progression state and story events

const GameManager = {
  state: {
    introSeen: false,
    hallwayRemarkSeen: false,
    keyObtained: false,
    pcRoomPowered: false,
    portraitExamined: false,
    portraitReturnRemarkSeen: false,
    portraitRiddleCompleted: false,
    pcRoomUnlockRemarkSeen: false,
    pcRoomFirstEntrySeen: false
  },

  init() {
    // The intro is triggered by the first scene load in main.js
  },

  /**
   * Shows the game intro sequence
   */
  showIntro() {
    if (this.state.introSeen) return;
    this.state.introSeen = true;

    DialogueManager.show([
      { text: "The envelope from Uncle Silas was heavy, smelling of sulfur and damp earth." },
      { text: "His last words over the phone still echo: 'The house is sick, boy. It's infested. Cleanse it.'" },
      { text: "Standing before the mansion, you feel the weight of his legacy... and the job ahead." }
    ]);
  },

  /**
   * Called when the player finds the key in the power panel
   */
  onKeyFound() {
    if (this.state.keyObtained) return;
    
    this.state.keyObtained = true;
    this.state.pcRoomPowered = true;

    DialogueManager.show([
      { text: "As the panel swings open, a heavy iron key falls onto the floor with a metallic ring." },
      { text: "You've obtained the Study Key." },
      { text: "Deep within the house, you hear a distant hum... like a machine waking up." }
    ]);
  },

  /**
   * Triggered when the portrait is clicked in the study
   */
  onPortraitExamined() {
    this.state.portraitExamined = true;
    DialogueManager.show([
      { speaker: "Player", text: "A severe face. The kind painters used when they wanted posterity to feel judged." }
    ]);
  },

  /**
   * Triggered when returning to the study after examining the portrait
   */
  onReturnToStudy() {
    if (this.state.portraitExamined && !this.state.portraitReturnRemarkSeen) {
      this.state.portraitReturnRemarkSeen = true;
      DialogueManager.show([
        { speaker: "Player", text: "Strange… I can feel a weight of expectation in this room." }
      ]);
    }
  },

  /**
   * Triggers the portrait riddle interaction
   */
  triggerPortraitRiddle() {
    DialogueManager.show([
      { speaker: "Portrait", text: "You would leave so soon?" },
      { speaker: "Portrait", text: "No one passes this threshold unmeasured." },
      { speaker: "Portrait", text: "Answer me, heir of dust:" },
      { speaker: "Portrait", text: "What manner of soul walks willingly into a house of evil, hears the jaws of the dark awaken, and still goes forward?" },
      { 
        speaker: "Portrait", 
        text: "Is it the soul that seeks to conquer? The soul that endures? Or the soul that has already been claimed by the abyss?",
        choices: [
          { 
            text: "“The one who seeks to conquer.”", 
            callback: () => this.handleRiddleAnswer("conquer") 
          },
          { 
            text: "“The one who endures.”", 
            callback: () => this.handleRiddleAnswer("endures") 
          },
          { 
            text: "“The one already claimed by the abyss.”", 
            callback: () => this.handleRiddleAnswer("abyss") 
          }
        ]
      }
    ]);
  },

  handleRiddleAnswer(answer) {
    let responseText = "";
    let itemId = "";
    
    if (answer === "conquer") {
      responseText = "Yes. There are those who answer horror with iron. They do not ask permission of darkness; they tear through it.";
      itemId = "floppy_conquer";
    } else if (answer === "endures") {
      responseText = "Yes. There are those who walk on not because they are unafraid, but because they have accepted the weight placed upon them.";
      itemId = "floppy_endures";
    } else if (answer === "abyss") {
      responseText = "Yes. And there are those in whom the dark already dwells, yet still they turn their face toward deeper night.";
      itemId = "floppy_abyss";
    }

    DialogueManager.show([
      { speaker: "Portrait", text: responseText },
      { speaker: "Portrait", text: "Different answers. Same gate." },
      { speaker: "Portrait", text: "You may leave the study." },
      { 
        speaker: "Player", 
        text: "...Something just appeared in my pocket.",
        callback: () => ItemManager.acquireItem(itemId)
      }
    ]);

    this.state.portraitRiddleCompleted = true;
  }
};
