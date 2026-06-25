# CoolLink AI Backend/AI Handoff

이 문서는 현재 Next.js 프론트엔드 MVP의 mock data, mock state, type, service 함수를 기준으로 백엔드 담당자와 AI 에이전트 담당자가 실제 구현할 계약을 정리한 작업 명세입니다.

참조 소스:

- `lib/types.ts`: 공통 타입
- `lib/store/AppState.tsx`: 현재 client mock state
- `lib/api/index.ts`: 향후 API 연결 지점
- `lib/risk/score.ts`: 관리자 가구 위험도/우선순위 mock 로직
- `lib/risk/profileRisk.ts`: 사용자 홈 위험도 mock 로직
- `lib/risk/adminFilters.ts`: 관리자 필터/KPI 계산
- `lib/mock/user.ts`, `lib/mock/households.ts`, `lib/mock/help.ts`, `lib/mock/weather.ts`, `lib/mock/metrics.ts`
- `lib/llm/templates.ts`: LLM 생성 mock 템플릿

## 1. 프론트 기능 흐름 요약

### 1.1 `/user` 사용자 홈

필요 데이터:

- 오늘 날짜/갱신 시각/지역: `TODAY_LABEL`, `UPDATED_LABEL`, `LOCATION`
- 오늘 날씨: `highTemp`, `feelsLike`, `humidity`, `alert`, `nightHeat`, `score`, `summary`
- 사용자 모드: `caregiverMode`
- 주거환경 profile: 일반 모드 `userProfile`, 보호자 모드 `caregiverProfile`
- 건강/돌봄 정보: 일반 모드 `userInfo`, 보호자 모드 현재 mock `CAREGIVER_INFO`
- 위험도 결과:
  - `score`, `grade`
  - `breakdown`: 날씨, 주거/냉방, 생활패턴, 건강/돌봄 또는 돌봄 공백/냉방 접근성
  - `chips`: 체감온도, 습도, 특보, 방향, 창문, 환기, 에어컨, 냉방비, 생활패턴, 더위 민감도, 나이, 기저질환, 장애, 이동 불편, 복용약, 보호자 연락 가능 등
  - `reason`: 위험도 설명 문구
- 행동계획: 오전, 점심 전, 오후 피크, 저녁, 밤 시간 블록별 행동
- 도움 요청 상태:
  - 일반 모드 target household: `USER_HOUSEHOLD_ID = H-104`
  - 보호자 모드 target household: `GUARDIAN_TARGET_ID = H-205`
  - `helpRequested`, `helpReasons`, `helpTags`, `helpSource`, `requestedAt`
- 주거환경 요약: `household`, `direction`, `floor`, `ac`, `cost`, `dayStay`
- 마이페이지 건강정보 반영 여부:
  - `birth` -> 나이/고령 여부
  - `chronic`, `conditions`, `disability`, `disabilityType`, `mobility`, `meds`, `medications`
  - `alone`, `helperCohabit`, `guardianReach`, `checkCycle`

백엔드 연결 방향:

- 홈 진입 시 `GET /api/users/me/dashboard?mode=self|caregiver`
- 응답에 날씨, 프로필, 위험도 계산 결과, 행동계획, 도움 요청 상태를 한 번에 제공하면 프론트 로딩이 단순해진다.

### 1.2 `/user/profile` 주거환경 설정

필요 데이터:

- 기본 주거환경:
  - `household`: 원룸, 오피스텔, 아파트, 단독주택, 반지하, 다세대
  - `direction`: 북향, 북동향, 동향, 남동향, 남향, 남서향, 서향, 북서향
  - `floor`: 반지하, 저층, 중층, 고층, 최상층
  - `buildingAge`: 신축, 보통, 노후
- 냉방/차광:
  - `ac`: 없음, 벽걸이, 스탠드, 둘 다
  - `fan`: 없음, 있음
  - `curtain`: 없음, 일반, 암막
- 창문/환기:
  - `windowSize`: 작음, 보통, 큼
  - `windowCount`: 1개, 2개, 3개 이상
  - `frontBlock`: 없음, 가까운 건물, 나무/차양
  - `vent`: 잘 됨, 보통, 잘 안 됨
- 생활패턴:
  - `lifeRhythm`, `dayStay`, `sleepTime`, `outdoor`, `hotHome`
- 더위 민감도:
  - `heatSensitivity`, `prefTemp`, `tropicalNight`, `discomfort[]`
- 냉방 사용 성향:
  - `coolingPriority`, `acUsableHours`, `sleepCooling`, `cost`
- 생활 메모:
  - `lifeMemo`
  - AI 분석 결과: 생활 리듬, 더위 민감도, 냉방 성향, 주요 위험 요인, 행동계획 반영 포인트
- 사진 분석:
  - 업로드 slot: 창문 사진, 창밖 전경, 실내 창 주변
  - 분석 결과: 창 크기, 창문 개수, 앞 건물 가림, 차광 상태, 환기 가능성, 예상 과열 시간대

백엔드 연결 방향:

- 조회: `GET /api/users/me/housing-profile?target=self|caregiver`
- 저장: `PUT /api/users/me/housing-profile?target=self|caregiver`
- 생활 메모 분석: `POST /api/ai/life-memo/analyze`
- 사진 분석은 MVP에서는 업로드 URL 발급/메타 저장까지만 준비해도 된다.

### 1.3 `/user/mypage` 마이페이지

필요 데이터:

- 기본 정보:
  - `name`, `birth`, `gender`, `blood`, `rh`, `phone`
- 건강 정보:
  - `chronic`, `conditions[]`, `disability`, `disabilityType[]`, `mobility`, `meds`, `medications[]`, `hospital`, `hospitalPhone`, `allergy`
- 비상 연락 정보:
  - `guardianName`, `guardianRel`, `guardianPhone`, `guardian2Phone`, `guardianReach`
  - `cohabit`, `cohabitName`, `cohabitPhone`, `emergencyPriority`
- 생활/돌봄 정보:
  - `alone`, `helperCohabit`, `checkCycle`, `contactTime`, `careService`
- 119 전달용 비상정보:
  - 이름, 생년월일, 혈액형+RH, 연락처, 기저질환, 장애 여부, 이동 불편 여부, 복용약, 자주 가는 병원, 보호자 연락처, 동거인 연락처
  - 프론트는 복사만 한다. 자동 신고/자동 전송 기능은 없다.
- 보호자 기능 토글:
  - `caregiverMode: boolean`

백엔드 연결 방향:

