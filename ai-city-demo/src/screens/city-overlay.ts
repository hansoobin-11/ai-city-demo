/**
 * 도시 조명 + 데이터 네트워크 SVG 오버레이.
 *
 * 좌표·색상·굵기는 `데모 시연 초안.html`에서 그대로 옮겼다.
 * 게이트 1은 인트로 없이 점등 완료 상태로 진입하므로 원본의 순차 점등
 * transition/stroke-dashoffset 드로잉은 옮기지 않고 최종 상태로 고정한다.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

type Attrs = Record<string, string | number>;

function el<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Attrs = {},
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, String(value));
  }
  return node;
}

/** 건물 창문 불빛: [cx, cy, r] */
const BUILDING_WINDOWS: ReadonlyArray<readonly [number, number, number]> = [
  [250, 430, 4], [300, 405, 3.4], [345, 455, 4.4], [395, 425, 3.2],
  [440, 470, 4], [487, 440, 3.2], [533, 482, 3.8], [762, 400, 3.6],
  [812, 432, 4.2], [862, 396, 3.2], [916, 436, 3.8], [976, 410, 3.4],
  [1004, 256, 2.8], [1082, 236, 2.6], [1162, 250, 3], [1242, 226, 2.6],
  [1322, 246, 2.8], [1424, 236, 2.6], [1522, 252, 3], [1352, 532, 4],
  [1452, 562, 3.6], [1562, 542, 4.2], [1662, 586, 3.4], [1762, 562, 3.8],
  [1482, 652, 3.2], [1622, 662, 3.6],
];

/** 가로등·도로 조명: [cx, cy, r] */
const STREET_LIGHTS: ReadonlyArray<readonly [number, number, number]> = [
  [120, 932, 3], [262, 882, 3], [402, 822, 3], [542, 760, 3], [662, 700, 3],
  [822, 692, 3], [982, 702, 3], [1142, 692, 3], [1302, 672, 3], [1444, 628, 3],
];

interface DataLine {
  id?: string;
  d: string;
  stroke: string;
  strokeWidth: number;
  strokeOpacity?: number;
}

const DATA_LINES: readonly DataLine[] = [
  { id: "pA", d: "M -20,984 C 380,900 600,790 720,660", stroke: "url(#sbCoralCyan)", strokeWidth: 2.4 },
  { id: "pB", d: "M 720,660 C 840,540 960,470 1080,432", stroke: "url(#sbCyanCoral)", strokeWidth: 2 },
  { id: "pC", d: "M 720,660 C 900,700 1080,716 1280,690", stroke: "url(#sbCoralCyan)", strokeWidth: 2 },
  { id: "pD", d: "M 1280,690 C 1420,660 1520,600 1580,500", stroke: "#5FD7E6", strokeWidth: 1.8, strokeOpacity: 0.7 },
  { d: "M 344,598 C 470,616 610,644 720,660", stroke: "#E64F3D", strokeWidth: 1.8, strokeOpacity: 0.85 },
  { d: "M 1032,548 C 950,585 830,634 720,660", stroke: "#5FD7E6", strokeWidth: 1.5, strokeOpacity: 0.6 },
  { d: "M 1432,442 C 1500,460 1560,478 1580,500", stroke: "#5FD7E6", strokeWidth: 1.5, strokeOpacity: 0.6 },
  { d: "M 1614,700 C 1602,640 1592,560 1580,500", stroke: "#5FD7E6", strokeWidth: 1.5, strokeOpacity: 0.6 },
  { d: "M 648,840 C 662,780 692,710 720,660", stroke: "#5FD7E6", strokeWidth: 1.5, strokeOpacity: 0.6 },
];

/** 이동 데이터 점: [r, fill, pathId, dur(s), begin(s)] */
const TRAVELLING_DOTS: ReadonlyArray<readonly [number, string, string, string, string]> = [
  [3.6, "#FFB9AC", "pA", "9s", "0s"],
  [3, "#9FEDF6", "pC", "7.5s", "1.2s"],
  [2.8, "#9FEDF6", "pB", "6.5s", "2.4s"],
  [2.8, "#FFB9AC", "pD", "8s", "3.1s"],
];

/** 창문·가로등·데이터 점 둘레의 번짐을 흉내 내는 원 반지름 배율. */
const HALO_SCALE = 2.8;
/** 데이터 라인 번짐용으로 뒤에 깔리는 굵은 선의 배율·투명도. */
const LINE_GLOW_WIDTH = 3.5;
const LINE_GLOW_OPACITY = 0.22;

/**
 * 색마다 가운데가 진하고 바깥이 투명해지는 방사형 그라데이션.
 * 예전에는 feGaussianBlur 필터로 번짐을 만들었지만, WebKit(iPad Safari)은 SVG
 * 필터를 CPU로 매 프레임 다시 계산해 구형 iPad에서 화면이 크게 느려졌다.
 * 그라데이션 원은 한 번 그리면 끝이라 훨씬 가볍고, 보이는 모양은 거의 같다.
 */
