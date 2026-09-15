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