- 사용자 기본 정보/건강/비상 연락/돌봄 정보를 분리 저장하되, 프론트 편의용 통합 조회 API도 제공한다.
- 저장 후 홈 위험도 재계산 또는 최신 `risk_assessments` invalidation이 필요하다.

### 1.4 `/user/help` 도움 요청

필요 데이터:

- 사용자 모드/보호자 모드:
  - 일반 모드 source: `user`
  - 보호자 모드 source: `guardian`
  - 보호자 모드 helpTags에는 `보호자 요청` 태그를 포함한다.
- 도움 요청 대상:
  - `119 긴급`, `지자체/복지센터`, `보호자`, `생활지원사/관리자`
  - contact tag: `응급 확인 필요`, `지자체 요청`, `보호자 알림`, `관리자 확인`
- 도움 요청 카테고리:
  - 응급 증상 -> `응급 확인`
  - 전화 확인 요청 -> `전화 확인` 또는 보호자 모드 `안부 확인`
  - 방문 확인 요청 -> `방문 확인` 또는 보호자 모드 `방문 검토`
  - 냉방 지원 요청 -> `냉방 지원`
  - 무더위쉼터 안내 -> `쉼터 안내`
- 선택 item:
  - 예: `오늘 중 상태 확인 전화 요청`, `냉방비 지원 상담 요청`, `생활지원사 방문 확인 요청`
- 주변 도움 가능 여부:
  - 혼자 있음, 동거인 있음, 보호자 연락 가능/어려움, 이웃/관리실 도움 가능/어려움
  - 동거인 이름/연락처
- 접수 완료 화면:
  - 요청 대상
  - 선택한 요청 내용
  - 다음 조치 안내

백엔드 연결 방향:

- `POST /api/help-requests`로 접수
- 접수 시 해당 household의 `helpRequested`, `requestedAt`, `helpReasons`, `helpTags`, `helpContactTag`, `helpSource`, `recommendedActions`, `status`를 갱신한다.
- `GET /api/help-requests/status?target=self|caregiver`로 홈/도움 요청 완료 화면 상태를 조회한다.

### 1.5 `/admin` 관리자 대시보드

필요 데이터:

- 오늘 폭염 운영 요약:
  - 날씨 summary, alert, highTemp, feelsLike, humidity, nightHeat, weather.score
- KPI 카드:
  - 전체, 고위험, 전화 필요, 방문 필요, 지원 검토, 완료
  - 현재 프론트는 `households + computeRisk + matchesAdminFilter`로 계산
- 우선순위 리스트:
  - household id, region, resident 요약, housing 요약, risk score/grade, factors, helpTags, helpSource, helpContactTag, status, assignee, lastContactDays, needsSupport
- 필터:
  - `all`, `highrisk`, `call`, `visit`, `support`, `done`
- 운영 브리핑:
  - 고위험 수, 도움 요청 수, 전화/방문/지원 검토 수, 운영 우선순위 문안
- AI 절감률 패널:
  - `analyzed`, `ruleBased`, `llmCalls`, `cacheReuse`, `noLlmRate`, `avgTokens`

백엔드 연결 방향:

- `GET /api/admin/today-summary`
- `GET /api/admin/priority-list?filter=all|highrisk|call|visit|support|done`
- `POST /api/ai/briefings/today` 또는 `GET /api/admin/briefing/today`
- `GET /api/ai/metrics`

### 1.6 `/admin/households/[id]` 가구 상세

필요 데이터:

- 가구 상세:
  - `id`, `region`, `resident`, `housing`, `components`, `factors`, `recommendedActions`, `assignee`, `status`, `lastContactDays`, `needsSupport`, help fields
- 위험도 구성:
  - weather, personal, housing, care weight/value/weighted
  - 최종 score, grade
- 위험 요인:
  - `factors[]`
  - why-now chips: 도움 요청, 방향/직사광, 반지하/최상층, 재택, 독거 고령, 냉방 없음, 냉방비 부담, 연락 공백, 지원 검토
- 추천 조치:
  - `recommendedActions[]`
- 전화 스크립트 생성:
  - LLM 문안, tokens, cached 여부
- 방문 체크리스트 생성:
  - LLM 문안, tokens, cached 여부
- 조치 결과 기록:
  - result, note, nextVisit, status, by, at
- 저장 시 상태 반영:
  - action log 저장 + household status 갱신

백엔드 연결 방향:

- `GET /api/admin/households/{householdId}`
- `POST /api/ai/phone-script`
- `POST /api/ai/visit-checklist`
- `POST /api/admin/households/{householdId}/action-logs`
- `PATCH /api/admin/households/{householdId}/status`

## 2. 김지영님 백엔드 작업 리스트

공통 응답 원칙:

- 날짜/시간은 ISO 8601 string 사용
- enum 값은 프론트 라벨과 일치시키거나, 서버 enum + display label을 함께 제공
- 모든 쓰기 API는 `updatedAt`과 반영된 최신 resource를 반환
- 개인정보 포함 응답은 사용자 본인/관리자 권한 체크 필요

### 2.1 사용자 기본 정보 저장/조회 API

- API 이름: User Basic Info API
- Method/Endpoint:
  - `GET /api/users/me/basic-info`
  - `PUT /api/users/me/basic-info`
- Request body:

```json
{
  "name": "김민지",
  "birth": "1988-05-12",
  "gender": "여",
  "blood": "A",
  "rh": "Rh+",
  "phone": "010-0000-0000"
}
```

- Response:

```json
{
  "userId": "u_001",
  "basicInfo": {
    "name": "김민지",
    "birth": "1988-05-12",
    "gender": "여",
    "blood": "A",
    "rh": "Rh+",
    "phone": "010-0000-0000"
  },
  "updatedAt": "2026-06-25T00:15:00.000Z"
}
```

- DB 저장 데이터: `users`, `user_profiles`
- 사용 화면: `/user/mypage`, `/user/help` 비상정보
- 우선순위: P1

### 2.2 주거환경 저장/조회 API

- API 이름: Housing Profile API
- Method/Endpoint:
  - `GET /api/users/me/housing-profile?target=self`
  - `GET /api/users/me/housing-profile?target=caregiver`
  - `PUT /api/users/me/housing-profile?target=self|caregiver`
- Request body:

