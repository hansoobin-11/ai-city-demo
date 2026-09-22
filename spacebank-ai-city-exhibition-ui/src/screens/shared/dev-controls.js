/**
 * 개발용 재생 컨트롤 — 전시 최종 화면에는 나오지 않는다.
 *
 * 통합 라우터(checkpoint 4, src/router/)가 만들어지기 전까지, 화면 파일을
 * 단독으로 열어 타임라인이 맞게 도는지 확인하기 위한 임시 도구다.
 *
 * 자동재생은 하지 않는다 — 라우터가 생기면 어차피 재생 시작은 라우터가 각
 * 창에 보내는 신호로 맞춰야 하므로, 화면이 스스로 알아서 재생을 시작하지
 * 않고 "신호를 기다리는" 상태가 기본이어야 한다. 로컬 확인 중에는 그 신호를
 * 스페이스바나 화면 클릭으로 대신한다. 점프 버튼 등 세부 컨트롤 바는 기본
 * 숨김이며 'd' 키를 누르거나 URL에 ?dev=1을 붙이면 나타난다.
 */
(function (global) {
  'use strict';

  function mountDevControls(clock, opts) {
    opts = opts || {};
    var CP = global.AICityTimeline.CHECKPOINTS;
    var visible = /[?&]dev=1\b/.test(location.search);
    var playing = false;
    // controls: 사용자가 누른 버튼/스페이스바/클릭이 실제로 호출할 대상.
    // opts.controls로 sync-channel.js의 래퍼를 넘기면 다른 창에도 방송되고,
    // 넘기지 않으면 이 창의 clock만 움직인다(재생 상태 표시는 항상 clock 기준).
    var controls = opts.controls || clock;

    var bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;display:' + (visible ? 'flex' : 'none') +
      ';flex-direction:column;gap:6px;padding:8px 10px;background:rgba(5,8,15,0.88);' +
      'border-top:1px solid rgba(255,255,255,0.15);font:12px/1.4 ui-monospace,Menlo,monospace;color:#fff';

    var row1 = document.createElement('div');
    row1.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap';
    CP.forEach(function (cp, i) {
      var b = document.createElement('button');
      b.textContent = cp.id;
      b.title = cp.label;
      b.style.cssText = 'padding:4px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.06);color:#fff;cursor:pointer;font:inherit';
      b.onclick = function () { controls.jump(i); };
      row1.appendChild(b);
    });

    var row2 = document.createElement('div');
    row2.style.cssText = 'display:flex;gap:6px;align-items:center';
    function mkBtn(label, fn) {
      var b = document.createElement('button');
      b.textContent = label;
      b.style.cssText = 'padding:4px 10px;border-radius:4px;border:1px solid rgba(230,79,61,0.5);background:rgba(230,79,61,0.15);color:#fff;cursor:pointer;font:inherit';
      b.onclick = fn;
      return b;
    }
    var status = document.createElement('span');
    status.style.cssText = 'margin-left:8px;opacity:0.8';

    row2.appendChild(mkBtn('◀', function () { controls.step(-1); }));
    row2.appendChild(mkBtn('▶ Play', function () { controls.play(); }));
    row2.appendChild(mkBtn('⏸ Pause', function () { controls.pause(); }));
    row2.appendChild(mkBtn('↻ Replay', function () { controls.replay(); }));
    row2.appendChild(mkBtn('▶▶', function () { controls.step(1); }));
    row2.appendChild(status);
    if (opts.controls) {
      var syncTag = document.createElement('span');
      syncTag.style.cssText = 'margin-left:8px;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,0.1)';
      syncTag.textContent = opts.controls.supported ? 'SYNC' : 'SYNC 불가(BroadcastChannel 없음)';
      row2.appendChild(syncTag);
    }

    bar.appendChild(row1);
    bar.appendChild(row2);
    document.body.appendChild(bar);

    // 재생 시작 전 안내 힌트 — 라우터 신호를 아직 못 받은(=로컬에서 직접 열어본)
    // 상태임을 알려준다. 재생 중에는 숨긴다.
    var hint = document.createElement('div');
    hint.textContent = '스페이스바 또는 화면 클릭으로 재생';
    hint.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9998;' +
      'padding:14px 22px;border-radius:10px;background:rgba(5,8,15,0.72);border:1px solid rgba(255,255,255,0.25);' +
      'color:#fff;font:600 15px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif;letter-spacing:0.02em;pointer-events:none';
    document.body.appendChild(hint);

    function togglePlay() {
      if (playing) controls.pause(); else controls.play();
    }

    window.addEventListener('keydown', function (e) {
      if (e.key === 'd' || e.key === 'D') {
        bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
        return;
      }
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault(); // 스크롤 방지
        togglePlay();
      }
    });

    // 개발 컨트롤 바 자체를 클릭했을 때는 각 버튼이 알아서 처리하므로,
    // 그 바깥(화면 어디든)을 클릭했을 때만 재생/일시정지를 토글한다.
    document.addEventListener('click', function (e) {
      if (bar.contains(e.target)) return;
      togglePlay();
    });

    clock.subscribe(function (frame, meta) {
      playing = meta.playing;
      hint.style.display = playing ? 'none' : '';
      status.textContent = (meta.playing ? 'PLAYING' : (meta.manual ? 'CHECKPOINT' : 'PAUSED')) +
        ' · ' + meta.checkpoint.id.toUpperCase() +
        ' · ' + Math.round(meta.t) + '/' + meta.totalMs + 'ms';
    });

    if (opts.autoplay) controls.play();

    return bar;
  }

  global.AICityDevControls = { mount: mountDevControls };
})(window);
