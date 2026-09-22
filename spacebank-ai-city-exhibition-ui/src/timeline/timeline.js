/**
 * SPACEBANK AI CITY 전시 UI — 공통 시간축 모듈
 *
 * 화면 렌더러(src/screens/*)와 완전히 분리된 순수 로직이다. DOM을 건드리지 않고,
 * 시간(ms) → 화면이 그려야 할 값(frame)만 계산한다. 네트워크·번들러 없이 단독
 * <script> 태그로 로드되도록 ES module이 아닌 IIFE로 작성했다(전시 오프라인 실행
 * 환경에서 file:// 로 열었을 때 module import의 CORS 제약을 피하기 위함).
 *
 * 데이터 출처: docs/baseline-scene-timeline.md (2·3·4·5절).
 * 기준본 reference/baseline의 마스터 타임라인(CP 배열, atTime/blend)을 그대로
 * 이식했다 — 값 자체는 기준본이 "검토용 임시값"이라고 명시한 것이므로, 이후
 * 이해관계자가 확정하기 전까지 임의로 조정하지 않는다.
 */
(function (global) {
  'use strict';

  // ---- 이징 유틸 ----------------------------------------------------------
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function ease(x) { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function easeOut(x) { x = clamp01(x); return 1 - Math.pow(1 - x, 3); }
  function easeIn(x) { x = clamp01(x); return x * x; }
  function smooth(x) { x = clamp01(x); return x * x * (3 - 2 * x); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpArr(a, b, t) { return a.map(function (v, i) { return lerp(v, b[i], t); }); }

  // ---- 체크포인트 정의 (docs/baseline-scene-timeline.md 2절) ---------------
  // travel: 이전 체크포인트에서 이동해오는 전환 구간(ms), hold: 도착 후 정지 구간(ms)
  // 2026-09-21 전시 화면 검토 반영: HC~RD 상세 hold는 타이포와 기능을 읽을 수 있도록
  // 기준본의 임시값 2200ms에서 5500ms로 늘렸다. 그 외 장면 시간은 유지한다.
  var CHECKPOINTS = [
    { id: 'a01', label: 'A01 도시 등장', top: 'a01', s: 1, fx: 2880, fy: 1040, host: -1, detailKey: '', detail: 0,
      strengths: [0, 0, 0, 0, 0], accents: [0, 0, 0, 0, 0], dim: 0, hub: 0, travel: 2800, hold: 2800 },
    { id: 'hc', label: 'A02-H 휴먼케어', top: 'hc', s: 2.3, fx: 700, fy: 720, host: 0, detailKey: 'hc', detail: 1,
      strengths: [1, 0, 0, 0, 0], accents: [1, 0, 0, 0, 0], dim: 0, hub: 0, travel: 3000, hold: 5500 },
    { id: 'sf', label: 'A02-S 세이프티', top: 'sf', s: 2.3, fx: 3000, fy: 780, host: 1, detailKey: 'sf', detail: 1,
      strengths: [0, 1, 0, 0, 0], accents: [0, 1, 0, 0, 0], dim: 0, hub: 0, travel: 3000, hold: 5500 },
    { id: 'inf', label: 'A02-I 인프라', top: 'inf', s: 2.3, fx: 4700, fy: 800, host: 2, detailKey: 'inf', detail: 1,
      strengths: [0, 0, 1, 0, 0], accents: [0, 0, 1, 0, 0], dim: 0, hub: 0, travel: 3000, hold: 5500 },
    { id: 'rb', label: 'A02-R 로보틱스', top: 'rb', s: 2.3, fx: 4850, fy: 1330, host: 2, detailKey: 'rb', detail: 1,
      strengths: [0, 0, 0, 1, 0], accents: [0, 0, 0, 1, 0], dim: 0, hub: 0, travel: 3000, hold: 5500 },
    { id: 'rd', label: 'A02-RD 스마트로드', top: 'rd', s: 2.3, fx: 1750, fy: 1400, host: 0, detailKey: 'rd', detail: 1,
      strengths: [0, 0, 0, 0, 1], accents: [0, 0, 0, 0, 1], dim: 0, hub: 0, travel: 3000, hold: 5500 },
    { id: 'a02', label: 'A02 5개 신호 완성', top: 'a02', s: 1, fx: 2880, fy: 1040, host: -1, detailKey: '', detail: 0,
      strengths: [1, 1, 1, 1, 1], accents: [1, 1, 1, 1, 1], dim: 0, hub: 0, copy: 'a02', travel: 2200, hold: 3000,
      imgEnter: 1, img: 2 },
    { id: 'a03', label: 'A03 중앙 연결', top: 'a03', s: 1.05, fx: 2880, fy: 1030, host: -1, detailKey: '', detail: 0,
      strengths: [0.25, 0.25, 0.25, 0.25, 0.25], accents: [0, 0, 0, 0, 0], dim: 0.28, hub: 1, copy: 'a03', travel: 3000, hold: 3000,
      imgEnter: 3, img: 4, holdFadeAt: 800, holdFadeDur: 1000 },
    { id: 'outro', label: 'OUTRO 브랜드', top: 'outro', s: 1, fx: 2880, fy: 1040, host: -1, detailKey: '', detail: 0,
      strengths: [0, 0, 0, 0, 0], accents: [0, 0, 0, 0, 0], dim: 0.58, hub: 0, copy: '', travel: 1100, hold: 2800,
      imgEnter: 4, img: 4, logo: 1 },
    { id: 'loop', label: 'LOOP 인트로 복귀', top: 'a01', s: 1.34, fx: 2880, fy: 1080, host: -1, detailKey: '', detail: 0,
      strengths: [0, 0, 0, 0, 0], accents: [0, 0, 0, 0, 0], dim: 0, hub: 0, copy: '', travel: 1600, hold: 250,
      imgEnter: 4, img: 4, cityFade: 1, dayPhase: 0 }
  ];

  var TOTAL_MS = CHECKPOINTS.reduce(function (acc, c) { return acc + c.travel + c.hold; }, 0);

  // 랜드마크↔랜드마크 3단 아크 무빙 (docs 3절)
  var MID_SCALE = 1.15, PH_OUT = 0.28, PH_PAN = 0.70, Q_OUT = 0.12, Q_PAN = 0.88;
  // 디테일 크로스페이드 타이밍(ms, hold 경계 기준)
  var FADE_LEAD = 150, FADE_IN = 500, FADE_OUT = 450, FOCUS_MS = 200;

  function targetPxOf(cp) { return cp.host >= 0 ? cp.host * 1920 + 960 : 2880; }

  function frameFor(cp) {
    return {
      topScene: cp.top,
      camScale: cp.s, camFx: cp.fx, camFy: cp.fy, camTargetPx: targetPxOf(cp),
      strengths: cp.strengths.slice(), accents: cp.accents.slice(),
      detailKey: cp.detailKey, detailHost: cp.host, detailOpacity: cp.detail,
      detailScale: 1, detailBlur: 0,
      dim: cp.dim, hubProgress: cp.hub,
      copyScene: cp.copy || '', copyOpacity: cp.copy ? 1 : 0,
      imgA: cp.img || 0, imgB: cp.img || 0, imgMix: 0,
      cityFade: cp.cityFade != null ? cp.cityFade : (cp.img ? 1 : 0),
      logoOpacity: cp.logo ? 1 : 0, dayPhase: cp.dayPhase != null ? cp.dayPhase : 1
    };
  }

  // TOP 이미지 시퀀스: 이동 구간에서 이전 정착 이미지 → 다음 진입 이미지
  function travelImages(from, to, p) {
    var a = from.img || 0, b = to.imgEnter || to.img || 0;
    if (!a && !b) return { imgA: 0, imgB: 0, imgMix: 0, cityFade: 0 };
    if (!a) return { imgA: b, imgB: b, imgMix: 0, cityFade: ease((p - 0.25) / 0.5) };
    if (!b) return { imgA: a, imgB: a, imgMix: 0, cityFade: 1 - ease(p / 0.5) };
    if (a === b) return { imgA: a, imgB: a, imgMix: 0, cityFade: 1 };
    return { imgA: a, imgB: b, imgMix: ease((p - 0.4) / 0.35), cityFade: 1 };
  }

  function blend(from, to, p, cameraOn) {
    var converge = from.id === 'a02' && to.id === 'a03';
    var prepareRelight = from.id === 'rd' && to.id === 'a02';
    var looping = from.id === 'outro' && to.id === 'loop';
    if (!cameraOn && !converge && !prepareRelight) return frameFor(p < 0.5 ? from : to);
    var flow = converge ? ease((p - 0.08) / 0.92) : 0;
    var arc = from.s >= 2 && to.s >= 2;
    var s, q;
    if (arc) {
      if (p < PH_OUT) {
        var u1 = p / PH_OUT;
        s = lerp(from.s, MID_SCALE, easeOut(u1));
        q = Q_OUT * easeIn(u1);
      } else if (p < PH_PAN) {
        var u2 = (p - PH_OUT) / (PH_PAN - PH_OUT);
        s = MID_SCALE;
        q = lerp(Q_OUT, Q_PAN, u2 * 0.88 + smooth(u2) * 0.12);
      } else {
        var u3 = (p - PH_PAN) / (1 - PH_PAN);
        s = lerp(MID_SCALE, to.s, easeOut(u3));
        q = lerp(Q_PAN, 1, easeOut(u3));
      }
    } else {
      var e = ease(p);
      s = lerp(from.s, to.s, e);
      q = e;
    }
    var frame = {
      topScene: looping ? to.top : ((from.id === 'a02' && to.id === 'a03') ? (p < 1 ? from.top : to.top) : (p < 0.42 ? from.top : to.top)),
      camScale: converge ? (cameraOn ? lerp(from.s, to.s, flow) : from.s) : s,
      camFx: converge ? (cameraOn ? lerp(from.fx, to.fx, flow) + 70 * Math.sin(Math.PI * flow) : from.fx) : lerp(from.fx, to.fx, q),
      camFy: converge ? (cameraOn ? lerp(from.fy, to.fy, flow) - 30 * Math.sin(Math.PI * flow) : from.fy) : lerp(from.fy, to.fy, q),
      camTargetPx: lerp(targetPxOf(from), targetPxOf(to), q),
      // 스마트로드 클로즈업의 센서를 줌아웃 중 정리한 뒤 A02에서 다섯 센서를 새로 점등한다.
      strengths: prepareRelight
        ? [0, 0, 0, 0, 1 - ease(p / 0.55)]
        : (converge ? from.strengths.slice() : lerpArr(from.strengths, to.strengths, q)),
      accents: prepareRelight
        ? [0, 0, 0, 0, 1 - ease(p / 0.35)]
        : (converge ? from.accents.slice() : lerpArr(from.accents, to.accents, q)),
      detailKey: to.detailKey || from.detailKey,
      detailHost: to.detailKey ? to.host : from.host,
      detailOpacity: 0, detailScale: 1, detailBlur: 0,
      dim: converge ? lerp(from.dim, to.dim, flow) : lerp(from.dim, to.dim, q),
      hubProgress: converge ? to.hub * flow : (to.hub > from.hub ? to.hub * ease((p - 0.6) / 0.4) : lerp(from.hub, to.hub, q)),
      copyScene: converge
        ? (p < 0.9 ? (from.copy || '') : (to.copy || ''))
        : (p < 0.5 ? (from.copy || to.copy || '') : (to.copy || from.copy || '')),
      copyOpacity: converge
        ? (p < 0.84 ? 1 : (p < 0.9 ? 1 - ease((p - 0.84) / 0.06) : ease((p - 0.9) / 0.1)))
        : (from.copy && to.copy
          ? (p < 0.5 ? 1 - ease(p / 0.5) : ease((p - 0.5) / 0.5))
          : (to.copy ? ease((p - 0.58) / 0.42) : (from.copy ? 1 - ease(p / 0.4) : 0))),
      logoOpacity: to.logo ? ease((p - 0.32) / 0.68) : (from.logo ? 1 - ease(p / 0.62) : 0),
      dayPhase: looping ? lerp(from.dayPhase != null ? from.dayPhase : 1, to.dayPhase != null ? to.dayPhase : 1, ease(p)) : 1
    };
    var imgVals = travelImages(from, to, p);
    frame.imgA = imgVals.imgA; frame.imgB = imgVals.imgB; frame.imgMix = imgVals.imgMix; frame.cityFade = imgVals.cityFade;
    return frame;
  }

  // 카메라가 멈춘 뒤 들어오는 디테일: scale 1.08 → 1.0 + 짧은 포커스 풀
  function setIncoming(frame, cp, u) {
    frame.detailKey = cp.detailKey;
    frame.detailHost = cp.host;
    frame.detailOpacity = cp.detail * clamp01(u * 1.15);
    // 스마트로드는 카메라 이동 뒤 이미지 자체가 다시 줌되는 이중 움직임을 제거한다.
    frame.detailScale = cp.id === 'rd' ? 1 : lerp(1.08, 1, easeOut(u));
    frame.detailBlur = 6 * (1 - clamp01(u * FADE_IN / FOCUS_MS));
  }

  function atTime(t, cameraOn) {
    t = Math.max(0, Math.min(TOTAL_MS, t));
    var acc = 0;
    for (var i = 0; i < CHECKPOINTS.length; i++) {
      var cp = CHECKPOINTS[i];
      if (t < acc + cp.travel) {
        var prev = i === 0
          ? Object.assign({}, CHECKPOINTS[0], { s: 1.34, fx: 2880, fy: 1080, host: -1, detail: 0, hub: 0, detailKey: '' })
          : CHECKPOINTS[i - 1];
        var frame = blend(prev, cp, (t - acc) / cp.travel, cameraOn);
        if (cp.id === 'a01') {
          // 첫 장면은 TOP 도시 전경만 유지하고, 정착 후 기존 A01 인트로로 전환한다.
          frame.imgA = 4; frame.imgB = 4; frame.imgMix = 0; frame.cityFade = 1;
          var introTravel = (t - acc) / cp.travel;
          frame.dayPhase = ease(introTravel);
          // A01에서는 도시의 시간대 변화에 집중하고 센서 신호는 A02에서만 보여준다.
          frame.strengths = [0, 0, 0, 0, 0];
          frame.accents = [0, 0, 0, 0, 0];
        }
        if (cameraOn && cp.detail > 0) {
          setIncoming(frame, cp, clamp01((FADE_LEAD - (cp.travel - (t - acc))) / FADE_IN));
        }
        return { idx: i, frame: frame };
      }
      acc += cp.travel;
      if (t < acc + cp.hold) {
        var f = frameFor(cp);
        var held = t - acc;
        if (cp.id === 'a01') {
          f.imgA = 4; f.imgB = 4; f.imgMix = 0;
          f.cityFade = 1 - ease((held - 300) / 1100);
          f.dayPhase = 1;
          f.strengths = [0, 0, 0, 0, 0];
          f.accents = [0, 0, 0, 0, 0];
        }
        if (cp.holdFadeAt != null) {
          f.imgA = cp.imgEnter; f.imgB = cp.img;
          f.imgMix = ease((held - cp.holdFadeAt) / cp.holdFadeDur);
          f.cityFade = 1;
        }
        if (cp.id === 'a02') {
          var sensorStep = 240, sensorFade = 170;
          var order = [0, 1, 2, 3, 4];
          var levels = [0, 0, 0, 0, 0];
          order.forEach(function (sensorIndex, orderIndex) {
            levels[sensorIndex] = smooth((held - orderIndex * sensorStep) / sensorFade);
          });
          f.strengths = levels; f.accents = levels;
          f.hubProgress = 0; f.dim = 0; f.copyScene = 'a02'; f.copyOpacity = 1;
        }
        if (cameraOn && cp.detail > 0) {
          var inHold = t - acc;
          setIncoming(f, cp, clamp01((FADE_LEAD + inHold) / FADE_IN));
          var tOut = cp.hold - inHold;
          if (i < CHECKPOINTS.length - 1 && tOut < FADE_OUT) {
            var v = clamp01(1 - tOut / FADE_OUT);
            f.detailOpacity = Math.min(f.detailOpacity, cp.detail * (1 - v));
            f.detailScale = cp.id === 'rd' ? 1 : lerp(1, 0.95, v);
            f.detailBlur = 4 * v;
          }
        }
        return { idx: i, frame: f };
      }
      acc += cp.hold;
    }
    return { idx: CHECKPOINTS.length - 1, frame: frameFor(CHECKPOINTS[CHECKPOINTS.length - 1]) };
  }

  function startOfHold(i) {
    var acc = 0;
    for (var k = 0; k < i; k++) acc += CHECKPOINTS[k].travel + CHECKPOINTS[k].hold;
    return acc + CHECKPOINTS[i].travel;
  }

  /**
   * 재생 상태를 갖는 시계. 화면 렌더러는 이 클래스의 인스턴스를 만들고
   * subscribe(cb)로 매 프레임 값을 받아 자기 DOM만 갱신한다.
   * 여러 창 사이의 동기화(공통 시간축 공유)는 checkpoint 4의 통합 라우터가
   * play/pause/replay 호출을 각 창에 동시에 전달하는 방식으로 맡는다 — 이
   * 클래스 자체는 창 간 통신을 하지 않는다.
   */
  function TimelineClock() {
    this._playing = false;
    this._manual = true;
    this._idx = 0;
    this._t = 0;
    this._startedAt = 0;
    this._cameraMotion = true;
    this._raf = null;
    this._listeners = [];
  }

  TimelineClock.prototype.subscribe = function (cb) {
    this._listeners.push(cb);
    this._emit();
    var self = this;
    return function unsubscribe() {
      var idx = self._listeners.indexOf(cb);
      if (idx >= 0) self._listeners.splice(idx, 1);
    };
  };

  TimelineClock.prototype._emit = function () {
    var idx, frame;
    if (this._manual) { idx = this._idx; frame = frameFor(CHECKPOINTS[idx]); }
    else { var r = atTime(this._t, this._cameraMotion); idx = r.idx; frame = r.frame; }
    var meta = {
      idx: idx, checkpoint: CHECKPOINTS[idx], playing: this._playing, manual: this._manual,
      t: this._manual ? startOfHold(idx) : this._t, totalMs: TOTAL_MS, cameraMotion: this._cameraMotion
    };
    for (var i = 0; i < this._listeners.length; i++) this._listeners[i](frame, meta);
  };

  // 시간 기준은 Date.now()(벽시계, ms epoch)를 쓴다. performance.now()는 문서(창)마다
  // 원점이 달라 창 사이에 값을 그대로 비교할 수 없지만, Date.now()는 같은 기기의
  // 여러 창·탭에서 동일한 기준이라 방송(broadcast)만으로 여러 창을 동기 재생할 수
  // 있다 — src/screens/shared/sync-channel.js가 이 값을 그대로 전달한다.
  TimelineClock.prototype._loop = function () {
    var self = this;
    if (!this._playing) return;
    var elapsed = Date.now() - this._startedAt;
    if (elapsed >= TOTAL_MS) {
      var wrapped = elapsed % TOTAL_MS;
      this._startedAt = Date.now() - wrapped;
      this._t = wrapped;
    } else {
      this._t = elapsed;
    }
    this._emit();
    this._raf = requestAnimationFrame(function () { self._loop(); });
  };

  /**
   * epochStartedAt(Date.now() 기준, 생략 가능)을 주면 그 시각에 t=0이 되도록 강제
   * 동기화하고, 그대로 반환한다 — 다른 창에 방송해 동일한 기준으로 재생을 맞추는
   * 용도다. 생략하면 현재 위치에서 이어서 재생할 기준 시각을 스스로 계산한다.
   */
  TimelineClock.prototype.play = function (epochStartedAt) {
    var startedAt;
    if (epochStartedAt != null) {
      startedAt = epochStartedAt;
    } else {
      var from = this._manual ? startOfHold(this._idx) : this._t;
      var base = from >= TOTAL_MS ? 0 : from;
      startedAt = Date.now() - base;
    }
    this._playing = true; this._manual = false; this._startedAt = startedAt;
    this._t = Math.max(0, Math.min(TOTAL_MS, Date.now() - startedAt));
    if (this._raf) cancelAnimationFrame(this._raf);
    var self = this;
    this._raf = requestAnimationFrame(function () { self._loop(); });
    return startedAt;
  };

  TimelineClock.prototype.pause = function () {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._playing = false;
    this._emit();
  };

  /** play()와 마찬가지로 epochStartedAt을 주면 그 시각을 t=0 기준으로 맞춘다. */
  TimelineClock.prototype.replay = function (epochStartedAt) {
    var startedAt = epochStartedAt != null ? epochStartedAt : Date.now();
    this._playing = true; this._manual = false; this._startedAt = startedAt;
    this._t = Math.max(0, Math.min(TOTAL_MS, Date.now() - startedAt));
    if (this._raf) cancelAnimationFrame(this._raf);
    var self = this;
    this._raf = requestAnimationFrame(function () { self._loop(); });
    return startedAt;
  };

  TimelineClock.prototype.jump = function (i) {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._playing = false; this._manual = true;
    this._idx = Math.max(0, Math.min(CHECKPOINTS.length - 1, i));
    this._t = startOfHold(this._idx);
    this._emit();
  };

  TimelineClock.prototype.step = function (d) {
    var cur = this._manual ? this._idx : atTime(this._t, this._cameraMotion).idx;
    this.jump(cur + d);
  };

  TimelineClock.prototype.setCameraMotion = function (on) {
    this._cameraMotion = !!on;
    this._emit();
  };

  TimelineClock.prototype.dispose = function () {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._listeners.length = 0;
  };

  global.AICityTimeline = {
    CHECKPOINTS: CHECKPOINTS,
    TOTAL_MS: TOTAL_MS,
    atTime: atTime,
    startOfHold: startOfHold,
    frameFor: frameFor,
    TimelineClock: TimelineClock,
    util: { clamp01: clamp01, ease: ease, easeIn: easeIn, easeOut: easeOut, smooth: smooth, lerp: lerp, lerpArr: lerpArr }
  };
})(window);