```json
{
  "household": "원룸",
  "direction": "남서향",
  "floor": "중층",
  "buildingAge": "보통",
  "ac": "벽걸이",
  "fan": "있음",
  "curtain": "일반",
  "cost": "보통",
  "windowSize": "큼",
  "windowCount": "2개",
  "frontBlock": "없음",
  "vent": "보통",
  "lifeRhythm": "낮 활동",
  "dayStay": "오후 오래",
  "sleepTime": "밤",
  "outdoor": "보통",
  "hotHome": "자주",
  "heatSensitivity": "많이 타는 편",
  "prefTemp": "25~26℃",
  "tropicalNight": "잠을 조금 설침",
  "discomfort": ["두통"],
  "coolingPriority": "절약 우선",
  "acUsableHours": "필요하면 사용",
  "sleepCooling": "부담됨",
  "lifeMemo": "오후에 방이 많이 더워져요."
}
```

- Response:

```json
{
  "target": "self",
  "housingProfile": { "direction": "남서향", "household": "원룸" },
  "riskRecalculationQueued": true,
  "updatedAt": "2026-06-25T00:15:00.000Z"
}
```

- DB 저장 데이터: `housing_profiles`
- 사용 화면: `/user/profile`, `/user`
- 우선순위: P1

### 2.3 건강/비상정보 저장/조회 API

- API 이름: Health/Emergency Profile API
- Method/Endpoint:
  - `GET /api/users/me/safety-profile`
  - `PUT /api/users/me/safety-profile`
- Request body:

```json
{
  "health": {
    "chronic": "있음",
    "conditions": ["고혈압", "당뇨"],
    "disability": "없음",
    "disabilityType": [],
    "mobility": "불편",
    "meds": "있음",
    "medications": ["혈압약"],
    "hospital": "OO의원",
    "hospitalPhone": "02-000-0000",
    "allergy": "없음"
  },
  "emergencyContact": {
    "guardianName": "김보호",
    "guardianRel": "자녀",
    "guardianPhone": "010-1111-2222",
    "guardian2Phone": "",
    "guardianReach": "가능",
    "cohabit": "있음",
    "cohabitName": "박동거",
    "cohabitPhone": "010-3333-4444",
    "emergencyPriority": "보호자 → 119"
  },
  "care": {
    "alone": "아니오",
    "helperCohabit": "예",
    "checkCycle": "주 1회",
    "contactTime": "저녁",
    "careService": "미이용"
  }
}
```

- Response:

```json
{
  "userId": "u_001",
  "safetyProfile": {
    "health": { "chronic": "있음", "conditions": ["고혈압", "당뇨"] },
    "emergencyContact": { "guardianPhone": "010-1111-2222" },
    "care": { "alone": "아니오", "checkCycle": "주 1회" }
  },
  "updatedAt": "2026-06-25T00:15:00.000Z"
}
```

- DB 저장 데이터: `health_profiles`, `emergency_contacts`, `user_profiles`
- 사용 화면: `/user/mypage`, `/user`, `/user/help`
- 우선순위: P1

### 2.4 도움 요청 접수 API

- API 이름: Help Request Create API
- Method/Endpoint: `POST /api/help-requests`
- Request body:

```json
{
  "target": "self",
  "householdId": "H-104",
  "source": "user",
  "contact": {
    "key": "gov",
    "label": "지자체/복지센터",
    "tag": "지자체 요청"
  },
  "reasons": ["냉방비 지원 상담 요청", "가까운 무더위쉼터 위치 안내 요청"],
  "tags": ["냉방 지원", "쉼터 안내"],
  "nearbyStatus": "보호자에게 연락 가능해요",
  "cohabitName": "",
  "cohabitPhone": ""
}
```

- Response:

```json
{
  "helpRequestId": "hr_001",
  "householdId": "H-104",
  "status": "received",
  "requestedAt": "2026-06-25T00:20:00.000Z",
  "helpTags": ["냉방 지원", "쉼터 안내"],
  "helpContactTag": "지자체 요청",
  "recommendedActions": ["냉방비 지원 상담", "냉방용품 재고 확인", "에너지바우처 안내", "가까운 쉼터 안내"]
}
```

- DB 저장 데이터: `help_requests`, `admin_tasks`, household current status snapshot
- 사용 화면: `/user/help`, `/user`, `/admin`
- 우선순위: P1

### 2.5 도움 요청 상태 조회 API

- API 이름: Help Request Status API
- Method/Endpoint:
  - `GET /api/help-requests/status?target=self`
  - `GET /api/help-requests/{helpRequestId}`
- Response:

```json
{
  "target": "self",
  "householdId": "H-104",
  "activeRequest": {
    "id": "hr_001",
    "status": "received",
    "requestedAt": "2026-06-25T00:20:00.000Z",
    "reasons": ["냉방비 지원 상담 요청"],
    "contactLabel": "지자체/복지센터",
    "nextActionMessage": "담당자가 요청 내용을 확인한 뒤 전화 또는 방문 여부를 검토합니다."
  }
}
```

- DB 저장 데이터: `help_requests`
- 사용 화면: `/user`, `/user/help`
- 우선순위: P1

### 2.6 취약가구 샘플 데이터 등록 API

- API 이름: Household Sample Import API
- Method/Endpoint: `POST /api/admin/household-samples/import`
- Request body:

```json
{
  "source": "seed",
  "households": [
    {
      "id": "H-001",
      "region": "햇살동",
      "resident": { "ageBand": "70대", "alone": true, "condition": "고혈압" },
      "housing": { "type": "단독주택", "direction": "남서향", "floor": "단층", "ac": false, "costBurden": "높음", "pattern": "종일 재택", "age": "노후" },
      "components": { "personal": 96, "housing": 95, "care": 100 },
      "factors": ["독거 고령자", "남서향 노후주택"],
      "recommendedActions": ["즉시 전화 확인"],
      "assignee": "김복지",
      "status": "대기",
      "lastContactDays": 12,
      "needsSupport": true
    }
  ]
}
```

- Response:

```json
{ "inserted": 1, "updated": 0, "importedAt": "2026-06-25T00:25:00.000Z" }
```

- DB 저장 데이터: `household_samples`
- 사용 화면: 관리자 seed/운영 초기 데이터
- 우선순위: P2

### 2.7 취약가구 목록 조회 API

- API 이름: Household List API
- Method/Endpoint: `GET /api/admin/households?filter=all&date=2026-06-25`
- Response:

```json
{
  "date": "2026-06-25",
  "counts": { "all": 17, "highrisk": 4, "call": 5, "visit": 1, "support": 5, "done": 2 },
  "households": [
    {
      "id": "H-001",
      "region": "햇살동",
      "riskScore": 94,
      "grade": "urgent",
      "factors": ["독거 고령자", "남서향 노후주택"],
      "helpRequested": true,
      "helpSource": "user",
      "helpTags": ["응급 확인"],
      "status": "대기",
      "assignee": "김복지",
      "lastContactDays": 12,
      "priorityScore": 109423
    }
  ]
}
```

