# FC온라인 넥슨 사이트 로그인 기능 분석 보고서

## 1. 개요
- **분석 대상**: https://fconline.nexon.com/main/index
- **분석 도구**: Playwright + Node.js
- **분석 일시**: 2025-08-29
- **분석 목적**: FC온라인 사이트의 로그인 기능 및 구조 파악

## 2. 사이트 기본 정보

### 2.1 페이지 구조
- **메인 URL**: https://fconline.nexon.com/
- **로그인 방식**: 넥슨 통합 로그인 시스템 사용
- **로그인 인터페이스**: JavaScript 기반 모달 레이어

### 2.2 네비게이션 구조
```
FC ONLINE 메뉴:
├── 프로필
├── 게임소식
├── 커뮤니티
├── 웹 상점
├── 데이터센터
├── 자료실
└── SPORTS
```

## 3. 로그인 관련 요소 분석

### 3.1 주요 로그인 진입점

#### 1) 메인 로그인 버튼
- **선택자**: `a.btn_login`
- **위치**: 페이지 상단 우측 내비게이션
- **텍스트**: "로그인"
- **onClick**: `top.PS.nxlogin.showLoginLayer(); return false;`

#### 2) 게임 시작 관련 로그인
- **함수명**: `GnxGameStartOnClick()`
- **동작**: `top.PS.nxlogin.showLoginLayer()` 호출
- **목적**: 게임 실행 시 로그인 유도

### 3.2 발견된 로그인 관련 DOM 요소

#### A. 링크 요소 (`a` 태그)
1. **해외 로그인 차단 링크**
   - **선택자**: `a[href*="login"]`
   - **링크**: https://security-center.nexon.com/loginblock
   - **텍스트**: "해외 로그인 차단"

2. **메인 로그인 버튼**
   - **클래스**: `btn_login`
   - **링크**: `#` (JavaScript 동작)
   - **onClick**: `top.PS.nxlogin.showLoginLayer(); return false;`
   - **텍스트**: "로그인"

#### B. 버튼 요소 (`button` 태그)
1. **설정 버튼**
   - **클래스**: `btn_setting`
   - **onClick**: `top.PS.nxlogin.showLoginLayer(); return false;`

2. **로그인 버튼**
   - **클래스**: `btn-login`
   - **텍스트**: 없음 (아이콘만)

#### C. 컨테이너 요소 (`div` 태그)
1. **로그인 전 상태 표시**
   - **클래스**: `before_login`
   - **텍스트**: "로그인이 필요한 서비스입니다."

2. **GNB 로그인 영역**
   - **클래스**: `gnbLogin`
   - **텍스트**: "로그인"

### 3.3 JavaScript 로그인 시스템

#### 핵심 함수들
```javascript
// 1. 게임 시작 시 로그인 호출
function GnxGameStartOnClick(argument) {
    top.PS.nxlogin.showLoginLayer();
}

// 2. 캐시 충전 시 로그인 호출
function GetCashChargePop() {
    top.PS.nxlogin.showLoginLayer(); // 로그인 체크 후 진행
}

// 3. 쿠폰 등록 시 로그인 호출
// onClick="top.PS.nxlogin.showLoginLayer(); return false;"
```

#### 로그인 레이어 시스템
- **메인 함수**: `top.PS.nxlogin.showLoginLayer()`
- **특징**: 모달 팝업 방식으로 동작
- **통합성**: 넥슨 계정 통합 로그인 시스템

## 4. 로그인 프로세스 추정

### 4.1 로그인 플로우
```
1. 사용자가 로그인 버튼 클릭
   ↓
2. JavaScript 함수 호출: top.PS.nxlogin.showLoginLayer()
   ↓
3. 넥슨 통합 로그인 모달 레이어 표시
   ↓
4. 사용자 인증 (ID/PW 또는 SNS)
   ↓
5. 인증 성공 시 페이지 리로드 및 로그인 상태 변경
```

### 4.2 로그인 후 변경사항
- `before_login` 클래스 영역이 사용자 정보로 변경
- 내비게이션에서 "로그인" → "로그아웃" 변경
- 개인화된 메뉴 활성화

## 5. 페이지 내 키워드 분석

### 5.1 로그인 관련 키워드 출현 빈도
- **login**: 다수 출현 (JavaScript 함수, 클래스명 등)
- **Login**: JavaScript 함수명에서 사용
- **LOGIN**: 대문자 형태로도 사용
- **로그인**: 한글 텍스트로 UI에 표시
- **nxlogin**: 넥슨 로그인 시스템 식별자
- **showLoginLayer**: 핵심 로그인 함수명

## 6. 예상 로그인 폼 구조

### 6.1 넥슨 통합 로그인 모달 예상 구조
```html
<!-- 예상 로그인 모달 구조 -->
<div class="login-modal" style="display: block;">
    <form id="loginForm">
        <div class="login-fields">
            <input type="text" name="user_id" placeholder="넥슨 ID" required>
            <input type="password" name="password" placeholder="비밀번호" required>
        </div>
        
        <div class="login-options">
            <label>
                <input type="checkbox" name="auto_login"> 자동 로그인
            </label>
            <label>
                <input type="checkbox" name="save_id"> 아이디 저장
            </label>
        </div>
        
        <div class="login-buttons">
            <button type="submit" class="btn-login">로그인</button>
        </div>
        
        <div class="sns-login">
            <button class="btn-kakao">카카오 로그인</button>
            <button class="btn-naver">네이버 로그인</button>
        </div>
        
        <div class="login-links">
            <a href="#">아이디 찾기</a>
            <a href="#">비밀번호 찾기</a>
            <a href="#">회원가입</a>
        </div>
    </form>
</div>
```

