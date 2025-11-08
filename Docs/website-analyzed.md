# FC온라인 넥슨 사이트 로그인 기능 분석 보고서

## 📋 개요
- **분석 대상**: FC온라인 넥슨 사이트 (https://fconline.nexon.com/main/index)
- **분석 목적**: 로그인 기능 테스트 자동화를 위한 웹 구조 분석
- **분석 일자**: 2025-08-29

## 🔍 웹사이트 구조 분석

### 1. 로그인 진입점
- **메인 페이지**: https://fconline.nexon.com/main/index
- **로그인 트리거**: JavaScript 함수 `top.PS.nxlogin.showLoginLayer()` 호출
- **로그인 형태**: 모달(Modal) 방식으로 표시

### 2. 로그인 모달 구조

#### 2.1 로그인 방법
1. **넥슨ID 로그인** (기본 방식)
2. **일회용 로그인**
3. **QR 로그인**

#### 2.2 입력 필드
- **아이디 입력 필드**
  - 플레이스홀더: "넥슨ID (아이디 또는 이메일)"
  - 예상 CSS 선택자: `input[placeholder*="넥슨ID"]` 또는 `input[placeholder*="아이디 또는 이메일"]`
  
- **비밀번호 입력 필드**
  - 플레이스홀더: "비밀번호"
  - 예상 CSS 선택자: `input[type="password"]`

- **로그인 상태 유지 체크박스**
  - 텍스트: "로그인 상태 유지"
  - 예상 CSS 선택자: `input[type="checkbox"]`

#### 2.3 로그인 버튼
- **메인 로그인 버튼**
  - 텍스트: "넥슨ID 로그인"
  - 스타일: 검은색 배경
  - 예상 CSS 선택자: `button:has-text("넥슨ID 로그인")`

### 3. SNS 로그인 옵션

#### 3.1 지원 SNS 플랫폼
1. **Facebook 로그인**
   - 버튼 텍스트: "Facebook 계정으로 로그인"
   - 예상 선택자: `button:has-text("Facebook 계정으로 로그인")`

2. **Google 로그인**
   - 버튼 텍스트: "Google 계정으로 로그인"
   - 예상 선택자: `button:has-text("Google 계정으로 로그인")`

3. **Naver 로그인**
   - 버튼 텍스트: "Naver 계정으로 로그인"
   - 예상 선택자: `button:has-text("Naver 계정으로 로그인")`

4. **Apple 로그인**
   - 버튼 텍스트: "Apple 계정으로 로그인"
   - 예상 선택자: `button:has-text("Apple 계정으로 로그인")`

### 4. 추가 링크 및 기능

#### 4.1 계정 관리 링크
- **회원가입**: `a:has-text("회원가입")`
- **넥슨ID 찾기**: `a:has-text("넥슨ID 찾기")`
- **비밀번호 찾기**: `a:has-text("비밀번호 찾기")`
- **보안센터**: `a:has-text("보안센터")`

### 5. DOM 요소 및 CSS 선택자 정리

#### 5.1 핵심 선택자
```css
/* 로그인 모달 */
.nexon-login-modal

/* 로그인 입력 필드 */
input[placeholder*="넥슨ID"]
input[placeholder*="아이디 또는 이메일"]  
input[type="password"]

/* 로그인 버튼 */
button:has-text("넥슨ID 로그인")

/* SNS 로그인 버튼 */
button:has-text("Facebook 계정으로 로그인")
button:has-text("Google 계정으로 로그인")
button:has-text("Naver 계정으로 로그인")  
button:has-text("Apple 계정으로 로그인")

/* 체크박스 */
input[type="checkbox"] // 로그인 상태 유지

/* 링크 */
a:has-text("회원가입")
a:has-text("넥슨ID 찾기")
a:has-text("비밀번호 찾기")
```

### 6. 사용자 플로우 분석

#### 6.1 정상 로그인 플로우
1. 메인 페이지 접속
2. 로그인 모달 호출 (JavaScript 트리거)
3. 아이디/비밀번호 입력
4. 로그인 버튼 클릭
5. 로그인 성공 시 페이지 이동 (예상: https://fconline.nexon.com/main/index#today)

#### 6.2 SNS 로그인 플로우
1. 메인 페이지 접속
2. 로그인 모달 호출
3. SNS 로그인 버튼 클릭 (Facebook/Google/Naver/Apple)
4. 해당 SNS 인증 페이지로 이동
5. SNS 인증 완료 후 FC온라인으로 돌아옴

### 7. 에러 처리 및 예외 상황

#### 7.1 예상 에러 시나리오
- 잘못된 아이디/비밀번호 입력
- 존재하지 않는 계정
- 네트워크 연결 오류
- 로그인 시도 횟수 초과
- SNS 로그인 취소/실패

#### 7.2 에러 메시지 표시 영역
- 로그인 모달 내 에러 메시지 영역 존재 (추정)
- 예상 선택자: `.error-message` 또는 `.alert` 등

### 8. 자동화 테스트 권장사항

#### 8.1 대기 전략
- 로그인 모달 로딩 완료 대기: 명시적 대기(Explicit Wait) 사용
- SNS 로그인 시 외부 페이지 이동 대기
- 에러 메시지 표시 대기

#### 8.2 선택자 우선순위
1. 1순위: `placeholder` 속성 기반 선택자 (가장 안정적)
2. 2순위: `has-text()` 기반 선택자 (텍스트 변경 시 취약)
3. 3순위: CSS 클래스 기반 선택자 (UI 변경 시 취약)

#### 8.3 테스트 환경 고려사항
- 브라우저별 호환성 (Chrome, Firefox, Edge)
- 모바일/데스크톱 반응형 대응
- 캐시 및 세션 관리

## 📊 분석 완료 상태
✅ 사이트 접속 및 기본 구조 파악  
✅ 로그인 진입점 확인  
✅ 로그인 모달 상세 분석  
✅ 로그인 폼 구조 및 요소 식별  
✅ SNS 로그인 옵션 확인 (4개 플랫폼)  
✅ DOM 요소 및 CSS 선택자 정보 수집  
✅ 사용자 플로우 분석  
✅ 에러 처리 시나리오 정의

---
**분석자**: Claude AI Assistant  
**도구**: Playwright MCP Server  
**최종 업데이트**: 2025-08-29