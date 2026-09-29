(() => {
  const dictionaries = window.POKERMARS_LOCALES;
  if (!dictionaries) return;
  const select = document.getElementById('language-select');
  const supported = ['zh-Hant','zh-Hans','en','th','ms'];
  const texts = [];
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.nodeValue.trim() && !node.parentElement.closest('script,style,select')
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  while (walker.nextNode()) texts.push([walker.currentNode, walker.currentNode.nodeValue]);
  const attrs = [];
  document.querySelectorAll('[alt],[aria-label]').forEach(el => {
    ['alt','aria-label'].forEach(name => {
      if (el.hasAttribute(name)) attrs.push([el,name,el.getAttribute(name)]);
    });
  });
  const links = [...document.querySelectorAll('a[href]')].filter(a => /\.html(?:[?#]|$)/.test(a.getAttribute('href'))).map(a => [a,a.getAttribute('href')]);
  // Enhance the native fallback with the same panel styling as site navigation.
  const control = select.closest('.utility-bar');
  const trigger = document.createElement('button');
  trigger.className = 'language-trigger';
  trigger.type = 'button';
  trigger.id = 'language-trigger';
  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'language-menu');
  trigger.innerHTML = '<span class="language-globe" aria-hidden="true">🌐</span><span class="language-name"></span><span class="chevron" aria-hidden="true"></span>';
  const menu = document.createElement('div');
  menu.className = 'dropdown language-menu';
  menu.id = 'language-menu';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-labelledby', trigger.id);
  menu.hidden = true;
  const choices = [...select.options].map(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'menuitemradio');
    button.lang = option.value;
    button.dataset.language = option.value;
    button.textContent = option.textContent;
    button.addEventListener('click', () => { apply(option.value, true); closeLanguage(true); });
    menu.append(button);
    return button;
  });
  select.hidden = true;
  control.append(trigger, menu);
  function closeLanguage(focus = false) {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (focus) trigger.focus();
  }
  function openLanguage() {
    document.querySelectorAll('.menu-toggle[aria-expanded="true"]').forEach(button => {
      button.setAttribute('aria-expanded', 'false');
      document.getElementById(button.getAttribute('aria-controls')).hidden = true;
    });
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
  }
  trigger.addEventListener('click', () => menu.hidden ? openLanguage() : closeLanguage());
  trigger.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); openLanguage();
      choices[event.key === 'ArrowUp' ? choices.length - 1 : Math.max(0, supported.indexOf(select.value))].focus();
    }
  });
  menu.addEventListener('keydown', event => {
    const index = choices.indexOf(document.activeElement);
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % choices.length;
    if (event.key === 'ArrowUp') next = (index + choices.length - 1) % choices.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = choices.length - 1;
    if (next !== undefined) { event.preventDefault(); choices[next].focus(); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); closeLanguage(true); }
  });
  document.addEventListener('click', event => { if (!control.contains(event.target)) closeLanguage(); });
  document.addEventListener('focusin', event => { if (!control.contains(event.target)) closeLanguage(); });
  function apply(lang, remember = false) {
    if (!supported.includes(lang)) lang = 'zh-Hant';
    const dictionary = dictionaries[lang];
    const translate = source => dictionary[source.trim()] ?? source.trim();
    texts.forEach(([node,source]) => {
      node.nodeValue = source.replace(source.trim(), translate(source));
    });
    attrs.forEach(([el,name,source]) => el.setAttribute(name,translate(source)));
    const siteTitle = translate('PokerMars 教學說明');
    const pageTitle = document.querySelector('h1').textContent.trim();
    document.title = document.body.classList.contains('page-index') ? siteTitle : pageTitle + ' | ' + siteTitle;
    document.documentElement.lang = lang;
    select.value = lang;
    trigger.querySelector('.language-name').textContent = select.selectedOptions[0].textContent;
    trigger.setAttribute('aria-label', translate('語言') + ': ' + select.selectedOptions[0].textContent);
    choices.forEach(button => button.setAttribute('aria-checked', String(button.dataset.language === lang)));
    links.forEach(([a,href]) => {
      const [path,hash] = href.split('#');
      a.setAttribute('href',path.split('?')[0]+'?lang='+lang+(hash?'#'+hash:''));
    });
    if (remember) {
      try { localStorage.setItem('pokermars-language',lang); } catch (_) {}
      try { const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url); } catch (_) {}
    }
  }
  let stored;
  try { stored = localStorage.getItem('pokermars-language'); } catch (_) {}
  const requested = new URLSearchParams(location.search).get('lang');
  apply(supported.includes(requested) ? requested : supported.includes(stored) ? stored : 'zh-Hant');
  select.addEventListener('change', () => apply(select.value,true));
})();
