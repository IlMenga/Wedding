(function() {
  function go(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    try { localStorage.setItem('ap-lang', lang); } catch(e) {}
    ['en','it','es'].forEach(function(l) {
      var b = document.getElementById('nb-'+l);
      if (b) b.className = l===lang ? 'nlb on' : 'nlb';
    });
    document.getElementById('landing').classList.add('gone');
    document.getElementById('site').classList.add('on');
    try { window.scrollTo(0,0); } catch(e) {}
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    setTimeout(observe, 100);
  }

  function home() {
    document.getElementById('site').classList.remove('on');
    document.getElementById('landing').classList.remove('gone');
    try { localStorage.removeItem('ap-lang'); } catch(e) {}
    window.scrollTo(0,0);
  }

  function observe() {
    if (!window.IntersectionObserver) {
      document.querySelectorAll('.sw, #rsvp').forEach(function(el){ el.classList.add('vis'); });
      return;
    }
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('vis'); });
    }, {threshold:.05});
    document.querySelectorAll('.sw, #rsvp').forEach(function(el){ io.observe(el); });
  }

  function tabSwitch(id) {
    document.querySelectorAll('.tp').forEach(function(p){ p.classList.remove('on'); });
    document.querySelectorAll('.tb').forEach(function(b){ b.classList.remove('on'); });
    var p = document.getElementById('tp-'+id);
    if (p) p.classList.add('on');
    document.querySelectorAll('[data-tab="'+id+'"]').forEach(function(b){ b.classList.add('on'); });
  }

  document.addEventListener('DOMContentLoaded', function() {
    // Language buttons (landing + nav)
    ['en','it','es'].forEach(function(lang) {
      var lb = document.getElementById('lb-'+lang);
      if (lb) lb.addEventListener('click', function(){ go(lang); });
      var nb = document.getElementById('nb-'+lang);
      if (nb) nb.addEventListener('click', function(){ go(lang); });
    });

    // Back button
    var back = document.getElementById('back-btn');
    if (back) back.addEventListener('click', home);

    // Tab buttons
    document.querySelectorAll('[data-tab]').forEach(function(btn){
      var id = btn.getAttribute('data-tab');
      btn.addEventListener('click', function(){ tabSwitch(id); });
    });

    // RSVP form
    var form = document.getElementById('rf');
    if (form) {
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var d = {};
        new FormData(form).forEach(function(v,k){ d[k]=v; });
        if (!d.name || !d.email || !d.attending || !d.guests) {
          alert('Please fill in all required fields.');
          return;
        }
        // TODO: Netlify Forms -> add data-netlify="true" to the form tag
        console.log('RSVP:', d);
        form.style.display = 'none';
        document.getElementById('ok').style.display = 'block';
      });
    }


    // IBAN copy
    var ibanBtn = document.getElementById('iban-copy-btn');
    if (ibanBtn) {
      ibanBtn.addEventListener('click', function() {
        var iban = document.getElementById('iban-val').textContent.replace(/\s/g,'');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(iban).then(function() {
            ibanBtn.classList.add('copied');
            setTimeout(function(){ ibanBtn.classList.remove('copied'); }, 2000);
          });
        }
      });
    }

    // Restore saved language
    try {
      var saved = localStorage.getItem('ap-lang');
      if (saved) go(saved);
    } catch(e) {}
  });
})();