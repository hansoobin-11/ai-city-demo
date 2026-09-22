/**
 * 도시 ↔ 상세 화면 전환 상태 기계 (게이트 3).
 *
 * 원본 데모의 phase 값(city → zoom → detail, detail → zoomback → city)과
 * 타이밍을 그대로 옮겼다. 다만 원본은 클릭 후 520ms 동안 phase가 'city'로
 * 남아 있어(핫스폿이 그 사이 다시 클릭될 수 있는 여지) — 이 구현은 진입
 * 신호를 받는 즉시 phase를 'zoom'으로 바꿔 그 여지를 없앤다.
 *
 * `data-phase`/`data-solution` 속성을 scene 루트에 반영해 배경 확대,
 * 도시/상세 레이어 노출은 CSS가 전담하게 한다.
 */

import type { SolutionId } from "../types/solution";

export type ScenePhase = "city" | "zoom" | "detail" | "zoomback";

// 원본 값(진입 2100ms / 복귀 1700ms)은 실제로 눌러보니 로딩이 길게 느껴져 줄였다.
// 0.8초까지 줄였다가 1초로 재조정.
const DETAIL_AFTER_ENTER_MS = 1000;
const CITY_AFTER_BACK_MS = 800;

export interface SceneChange {
  phase: ScenePhase;
  solutionId: SolutionId | null;
}

export interface SceneController {
  getPhase(): ScenePhase;
  getActiveSolution(): SolutionId | null;
  enterZone(id: SolutionId): void;
  back(): void;
  onChange(listener: (change: SceneChange) => void): () => void;
  destroy(): void;
}

export function createSceneController(root: HTMLElement): SceneController {
  let phase: ScenePhase = "city";
  let activeSolution: SolutionId | null = null;
  const timers = new Set<ReturnType<typeof window.setTimeout>>();
  const listeners = new Set<(change: SceneChange) => void>();

  function schedule(ms: number, fn: () => void) {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  }

  function clearTimers() {
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
  }

  function setPhase(next: ScenePhase) {
    phase = next;
    root.dataset.phase = next;
    const change: SceneChange = { phase, solutionId: activeSolution };
    for (const listener of listeners) listener(change);
  }

  function enterZone(id: SolutionId) {
    if (phase !== "city") return;
    clearTimers();
    activeSolution = id;
    root.dataset.solution = id;
    setPhase("zoom");
    schedule(DETAIL_AFTER_ENTER_MS, () => setPhase("detail"));
  }

  function back() {
    if (phase === "city" || phase === "zoomback") return;
    clearTimers();
    setPhase("zoomback");
    schedule(CITY_AFTER_BACK_MS, () => {
      activeSolution = null;
      delete root.dataset.solution;
      setPhase("city");
    });
  }

  function onChange(listener: (change: SceneChange) => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  root.dataset.phase = phase;

  return {
    getPhase: () => phase,
    getActiveSolution: () => activeSolution,
    enterZone,
    back,
    onChange,
    destroy: () => {
      clearTimers();
      listeners.clear();
    },
  };
}