- DB 저장 데이터: 조회 중심, `risk_assessments` 최신값 join
- 사용 화면: `/admin`
- 우선순위: P1

### 2.8 가구 상세 조회 API

- API 이름: Household Detail API
- Method/Endpoint: `GET /api/admin/households/{householdId}`
- Response:

```json
{
  "household": {
    "id": "H-001",
    "region": "햇살동",
    "resident": { "ageBand": "70대", "alone": true, "condition": "고혈압" },
    "housing": { "type": "단독주택", "direction": "남서향", "floor": "단층", "ac": false, "costBurden": "높음", "pattern": "종일 재택", "age": "노후" },
    "status": "대기",
    "assignee": "김복지",
    "lastContactDays": 12,
    "needsSupport": true
  },
  "risk": {
    "score": 94,
    "grade": "urgent",
    "breakdown": {
      "weather": { "weight": 0.35, "value": 90, "weighted": 31.5 },
      "personal": { "weight": 0.25, "value": 96, "weighted": 24 },
      "housing": { "weight": 0.25, "value": 95, "weighted": 23.75 },
      "care": { "weight": 0.15, "value": 100, "weighted": 15 }
    }
  },
  "factors": ["독거 고령자", "남서향 노후주택"],
  "recommendedActions": ["즉시 전화 확인"],
  "actionLogs": []
}
```

- DB 저장 데이터: `household_samples`, `risk_assessments`, `action_logs`
- 사용 화면: `/admin/households/[id]`
- 우선순위: P1

### 2.9 위험도 계산 API

- API 이름: Risk Assessment API
- Method/Endpoint:
  - `POST /api/risk/assessments`
  - `GET /api/risk/assessments/latest?target=self|caregiver`
- Request body:

```json
{
  "target": "self",
  "weatherId": "weather_2026-06-25_incheon",
  "housingProfileId": "hp_001",
  "healthProfileId": "health_001",
  "helpRequestId": null
}
```

- Response:

```json
{
  "assessmentId": "risk_001",
  "target": "self",
  "score": 55,
  "grade": "guide",
  "chips": ["체감 40℃", "습도 72%", "남서향", "오후 재택", "더위 민감도 높음", "에어컨 1대"],
  "reason": "남서향 원룸, 오후 재택, 더위 민감도 높음을 함께 반영해 오후 1시~4시 실내 과열 가능성을 계산했습니다.",
  "breakdown": [
    { "label": "날씨 위험도", "value": 90 },
    { "label": "주거·냉방 위험도", "value": 58 },
    { "label": "생활패턴 위험도", "value": 49 },
    { "label": "건강·돌봄", "value": 2 }
  ],
  "calculatedAt": "2026-06-25T06:00:00.000Z"
}
```

- DB 저장 데이터: `risk_assessments`
- 사용 화면: `/user`, `/admin`, `/admin/households/[id]`
- 우선순위: P1

### 2.10 관리자 우선순위 리스트 API

- API 이름: Admin Priority API
- Method/Endpoint: `GET /api/admin/priority-list?filter=highrisk&date=2026-06-25`
- Response:

```json
{
  "filter": "highrisk",
  "items": [
    {
      "rank": 1,
      "householdId": "H-001",
      "riskScore": 94,
      "grade": "urgent",
      "priorityScore": 109423,
      "priorityReasons": ["응급 확인 필요", "위험도 94", "도움 요청", "독거 고령자", "최근 연락 12일 경과"],
      "status": "대기",
      "assignee": "김복지"
    }
  ]
}
```

- DB 저장 데이터: 조회 중심, 계산 결과 cache 가능
- 사용 화면: `/admin`
- 우선순위: P1

### 2.11 조치 결과 기록 API

- API 이름: Action Log API
- Method/Endpoint: `POST /api/admin/households/{householdId}/action-logs`
- Request body:

```json
{
  "result": "전화 완료",
  "note": "냉방 중이며 수분 섭취 안내 완료",
  "nextVisit": "2026-06-26",
  "status": "완료",
  "by": "김복지"
}
```

- Response:

```json
{
  "actionLog": {
    "id": "log_001",
    "householdId": "H-001",
    "at": "2026-06-25T01:00:00.000Z",
    "result": "전화 완료",
    "note": "냉방 중이며 수분 섭취 안내 완료",
    "nextVisit": "2026-06-26",
    "by": "김복지"
  },
  "household": { "id": "H-001", "status": "완료" }
}
```

- DB 저장 데이터: `action_logs`, `admin_tasks`, household status
- 사용 화면: `/admin/households/[id]`
- 우선순위: P1

### 2.12 업무 배정/상태 변경 API

- API 이름: Admin Task Assignment/Status API
- Method/Endpoint:
  - `PATCH /api/admin/tasks/{taskId}`
  - `PATCH /api/admin/households/{householdId}/status`
- Request body:

```json
{
  "assignee": "김복지",
  "status": "방문예정",
  "dueAt": "2026-06-25T04:00:00.000Z"
}
```

- Response:

```json
{
  "taskId": "task_001",
  "householdId": "H-001",
  "assignee": "김복지",
  "status": "방문예정",
  "updatedAt": "2026-06-25T01:10:00.000Z"
}
```

- DB 저장 데이터: `admin_tasks`, `household_samples.status`, `household_samples.assignee`
- 사용 화면: `/admin`, `/admin/households/[id]`
- 우선순위: P2

### 2.13 날씨 데이터 저장/조회 API

- API 이름: Weather Daily API
- Method/Endpoint:
  - `POST /api/weather/daily`
  - `GET /api/weather/daily?region=인천 미추홀구&date=2026-06-25`
- Request body:

```json
{
  "region": "인천 미추홀구",
  "date": "2026-06-25",
  "highTemp": 37,
  "feelsLike": 40,
  "humidity": 72,
  "alert": "폭염경보",
  "nightHeat": true,
  "score": 90,
  "summary": "낮 최고 37도, 체감 40도. 야간에도 28도 이상 열대야가 이어집니다."
}
```

- Response:

```json
{
  "weatherId": "weather_2026-06-25_incheon",
  "region": "인천 미추홀구",
  "date": "2026-06-25",
  "score": 90,
  "updatedAt": "2026-06-25T06:00:00.000Z"
}
```

- DB 저장 데이터: `weather_daily`
- 사용 화면: `/user`, `/admin`, `/about` 지표
- 우선순위: P1

### 2.14 AI 호출 로그 조회 API

- API 이름: AI Generation Logs API
- Method/Endpoint: `GET /api/ai/logs?date=2026-06-25`
- Response:

