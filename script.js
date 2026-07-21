const year = document.getElementById('year');

if (year) {
  year.textContent = new Date().getFullYear();
}

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (menuButton && nav) {
  const navLinks = nav.querySelectorAll('a');

  const openMenu = () => {
    nav.classList.add('open');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'סגירת תפריט הניווט');
  };

  const closeMenu = ({ returnFocus = false } = {}) => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'פתיחת תפריט הניווט');

    if (returnFocus) {
      menuButton.focus();
    }
  };

  const toggleMenu = () => {
    const isOpen = nav.classList.contains('open');

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  menuButton.addEventListener('click', toggleMenu);

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu({ returnFocus: true });
    }
  });

  document.addEventListener('click', (event) => {
    const clickedInsideNav = nav.contains(event.target);
    const clickedMenuButton = menuButton.contains(event.target);

    if (
      nav.classList.contains('open') &&
      !clickedInsideNav &&
      !clickedMenuButton
    ) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980 && nav.classList.contains('open')) {
      closeMenu();
    }
  });
}

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const revealElements = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  revealElements.forEach((element) => {
    element.classList.add('visible');
    element.style.transitionDelay = '0ms';
  });
} else if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay =
      `${Math.min(index % 4, 3) * 70}ms`;

    observer.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add('visible');
  });
}