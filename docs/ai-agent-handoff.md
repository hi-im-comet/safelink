# CoolLink AI Agent Handoff

담당: 강신우  
목적: 현재 CoolLink AI 프론트엔드 MVP의 LLM mock 기능을 Bedrock 기반 AI 에이전트로 구현하기 위한 작업 명세입니다.

참조 프론트 파일:

- `lib/llm/templates.ts`: 현재 LLM mock 템플릿
- `lib/api/index.ts`: `generatePhoneScript`, `generateVisitChecklist`, `generateActionPlan`, `generateDailyReport`, `generateGuardianMessage`
- `lib/mock/metrics.ts`: AI 절감률 패널 baseline
- `components/LlmFloatingBadge.tsx`: AI 절감률 UI
- `components/admin/DocGenerator.tsx`: 문서 생성 UI
- `components/admin/DaySummary.tsx`: 오늘 운영 브리핑 UI
- `app/user/profile/page.tsx`: 생활 메모 분석 UI
- `components/user/PhotoUpload.tsx`: 사진 분석 준비 UI

## 1. AI 사용 원칙

- 위험도 계산에는 LLM을 사용하지 않는다.
- 위험도 계산은 백엔드 코드가 한다.
- LLM은 문장 생성이 필요한 곳에만 사용한다.
- 사용 대상:
  - 사용자 맞춤 행동계획
  - 복지사 전화 스크립트
  - 방문 체크리스트
  - 오늘 운영 브리핑
  - 생활 메모 요약/구조화
  - 보호자 안내 문안
- 이름, 전화번호, 상세주소, 생년월일 전체, 병원명, 병원 연락처, 복용약 상세명, 보호자 이름/연락처는 LLM에 전달하지 않는다.
- 같은 조건의 문서는 캐시를 우선 사용한다.
- 템플릿으로 가능한 문서는 템플릿을 먼저 사용한다.
- 응급 상황 표현은 “119에 바로 전화하기”, “비상정보 복사”, “보호자에게 함께 알림” 정도로 제한한다.
- 자동 신고, 자동 전송, 즉시 출동 같은 표현은 쓰지 않는다.

## 2. AI 기능 단위 작업 리스트

### 2.1 Bedrock 호출 모듈

우선순위: P1

역할:

- Bedrock Runtime 호출 wrapper
- prompt version 관리
- model config 관리
- timeout/retry
- fallback template
- token/latency/error logging

권장 interface:

```ts
type AiGenerationType =
  | "action_plan"
  | "phone_script"
  | "visit_checklist"
  | "daily_briefing"
  | "life_memo_analysis"
  | "guardian_message";

interface GenerateInput {
  type: AiGenerationType;
  promptVersion: string;
  modelId: string;
  sanitizedInput: Record<string, unknown>;
  cacheKey?: string;
}

interface GenerateOutput {
  type: AiGenerationType;
  title: string;
  output: string | Record<string, unknown>;
  outputTokens: number;
  cached: boolean;
  modelId: string;
  promptVersion: string;
  latencyMs: number;
}
```

### 2.2 사용자 맞춤 행동계획 생성

우선순위: P2

사용 화면:

- `/user`

입력:

- 날씨 정보
- 주거환경 요약
- 생활패턴
- 더위 민감도
- 냉방 사용 성향
- 건강/취약도 요약
- 위험도 점수
- 위험 요인

출력:

- 오전 행동
- 점심 전 행동
- 오후 피크 행동
- 저녁 행동
- 밤 행동
- 예상 효과

MVP fallback:

- 현재 `lib/risk/profileRisk.ts`의 `buildPlan` 규칙 기반 결과를 fallback으로 사용 가능

### 2.3 복지사 전화 스크립트 생성

우선순위: P1

사용 화면:

- `/admin/households/[id]`

입력:

- 위험도 등급
- 주요 위험 요인
- 도움 요청 사유
- 추천 조치
- 개인정보 제거된 가구 요약

출력:

- 복지사가 바로 읽을 수 있는 전화 문안
- 확인 질문
- 필요한 경우 안내 문구

현재 mock:

- `lib/llm/templates.ts`의 `buildPhoneScript`

### 2.4 방문 체크리스트 생성

우선순위: P1

사용 화면:

- `/admin/households/[id]`

입력:

