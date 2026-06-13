// Dialogue Manager - Handles narration and character dialogue sequences

const DialogueManager = {
  state: {
    active: false,
    sequence: [],
    currentIndex: 0,
    isTyping: false,
    currentText: "",
    fullText: "",
    isWaitingForChoice: false
  },

  config: {
    typingSpeed: 30, // ms per character
    containerId: 'dialogue-container',
    textId: 'dialogue-text',
    speakerId: 'dialogue-speaker',
    promptId: 'dialogue-prompt',
    choicesId: 'dialogue-choices'
  },

  elements: {},

  init() {
    this.cacheElements();
    this.setupEventListeners();
  },

  cacheElements() {
    this.elements = {
      container: document.getElementById(this.config.containerId),
      text: document.getElementById(this.config.textId),
      speaker: document.getElementById(this.config.speakerId),
      prompt: document.getElementById(this.config.promptId),
      choices: document.getElementById(this.config.choicesId)
    };
  },

  setupEventListeners() {
    // Advance dialogue on click or key press
    window.addEventListener('keydown', (e) => {
      if (this.state.isWaitingForChoice) return;
      if (e.key === 'Enter' || e.key === ' ') {
        this.handleAdvance();
      }
    });

    this.elements.container?.addEventListener('click', (e) => {
      if (this.state.isWaitingForChoice) return;
      if (e.target.closest('.dialogue-choice-btn')) return;
      this.handleAdvance();
    });
  },

  /**
   * Triggers a new dialogue sequence
   * @param {Array} sequence - Array of objects { speaker: string, text: string, choices: Array }
   */
  show(sequence) {
    if (!sequence || sequence.length === 0) return;

    this.state.sequence = sequence;
    this.state.currentIndex = 0;
    this.state.active = true;
    this.state.isWaitingForChoice = false;

    // Show container and block interactions
    if (this.elements.container) {
      this.elements.container.classList.add('active');
    }
    document.body.classList.add('dialogue-active');

    this.displayCurrentLine();
  },

  handleAdvance() {
    if (!this.state.active) return;

    if (this.state.isTyping) {
      // Skip typewriter effect
      this.finishTyping();
    } else {
      // Check for callback on the current line before moving forward
      const currentLine = this.state.sequence[this.state.currentIndex];
      if (currentLine && currentLine.callback) {
        currentLine.callback();
      }

      // Move to next line or close
      this.state.currentIndex++;
      if (this.state.currentIndex < this.state.sequence.length) {
        this.displayCurrentLine();
      } else {
        this.hide();
      }
    }
  },

  displayCurrentLine() {
    const line = this.state.sequence[this.state.currentIndex];
    this.state.fullText = line.text;
    this.state.currentText = "";
    this.state.isTyping = true;
    this.state.isWaitingForChoice = false;

    // Reset choices UI
    if (this.elements.choices) {
      this.elements.choices.innerHTML = '';
      this.elements.choices.classList.remove('active');
    }

    // Handle speaker name
    if (this.elements.speaker) {
      if (line.speaker) {
        this.elements.speaker.textContent = line.speaker;
        this.elements.speaker.style.display = 'block';
      } else {
        this.elements.speaker.style.display = 'none';
      }
    }

    if (this.elements.prompt) {
      this.elements.prompt.classList.remove('visible');
    }

    this.startTyping();
  },

  startTyping() {
    if (this.typingTimer) clearInterval(this.typingTimer);

    let charIndex = 0;
    this.typingTimer = setInterval(() => {
      if (charIndex < this.state.fullText.length) {
        this.state.currentText += this.state.fullText[charIndex];
        if (this.elements.text) {
          this.elements.text.textContent = this.state.currentText;
        }
        charIndex++;
      } else {
        this.finishTyping();
      }
    }, this.config.typingSpeed);
  },

  finishTyping() {
    clearInterval(this.typingTimer);
    this.state.isTyping = false;
    this.state.currentText = this.state.fullText;
    if (this.elements.text) {
      this.elements.text.textContent = this.state.fullText;
    }

    const line = this.state.sequence[this.state.currentIndex];
    if (line.choices && line.choices.length > 0) {
      this.showChoices(line.choices);
    } else {
      if (this.elements.prompt) {
        this.elements.prompt.classList.add('visible');
      }
    }
  },

  showChoices(choices) {
    if (!this.elements.choices) return;

    this.state.isWaitingForChoice = true;
    this.elements.choices.innerHTML = '';
    this.elements.choices.classList.add('active');

    if (this.elements.prompt) {
      this.elements.prompt.classList.remove('visible');
    }

    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'dialogue-choice-btn';
      btn.textContent = choice.text;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleChoiceSelection(choice);
      });
      this.elements.choices.appendChild(btn);
    });
  },

  handleChoiceSelection(choice) {
    this.state.isWaitingForChoice = false;
    if (this.elements.choices) {
      this.elements.choices.classList.remove('active');
    }
    
    if (choice.callback) {
      choice.callback();
    }
  },

  hide() {
    this.state.active = false;
    if (this.elements.container) {
      this.elements.container.classList.remove('active');
    }
    document.body.classList.remove('dialogue-active');
    
    // Cleanup
    if (this.typingTimer) clearInterval(this.typingTimer);
  }
};
