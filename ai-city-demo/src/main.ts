import "./styles/main.css";
import "./styles/stage.css";
import "./styles/city.css";
import "./styles/detail.css";

import { initStageFit } from "./lib/stage";
import { initCityInteractions } from "./lib/city-interactions";
import { createSceneController } from "./lib/scene";
import { createSceneBackdrop } from "./screens/scene-backdrop";
import { createCityScreen } from "./screens/city";
import { createDetailScreen } from "./screens/detail";

const app = document.querySelector<HTMLElement>("#app");

if (!app) {
  throw new Error("#app element not found");
}

const stage = document.createElement("div");
stage.className = "stage";

const scene = document.createElement("div");
scene.className = "scene";

const city = createCityScreen();
const sceneController = createSceneController(scene);
const detail = createDetailScreen(() => sceneController.back());

scene.append(createSceneBackdrop(), city, detail.element);
stage.append(scene);
app.replaceChildren(stage);

initStageFit(stage);
const cityInteractions = initCityInteractions(city);

city.addEventListener("city:enter-zone", (event) => {
  const { id } = (event as CustomEvent<{ id: string }>).detail;
  sceneController.enterZone(id as Parameters<typeof detail.render>[0]);
});

sceneController.onChange(({ phase, solutionId }) => {
  cityInteractions.setEnabled(phase === "city");
  if (solutionId && (phase === "zoom" || phase === "detail")) {
    detail.render(solutionId);
  }
  // 상세 화면을 벗어나면 열려 있던 미디어 모달도 같이 정리한다(뒤로가기 버튼 경로 포함).
  if (phase !== "detail") {
    detail.closeMediaModal();
  }
});

// ESC로도 도시 화면 복귀. 손가락 기준 동작(뒤로가기 버튼)을 대체하지 않는
// 보조 수단이며, 원본 화면의 안내 문구("ESC 또는 좌측 상단 버튼으로…")와 맞춘다.
// 미디어 모달(영상·소개 자료)이 열려 있으면 ESC는 모달만 닫고 도시로는 돌아가지 않는다.
window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (detail.isMediaModalOpen()) {
    detail.closeMediaModal();
    return;
  }
  sceneController.back();
});