```json
{
  "logs": [
    {
      "id": "llm_001",
      "type": "phone_script",
      "householdId": "H-001",
      "tokens": 218,
      "cached": false,
      "at": "2026-06-25T01:20:00.000Z"
    }
  ],
  "metrics": {
    "analyzed": 240,
    "ruleBased": 240,
    "llmCalls": 19,
    "cacheReuse": 7,
    "noLlmRate": 92.1,
    "avgTokens": 218
  }
}
```

- DB 저장 데이터: `ai_generation_logs`
- 사용 화면: AI 절감률 플로팅 패널
- 우선순위: P2

### 2.15 오늘 운영 통계 API

- API 이름: Admin Today Statistics API
- Method/Endpoint: `GET /api/admin/today-statistics?date=2026-06-25`
- Response:

```json
{
  "date": "2026-06-25",
  "weather": {
    "alert": "폭염경보",
    "highTemp": 37,
    "feelsLike": 40,
    "humidity": 72,
    "nightHeat": true
  },
  "counts": {
    "all": 17,
    "highrisk": 4,
    "helpRequests": 2,
    "call": 5,
    "visit": 1,
    "support": 5,
    "done": 2
  },
  "aiMetrics": {
    "analyzed": 240,
    "ruleBased": 240,
    "llmCalls": 19,
    "cacheReuse": 7,
    "noLlmRate": 92.1,
    "avgTokens": 218
  }
}
```

- DB 저장 데이터: 집계 결과는 cache table 또는 materialized view 가능
- 사용 화면: `/admin`, 운영 브리핑, AI 절감률 패널
- 우선순위: P1

## 3. 위험도 계산 로직 명세

원칙:

- 위험도 계산은 LLM을 사용하지 않는다.
- 백엔드 코드에서 deterministic하게 계산한다.
- 계산 결과와 구성 요소를 `risk_assessments`에 저장해 UI와 감사 로그에서 재사용한다.
- 입력값이 바뀌면 최신 날씨 기준으로 재계산한다.

### 3.1 사용자 홈 위험도 계산

현재 mock 위치: `lib/risk/profileRisk.ts`

구성 요소:

- 날씨 위험도 `weatherScore`
- 주거/냉방 위험도 `housingScore`
- 생활패턴 위험도 `lifestyleScore`
- 개인 건강/취약도 및 돌봄 `careScore`
- 보호자 모드 추가 냉방 접근성 `coolingAccessScore`

날씨 위험도:

```ts
score = 38
if 폭염특보 있음: +24
if 열대야: +10
score += max(0, feelsLike - 33) * 2
if humidity >= 70: +8
else if humidity >= 60: +4
clamp 0..100
```

주거/냉방 위험도:

- 방향:
  - 남서향/서향 +15
  - 남향/남동향 +6
- 층수:
  - 최상층/반지하 +14
- 건물 노후도:
  - 노후 +10
  - 보통 +3
- 창문 크기:
  - 큼 +8
  - 보통 +3
- 앞 건물 가림:
  - 없음 +6
  - 있음 -4
- 환기:
  - 잘 안 됨 +8
  - 보통 +3
  - 잘 됨 -4
- 커튼/블라인드:
  - 없음 +8
  - 일반 +2
  - 암막 -4
- 에어컨:
  - 없음 +16
  - 1대 +6
  - 둘 다 +0
- 선풍기 없음 +6
- 냉방비 부담:
  - 높음 +10
  - 보통 +3

생활패턴 위험도:

- 낮 시간 집 체류:
  - 종일 재택 +30
  - 오후 오래 +22
  - 오후 잠깐 +10
- 더운 시간대 집에 있음:
  - 거의 항상 +12
  - 자주 +7
  - 가끔 +3
- 더위 민감도:
  - 매우 힘든 편 +12
  - 많이 타는 편 +8
  - 보통 +3

개인 건강/취약도 및 돌봄:

- 생년월일 기준 65세 이상 +22
- 기저질환 있음 또는 질환명 입력 +16
- 장애 있음 또는 장애 유형 입력 +10
- 이동 불편 +10
- 혼자 거주 +14
- 도움 줄 동거인 없음 +6
- 보호자 연락 어려움 +12
- 보호자 연락 가능 -6
- 최근 안부 확인 주기:
  - 거의 없음 +14
  - 2주 1회 +8
  - 매일 -4
- 복용약 있음 또는 약명 입력 +6

냉방 접근성:

- 에어컨 없음 +35
- 에어컨 1대 +12
- 선풍기 없음 +10
- 냉방비 높음 +18
- 냉방비 보통 +6
- 커튼 없음 +8
- 냉방 우선순위 절약 우선 +8
- 냉방 우선순위 균형 +3
- 에어컨 거의 안 씀 +12
- 하루 1시간 이내 +6
- 취침 중 냉방 거의 안 함 +8
- 취침 중 냉방 부담됨 +4

일반 사용자 최종 점수:

```ts
score = weather * 0.30 + housing * 0.35 + lifestyle * 0.20 + care * 0.15
```

보호자 모드 최종 점수:

```ts
score = weather * 0.30 + housing * 0.30 + care * 0.30 + cooling * 0.10
```

### 3.2 관리자 가구 위험도 계산

현재 mock 위치: `lib/risk/score.ts`

관리자 가구는 household에 저장된 component 점수와 오늘 날씨 점수를 조합한다.

```ts
weatherWeight = 0.35
personalWeight = 0.25
housingWeight = 0.25
careWeight = 0.15

care = helpRequested ? max(baseCare, 95) : baseCare
score = round(weather.score * 0.35 + personal * 0.25 + housing * 0.25 + care * 0.15)
```

등급:

- 80점 이상: `urgent`, 긴급 확인
- 60~79점: `call`, 오늘 중 전화 또는 방문
- 40~59점: `guide`, 행동요령 안내
- 40점 미만: `monitor`, 일반 모니터링

### 3.3 반영 요소 체크리스트

필수 입력:

- 최고기온, 체감온도, 습도, 폭염특보, 열대야 여부
- 거주 형태, 방향, 층수, 건물 노후도
- 에어컨 유무/종류, 선풍기 유무, 커튼/블라인드
- 창문 크기, 창문 개수, 앞 건물 가림 여부, 환기 정도
- 생활패턴, 낮 시간 집 체류, 취침 시간대
- 더위 민감도, 냉방 사용 성향
- 생년월일 기준 나이, 기저질환 여부, 장애 여부, 이동 불편 여부, 복용약 여부
- 혼자 거주 여부, 보호자 연락 가능 여부, 최근 안부 확인 주기
- 도움 요청 여부, 응급 요청 여부

