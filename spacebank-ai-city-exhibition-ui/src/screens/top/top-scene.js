/**
 * SPACEBANK AI CITY 전시 UI — TOP 화면 전용 렌더러
 * 데이터 출처: docs/baseline-scene-timeline.md 1·6절 (원본 topDc.html 포팅).
 * TOP은 하단 3면과 공유하는 부분이 없어 shared/에 넣지 않았다.
 */
(function (global) {
  'use strict';

  var DOMAIN_COPY = {
    hc: { en: 'AI HUMAN CARE', ko: '사람의 건강과 돌봄을 도시 운영의 관점에서 살펴봅니다.' },
    sf: { en: 'AI SAFETY', ko: '건물과 시설의 안전 상태를 지속적으로 관측합니다.' },
    inf: { en: 'AI INFRASTRUCTURE', ko: '도시의 핵심 시설과 자원을 지능형으로 관측합니다.' },
    rb: { en: 'AI ROBOTICS', ko: '현장의 로봇 운영을 하나의 관점에서 확인합니다.' },
    rd: { en: 'AI SMART ROAD', ko: '겨울 도로의 상태를 도로 인프라 관점에서 관리합니다.' }
  };
  var STORY_COPY = {
    a01: { h: ['AI가 도시를 보고,', '이해하고, 움직입니다.'], hs: 104,
      support: '도시 운영 현장에서 축적한 AI 관제 솔루션과 구축 사례를 하나의 AI CITY 테마로 소개합니다.' },
    a02: { h: ['사람의 건강부터 도시 안전, 핵심시설,', '로봇, 도로 인프라까지'], hs: 92,
      support: '각 영역에서 발생하는 서로 다른 데이터가 연결되어 하나의 AI CITY를 완성합니다.' },
    a03: { h: ['도시 운영의 신호를', '하나의 관점으로'], hs: 104,
      support: '데이터가 판단하고, 로봇이 실행하며, 결과가 다시 데이터가 되는 도시' }
  };
  var ORDER = ['hc', 'sf', 'inf', 'rb', 'rd'];
  var NO_CHROME = ['a02', 'a03', 'outro'];
  var FADE_MS = 300; // 장면 전환 시 카피 교체 크로스디졸브 (원본 componentDidUpdate와 동일)

  function clamp01(x) { return Math.max(0, Math.min(1, x)); }

  function el(tag, style) {
    var e = document.createElement(tag);
    if (style) e.style.cssText = style;
    return e;
  }

  function mount(root, assetsBase) {
    root.style.cssText = 'position:relative;width:1920px;height:1080px;overflow:hidden;background:#05080F;font-family:"Pretendard Variable",Pretendard,system-ui,sans-serif';

    var photoBg = el('img', 'position:absolute;top:0;left:0;width:1920px;height:1081px;filter:brightness(0.92) saturate(1.02) contrast(1.02)');
    photoBg.src = assetsBase + 'images/top-bg.jpg'; photoBg.alt = '';
    var photoTint = el('div', 'position:absolute;inset:0;background:rgba(120,160,255,0.06)');
    var photoGradH = el('div', 'position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,8,15,0.94) 0%,rgba(5,8,15,0.8) 42%,rgba(5,8,15,0.38) 100%)');
    var photoGradV = el('div', 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,8,15,0.62) 0%,rgba(5,8,15,0.24) 40%,rgba(5,8,15,0.8) 100%)');
    root.appendChild(photoBg); root.appendChild(photoTint); root.appendChild(photoGradH); root.appendChild(photoGradV);

    var navyBase = el('div', 'position:absolute;inset:0;background:radial-gradient(118% 92% at 18% 34%,#0D1524 0%,#070B14 52%,#05080F 100%);display:none');
    var navyAccent = el('div', 'position:absolute;inset:0;background:radial-gradient(42% 60% at 84% 76%,rgba(230,79,61,0.14) 0%,rgba(230,79,61,0) 100%);display:none');
    root.appendChild(navyBase); root.appendChild(navyAccent);

    var cityWrap = el('div', 'position:absolute;inset:0');
    var imgA = el('img', 'position:absolute;inset:0;width:1920px;height:1080px;object-fit:cover'); imgA.alt = '';
    var imgB = el('img', 'position:absolute;inset:0;width:1920px;height:1080px;object-fit:cover'); imgB.alt = '';
    var dawnG = el('div', 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(174,202,226,0.40) 0%,rgba(132,165,202,0.17) 48%,rgba(98,132,176,0.05) 100%)');
    var sunsetG = el('div', 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(128,157,205,0.22) 0%,rgba(82,112,165,0.13) 48%,rgba(9,20,40,0.14) 100%)');
    var nightG = el('div', 'position:absolute;inset:0;background:rgba(120,160,255,0.09)');
    var gradeV = el('div', 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,8,15,0.5) 0%,rgba(5,8,15,0.12) 26%,rgba(5,8,15,0.18) 58%,rgba(5,8,15,0.72) 100%)');
    var vignette = el('div', 'position:absolute;inset:0;background:radial-gradient(82% 130% at 50% 50%,rgba(5,8,15,0) 52%,rgba(5,8,15,0.55) 100%)');
    cityWrap.appendChild(imgA); cityWrap.appendChild(imgB); cityWrap.appendChild(dawnG); cityWrap.appendChild(sunsetG); cityWrap.appendChild(nightG); cityWrap.appendChild(gradeV); cityWrap.appendChild(vignette);
    root.appendChild(cityWrap);

    var outroShade = el('div', 'position:absolute;inset:0;pointer-events:none;background:radial-gradient(78% 100% at 50% 100%,rgba(230,79,61,0.10) 0%,rgba(5,8,15,0.18) 42%,rgba(5,8,15,0.64) 100%),rgba(5,8,15,0.24)');
    root.appendChild(outroShade);

    // 좌측 크롬(로고 + 타이틀 + 카피)
    var chrome = el('div', 'position:absolute;left:160px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;max-width:1600px');
    var logo = el('img', 'width:159px;height:64px;display:block'); logo.src = assetsBase + 'images/top-logo.png'; logo.alt = '스페이스뱅크';
    var brandRow = el('div', 'margin-top:38px;display:flex;align-items:center;gap:16px');
    brandRow.innerHTML = '<span style="width:44px;height:3px;background:#E64F3D;display:inline-block"></span><span style="font-size:26px;font-weight:800;letter-spacing:0.2em;color:#F0846F;white-space:nowrap">SPACEBANK AI CITY</span>';
    var textBlock = el('div', 'margin-top:30px;transition:opacity 300ms ease;display:flex;flex-direction:column;align-items:flex-start');
    chrome.appendChild(logo); chrome.appendChild(brandRow); chrome.appendChild(textBlock);
    root.appendChild(chrome);

    // 도메인 헤드라인 (hc/sf/inf/rb/rd)
    var domainBlock = el('div');
    var domainEn = el('div', 'font-size:112px;font-weight:800;letter-spacing:0.01em;line-height:1.08;color:#fff;white-space:nowrap');
    var domainKo = el('div', 'margin-top:30px;font-size:38px;font-weight:600;line-height:1.5;color:rgba(255,255,255,0.9);max-width:1400px');
    domainBlock.appendChild(domainEn); domainBlock.appendChild(domainKo);

    // 스토리 헤드라인 (a01/loop)
    var storyBlock = el('div', 'display:flex;flex-direction:column;align-items:flex-start;gap:5px;font-weight:850;letter-spacing:-0.045em;line-height:1.08;text-shadow:0 4px 32px rgba(5,8,15,0.96)');
    var line0 = el('span', 'display:inline-block;color:#F0846F');
    var line1 = el('span', 'display:inline-block;color:#fff;margin-left:22px');
    var line2 = el('span', 'display:inline-block;color:#fff');
    var line3 = el('span', 'display:inline-block;color:#F0846F;margin-left:24px');
    var storyRow0 = el('div', 'display:flex;align-items:baseline;gap:22px'); storyRow0.appendChild(line0); storyRow0.appendChild(line1);
    var storyRow1 = el('div', 'display:flex;align-items:baseline;gap:24px;margin-top:2px'); storyRow1.appendChild(line2); storyRow1.appendChild(line3);
    var storyMeta = el('div', 'margin-top:34px;font-size:27px;font-weight:700;letter-spacing:0.07em;color:#fff;white-space:nowrap;text-shadow:0 2px 16px rgba(5,8,15,0.9)');
    storyMeta.textContent = 'AI HUMAN CARE · AI SAFETY · AI INFRASTRUCTURE · AI ROBOTICS · AI SMART ROAD';
    var storySupport = el('div', 'margin-top:20px;font-size:28px;font-weight:500;line-height:1.6;color:rgba(255,255,255,0.88);max-width:1400px;text-shadow:0 2px 16px rgba(5,8,15,0.85)');
    storyBlock.appendChild(storyRow0); storyBlock.appendChild(storyRow1); storyBlock.appendChild(storyMeta); storyBlock.appendChild(storySupport);

    // 우측 신호 레일 (5개)
    var rail = el('div', 'position:absolute;right:120px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:18px;transition:opacity 300ms ease');
    var railItems = ORDER.map(function (k) {
      var item = el('div', 'display:flex;align-items:center;justify-content:flex-end;gap:14px');
      var label = el('span', 'font-size:22px;font-weight:700;letter-spacing:0.14em;white-space:nowrap');
      var dot = el('span', 'width:10px;height:10px;border-radius:50%;flex:0 0 auto;display:inline-block');
      label.textContent = DOMAIN_COPY[k].en;
      item.appendChild(label); item.appendChild(dot);
      rail.appendChild(item);
      return { label: label, dot: dot };
    });
    root.appendChild(rail);

    // A02 카피 (중앙, 5개 신호 문구)
    var a02Wrap = el('div', 'position:absolute;inset:0;display:none;align-items:center;justify-content:center;text-align:center');
    var A02_LINES = ['사람의 건강부터', '도시 안전,', '핵심시설,', '로봇,', '도로 인프라까지'];
    var a02Inner = el('div', 'width:1680px;display:flex;flex-direction:column;align-items:center;gap:26px');
    var a02Row0 = el('div', 'display:flex;align-items:flex-start;justify-content:center;gap:30px');
    var a02Row1 = el('div', 'display:flex;align-items:flex-start;justify-content:center;gap:36px');
    var a02SignalEls = A02_LINES.map(function (text, i) {
      var span = el('span', 'font-size:66px;font-weight:800;letter-spacing:-0.035em;line-height:1.08;color:#fff;white-space:nowrap;text-shadow:0 3px 28px rgba(5,8,15,0.98)');
      span.textContent = text;
      var wrap = el('div', 'display:flex;flex-direction:column;align-items:center;gap:11px;transition:opacity 150ms ease-out,transform 180ms ease-out');
      wrap.appendChild(span);
      (i < 3 ? a02Row0 : a02Row1).appendChild(wrap);
      return wrap;
    });
    var a02Support = el('div', 'margin-top:8px;font-size:31px;font-weight:500;line-height:1.55;letter-spacing:-0.01em;text-shadow:0 2px 20px rgba(5,8,15,0.98);transition:opacity 320ms ease,transform 320ms ease');
    a02Support.innerHTML = '<span style="color:rgba(255,255,255,0.92)">각 영역에서 발생하는 서로 다른 데이터가 연결되어 </span><span style="color:#F0846F;font-weight:750">하나의 AI CITY를 완성합니다.</span>';
    a02Inner.appendChild(a02Row0); a02Inner.appendChild(a02Row1); a02Inner.appendChild(a02Support);
    a02Wrap.appendChild(a02Inner);
    root.appendChild(a02Wrap);

    // A03 카피 (중앙, 수렴 문구)
    var a03Wrap = el('div', 'position:absolute;inset:0;display:none;align-items:center;justify-content:center;text-align:center');
    a03Wrap.innerHTML =
      '<div style="width:1680px;display:flex;flex-direction:column;align-items:center">' +
      '<div style="display:flex;align-items:baseline;justify-content:center;gap:22px;font-size:72px;font-weight:760;line-height:1.1;color:rgba(255,255,255,0.92);text-shadow:0 3px 30px rgba(5,8,15,0.98)">' +
      '<span style="animation:a03SignalLeft 620ms cubic-bezier(.22,.75,.2,1) both">도시 운영의</span>' +
      '<span style="animation:a03SignalRight 620ms cubic-bezier(.22,.75,.2,1) both;color:#fff;font-weight:850">신호를</span></div>' +
      '<div style="margin-top:22px;font-size:112px;font-weight:900;line-height:1.05;color:#fff;text-shadow:0 4px 34px rgba(5,8,15,0.98);animation:a03FocusIn 720ms 180ms cubic-bezier(.2,.8,.2,1) both">하나의 <span style="color:#F0846F">관점으로</span></div>' +
      '<div style="margin-top:44px;display:flex;align-items:center;justify-content:center;gap:18px;font-size:29px;font-weight:540;letter-spacing:-0.01em;text-shadow:0 2px 20px rgba(5,8,15,0.98);animation:a03SupportIn 520ms 620ms ease-out both">' +
      '<span style="color:rgba(255,255,255,0.9)">데이터가 판단하고</span>' +
      '<span style="width:7px;height:7px;border-radius:50%;background:#E64F3D;box-shadow:0 0 14px rgba(230,79,61,0.7)"></span>' +
      '<span style="color:rgba(255,255,255,0.9)">로봇이 실행하며</span>' +
      '<span style="width:7px;height:7px;border-radius:50%;background:#E64F3D;box-shadow:0 0 14px rgba(230,79,61,0.7)"></span>' +
      '<span style="color:#F0846F;font-weight:720">결과가 다시 데이터가 되는 도시</span></div></div>';
    root.appendChild(a03Wrap);

    // TOP 전용 keyframes (city-scene.js 쪽과 이름이 겹치지 않게 a03* 접두어 유지)
    var style = document.createElement('style');
    style.textContent =
      '@keyframes a03SignalLeft{0%{opacity:0;transform:translateX(-88px)}100%{opacity:1;transform:translateX(0)}}' +
      '@keyframes a03SignalRight{0%{opacity:0;transform:translateX(88px)}100%{opacity:1;transform:translateX(0)}}' +
      '@keyframes a03FocusIn{0%{opacity:0;transform:translateY(30px);letter-spacing:0.13em}100%{opacity:1;transform:translateY(0);letter-spacing:-0.035em}}' +
      '@keyframes a03SupportIn{0%{opacity:0;transform:translateY(18px)}100%{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(style);

    // --- 내부 상태: 300ms 카피 크로스디졸브 (원본 componentDidUpdate 포팅) ---
    var shown = null; // 현재 표시 중인 scene id
    var pendingScene = null; // shown으로 향해 페이드가 걸려 있는 목표 scene id
    var fadeOpacity = 1;
    var fadeTimer = null;
    var bgMode = 'photo';
    var lastFrame = null;

    function applyShownContent(scene) {
      textBlock.innerHTML = '';
      var domain = DOMAIN_COPY[scene];
      if (domain) {
        domainEn.textContent = domain.en;
        domainKo.textContent = domain.ko;
        textBlock.appendChild(domainBlock);
      } else {
        var story = STORY_COPY[scene] || STORY_COPY.a01;
        // 원본은 각 줄을 색이 다른 두 조각으로 나눠 표시한다("AI가" / "도시를 보고," 등).
        // 여기서는 STORY_COPY의 줄 단위 문구를 그대로 한 조각으로 표기해 단순화했다
        // (정확한 조각 분할은 이후 픽셀 비교 단계에서 다듬는다 — BASELINE.md "타이밍
        // 세부 조정" 범위).
        line0.textContent = story.h[0]; line1.textContent = '';
        line2.textContent = story.h[1]; line3.textContent = '';
        storyRow0.style.fontSize = story.hs + 'px';
        storyRow1.style.fontSize = story.hs + 'px';
        storySupport.textContent = story.support || '';
        textBlock.appendChild(storyBlock);
      }
    }

    function update(frame) {
      lastFrame = frame;
      var scene = frame.topScene;
      if (shown === null) {
        shown = scene; pendingScene = scene; applyShownContent(shown);
      } else if (scene !== shown && scene !== pendingScene) {
        // pendingScene 체크가 핵심이다 — 재생 중에는 이 update()가 초당 60번 정도
        // 호출되는데, scene이 이미 바뀐 채로 몇 프레임이고 유지되는 동안(=다음
        // 장면이 오기 전까지) 매 프레임 "shown !== scene"이 계속 참이 된다. 이걸
        // 그대로 조건으로 쓰면 프레임이 올 때마다 타이머를 취소하고 다시 걸게 되어
        // (300ms보다 프레임 간격이 훨씬 짧으므로) 타이머가 영원히 완주하지 못하고
        // 카피가 계속 투명한 채로 남는다 — 실제로 이 버그가 있었다. pendingScene은
        // "이미 이 목표로 페이드를 걸어놨다"는 표시라 같은 목표에 대해서는 한 번만
        // 타이머를 건다.
        pendingScene = scene;
        var skipFade = (shown === 'a02' && scene === 'a03');
        if (skipFade) {
          shown = scene; pendingScene = scene; fadeOpacity = 1; applyShownContent(shown);
        } else {
          fadeOpacity = 0;
          clearTimeout(fadeTimer);
          // 타이머 만료 시점에는 새 타임라인 프레임이 오지 않을 수도 있다(수동 점프
          // 직후 등). shown/fadeOpacity만 바꾸고 끝내면 화면이 갱신되지 않으므로,
          // 마지막으로 받은 프레임을 그대로 다시 흘려보내 강제로 다시 그린다.
          fadeTimer = setTimeout((function (target) {
            return function () {
              shown = target; pendingScene = target; fadeOpacity = 1; applyShownContent(shown); update(lastFrame);
            };
          })(scene), FADE_MS);
        }
      }

      var cityFade = Math.max(0, Math.min(1, frame.cityFade || 0));
      var dayPhase = clamp01(frame.dayPhase == null ? 1 : frame.dayPhase);
      var topDawn = Math.max(0, 1 - dayPhase * 1.55);
      var topSunset = Math.sin(Math.PI * dayPhase) * 0.48;

      photoBg.style.display = bgMode === 'photo' ? '' : 'none';
      photoTint.style.display = bgMode === 'photo' ? '' : 'none';
      photoGradH.style.display = bgMode === 'photo' ? '' : 'none';
      photoGradV.style.display = bgMode === 'photo' ? '' : 'none';
      navyBase.style.display = bgMode === 'navy' ? '' : 'none';
      navyAccent.style.display = bgMode === 'navy' ? '' : 'none';

      var hasCity = cityFade > 0.001;
      cityWrap.style.display = hasCity ? '' : 'none';
      if (hasCity) {
        cityWrap.style.opacity = cityFade;
        var zoom = scene === 'a01' ? (1 + Math.max(0, (frame.camScale || 1) - 1) * 0.38) : 1;
        cityWrap.style.transform = 'scale(' + zoom + ')';
        cityWrap.style.transformOrigin = '50% 54%';
        var src = assetsBase + 'images/top-city.png';
        imgA.src = src; imgB.src = src;
        imgB.style.opacity = frame.imgMix || 0;
        var b = 'brightness(' + (0.94 - dayPhase * 0.16).toFixed(3) + ') saturate(' + (0.62 + dayPhase * 0.26).toFixed(3) + ') contrast(1.05)';
        imgA.style.filter = b; imgB.style.filter = b;
        dawnG.style.opacity = topDawn.toFixed(3);
        sunsetG.style.opacity = topSunset.toFixed(3);
        nightG.style.opacity = (0.25 + dayPhase * 0.75).toFixed(3);
      }

      outroShade.style.opacity = Math.max(0, Math.min(1, frame.logoOpacity || 0));

      var showChrome = NO_CHROME.indexOf(scene) === -1;
      chrome.style.display = showChrome ? 'flex' : 'none';
      chrome.style.opacity = fadeOpacity;
      rail.style.opacity = DOMAIN_COPY[shown] ? fadeOpacity * (1 - cityFade) : 0;

      var domain = DOMAIN_COPY[shown];
      domainBlock.style.display = domain ? '' : 'none';
      storyBlock.style.display = domain ? 'none' : '';
      if (domain) { domainEn.textContent = domain.en; domainKo.textContent = domain.ko; }

      railItems.forEach(function (item, i) {
        var k = ORDER[i];
        var active = k === shown;
        item.label.style.color = active ? '#fff' : 'rgba(255,255,255,0.34)';
        item.dot.style.background = active ? '#E64F3D' : 'rgba(255,255,255,0.22)';
      });

      var showA02 = scene === 'a02';
      var showA03 = scene === 'a03';
      a02Wrap.style.display = showA02 ? 'flex' : 'none';
      a03Wrap.style.display = showA03 ? 'flex' : 'none';
      a02Wrap.style.opacity = fadeOpacity;
      a03Wrap.style.opacity = fadeOpacity;

      if (showA02) {
        var strengths = frame.strengths || [0, 0, 0, 0, 0];
        a02SignalEls.forEach(function (wrap, i) {
          var lvl = Math.max(0, Math.min(1, strengths[i] || 0));
          wrap.style.opacity = lvl.toFixed(3);
          wrap.style.transform = 'translateY(' + ((1 - lvl) * 10).toFixed(1) + 'px)';
        });
        var lastLvl = Math.max(0, Math.min(1, (strengths[4] || 0)));
        a02Support.style.opacity = lastLvl.toFixed(3);
        a02Support.style.transform = 'translateY(' + ((1 - lastLvl) * 18).toFixed(1) + 'px)';
      }
    }

    update.setBgMode = function (mode) { bgMode = mode; };
    update.getBgMode = function () { return bgMode; };
    return update;
  }

  global.AICityTopScene = { mount: mount, DOMAIN_COPY: DOMAIN_COPY, STORY_COPY: STORY_COPY, ORDER: ORDER };
})(window);
