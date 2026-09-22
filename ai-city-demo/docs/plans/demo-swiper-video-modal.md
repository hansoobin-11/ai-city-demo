# 상세 화면 — 데모 버튼 정리 + 캡처 스와이퍼 + 영상 모달 (완료)

`docs/plans/demo-and-video-cta.md`(이전 턴에서 만든 데모/영상 버튼)를 다음 요청에 맞춰
재구성했다. Plan 파일: `.claude/plans/claude-md-cheeky-quasar.md` 승인 후 진행.

## 확정 사항

1. "데모 보기" 버튼(새 탭) — Human Care, Robotics 예정. 데이터 기반이라 코드는 그대로,
   라벨만 "데모 페이지 열기" → **"데모 보기"**로 변경.
2. Safety(KT 사례), Smart Road(열선관제) — 보안상 데모 불가. **사례 화면 캡처
   2~4장을 스와이퍼**로 노출.
3. **미디어 박스는 항상 스와이퍼 전용.** 이전에 만들었던 "영상이 미디어 박스를
   차지하는" 방식을 걷어내고, 영상은 별도 "홍보 영상 보기" 버튼 → **모달**에서 재생한다.
   Infrastructure(유전자원)는 이 모달을 쓴다.

## 구현

### 데이터 모델
- `SolutionContent.images?: string[]` 추가 (2~4장, 길이 고정 없음)

### 미디어 박스 (`.detail__swiper`)
- `images` 있으면 무한 루프 스와이퍼, 없으면 빈 패널(기존과 동일)
- 인덱스는 `((index % n) + n) % n`로 계산 — 마지막→처음, 처음→마지막 양방향 순환
- 포인터 드래그: `pointerdown/move/up/cancel` + `setPointerCapture`(실패해도 드래그가
  끊기지 않도록 `try/catch`로 감쌈). 드래그량은 `.stage`의 `--stage-scale`로 나눠
  창 크기와 무관하게 항상 같은 체감 임계값(70px)을 갖게 보정
- 점 인디케이터 클릭으로 특정 슬라이드 바로 이동 가능. 이미지 1장이면 점 자체를 숨김

### 데모·영상 버튼 (`.detail__cta-row`)
- "데모 보기"(`demoUrl`) — 코랄 채움 버튼, 새 탭
- "홍보 영상 보기"(`videoSrc`) — 아웃라인 버튼(두 버튼을 시각적으로 구분), 클릭 시 모달

### 영상 모달 (`.detail__video-modal`)
- 전체 화면 오버레이(1920×1080 스테이지 좌표계 기준 `position:absolute`, 실제 뷰포트
  기준 `fixed`가 아님 — 스테이지 스케일과 독립적으로 어긋나지 않게)
- 닫기 3가지: × 버튼, backdrop 클릭, ESC
- ESC 우선순위: 모달이 열려 있으면 ESC는 모달만 닫고 도시로 돌아가지 않음(`main.ts`에서
  `detail.isVideoModalOpen()`으로 분기)
- 상세 화면을 벗어나는 모든 경로(뒤로가기 버튼, ESC-도시복귀)에서 `scene.onChange`가
  `phase !== 'detail'`을 감지해 모달을 자동 정리 — 열어둔 채 나가도 안 남음

## 진행 중 발견한 버그 (같이 수정)

**`hidden` 어트리뷰트가 무시되는 CSS 결함.** `.detail__cta`, `.detail__swiper-dots`에
`display: inline-flex`/`display: flex`를 무조건 선언해 둔 상태에서 JS로 `.hidden = true`를
줘도 시각적으로 사라지지 않았다(동일 특정성에서 나중에 선언된 규칙이 이겨 `[hidden]`의
`display:none`을 덮어씀). `.detail__cta[hidden]`, `.detail__swiper-dots[hidden]`에
`display:none`을 명시적으로 다시 선언해 고쳤다. `computedStyle().display`로 직접
확인해서 잡아낸 결함이며, `.hidden` 프로퍼티만 보고 "안 보인다"고 가정하면 놓칠 수 있는
종류의 버그다.

## 직접 실행한 검증

