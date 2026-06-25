# CoolLink AI Backend Handoff

담당: 김지영  
목적: 현재 CoolLink AI 프론트엔드 MVP의 mock data/state/type을 실제 백엔드 API와 DB로 연결하기 위한 작업 명세입니다.

참조 프론트 파일:

- `lib/types.ts`: 공통 타입
- `lib/store/AppState.tsx`: 현재 client mock state
- `lib/api/index.ts`: API 연결 예정 지점
- `lib/risk/score.ts`: 관리자 가구 위험도/우선순위
- `lib/risk/profileRisk.ts`: 사용자 홈 위험도
- `lib/risk/adminFilters.ts`: 관리자 필터/KPI 계산
- `lib/mock/user.ts`, `lib/mock/households.ts`, `lib/mock/help.ts`, `lib/mock/weather.ts`, `lib/mock/metrics.ts`

## 1. 백엔드가 제공해야 하는 화면별 데이터

### `/user`

사용자 홈에 필요한 데이터:

- 오늘 날짜, 지역, 갱신 시각
- 오늘 날씨: 최고기온, 체감온도, 습도, 폭염특보, 열대야 여부, 날씨 위험도 점수
- 사용자 모드: 본인 모드 또는 보호자 모드
- 주거환경 profile: 본인 집 또는 부모님/가족 집
- 건강/돌봄 정보: 생년월일 기준 나이, 기저질환, 장애, 이동 불편, 복용약, 독거 여부, 보호자 연락 가능 여부
- 위험도 결과: 점수, 등급, 구성 요소, 반영 요인 chips, 설명 문구
- 행동계획: 오전, 점심 전, 오후 피크, 저녁, 밤
- 도움 요청 상태: 요청 여부, 요청 사유, 요청 태그, 요청 출처, 요청 시각
- 주거환경 요약: 거주 형태, 방향, 층수, 에어컨, 냉방비, 낮 시간 집 체류

권장 API:

- `GET /api/users/me/dashboard?target=self|caregiver`

### `/user/profile`

주거환경 설정에 필요한 데이터:

- 기본 주거환경: 거주 형태, 방향, 층수, 건물 노후도
- 냉방/차광: 에어컨, 선풍기, 커튼/블라인드
- 창문/환기: 창문 크기, 창문 개수, 앞 건물 가림, 환기 정도
- 생활패턴: 주 생활 시간대, 낮 시간 집 체류, 취침 시간대, 야외활동 빈도, 더운 시간대 집에 있는 편
- 더위 민감도: 더위 민감도, 선호 실내 온도, 열대야 영향, 불편 증상
- 냉방 사용 성향: 냉방 우선순위, 에어컨 사용 가능 시간, 취침 중 냉방, 냉방비 부담
- 생활 메모: 자유 입력 텍스트
- 사진 분석용 metadata: 창문 사진, 창밖 전경, 실내 창 주변

권장 API:

- `GET /api/users/me/housing-profile?target=self|caregiver`
- `PUT /api/users/me/housing-profile?target=self|caregiver`

### `/user/mypage`

마이페이지에 필요한 데이터:

- 기본 정보: 이름, 생년월일, 성별, ABO 혈액형, RH, 연락처
- 건강 정보: 기저질환 여부/질환명, 장애 여부/장애 유형, 이동 불편 여부, 복용약 여부/복용약, 병원, 병원 연락처, 알레르기/주의사항
- 비상 연락 정보: 보호자 이름, 관계, 연락처, 추가 보호자 연락처, 보호자 연락 가능 여부, 동거인 여부, 동거인 이름/연락처, 위급 시 연락 우선순위
- 생활/돌봄 정보: 혼자 거주 여부, 도움 줄 동거인 여부, 안부 확인 주기, 평소 연락 가능 시간대, 돌봄 서비스 이용 여부
- 119 전달용 비상정보: 위 정보에서 자동 정리된 복사용 text
- 보호자 기능 토글: `caregiverMode`

권장 API:

- `GET /api/users/me/basic-info`
- `PUT /api/users/me/basic-info`
- `GET /api/users/me/safety-profile`
- `PUT /api/users/me/safety-profile`
- `PATCH /api/users/me/preferences`

### `/user/help`

도움 요청에 필요한 데이터:

