// ======================================================
//
//  Mentioner for Editor.js v1.0.0
//  Self-contained, configurable plugin with tooltips.
//
//  byjaris.com @byJaris | jarisgv.com @JarisGV
//
// ======================================================

class Mentioner {
  static get isInline() {
    return true;
  }

  static get sanitize() {
    return { a: { href: true, target: true, 'data-mentioner-link': true } }; 
  }

  constructor({ api, config = {} }) {
    this.api = api;
    this.config = config; 
    this.button = null;
    this.tag = 'A';
    this.activeTooltip = null; 

    this.listenersInitialized = false;
    this.lastHoveredAnchor = null;
    
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);

    const defaultConfig = {
      '@': 'https://x.com/',
      '#': 'https://instagram.com/explore/tags/',
    };

    this.settings = { ...defaultConfig, ...this.config };
    this.rules = [
        {
            pattern: /^@([A-Za-z0-9._-]+)$/,
            createUrl: (match) => `${this.settings['@']}${match[1]}`,
        },
        {
            pattern: /^#\{(.+?)\}$/,
            createUrl: (match) => {
                const urlTemplate = this.settings['#'];
                if (urlTemplate.includes('{}')) {
                    return urlTemplate.replace('{}', encodeURIComponent(match[1]));
                }
                return `${urlTemplate}${encodeURIComponent(match[1].replace(/\s/g, ''))}`;
            }
        },
        {
            pattern: /^#([A-Za-z0-9._-]+)$/,
            createUrl: (match) => {
                const urlTemplate = this.settings['#'];
                if (urlTemplate.includes('{}')) {
                    return urlTemplate.replace('{}', match[1]);
                }
                return `${urlTemplate}${match[1]}`;
            }
        },
        {
            pattern: /^(https?:\/\/)?(www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\/[^\s]*)?$/,
            createUrl: (match) => `//${match[3]}${match[4] || ''}`,
            displayText: (match) => `${match[3]}${match[4] || ''}`,
        }
    ];
  }

  render() {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 16 16"><path style="stroke: none; fill: currentColor" d="M11.5 1a3.5 3.5 0 1 0 0 7h1a.5.5 0 0 1 0 1h-1A4.5 4.5 0 1 1 16 4.5v.75a1.75 1.75 0 0 1-3.167 1.027c-.407.447-.966.723-1.583.723C10.007 7 9 5.88 9 4.5S10.007 2 11.25 2c.465 0 .897.157 1.256.425a.5.5 0 0 1 .994.075v2.75a.75.75 0 0 0 1.5 0V4.5A3.5 3.5 0 0 0 11.5 1m-.25 5c.594 0 1.25-.57 1.25-1.5S11.844 3 11.25 3S10 3.57 10 4.5S10.656 6 11.25 6M14 8.5V8h.5q.257 0 .5-.05V9.5a2.5 2.5 0 0 1-2.5 2.5H8.688l-3.063 2.68A.98.98 0 0 1 4 13.942V12h-.5A2.5 2.5 0 0 1 1 9.5v-5A2.5 2.5 0 0 1 3.5 2h3.1a5.5 5.5 0 0 0 4.9 8h1A1.5 1.5 0 0 0 14 8.5"/></svg>
    `;
    this.button.classList.add(this.api.styles.inlineToolButton);
    this.initializeListeners();
    return this.button;
  }
  
  surround(range) {
    const selectedText = range.cloneContents().textContent.trim();
    if (!selectedText) return;

    const linkElement = this.createLinkFromText(selectedText);

    if (linkElement) {
      range.deleteContents();
      range.insertNode(linkElement);
    } else {
      this._showToast('Mentioner can only be applied to words starting with @, #, or valid URLs.');
    }
  }

  createLinkFromText(text) {
    for (const rule of this.rules) {
      const match = text.match(rule.pattern);
      if (match) {
        const linkElement = document.createElement(this.tag);
        linkElement.href = rule.createUrl(match);
        linkElement.textContent = rule.displayText ? rule.displayText(match) : text;
        linkElement.target = '_blank';
        linkElement.dataset.mentionerLink = 'true';
        return linkElement;
      }
    }
    return null;
  }

  checkState() {
    if (!this.button) return;
    const anchorTag = this.api.selection.findParentTag(this.tag);
    this.button.classList.toggle(this.api.styles.inlineToolButtonActive, !!anchorTag);
  }

  /**
   * Inicializa os listeners para os tooltips.
   * DEVE ser chamado no callback onReady do Editor.js.
   */
  initialize() {
    this.editorHolder = this.api.ui.nodes.holder;

    if (!this.editorHolder) {
      console.error('[Mentioner] Editor holder element not found. Tooltips will not work.');
      return;
    }
    
    this.editorHolder.addEventListener('mouseover', this._handleMouseOver.bind(this));
    this.editorHolder.addEventListener('mouseout', this._handleMouseOut.bind(this));
  
  }  

  initializeListeners() {
    if (this.listenersInitialized) {
      return;
    }
    document.body.addEventListener('mouseover', this.handleMouseOver);
    document.body.addEventListener('mouseout', this.handleMouseOut);

    this.listenersInitialized = true;
  }

  handleMouseOver(event) {
    const anchor = event.target.closest('[data-mentioner-link="true"]');
    
    if (!anchor || anchor === this.lastHoveredAnchor) return;
    
    this.lastHoveredAnchor = anchor;
    this.showTooltip(anchor);
  }
  
  handleMouseOut(event) {
    const anchor = event.target.closest('[data-mentioner-link="true"]');
    
    if (anchor && this.activeTooltip) {
      this.lastHoveredAnchor = null;
      this.hideTooltip();
    }
  }

  showTooltip(anchor) {
    this._injectStyles(); 
    
    const url = anchor.getAttribute('href');
    this.activeTooltip = document.createElement('div');
    this.activeTooltip.className = 'mentioner-tooltip';
    this.activeTooltip.textContent = url.startsWith('//') ? `https:${url}` : url;
    document.body.appendChild(this.activeTooltip);

    const linkRect = anchor.getBoundingClientRect();
    const tooltipRect = this.activeTooltip.getBoundingClientRect();
    let top = linkRect.top - tooltipRect.height - 5;
    let left = linkRect.left + (linkRect.width / 2) - (tooltipRect.width / 2);
    if (left < 10) left = 10;
    if ((left + tooltipRect.width) > window.innerWidth - 10) left = window.innerWidth - tooltipRect.width - 10;
    if (top < 10) top = linkRect.bottom + 5;
    this.activeTooltip.style.top = `${top + window.scrollY}px`;
    this.activeTooltip.style.left = `${left + window.scrollX}px`;

    setTimeout(() => {
      if (this.activeTooltip) this.activeTooltip.classList.add('mentioner-tooltip--show');
    }, 10);
  }

  hideTooltip() {
    if (!this.activeTooltip) return;

    this.activeTooltip.classList.remove('mentioner-tooltip--show');
    setTimeout(() => {
      if (this.activeTooltip && document.body.contains(this.activeTooltip)) {
        document.body.removeChild(this.activeTooltip);
        this.activeTooltip = null;
      }
    }, 200);
  }
  
  destroy() {
    if (this.listenersInitialized) {
      document.body.removeEventListener('mouseover', this.handleMouseOver);
      document.body.removeEventListener('mouseout', this.handleMouseOut);
    }
  }

  _showToast(message) {
    this._injectStyles();
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'mentioner-toast';
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('mentioner-toast--show'), 10);

    setTimeout(() => {
      toast.classList.remove('mentioner-toast--show');
      setTimeout(() => {
        if (document.body.contains(toast)) document.body.removeChild(toast);
      }, 500);
    }, 3000);
  } 

  _injectStyles() {
    const styleId = 'mentioner-plugin-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .mentioner-toast, .mentioner-tooltip {
        position: fixed; z-index: 10000;
        font-family: sans-serif; box-sizing: border-box;
      }
      .mentioner-toast {
        top: 21px; right: 21px; background-color: #2c3e50; color: #ecf0f1;
        padding: 12px 21px; border-radius: 6px; font-size: 15px;
        opacity: 0; transform: translateY(-21px);
        transition: opacity 0.6s ease, transform 0.6s ease;
        box-shadow: 0 6px 9px rgba(0, 0, 0, 0.3);
      }
      .mentioner-toast--show { opacity: 1; transform: translateY(0); }
      .mentioner-tooltip {
        background-color: #178cfa; color: #fff; padding: 6px 12px;
        border-radius: 6px; font-size: 15px;
        opacity: 0; transform: translateY(6px); transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: none; white-space: nowrap;
      }
      .mentioner-tooltip--show { opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(style);
  }
}