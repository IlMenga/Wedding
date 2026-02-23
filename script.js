(function() {
  function go(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    try { localStorage.setItem('ap-lang', lang); } catch(e) {}
    var fl = document.getElementById('form-lang');
    if (fl) fl.value = lang;
    ['en','it','es'].forEach(function(l) {
      var b = document.getElementById('nb-'+l);
      if (b) b.className = l===lang ? 'nlb on' : 'nlb';
    });
    var toggle = document.getElementById('lang-toggle');
    if (toggle) toggle.textContent = lang.toUpperCase() + ' \u25BE';
    var menu = document.getElementById('lang-menu');
    if (menu) menu.classList.remove('open');
    document.getElementById('landing').classList.add('gone');
    var fb = document.getElementById('flip-btn');
    if (fb) fb.style.display = 'none';
    document.getElementById('site').classList.add('on');
    try { window.scrollTo(0,0); } catch(e) {}
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    setTimeout(observe, 100);
  }

  function home() {
    document.getElementById('site').classList.remove('on');
    document.getElementById('landing').classList.remove('gone');
    var fb = document.getElementById('flip-btn');
    if (fb) fb.style.display = '';
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
    // Language buttons (landing front + back + nav)
    ['en','it','es'].forEach(function(lang) {
      var lb = document.getElementById('lb-'+lang);
      if (lb) lb.addEventListener('click', function(){ go(lang); });
      var lb2 = document.getElementById('lb2-'+lang);
      if (lb2) lb2.addEventListener('click', function(){ go(lang); });
      var nb = document.getElementById('nb-'+lang);
      if (nb) nb.addEventListener('click', function(){ go(lang); });
    });

    // Language dropdown toggle
    var langToggle = document.getElementById('lang-toggle');
    var langMenu = document.getElementById('lang-menu');
    if (langToggle && langMenu) {
      langToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        langMenu.classList.toggle('open');
      });
      document.addEventListener('click', function() {
        langMenu.classList.remove('open');
      });
      langMenu.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }

    // Postcard flip
    var flipBtn = document.getElementById('flip-btn');
    var cardEl = document.getElementById('card');
    var flipped = false;
    if (flipBtn && cardEl) {
      flipBtn.addEventListener('click', function() {
        flipped = !flipped;
        cardEl.style.transition = 'transform .8s cubic-bezier(.4,0,.2,1)';
        cardEl.style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
        flipBtn.textContent = flipped ? '\u21A9 flip back' : '\u21A9 flip';
      });
    }

    // Back button (footer)
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
      // Conditional fields
      var attendFields = form.querySelectorAll('#f-plusone-row, #f-dietary-row, #f-message-row');
      var partnerRow = document.getElementById('f-partner-row');

      function toggleConditional() {
        var val = form.querySelector('input[name="attending"]:checked');
        var attending = val && val.value === 'yes';
        attendFields.forEach(function(el) {
          if (attending) { el.classList.remove('inactive'); }
          else           { el.classList.add('inactive'); }
        });
        if (!attending && partnerRow) partnerRow.classList.add('inactive');
        togglePartner();
      }

      function togglePartner() {
        var val = form.querySelector('input[name="plus_one"]:checked');
        var yes = val && val.value === 'yes';
        var attending = form.querySelector('input[name="attending"]:checked');
        var isAttending = attending && attending.value === 'yes';
        if (partnerRow) {
          if (yes && isAttending) { partnerRow.classList.remove('inactive'); }
          else                    { partnerRow.classList.add('inactive'); }
        }
      }

      form.querySelectorAll('input[name="attending"]').forEach(function(r) {
        r.addEventListener('change', toggleConditional);
      });
      form.querySelectorAll('input[name="plus_one"]').forEach(function(r) {
        r.addEventListener('change', togglePartner);
      });
      toggleConditional();

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var data = {};
        new FormData(form).forEach(function(v,k){ data[k]=v; });
        if (!data.name || !data.name.trim()) {
          alert('Please enter your name.');
          return;
        }
        if (!data.attending) {
          alert('Please confirm whether you will attend.');
          return;
        }
        var btn = form.querySelector('.sub');
        if (btn) { btn.disabled = true; btn.style.opacity = '.5'; }
        fetch('https://script.google.com/macros/s/AKfycbwbbRmRH20BHsMFnTGQs4sRahkDaREHoNfljhfRAcgQEBr0WhhBpPVzDBQHZ1WMWy0/exec', {
          method: 'POST',
          mode: 'no-cors',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data)
        }).then(function() {
          form.style.display = 'none';
          document.getElementById('ok').style.display = 'block';
        }).catch(function() {
          if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
          alert('Something went wrong. Please try again.');
        });
      });
    }


    // Women ideas gallery toggle
    var wBtn = document.getElementById('women-ideas-btn');
    var wGal = document.getElementById('women-gallery');
    if (wBtn && wGal) {
      wBtn.addEventListener('click', function() {
        wGal.classList.toggle('open');
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