# 상세 화면 — 외부 데모 버튼 + 홍보 영상 재생 (사용자 요청, 게이트 5 선반영)

요구사항 게이트 순서(3→4→5)를 앞질러, 사용자가 직접 요청한 범위만 먼저 구현했다.
게이트 4(이미지·`statusLabel` 결정)는 아직 별개로 남아 있다.

## 확인한 근거

`docs/references/source-materials.md`의 솔루션 자료 폴더 기준:

| 영역 | 데모 접속 정보 | 홍보 영상 |
|---|---|---|
| Human Care | `데모 접속 정보.txt` 있음 | 없음 |
| Safety | 없음 | 없음 |
| Infrastructure(산림유전자원) | 없음 | `유전자원_demo.mp4` |
| Robotics(RoboViewX) | 없음(단, statusLabel="데모 가능") | `RoboViewX_v2.mp4` |
| Smart Road | 없음 | 없음 |

## 구현

- `SolutionContent.demoUrl` / `.videoSrc`(게이트 1부터 optional로 존재, 지금은 전부 비어 있음)에
  값이 있을 때만 UI가 나타난다. **특정 영역을 하드코딩해서 막지 않았다** — 어느 영역이든
  나중에 값을 채우면 그대로 동작한다.
- 데모 버튼: `.detail__cta` — 설명 문구 아래, 코랄 알약 버튼. `target="_blank" rel="noopener"`로
  새 탭에서 연다.
- 영상 재생: 좌측 미디어 박스 안에 재생 아이콘 프롬프트(`.detail__media-prompt`)가 뜬다.
  탭하면 그 자리에서 `<video controls autoplay playsInline>`으로 교체되어 재생한다.
  상세 화면을 나갔다 다시 들어오면 초기화되어 프롬프트로 돌아간다(재생 중이던 영상이
  남아있지 않음).

## 사용자가 채워야 할 것

- `src/data/solutions.ts`의 해당 항목에 `demoUrl: "https://..."`, `videoSrc: "/assets/videos/robotics.mp4"`
  형태로 값 추가
- 영상 파일은 `public/assets/videos/`(신규 폴더, 원하는 경로로 변경 가능)에 직접 복사

## 검증

합성 이벤트로 값을 임시 주입해 확인(실제 파일은 변경하지 않음):
- 값이 비어 있으면 버튼·프롬프트 전부 안 보임 (회귀 없음)
- `demoUrl` 채우면 버튼이 정확한 href/target으로 나타남
- `videoSrc` 채우면 프롬프트가 나타나고, 탭하면 정확한 속성의 `<video>`로 교체
- 상세 화면 재진입 시 비디오 상태 초기화됨
- 콘솔 에러 0건, `npm run build` 통과

## 확인이 필요한 점

- 데모 버튼을 새 탭(`target="_blank"`)으로 열도록 만들었다. 실제 키오스크 브라우저가
  탭 바를 숨기는 `--kiosk` 모드라면 새 탭이 눈에 안 띌 수 있다 — 포터블 모니터에서
  실제로 열어보고, 같은 탭에서 이동하는 게 나으면 알려달라(한 줄만 바꾸면 됨).