- 위험 요인
- 주거환경
- 냉방 상태
- 도움 요청 사유
- 추천 조치

출력:

- 방문 전 확인
- 현장 확인
- 냉방/건강 확인
- 지원 필요 여부
- 후속 조치

현재 mock:

- `lib/llm/templates.ts`의 `buildVisitChecklist`

### 2.5 오늘 운영 브리핑 문안 생성

우선순위: P2

사용 화면:

- `/admin`

입력:

- 오늘 날씨
- 전체 관리 가구 수
- 고위험 가구 수
- 도움 요청 수
- 전화 필요 수
- 방문 필요 수
- 지원 검토 수

출력:

- 오늘 운영자가 읽을 수 있는 짧은 브리핑
- 운영 우선순위
- 주의할 점

현재 mock:

- `components/admin/DaySummary.tsx`

### 2.6 생활 메모 자연어 분석

우선순위: P2

사용 화면:

- `/user/profile`

입력:

- 사용자가 자유롭게 입력한 생활 메모

출력:

- 생활 리듬
- 더위 민감도 추정
- 냉방 성향 추정
- 주요 위험 요인
- 행동계획 반영 포인트

주의:

- 이름, 전화번호, 상세주소가 들어오면 제거한다.
- 분석 결과는 위험도 계산에 직접 넣기보다 profile field 추천값/행동계획 hint로 사용한다.

### 2.7 사진 분석 연동 준비

우선순위: P3

사용 화면:

- `/user/profile`

입력:

- 창문 사진
- 창밖 전경
- 실내 창 주변

출력:

- 창 크기
- 창문 개수
- 앞 건물 가림
- 차광 상태
- 환기 가능성
- 예상 과열 시간대

MVP 범위:

- 업로드 URL 발급/metadata 저장 연동 준비
- Vision 모델 호출 interface 정의
- 실제 vision 분석은 후순위 가능

### 2.8 LLM 캐시 처리

우선순위: P1

cache key 구성:

- generation type
- prompt version
- model id
- risk grade
- normalized risk factors
- recommended actions
- weather bucket
- sanitized input hash

정책:

- cache hit 시 Bedrock 호출하지 않는다.
- cache hit도 `ai_generation_logs.cached = true`로 기록한다.
- cache hit count와 last hit time을 업데이트한다.

### 2.9 LLM 호출량 기록

우선순위: P1

기록 항목:

- type
- userId nullable
- householdId nullable
- promptVersion
- modelId
- inputHash
- outputTokens
- cached
- latencyMs
- status
- errorCode
- createdAt

사용 화면:

- AI 절감률 플로팅 패널

### 2.10 평균 출력 토큰 기록

우선순위: P2

계산:

```ts
avgTokens = sum(outputTokens) / generationCount
```

기간:

- today
- 7d
- all

### 2.11 LLM 미사용 처리율 계산

우선순위: P2

현재 프론트 mock:

```ts
noLlmRate = (analyzed - llmCalls) / analyzed * 100
```

권장 실제 계산:

- `analyzed`: 위험도 계산, 우선순위 정렬, 날씨 조회, 상태 저장 등 전체 처리 건수
- `llmCalls`: 실제 Bedrock 호출 건수
- `cacheReuse`: 캐시 재사용 건수
- cache hit는 LLM 호출로 세지 않고 cacheReuse로 센다.

### 2.12 개인정보 필터링

우선순위: P1

LLM 전달 금지:

- 이름
- 전화번호
- 상세주소
- 생년월일 전체
- 병원명
- 병원 연락처
- 복용약 상세명
- 보호자 이름
- 보호자 연락처

대체값:

- 연령대
- 65세 이상 여부
- 기저질환 있음/없음
- 복용약 있음/없음
- 장애 있음/없음
- 이동 불편 여부
- 보호자 연락 가능/어려움
- 행정동 수준 지역

권장 sanitizer output:

```json
{
  "ageBand": "70대",
  "isElderly": true,
  "hasChronicDisease": true,
  "hasDisability": false,
  "hasMobilityIssue": true,
  "hasMedication": true,
  "guardianReach": "가능",
  "region": "햇살동"
}
```

## 3. AI API 초안

백엔드 담당자와 맞춰야 할 endpoint입니다.

### 3.1 전화 스크립트 생성

API:

- `POST /api/ai/phone-script`

Request:

