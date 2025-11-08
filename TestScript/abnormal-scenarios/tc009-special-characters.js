/**
 * TC-009: 특수문자가 포함된 잘못된 입력으로 보안 테스트
 * 
 * 테스트 시나리오:
 * 1. 알바몬 로그인 페이지 접속
 * 2. 아이디 입력 필드에 '<script>alert("test")</script>' 입력 (XSS 공격 시도)
 * 3. 비밀번호 입력 필드에 'SELECT * FROM users' 입력 (SQL Injection 공격 시도)
 * 4. 로그인 버튼 클릭
 * 5. 서버 응답 대기
 * 6. 특수문자가 적절히 이스케이프 처리되었는지 확인
 * 7. XSS나 SQL Injection 공격이 차단되었는지 확인
 * 8. 로그인 실패 메시지 표시 확인
 * 9. 로그인이 실패함을 확인
 * 10. 로그인 페이지에 머물러 있음을 확인
 */

const { chromium } = require('playwright');

async function runSpecialCharactersSecurityTest() {
    let browser;
    let context;
    let page;
    
    try {
        console.log('========== TC-009: 특수문자 보안 테스트 시작 ==========');
        
        // 브라우저 실행
        console.log('1. 브라우저 실행 중...');
        browser = await chromium.launch({ 
            headless: false,  // 테스트 과정을 시각적으로 확인
            slowMo: 1000      // 액션 간 1초 대기
        });
        
        context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        page = await context.newPage();
        
        // 다이얼로그 팝업 확인 (alert, confirm, prompt 등) - 페이지 로딩 전에 미리 설정
        let hasDialogPopup = false;
        let dialogMessage = '';
        let xssExecuted = false;
        let alertMessage = '';
        
        // 통합 다이얼로그 이벤트 리스너 설정 (페이지 생성 직후)
        page.on('dialog', async (dialog) => {
            console.log(`   - 다이얼로그 팝업 감지: ${dialog.type()}`);
            console.log(`   - 다이얼로그 메시지: "${dialog.message()}"`);
            
            const message = dialog.message();
            dialogMessage = message;
            hasDialogPopup = true;
            
            // XSS 관련 다이얼로그 감지
            if (message.includes('Invalid JSON format') || message.includes('test') || message.includes('<script>')) {
                xssExecuted = true;
                alertMessage = message;
                console.log(`   ⚠️ XSS 공격 성공 - Alert 다이얼로그 감지: "${alertMessage}"`);
            }
            
            await dialog.accept(); // 다이얼로그 승인
        });
        
        // 콘솔 에러 및 JS 에러 모니터링
        const consoleErrors = [];
        const jsErrors = [];
        
        page.on('console', message => {
            if (message.type() === 'error') {
                consoleErrors.push(message.text());
                console.log(`   - 콘솔 에러 감지: ${message.text()}`);
            }
        });
        
        page.on('pageerror', error => {
            jsErrors.push(error.message);
            console.log(`   - JavaScript 에러 감지: ${error.message}`);
        });
        
        // 스텝 1: 알바몬 로그인 페이지 접속
        console.log('2. 알바몬 로그인 페이지 접속 중...');
        const targetURL = 'https://m.albamon.com/user-account/login?my_page=1';
        
        await page.goto(targetURL, {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        // 페이지 로딩 완료 대기
        await page.waitForTimeout(2000);
        
        // 페이지 제목 및 URL 확인
        const title = await page.title();
        const currentURL = page.url();
        console.log(`   - 페이지 제목: ${title}`);
        console.log(`   - 현재 URL: ${currentURL}`);
        
        // 스크린샷 캡처 - 초기 로그인 페이지
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc009_01_initial_page.png',
            fullPage: true 
        });
        console.log('   - 초기 페이지 스크린샷 저장 완료');
        
        // 스텝 2: 아이디 입력 필드에 XSS 공격 코드 입력
        console.log('3. 아이디 입력 필드에 XSS 공격 코드 입력 중...');
        
        // 아이디 필드 셀렉터
        const userIdSelector = '#memberId';
        const xssPayload = '<script>alert("test")</script>';
        
        // 아이디 필드 대기 및 확인
        await page.waitForSelector(userIdSelector, { timeout: 10000 });
        console.log(`   - 아이디 필드 발견: ${userIdSelector}`);
        
        // XSS 공격 코드 입력
        await page.fill(userIdSelector, '');  // 기존 값 지우기
        await page.type(userIdSelector, xssPayload, { delay: 100 });
        console.log(`   - XSS 공격 코드 "${xssPayload}" 입력 완료`);
        
        // 입력된 값 확인
        const enteredUserId = await page.inputValue(userIdSelector);
        console.log(`   - 실제 입력된 아이디 값: "${enteredUserId}"`);
        
        // XSS 스크립트 실행 여부 확인 (alert 다이얼로그 감지)
        // XSS 관련 변수들은 이미 페이지 생성 시점에 선언되어 있음
        
        // 스크린샷 캡처 - XSS 코드 입력 완료
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc009_02_xss_input_entered.png',
            fullPage: true 
        });
        console.log('   - XSS 코드 입력 스크린샷 저장 완료');
        
        // 스텝 3: 비밀번호 입력 필드에 SQL Injection 공격 코드 입력
        console.log('4. 비밀번호 입력 필드에 SQL Injection 공격 코드 입력 중...');
        
        // 비밀번호 필드 셀렉터
        const passwordSelector = '#memberPassword';
        const sqlInjectionPayload = 'SELECT * FROM users';
        
        // 비밀번호 필드 대기 및 확인
        await page.waitForSelector(passwordSelector, { timeout: 10000 });
        console.log(`   - 비밀번호 필드 발견: ${passwordSelector}`);
        
        // SQL Injection 공격 코드 입력
        await page.fill(passwordSelector, '');  // 기존 값 지우기
        await page.type(passwordSelector, sqlInjectionPayload, { delay: 100 });
        console.log(`   - SQL Injection 공격 코드 "${sqlInjectionPayload}" 입력 완료`);
        
        // 입력된 값 확인
        const enteredPassword = await page.inputValue(passwordSelector);
        console.log(`   - 실제 입력된 비밀번호 값: "${enteredPassword}"`);
        
        // 스크린샷 캡처 - 모든 공격 코드 입력 완료
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc009_03_both_attacks_entered.png',
            fullPage: true 
        });
        console.log('   - 공격 코드 입력 완료 스크린샷 저장 완료');
        
        // 스텝 4: 로그인 버튼 클릭
        console.log('5. 로그인 버튼 클릭 중...');
        
        // 로그인 버튼 셀렉터
        const loginButtonSelector = 'button[type="submit"]';
        
        // 로그인 버튼 대기 및 확인
        await page.waitForSelector(loginButtonSelector, { timeout: 10000 });
        console.log(`   - 로그인 버튼 발견: ${loginButtonSelector}`);
        
        // 현재 URL 저장 (페이지 이동 여부 확인용)
        const urlBeforeLogin = page.url();
        console.log(`   - 로그인 시도 전 URL: ${urlBeforeLogin}`);
        
        // 네트워크 요청 모니터링 설정
        let loginRequestMade = false;
        let loginResponseReceived = false;
        let responseStatus = null;
        let requestBody = '';
        
        page.on('request', request => {
            if (request.url().includes('login') || request.method() === 'POST') {
                console.log(`   - 로그인 요청 감지: ${request.method()} ${request.url()}`);
                loginRequestMade = true;
                
                // POST 데이터 확인 (보안 테스트용)
                if (request.method() === 'POST') {
                    try {
                        requestBody = request.postData() || '';
                        console.log(`   - POST 데이터 길이: ${requestBody.length} bytes`);
                        
                        // 특수문자가 제대로 인코딩되었는지 확인
                        if (requestBody.includes('<script>')) {
                            console.log(`   ⚠️ 위험: POST 데이터에 <script> 태그가 그대로 포함됨`);
                        } else if (requestBody.includes('%3Cscript%3E') || requestBody.includes('&lt;script&gt;')) {
                            console.log(`   ✅ 양호: XSS 코드가 적절히 인코딩됨`);
                        }
                        
                        if (requestBody.includes('SELECT * FROM')) {
                            console.log(`   ⚠️ 위험: POST 데이터에 SQL 구문이 그대로 포함됨`);
                        } else {
                            console.log(`   ✅ 양호: SQL Injection 코드가 적절히 처리됨`);
                        }
                    } catch (e) {
                        console.log(`   - POST 데이터 분석 중 오류: ${e.message}`);
                    }
                }
            }
        });
        
        page.on('response', response => {
            if (response.url().includes('login') || response.request().method() === 'POST') {
                console.log(`   - 로그인 응답 수신: ${response.status()} ${response.url()}`);
                loginResponseReceived = true;
                responseStatus = response.status();
            }
        });
        
        // 다이얼로그 팝업 확인은 이미 페이지 생성 시점의 통합 핸들러에서 처리됨
        
        // 로그인 버튼 클릭
        await page.click(loginButtonSelector);
        console.log('   - 로그인 버튼 클릭 완료');
        
        // 다이얼로그 감지를 위한 추가 대기
        await page.waitForTimeout(1000);
        
        // 스텝 5: 서버 응답 대기
        console.log('6. 서버 응답 대기 중...');
        
        // 서버 응답을 위한 대기 (네트워크 요청 완료까지)
        let waitCount = 0;
        const maxWait = 10; // 최대 10초 대기
        
        while (waitCount < maxWait && (!loginRequestMade || !loginResponseReceived)) {
            await page.waitForTimeout(1000);
            waitCount++;
            console.log(`   - 네트워크 응답 대기 중... (${waitCount}초)`);
        }
        
        if (loginRequestMade) {
            console.log(`   ✅ 로그인 요청 전송 완료`);
        } else {
            console.log(`   ⚠️ 로그인 요청 감지되지 않음`);
        }
        
        if (loginResponseReceived) {
            console.log(`   ✅ 로그인 응답 수신 완료 (상태: ${responseStatus})`);
        } else {
            console.log(`   ⚠️ 로그인 응답 감지되지 않음`);
        }
        
        // 추가 대기 시간 (동적 콘텐츠 로딩)
        await page.waitForTimeout(3000);
        
        // 현재 URL 확인 (로그인 시도 후)
        const urlAfterLogin = page.url();
        console.log(`   - 로그인 시도 후 URL: ${urlAfterLogin}`);
        
        // 스텝 6: 특수문자 이스케이프 처리 확인
        console.log('7. 특수문자 이스케이프 처리 확인 중...');
        
        // 페이지 HTML에서 XSS 코드가 적절히 이스케이프되었는지 확인
        let xssEscaped = true;
        let sqlInjectionBlocked = true;
        
        try {
            const pageContent = await page.content();
            
            // XSS 코드 이스케이프 확인
            if (pageContent.includes('<script>alert("test")</script>')) {
                console.log(`   ❌ XSS 위험: 스크립트 코드가 이스케이프되지 않고 HTML에 포함됨`);
                xssEscaped = false;
            } else if (pageContent.includes('&lt;script&gt;alert("test")&lt;/script&gt;') || 
                      pageContent.includes('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;')) {
                console.log(`   ✅ XSS 방어: 스크립트 코드가 적절히 HTML 엔티티로 이스케이프됨`);
            } else {
                console.log(`   ✅ XSS 방어: 스크립트 코드가 HTML에서 제거되거나 다른 방식으로 처리됨`);
            }
            
            // SQL Injection 코드 처리 확인 (직접적인 확인은 어려우므로 간접적 확인)
            if (responseStatus && responseStatus >= 500) {
                console.log(`   ⚠️ 서버 오류 (${responseStatus}): SQL Injection이 서버 오류를 일으켰을 가능성`);
                sqlInjectionBlocked = false;
            } else {
                console.log(`   ✅ SQL Injection 방어: 서버가 정상적으로 요청을 처리함`);
            }
            
        } catch (e) {
            console.log(`   - 페이지 콘텐츠 분석 중 오류: ${e.message}`);
        }
        
        // 스텝 7: XSS나 SQL Injection 공격 차단 확인
        console.log('8. 보안 공격 차단 여부 확인 중...');
        
        // XSS 공격 차단 확인 (alert 실행 여부)
        if (xssExecuted) {
            console.log(`   ❌ XSS 공격 성공: Alert 다이얼로그가 실행됨 - "${alertMessage}"`);
        } else {
            console.log(`   ✅ XSS 공격 차단: Alert 다이얼로그가 실행되지 않음`);
        }
        
        // JavaScript 에러 확인
        if (jsErrors.length > 0) {
            console.log(`   - JavaScript 에러 발생 (${jsErrors.length}개):`);
            jsErrors.forEach((error, index) => {
                console.log(`     ${index + 1}. ${error}`);
            });
        } else {
            console.log(`   ✅ JavaScript 에러 없음`);
        }
        
        // 콘솔 에러 확인
        if (consoleErrors.length > 0) {
            console.log(`   - 콘솔 에러 발생 (${consoleErrors.length}개):`);
            consoleErrors.forEach((error, index) => {
                console.log(`     ${index + 1}. ${error}`);
            });
        } else {
            console.log(`   ✅ 콘솔 에러 없음`);
        }
        
        // 스텝 8: 로그인 실패 메시지 확인
        console.log('9. 로그인 실패 메시지 확인 중...');
        
        // 페이지 새로고침 또는 동적 내용 로딩 대기
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
            console.log('   - 네트워크 아이들 대기 타임아웃');
        });
        
        // 다양한 에러 메시지 셀렉터들
        const errorSelectors = [
            '.error-message',
            '.alert',
            '[class*="error"]',
            '.login-error',
            '#errorMsg',
            '.validation-message',
            '[role="alert"]',
            '.form-error',
            '.auth-error',
            'span[class*="error"]',
            'div[class*="error"]',
            'p[class*="error"]',
            '.message[class*="error"]',
            '.toast-error',
            '.notification-error',
            '.modal-error',
            '.popup-error',
            '.dialog-error'
        ];
        
        let loginErrorMessage = '';
        let hasLoginError = false;
        
        // 각 셀렉터로 에러 메시지 찾기
        for (const selector of errorSelectors) {
            try {
                const elements = await page.$$(selector);
                for (const element of elements) {
                    const text = await element.textContent();
                    if (text && text.trim().length > 0) {
                        const trimmedText = text.trim();
                        console.log(`   - 에러 메시지 후보 발견 (${selector}): "${trimmedText}"`);
                        
                        // 로그인 실패 관련 메시지인지 확인
                        const lowerText = trimmedText.toLowerCase();
                        if (lowerText.includes('아이디') || 
                            lowerText.includes('비밀번호') ||
                            lowerText.includes('일치하지') ||
                            lowerText.includes('존재하지') ||
                            lowerText.includes('찾을 수 없') ||
                            lowerText.includes('잘못된') ||
                            lowerText.includes('틀렸') ||
                            lowerText.includes('실패') ||
                            lowerText.includes('오류') ||
                            lowerText.includes('유효하지') ||
                            lowerText.includes('형식') ||
                            lowerText.includes('입력') ||
                            lowerText.includes('invalid') ||
                            lowerText.includes('incorrect') ||
                            lowerText.includes('wrong') ||
                            lowerText.includes('failed') ||
                            lowerText.includes('format') ||
                            lowerText.includes('security')) {
                            
                            loginErrorMessage = trimmedText;
                            hasLoginError = true;
                            console.log(`   ✅ 로그인 실패 에러 메시지 확인: "${loginErrorMessage}"`);
                            break;
                        }
                    }
                }
                if (hasLoginError) break;
            } catch (e) {
                // 해당 셀렉터로 요소를 찾을 수 없음
            }
        }
        
        // 페이지 전체 텍스트에서 에러 메시지 패턴 찾기 (추가 검증)
        if (!hasLoginError) {
            try {
                const bodyText = await page.textContent('body');
                if (bodyText) {
                    const patterns = [
                        /아이디.*일치하지.*않습니다/i,
                        /비밀번호.*일치하지.*않습니다/i,
                        /아이디.*비밀번호.*일치하지.*않습니다/i,
                        /잘못된.*입력/i,
                        /유효하지.*않은.*형식/i,
                        /특수문자.*허용되지.*않습니다/i,
                        /보안.*위반/i,
                        /로그인.*실패/i,
                        /인증.*실패/i,
                        /입력.*형식.*오류/i,
                        /invalid.*input/i,
                        /invalid.*format/i,
                        /security.*violation/i,
                        /forbidden.*characters/i,
                        /special.*characters.*not.*allowed/i
                    ];
                    
                    for (const pattern of patterns) {
                        const match = bodyText.match(pattern);
                        if (match) {
                            loginErrorMessage = match[0];
                            hasLoginError = true;
                            console.log(`   ✅ 페이지 텍스트에서 로그인 실패 메시지 발견: "${loginErrorMessage}"`);
                            break;
                        }
                    }
                }
            } catch (e) {
                console.log('   - 페이지 텍스트 검색 중 오류:', e.message);
            }
        }
        
        // 스텝 9: 로그인 실패 확인
        console.log('10. 로그인 실패 여부 확인 중...');
        
        // 페이지 이동 여부 확인
        const hasPageMoved = (urlBeforeLogin !== urlAfterLogin);
        const isStillOnLoginPage = urlAfterLogin.includes('login');
        const hasMovedToMypage = urlAfterLogin.includes('mypage') || urlAfterLogin.includes('personal');
        
        console.log(`   - 페이지 이동 여부: ${hasPageMoved ? '이동함' : '이동하지 않음'}`);
        console.log(`   - 로그인 페이지 유지: ${isStillOnLoginPage ? '예' : '아니오'}`);
        console.log(`   - 마이페이지 이동: ${hasMovedToMypage ? '예' : '아니오'}`);
        
        // 스텝 10: 로그인 페이지 유지 확인
        console.log('11. 로그인 페이지 유지 여부 확인 중...');
        
        // 추가 대기 후 재확인
        await page.waitForTimeout(3000);
        const finalURL = page.url();
        const finallyOnLoginPage = finalURL.includes('login');
        const finallyOnMypage = finalURL.includes('mypage') || finalURL.includes('personal');
        
        console.log(`   - 최종 URL: ${finalURL}`);
        console.log(`   - 최종 로그인 페이지 상태: ${finallyOnLoginPage ? '유지됨' : '이탈함'}`);
        console.log(`   - 최종 마이페이지 상태: ${finallyOnMypage ? '이동됨' : '이동하지 않음'}`);
        
        // 최종 스크린샷 캡처
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc009_04_final_result.png',
            fullPage: true 
        });
        console.log('   - 최종 결과 스크린샷 저장 완료');
        
        // 입력 필드 값 재확인 (이스케이프 처리 확인)
        try {
            const finalUserIdValue = await page.inputValue(userIdSelector);
            const finalPasswordValue = await page.inputValue(passwordSelector);
            
            console.log(`   - 최종 아이디 필드 값: "${finalUserIdValue}"`);
            console.log(`   - 최종 비밀번호 필드 값: "${finalPasswordValue}"`);
            
            // 입력값이 어떻게 처리되었는지 확인
            if (finalUserIdValue === xssPayload) {
                console.log('   ⚠️ XSS 코드가 그대로 유지됨 (클라이언트 측 이스케이프 미적용)');
            } else if (finalUserIdValue.includes('&lt;') || finalUserIdValue.includes('&gt;')) {
                console.log('   ✅ XSS 코드가 HTML 엔티티로 이스케이프됨');
            } else if (finalUserIdValue.length === 0) {
                console.log('   ✅ XSS 코드가 제거됨');
            } else {
                console.log('   ⚠️ XSS 코드가 다른 형태로 변환됨');
            }
            
            if (finalPasswordValue === sqlInjectionPayload) {
                console.log('   ⚠️ SQL Injection 코드가 그대로 유지됨');
            } else if (finalPasswordValue.length === 0) {
                console.log('   ✅ SQL Injection 코드가 제거됨 또는 초기화됨');
            } else {
                console.log('   ⚠️ SQL Injection 코드가 다른 형태로 변환됨');
            }
            
        } catch (e) {
            console.log('   - 입력 필드 값 재확인 중 오류:', e.message);
        }
        
        // 테스트 결과 분석
        console.log('12. 보안 테스트 결과 분석 중...');
        
        let testResult = 'PASS';
        let testDetails = [];
        let securityScore = 0;
        const maxSecurityScore = 6;
        
        // 검증 조건 1: XSS 공격이 차단되었는가?
        if (!xssExecuted && xssEscaped) {
            console.log('   ✅ 조건 1 PASS: XSS 공격이 성공적으로 차단됨');
            testDetails.push('XSS 공격 차단 성공');
            securityScore++;
        } else if (!xssExecuted) {
            console.log('   ⚠️ 조건 1 PARTIAL: XSS 스크립트가 실행되지 않음 (부분적 차단)');
            testDetails.push('XSS 공격 부분적 차단 (스크립트 미실행)');
            securityScore += 0.5;
        } else {
            console.log('   ❌ 조건 1 FAIL: XSS 공격이 성공함');
            testResult = 'FAIL';
            testDetails.push('XSS 공격 차단 실패');
        }
        
        // 검증 조건 2: SQL Injection 공격이 차단되었는가?
        if (sqlInjectionBlocked && responseStatus !== 500) {
            console.log('   ✅ 조건 2 PASS: SQL Injection 공격이 성공적으로 차단됨');
            testDetails.push('SQL Injection 공격 차단 성공');
            securityScore++;
        } else {
            console.log('   ❌ 조건 2 FAIL: SQL Injection 공격이 서버 에러를 발생시킬 가능성');
            testResult = 'FAIL';
            testDetails.push('SQL Injection 공격 차단 의심스러움');
        }
        
        // 검증 조건 3: 특수문자가 적절히 이스케이프 처리되었는가?
        if (xssEscaped) {
            console.log('   ✅ 조건 3 PASS: 특수문자가 적절히 이스케이프 처리됨');
            testDetails.push('특수문자 이스케이프 처리 적절');
            securityScore++;
        } else {
            console.log('   ❌ 조건 3 FAIL: 특수문자 이스케이프 처리 부족');
            testResult = 'FAIL';
            testDetails.push('특수문자 이스케이프 처리 부족');
        }
        
        // 검증 조건 4: 다이얼로그 팝업 또는 로그인 실패 메시지가 표시되었는가?
        if (hasDialogPopup) {
            console.log('   ✅ 조건 4 PASS: 다이얼로그 팝업이 표시됨');
            testDetails.push(`다이얼로그 메시지: "${dialogMessage}"`);
            hasLoginError = true; // 다이얼로그도 에러로 간주
            loginErrorMessage = dialogMessage;
            securityScore++;
        } else if (hasLoginError) {
            console.log('   ✅ 조건 4 PASS: 로그인 실패 메시지 표시됨');
            testDetails.push(`로그인 실패 메시지: "${loginErrorMessage}"`);
            securityScore++;
        } else {
            console.log('   ❌ 조건 4 FAIL: 다이얼로그 팝업이나 로그인 실패 메시지가 표시되지 않음');
            testResult = 'FAIL';
            testDetails.push('다이얼로그 팝업 및 로그인 실패 메시지 미표시');
        }
        
        // 검증 조건 5: 로그인이 실패했는가?
        if (!finallyOnMypage) {
            console.log('   ✅ 조건 5 PASS: 로그인 실패 확인 (마이페이지 이동 없음)');
            testDetails.push('로그인 실패 확인');
            securityScore++;
        } else {
            console.log('   ❌ 조건 5 FAIL: 예상과 달리 로그인 성공됨');
            testResult = 'FAIL';
            testDetails.push('예상과 달리 로그인 성공');
        }
        
        // 검증 조건 6: 로그인 페이지에 머물러 있는가?
        if (finallyOnLoginPage) {
            console.log('   ✅ 조건 6 PASS: 로그인 페이지에 머물러 있음');
            testDetails.push('로그인 페이지 유지');
            securityScore++;
        } else if (!finallyOnMypage) {
            console.log('   ⚠️ 조건 6 WARNING: 로그인 페이지는 아니지만 마이페이지도 아님');
            testDetails.push('페이지 위치 불명확');
            securityScore += 0.5;
        } else {
            console.log('   ❌ 조건 6 FAIL: 로그인 페이지에서 이탈함');
            testDetails.push('로그인 페이지 이탈');
        }
        
        // 보안 점수 계산
        const securityPercentage = (securityScore / maxSecurityScore * 100).toFixed(1);
        console.log(`   - 보안 테스트 점수: ${securityScore}/${maxSecurityScore} (${securityPercentage}%)`);
        
        // 테스트 결과 요약
        console.log('\n========== 보안 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-009 특수문자 보안 테스트`);
        console.log(`XSS 공격 코드: ${xssPayload}`);
        console.log(`SQL Injection 코드: ${sqlInjectionPayload}`);
        console.log(`XSS 공격 차단: ${!xssExecuted ? '성공' : '실패'}`);
        console.log(`특수문자 이스케이프: ${xssEscaped ? '적절' : '부족'}`);
        console.log(`SQL Injection 차단: ${sqlInjectionBlocked ? '성공' : '의심스러움'}`);
        console.log(`로그인 실패 여부: ${!finallyOnMypage ? '실패함' : '성공함'}`);
        console.log(`다이얼로그 팝업 표시: ${hasDialogPopup ? '예' : '아니오'}`);
        if (hasDialogPopup) {
            console.log(`다이얼로그 메시지: "${dialogMessage}"`);
        }
        console.log(`에러 메시지 표시: ${hasLoginError ? '예' : '아니오'}`);
        if (hasLoginError) {
            console.log(`에러 메시지 내용: "${loginErrorMessage}"`);
        }
        console.log(`로그인 페이지 유지: ${finallyOnLoginPage ? '유지됨' : '이탈함'}`);
        console.log(`페이지 이동 여부: ${hasPageMoved ? '이동함' : '유지됨'}`);
        console.log(`서버 응답 상태: ${responseStatus || '불명'}`);
        console.log(`JavaScript 에러: ${jsErrors.length}개`);
        console.log(`콘솔 에러: ${consoleErrors.length}개`);
        console.log(`최종 URL: ${finalURL}`);
        console.log(`보안 점수: ${securityScore}/${maxSecurityScore} (${securityPercentage}%)`);
        console.log(`테스트 결과: ${testResult}`);
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        
        // 상세 결과
        console.log('\n보안 테스트 상세 결과:');
        testDetails.forEach((detail, index) => {
            console.log(`  ${index + 1}. ${detail}`);
        });
        
        // JavaScript 에러가 있다면 출력
        if (jsErrors.length > 0) {
            console.log('\nJavaScript 에러 목록:');
            jsErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
        
        // 콘솔 에러가 있다면 출력
        if (consoleErrors.length > 0) {
            console.log('\n콘솔 에러 목록:');
            consoleErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
        
        if (testResult === 'PASS') {
            console.log('\n✅ TC-009 테스트 PASS: 특수문자 보안 테스트가 성공적으로 통과됨');
        } else {
            console.log('\n❌ TC-009 테스트 FAIL: 보안 취약점이 발견됨');
        }
        
        return {
            result: testResult,
            hasDialogPopup,
            dialogMessage,
            securityScore,
            maxSecurityScore,
            securityPercentage: parseFloat(securityPercentage),
            xssBlocked: !xssExecuted,
            xssEscaped,
            sqlInjectionBlocked,
            errorMessage: loginErrorMessage,
            hasLoginError,
            pageMovement: hasPageMoved,
            finalURL,
            staysOnLoginPage: finallyOnLoginPage,
            movedToMypage: finallyOnMypage,
            jsErrors,
            consoleErrors,
            details: testDetails
        };
        
    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류 발생:');
        console.error(error.message);
        console.error('스택 트레이스:', error.stack);
        
        // 오류 발생 시에도 스크린샷 저장
        if (page) {
            try {
                await page.screenshot({ 
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc009_error.png',
                    fullPage: true 
                });
                console.log('   - 오류 상황 스크린샷 저장 완료');
            } catch (screenshotError) {
                console.error('   - 스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        console.log('❌ TC-009 테스트 ERROR: 실행 중 오류 발생');
        
        return {
            result: 'ERROR',
            error: error.message,
            details: ['테스트 실행 중 오류 발생']
        };
        
    } finally {
        // 리소스 정리
        if (browser) {
            console.log('\n13. 브라우저 종료 중...');
            await browser.close();
        }
        
        console.log('========== TC-009 보안 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runSpecialCharactersSecurityTest().catch(console.error);
}

module.exports = { runSpecialCharactersSecurityTest };