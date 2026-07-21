(() => {
  'use strict';

  const STORAGE_KEY = 'gal-valdman-accessibility-settings';
  const root = document.documentElement;

  /*
    Safety reset for the previous version:
    removes saved settings that could leave the site stuck in contrast mode.
    The new version intentionally does not persist settings after refresh.
  */
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // The widget still works when storage is unavailable.
  }

  root.classList.remove(
    'accessibility-high-contrast',
    'accessibility-grayscale',
    'accessibility-highlight-links',
    'accessibility-readable-font',
    'accessibility-stop-animations',
    'accessibility-reading-guide-active'
  );
  root.style.fontSize = '';

  const isStatementPage =
    window.location.pathname.endsWith('/accessibility.html') ||
    window.location.pathname.endsWith('accessibility.html');

  const statementHref = isStatementPage
    ? '#main'
    : 'accessibility.html';

  const statementText = isStatementPage
    ? 'לתוכן הצהרת הנגישות'
    : 'הצהרת נגישות';

  const widget = document.createElement('div');
  widget.className = 'accessibility-widget';

  widget.innerHTML = `
    <button
      class="accessibility-toggle"
      id="accessibility-toggle"
      type="button"
      aria-label="פתיחת תפריט הנגישות"
      aria-expanded="false"
      aria-controls="accessibility-panel"
    >
      <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <circle cx="32" cy="13" r="6"></circle>
        <path d="M14 23 C20 20, 26 19, 32 19 C38 19, 44 20, 50 23"></path>
        <path d="M32 20V39"></path>
        <path d="M32 28L20 35"></path>
        <path d="M32 28L44 35"></path>
        <path d="M32 39L23 54"></path>
        <path d="M32 39L41 54"></path>
      </svg>
    </button>

    <section
      class="accessibility-panel"
      id="accessibility-panel"
      aria-labelledby="accessibility-panel-title"
      hidden
    >
      <div class="accessibility-panel-header">
        <h2 id="accessibility-panel-title">כלי נגישות</h2>

        <button
          class="accessibility-close"
          id="accessibility-close"
          type="button"
          aria-label="סגירת תפריט הנגישות"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div class="accessibility-options" aria-label="אפשרויות נגישות">
        <button class="accessibility-option" type="button"
          data-accessibility-action="increase-text">
          <span class="accessibility-option-icon accessibility-text-icon"
            aria-hidden="true">A+</span>
          <span>הגדלת טקסט</span>
        </button>

        <button class="accessibility-option" type="button"
          data-accessibility-action="decrease-text">
          <span class="accessibility-option-icon accessibility-text-icon"
            aria-hidden="true">A−</span>
          <span>הקטנת טקסט</span>
        </button>

        <button class="accessibility-option" type="button"
          data-accessibility-action="high-contrast" aria-pressed="false">
          <span class="accessibility-option-icon accessibility-contrast-icon"
            aria-hidden="true"></span>
          <span>ניגודיות גבוהה</span>
        </button>

        <button class="accessibility-option" type="button"
          data-accessibility-action="grayscale" aria-pressed="false">
          <span class="accessibility-option-icon accessibility-grayscale-icon"
            aria-hidden="true"></span>
          <span>גווני אפור</span>
        </button>

        <button class="accessibility-option" type="button"
          data-accessibility-action="highlight-links" aria-pressed="false">
          <span class="accessibility-option-icon" aria-hidden="true">🔗</span>
          <span>הדגשת קישורים</span>
        </button>

        <button class="accessibility-option" type="button"
          data-accessibility-action="readable-font" aria-pressed="false">
          <span class="accessibility-option-icon accessibility-text-icon"
            aria-hidden="true">T</span>
          <span>גופן קריא</span>
        </button>

        <button class="accessibility-option" type="button"
          data-accessibility-action="stop-animations" aria-pressed="false">
          <span class="accessibility-option-icon" aria-hidden="true">◼</span>
          <span>עצירת אנימציות</span>
        </button>

        <button class="accessibility-option" type="button"
          data-accessibility-action="reading-guide" aria-pressed="false">
          <span class="accessibility-option-icon" aria-hidden="true">▬</span>
          <span>מדריך קריאה</span>
        </button>
      </div>

      <div class="accessibility-text-status"
        aria-live="polite" aria-atomic="true">
        גודל טקסט:
        <strong id="accessibility-text-size">100%</strong>
      </div>

      <button class="accessibility-reset"
        id="accessibility-reset" type="button">
        <span aria-hidden="true">↻</span>
        איפוס הגדרות
      </button>

      <a class="accessibility-statement-link" href="${statementHref}">
        ${statementText}
        <span aria-hidden="true">${isStatementPage ? '↑' : '←'}</span>
      </a>
    </section>

    <div class="accessibility-reading-guide"
      id="accessibility-reading-guide" aria-hidden="true"></div>
  `;

  document.body.appendChild(widget);

  const toggleButton = widget.querySelector('#accessibility-toggle');
  const panel = widget.querySelector('#accessibility-panel');
  const closeButton = widget.querySelector('#accessibility-close');
  const resetButton = widget.querySelector('#accessibility-reset');
  const textStatus = widget.querySelector('#accessibility-text-size');
  const readingGuide = widget.querySelector('#accessibility-reading-guide');
  const actionButtons = widget.querySelectorAll('[data-accessibility-action]');

  const settings = {
    textLevel: 0,
    highContrast: false,
    grayscale: false,
    highlightLinks: false,
    readableFont: false,
    stopAnimations: false,
    readingGuide: false
  };

  const classMap = {
    highContrast: 'accessibility-high-contrast',
    grayscale: 'accessibility-grayscale',
    highlightLinks: 'accessibility-highlight-links',
    readableFont: 'accessibility-readable-font',
    stopAnimations: 'accessibility-stop-animations',
    readingGuide: 'accessibility-reading-guide-active'
  };

  const actionMap = {
    'high-contrast': 'highContrast',
    grayscale: 'grayscale',
    'highlight-links': 'highlightLinks',
    'readable-font': 'readableFont',
    'stop-animations': 'stopAnimations',
    'reading-guide': 'readingGuide'
  };

  const updateTextSize = () => {
    settings.textLevel = Math.max(-2, Math.min(3, settings.textLevel));
    const percentage = 100 + settings.textLevel * 10;
    root.style.fontSize = settings.textLevel === 0 ? '' : `${percentage}%`;
    textStatus.textContent = `${percentage}%`;
  };

  const updateToggleState = (action, active) => {
    const button = widget.querySelector(
      `[data-accessibility-action="${action}"]`
    );

    if (button && button.hasAttribute('aria-pressed')) {
      button.setAttribute('aria-pressed', String(active));
    }
  };

  const applySettings = () => {
    Object.entries(classMap).forEach(([setting, className]) => {
      root.classList.toggle(className, settings[setting]);
    });

    Object.entries(actionMap).forEach(([action, setting]) => {
      updateToggleState(action, settings[setting]);
    });

    updateTextSize();

    if (settings.stopAnimations) {
      document.querySelectorAll('.reveal').forEach((element) => {
        element.classList.add('visible');
        element.style.transitionDelay = '0ms';
      });
    }
  };

  const openPanel = () => {
    panel.hidden = false;
    toggleButton.setAttribute('aria-expanded', 'true');
    toggleButton.setAttribute('aria-label', 'סגירת תפריט הנגישות');
    closeButton.focus();
  };

  const closePanel = (returnFocus = false) => {
    panel.hidden = true;
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-label', 'פתיחת תפריט הנגישות');

    if (returnFocus) {
      toggleButton.focus();
    }
  };

  const resetSettings = () => {
    Object.keys(settings).forEach((key) => {
      settings[key] = key === 'textLevel' ? 0 : false;
    });

    root.style.fontSize = '';
    applySettings();
  };

  toggleButton.addEventListener('click', () => {
    if (panel.hidden) {
      openPanel();
    } else {
      closePanel();
    }
  });

  closeButton.addEventListener('click', () => {
    closePanel(true);
  });

  resetButton.addEventListener('click', resetSettings);

  actionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.accessibilityAction;

      if (action === 'increase-text') {
        settings.textLevel += 1;
      } else if (action === 'decrease-text') {
        settings.textLevel -= 1;
      } else {
        const settingName = actionMap[action];

        if (settingName) {
          settings[settingName] = !settings[settingName];
        }
      }

      applySettings();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      closePanel(true);
    }
  });

  document.addEventListener('click', (event) => {
    if (
      !panel.hidden &&
      !panel.contains(event.target) &&
      !toggleButton.contains(event.target)
    ) {
      closePanel();
    }
  });

  document.addEventListener('pointermove', (event) => {
    if (settings.readingGuide) {
      readingGuide.style.top = `${event.clientY}px`;
    }
  });

  applySettings();
})();
