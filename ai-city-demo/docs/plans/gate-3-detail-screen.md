# 게이트 3 — 공통 상세 화면 (완료)

## 확정 사항

- 텍스트 콘텐츠는 `solutions.ts`의 기존 검증된 값을 바로 사용 (플레이스홀더 아님)
- 미디어 영역은 `detail-*.png`가 아직 이관되지 않아 빈 패널로 둠 (게이트 4)
- `statusLabel` 노출 여부는 계속 미결 — 게이트 4에서 결정

## 구현

### 새 모듈

- `src/lib/scene.ts` — phase 상태 기계(city/zoom/detail/zoomback). `data-phase`/`data-solution`
  속성을 scene 루트에 반영해 CSS가 배경 확대·레이어 노출을 전담
- `src/screens/scene-backdrop.ts` — 도시·상세가 공유하는 배경 4겹 + SVG 오버레이 (게이트 1의
  `city.ts` 안에 있던 것을 분리)
- `src/screens/detail.ts` — 공통 상세 화면 DOM. 뒤로가기/로고/미디어 placeholder/콘텐츠(배지·
  상품명·eyebrow·헤드라인·설명·피처 3단)
- `src/styles/detail.css` — 상세 화면 레이아웃, 원본 좌표 그대로

### 원본과 의도적으로 다르게 만든 지점

원본은 클릭 후 520ms 동안 phase가 여전히 'city'로 남아있어, 그 사이 같은 핫스폿을
다시 클릭하면 애니메이션이 중복 시작될 수 있는 여지가 있었다(원본 자체의 잠재
결함). 이 구현은 진입 신호를 받는 즉시 phase를 'zoom'으로 바꿔 그 여지를 없앴다.
총 도시→상세 완료 시간(2100ms)은 원본과 동일하게 맞췄다.

### 입력 가드

- `city-interactions.ts`에 `setEnabled()` 추가 — scene이 city phase가 아니면 호버·탭·자동
  순환을 JS 레벨에서 완전히 차단(CSS `pointer-events:none`과 이중으로 막음)
- 뒤로가기는 `back()` 가드로 zoomback/city 상태에서 중복 실행 무시
- ESC 키로도 복귀 가능(원본 화면 안내 문구 "ESC 또는 좌측 상단 버튼으로…"와 일치).
  터치 접근성을 대체하는 게 아니라 보조 수단.

## 직접 실행한 검증 (합성 PointerEvent + 콘솔 확인)

| 시나리오 | 결과 |
|---|---|
| 마우스 클릭 → 진입 | 즉시 phase='zoom', 2.1s 후 phase='detail', 콘텐츠 정확히 바인딩 |
| 터치 2탭 → 진입 | 동일하게 정상 동작 |
| zoom/detail 중 다른 핫스폿 탭 | 무시됨 (interactionsEnabled=false로 JS 레벨 차단 확인) |
| 뒤로가기 클릭 | zoomback → 1.7s 후 city 복귀, 핫스폿 재활성화(`pointer-events:auto`) 확인 |
| ESC 키 | zoom 단계에서도 back() 정상 작동 |
| 뒤로가기 5연타 | zoomback 1회만 발생, 타이머 중첩 없음 |
| 5개 존 전체 | 가장 긴 헤드라인(Smart Road, Infrastructure)도 레이아웃 안 깨짐 |
| `npm run build` | typecheck·빌드 통과 |
| 콘솔 | 에러 0건 |

## 다음 게이트로 이월

- 실제 상세 이미지(`detail-*.png` 5종) 연결, 미디어 캐러셀(스와이프/좌우 버튼/점 인디케이터)
- 영상, 외부 데모 버튼 (자료 확정 전까지 조건부 비노출)
- `statusLabel` 노출 여부 결정
- 콘텐츠 텍스트 최종 확인(문구 변경 필요 시)
