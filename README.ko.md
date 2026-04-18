<div align="center">
  <img src="https://raw.githubusercontent.com/opellen/scaff/master/assets/scaff-logo-wordmark.webp" alt="Scaff Logo" width="180"/>
  <p><strong>목표 중심의 기민한 AI 하니스. 오직 마크다운.</strong></p>
  <p>나와 AI가 바로 이해하는 현재 — <code>CONTEXT.md</code>, <code>GOAL.md</code>, <code>ROADMAP.md</code></p>

  <p>
    <code>CONTEXT.md</code>를 열면 <b>현재 맥락</b>이 보이고,<br/>
    <code>GOAL.md</code>를 열면 <b>지금 할 일</b>이 보입니다.<br/>
    <code>ROADMAP.md</code>를 열면 <b>현재 큰 그림</b>이 보입니다.
  </p>
  <p><strong>한국어</strong> · <a href="README.md">English</a></p>
</div>

## 무엇인가요?

Scaff는 순수 마크다운 기반의 경량 컨텍스트 스캐폴딩입니다.
CLI, Hook, MCP 없이 — 마크다운 파일만으로 나와 AI가 지금 무엇을 해야 하는지 바로 알 수 있습니다.

## 무엇을 해결하나요?

**맥락 관리가 맥락보다 무겁다.**
기존 프레임워크들은 세션 간 맥락 유지를 CLI, Hook, MCP로 해결합니다.
가벼운 탐색에도 CLI가 실행되고, Hook이 매 동작에 개입하고,
MCP 서버가 설정되어 있으면, 사용하지 않는 세션에서도 도구 정의만으로 토큰을 소모합니다.

**지금 해야 할 것이 보이지 않는다.**
현재 목표가 상태 파일, 태스크 리스트, 설계 문서에 흩어져 있습니다.
파일 하나를 열어서 "지금 할 일"을 바로 확인할 수 없습니다.

Scaff에서는 질문 하나에 파일 하나가 답합니다.
지금 뭘 해야 하지? → `GOAL.md`. 이 프로젝트가 뭐지? → `CONTEXT.md`. 전체 계획은? → `ROADMAP.md`.
다른 곳을 뒤지지 않아도 됩니다. 도구 없이, 런타임 없이.

## 빠른 시작

```bash
npx @opellen/scaff init
```

프로젝트에 마크다운 커맨드가 설치됩니다. 이후 CLI는 필요 없습니다.

```
/scaff:scout          # 세션 시작 — 이것만 기억하세요
```

새 프로젝트든 기존 코드베이스든, scout이 현재 상태를 파악하고 다음 단계를 안내합니다.
기존 코드가 있다면 맥락 설정(`/scaff:context init`)부터, 빈 프로젝트라면 대화를 통해 방향을 잡는 것부터 시작합니다.

대부분의 커맨드는 첫 사용 시 `init`이 자동 실행됩니다 — `/scaff:goal "목표"` 만으로 `init` 타이핑 없이 바로 동작합니다.

### 옵션

```bash
scaff init --docs .planning      # docs/ 대신 다른 경로 사용
scaff init --codebase src        # 코드베이스가 하위 디렉토리에 있을 때 (기본: .)
scaff init --tools cursor        # 특정 도구용으로 설치
scaff init --tools cursor,windsurf  # 여러 도구 동시 설치
scaff init --no-subagent         # 서브에이전트 위임 비활성화 (기본: 활성)
scaff init --root path/to/proj   # 다른 프로젝트 디렉토리에 설치
scaff init --force               # 기존 파일 덮어쓰기
scaff init --dry-run             # 설치할 파일 미리보기
```

> [!NOTE]
> `Claude Code`, `Cursor`, `Windsurf` 외 [20여 개 도구](docs/supported-tools.md)를 지원합니다.
> `Claude Code`에서 검증 완료. 나머지는 어댑터가 준비되어 있지만 실전 테스트 전입니다.

## 문서 구조

```
docs/
├── CONTEXT.md       ← 프로젝트 맥락, 원칙, 워크플로우
├── GOAL.md          ← 현재 목표와 체크리스트
├── CHECKPOINT.md    ← 마지막 세션 진행 상황
├── DESIGN.md        ← 구현 설계 (필요 시)
├── PLAN.md          ← 구현 계획 (복잡한 태스크에서 자동 생성)
├── ROADMAP.md       ← 마일스톤 단위 전체 계획
├── OVERVIEW.md      ← 프로젝트 전체 조망 (필요 시)
└── suspended/       ← 중단된 목표
```

| 문서 | 질문 | 수명 |
|------|------|------|
| `CONTEXT.md` | 이 프로젝트는 뭐고, 어떻게 작업하지? | 프로젝트 전체 |
| `GOAL.md` | 지금 뭘 해야 하지? | 목표 달성까지 |
| `CHECKPOINT.md` | 지난 세션에서 어디까지 했지? | 세션 단위 (덮어쓰기) |
| `DESIGN.md` | 어떻게 구현하지? | 목표 달성까지 |
| `PLAN.md` | 이 태스크를 어떻게 구현하지? | 자동 생성 → 자동 아카이브 |
| `ROADMAP.md` | 큰 그림에서 어디에 있지? | 프로젝트 전체 |
| `OVERVIEW.md` | 이 프로젝트 전체를 한눈에 보면? | 프로젝트 전체 |