## 4. 관리자 우선순위 정렬 로직 명세

원칙:

- 단순 위험도 점수순이 아니다.
- 응급 확인 필요가 최우선이다.
- 그다음 위험도 점수가 실질 순서를 좌우한다.
- 도움 요청, 취약도, 연락 공백, 방문/전화/지원 상태, 요청 발생 시간은 보조 가중치로 반영한다.

현재 mock 위치: `lib/risk/score.ts`

응급 판단:

```ts
emergency = helpTags includes "응급 확인" || helpContactTag === "응급 확인 필요"
```

취약도 판단:

- 독거 여부
- 고령 여부: `ageBand`가 60대 이상
- 기저질환 여부
- 실제 구현에서는 장애 여부도 포함

권장 정렬 tuple:

1. `emergency desc`
2. `riskScore desc`
3. `helpRequested desc`
4. `vulnerabilityScore desc`
5. `contactGap desc`
6. `visitNeed desc`
7. `callNeed desc`
8. `supportNeed desc`
9. `requestedAt desc`

설명 가능한 additive priorityScore 예시:

```ts
priorityScore =
  riskScore
  + emergencyBonus
  + helpRequestBonus
  + vulnerableBonus
  + contactGapBonus
  + visitNeedBonus
  + callNeedBonus
  + supportNeedBonus
  + recentRequestBonus
```

권장 가중치:

- `emergencyBonus`: +100
- `helpRequestBonus`: +20
- `vulnerableBonus`: +15
- `contactGapBonus`: +10
- `visitNeedBonus`: +8
- `callNeedBonus`: +6
- `supportNeedBonus`: +5
- `recentRequestBonus`: +3

주의:

- 최근 요청만으로 위험도가 낮은 가구가 고위험/응급 가구를 앞지르면 안 된다.
- strict ordering이 더 중요하면 tuple sort를 사용하고, `priorityScore`는 UI 표시/설명용으로만 둔다.
- 현재 프론트 mock은 응급 최우선 보장을 위해 내부적으로 `emergency * 1_000_000 + risk * 1_000 + ...` 방식에 가깝게 구현되어 있다.

필터 로직:

- 전체: 모든 가구
- 고위험: `grade === urgent`
- 전화 필요: `status !== 완료` and (`status === 전화중` or (`grade === call` and `status === 대기`))
- 방문 필요: `status === 방문예정`
- 지원 검토: `status !== 완료` and (`status === 지원검토` or `needsSupport`)
- 완료: `status === 완료`

## 5. 강신우님 AI 에이전트 작업 리스트

AI 사용 원칙:

- 위험도 계산에는 LLM을 사용하지 않는다.
- 위험도 계산은 백엔드 코드가 한다.
- LLM은 행동계획, 전화 스크립트, 방문 체크리스트, 운영 브리핑, 생활 메모 요약처럼 문장 생성이 필요한 곳에만 사용한다.
- 이름, 전화번호, 상세주소, 복용약 상세 등 직접 식별정보는 LLM에 전달하지 않는다.
- 같은 조건의 문서는 캐시를 우선 사용한다.
- 템플릿으로 가능한 문서는 템플릿을 먼저 사용한다.

### 5.1 Bedrock 호출 모듈

- 기능: Bedrock Runtime client wrapper
- 입력: `modelId`, sanitized prompt, generation options
- 출력: generated text, output tokens, latency, raw provider metadata
- 필요 기능:
  - timeout/retry
  - model별 max token, temperature 관리
  - error fallback template
  - request id logging
- 우선순위: P1

### 5.2 사용자 맞춤 행동계획 생성

- 입력: 날씨, 주거환경, 생활패턴, 건강/취약도 요약, 위험도 점수, 위험 요인
- 출력: 오전/점심 전/오후 피크/저녁/밤 행동, 예상 효과
- 사용 화면: `/user`
- 우선순위: P2
- MVP fallback: 현재 `buildPlan` 규칙 기반 결과 사용

### 5.3 복지사 전화 스크립트 생성

- 입력: 위험도 등급, 위험 요인, 도움 요청 사유, 추천 조치, 개인정보 제거 가구 요약
- 출력: 바로 읽을 문안, 확인 질문, 안내 문구
- 사용 화면: `/admin/households/[id]`
- 우선순위: P1

### 5.4 방문 체크리스트 생성

- 입력: 위험 요인, 주거환경, 냉방 상태, 도움 요청 사유, 추천 조치
- 출력: 방문 전 확인, 현장 확인, 냉방/건강 확인, 지원 필요 여부, 후속 조치
- 사용 화면: `/admin/households/[id]`
- 우선순위: P1

### 5.5 오늘 운영 브리핑 문안 생성

- 입력: 오늘 날씨, 전체/고위험/도움 요청/전화/방문/지원 검토 수
- 출력: 운영자가 읽는 짧은 브리핑, 운영 우선순위, 주의할 점
- 사용 화면: `/admin`
- 우선순위: P2

### 5.6 생활 메모 자연어 분석

- 입력: 사용자가 자유롭게 입력한 생활 메모
- 출력: 생활 리듬, 더위 민감도 추정, 냉방 성향 추정, 주요 위험 요인, 행동계획 반영 포인트
- 사용 화면: `/user/profile`
- 우선순위: P2
- 주의: 직접 식별정보가 포함되면 제거하거나 사용자에게 입력 제한 안내

### 5.7 사진 분석 연동 준비

- MVP 작업:
  - 이미지 업로드 URL 발급 API와 metadata 저장 구조 정의
  - Bedrock/vision 모델 또는 추후 OCR/vision 모듈을 붙일 interface 정의
- 입력: 창문 사진, 창밖 전경, 실내 창 주변
- 출력: 창 크기, 창문 개수, 앞 건물 가림, 차광 상태, 환기 가능성, 예상 과열 시간대
- 사용 화면: `/user/profile`
- 우선순위: P3

### 5.8 LLM 캐시 처리

- cache key 구성:
  - generation type
  - risk grade
  - normalized factors
  - recommended actions
  - weather bucket
  - prompt version
- 같은 조건이면 `ai_cache`에서 먼저 반환
- cache hit도 `ai_generation_logs.cached = true`로 기록
- 우선순위: P1

### 5.9 LLM 호출량 기록

- 기록 항목:
  - type, userId/householdId, promptVersion, modelId, tokens, cached, latencyMs, status, errorCode, createdAt
- 사용 화면: AI 절감률 패널
- 우선순위: P1

### 5.10 평균 출력 토큰 기록

