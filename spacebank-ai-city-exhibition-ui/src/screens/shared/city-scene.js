/**
 * SPACEBANK AI CITY 전시 UI — 하단 LEFT·CENTER·RIGHT 공용 렌더러
 *
 * 세 화면은 하나의 5760×1920 논리 캔버스를 공유하지만, 이 모듈은 각 화면에서
 * "자기 몫의 1920×1080만" 계산해서 돌려준다. 기준본(cityDc.html)처럼 5760px
 * 폭 DOM을 그린 뒤 overflow:hidden으로 잘라내지 않는다 — background-position/
 * SVG 좌표 오프셋으로 같은 좌표계의 다른 슬라이스를 직접 계산한다
 * (AGENTS.md: "다른 화면을 함께 렌더링한 뒤 CSS로 잘라내는 방식을 최종 구조로
 * 사용하지 않는다").
 *
 * 데이터 출처: docs/baseline-scene-timeline.md 4절(좌표), 1·3절(카메라).
 */
(function (global) {
  'use strict';

  var SCREEN_W = 1920, SCREEN_H = 1080;
  var WORLD_W = 5760, WORLD_H = 1920;
  var VISIBLE_MARGIN = 260; // 마커 halo 반경(150px)보다 넉넉하게 — 화면 경계에서 자연스럽게 사라지도록

  var HUB = { x: 2880, y: 1030 };
  var CORAL = '#E64F3D', MAUVE = '#9C8FA8';
  var WARM = { core: '#FF8A66', glow: '#FF6A47' };
  var COOL = { core: '#7FE3EE', glow: '#3FD3E8' };

  var DOMAINS = [
    { key: 'hc', en: 'AI HUMAN CARE', ko: '사람의 건강과 돌봄', fx: 700, fy: 720, warm: true },
    { key: 'sf', en: 'AI SAFETY', ko: '건물·시설 안전', fx: 3000, fy: 780, warm: true },
    { key: 'inf', en: 'AI INFRASTRUCTURE', ko: '핵심 시설·자원 관측', fx: 4700, fy: 800, warm: false },
    { key: 'rb', en: 'AI ROBOTICS', ko: '현장 로봇 운영', fx: 4850, fy: 1330, warm: false },
    { key: 'rd', en: 'AI SMART ROAD', ko: '도로 인프라 관리', fx: 1750, fy: 1400, warm: true }
  ];

  // A03 수렴 경로: [시작점, 1구간 cubic(c1,c2,end), 2구간 cubic(c1,c2,HUB)]
  var PATHS = [
    { key: 'hc', warm: true, segs: [[700, 720], [1300, 720, 2100, 810, 2500, 900], [2660, 940, 2770, 1000, 2880, 1030]] },
    { key: 'sf', warm: true, segs: [[3000, 780], [3030, 835, 3010, 905, 2950, 955], [2915, 985, 2890, 1015, 2880, 1030]] },
    { key: 'inf', warm: false, segs: [[4700, 800], [4500, 850, 3900, 850, 3350, 905], [3150, 940, 2980, 995, 2880, 1030]] },
    { key: 'rb', warm: false, segs: [[4850, 1330], [4300, 1390, 3650, 1320, 3250, 1180], [3070, 1120, 2970, 1060, 2880, 1030]] },
    { key: 'rd', warm: true, segs: [[1750, 1400], [2150, 1450, 2500, 1300, 2660, 1160], [2750, 1090, 2810, 1050, 2880, 1030]] }
  ];

  // assetsBase(예: '../../../public/assets/') 뒤에 그대로 붙일 상대경로 — 'images/'
  // 접두어를 빠뜨리면 assetsBase가 이미 .../assets/로 끝나 assets/assets/처럼
  // 중복되어 404가 난다(실제로 한 번 이렇게 깨졌던 적이 있다 — 아래 주석 유지).
  var DETAIL_SRC = {
    hc: 'images/detail-hc.jpg', sf: 'images/detail-sf.jpg', inf: 'images/detail-inf.jpg',
    rb: 'images/detail-rb.jpg', rd: 'images/detail-rd.jpg'
  };

  // 도메인 체크포인트마다 호스트가 아닌 "남는 2 화면"에 띄우는 데모 화면 캡처.
  // 폴더: public/assets/images/demo/ — 파일명에 규칙을 강제하지 않는다(사용자가 준
  // 캡처 파일명을 그대로 쓰기 위함). 대신 "어떤 파일이 어느 도메인·어느 화면 것인지"를
  // 이 매니페스트에 직접 나열한다. 이미지를 추가/교체할 때는 이 목록만 갱신하면 된다.
  var DEMO_MANIFEST = {
    // hc 호스트=LEFT, 남는 화면=CENTER·RIGHT
    'hc-center': ['hc-낙상 센서.png', 'hc-수면 보고서.png'],
    'hc-right': ['hc-대시보드.png', 'hc-호흡심박 센서.png'],
    // sf 호스트=CENTER, 남는 화면=LEFT·RIGHT
    'sf-left': ['sf-재난통계.png', 'sf-폭염정보.png'],
    'sf-right': ['sf-대시보드.png', 'sf-재해 시뮬레이션.png'],
    // inf(=infra) 호스트=RIGHT, 남는 화면=LEFT·CENTER
    'inf-left': ['infra-알림기록.png', 'infra-패턴탐지.png'],
    'inf-center': ['infra-대시보드.png', 'infra-차트분석.png'],
    // rb 호스트=RIGHT, 남는 화면=LEFT·CENTER
    'rb-left': ['rb-스케줄링.png', 'rb-지정순찰.png'],
    'rb-center': ['rb-대시보드.png', 'rb-대시보드 2.png'],
    // rd 호스트=LEFT, 남는 화면=CENTER·RIGHT (장수가 2장뿐이라 화면당 1장씩)
    'rd-center': ['rd-대시보드.png'],
    'rd-right': ['rd-기상알림.png']
  };
  var DEMO_SCREEN_NAMES = ['left', 'center', 'right'];

  var DEMO_META = {
    hc: { index: '01', code: 'HUMAN CARE', ko: '사람의 건강과 돌봄', status: 'CARE SIGNAL' },
    sf: { index: '02', code: 'SAFETY', ko: '건물·시설 안전', status: 'SAFETY SIGNAL' },
    inf: { index: '03', code: 'INFRASTRUCTURE', ko: '핵심 시설·자원 관측', status: 'INFRA SIGNAL' },
    rb: { index: '04', code: 'ROBOTICS', ko: '현장 로봇 운영', status: 'ROBOT SIGNAL' },
    rd: { index: '05', code: 'SMART ROAD', ko: '도로 인프라 관리', status: 'ROAD SIGNAL' }
  };

  // 콘텐츠 출처: ../ai-city-demo/src/data/solutions.ts. 전시용으로 문장을 새로
  // 만들지 않고 제품명·상태·대표 문장·3개 기능을 승인 원문 그대로 사용한다.
  var STORY_META = {
    hc: {
      product: 'AIoT Wright (HumanCare)', status: '상용 솔루션',
      eyebrow: '라이프스타일·바이탈 데이터 기반 휴먼케어 통합관제',
      headline: '접촉 없이 호흡·심박과 낙상 징후를 감지합니다',
      features: [
        ['비접촉 바이탈 모니터링', '침상에서 호흡수와 심박수, 재실 여부를 실시간으로 확인합니다.'],
        ['낙상·이상 상태 감지', '넘어짐과 장기 사용, 설정 범위를 벗어난 바이탈 상태를 감지합니다.'],
        ['알림과 상태 이력', '대시보드 팝업과 음성 알림을 제공하고 기간별 상태 변화를 확인합니다.']
      ]
    },
    sf: {
      product: 'SPIDER Wright', status: '맞춤형 구축',
      eyebrow: '재난·환경 데이터 기반 도시 안전 통합관제',
      headline: '재난·기상·시설 데이터를 함께 분석해 먼저 확인해야 할 위험을 찾습니다',
      features: [
        ['재난·기상 데이터 연계', '호우, 폭염, 지진 등 외부 정보를 시설 데이터와 함께 확인합니다.'],
        ['영향권 시설 확인', '시설 위치와 재해 범위를 비교해 우선 확인할 대상을 찾습니다.'],
        ['대응 안내와 이력 관리', '상황별 안내를 제공하고 알림과 조치 이력을 관리합니다.']
      ]
    },
    inf: {
      product: 'Gene Bank 지능형 관제', status: '현장 적용 사례',
      eyebrow: '유전자원 및 국가·도시 핵심시설 지능형 관제',
      headline: '핵심시설의 환경과 설비 상태를 분석해 이상 징후를 조기에 알립니다',
      features: [
        ['시설 데이터 실시간 수집', '공간별 센서와 설비 상태를 한 화면에서 확인합니다.'],
        ['AI 이상 패턴 탐지', '축적된 시계열 데이터를 분석해 평소와 다른 변화를 감지합니다.'],
        ['관제·알람·제어', '이상 상태를 알리고 이력을 관리하며 필요한 설비 제어를 지원합니다.']
      ]
    },
    rb: {
      product: 'RoboViewX', status: '데모 가능',
      eyebrow: '로봇·드론 등 이기종 Physical AI 통합관제',
      headline: '서로 다른 로봇의 위치·영상·임무와 상태를 하나의 화면에서 운영합니다',
      features: [
        ['자율 순찰과 스케줄', '등록된 경로와 일정에 따라 로봇의 순찰 작업을 운영합니다.'],
        ['위치·영상 통합관제', '로봇의 위치와 이동 경로, 실시간 영상을 한 화면에서 확인합니다.'],
        ['상태·이벤트 모니터링', '배터리와 장치 상태, 침입 감지 이벤트와 기록을 확인합니다.']
      ]
    },
    rd: {
      product: '도로 열선 통합관제', status: '맞춤형 구축',
      eyebrow: '도로 열선·기상·노면 데이터 기반 지능형 통합관제',
      headline: '기상과 도로 상태를 바탕으로 결빙 위험을 확인하고 열선을 통합 제어합니다',
      features: [
        ['열선 상태 통합관제', '분산된 열선의 작동 상태와 이상 여부를 한 화면에서 확인합니다.'],
        ['전체·구간별 제어', '전체 구간 또는 행정구역 단위로 열선을 제어합니다.'],
        ['기상 예보 알림', '눈 예보와 기상 변화를 확인해 사전 대응을 지원합니다.']
      ]
    }
  };

  // 호스트를 제외한 두 화면 중 소개 타이포를 배치할 화면. 다른 한 화면에는
  // 대표성이 높은 캡처 묶음이 남도록 도메인별로 명시한다.
  var STORY_SCREEN = { hc: 1, sf: 0, inf: 0, rb: 0, rd: 2 };

  function demoImagesFor(domain, screenName, assetsBase) {
    var files = DEMO_MANIFEST[domain + '-' + screenName];
    if (!files || !files.length) return [];
    return files.map(function (name) { return assetsBase + 'images/demo/' + encodeURIComponent(name); });
  }

  function demoLabelFor(src) {
    var name = (src || '').split('/').pop() || '';
    try { name = decodeURIComponent(name); } catch (e) { /* 인코딩된 파일명 그대로 사용 */ }
    return name
      .replace(/\.[^.]+$/, '')
      .replace(/^(hc|sf|infra|rb|rd)-/i, '')
      .replace(/\s+/g, ' ')
      .trim() || '운영 화면';
  }

  function bez(t, a, b, c, d) {
    var u = 1 - t;
    return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  }

  var FLOW = (function () {
    var strands = [], dots = [];
    PATHS.forEach(function (p) {
      var pal = p.warm ? WARM : COOL;
      var st = p.segs[0], a = p.segs[1], b = p.segs[2];
      strands.push({
        d: 'M ' + st[0] + ' ' + st[1] + ' C ' + a.join(' ') + ' C ' + b.join(' '),
        core: pal.core, glow: pal.glow, w: 4.5, gw: 20, o: 0.98
      });
      var segs = [
        { p0: st, c1: [a[0], a[1]], c2: [a[2], a[3]], p1: [a[4], a[5]] },
        { p0: [a[4], a[5]], c1: [b[0], b[1]], c2: [b[2], b[3]], p1: [b[4], b[5]] }
      ];
      segs.forEach(function (sg, si) {
        [0.3, 0.62, 0.88].forEach(function (t) {
          var g = (si + t) / 2;
          dots.push({
            x: Math.round(bez(t, sg.p0[0], sg.c1[0], sg.c2[0], sg.p1[0])),
            y: Math.round(bez(t, sg.p0[1], sg.c1[1], sg.c2[1], sg.p1[1])),
            r: 3.5 + 11 * Math.pow(g, 1.9),
            c: pal.core,
            o: Math.min(1, 0.52 + 0.5 * g)
          });
        });
      });
    });
    return { strands: strands, dots: dots };
  })();

  function computeCamera(frame) {
    var s = frame.camScale, fx = frame.camFx, fy = frame.camFy, targetPx = frame.camTargetPx;
    return { s: s, tx: targetPx - s * fx, ty: 540 - s * fy };
  }

  /** screenIndex: 0=LEFT, 1=CENTER, 2=RIGHT */
  function computeValues(frame, screenIndex) {
    var cam = computeCamera(frame);
    var screenOffset = screenIndex * SCREEN_W;
    var dayPhase = Math.max(0, Math.min(1, frame.dayPhase == null ? 1 : frame.dayPhase));
    var dawnOpacity = Math.max(0, 1 - dayPhase * 1.55);
    var sunsetOpacity = Math.sin(Math.PI * dayPhase) * 0.48;

    var strengths = frame.strengths || [0, 0, 0, 0, 0];
    var accents = frame.accents || [0, 0, 0, 0, 0];
    var hubProgress = frame.hubProgress || 0;
    var connectionMode = hubProgress > 0.02;

    var markers = DOMAINS.map(function (d, i) {
      var baseStrength = strengths[i] || 0;
      // 수렴(hubProgress가 0→1)이 진행될수록 각 마커는 허브로 흡수되며 사라져야
      // 한다 — 원본 baseline의 Math.max(baseStrength, hubProgress) 그대로 옮겼더니
      // 오히려 반대로 hubProgress가 오를수록 마커가 다시 100%까지 밝아져서, 수렴이
      // 끝난 뒤에도 허브 옆에 별개의 빛나는 점이 계속 남아 있었다(참고 이미지로 확인:
      // 최종적으로는 허브 한 점만 빛나야 함). 그래서 hubProgress에 비례해 마커를
      // 점점 꺼지게(1-hubProgress) 바꿨다 — A03 hold(hubProgress=1)에서는 완전히
      // 사라지고 허브만 남는다.
      var st = connectionMode ? baseStrength * (1 - hubProgress) : baseStrength;
      var worldPx = cam.tx + cam.s * d.fx;
      var worldPy = cam.ty + cam.s * d.fy;
      var localPx = worldPx - screenOffset;
      var accent = (accents[i] || 0) > 0.5;
      var connectionWarm = d.key === 'hc' || d.key === 'sf' || d.key === 'rd';
      var color = connectionMode ? (connectionWarm ? WARM.core : COOL.core) : (accent ? CORAL : MAUVE);
      var active = accent || connectionMode;
      var flip = localPx + 460 > SCREEN_W;
      var visible = localPx > -VISIBLE_MARGIN && localPx < SCREEN_W + VISIBLE_MARGIN;
      // 라벨(읽는 글자)은 halo/glow와 달리 화면 경계에 걸쳐 자연스럽게 이어지지 않는다
      // — 베젤 사이에 글자가 반토막 나기 때문이다(기준본의 flip 로직도 "이 마커는 어느
      // 화면 안에 완전히 넣을지"를 정하는 용도). 그래서 라벨은 오직 마커가 실제로
      // 속한 "홈 화면"(floor(worldPx/1920))에서만 보여준다 — visible 여백(margin) 때문에
      // 이웃 화면에도 점/글로우가 살짝 넘어와 보이더라도, 글자는 중복해서 그리지 않는다.
      var homeScreen = Math.floor(worldPx / SCREEN_W);
      var isHomeScreen = homeScreen === screenIndex;
      return {
        key: d.key, en: d.en, ko: d.ko, visible: visible,
        px: localPx, py: worldPy, strength: st, color: color,
        haloBorder: '3px solid ' + color,
        ringBorder: (active ? 4 : 3) + 'px solid ' + color,
        dotSize: (active ? 28 : 20),
        dotGlow: '0 0 ' + (active ? 46 : 30) + 'px ' + (active ? 10 : 4) + 'px ' + (connectionMode ? (connectionWarm ? 'rgba(255,138,102,0.72)' : 'rgba(127,227,238,0.72)') : (accent ? 'rgba(230,79,61,0.7)' : 'rgba(156,143,168,0.55)')),
        pulse: st > 0.5 ? ('introRing ' + (active ? '2.0s' : '3.4s') + ' ease-in-out infinite') : 'none',
        labelVisible: visible && isHomeScreen && !connectionMode && st > 0.35,
        flip: flip
      };
    });

    var hubWorldPx = cam.tx + cam.s * HUB.x;
    var hubWorldPy = cam.ty + cam.s * HUB.y;
    var hubLocalPx = hubWorldPx - screenOffset;
    var hubVisible = hubProgress > 0.02 && hubLocalPx > -300 && hubLocalPx < SCREEN_W + 300;

    var detailKey = frame.detailKey || '';
    var isHost = frame.detailHost === screenIndex && !!DETAIL_SRC[detailKey];
    var showStory = !isHost && !!detailKey && STORY_SCREEN[detailKey] === screenIndex;
    var showDemo = !isHost && !showStory && !!detailKey;

    return {
      // 배경(마스터 파노라마) — background-position으로 이 화면의 슬라이스만 지정
      bgPosX: (cam.tx - screenOffset).toFixed(1) + 'px',
      bgPosY: cam.ty.toFixed(1) + 'px',
      bgSizeW: (WORLD_W * cam.s).toFixed(1) + 'px',
      bgSizeH: (WORLD_H * cam.s).toFixed(1) + 'px',
      cityBrightness: (0.94 - dayPhase * 0.16).toFixed(3),
      citySaturation: (0.62 + dayPhase * 0.26).toFixed(3),
      dawnOpacity: dawnOpacity.toFixed(3),
      sunsetOpacity: sunsetOpacity.toFixed(3),
      nightOpacity: (0.25 + dayPhase * 0.75).toFixed(3),

      // SVG(연결선) — 이 화면 몫만 보이도록 그룹 transform에서 화면 오프셋을 뺀다
      svgGroupTransform: 'translate(' + (cam.tx - screenOffset).toFixed(1) + ' ' + cam.ty.toFixed(1) + ') scale(' + cam.s.toFixed(4) + ')',
      hubProgress: hubProgress,
      lineDashOffset: (1 - hubProgress).toFixed(4),

      markers: markers,
      hubVisible: hubVisible,
      hubLocalPx: hubLocalPx,
      hubLocalPy: hubWorldPy,

      isHost: isHost,
      detailSrc: DETAIL_SRC[detailKey] || '',
      detailOpacity: isHost ? (frame.detailOpacity || 0) : 0,
      detailScale: frame.detailScale != null ? frame.detailScale : 1,
      detailBlurPx: (frame.detailBlur || 0).toFixed(2) + 'px',

      // 호스트가 아닌 화면에서 같은 도메인 체크포인트 동안 보여줄 데모 캡처 슬라이드쇼.
      // 호스트의 디테일 이미지와 같은 등장/퇴장 타이밍(detailOpacity/Scale/Blur)을 그대로 쓴다.
      showDemo: showDemo,
      demoKey: detailKey,
      demoOpacity: showDemo ? (frame.detailOpacity || 0) : 0,
      demoScale: frame.detailScale != null ? frame.detailScale : 1,
      demoBlurPx: (frame.detailBlur || 0).toFixed(2) + 'px',

      showStory: showStory,
      storyKey: detailKey,
      storyOpacity: showStory ? (frame.detailOpacity || 0) : 0,
      storyScale: frame.detailScale != null ? frame.detailScale : 1,
      storyBlurPx: (frame.detailBlur || 0).toFixed(2) + 'px',

      showLogo: screenIndex === 1 && (frame.logoOpacity || 0) > 0.01,
      logoOpacity: frame.logoOpacity || 0,
      logoScale: (0.92 + (frame.logoOpacity || 0) * 0.08).toFixed(4),

      totalDim: (frame.dim || 0) + (isHost ? 0 : (frame.detailHost === screenIndex ? 0 : 0))
    };
  }

  function el(tag, style) {
    var e = document.createElement(tag);
    if (style) e.style.cssText = style;
    return e;
  }

  var SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVG_NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  /**
   * root: 1920x1080 컨테이너(overflow:hidden은 이 화면 경계를 위한 안전장치일 뿐,
   * 다른 화면 내용을 그렸다가 잘라내는 용도가 아니다 — 애초에 이 화면 몫만 그린다).
   * assetsBase: 이 화면 파일 기준 public/assets 상대 경로 (예: '../../../public/assets/')
   */
  function mount(root, screenIndex, assetsBase) {
    root.style.cssText = 'position:relative;width:' + SCREEN_W + 'px;height:' + SCREEN_H + 'px;overflow:hidden;background:#05080F;font-family:"Pretendard Variable",Pretendard,system-ui,sans-serif';

    var bg = el('div', 'position:absolute;top:0;left:0;width:100%;height:100%;background-repeat:no-repeat;filter:contrast(1.05)');
    bg.style.backgroundImage = 'url("' + assetsBase + 'images/master.jpg")';
    root.appendChild(bg);

    var dawn = el('div', 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(174,202,226,0.42) 0%,rgba(132,165,202,0.18) 48%,rgba(98,132,176,0.06) 100%)');
    var sunset = el('div', 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(128,157,205,0.22) 0%,rgba(82,112,165,0.14) 48%,rgba(9,20,40,0.14) 100%)');
    var night = el('div', 'position:absolute;inset:0;background:rgba(120,160,255,0.09)');
    root.appendChild(dawn); root.appendChild(sunset); root.appendChild(night);

    var detailImg = el('img', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(0.88) contrast(1.06) brightness(0.78)');
    detailImg.alt = '';
    var detailTint = el('div', 'position:absolute;inset:0;background:rgba(120,160,255,0.09)');
    root.appendChild(detailImg); root.appendChild(detailTint);

    // 비호스트 화면의 상세 데모는 캡처 한 장을 번갈아 띄우지 않는다. 두 이미지를
    // 하나의 공간형 시스템 보드에 동시에 배치해, 도시 위에 실제 운영 화면이 떠 있는
    // 인상을 만든다. 장면 시간은 건드리지 않고 기존 detailOpacity/Scale/Blur만 재사용한다.
    var demoScene = el('section');
    demoScene.className = 'detail-demo-scene detail-demo-screen-' + DEMO_SCREEN_NAMES[screenIndex];
    demoScene.setAttribute('aria-hidden', 'true');
    demoScene.innerHTML =
      '<div class="detail-demo-aura"></div>' +
      '<div class="detail-demo-kicker"><span class="detail-demo-kicker-dot"></span>SPACEBANK AI CITY</div>' +
      '<div class="detail-demo-title"><span class="detail-demo-index">00</span><div><strong>AI CITY</strong><small>도시 운영 데이터</small></div></div>' +
      '<div class="detail-demo-status"><i></i><span class="detail-demo-status-label">LIVE SIGNAL</span><b>ONLINE</b></div>' +
      '<div class="detail-demo-rail detail-demo-rail-a"><i></i><i></i><i></i></div>' +
      '<div class="detail-demo-rail detail-demo-rail-b"><i></i><i></i></div>' +
      '<div class="detail-demo-shell">' +
        '<div class="detail-demo-shell-grid"></div>' +
        '<div class="detail-demo-card detail-demo-card-main"><span class="detail-demo-card-label"><b>SCREEN 01</b><strong class="detail-demo-main-label">운영 화면</strong></span><img alt=""></div>' +
        '<div class="detail-demo-card detail-demo-card-sub"><span class="detail-demo-card-label"><b>SCREEN 02</b><strong class="detail-demo-sub-label">분석 화면</strong></span><img alt=""></div>' +
        '<div class="detail-demo-node detail-demo-node-a"></div><div class="detail-demo-node detail-demo-node-b"></div>' +
      '</div>' +
      '<div class="detail-demo-caption"><span>CONNECTED URBAN INTELLIGENCE</span><i></i><b>REAL-TIME</b></div>';
    var demoMainImg = demoScene.querySelector('.detail-demo-card-main img');
    var demoSubImg = demoScene.querySelector('.detail-demo-card-sub img');

    var storyScene = el('section');
    storyScene.className = 'detail-story-scene detail-story-screen-' + DEMO_SCREEN_NAMES[screenIndex];
    storyScene.setAttribute('aria-hidden', 'true');
    storyScene.innerHTML =
      '<div class="detail-story-grid"></div>' +
      '<div class="detail-story-watermark">AI CITY</div>' +
      '<div class="detail-story-topline"><span>SPACEBANK AI CITY</span><i></i><b class="detail-story-status">SOLUTION</b></div>' +
      '<div class="detail-story-heading">' +
        '<span class="detail-story-index">00</span>' +
        '<div><small class="detail-story-zone">AI CITY</small><strong class="detail-story-product">SOLUTION</strong></div>' +
      '</div>' +
      '<div class="detail-story-eyebrow">도시 운영 데이터 기반 통합관제</div>' +
      '<h2 class="detail-story-headline">도시의 변화를 감지하고 연결합니다</h2>' +
      '<div class="detail-story-features">' +
        '<article><span>01</span><strong></strong><p></p></article>' +
        '<article><span>02</span><strong></strong><p></p></article>' +
        '<article><span>03</span><strong></strong><p></p></article>' +
      '</div>' +
      '<div class="detail-story-footer"><span>CONNECTED URBAN INTELLIGENCE</span><i></i><b>CORE FUNCTIONS</b></div>';

    var vignette = el('div', 'position:absolute;inset:0;background:radial-gradient(82% 130% at 50% 50%,rgba(5,8,15,0) 52%,rgba(5,8,15,0.6) 100%)');
    var grade = el('div', 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,8,15,0.5) 0%,rgba(5,8,15,0.12) 24%,rgba(5,8,15,0.2) 60%,rgba(5,8,15,0.78) 100%)');
    var dimLayer = el('div', 'position:absolute;inset:0;background:#05080F');
    root.appendChild(vignette); root.appendChild(grade); root.appendChild(dimLayer);
    root.appendChild(demoScene); root.appendChild(storyScene);

    // SVG: 연결선 + 흐름 입자 + 허브 글로우 (이 화면의 1920x1080 뷰포트에서만 그려짐)
    var svg = svgEl('svg', { width: SCREEN_W, height: SCREEN_H, viewBox: '0 0 ' + SCREEN_W + ' ' + SCREEN_H, style: 'position:absolute;top:0;left:0;overflow:visible;pointer-events:none' });
    var defs = svgEl('defs');
    var hubGlow = svgEl('radialGradient', { id: 'introHubGlow' + screenIndex, cx: '50%', cy: '50%', r: '50%' });
    hubGlow.appendChild(svgEl('stop', { offset: '0', 'stop-color': '#FFD9CC', 'stop-opacity': '1' }));
    hubGlow.appendChild(svgEl('stop', { offset: '0.24', 'stop-color': '#F0846F', 'stop-opacity': '0.82' }));
    hubGlow.appendChild(svgEl('stop', { offset: '0.52', 'stop-color': '#E64F3D', 'stop-opacity': '0.24' }));
    hubGlow.appendChild(svgEl('stop', { offset: '1', 'stop-color': '#E64F3D', 'stop-opacity': '0' }));
    var lineGlowFilter = svgEl('filter', { id: 'introLineGlow' + screenIndex, x: '-12%', y: '-40%', width: '124%', height: '180%' });
    lineGlowFilter.appendChild(svgEl('feGaussianBlur', { stdDeviation: '14' }));
    defs.appendChild(hubGlow); defs.appendChild(lineGlowFilter);
    svg.appendChild(defs);

    var g = svgEl('g');
    var glowGroup = svgEl('g', { filter: 'url(#introLineGlow' + screenIndex + ')', opacity: '0.56' });
    var glowPaths = FLOW.strands.map(function (s) {
      var p = svgEl('path', { d: s.d, pathLength: '1', fill: 'none', stroke: s.glow, 'stroke-width': s.gw, 'stroke-linecap': 'round', 'stroke-dasharray': '1' });
      glowGroup.appendChild(p);
      return p;
    });
    var corePaths = FLOW.strands.map(function (s) {
      var p = svgEl('path', { d: s.d, pathLength: '1', fill: 'none', stroke: s.core, 'stroke-width': s.w, opacity: s.o, 'stroke-linecap': 'round', 'stroke-dasharray': '1' });
      g.appendChild(p);
      return p;
    });
    var dotEls = FLOW.dots.map(function (p) {
      var c = svgEl('circle', { cx: p.x, cy: p.y, r: p.r, fill: p.c, opacity: p.o });
      g.appendChild(c);
      return c;
    });
    var hubCircle = svgEl('circle', { cx: HUB.x, cy: HUB.y, r: 210, fill: 'url(#introHubGlow' + screenIndex + ')' });
    g.appendChild(glowGroup); g.appendChild(hubCircle);
    svg.appendChild(g);
    root.appendChild(svg);

    // hubLabel 자체의 좌상단이 아니라 고정 크기 컨테이너의 정중앙을 HUB 좌표에
    // 맞춘다. 그래야 SVG 선·글로우·원형 마커·텍스트가 모두 같은 점을 기준으로 한다.
    var hubLabel = el('div', 'position:absolute;width:900px;height:420px;transform:translate(-50%,-50%);white-space:nowrap;pointer-events:none');
    hubLabel.innerHTML =
      '<div style="width:280px;height:280px;border-radius:50%;border:3px solid #9C8FA8;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);animation:introHubRing 3.2s ease-in-out infinite"></div>' +
      '<div style="width:150px;height:150px;border-radius:50%;border:5px solid #F0846F;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);opacity:0.9"></div>' +
      '<div style="width:46px;height:46px;border-radius:50%;background:#F0846F;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);box-shadow:0 0 70px 20px rgba(240,132,111,0.75)"></div>' +
      '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,18px);display:flex;flex-direction:column;align-items:center;gap:8px">' +
      '<div style="font-size:60px;font-weight:800;letter-spacing:0.16em;color:#fff;text-shadow:0 2px 26px rgba(5,8,15,0.98)">AI CITY</div>' +
      '<div style="font-size:28px;font-weight:700;letter-spacing:0.14em;color:#F0846F;text-shadow:0 2px 20px rgba(5,8,15,0.98)">CENTRAL PERSPECTIVE</div></div>';
    root.appendChild(hubLabel);

    var markerEls = DOMAINS.map(function () {
      var m = el('div', 'position:absolute;top:0;left:0');
      m.innerHTML =
        '<div class="halo" style="position:absolute;left:0;top:0;width:150px;height:150px;border-radius:50%;transform:translate(-50%,-50%)"></div>' +
        '<div class="ring" style="position:absolute;left:0;top:0;width:74px;height:74px;border-radius:50%;transform:translate(-50%,-50%);opacity:0.85"></div>' +
        '<div class="dot" style="position:absolute;left:0;top:0;border-radius:50%;transform:translate(-50%,-50%)"></div>' +
        '<div class="label" style="position:absolute;top:-46px;display:flex;flex-direction:column;gap:6px;white-space:nowrap">' +
        '<div class="label-en" style="font-size:42px;font-weight:800;letter-spacing:0.12em;color:#fff;text-shadow:0 2px 22px rgba(5,8,15,0.98)"></div>' +
        '<div class="label-ko" style="font-size:30px;font-weight:600;color:#F0846F;text-shadow:0 2px 18px rgba(5,8,15,0.98)"></div></div>';
      root.appendChild(m);
      return m;
    });

    var logoWrap = el('div', 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center');
    logoWrap.innerHTML =
      '<div style="position:absolute;width:1680px;height:820px;border-radius:50%;background:radial-gradient(circle,rgba(240,132,111,0.14) 0%,rgba(240,132,111,0.045) 36%,rgba(240,132,111,0) 73%)"></div>' +
      '<div class="logo-inner" style="position:relative;display:flex;flex-direction:column;align-items:center;gap:34px;filter:drop-shadow(0 10px 42px rgba(0,0,0,0.68))">' +
      '<img src="' + assetsBase + 'images/brand-logo.png" alt="SPACEBANK" style="width:520px;height:auto;display:block">' +
      '<div style="display:flex;align-items:center;justify-content:center;gap:18px;font-size:44px;font-weight:650;letter-spacing:0.055em;white-space:nowrap;text-shadow:0 3px 22px rgba(5,8,15,0.95)">' +
      '<span style="color:rgba(255,255,255,0.94)">더 안전한 내일을 위해,</span><span style="color:#F0846F;font-weight:800">SPACEBANK AI CITY</span></div></div>';
    var logoRadial = el('div', 'position:absolute;inset:0;background:radial-gradient(72% 74% at 50% 50%,rgba(230,79,61,0.16) 0%,rgba(230,79,61,0.055) 38%,rgba(5,8,15,0.04) 70%,rgba(5,8,15,0.08) 100%)');
    root.appendChild(logoRadial); root.appendChild(logoWrap);

    detailImg.src = assetsBase + 'images/detail-hc.jpg'; // 초기값, update()에서 교체

    function update(frame) {
      var v = computeValues(frame, screenIndex);
      bg.style.backgroundPosition = v.bgPosX + ' ' + v.bgPosY;
      bg.style.backgroundSize = v.bgSizeW + ' ' + v.bgSizeH;
      bg.style.filter = 'brightness(' + v.cityBrightness + ') saturate(' + v.citySaturation + ') contrast(1.05)';
      dawn.style.opacity = v.dawnOpacity;
      sunset.style.opacity = v.sunsetOpacity;
      night.style.opacity = v.nightOpacity;
      dimLayer.style.opacity = v.totalDim;

      if (v.isHost && v.detailSrc) {
        var abs = assetsBase + v.detailSrc;
        if (detailImg.dataset.src !== abs) { detailImg.src = abs; detailImg.dataset.src = abs; }
        detailImg.style.opacity = v.detailOpacity;
        detailTint.style.opacity = v.detailOpacity;
        var t = 'scale(' + v.detailScale + ')';
        detailImg.style.transform = t; detailTint.style.transform = t;
        detailImg.style.filter = 'saturate(0.88) contrast(1.06) brightness(0.78) blur(' + v.detailBlurPx + ')';
      } else {
        detailImg.style.opacity = 0; detailTint.style.opacity = 0;
      }

      if (v.showDemo) {
        var demoList = demoImagesFor(v.demoKey, DEMO_SCREEN_NAMES[screenIndex], assetsBase);
        if (demoList.length) {
          if (demoScene.dataset.key !== v.demoKey) {
            var meta = DEMO_META[v.demoKey] || { index: '00', code: 'AI CITY', ko: '도시 운영 데이터', status: 'LIVE SIGNAL' };
            demoScene.querySelector('.detail-demo-index').textContent = meta.index;
            demoScene.querySelector('.detail-demo-title strong').textContent = 'AI ' + meta.code;
            demoScene.querySelector('.detail-demo-title small').textContent = meta.ko;
            demoScene.querySelector('.detail-demo-status-label').textContent = meta.status;
            demoScene.dataset.key = v.demoKey;
          }
          if (demoMainImg.dataset.src !== demoList[0]) {
            demoMainImg.src = demoList[0];
            demoMainImg.dataset.src = demoList[0];
          }
          demoScene.querySelector('.detail-demo-main-label').textContent = demoLabelFor(demoList[0]);
          var secondSrc = demoList[1] || '';
          if (secondSrc && demoSubImg.dataset.src !== secondSrc) {
            demoSubImg.src = secondSrc;
            demoSubImg.dataset.src = secondSrc;
          } else if (!secondSrc) {
            demoSubImg.removeAttribute('src');
            delete demoSubImg.dataset.src;
          }
          demoScene.querySelector('.detail-demo-sub-label').textContent = secondSrc ? demoLabelFor(secondSrc) : '';
          demoScene.classList.toggle('is-single', demoList.length === 1);
          if (v.demoOpacity > 0.02 && demoScene.dataset.visible !== '1') {
            demoScene.classList.remove('is-entering');
            void demoScene.offsetWidth;
            demoScene.classList.add('is-entering');
            demoScene.dataset.visible = '1';
          } else if (v.demoOpacity <= 0.02) {
            demoScene.dataset.visible = '0';
          }
          demoScene.style.opacity = v.demoOpacity;
          demoScene.style.transform = 'scale(' + v.demoScale + ')';
          demoScene.style.filter = 'blur(' + v.demoBlurPx + ')';
        } else {
          // 이 도메인·화면 조합의 매니페스트 항목이 아직 없다 — 안 보여준다.
          demoScene.style.opacity = 0;
        }
      } else {
        demoScene.style.opacity = 0;
      }

      if (v.showStory) {
        var story = STORY_META[v.storyKey];
        var storyMeta = DEMO_META[v.storyKey];
        if (story && storyMeta) {
          if (storyScene.dataset.key !== v.storyKey) {
            storyScene.querySelector('.detail-story-index').textContent = storyMeta.index;
            storyScene.querySelector('.detail-story-zone').textContent = 'AI ' + storyMeta.code;
            storyScene.querySelector('.detail-story-product').textContent = story.product;
            storyScene.querySelector('.detail-story-status').textContent = story.status;
            storyScene.querySelector('.detail-story-eyebrow').textContent = story.eyebrow;
            storyScene.querySelector('.detail-story-headline').textContent = story.headline;
            var storyFeatureEls = storyScene.querySelectorAll('.detail-story-features article');
            story.features.forEach(function (feature, i) {
              storyFeatureEls[i].querySelector('strong').textContent = feature[0];
              storyFeatureEls[i].querySelector('p').textContent = feature[1];
            });
            storyScene.dataset.key = v.storyKey;
          }
          if (v.storyOpacity > 0.02 && storyScene.dataset.visible !== '1') {
            storyScene.classList.remove('is-entering');
            void storyScene.offsetWidth;
            storyScene.classList.add('is-entering');
            storyScene.dataset.visible = '1';
          } else if (v.storyOpacity <= 0.02) {
            storyScene.dataset.visible = '0';
          }
          storyScene.style.opacity = v.storyOpacity;
          storyScene.style.transform = 'scale(' + v.storyScale + ')';
          storyScene.style.filter = 'blur(' + v.storyBlurPx + ')';
        } else {
          storyScene.style.opacity = 0;
        }
      } else {
        storyScene.style.opacity = 0;
      }

      g.setAttribute('transform', v.svgGroupTransform);
      glowGroup.setAttribute('transform', v.svgGroupTransform);
      svg.style.opacity = v.hubProgress;
      corePaths.forEach(function (p) { p.setAttribute('stroke-dashoffset', v.lineDashOffset); });
      glowPaths.forEach(function (p) { p.setAttribute('stroke-dashoffset', v.lineDashOffset); });

      hubLabel.style.left = v.hubLocalPx + 'px';
      hubLabel.style.top = v.hubLocalPy + 'px';
      hubLabel.style.opacity = v.hubVisible ? v.hubProgress : 0;
      hubLabel.style.display = v.hubVisible ? '' : 'none';

      v.markers.forEach(function (m, i) {
        var node = markerEls[i];
        if (!m.visible) { node.style.display = 'none'; return; }
        node.style.display = '';
        node.style.left = m.px + 'px';
        node.style.top = m.py + 'px';
        node.style.opacity = m.strength;
        var halo = node.querySelector('.halo'), ring = node.querySelector('.ring'), dot = node.querySelector('.dot'), label = node.querySelector('.label');
        halo.style.border = m.haloBorder;
        halo.style.animation = m.pulse;
        ring.style.border = m.ringBorder;
        dot.style.width = m.dotSize + 'px'; dot.style.height = m.dotSize + 'px';
        dot.style.background = m.color; dot.style.boxShadow = m.dotGlow;
        label.style.display = m.labelVisible ? 'flex' : 'none';
        label.style.left = m.flip ? '-72px' : '72px';
        label.style.transform = m.flip ? 'translateX(-100%)' : 'none';
        node.querySelector('.label-en').textContent = m.en;
        node.querySelector('.label-ko').textContent = m.ko;
      });

      logoRadial.style.opacity = v.showLogo ? v.logoOpacity : 0;
      logoWrap.style.opacity = v.showLogo ? v.logoOpacity : 0;
      logoWrap.querySelector('.logo-inner').style.transform = 'scale(' + v.logoScale + ')';
    }

    return update;
  }

  global.AICityScene = { DOMAINS: DOMAINS, PATHS: PATHS, HUB: HUB, FLOW: FLOW, computeValues: computeValues, mount: mount };
})(window);