`GOAL.md` 하나로 시작해서 `ROADMAP.md`로 확장해도 되고, `ROADMAP.md`에서 큰 그림을 잡고 `GOAL.md`로 내려와도 됩니다. 어느 방향으로 가든 Scaff는 '지금 할 일'을 마크다운 위에 유지합니다.

<details>
<summary>GOAL.md 예시</summary>

```markdown
---
id: session-auth
goal: 인증을 JWT에서 세션 기반으로 전환
status: in-progress
started: 2026-04-04
---

## Tasks

- [x] 1. 세션 스토어 설정
- [ ] 2. 미들웨어 교체 — Step 1/2 (세션 미들웨어 구현 중)
  - [x] 2.1. 세션 미들웨어 구현
  - [ ] 2.2. 기존 JWT 코드 제거
- [ ] 3. DB 스키마 마이그레이션
- [ ] 4. 통합 테스트
```

</details>

<details>
<summary>CONTEXT.md 예시</summary>

```markdown
# Project Overview
Express + PostgreSQL 기반 REST API 서버.
인증은 JWT → 세션 전환 진행 중.

# Architecture
- src/server/ — HTTP 라우팅 (Express)
- src/auth/ — 인증 미들웨어
- src/db/ — DB 접근 계층

# Principles
- 마이그레이션 중 무중단 운영
- 기존 클라이언트 하위호환

# Resources
- DB: PostgreSQL 14, 마이그레이션은 prisma
- 인증: express-session + connect-pg-simple
```

</details>

<details>
<summary>ROADMAP.md 예시</summary>

```markdown
---
id: api-v2
title: API v2 마이그레이션
status: active
started: 2026-03-01
---

- [x] **M1: 인증 전환**
- [ ] **M2: Rate limiting 도입**
- [ ] **M3: API 버저닝**
```

</details>

## 커맨드

| 커맨드 | 설명 |
|--------|------|
| `/scaff:scout` | 세션 시작 — 문서를 읽고 현재 상태를 파악한 뒤 다음 행동을 제안 |
| `/scaff:go` | 목표 실행 — `GOAL.md`의 다음 태스크부터 순서대로 진행 |
| `/scaff:context` | `CONTEXT.md` 생성 및 동기화 |
| `/scaff:goal` | `GOAL.md` 관리 (init, breakdown, checkpoint, suspend, resume, archive) |
| `/scaff:design` | `DESIGN.md` 관리 (init, sync, archive) |
| `/scaff:roadmap` | `ROADMAP.md` 마일스톤 관리 (init, add, archive) |
| `/scaff:overview` | `OVERVIEW.md` 프로젝트 전체 조망 관리 |
| `/scaff:verify` | 목표, 설계, 구현의 정합성 검증 |
| `/scaff:recap` | 세션 마무리 — 논의된 결정을 문서에 반영 |

### 호출 방식

맥락이 명확하면 `/scaff:`를 매번 타이핑하지 않아도 됩니다 — 자연어로도 실행 가능합니다.

| 경로 | `/scaff` 필요? | 예시 |
|------|---------------|------|
| **명시적 호출** | 필요 | `/scaff goal init`, `/scaff:goal init & design init` |
| **직전 제안 확인** | 불필요 | AI: "`/scaff:goal init` 권장" → User: "ok" / "진행해" |
| **연속 맥락 서술** | 불필요 | (goal init 직후) User: "breakdown now" |

맥락이 명확하면 자연어만으로 실행됩니다. `/scaff`는 맥락이 모호할 때 쓰는 명시적 호출 수단입니다.

## 사용 흐름

### 기존 프로젝트에 적용

```
You: /scaff:scout
AI:  코드베이스를 확인했습니다. CONTEXT.md가 없네요.
     `/scaff:context init`으로 프로젝트 맥락을 설정할까요?

You: /scaff:context init
AI:  ✓ docs/CONTEXT.md 생성 완료
     목표를 설정하려면 `/scaff:goal init`

You: /scaff:goal 인증 모듈을 JWT에서 세션 기반으로 전환
AI:  ✓ docs/GOAL.md 생성 완료 (5개 태스크)
     `/scaff:design init` 권장 — 파일 수준 결정이 필요한 구현 태스크입니다.

You: /scaff:design init
AI:  ✓ docs/DESIGN.md 생성 완료
     세션 스토어 선택, 마이그레이션 전략, 롤백 계획 포함

You: /scaff:go
AI:  Task 1/5: 세션 스토어 설정... ✓ done
     Task 2/5: 미들웨어 교체... ✓ done
     Task 3/5에서 DB 스키마 변경이 필요합니다. 진행할까요?
```