### 6.2 예상 입력 필드 선택자
- **아이디 필드**: `input[name="user_id"]`, `input[type="text"]`
- **비밀번호 필드**: `input[name="password"]`, `input[type="password"]`
- **로그인 버튼**: `button[type="submit"]`, `.btn-login`
- **SNS 로그인**: `.btn-kakao`, `.btn-naver`

## 7. SNS 로그인 지원 여부

### 7.1 넥슨 계정 시스템 SNS 연동
넥슨은 일반적으로 다음 SNS 로그인을 지원:
- **카카오** (Kakao)
- **네이버** (Naver)
- **구글** (Google)
- **페이스북** (Facebook)

### 7.2 예상 SNS 로그인 선택자
```css
/* 카카오 로그인 */
.btn-kakao, [class*="kakao"], [id*="kakao"]

/* 네이버 로그인 */  
.btn-naver, [class*="naver"], [id*="naver"]

/* 구글 로그인 */
.btn-google, [class*="google"], [id*="google"]
```

## 8. 테스트 자동화를 위한 권장 선택자

### 8.1 로그인 트리거
```javascript
// 1차 선택자 (추천)
'a.btn_login'

// 2차 선택자 (백업)
'[onclick*="showLoginLayer"]'

// JavaScript 직접 호출
page.evaluate(() => top.PS.nxlogin.showLoginLayer());
```

### 8.2 로그인 폼 요소 (모달 내부)
```javascript
// 아이디 입력
'input[type="text"]', 'input[name*="id"]', 'input[placeholder*="아이디"]'

// 비밀번호 입력
'input[type="password"]', 'input[name*="pass"]', 'input[placeholder*="비밀번호"]'

// 로그인 버튼
'button[type="submit"]', 'button:has-text("로그인")', '.btn-login'

// SNS 로그인 버튼
'button:has-text("카카오")', 'button:has-text("네이버")'
```

## 9. 에러 처리 및 검증 포인트

### 9.1 예상 에러 메시지 영역
- **선택자**: `.error`, `.alert`, `[class*="err"]`, `[id*="error"]`
- **검증 내용**: 
  - 아이디/비밀번호 미입력 에러
  - 잘못된 계정 정보 에러
  - 네트워크 연결 에러
  - 계정 잠금 에러

### 9.2 성공 검증 포인트
- **URL 변경**: 로그인 후 리다이렉트 여부
- **DOM 변경**: `.before_login` 클래스 사라짐
- **사용자 정보**: 사용자명이나 프로필 정보 표시
- **메뉴 변경**: "로그인" → "로그아웃" 버튼 변경

## 10. 자동화 스크립트 작성 시 고려사항

### 10.1 기술적 고려사항
1. **모달 대기 시간**: 로그인 레이어 로드 시간 고려
2. **iframe 처리**: 넥슨 로그인이 iframe으로 로드될 가능성
3. **새 창 처리**: 팝업 창으로 로그인 페이지가 열릴 가능성
4. **CORS 제한**: 외부 도메인 접근 제한 가능성

### 10.2 안정성 확보 방안
1. **명시적 대기**: `waitForSelector()` 적극 활용
2. **재시도 로직**: 네트워크 불안정 상황 대비
3. **다중 선택자**: 백업 선택자 준비
4. **스크린샷**: 각 단계별 화면 캡처로 디버깅 지원

## 11. 결론 및 권장사항

### 11.1 분석 결과 요약
- ✅ FC온라인은 넥슨 통합 로그인 시스템 사용
- ✅ JavaScript 기반 모달 레이어 방식
- ✅ 다양한 로그인 진입점 제공
- ✅ SNS 로그인 지원 예상
- ⚠️ 실제 로그인 폼은 동적 로드로 인해 추가 분석 필요

### 11.2 다음 단계 권장사항
1. **실제 로그인 모달 분석**: 로그인 버튼 클릭 후 나타나는 실제 폼 구조 분석
2. **네트워크 환경 개선**: 안정적인 연결로 실제 로그인 플로우 테스트
3. **테스트 계정 확보**: 실제 로그인 테스트를 위한 유효한 넥슨 계정
4. **SNS 로그인 테스트**: 카카오, 네이버 등 SNS 로그인 플로우 확인

### 11.3 테스트 케이스 후보
1. **정상 로그인**: 유효한 ID/PW로 로그인 성공
2. **비정상 로그인**: 잘못된 정보로 로그인 실패
3. **필수 필드 검증**: 아이디/비밀번호 미입력 시 처리
4. **SNS 로그인**: 카카오, 네이버 로그인 테스트
5. **로그인 상태 유지**: 자동 로그인, 아이디 저장 기능 테스트

---

**분석자**: AI Test Automation  
**분석 완료일**: 2025-08-29  
**도구**: Playwright + Node.js  
**상태**: 1차 분석 완료, 실제 로그인 폼 분석 필요