```json
{
  "householdId": "H-001",
  "riskGrade": "urgent",
  "riskScore": 94,
  "riskFactors": ["독거 고령자", "남서향 노후주택", "냉방비 부담 높음"],
  "helpReasons": ["냉방비 지원 상담 요청"],
  "recommendedActions": ["즉시 전화 확인", "무더위쉼터 안내"],
  "sanitizedHousehold": {
    "ageBand": "70대",
    "alone": true,
    "conditionSummary": "기저질환 있음",
    "housing": "남서향 단독주택",
    "cooling": "에어컨 없음, 냉방비 부담 높음"
  }
}
```

Response:

```json
{
  "title": "전화 스크립트",
  "body": "안녕하세요. 오늘 폭염 위험이 높아 안부 확인차 연락드렸습니다...",
  "tokens": 218,
  "cached": false,
  "modelId": "bedrock-model-id",
  "promptVersion": "phone_script_v1"
}
```

### 3.2 방문 체크리스트 생성

API:

- `POST /api/ai/visit-checklist`

Request:

```json
{
  "householdId": "H-001",
  "riskFactors": ["독거 고령자", "냉방비 부담 높음"],
  "housingSummary": "남서향 단독주택, 노후, 에어컨 없음",
  "coolingSummary": "선풍기 여부 확인 필요, 냉방비 부담 높음",
  "helpReasons": ["방문 확인 요청"],
  "recommendedActions": ["방문 배정", "냉방비 지원 상담"]
}
```

Response:

```json
{
  "title": "방문 체크리스트",
  "body": "□ 실내 온도와 환기 상태 확인\n□ 에어컨/선풍기 작동 여부 확인",
  "tokens": 180,
  "cached": false,
  "modelId": "bedrock-model-id",
  "promptVersion": "visit_checklist_v1"
}
```

### 3.3 사용자 맞춤 행동계획 생성

API:

- `POST /api/ai/action-plan`

Request:

```json
{
  "weather": {
    "highTemp": 37,
    "feelsLike": 40,
    "humidity": 72,
    "alert": "폭염경보",
    "nightHeat": true
  },
  "housingSummary": "남서향 원룸, 창문 큼, 환기 보통",
  "lifestyleSummary": "오후 오래 재택, 낮 활동",
  "sensitivityAndCoolingSummary": "더위 민감도 높음, 절약 우선, 에어컨 1대",
  "healthSummary": "기저질환 없음, 보호자 연락 가능",
  "riskScore": 55,
  "riskGrade": "guide",
  "riskFactors": ["체감 40℃", "남서향", "오후 재택", "냉방비 보통"]
}
```

Response:

```json
{
  "title": "오늘의 행동계획",
  "plan": {
    "morning": ["창문을 열어 환기를 마치세요."],
    "beforeNoon": ["커튼·블라인드를 닫아 직사광을 막으세요."],
    "peakAfternoon": ["짧게 사전 냉방하고 선풍기와 함께 쓰세요."],
    "evening": ["실내 온도가 내려가면 다시 환기하세요."],
    "night": ["열대야 대비 취침 전 짧게 냉방하세요."],
    "expectedEffects": ["실내 과열 시간 감소", "전기요금 부담 감소"]
  },
  "tokens": 240,
  "cached": true
}
```

### 3.4 오늘 운영 브리핑 생성

API:

- `POST /api/ai/daily-briefing`

Request:

```json
{
  "weatherSummary": "폭염경보, 낮 최고 37도, 체감 40도, 습도 72%",
  "totalCount": 17,
  "highRiskCount": 4,
  "helpRequestCount": 2,
  "callNeededCount": 5,
  "visitNeededCount": 1,
  "supportNeededCount": 5
}
```

Response:

```json
{
  "briefing": "오늘은 체감온도 40도의 폭염경보가 이어져 고위험 가구를 먼저 확인해야 합니다...",
  "priorities": ["응급 확인 필요 가구 즉시 확인", "고위험 독거 가구 전화 확인", "방문 필요 가구 담당자 배정"],
  "cautions": ["최근 요청만이 아니라 위험도와 응급성을 함께 보세요."],
  "tokens": 170,
  "cached": false
}
```

### 3.5 생활 메모 분석

API:

- `POST /api/ai/life-memo/analyze`

Request:

