/**
 * 도시 화면 핫스폿 입력 (게이트 2).
 *
 * 원본 데모의 위험 요소를 여기서 고친다:
 *  - `PointerEvent.pointerType`으로 마우스/터치/펜을 이벤트 단위로 구분한다.
 *    `navigator.maxTouchPoints` 같은 장치 전체 분기는 쓰지 않는다.
 *  - 마우스: hover 즉시 카드 표시, 클릭(pointerup) 즉시 진입 신호.
 *  - 터치/펜: 1탭 = 카드 표시(무장), 같은 핫스폿 2탭째 = 진입 신호.
 *  - 자동 카드 순환은 없다. 상담 중 필요할 때만 시연하므로 카드는 사용자가
 *    연 것만 보이고, 핫스폿 밖을 탭하거나 마우스가 벗어나면 닫힌다.
 *  - 진입 신호를 낸 뒤에는 짧은 잠금 구간을 두어 중복 입력을 막는다.
 *
 * 실제 상세 화면 전환은 게이트 3에서 붙인다. 여기서는 `city:enter-zone`
 * 커스텀 이벤트만 내보낸다.
 */

import { zoneOrder } from "../data/solutions";
import type { SolutionId } from "../types/solution";

const ENTER_LOCK_MS = 400;

export interface CityEnterZoneDetail {
  id: SolutionId;
}

function isSolutionId(value: string | undefined): value is SolutionId {
  return !!value && (zoneOrder as string[]).includes(value);
}

export interface CityInteractionsHandle {
  /** 도시 phase가 아닐 때(zoom/detail/zoomback) 입력을 끈다. */
  setEnabled(enabled: boolean): void;
  destroy(): void;
}

export function initCityInteractions(root: HTMLElement): CityInteractionsHandle {
  const zones = Array.from(root.querySelectorAll<HTMLElement>(".zone"));
  if (zones.length === 0) {
    return { setEnabled: () => {}, destroy: () => {} };
  }

  let enterLockTimer: ReturnType<typeof window.setTimeout> | undefined;
  let transitionLocked = false;
  let interactionsEnabled = true;
  /** 마우스 hover 또는 터치 1탭으로 카드가 열려 있는 핫스폿. */
  let userActiveZone: SolutionId | null = null;
  /** 터치/펜에서 "2탭째 진입"을 기다리는 핫스폿. */
  let touchArmedZone: SolutionId | null = null;

  function setActive(id: SolutionId | null) {
    for (const zone of zones) {
      zone.dataset.active = zone.dataset.zone === id ? "true" : "false";
    }
  }

  function closeCard() {
    userActiveZone = null;
    touchArmedZone = null;
    setActive(null);
  }

  function enterZone(id: SolutionId) {
    if (transitionLocked) return;
    transitionLocked = true;
    root.dispatchEvent(
      new CustomEvent<CityEnterZoneDetail>("city:enter-zone", { detail: { id } }),
    );
    window.clearTimeout(enterLockTimer);
    enterLockTimer = window.setTimeout(() => {
      transitionLocked = false;
    }, ENTER_LOCK_MS);
  }

  function handlePointerEnter(event: PointerEvent, id: SolutionId) {
    if (!interactionsEnabled) return;
    if (event.pointerType !== "mouse") return;
    userActiveZone = id;
    touchArmedZone = null;
    setActive(id);
  }

  function handlePointerLeave(event: PointerEvent, id: SolutionId) {
    if (!interactionsEnabled) return;
    if (event.pointerType !== "mouse") return;
    if (userActiveZone !== id) return;
    closeCard();
  }

  function handlePointerUp(event: PointerEvent, id: SolutionId) {
    if (!interactionsEnabled) return;
    if (transitionLocked) return;

    if (event.pointerType === "mouse") {
      // hover로 이미 카드가 열려 있으므로 클릭은 곧바로 진입 신호.
      enterZone(id);
      return;
    }

    // 터치·펜: 1탭째는 카드만 열고, 같은 핫스폿을 다시 탭하면 진입.
    if (touchArmedZone === id) {
      enterZone(id);
      return;
    }
    touchArmedZone = id;
    userActiveZone = id;
    setActive(id);
  }

  function handleDocumentPointerDown(event: PointerEvent) {
    if (event.pointerType === "mouse") return;
    if (!touchArmedZone) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest(".zone")) return;
    closeCard();
  }

  const cleanups: Array<() => void> = [];

  for (const zone of zones) {
    const id = zone.dataset.zone;
    if (!isSolutionId(id)) continue;

    const onEnter = (event: Event) => handlePointerEnter(event as PointerEvent, id);
    const onLeave = (event: Event) => handlePointerLeave(event as PointerEvent, id);
    const onUp = (event: Event) => handlePointerUp(event as PointerEvent, id);

    zone.addEventListener("pointerenter", onEnter);
    zone.addEventListener("pointerleave", onLeave);
    zone.addEventListener("pointerup", onUp);

    cleanups.push(() => {
      zone.removeEventListener("pointerenter", onEnter);
      zone.removeEventListener("pointerleave", onLeave);
      zone.removeEventListener("pointerup", onUp);
    });
  }

  document.addEventListener("pointerdown", handleDocumentPointerDown);
  cleanups.push(() =>
    document.removeEventListener("pointerdown", handleDocumentPointerDown),
  );

  setActive(null);

  function setEnabled(enabled: boolean) {
    if (enabled === interactionsEnabled) return;
    interactionsEnabled = enabled;
    if (enabled) return;
    // 상세 화면으로 넘어갈 때는 카드·무장 상태를 완전히 비운다.
    window.clearTimeout(enterLockTimer);
    transitionLocked = false;
    closeCard();
  }

  return {
    setEnabled,
    destroy: () => {
      window.clearTimeout(enterLockTimer);
      for (const cleanup of cleanups) cleanup();
    },
  };
}