- 요청 대상: 119 긴급, 지자체/복지센터, 보호자, 생활지원사/관리자
- 요청 카테고리: 응급 증상, 전화 확인 요청, 방문 확인 요청, 냉방 지원 요청, 무더위쉼터 안내
- 사용자 모드/보호자 모드 분기
- 요청 선택 항목
- 주변 도움 가능 여부
- 동거인 이름/연락처
- 접수 완료 상태: 요청 대상, 선택 내용, 다음 조치 안내

권장 API:

- `POST /api/help-requests`
- `GET /api/help-requests/status?target=self|caregiver`

### `/admin`

관리자 대시보드에 필요한 데이터:

- 오늘 날씨
- KPI counts: 전체, 고위험, 전화 필요, 방문 필요, 지원 검토, 완료
- 우선순위 리스트
- 필터별 리스트
- 오늘 운영 브리핑용 집계
- AI 절감률 패널 지표: 전체 분석, 규칙 기반 처리, LLM 호출, 캐시 재사용, LLM 미사용 처리율, 평균 출력 토큰

권장 API:

- `GET /api/admin/today-statistics`
- `GET /api/admin/priority-list?filter=all|highrisk|call|visit|support|done`
- `GET /api/ai/logs?date=YYYY-MM-DD`

### `/admin/households/[id]`

가구 상세에 필요한 데이터:

- 가구 기본 정보
- 위험도 구성
- 위험 요인
- 추천 조치
- 도움 요청 정보
- 전화 스크립트/방문 체크리스트 생성 요청에 필요한 비식별 요약
- 조치 결과 기록 목록
- 상태/담당자

권장 API:

- `GET /api/admin/households/{householdId}`
- `POST /api/admin/households/{householdId}/action-logs`
- `PATCH /api/admin/households/{householdId}/status`
- `PATCH /api/admin/tasks/{taskId}`

## 2. 필수 API 명세

### 2.1 사용자 기본 정보 저장/조회

API:

- `GET /api/users/me/basic-info`
- `PUT /api/users/me/basic-info`

Request:

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

Response:

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

DB:

- `users`
- `user_profiles`

사용 화면:

- `/user/mypage`
- `/user/help`

우선순위: P1

### 2.2 주거환경 저장/조회

API:

- `GET /api/users/me/housing-profile?target=self|caregiver`
- `PUT /api/users/me/housing-profile?target=self|caregiver`

Request:

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

Response:

```json
{
  "target": "self",
  "housingProfile": {
    "household": "원룸",
    "direction": "남서향",
    "floor": "중층",
    "ac": "벽걸이",
    "cost": "보통",
    "dayStay": "오후 오래"
  },
  "riskRecalculationQueued": true,
  "updatedAt": "2026-06-25T00:15:00.000Z"
}
```

DB:

- `housing_profiles`

사용 화면:

- `/user/profile`
- `/user`

우선순위: P1

### 2.3 건강/비상정보 저장/조회

API:

- `GET /api/users/me/safety-profile`
- `PUT /api/users/me/safety-profile`

Request:

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

Response:

```json
{
  "userId": "u_001",
  "safetyProfile": {
    "health": {
      "chronic": "있음",
      "conditions": ["고혈압", "당뇨"],
      "mobility": "불편"
    },
    "emergencyContact": {
      "guardianPhone": "010-1111-2222",
      "guardianReach": "가능"
    },
    "care": {
      "alone": "아니오",
      "checkCycle": "주 1회"
    }
  },
  "riskRecalculationQueued": true,
  "updatedAt": "2026-06-25T00:15:00.000Z"
}
```

DB:

- `health_profiles`
- `emergency_contacts`

사용 화면:

- `/user/mypage`
- `/user`
- `/user/help`

우선순위: P1

### 2.4 도움 요청 접수

API:

- `POST /api/help-requests`

Request:

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

Response:

```json
{
  "helpRequestId": "hr_001",
  "householdId": "H-104",
  "status": "received",
  "requestedAt": "2026-06-25T00:20:00.000Z",
  "helpTags": ["냉방 지원", "쉼터 안내"],
  "helpContactTag": "지자체 요청",
  "recommendedActions": [
    "냉방비 지원 상담",
    "냉방용품 재고 확인",
    "에너지바우처 안내",
    "가까운 쉼터 안내"
  ]
}
```

DB:

- `help_requests`
- `admin_tasks`
- `household_samples` current status snapshot

사용 화면:

- `/user/help`
- `/user`
- `/admin`

우선순위: P1

### 2.5 도움 요청 상태 조회

API:

- `GET /api/help-requests/status?target=self|caregiver`
- `GET /api/help-requests/{helpRequestId}`