```json
{
  "lifeMemo": "저는 밤에 일하고 오전에 자요. 낮에는 집에 있는 시간이 많고, 전기요금 때문에 에어컨을 오래 틀기 부담돼요."
}
```

Response:

```json
{
  "lifeRhythm": "야간 활동 / 오전 취침 추정",
  "heatSensitivity": "높음 추정",
  "coolingBehavior": "절약 우선",
  "riskFactors": ["낮 시간 실내 체류", "냉방 사용 제한"],
  "planHints": ["오전 취침 전 짧은 냉방", "점심 전 차광", "오후 피크 공공 실내공간 이용"],
  "tokens": 120,
  "cached": false
}
```

## 4. 프롬프트 초안

공통 시스템 지침:

```text
당신은 폭염 취약가구 지원을 돕는 공공 돌봄 보조 AI입니다.
위험도 점수는 이미 코드 기반 규칙 엔진이 계산했습니다. 점수를 재계산하지 마세요.
입력에 이름, 전화번호, 상세주소 같은 개인정보가 없어야 하며, 출력에도 개인정보를 만들거나 추정하지 마세요.
문장은 짧고 현장에서 바로 읽거나 실행할 수 있게 작성하세요.
응급 증상이 있으면 앱 접수보다 119 직접 연락을 안내하세요.
```

### 4.1 사용자 맞춤 행동계획 생성

```text
다음 정보를 바탕으로 오늘의 폭염 행동계획을 생성하세요.

[날씨]
- 최고기온: {{highTemp}}℃
- 체감온도: {{feelsLike}}℃
- 습도: {{humidity}}%
- 특보: {{alert}}
- 열대야: {{nightHeat}}

[주거환경]
{{housingSummary}}

[생활패턴]
{{lifestyleSummary}}

[더위 민감도/냉방 성향]
{{sensitivityAndCoolingSummary}}

[건강/취약도 요약]
{{healthSummary}}

[위험도]
- 점수: {{riskScore}}
- 등급: {{riskGrade}}
- 주요 위험 요인: {{riskFactors}}

요구사항:
- 오전, 점심 전, 오후 피크, 저녁, 밤으로 나누세요.
- 각 시간대는 1~2개의 실행 가능한 행동만 제안하세요.
- 냉방비 부담이 있으면 짧은 사전 냉방, 생활공간 중심 냉방, 공공 실내공간 이용을 안내하세요.
- 응급 신고처럼 보이는 표현을 쓰지 마세요.
- 출력은 JSON으로만 작성하세요.

출력 형식:
{
  "morning": ["..."],
  "beforeNoon": ["..."],
  "peakAfternoon": ["..."],
  "evening": ["..."],
  "night": ["..."],
  "expectedEffects": ["..."]
}
```

### 4.2 전화 스크립트 생성

```text
복지사가 폭염 안부 확인 전화를 할 때 바로 읽을 수 있는 문안을 작성하세요.

[가구 요약 - 개인정보 제거]
{{householdSummary}}

[위험도]
- 등급: {{riskGrade}}
- 점수: {{riskScore}}

[주요 위험 요인]
{{riskFactors}}

[도움 요청 사유]
{{helpReasons}}

[추천 조치]
{{recommendedActions}}

요구사항:
- 첫 문장은 안부 확인 목적을 부드럽게 밝히세요.
- 에어컨/선풍기 사용 여부, 실내 더위, 냉방비 부담, 어지러움/두통/메스꺼움 여부를 확인하세요.
- 필요한 경우 무더위쉼터, 냉방 지원, 방문 확인을 안내하세요.
- 개인정보를 묻거나 출력하지 마세요.
- 출력은 JSON으로만 작성하세요.

출력 형식:
{
  "script": "복지사가 읽을 전화 문안",
  "questions": ["확인 질문 1", "확인 질문 2"],
  "guidance": ["필요시 안내 문구 1", "필요시 안내 문구 2"]
}
```

### 4.3 방문 체크리스트 생성