- 계산:
  - `avgTokens = sum(outputTokens) / generationCount`
- 기간:
  - today, 7d, all
- 사용 화면: AI 절감률 패널
- 우선순위: P2

### 5.11 LLM 미사용 처리율 계산

- 현재 프론트 mock:
  - `noLlmRate = (analyzed - llmCalls) / analyzed * 100`
- 실제 권장:
  - `analyzed`: 위험도 계산/우선순위 정렬/날씨 조회/상태 저장 등 전체 처리 건수
  - `llmCalls`: 실제 Bedrock 호출 건수. cache hit는 별도 표시
- 우선순위: P2

### 5.12 개인정보 필터링

- LLM 전달 금지:
  - 이름
  - 전화번호
  - 상세주소
  - 생년월일 전체
  - 병원명/병원 연락처
  - 복용약 상세명
  - 보호자 이름/연락처
- 대체:
  - 연령대 또는 65세 이상 여부
  - 기저질환 있음/없음
  - 복용약 있음/없음
  - 보호자 연락 가능/어려움
  - 행정동 수준 지역
- 우선순위: P1

## 6. AI 프롬프트 설계 초안

공통 시스템 지침:

```text
당신은 폭염 취약가구 지원을 돕는 공공 돌봄 보조 AI입니다.
위험도 점수는 이미 코드 기반 규칙 엔진이 계산했습니다. 점수를 재계산하지 마세요.
입력에 이름, 전화번호, 상세주소 같은 개인정보가 없어야 하며, 출력에도 개인정보를 만들거나 추정하지 마세요.
문장은 짧고 현장에서 바로 읽거나 실행할 수 있게 작성하세요.
응급 증상이 있으면 앱 접수보다 119 직접 연락을 안내하세요.
```

### 6.1 사용자 맞춤 행동계획 생성 프롬프트

입력:

- 날씨 정보
- 주거환경 요약
- 생활패턴
- 더위 민감도
- 냉방 사용 성향
- 건강/취약도 요약
- 위험도 점수
- 위험 요인

Prompt:

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

### 6.2 전화 스크립트 생성 프롬프트

입력:

- 위험도 등급
- 주요 위험 요인
- 도움 요청 사유
- 추천 조치
- 개인정보 제거된 가구 요약

Prompt:

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

### 6.3 방문 체크리스트 생성 프롬프트

입력:

- 위험 요인
- 주거환경
- 냉방 상태
- 도움 요청 사유
- 추천 조치

Prompt:

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

### 6.4 운영 브리핑 생성 프롬프트

입력:

- 오늘 날씨
- 전체 관리 가구 수
- 고위험 가구 수
- 도움 요청 수
- 전화 필요 수
- 방문 필요 수
- 지원 검토 수

Prompt:

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

### 6.5 생활 메모 분석 프롬프트

입력:

- 사용자가 자유롭게 입력한 생활 메모

Prompt:

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

## 7. DB 테이블 설계 초안

### 7.1 `users`

- `id` PK
- `email` nullable
- `provider`
- `role`: user/admin/worker
- `created_at`
- `updated_at`
- `deleted_at`

### 7.2 `user_profiles`

- `id` PK
- `user_id` FK
- `name`
- `birth`
- `gender`
- `blood`
- `rh`
- `phone`
- `caregiver_mode`
- `created_at`
- `updated_at`

### 7.3 `housing_profiles`

- `id` PK
- `user_id` FK
- `target`: self/caregiver
- `household`
- `direction`
- `floor`
- `building_age`
- `ac`
- `fan`
- `curtain`
- `cost`
- `window_size`
- `window_count`
- `front_block`
- `vent`
- `life_rhythm`
- `day_stay`
- `sleep_time`
- `outdoor`
- `hot_home`
- `heat_sensitivity`
- `pref_temp`
- `tropical_night`
- `discomfort` JSON/text array
- `cooling_priority`
- `ac_usable_hours`
- `sleep_cooling`
- `life_memo`
- `created_at`
- `updated_at`

### 7.4 `health_profiles`

- `id` PK
- `user_id` FK
- `chronic`
- `conditions` JSON/text array
- `disability`
- `disability_type` JSON/text array
- `mobility`
- `meds`
- `medications` JSON/text array, encryption recommended
- `hospital`
- `hospital_phone`
- `allergy`
- `alone`
- `helper_cohabit`
- `check_cycle`
- `contact_time`
- `care_service`
- `created_at`
- `updated_at`

### 7.5 `emergency_contacts`

- `id` PK
- `user_id` FK
- `guardian_name`
- `guardian_rel`
- `guardian_phone`
- `guardian2_phone`
- `guardian_reach`
- `cohabit`
- `cohabit_name`
- `cohabit_phone`
- `emergency_priority`
- `created_at`
- `updated_at`

### 7.6 `household_samples`

- `id` PK, e.g. H-001
- `region`
- `resident_age_band`
- `resident_alone`
- `resident_condition`
- `housing_type`
- `housing_direction`
- `housing_floor`
- `housing_ac`
- `housing_cost_burden`
- `housing_pattern`
- `housing_age`
- `component_personal`
- `component_housing`
- `component_care`
- `factors` JSON/text array
- `recommended_actions` JSON/text array
- `assignee`
- `status`
- `last_contact_days`
- `needs_support`
- `help_requested`
- `requested_at`
- `help_reasons` JSON/text array
- `help_tags` JSON/text array
- `help_contact_tag`
- `help_source`
- `is_user`
- `created_at`
- `updated_at`

### 7.7 `weather_daily`

- `id` PK
- `region`
- `date`
- `high_temp`
- `feels_like`
- `humidity`
- `alert`
- `night_heat`
- `score`
- `summary`
- `source`
- `created_at`
- `updated_at`

### 7.8 `risk_assessments`

- `id` PK
- `target_type`: user/household
- `target_id`
- `weather_id`
- `score`
- `grade`
- `breakdown` JSON
- `chips` JSON/text array
- `reason`
- `factors` JSON/text array
- `recommended_actions` JSON/text array
- `calculated_at`
- `algorithm_version`
- `created_at`

### 7.9 `help_requests`

- `id` PK
- `user_id` nullable
- `household_id`
- `source`: user/guardian/system
- `target`: self/caregiver
- `contact_key`
- `contact_label`
- `contact_tag`
- `reasons` JSON/text array
- `tags` JSON/text array
- `nearby_status`
- `cohabit_name`
- `cohabit_phone`
- `status`: received/reviewing/assigned/done/cancelled
- `requested_at`
- `resolved_at`
- `created_at`
- `updated_at`

### 7.10 `admin_tasks`