Response:

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

DB:

- `help_requests`

사용 화면:

- `/user`
- `/user/help`

우선순위: P1

### 2.6 취약가구 샘플 데이터 등록

API:

- `POST /api/admin/household-samples/import`

Request:

```json
{
  "source": "seed",
  "households": [
    {
      "id": "H-001",
      "region": "햇살동",
      "resident": {
        "ageBand": "70대",
        "alone": true,
        "condition": "고혈압"
      },
      "housing": {
        "type": "단독주택",
        "direction": "남서향",
        "floor": "단층",
        "ac": false,
        "costBurden": "높음",
        "pattern": "종일 재택",
        "age": "노후"
      },
      "components": {
        "personal": 96,
        "housing": 95,
        "care": 100
      },
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

Response:

```json
{
  "inserted": 1,
  "updated": 0,
  "importedAt": "2026-06-25T00:25:00.000Z"
}
```

DB:

- `household_samples`

사용 화면:

- 관리자 seed/운영 초기 데이터

우선순위: P2

### 2.7 취약가구 목록 조회

API:

- `GET /api/admin/households?filter=all&date=2026-06-25`

Response:

```json
{
  "date": "2026-06-25",
  "counts": {
    "all": 17,
    "highrisk": 4,
    "call": 5,
    "visit": 1,
    "support": 5,
    "done": 2
  },
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

DB:

- `household_samples`
- `risk_assessments`

사용 화면:

- `/admin`

우선순위: P1

### 2.8 가구 상세 조회

API:

- `GET /api/admin/households/{householdId}`

Response:

```json
{
  "household": {
    "id": "H-001",
    "region": "햇살동",
    "resident": {
      "ageBand": "70대",
      "alone": true,
      "condition": "고혈압"
    },
    "housing": {
      "type": "단독주택",
      "direction": "남서향",
      "floor": "단층",
      "ac": false,
      "costBurden": "높음",
      "pattern": "종일 재택",
      "age": "노후"
    },
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

DB:

- `household_samples`
- `risk_assessments`
- `action_logs`

사용 화면:

- `/admin/households/[id]`

우선순위: P1

### 2.9 위험도 계산

API:

- `POST /api/risk/assessments`
- `GET /api/risk/assessments/latest?target=self|caregiver`

Request:

```json
{
  "target": "self",
  "weatherId": "weather_2026-06-25_incheon",
  "housingProfileId": "hp_001",
  "healthProfileId": "health_001",
  "helpRequestId": null
}
```

Response:

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

DB:

- `risk_assessments`

사용 화면:

- `/user`
- `/admin`
- `/admin/households/[id]`

우선순위: P1

### 2.10 관리자 우선순위 리스트

API:

- `GET /api/admin/priority-list?filter=highrisk&date=2026-06-25`

Response:

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

DB:

- `household_samples`
- `risk_assessments`
- `help_requests`
- `admin_tasks`

사용 화면:

- `/admin`

우선순위: P1

### 2.11 조치 결과 기록

API:

- `POST /api/admin/households/{householdId}/action-logs`

Request:

```json
{
  "result": "전화 완료",
  "note": "냉방 중이며 수분 섭취 안내 완료",
  "nextVisit": "2026-06-26",
  "status": "완료",
  "by": "김복지"
}
```

Response:

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
  "household": {
    "id": "H-001",
    "status": "완료"
  }
}
```

DB:

- `action_logs`
- `admin_tasks`
- `household_samples.status`

사용 화면:

- `/admin/households/[id]`

우선순위: P1

### 2.12 업무 배정/상태 변경

API:

- `PATCH /api/admin/tasks/{taskId}`
- `PATCH /api/admin/households/{householdId}/status`

Request:

```json
{
  "assignee": "김복지",
  "status": "방문예정",
  "dueAt": "2026-06-25T04:00:00.000Z"
}
```

Response:

```json
{
  "taskId": "task_001",
  "householdId": "H-001",
  "assignee": "김복지",
  "status": "방문예정",
  "updatedAt": "2026-06-25T01:10:00.000Z"
}
```

DB:

- `admin_tasks`
- `household_samples`

사용 화면:

- `/admin`
- `/admin/households/[id]`

우선순위: P2

### 2.13 날씨 데이터 저장/조회

API:

- `POST /api/weather/daily`
- `GET /api/weather/daily?region=인천 미추홀구&date=2026-06-25`

Request:

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

Response:

```json
{
  "weatherId": "weather_2026-06-25_incheon",
  "region": "인천 미추홀구",
  "date": "2026-06-25",
  "score": 90,
  "updatedAt": "2026-06-25T06:00:00.000Z"
}
```

DB:

- `weather_daily`

사용 화면:

- `/user`
- `/admin`

우선순위: P1

### 2.14 AI 호출 로그 조회

API:

- `GET /api/ai/logs?date=2026-06-25`

Response:

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

DB:

- `ai_generation_logs`

사용 화면:

- AI 절감률 플로팅 패널

우선순위: P2

### 2.15 오늘 운영 통계

API:

- `GET /api/admin/today-statistics?date=2026-06-25`

Response:

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

DB:

- 집계 API. 필요 시 materialized view/cache 사용

사용 화면:

- `/admin`
- AI 절감률 플로팅 패널

우선순위: P1

## 3. 위험도 계산 로직

원칙:

- LLM 사용 금지
- 백엔드 코드 기반 deterministic 계산
- 계산 결과는 `risk_assessments`에 저장
- 입력 변경 또는 날씨 갱신 시 재계산

### 3.1 사용자 위험도

현재 mock: `lib/risk/profileRisk.ts`

날씨 위험도:

```ts
score = 38
if alert exists: score += 24
if nightHeat: score += 10
score += max(0, feelsLike - 33) * 2
if humidity >= 70: score += 8
else if humidity >= 60: score += 4
score = clamp(score, 0, 100)
```

주거/냉방 위험도:

- 남서향/서향 +15
- 남향/남동향 +6
- 최상층/반지하 +14
- 노후 +10, 보통 +3
- 창문 큼 +8, 보통 +3
- 앞 건물 가림 없음 +6, 있음 -4
- 환기 잘 안 됨 +8, 보통 +3, 잘 됨 -4
- 커튼 없음 +8, 일반 +2, 암막 -4
- 에어컨 없음 +16, 1대 +6, 2대 +0
- 선풍기 없음 +6
- 냉방비 높음 +10, 보통 +3

생활패턴 위험도:

- 종일 재택 +30
- 오후 오래 +22
- 오후 잠깐 +10
- 더운 시간대 집에 거의 항상 있음 +12
- 자주 있음 +7
- 가끔 있음 +3
- 더위 민감도 매우 힘든 편 +12
- 많이 타는 편 +8
- 보통 +3

건강/돌봄 위험도:

- 65세 이상 +22
- 기저질환 있음 +16
- 장애 있음 +10
- 이동 불편 +10
- 혼자 거주 +14
- 도움 줄 동거인 없음 +6
- 보호자 연락 어려움 +12
- 보호자 연락 가능 -6
- 안부 확인 거의 없음 +14
- 2주 1회 +8
- 매일 -4
- 복용약 있음 +6

냉방 접근성:

- 에어컨 없음 +35
- 에어컨 1대 +12
- 선풍기 없음 +10
- 냉방비 높음 +18
- 냉방비 보통 +6
- 커튼 없음 +8
- 절약 우선 +8
- 균형 +3
- 에어컨 거의 안 씀 +12
- 하루 1시간 이내 +6
- 취침 냉방 거의 안 함 +8
- 취침 냉방 부담됨 +4

일반 사용자:

```ts
score = weather * 0.30 + housing * 0.35 + lifestyle * 0.20 + care * 0.15
```

보호자 모드:

```ts
score = weather * 0.30 + housing * 0.30 + care * 0.30 + cooling * 0.10
```

### 3.2 관리자 가구 위험도

현재 mock: `lib/risk/score.ts`

```ts
score = round(
  weather.score * 0.35 +
  personal * 0.25 +
  housing * 0.25 +
  care * 0.15
)

care = helpRequested ? max(baseCare, 95) : baseCare
```

등급:

- 80점 이상: 긴급 확인
- 60~79점: 오늘 중 전화 또는 방문
- 40~59점: 행동요령 안내
- 40점 미만: 일반 모니터링

반영 요소:

- 최고기온, 체감온도, 습도, 폭염특보, 열대야 여부
- 거주 형태, 방향, 층수, 건물 노후도
- 에어컨 유무/종류, 선풍기 유무, 커튼/블라인드
- 창문 크기, 창문 개수, 앞 건물 가림 여부, 환기 정도
- 생활패턴, 낮 시간 집 체류, 취침 시간대
- 더위 민감도, 냉방 사용 성향
- 생년월일 기준 나이, 기저질환 여부, 장애 여부, 이동 불편 여부, 복용약 여부
- 혼자 거주 여부, 보호자 연락 가능 여부, 최근 안부 확인 주기
- 도움 요청 여부, 응급 요청 여부

## 4. 관리자 우선순위 정렬

정렬 기준:

1. 응급 확인 필요
2. 위험도 점수
3. 도움 요청 여부
4. 독거/고령/기저질환/장애 등 취약도
5. 최근 연락 공백
6. 방문 필요 여부
7. 전화 확인 필요 여부
8. 지원 검토 여부
9. 요청 발생 시간

응급 판단:

```ts
emergency =
  helpTags includes "응급 확인" ||
  helpContactTag === "응급 확인 필요"
```

권장 `priorityScore`:

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

가중치:

- emergencyBonus: +100
- helpRequestBonus: +20
- vulnerableBonus: +15
- contactGapBonus: +10
- visitNeedBonus: +8
- callNeedBonus: +6
- supportNeedBonus: +5
- recentRequestBonus: +3

주의:

- 최근 요청만으로 위험도가 낮은 가구가 무조건 1순위가 되면 안 된다.
- 응급 최우선 보장이 필요하면 tuple sort를 사용한다.
- 설명용 score와 실제 정렬 tuple을 분리해도 된다.

필터:

- 전체: 모든 가구
- 고위험: `grade === urgent`
- 전화 필요: `status !== 완료` and (`status === 전화중` or (`grade === call` and `status === 대기`))
- 방문 필요: `status === 방문예정`
- 지원 검토: `status !== 완료` and (`status === 지원검토` or `needsSupport`)
- 완료: `status === 완료`

## 5. DB 테이블 초안

### `users`

- `id`
- `email`
- `provider`
- `role`: user/admin/worker
- `created_at`
- `updated_at`
- `deleted_at`

### `user_profiles`

- `id`
- `user_id`
- `name`
- `birth`
- `gender`
- `blood`
- `rh`
- `phone`
- `caregiver_mode`
- `created_at`
- `updated_at`

### `housing_profiles`

- `id`
- `user_id`
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

### `health_profiles`

- `id`
- `user_id`
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

### `emergency_contacts`

- `id`
- `user_id`
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

### `household_samples`

- `id`
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

### `weather_daily`

- `id`
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

### `risk_assessments`

- `id`
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

### `help_requests`

- `id`
- `user_id`
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

### `admin_tasks`

- `id`
- `household_id`
- `help_request_id`
- `task_type`: call/visit/support/shelter/emergency
- `status`: 대기/전화중/방문예정/지원검토/완료
- `assignee`
- `priority_score`
- `priority_reasons` JSON/text array
- `due_at`
- `completed_at`
- `created_at`
- `updated_at`

### `action_logs`

- `id`
- `household_id`
- `task_id`
- `at`
- `result`
- `note`
- `next_visit`
- `by`
- `created_at`

### `ai_generation_logs`

- `id`
- `type`
- `user_id`
- `household_id`
- `prompt_version`
- `model_id`
- `input_hash`
- `output_tokens`
- `cached`
- `latency_ms`
- `status`
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

## 6. 김지영 TODO

### 1순위

- 사용자 기본 정보 저장/조회 API
- 주거환경 저장/조회 API
- 건강/비상정보 저장/조회 API
- 날씨 데이터 저장/조회 API
- 위험도 계산 API
- 도움 요청 접수/상태 조회 API
- 관리자 가구 목록/상세 API
- 오늘 운영 통계 API

### 2순위

- 관리자 우선순위 리스트 API
- 조치 결과 기록 API
- 업무 배정/상태 변경 API
- 취약가구 샘플 데이터 등록 API

### 3순위

- AI 호출 로그 조회 API
- 집계 cache/materialized view
- 개인정보 암호화/권한/감사 로그 강화

### API 명세

- 이 문서 2장의 15개 API를 1차 계약으로 사용
- 프론트 연결 지점은 `lib/api/index.ts`, `lib/store/AppState.tsx`

### DB 명세

- 이 문서 5장의 테이블 초안을 기준으로 migration 작성
- 민감정보는 field-level encryption 또는 별도 보호 정책 권장

### 위험도 계산 로직

- 이 문서 3장의 deterministic rule 구현
- LLM 호출 금지
- `algorithm_version` 저장