| 시나리오 | 결과 |
|---|---|
| 데이터 없는 기본 상태 | 스와이퍼·데모 버튼·영상 버튼 전부 `display:none` 확인(회귀 없음) |
| `images` 3장 주입 | 슬라이드 3장·점 3개 정확히 생성 |
| 합성 드래그로 무한 루프 | 마지막→처음(0), 처음→마지막(2) 양방향 순환 확인 |
| 점 클릭 | 해당 슬라이드로 바로 이동 |
| **실제 마우스 드래그**(computer 도구) | 새 탭 깨끗한 상태에서 슬라이드 정상 이동, 콘솔 에러 0건 |
| 영상 버튼 클릭 | 모달 열림, 올바른 src로 자동재생 |
| 닫기 버튼 / backdrop 클릭 / ESC | 세 가지 전부 정상 닫힘, video 엘리먼트 제거 확인 |
| 모달 열린 채 뒤로가기 버튼 | 모달 자동 정리됨(hidden + video 제거) |
| 모달 열린 채 ESC | 모달만 닫히고 phase는 'detail' 유지(도시로 안 튕김) |
| 모달 닫힌 채 ESC | 정상적으로 도시 복귀 |
| `npm run build` | typecheck·빌드 통과 |

## 이번에 다루지 않은 것

- 실제 캡처 이미지 파일, `demoUrl`, `images`, `videoSrc` 값 채우기 — 사용자가 직접
- `statusLabel` 노출 여부 — 계속 미결

## 추가 개편 — 소개 자료(PPT 캡처)를 전체화면 모달로 분리 (사용자 요청)

"PPT 캡처는 회사 자체 디자인이라 작은 박스에 끼우면 이질감 든다"는 판단에 따라,
미디어 박스 안에 있던 스와이퍼를 영상과 같은 전체화면 모달로 옮겼다.

### 변경

- 미디어 박스(1000×772)는 이제 항상 빈 패널 — 실제 제품 사진이 생기기 전까지 손대지 않음
- 버튼 3개까지: **데모 보기**(`demoUrl`) · **홍보 영상 보기**(`videoSrc`) · **소개 자료
  보기**(`images`) — 각각 값 있을 때만 노출
- 영상 모달(`.detail__video-modal*`)을 범용 미디어 모달(`.detail__media-modal*`)로
  이름 변경. 내부에 영상 슬롯과 스와이퍼를 둘 다 두고, 여는 버튼에 따라 하나만 보이게
  전환(`modalKind: "video" | "slides" | null`)
- 스와이퍼 이미지의 `object-fit`을 `cover`→`contain`으로 변경 — 문서 캡처는 잘리면
  안 되므로 레터박스를 감수하고 항상 전체를 보여줌
- `DetailScreenHandle`의 `isVideoModalOpen/closeVideoModal`을
  `isMediaModalOpen/closeMediaModal`로 일반화(`main.ts`의 ESC 우선순위 로직도 함께 갱신)

### 진행 중 발견한 버그 (같이 수정)

스와이퍼 DOM을 미디어 박스에서 모달로 옮기면서 `swiper.hidden = true` 초기화 줄이
누락됐다. 기본값(`hidden` 미설정 시 `false`)이 그대로 남아, 영상 모달을 열면 화면에는
안 보여도 스와이퍼가 동시에 "열린" 상태로 같이 존재했다. `computedStyle().display`로
직접 확인해서 잡았고, 생성 시점에 `swiper.hidden = true`를 명시해 고쳤다.

### 검증

- 데이터 없는 기본 상태: 버튼 3개·스와이퍼·모달 전부 `display:none` (회귀 없음)
- 데모/영상/소개자료 값 채운 Robotics: 버튼 3개 전부 노출
- "소개 자료 보기" 클릭 → 스와이퍼만 `display:block`, 영상 슬롯은 `display:none`
- "홍보 영상 보기" 클릭 → 영상 슬롯만 `display:block`, 스와이퍼는 완전히 `display:none`
  (전환 시 서로 겹치지 않음)
- 새 탭에서 화면 캡처로 최종 시각 확인 — 모달 중앙 정렬, 점 인디케이터, 닫기 버튼 정상
- `npm run build` 통과, 콘솔 에러 0건
