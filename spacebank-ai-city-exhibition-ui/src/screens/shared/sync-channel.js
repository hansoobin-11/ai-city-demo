/**
 * 여러 화면 창 사이의 일괄재생(동기 재생) — 로컬 개발용 임시 동기화.
 *
 * AGENTS.md 불변 조건: "TOP, LEFT, CENTER, RIGHT는 하나의 공통 시간축을 사용한다."
 * 통합 라우터(checkpoint 4, src/router/)가 만들어지면 라우터가 각 창에 직접
 * play/pause/replay 신호를 보내 이 역할을 맡는다. 그 전까지, 화면들을 각각
 * 브라우저 탭으로 열어두고도 타이밍을 맞춰 확인할 수 있도록 BroadcastChannel로
 * 같은 역할을 임시로 흉내낸다.
 *
 * 주의: BroadcastChannel은 같은 origin 안에서만 통한다. 정적 서버
 * (http://localhost:4173 등)로 열었을 때는 4개 화면이 같은 origin이라 동작하지만,
 * file:// 로 각각 열면 문서마다 origin이 달라 서로 통하지 않는다 — 그 경우 화면별
 * 재생 버튼/스페이스바/클릭은 각자 로컬로만 동작한다(동기화 없이).
 */
(function (global) {
  'use strict';

  function createSync(clock, channelName) {
    channelName = channelName || 'aicity-timeline-sync';
    var supported = typeof BroadcastChannel === 'function';
    var channel = supported ? new BroadcastChannel(channelName) : null;

    if (channel) {
      channel.onmessage = function (ev) {
        var msg = ev.data || {};
        // 여기서는 clock을 직접 조작한다(아래 반환 객체의 play/pause/...를 부르면
        // 다시 방송하게 되어 순환하므로 반드시 clock 원본 메서드를 써야 한다).
        if (msg.cmd === 'play') clock.play(msg.epoch);
        else if (msg.cmd === 'pause') clock.pause();
        else if (msg.cmd === 'replay') clock.replay(msg.epoch);
        else if (msg.cmd === 'jump') clock.jump(msg.idx);
        else if (msg.cmd === 'step') clock.step(msg.delta);
      };
    }

    function broadcast(msg) {
      if (channel) channel.postMessage(msg);
    }

    return {
      supported: supported,
      play: function () { var epoch = clock.play(); broadcast({ cmd: 'play', epoch: epoch }); },
      pause: function () { clock.pause(); broadcast({ cmd: 'pause' }); },
      replay: function () { var epoch = clock.replay(); broadcast({ cmd: 'replay', epoch: epoch }); },
      jump: function (i) { clock.jump(i); broadcast({ cmd: 'jump', idx: i }); },
      step: function (d) { clock.step(d); broadcast({ cmd: 'step', delta: d }); },
      close: function () { if (channel) channel.close(); }
    };
  }

  global.AICitySync = { create: createSync };
})(window);
