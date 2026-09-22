/**
 * 공통 상세 화면.
 *
 * 5개 영역이 동일한 레이아웃을 쓴다. 텍스트는 원본에서 확인된 `solutions.ts` 값을
 * 그대로 쓴다.
 *
 * 미디어는 서로 다른 두 자리를 쓴다:
 * - 미디어 박스(1000×772): `images`가 있으면 항상 보이는 미리보기 스와이퍼(메인
 *   스와이퍼). 없으면 빈 패널.
 * - "소개 자료 보기" 버튼(`introSlides`가 있을 때만 노출) → 전체화면 모달의
 *   스와이퍼. PPT 캡처처럼 회사 자체 디자인이 섞인 자료라 작은 박스에 끼워
 *   넣지 않고 별도 화면으로 분리했다.
 * - "홍보 영상 보기" 버튼(`videoSrc`)도 같은 모달을 공유해 영상으로 연다.
 * - 외부 데모(`demoUrl`)는 새 탭으로 여는 별도 버튼.
 * 전부 값이 있을 때만 노출된다(touch-kiosk-ui.md 7항 — 빈 버튼·깨진 placeholder 금지).
 */

import { solutions } from "../data/solutions";
import type { SolutionId } from "../types/solution";

const BACK_HINT = "ESC 또는 좌측 상단 버튼으로 도시 화면으로 돌아갑니다";
const BACK_LABEL = "AI CITY 전체 보기";
const SWIPE_THRESHOLD_PX = 70;

type MediaModalKind = "video" | "slides" | null;

function div(className: string): HTMLDivElement {
  const node = document.createElement("div");
  node.className = className;
  return node;
}

/** 조상 `.stage`의 `--stage-scale`을 읽어 드래그량을 1920 기준 좌표로 보정한다. */
function getStageScale(node: HTMLElement): number {
  const stage = node.closest<HTMLElement>(".stage");
  if (!stage) return 1;
  const value = parseFloat(getComputedStyle(stage).getPropertyValue("--stage-scale"));
  return Number.isFinite(value) && value > 0 ? value : 1;
}

interface SwiperItem {
  src: string;
  /** 있으면 "○○ 화면 예시"로 스와이퍼 상단에 표시된다. */
  label?: string;
}

interface SwiperHandle {
  /** `.detail__swiper` 루트. 원하는 곳(미디어 박스 또는 모달)에 붙여 쓴다. */
  element: HTMLElement;
  /** 슬라이드를 다시 채우고 0번으로 초기화한다. 빈 배열이면 비운다. */
  setImages(images: SwiperItem[]): void;
}

/**
 * 시작·끝 없는 무한 루프 스와이퍼 한 벌을 만든다. 미리보기용과 모달용을 각각
 * 독립적으로 띄워야 해서(동시에 두 군데서 같은 이미지를 볼 수도 있음) 인스턴스
 * 단위로 만든다.
 */
function createSwiper(): SwiperHandle {
  const root = div("detail__swiper");
  const track = div("detail__swiper-track");
  const dots = div("detail__swiper-dots");
  const label = div("detail__swiper-label");
  label.hidden = true;
  root.append(track, dots, label);

  let slideCount = 0;
  let slideIndex = 0;
  let slideLabels: (string | undefined)[] = [];
  let dragStartX = 0;
  let dragDx = 0;
  let dragging = false;
  let dragPointerId: number | null = null;

  function applyTrackPosition(withTransition: boolean) {
    track.style.transition = withTransition ? "" : "none";
    track.style.transform = `translateX(calc(${-slideIndex * 100}% + ${dragDx}px))`;
  }

  function updateDots() {
    Array.from(dots.children).forEach((dot, i) => {
      dot.classList.toggle("is-active", i === slideIndex);
    });
  }

  function updateLabel() {
    const text = slideLabels[slideIndex];
    if (text) {
      label.textContent = `${text} 화면 예시`;
      label.hidden = false;
    } else {
      label.hidden = true;
    }
  }

  /** 인덱스를 슬라이드 개수로 모듈러 연산해 양방향 무한 루프로 이동한다. */
  function goToSlide(index: number) {
    if (slideCount === 0) return;
    slideIndex = ((index % slideCount) + slideCount) % slideCount;
    dragDx = 0;
    applyTrackPosition(true);
    updateDots();
    updateLabel();
  }

  function setImages(images: SwiperItem[]) {
    track.replaceChildren();
    dots.replaceChildren();
    slideCount = images.length;
    slideIndex = 0;
    dragDx = 0;
    slideLabels = images.map((item) => item.label);

    images.forEach((item, i) => {
      const slide = div("detail__swiper-slide");
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = "";
      img.decoding = "async";
      slide.append(img);
      track.append(slide);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "detail__swiper-dot";
      dot.setAttribute("aria-label", `${i + 1}번째 화면 보기`);
      dot.addEventListener("click", () => goToSlide(i));
      dots.append(dot);
    });

    dots.hidden = images.length < 2;
    applyTrackPosition(false);
    updateDots();
    updateLabel();
  }

  function handlePointerDown(event: PointerEvent) {
    if (slideCount < 2) return;
    dragging = true;
    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragDx = 0;
    // 포인터가 이미 비활성 상태 등으로 캡처가 실패해도 드래그 자체는 계속 진행한다.
    try {
      track.setPointerCapture(event.pointerId);
    } catch {
      // no-op
    }
    applyTrackPosition(false);
  }

  function handlePointerMove(event: PointerEvent) {
    if (!dragging || event.pointerId !== dragPointerId) return;
    dragDx = (event.clientX - dragStartX) / getStageScale(track);
    applyTrackPosition(false);
  }

  function endDrag(event: PointerEvent) {
    if (!dragging || event.pointerId !== dragPointerId) return;
    dragging = false;
    dragPointerId = null;
    if (dragDx <= -SWIPE_THRESHOLD_PX) goToSlide(slideIndex + 1);
    else if (dragDx >= SWIPE_THRESHOLD_PX) goToSlide(slideIndex - 1);
    else {
      dragDx = 0;
      applyTrackPosition(true);
    }
  }

  track.addEventListener("pointerdown", handlePointerDown);
  track.addEventListener("pointermove", handlePointerMove);
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);

  return { element: root, setImages };
}

