# 알바몬 모바일 로그인 페이지 구조 분석

## 페이지 정보
- **URL**: https://m.albamon.com/user-account/login?my_page=1
- **페이지 유형**: React 기반 SPA (Single Page Application)
- **분석 일시**: 2025-08-18

## 주요 기능
1. 일반 로그인 (ID + Password)
2. 입력값 유효성 검증
3. 에러 메시지 처리
4. 성공 시 페이지 이동 (/personal/mypage)
5. SNS 로그인 (카카오, 네이버)

## 예상 DOM 구조 및 CSS 셀렉터

### 로그인 폼 요소
```html
<!-- 메인 로그인 폼 -->
<form id="loginForm" class="login-form">
  <!-- 아이디 입력 필드 -->
  <input type="text" id="userId" name="userId" placeholder="아이디를 입력하세요" />
  
  <!-- 비밀번호 입력 필드 -->
  <input type="password" id="userPw" name="userPw" placeholder="비밀번호를 입력하세요" />
  
  <!-- 로그인 버튼 -->
  <button type="submit" id="loginBtn" class="login-btn">로그인</button>
</form>
```

### SNS 로그인 요소
```html
<!-- SNS 로그인 섹션 -->
<div class="sns-login-section">
  <!-- 카카오 로그인 -->
  <button id="kakaoLogin" class="sns-btn kakao-btn">카카오 로그인</button>
  
  <!-- 네이버 로그인 -->
  <button id="naverLogin" class="sns-btn naver-btn">네이버 로그인</button>
</div>
```

### 에러 메시지 및 알림 요소
```html
<!-- 에러 메시지 표시 영역 -->
<div id="errorMessage" class="error-msg" style="display: none;"></div>

<!-- 성공 메시지 표시 영역 -->
<div id="successMessage" class="success-msg" style="display: none;"></div>
```

## CSS 셀렉터 매핑

| 요소 | CSS 셀렉터 (우선순위 순) |
|------|-------------------------|
| 아이디 입력 필드 | `#userId`, `input[name="userId"]`, `.login-form input[type="text"]` |
| 비밀번호 입력 필드 | `#userPw`, `input[name="userPw"]`, `.login-form input[type="password"]` |
| 로그인 버튼 | `#loginBtn`, `.login-btn`, `button[type="submit"]` |
| 카카오 로그인 버튼 | `#kakaoLogin`, `.kakao-btn`, `.sns-btn:nth-child(1)` |
| 네이버 로그인 버튼 | `#naverLogin`, `.naver-btn`, `.sns-btn:nth-child(2)` |
| 에러 메시지 영역 | `#errorMessage`, `.error-msg`, `.alert-danger` |
| 성공 메시지 영역 | `#successMessage`, `.success-msg`, `.alert-success` |

## 사용자 플로우

### 정상 로그인 플로우
1. 페이지 로드 → 로그인 폼 표시
2. 아이디 입력 → 유효성 검증
3. 비밀번호 입력 → 유효성 검증
4. 로그인 버튼 클릭 → 서버 인증
5. 인증 성공 → /personal/mypage로 리다이렉트

### SNS 로그인 플로우
1. SNS 로그인 버튼 클릭 (카카오/네이버)
2. 해당 SNS 인증 페이지로 이동
3. SNS 계정으로 인증
4. 인증 성공 → 알바몬으로 돌아와 로그인 완료
5. /personal/mypage로 리다이렉트

## 입력값 유효성 검증 규칙

### 아이디 필드
- 필수 입력
- 빈 값 체크
- 최소/최대 길이 제한 (예상: 4-20자)

### 비밀번호 필드
- 필수 입력
- 빈 값 체크
- 최소/최대 길이 제한 (예상: 6-20자)

## 에러 메시지 유형

| 상황 | 예상 에러 메시지 |
|------|----------------|
| 아이디 미입력 | "아이디를 입력해주세요." |
| 비밀번호 미입력 | "비밀번호를 입력해주세요." |
| 로그인 실패 | "아이디 또는 비밀번호가 일치하지 않습니다." |
| 계정 잠금 | "계정이 잠겨있습니다. 고객센터에 문의해주세요." |
| 서버 오류 | "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요." |

## 테스트 계정 정보
- **아이디**: 
- **비밀번호**: 

## 분석 한계점
1. React SPA 특성상 동적 렌더링으로 인한 정적 분석 제약
2. 실제 CSS 셀렉터와 DOM 구조는 실제 브라우저에서 확인 필요
3. JavaScript 이벤트 핸들링 방식 확인 필요

## 권장 사항
1. 실제 브라우저 개발자 도구를 통한 DOM 구조 재확인
2. Playwright/Selenium의 동적 요소 대기 기능 활용
3. 로그인 성공/실패 후 페이지 변화 확인을 위한 적절한 대기 시간 설정