const HALO_COLORS: Record<string, string> = {
  sbHaloWarm: "#FFD9A6",
  sbHaloCool: "#CDE4FF",
  sbHaloCoral: "#FFB9AC",
  sbHaloCyan: "#9FEDF6",
};

function buildDefs(): SVGDefsElement {
  const defs = el("defs");

  for (const [id, color] of Object.entries(HALO_COLORS)) {
    const halo = el("radialGradient", { id });
    halo.append(
      el("stop", { offset: 0, "stop-color": color, "stop-opacity": 0.55 }),
      el("stop", { offset: 0.45, "stop-color": color, "stop-opacity": 0.18 }),
      el("stop", { offset: 1, "stop-color": color, "stop-opacity": 0 }),
    );
    defs.append(halo);
  }

  const coralCyan = el("linearGradient", { id: "sbCoralCyan", x1: 0, y1: 0, x2: 1, y2: 0 });
  coralCyan.append(
    el("stop", { offset: 0, "stop-color": "#E64F3D", "stop-opacity": 0.9 }),
    el("stop", { offset: 0.55, "stop-color": "#9C8FA8", "stop-opacity": 0.55 }),
    el("stop", { offset: 1, "stop-color": "#5FD7E6", "stop-opacity": 0.85 }),
  );

  const cyanCoral = el("linearGradient", { id: "sbCyanCoral", x1: 0, y1: 0, x2: 1, y2: 0 });
  cyanCoral.append(
    el("stop", { offset: 0, "stop-color": "#5FD7E6", "stop-opacity": 0.85 }),
    el("stop", { offset: 1, "stop-color": "#E64F3D", "stop-opacity": 0.85 }),
  );

  defs.append(coralCyan, cyanCoral);
  return defs;
}

/** 번짐 원 + 선명한 점을 한 그룹으로 만든다. */
function glowingLights(
  points: ReadonlyArray<readonly [number, number, number]>,
  fill: string,
  haloId: string,
  opacity: number,
): SVGGElement {
  const group = el("g", { opacity });
  const halos = el("g", { fill: `url(#${haloId})` });
  const cores = el("g", { fill });
  for (const [cx, cy, r] of points) {
    halos.append(el("circle", { cx, cy, r: r * HALO_SCALE }));
    cores.append(el("circle", { cx, cy, r }));
  }
  group.append(halos, cores);
  return group;
}

function lineAttrs(line: DataLine, glow: boolean): Attrs {
  const attrs: Attrs = {
    d: line.d,
    stroke: line.stroke,
    "stroke-width": glow ? line.strokeWidth * LINE_GLOW_WIDTH : line.strokeWidth,
  };
  const opacity = line.strokeOpacity ?? 1;
  if (glow) attrs["stroke-opacity"] = opacity * LINE_GLOW_OPACITY;
  else if (line.strokeOpacity !== undefined) attrs["stroke-opacity"] = line.strokeOpacity;
  if (!glow && line.id) attrs.id = line.id;
  return attrs;
}

export function createCityOverlay(): SVGSVGElement {
  const svg = el("svg", {
    viewBox: "0 0 1920 1080",
    preserveAspectRatio: "none",
    "aria-hidden": "true",
    focusable: "false",
  });
  svg.classList.add("city-overlay");

  svg.append(buildDefs());

  // 건물 창문 · 가로등/도로 조명
  const windows = glowingLights(BUILDING_WINDOWS, "#FFD9A6", "sbHaloWarm", 0.95);
  const street = glowingLights(STREET_LIGHTS, "#CDE4FF", "sbHaloCool", 0.9);

  // 데이터 라인: 굵고 옅은 선(번짐) 위에 원래 선을 겹친다.
  const lines = el("g", { fill: "none", "stroke-linecap": "round", opacity: 0.9 });
  for (const line of DATA_LINES) lines.append(el("path", lineAttrs(line, true)));
  for (const line of DATA_LINES) lines.append(el("path", lineAttrs(line, false)));

  // 라인을 따라 도는 데이터 점 (번짐 원과 점이 같은 경로로 함께 움직인다)
  const dots = el("g", { opacity: 0.9 });
  for (const [r, fill, pathId, dur, begin] of TRAVELLING_DOTS) {
    const haloId = fill === "#FFB9AC" ? "sbHaloCoral" : "sbHaloCyan";
    const dot = el("g");
    dot.append(
      el("circle", { r: r * HALO_SCALE, fill: `url(#${haloId})` }),
      el("circle", { r, fill }),
    );
    const motion = el("animateMotion", { dur, begin, repeatCount: "indefinite" });
    motion.append(el("mpath", { href: `#${pathId}` }));
    dot.append(motion);
    dots.append(dot);
  }

  svg.append(windows, street, lines, dots);
  return svg;
}
