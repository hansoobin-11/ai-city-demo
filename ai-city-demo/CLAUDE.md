# CLAUDE.md — AI CITY 전시 데모 프로젝트 규칙

## 프로젝트 목표

1920×1080 포터블 터치 모니터에서 안정적으로 실행되는 SPACEBANK AI CITY 전시 데모를 만든다. 기존 `.dc.html`은 디자인 참고자료이며 최종 실행 기반으로 사용하지 않는다.

## 구현 범위

- AI HUMAN CARE
- AI SAFETY
- AI INFRASTRUCTURE
- AI ROBOTICS
- AI SMART ROAD

도시혁신대상 PPT는 기술 방향 참고용이다. 시상, 정책, 시장 규모, 경쟁사 비교, 로드맵은 사용자가 요청하지 않는 한 UI에 넣지 않는다.

## 기술 스택

- Vanilla TypeScript + Vite
- React, Vue, 상태관리 라이브러리 도입 금지
- 로컬 에셋 우선, 외부 네트워크는 명시적 데모 URL에만 사용
- 마우스·터치·펜은 Pointer Events로 처리
- 전시 실행은 localhost 기반

## 작업 규칙

@.claude/rules/project-workflow.md

@.claude/rules/content-integrity.md

@.claude/rules/touch-kiosk-ui.md

## 기준 문서

- 요구사항: `docs/specs/requirements.md`
- 구현 계획: `docs/plans/`
- 원본 자료 위치: `docs/references/source-materials.md`

애매한 UI 요청은 기존 데모와 캡처를 먼저 대조한다. 두 가지 이상으로 해석되면 구현 전에 질문한다.