```text
생활지원사가 폭염 취약가구를 방문하기 전과 현장에서 사용할 체크리스트를 작성하세요.

[위험 요인]
{{riskFactors}}

[주거환경]
{{housingSummary}}

[냉방 상태]
{{coolingSummary}}

[도움 요청 사유]
{{helpReasons}}

[추천 조치]
{{recommendedActions}}

요구사항:
- 방문 전 확인, 현장 확인, 냉방/건강 확인, 지원 필요 여부, 후속 조치로 나누세요.
- 각 항목은 체크박스로 표시할 수 있게 짧은 문장으로 작성하세요.
- 응급 증상이 확인되면 119에 직접 연락하도록 안내하는 항목을 포함하세요.
- 출력은 JSON으로만 작성하세요.

출력 형식:
{
  "beforeVisit": ["..."],
  "onSite": ["..."],
  "coolingAndHealth": ["..."],
  "supportNeeds": ["..."],
  "followUp": ["..."]
}
```

### 4.4 운영 브리핑 생성

```text
오늘 폭염 대응을 시작하는 관리자에게 보여줄 짧은 운영 브리핑을 작성하세요.

[오늘 날씨]
{{weatherSummary}}

[운영 지표]
- 전체 관리 가구 수: {{totalCount}}
- 고위험 가구 수: {{highRiskCount}}
- 도움 요청 수: {{helpRequestCount}}
- 전화 필요 수: {{callNeededCount}}
- 방문 필요 수: {{visitNeededCount}}
- 지원 검토 수: {{supportNeededCount}}

요구사항:
- 3~4문장 이내로 작성하세요.
- 응급 확인 필요, 고위험, 방문 필요 순서로 우선순위를 제안하세요.
- 최근 요청만으로 저위험 가구가 무조건 최우선이라는 표현은 피하세요.
- 출력은 JSON으로만 작성하세요.

출력 형식:
{
  "briefing": "...",
  "priorities": ["...", "...", "..."],
  "cautions": ["..."]
}
```

### 4.5 생활 메모 분석

```text
사용자가 입력한 생활 메모를 폭염 위험도와 행동계획에 반영하기 쉬운 구조로 요약하세요.

[생활 메모]
{{lifeMemo}}

요구사항:
- 이름, 전화번호, 상세주소, 병원명 등 직접 식별정보가 있으면 출력하지 마세요.
- 사용자의 생활 리듬, 더위 민감도, 냉방 성향, 주요 위험 요인, 행동계획 반영 포인트만 추출하세요.
- 불확실하면 "추정"이라고 표시하세요.
- 출력은 JSON으로만 작성하세요.

출력 형식:
{
  "lifeRhythm": "...",
  "heatSensitivity": "...",
  "coolingBehavior": "...",
  "riskFactors": ["..."],
  "planHints": ["..."]
}
```

## 5. AI용 DB/로그 테이블

### `ai_generation_logs`

- `id`
- `type`: phone_script/visit_checklist/action_plan/report/guardian_msg/life_memo_analysis
- `user_id`
- `household_id`
- `prompt_version`
- `model_id`
- `input_hash`
- `output_tokens`
- `cached`
- `latency_ms`
- `status`: success/error/cache_hit
- `error_code`
- `created_at`

### `ai_cache`

- `id`
- `cache_key`
- `type`
- `prompt_version`
- `model_id`
- `input_hash`
- `sanitized_input` JSON
- `output` JSON/text
- `output_tokens`
- `hit_count`
- `created_at`
- `last_hit_at`
- `expires_at`

## 6. 강신우 TODO

### 1순위

- Bedrock 호출 모듈
- 개인정보 sanitizer
- 전화 스크립트 생성
- 방문 체크리스트 생성
- LLM 캐시 처리
- LLM 호출 로그 기록

### 2순위

- 오늘 운영 브리핑 문안 생성
- 생활 메모 자연어 분석
- 평균 출력 토큰 계산
- LLM 미사용 처리율 계산 지원

### 3순위

- 사용자 맞춤 행동계획 생성 고도화
- 사진 분석 연동 interface
- prompt versioning
- A/B prompt 관리

### Bedrock 모듈

- `generate(type, sanitizedInput, options)` 형태의 공통 함수 권장
- 응답은 `{ title, output, tokens, cached, modelId, promptVersion }`

### 프롬프트

- 이 문서 4장의 5개 프롬프트 초안을 v0.1로 사용
- 출력은 JSON 우선

### 캐시/로그

- `ai_cache`, `ai_generation_logs` 사용
- cache hit도 호출 절감 지표에 반영

### 개인정보 필터링

- 직접 식별정보 제거 후 Bedrock 호출
- 비식별 요약만 prompt 입력에 포함