### 새 프로젝트

```
You: /scaff:scout 실시간 협업 에디터를 만들기 위한 논의를 시작하자
AI:  (Discovery Mode — 기술 스택, 요구사항, 제약조건을 대화로 탐색)
     ...
     ✓ docs/CONTEXT.md 생성 완료

You: /scaff:roadmap init
AI:  ✓ docs/ROADMAP.md 생성 완료
     ├── M1: 코어 에디터 엔진
     ├── M2: 실시간 동기화 (CRDT)
     └── M3: 배포 및 인프라

You: /scaff:goal
AI:  ROADMAP.md에서 M1을 선택합니다.
     ✓ docs/GOAL.md 생성 완료

You: /scaff:goal breakdown
AI:  7개 서브태스크로 분해 완료

You: /scaff:goal breakdown 3
AI:  Task 3을 4개 서브태스크로 분해 완료 (3.1–3.4)

You: /scaff:go
AI:  Task 1/7: 프로젝트 초기화... ✓ done
     Task 2/7: 에디터 코어 구현... ✓ done
     여러 태스크를 완료했습니다. `/scaff:goal checkpoint`로 진행 상황을 저장할까요?

You: /scaff:goal checkpoint
AI:  ✓ docs/CHECKPOINT.md 저장 완료
     (세션이 끊겨도 다음 scout에서 이어서 시작합니다)

     ... (다음 세션에서 이어서 작업, 모든 태스크 완료)

You: /scaff:goal archive
AI:  ✓ docs/archive/goals/2026-04-04-editor-core/에 4개 파일 아카이브
     (GOAL.md, DESIGN.md, PLAN.md, CHECKPOINT.md)
     ROADMAP.md에서 M1을 done으로 표시했습니다.
```

### 이어서 작업

```
You: /scaff:scout
AI:  CONTEXT.md ✓ | GOAL.md ✓ (3/5 완료)
     이전 세션에서 API 엔드포인트 작업 중이었습니다.
     `/scaff:go`로 이어서 진행할까요?
```

## **틈새**에서

> **무거운 워크플로우가 항상 필요하지는 않았습니다.**
>
> 작은 수정을 하려는 거 뿐인데 이게 다 필요한가라는 의문이 들었습니다.
> 질문 폭탄을 수반하는 완벽한 논의와 물 샐 틈없는 사양이 항상 필요하지는 않았습니다.
> 완벽한 절차는 매력적입니다. 하지만 AI는 점점 더 많은 것을 흡수해가고 있고,
> 어쩌면 우리가 기대고 싶은 그 다양한 안전장치들이 많은 경우에 있어서 과잉적인 족쇄가 될 수도 있겠다고 생각했습니다.
> 하지만 맥락 유지는 필요했습니다.
>
> **현재에 집중하고 싶었습니다.**
>
> 사양과 태스크에 묻힌 '현재 목표'를 밖으로 꺼내고 싶었습니다.
> 나와 AI가 바로 이해하고 집중할 수 있는 '현재'를 만들고 싶었습니다.
> 작은 것에서 시작해 올라가도, 큰 그림에서 내려와도 —
> 어느 방향이든 '지금 할 일'이 바로 보이는 구조를 원했습니다.
>
> **사이를 채우고 싶었습니다.**
>
> 저는 OpenSpec으로 시작해서 Scaff로 건너가기도 하고 그 반대로 하기도 합니다.
> 때로는 Superpowers를 장착하기도 합니다.
> 잘 하는 것들은 여전히 잘 활용하면 됩니다.
> 완전함과 강력함의 앞에, 또는 그 사이에 놓일 수 있는 어떤 무엇이 필요했습니다.

## Notation

Scaff의 커맨드와 스킬은 일반 산문이 아닌, 간결한 마크다운 표기법 — `## Constraints`, `(condition) => action` 디스패치 룰, `for each`, `loop until` — 으로 작성되어 있습니다. 이러한 표기법은 LLM이 절차적 텍스트보다 선언적 규칙을 더 안정적으로 따른다는 연구와 프롬프트 엔지니어링 결과를 바탕으로 설계되었습니다. 그 결과 템플릿은 더 짧고, 토큰을 덜 쓰며, LLM이 규칙을 더 안정적으로 따릅니다.

커맨드나 스킬 템플릿을 수정한다면 먼저 [docs/NOTATION.md](docs/NOTATION.md)를 읽어주세요 — 구문 레퍼런스와 우선순위 규칙이 정리되어 있습니다. 표기법이 왜 이런 형태인지, 어떤 연구 근거가 있는지는 [docs/notation-guide.md](docs/notation-guide.md)를 참고하세요.

## 기여하기

버그 수정, 문서 개선 — PR 환영합니다.

### 개발 환경

```bash
git clone https://github.com/opellen/scaff.git
cd scaff
npm install
npm run build
npm test
```

## 라이선스

MIT 라이선스 — 자세한 내용은 [LICENSE](LICENSE)를 참고하세요.
