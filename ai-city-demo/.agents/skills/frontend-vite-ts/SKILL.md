---
name: frontend-vite-ts
description: AI CITY 전시 데모의 Vanilla TypeScript와 Vite 코드, 터치 입력, 화면 상태 전환을 구현하거나 수정할 때 사용한다.
---

# AI CITY Frontend

- 프레임워크와 상태관리 라이브러리를 추가하지 않는다.
- 콘텐츠는 `src/data/`, 타입은 `src/types/`, 화면과 상태 전환은 기능별 모듈로 분리한다.
- 전시 화면 상태를 명시적으로 모델링한다. 타이머 콜백이 임의의 화면을 직접 조작하게 두지 않는다.
- 입력은 Pointer Events로 통합하고 `pointerType`에 따라 호버 보조 효과와 터치 동작을 구분한다.
- 호버가 없어도 모든 기능을 사용할 수 있어야 한다.
- 외부 데모 URL을 제외한 폰트, 이미지, 영상은 로컬 에셋으로 제공한다.
- 사용자 제공 문구는 `innerHTML`에 직접 조합하지 않고 가능한 경우 `textContent`를 사용한다.
- UI 변경 후 `npm run typecheck`, `npm run build`, localhost 브라우저 확인을 수행한다.

