import type { SolutionId } from "../types/solution";

/**
 * 도시 배경 위 핫스폿 배치.
 *
 * 좌표는 1920x1080 스테이지 기준이며 `데모 시연 초안.html`의 인라인 style에서
 * 그대로 옮겼다. 배경 이미지(city.jpg)에 맞춰 잡힌 값이므로 배경을 교체하지
 * 않는 한 수정하지 않는다.
 */

/** 핀 라벨이 원 표식의 어느 쪽에 오는지. */
export type ZoneLabelSide = "start" | "end";

/** 카드가 핀을 기준으로 붙는 위치. */
export type ZoneCardAnchor =
  | "below-left"
  | "below-left-inset"
  | "below-right"
  | "above-left";

export interface ZoneMarker {
  id: SolutionId;
  /** 핀 옆에 노출하는 짧은 라벨. 상세 화면의 zoneName과 다르다. */
  label: string;
  /** 스테이지 좌상단 기준 좌표(px). */
  x: number;
  y: number;
  /** 원 표식 지름(px). */
  size: number;
  labelSide: ZoneLabelSide;
  cardAnchor: ZoneCardAnchor;
}

export const zoneMarkers: ZoneMarker[] = [
  {
    id: "humanCare",
    label: "Human Care",
    x: 308,
    y: 568,
    size: 60,
    labelSide: "end",
    cardAnchor: "below-left-inset",
  },
  {
    id: "safety",
    label: "Safety",
    x: 1004,
    y: 520,
    size: 60,
    labelSide: "end",
    cardAnchor: "below-left",
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    x: 1404,
    y: 414,
    size: 60,
    labelSide: "end",
    cardAnchor: "below-right",
  },
  {
    id: "robotics",
    label: "Robotics",
    x: 1452,
    y: 672,
    size: 60,
    labelSide: "start",
    cardAnchor: "below-right",
  },
  {
    id: "smartRoad",
    label: "Smart Road",
    x: 620,
    y: 812,
    size: 60,
    labelSide: "end",
    cardAnchor: "above-left",
  },
];
