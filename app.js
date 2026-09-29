(() => {
  const toggles = [...document.querySelectorAll('.menu-toggle')];
  function closeMenus(except) {
    toggles.forEach(button => {
      if (button === except) return;
      button.setAttribute('aria-expanded', 'false');
      document.getElementById(button.getAttribute('aria-controls')).hidden = true;
    });
  }
  toggles.forEach(button => {
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      closeMenus(button);
      button.setAttribute('aria-expanded', String(open));
      document.getElementById(button.getAttribute('aria-controls')).hidden = !open;
    });
    button.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        closeMenus(button);
        button.setAttribute('aria-expanded', 'true');
        const menu = document.getElementById(button.getAttribute('aria-controls'));
        menu.hidden = false;
        menu.querySelector('a').focus();
      }
    });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.nav-item')) closeMenus();
  });
  document.addEventListener('focusin', event => {
    if (!event.target.closest('.nav-item')) closeMenus();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const open = toggles.find(button => button.getAttribute('aria-expanded') === 'true');
    if (open) { closeMenus(); open.focus(); }
  });
  const filename = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.tabbar a').forEach(a => {
    if (a.getAttribute('href').split('?')[0] === filename) a.setAttribute('aria-current', 'page');
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0, rootMargin: '0px 0px -24px 0px'});
    document.querySelectorAll('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top >= innerHeight) {
        el.classList.add('motion-ready');
        observer.observe(el);
      }
    });
    reduced.addEventListener('change', () => {
      if (reduced.matches) {
        document.querySelectorAll('.motion-ready').forEach(el => el.classList.add('is-visible'));
        observer.disconnect();
      }
    });
  }
  const top = document.querySelector('.back-top');
  function updateTop() { top.hidden = scrollY < 600; }
  addEventListener('scroll', updateTop, {passive: true});
  top.addEventListener('click', () => {
    scrollTo({top: 0, behavior: reduced.matches ? 'instant' : 'smooth'});
    document.querySelector('.skip-link').focus({preventScroll: true});
  });
  updateTop();
})();
// The two panels remain in the DOM so language changes update both variants.
document.querySelectorAll('.flow-tabs').forEach(list=>{
 const tabs=[...list.querySelectorAll('[role=tab]')];
 const activate=tab=>tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!selected;});
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();activate(tabs[n]);tabs[n].focus();}});});
});
