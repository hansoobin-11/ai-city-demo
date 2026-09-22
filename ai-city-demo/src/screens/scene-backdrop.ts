/**
 * 도시·상세 화면이 공유하는 배경 4겹 + 조명 오버레이.
 *
 * 게이트 1에서는 `.city` 섹션 안에 있었지만, 상세 화면도 같은 배경 위에서
 * 확대되어 보여야 하므로(원본의 `bgScale` 전환) 화면 밖 공용 레이어로 뺐다.
 */

import { createCityOverlay } from "./city-overlay";

function div(className: string): HTMLDivElement {
  const node = document.createElement("div");
  node.className = className;
  return node;
}

export function createSceneBackdrop(): DocumentFragment {
  const fragment = document.createDocumentFragment();
  fragment.append(
    div("stage__base"),
    div("stage__photo"),
    div("stage__tint"),
    div("stage__vignette"),
    div("stage__dim"),
    createCityOverlay(),
  );
  return fragment;
}
