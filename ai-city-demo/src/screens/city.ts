/**
 * 도시 메인 화면 (전경 레이어).
 *
 * 배경·조명 오버레이는 `scene-backdrop.ts`가 맡는다. 이 모듈은 로고·히어로·
 * 핫스폿만 그린다. 인트로 시퀀스 없이 야간 점등 완료 상태로 바로 보인다.
 * 핫스폿 입력·카드 열림·자동 순환 바인딩은 `city-interactions.ts`,
 * 도시↔상세 전환은 `scene.ts`가 맡는다.
 */

import { zoneMarkers } from "../data/zones";
import { solutions } from "../data/solutions";

const HERO_TITLE_LINES = ["AI가 도시를 보고,", "이해하고, 움직입니다."] as const;
const HERO_ZONES = "HUMAN CARE · SAFETY · INFRASTRUCTURE · ROBOTICS · SMART ROAD";
const HERO_SUMMARY_LINES = [
  "사람의 건강부터 도시 안전, 핵심시설, 로봇, 도로 인프라까지",
  "도시 데이터를 하나로 연결하는 AI 기반 Intelligent City Platform",
] as const;

function div(className: string): HTMLDivElement {
  const node = document.createElement("div");
  node.className = className;
  return node;
}

function createHero(): HTMLElement {
  const hero = document.createElement("header");
  hero.className = "hero";

  const eyebrow = div("hero__eyebrow");
  eyebrow.append(div("hero__rule"));
  const eyebrowText = document.createElement("span");
  eyebrowText.textContent = "SPACEBANK AI CITY";
  eyebrow.append(eyebrowText);

  const title = document.createElement("h1");
  title.className = "hero__title";
  HERO_TITLE_LINES.forEach((line, index) => {
    if (index > 0) title.append(document.createElement("br"));
    title.append(line);
  });

  const zones = document.createElement("p");
  zones.className = "hero__zones";
  zones.textContent = HERO_ZONES;

  const summary = document.createElement("p");
  summary.className = "hero__summary";
  HERO_SUMMARY_LINES.forEach((line, index) => {
    if (index > 0) summary.append(document.createElement("br"));
    summary.append(line);
  });

  hero.append(eyebrow, title, zones, summary);
  return hero;
}

function createMarker(marker: (typeof zoneMarkers)[number]): HTMLElement {
  const solution = solutions[marker.id];

  const root = div("zone");
  root.dataset.zone = marker.id;
  root.style.setProperty("--zone-x", `${marker.x}px`);
  root.style.setProperty("--zone-y", `${marker.y}px`);
  root.style.setProperty("--zone-size", `${marker.size}px`);
  root.dataset.card = marker.cardAnchor;

  // 원 표식
  const dot = div("zone__dot");
  dot.append(
    div("zone__ring"),
    div("zone__ping"),
    div("zone__core"),
    div("zone__glow"),
  );

  // 핀 라벨 + 진입 표시
  const pin = div("zone__pin");
  const label = document.createElement("span");
  label.className = "zone__label";
  label.textContent = marker.label;
  const chevron = document.createElement("span");
  chevron.className = "zone__chevron";
  chevron.setAttribute("aria-hidden", "true");
  chevron.textContent = "›";
  pin.append(label, chevron);

  const head = div("zone__head");
  if (marker.labelSide === "start") head.append(pin, dot);
  else head.append(dot, pin);

  // 핀과 카드 사이 빈 구간에서 hover가 끊기지 않도록 잇는 투명 영역.
  const bridge = div("zone__bridge");

  // 미리보기 카드 (게이트 1에서는 숨김 상태로만 배치)
  const card = div("zone__card");
  const cardEyebrow = div("zone__card-eyebrow");
  cardEyebrow.textContent = `${solution.number} ${solution.zoneName}`;
  const cardTitle = div("zone__card-title");
  cardTitle.textContent = marker.label;
  const cardBody = div("zone__card-body");
  cardBody.textContent = solution.eyebrow;
  card.append(cardEyebrow, cardTitle, cardBody);

  root.append(head, bridge, card);
  return root;
}

export function createCityScreen(): HTMLElement {
  const screen = document.createElement("section");
  screen.className = "city";
  screen.setAttribute("aria-label", "SPACEBANK AI CITY 도시 화면");
  screen.append(div("city__scrim"));

  const logo = document.createElement("img");
  logo.className = "city__logo";
  logo.src = "/assets/logo.png";
  logo.alt = "스페이스뱅크";
  logo.decoding = "async";

  screen.append(logo, createHero());

  for (const marker of zoneMarkers) {
    screen.append(createMarker(marker));
  }

  return screen;
}
