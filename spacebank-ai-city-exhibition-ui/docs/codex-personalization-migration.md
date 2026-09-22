# Claude 개인화 자료의 Codex 이식 기준

## 이번에 이식한 항목

- 반복 사용 가치가 높은 개인 규칙을 프로젝트 `AGENTS.md`로 압축했다.
- `handoff`, `retro`, `prototype`을 프로젝트 로컬 Codex 스킬로 변환했다.
- Claude의 `disable-model-invocation: true`는 각 스킬의 `agents/openai.yaml`에서 `allow_implicit_invocation: false`로 옮겼다.
- `CLAUDE.md`, `.claude/rules`, Claude 권한 모드 표현은 Codex의 `AGENTS.md`, `.codex/skills`, 승인 경계 표현으로 바꿨다.

## 바로 이식하지 않은 항목

- `git-guardrails-claude-code`: Claude PreToolUse 훅에 의존하므로 그대로는 작동하지 않는다. Codex 기본 안전 규칙과 중복되며 별도 검증 없이 설치하지 않는다.
- `dispatching-parallel-agents`, `subagent-driven-development`, `using-git-worktrees`: Codex의 작업·에이전트·worktree 기능과 중복되므로 원문을 복사하지 않는다.
- 프로젝트별 backend, DB, Docker 스킬: 이번 전시 UI 프로젝트와 직접 관련이 없어 제외했다.
- 외부 저장소의 범용 스킬: 현재 Codex에 이미 제공되는 문서·프레젠테이션·테스트 기능과 중복 여부를 확인한 뒤 필요할 때만 개별 이식한다.

## 이후 선택적으로 이식할 수 있는 항목

- `webapp-testing`: 전시 UI의 실제 브라우저 검증 절차에 맞게 Playwright 중심으로 좁혀 변환할 수 있다.
- `verification-before-completion`: `AGENTS.md`의 검증 규칙보다 더 구체적인 체크리스트가 필요할 때 프로젝트 스킬로 추가할 수 있다.
- `writing-plans`, `executing-plans`: 프로젝트 규모가 커져 장기 계획 파일을 반복적으로 사용할 때 추가하는 편이 낫다.

원본 아카이브는 수정하지 않고 `C:\Users\한수빈(DX)\workspace\personal`에 그대로 보존한다.
