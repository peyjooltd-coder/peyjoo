(function () {
  var key = 'peyjoo-legal-lang'
  var lang = 'fa'
  try { lang = localStorage.getItem(key) === 'en' ? 'en' : 'fa' } catch (e) {}
  function apply(next) {
    lang = next
    try { localStorage.setItem(key, lang) } catch (e) {}
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr'
    document.querySelectorAll('[data-lang]').forEach(function (node) {
      node.hidden = node.getAttribute('data-lang') !== lang
    })
    var btn = document.getElementById('lang-toggle')
    if (btn) btn.textContent = lang === 'fa' ? 'English' : 'فارسی'
    var title = document.querySelector('[data-lang="' + lang + '"] h1')
    if (title) document.title = title.textContent + ' · PeyJoo'
  }
  document.getElementById('lang-toggle').addEventListener('click', function () {
    apply(lang === 'fa' ? 'en' : 'fa')
  })
  apply(lang)
})()