export interface DetailScreenHandle {
  element: HTMLElement;
  render(id: SolutionId): void;
  isMediaModalOpen(): boolean;
  closeMediaModal(): void;
}

export function createDetailScreen(onBack: () => void): DetailScreenHandle {
  let currentSolutionId: SolutionId | null = null;
  let modalKind: MediaModalKind = null;

  const root = document.createElement("section");
  root.className = "detail";
  root.setAttribute("aria-label", "AI CITY 솔루션 상세 화면");

  root.append(div("detail__scrim"), div("detail__vignette"), div("detail__accent"));

  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "detail__back";
  const backArrow = document.createElement("span");
  backArrow.className = "detail__back-arrow";
  backArrow.setAttribute("aria-hidden", "true");
  backArrow.textContent = "←";
  const backLabel = document.createElement("span");
  backLabel.textContent = BACK_LABEL;
  backButton.append(backArrow, backLabel);
  backButton.addEventListener("click", onBack);

  const logo = document.createElement("img");
  logo.className = "detail__logo";
  logo.src = "/assets/logo.png";
  logo.alt = "스페이스뱅크";
  logo.decoding = "async";

  // ── 미디어 박스: 메인 미리보기 스와이퍼 ───────────────────
  // images가 없으면 빈 패널 그대로 둔다.
  const media = div("detail__media");
  media.setAttribute("role", "img");
  media.setAttribute("aria-label", "");
  const previewSwiper = createSwiper();
  media.append(previewSwiper.element);

  // ── 콘텐츠 ──────────────────────────────────────────
  const content = div("detail__content");

  const top = div("detail__top");

  const badgeRow = div("detail__badge-row");
  const badge = document.createElement("span");
  badge.className = "detail__badge";
  const productName = document.createElement("span");
  productName.className = "detail__product";
  badgeRow.append(badge, productName);

  const eyebrow = div("detail__eyebrow");
  const headline = document.createElement("h2");
  headline.className = "detail__headline";
  const description = div("detail__description");

  const ctaRow = div("detail__cta-row");

  // 외부 데모 링크: demoUrl이 있을 때만 보인다(Human Care, Robotics 예정). 새 탭으로 연다.
  const demoLink = document.createElement("a");
  demoLink.className = "detail__cta";
  demoLink.target = "_blank";
  demoLink.rel = "noopener noreferrer";
  demoLink.hidden = true;
  const demoLinkLabel = document.createElement("span");
  demoLinkLabel.textContent = "데모 보기";
  const demoLinkIcon = document.createElement("span");
  demoLinkIcon.className = "detail__cta-icon";
  demoLinkIcon.setAttribute("aria-hidden", "true");
  demoLinkIcon.textContent = "↗";
  demoLink.append(demoLinkLabel, demoLinkIcon);

  // 홍보 영상 버튼: videoSrc가 있을 때만 보인다. 누르면 모달에서 재생한다.
  const videoButton = document.createElement("button");
  videoButton.type = "button";
  videoButton.className = "detail__cta detail__cta--video";
  videoButton.hidden = true;
  const videoButtonLabel = document.createElement("span");
  videoButtonLabel.textContent = "홍보 영상 보기";
  const videoButtonIcon = document.createElement("span");
  videoButtonIcon.className = "detail__cta-icon";
  videoButtonIcon.setAttribute("aria-hidden", "true");
  videoButtonIcon.textContent = "▶";
  videoButton.append(videoButtonLabel, videoButtonIcon);

  // 소개 자료 버튼: introSlides가 있을 때만 보인다. 누르면 모달에서 스와이퍼로 본다.
  const slidesButton = document.createElement("button");
  slidesButton.type = "button";
  slidesButton.className = "detail__cta detail__cta--video";
  slidesButton.hidden = true;
  const slidesButtonLabel = document.createElement("span");
  slidesButtonLabel.textContent = "소개 자료 보기";
  const slidesButtonIcon = document.createElement("span");
  slidesButtonIcon.className = "detail__cta-icon";
  slidesButtonIcon.setAttribute("aria-hidden", "true");
  slidesButtonIcon.textContent = "▤";
  slidesButton.append(slidesButtonLabel, slidesButtonIcon);

  ctaRow.append(demoLink, videoButton, slidesButton);
  top.append(badgeRow, eyebrow, headline, description, ctaRow);

  const features = div("detail__features");
  const featureNodes: HTMLElement[] = [];
  for (let i = 0; i < 3; i += 1) {
    const feature = div("detail__feature");
    const head = div("detail__feature-head");
    const index = document.createElement("span");
    index.className = "detail__feature-index";
    const title = document.createElement("span");
    title.className = "detail__feature-title";
    head.append(index, title);
    const body = div("detail__feature-body");
    feature.append(head, body);
    features.append(feature);
    featureNodes.push(feature);
  }

  content.append(top, features);

  const hint = div("detail__hint");
  hint.textContent = BACK_HINT;

  // ── 미디어 모달 (영상 · 소개 자료 공용) ──────────────────
  const mediaModal = div("detail__media-modal");
  mediaModal.hidden = true;
  const mediaModalBackdrop = div("detail__media-modal-backdrop");
  const mediaModalBody = div("detail__media-modal-body");
  const mediaModalClose = document.createElement("button");
  mediaModalClose.type = "button";
  mediaModalClose.className = "detail__media-modal-close";
  mediaModalClose.setAttribute("aria-label", "닫기");
  mediaModalClose.textContent = "×";
  const videoSlot = div("detail__media-modal-video-slot");
  videoSlot.hidden = true;
  const modalSwiper = createSwiper();
  modalSwiper.element.hidden = true;
  mediaModalBody.append(videoSlot, modalSwiper.element, mediaModalClose);
  mediaModal.append(mediaModalBackdrop, mediaModalBody);

  let modalVideo: HTMLVideoElement | null = null;

  function closeMediaModal() {
    if (!modalKind) return;
    modalKind = null;
    mediaModal.hidden = true;
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.remove();
      modalVideo = null;
    }
    videoSlot.hidden = true;
    modalSwiper.element.hidden = true;
  }

  function openVideoModal(src: string) {
    closeMediaModal();
    const video = document.createElement("video");
    video.className = "detail__media-modal-video";
    video.src = src;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    videoSlot.append(video);
    videoSlot.hidden = false;
    modalVideo = video;
    modalKind = "video";
    mediaModal.hidden = false;
  }

  function openSlidesModal() {
    if (!currentSolutionId) return;
    const introSlides = solutions[currentSolutionId].introSlides;
    if (!introSlides || introSlides.length === 0) return;
    closeMediaModal();
    modalSwiper.setImages(introSlides.map((src) => ({ src })));
    modalSwiper.element.hidden = false;
    modalKind = "slides";
    mediaModal.hidden = false;
  }

  videoButton.addEventListener("click", () => {
    if (!currentSolutionId) return;
    const videoSrc = solutions[currentSolutionId].videoSrc;
    if (videoSrc) openVideoModal(videoSrc);
  });
  slidesButton.addEventListener("click", openSlidesModal);
  mediaModalBackdrop.addEventListener("click", closeMediaModal);
  mediaModalClose.addEventListener("click", closeMediaModal);

  root.append(backButton, logo, media, content, hint, mediaModal);

  function render(id: SolutionId) {
    currentSolutionId = id;
    const solution = solutions[id];
    badge.textContent = `${solution.number} / ${solution.zoneName}`;
    productName.textContent = solution.productName;
    eyebrow.textContent = solution.eyebrow;
    headline.textContent = solution.headline;
    description.textContent = solution.description;

    // 매 진입마다 초기화: 이전 화면에서 열려 있던 모달이 남아있지 않게 한다.
    closeMediaModal();

    if (solution.images && solution.images.length > 0) {
      previewSwiper.setImages(solution.images);
      media.setAttribute("aria-label", `${solution.zoneName} 화면 미리보기`);
    } else {
      previewSwiper.setImages([]);
      media.setAttribute("aria-label", "");
    }

    if (solution.demoUrl) {
      demoLink.href = solution.demoUrl;
      demoLink.hidden = false;
    } else {
      demoLink.hidden = true;
      demoLink.removeAttribute("href");
    }

    videoButton.hidden = !solution.videoSrc;
    slidesButton.hidden = !(solution.introSlides && solution.introSlides.length > 0);

    solution.features.forEach((feature, index) => {
      const node = featureNodes[index];
      const indexEl = node.querySelector<HTMLElement>(".detail__feature-index");
      const titleEl = node.querySelector<HTMLElement>(".detail__feature-title");
      const bodyEl = node.querySelector<HTMLElement>(".detail__feature-body");
      if (indexEl) indexEl.textContent = String(index + 1).padStart(2, "0");
      if (titleEl) titleEl.textContent = feature.title;
      if (bodyEl) bodyEl.textContent = feature.body;
    });
  }

  return {
    element: root,
    render,
    isMediaModalOpen: () => modalKind !== null,
    closeMediaModal,
  };
}
