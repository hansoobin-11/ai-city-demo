# 게이트 1 — 프로젝트 실행 확인 + 도시 메인 화면 정적 이관 (완료)

이관 기준 원본: `데모 시연 초안.html` (사용자 확정)

## 범위

인트로 없이 야간 점등 완료 상태의 도시 메인 화면을 1920×1080 정적 화면으로 이관하고,
`npm run dev` / `npm run build`가 실제로 동작하는 것까지 확인한다.

## 확정 사항

| 항목 | 결정 |
|---|---|
| 진입 상태 | 인트로 시퀀스 없이 NIGHT(`tods[3]`) 최종 상태로 즉시 진입 |
| 카드 구성 | 신버전 3요소(번호+영역명 / 타이틀 / 한 줄 설명). 구버전 CTA·하단 힌트 제외 |
| 배경 에셋 | `assets/city.png` 그대로 |
| 콘텐츠 원문 | `데모 시연 초안.html`의 `solutions` 정의 |

## 원본에서 옮긴 고정값

배경(원본 `tods[3]`, 실행 중인 원본 DOM에서 대조 확인):

- `transform: scale(1.02)`, `transform-origin: 50% 52%`
- `filter: brightness(1) saturate(1.02) contrast(1)`
- tint `rgba(120,160,255,.08)` / `mix-blend-mode: screen`
- dim opacity `0.24`

점등 상태: `litWin 0.95`, `litStreet 0.9`, `netOn/dotsOn 0.9`, `netDraw 0`, `ambient 0.4`

핫스폿 좌표: HumanCare(308,568) Safety(1004,520) Infrastructure(1404,414)
Robotics(1452,672) SmartRoad(620,812)

## 의도적으로 옮기지 않은 것

- 순차 점등 transition / `stroke-dashoffset` 드로잉 — 인트로 전용. 최종 상태로 고정
- `sbScan` 1회 링 — 인트로 종료 시점의 잔여 애니메이션. 정지 상태에서 opacity 0이라 시각적 차이 없음
- hover 이탈 방지용 투명 브리지 div — hover 로직과 함께 게이트 2에서 추가
- 자동 순환 / 상세 화면 / 미디어 캐러셀 / 영상 / 외부 데모

## 다음 게이트

게이트 2(입력과 자동 카드 순환)에서 해제해야 할 지점:

- `.zone { pointer-events: none }` 해제
- `.zone__card` 열림 상태, `.zone__chevron` / `.zone__glow` 활성 상태
- `PointerEvent.pointerType` 기준 분기 (장치 단위 `maxTouchPoints` 분기 금지)
- 전환 타이머 정리 및 중복 입력 차단
