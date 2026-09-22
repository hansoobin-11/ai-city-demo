/**
 * 전시 스테이지 피팅.
 *
 * 원본 데모와 동일하게 1920x1080 고정 박스를 만들고, 뷰포트에 맞는 배율로
 * 축소한다. 확대는 하지 않으므로 기준 해상도보다 큰 화면에서는 레터박스가 생긴다.
 */

export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

export function initStageFit(stage: HTMLElement): () => void {
  const apply = () => {
    const scale = Math.max(
      0.1,
      Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT),
    );
    stage.style.setProperty("--stage-scale", String(scale));
  };

  apply();
  window.addEventListener("resize", apply);

  return () => window.removeEventListener("resize", apply);
}
