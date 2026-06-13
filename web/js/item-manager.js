// Item Manager - Handles inventory and item acquisition UI

const ItemManager = {
  inventory: [],
  
  config: {
    popupId: 'item-popup',
    imageId: 'item-popup-image',
    nameId: 'item-popup-name',
    descId: 'item-popup-desc',
    floppyPath: 'assets/study_room_riddle/floppys/'
  },

  items: {
    'floppy_conquer': {
      name: 'Floppy Disk: CONQUERER',
      image: 'conquerer.png',
      desc: 'Label: "RIP AND TEAR - v1.0"'
    },
    'floppy_endures': {
      name: 'Floppy Disk: ENDURANCE',
      image: 'one_who_endures.png',
      desc: 'Label: "STAY VIGILANT - v6.66"'
    },
    'floppy_abyss': {
      name: 'Floppy Disk: TAKEN',
      image: 'taken_one.png',
      desc: 'Label: "VOID CACHE - UNREADABLE"'
    }
  },

  elements: {},

  init() {
    this.cacheElements();
    this.setupEventListeners();
  },

  cacheElements() {
    this.elements = {
      popup: document.getElementById(this.config.popupId),
      image: document.getElementById(this.config.imageId),
      name: document.getElementById(this.config.nameId),
      desc: document.getElementById(this.config.descId)
    };
  },

  setupEventListeners() {
    this.elements.popup?.addEventListener('click', () => this.hidePopup());
    window.addEventListener('keydown', (e) => {
      if (this.elements.popup?.classList.contains('active')) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
          this.hidePopup();
        }
      }
    });
  },

  /**
   * Adds an item to inventory and shows the acquisition popup
   * @param {string} itemId - The ID of the item from the items config
   */
  acquireItem(itemId) {
    const item = this.items[itemId];
    if (!item) return;

    if (!this.inventory.includes(itemId)) {
      this.inventory.push(itemId);
    }

    this.showPopup(item);
  },

  showPopup(item) {
    if (!this.elements.popup) return;

    if (this.elements.image) {
      this.elements.image.setAttribute('src', this.config.floppyPath + item.image);
    }
    if (this.elements.name) {
      this.elements.name.textContent = item.name;
    }
    if (this.elements.desc) {
      this.elements.desc.textContent = item.desc;
    }

    this.elements.popup.classList.add('active');
    document.body.classList.add('modal-active');
  },

  hidePopup() {
    if (this.elements.popup) {
      this.elements.popup.classList.remove('active');
    }
    document.body.classList.remove('modal-active');
  }
};
