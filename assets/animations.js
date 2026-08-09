/* =====================================================================
   Freebuff — Animações (scroll reveal, stagger, hero, FAQ, countdown)
   Adicionado por cima do conteúdo existente; não altera textos/layout.
   ===================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('reveal-ready');

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    var sections = document.querySelectorAll('main section, main footer');
    var grids = document.querySelectorAll('.stagger');

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    sections.forEach(function (el) { io.observe(el); });
    grids.forEach(function (el) { io.observe(el); });

    /* Imagens em grades escalonadas: fade-in quando terminam de carregar */
    document.querySelectorAll('.stagger img').forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function () { img.classList.add('loaded'); });
        img.addEventListener('error', function () { img.classList.add('loaded'); });
      }
    });

    /* Hero: título em palavras com entrada escalonada (preserva spans com gradiente) */
    document.querySelectorAll('.hero-title').forEach(function (h) {
      var nodes = Array.prototype.slice.call(h.childNodes);
      var delay = 0;
      h.textContent = '';
      nodes.forEach(function (node) {
        var text = null;
        var cls = '';
        if (node.nodeType === 3) {
          text = node.nodeValue;
        } else if (node.nodeType === 1 && node.tagName.toLowerCase() === 'span') {
          text = node.textContent;
          cls = node.className || '';
        }
        if (text === null) return; /* ignora comentários, etc. */
        text.split(/\s+/).filter(Boolean).forEach(function (w) {
          var s = document.createElement('span');
          s.className = 'hero-word' + (cls ? ' ' + cls : '');
          s.style.setProperty('--d', delay + 'ms');
          s.textContent = w;
          h.appendChild(s);
          h.appendChild(document.createTextNode(' '));
          delay += 90;
        });
      });
    });

    /* FAQ: acordeão — um item aberto por vez, altura animada + seta girando */
    function closeFaq(item) {
      item.classList.remove('faq-open');
      var btn = item.querySelector('button');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      var panel = item.querySelector('.faq-answer');
      if (panel) panel.style.maxHeight = '0px';
    }
    function openFaq(item) {
      item.classList.add('faq-open');
      var btn = item.querySelector('button');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      var panel = item.querySelector('.faq-answer');
      if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
    }
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var btn = item.querySelector('button');
      if (!btn) return;
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var alreadyOpen = item.classList.contains('faq-open');
        document.querySelectorAll('.faq-item.faq-open').forEach(function (other) {
          if (other !== item) closeFaq(other);
        });
        if (alreadyOpen) closeFaq(item); else openFaq(item);
      });
    });

    /* Contador de urgência: números com troca animada */
    var badge = document.querySelector('.countdown');
    if (badge) initCountdown(badge);
  });

  function initCountdown(badge) {
    var digits = [];
    var childNodes = Array.prototype.slice.call(badge.childNodes);

    childNodes.forEach(function (node) {
      if (node.nodeType === 3 && /^\d{2}$/.test(node.nodeValue.trim())) {
        var cell = document.createElement('span');
        cell.className = 'cd-digit';
        var num = document.createElement('span');
        num.className = 'cd-num';
        num.textContent = node.nodeValue;
        cell.appendChild(num);
        node.parentNode.replaceChild(cell, node);
        digits.push({ cell: cell, num: num });
      }
    });
    if (digits.length !== 3) return;

    function total() {
      return (
        parseInt(digits[0].num.textContent, 10) * 3600 +
        parseInt(digits[1].num.textContent, 10) * 60 +
        parseInt(digits[2].num.textContent, 10)
      );
    }
    var start = Math.max(total(), 1);
    var t = start;

    function setDigit(idx, val) {
      var v = String(val);
      if (v.length < 2) v = '0' + v;
      var d = digits[idx];
      if (d.num.textContent === v) return;
      d.num.textContent = v;
      d.cell.classList.remove('flip');
      void d.cell.offsetWidth; /* reinicia a animação */
      d.cell.classList.add('flip');
    }

    setInterval(function () {
      t = t - 1;
      if (t < 0) t = start;
      setDigit(0, Math.floor(t / 3600));
      setDigit(1, Math.floor((t % 3600) / 60));
      setDigit(2, t % 60);
    }, 1000);
  }
})();