- `id` PK
- `household_id`
- `help_request_id` nullable
- `task_type`: call/visit/support/shelter/emergency
- `status`: 대기/전화중/방문예정/지원검토/완료
- `assignee`
- `priority_score`
- `priority_reasons` JSON/text array
- `due_at`
- `completed_at`
- `created_at`
- `updated_at`

### 7.11 `action_logs`

- `id` PK
- `household_id`
- `task_id` nullable
- `at`
- `result`
- `note`
- `next_visit`
- `by`
- `created_at`

### 7.12 `ai_generation_logs`

- `id` PK
- `type`: phone_script/visit_checklist/action_plan/report/guardian_msg/life_memo
- `user_id` nullable
- `household_id` nullable
- `prompt_version`
- `model_id`
- `input_hash`
- `output_tokens`
- `cached`
- `latency_ms`
- `status`: success/error/cache_hit
- `error_code`
- `created_at`

### 7.13 `ai_cache`

- `id` PK
- `cache_key` unique
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

## 8. 팀원별 TODO 정리

### 김지영: 백엔드

1순위:

- 사용자 기본 정보/주거환경/건강·비상정보 저장·조회 API 구현
- 날씨 데이터 저장·조회 API 구현
- 위험도 계산 API 구현
- 도움 요청 접수/상태 조회 API 구현
- 관리자 가구 목록/상세/오늘 운영 통계 API 구현

2순위:

- 관리자 우선순위 리스트 API 구현
- 조치 결과 기록 API 구현
- 업무 배정/상태 변경 API 구현
- 취약가구 샘플 데이터 등록 API 구현

3순위:

- AI 호출 로그 조회 API 구현
- 집계 cache/materialized view 정리
- 권한/감사 로그/개인정보 암호화 정책 강화

API 명세:

- 이 문서 2장 15개 API를 1차 계약으로 사용
- 프론트 연결 지점은 `lib/api/index.ts`, `lib/store/AppState.tsx`

DB 명세:

- 이 문서 7장의 13개 테이블 초안을 기준으로 migration 작성
- 민감정보는 별도 encryption 또는 field-level protection 권장

위험도 계산 로직:

- 이 문서 3장의 deterministic rule 구현
- LLM 호출 금지
- `algorithm_version`을 저장해 추후 가중치 변경에 대비

### 강신우: AI 에이전트

1순위:

- Bedrock 호출 모듈 구현
- 개인정보 필터링/sanitizer 구현
- 전화 스크립트 생성
- 방문 체크리스트 생성
- LLM 캐시 처리
- LLM 호출 로그 기록

2순위:

- 오늘 운영 브리핑 문안 생성
- 생활 메모 자연어 분석
- 평균 출력 토큰/LLM 미사용 처리율 계산 로직 지원

3순위:

- 사용자 맞춤 행동계획 생성 고도화
- 사진 분석 연동 interface 준비
- prompt versioning 및 A/B prompt 관리

Bedrock 모듈:

- `generate(type, sanitizedInput, options)` 형태의 공통 함수 권장
- 응답은 `{ title, body | json, tokens, cached, modelId, promptVersion }`

프롬프트:

- 이 문서 6장의 5개 프롬프트 초안을 v0.1로 사용
- 출력은 JSON을 우선으로 하고, 프론트 표시 직전 문장만 렌더링

캐시/로그:

- `ai_cache`, `ai_generation_logs` 사용
- cache hit도 호출 절감 지표에 반영

개인정보 필터링:

- 이름, 전화번호, 상세주소, 생년월일 전체, 병원명, 복용약 상세명, 보호자 연락처 제거
- 연령대, 취약 여부, 연락 가능 여부 등 비식별 요약만 전달

## 9. GitHub README에 넣을 팀 작업 안내 섹션

아래 내용을 README에 추가하면 팀원이 clone 후 바로 맥락을 잡을 수 있다.

````md
## Backend/AI 연결 안내

### 프로젝트 개요

CoolLink AI는 폭염 상황에서 개인의 주거환경, 생활패턴, 건강/돌봄 정보를 바탕으로 오늘의 위험도와 행동계획을 보여주고, 관리자에게는 취약가구 우선순위와 조치 도구를 제공하는 프론트엔드 MVP입니다.

### 현재 프론트 상태

- Next.js App Router 기반 프론트엔드
- mock data + client state(localStorage)로 전체 데모 동작
- 구현 화면: 랜딩, 사용자 홈, 주거설정, 마이페이지, 도움 요청, 관리자 대시보드, 가구 상세, AI 절감률 패널
- LLM 관련 기능은 현재 템플릿 mock으로 동작

### mock data 위치

- `lib/mock/user.ts`: 사용자/보호자 주거환경, 건강/돌봄 기본값
- `lib/mock/households.ts`: 관리자 취약가구 샘플
- `lib/mock/help.ts`: 도움 요청 카테고리/태그/추천 조치
- `lib/mock/weather.ts`: 오늘 날씨
- `lib/mock/metrics.ts`: AI 절감률/운영 지표
- `lib/risk/score.ts`: 관리자 위험도/우선순위
- `lib/risk/profileRisk.ts`: 사용자 홈 위험도

### API 연결 예정 지점

- `lib/api/index.ts`: fetch 계층으로 교체 예정
- `lib/store/AppState.tsx`: 저장/도움요청/조치기록/LLM 로그 state를 API 호출로 교체 예정

### 백엔드 담당자 작업

- 사용자 기본 정보, 주거환경, 건강/비상정보 저장/조회 API
- 도움 요청 접수/상태 조회 API
- 취약가구 목록/상세 API
- 위험도 계산 API
- 관리자 우선순위 리스트/오늘 운영 통계 API
- 조치 결과 기록/업무 배정 API
- 날씨 데이터 저장/조회 API
- AI 호출 로그 조회 API

### AI 담당자 작업

- Bedrock 호출 모듈
- 전화 스크립트 생성
- 방문 체크리스트 생성
- 오늘 운영 브리핑 생성
- 생활 메모 분석
- LLM 캐시/로그/토큰 지표
- 개인정보 필터링

### 실행 방법

```bash
npm install
npm run dev
```

접속: http://localhost:3101

### 향후 연결 순서

1. DB migration 및 seed 데이터 등록
2. 사용자/주거/건강 프로필 API 연결
3. 날씨 API 및 위험도 계산 API 연결
4. 도움 요청 API 연결
5. 관리자 목록/상세/조치 기록 API 연결
6. Bedrock 기반 문서 생성 API 연결
7. AI 절감률 패널을 실제 `ai_generation_logs` 집계로 교체
````
