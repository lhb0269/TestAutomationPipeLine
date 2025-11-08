/**
 * TC-007: 잘못된 아이디로 로그인 시도
 * 
 * 테스트 시나리오:
 * 1. 알바몬 로그인 페이지 접속
 * 2. 아이디 입력 필드에 'invaliduser123' 입력
 * 3. 비밀번호 입력 필드에 '' 입력
 * 4. 로그인 버튼 클릭
 * 5. 서버 응답 대기
 * 6. "아이디 또는 비밀번호가 일치하지 않습니다." 또는 유사한 에러 메시지 표시 확인
 * 7. 로그인이 실패함을 확인
 * 8. 로그인 페이지에 머물러 있음을 확인
 */

const { chromium } = require('playwright');

async function runInvalidUsernameTest() {
    let browser;
    let context;
    let page;
    
    try {
        console.log('========== TC-007: 잘못된 아이디로 로그인 시도 테스트 시작 ==========');
        
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
        
        // 페이지에서 다이얼로그 이벤트 리스너 설정 (페이지 생성 직후)
        page.on('dialog', async (dialog) => {
            console.log(`   - 다이얼로그 팝업 감지: ${dialog.type()}`);
            console.log(`   - 다이얼로그 메시지: "${dialog.message()}"`);
            dialogMessage = dialog.message();
            hasDialogPopup = true;
            await dialog.accept(); // 다이얼로그 승인
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
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc007_01_initial_page.png',
            fullPage: true 
        });
        console.log('   - 초기 페이지 스크린샷 저장 완료');
        
        // 스텝 2: 아이디 입력 필드 확인 및 잘못된 아이디 입력
        console.log('3. 아이디 입력 필드에 잘못된 아이디 입력 중...');
        
        // 아이디 필드 셀렉터
        const userIdSelector = '#memberId';
        const invalidUserId = 'invaliduser123';
        
        // 아이디 필드 대기 및 확인
        await page.waitForSelector(userIdSelector, { timeout: 10000 });
        console.log(`   - 아이디 필드 발견: ${userIdSelector}`);
        
        // 잘못된 아이디 입력
        await page.fill(userIdSelector, '');  // 기존 값 지우기
        await page.type(userIdSelector, invalidUserId, { delay: 100 });
        console.log(`   - 잘못된 아이디 "${invalidUserId}" 입력 완료`);
        
        // 스크린샷 캡처 - 잘못된 아이디 입력 완료
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc007_02_invalid_userid_entered.png',
            fullPage: true 
        });
        console.log('   - 잘못된 아이디 입력 스크린샷 저장 완료');
        
        // 스텝 3: 비밀번호 입력 필드 확인 및 입력
        console.log('4. 비밀번호 입력 필드 확인 및 입력 중...');
        
        // 비밀번호 필드 셀렉터
        const passwordSelector = '#memberPassword';
        const validPassword = '';
        
        // 비밀번호 필드 대기 및 확인
        await page.waitForSelector(passwordSelector, { timeout: 10000 });
        console.log(`   - 비밀번호 필드 발견: ${passwordSelector}`);
        
        // 비밀번호 입력
        await page.fill(passwordSelector, '');  // 기존 값 지우기
        await page.type(passwordSelector, validPassword, { delay: 100 });
        console.log(`   - 비밀번호 "${validPassword}" 입력 완료`);
        
        // 스크린샷 캡처 - 잘못된 아이디와 올바른 비밀번호 입력 완료
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc007_03_both_fields_entered.png',
            fullPage: true 
        });
        console.log('   - 입력 완료 스크린샷 저장 완료');
        
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
        
        page.on('request', request => {
            if (request.url().includes('login') || request.method() === 'POST') {
                console.log(`   - 로그인 요청 감지: ${request.method()} ${request.url()}`);
                loginRequestMade = true;
            }
        });
        
        page.on('response', response => {
            if (response.url().includes('login') || response.request().method() === 'POST') {
                console.log(`   - 로그인 응답 수신: ${response.status()} ${response.url()}`);
                loginResponseReceived = true;
                responseStatus = response.status();
            }
        });
        
        // 로그인 버튼 클릭
        await page.click(loginButtonSelector);
        console.log('   - 로그인 버튼 클릭 완료');
        
        // 다이얼로그 감지를 위한 추가 대기
        await page.waitForTimeout(2000);
        
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
        
        // 추가 대기 시간
        await page.waitForTimeout(2000);
        
        // 현재 URL 확인 (로그인 시도 후)
        const urlAfterLogin = page.url();
        console.log(`   - 로그인 시도 후 URL: ${urlAfterLogin}`);
        
        // 스텝 6: 로그인 실패 에러 메시지 확인
        console.log('7. 로그인 실패 에러 메시지 확인 중...');
        
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
                            lowerText.includes('invalid') ||
                            lowerText.includes('incorrect') ||
                            lowerText.includes('wrong') ||
                            lowerText.includes('failed')) {
                            
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
                        /존재하지.*않는.*아이디/i,
                        /잘못된.*아이디/i,
                        /잘못된.*비밀번호/i,
                        /로그인.*실패/i,
                        /인증.*실패/i
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
        
        // 스텝 7: 로그인 실패 확인
        console.log('8. 로그인 실패 여부 확인 중...');
        
        // 페이지 이동 여부 확인
        const hasPageMoved = (urlBeforeLogin !== urlAfterLogin);
        const isStillOnLoginPage = urlAfterLogin.includes('login');
        const hasMovedToMypage = urlAfterLogin.includes('mypage') || urlAfterLogin.includes('personal');
        
        console.log(`   - 페이지 이동 여부: ${hasPageMoved ? '이동함' : '이동하지 않음'}`);
        console.log(`   - 로그인 페이지 유지: ${isStillOnLoginPage ? '예' : '아니오'}`);
        console.log(`   - 마이페이지 이동: ${hasMovedToMypage ? '예' : '아니오'}`);
        
        // 스텝 8: 로그인 페이지 유지 확인
        console.log('9. 로그인 페이지 유지 여부 확인 중...');
        
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
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc007_04_final_result.png',
            fullPage: true 
        });
        console.log('   - 최종 결과 스크린샷 저장 완료');
        
        // 스텝 9: 테스트 결과 분석
        console.log('10. 테스트 결과 분석 중...');
        
        let testResult = 'PASS';
        let testDetails = [];
        
        // 검증 조건 1: 다이얼로그 팝업 또는 로그인 실패 에러 메시지가 표시되었는가?
        if (hasDialogPopup) {
            console.log('   ✅ 조건 1 PASS: 다이얼로그 팝업이 표시됨');
            testDetails.push(`다이얼로그 메시지: "${dialogMessage}"`);
            hasLoginError = true; // 다이얼로그도 에러로 간주
            loginErrorMessage = dialogMessage;
        } else if (hasLoginError) {
            console.log('   ✅ 조건 1 PASS: 로그인 실패 에러 메시지 표시됨');
            testDetails.push(`에러 메시지: "${loginErrorMessage}"`);
        } else {
            console.log('   ❌ 조건 1 FAIL: 다이얼로그 팝업이나 로그인 실패 에러 메시지가 표시되지 않음');
            testResult = 'FAIL';
            testDetails.push('다이얼로그 팝업 및 에러 메시지 미표시');
        }
        
        // 검증 조건 2: 로그인이 실패했는가? (마이페이지로 이동하지 않음)
        if (!finallyOnMypage) {
            console.log('   ✅ 조건 2 PASS: 마이페이지로 이동하지 않음 (로그인 실패 확인)');
            testDetails.push('로그인 실패 확인 (마이페이지 이동 없음)');
        } else {
            console.log('   ❌ 조건 2 FAIL: 마이페이지로 이동함 (예상과 달리 로그인 성공)');
            testResult = 'FAIL';
            testDetails.push('예상과 달리 로그인 성공됨');
        }
        
        // 검증 조건 3: 로그인 페이지에 머물러 있는가?
        if (finallyOnLoginPage) {
            console.log('   ✅ 조건 3 PASS: 로그인 페이지에 머물러 있음');
            testDetails.push('로그인 페이지 유지 확인');
        } else if (!finallyOnMypage) {
            console.log('   ⚠️ 조건 3 WARNING: 로그인 페이지가 아니지만 마이페이지도 아님');
            testDetails.push('페이지 위치 불명확 (에러 페이지 또는 다른 페이지)');
        } else {
            console.log('   ❌ 조건 3 FAIL: 로그인 페이지에서 이탈함');
            testDetails.push('로그인 페이지 이탈');
        }
        
        // 추가 검증: 입력 필드 상태 확인
        try {
            const finalUserIdValue = await page.inputValue(userIdSelector);
            const finalPasswordValue = await page.inputValue(passwordSelector);
            
            console.log(`   - 최종 아이디 필드 값: "${finalUserIdValue}"`);
            console.log(`   - 최종 비밀번호 필드 값: "${finalPasswordValue.length > 0 ? '[입력됨]' : '[비어있음]'}"`);
            
            if (finalUserIdValue === invalidUserId) {
                console.log('   ✅ 잘못된 아이디가 그대로 유지됨');
                testDetails.push('입력값 유지 확인');
            } else {
                console.log('   ⚠️ 아이디 필드 값이 변경됨');
            }
            
        } catch (e) {
            console.log('   - 입력 필드 상태 확인 중 오류:', e.message);
        }
        
        // 테스트 결과 요약
        console.log('\n========== 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-007 잘못된 아이디로 로그인 시도`);
        console.log(`테스트 시나리오: 잘못된 아이디(${invalidUserId}) + 올바른 비밀번호 + 로그인 시도`);
        console.log(`다이얼로그 팝업 표시: ${hasDialogPopup ? '예' : '아니오'}`);
        if (hasDialogPopup) {
            console.log(`다이얼로그 메시지: "${dialogMessage}"`);
        }
        console.log(`에러 메시지 표시: ${hasLoginError ? '예' : '아니오'}`);
        if (hasLoginError) {
            console.log(`에러 메시지 내용: "${loginErrorMessage}"`);
        }
        console.log(`로그인 실패 여부: ${!finallyOnMypage ? '실패함' : '성공함'}`);
        console.log(`로그인 페이지 유지: ${finallyOnLoginPage ? '유지됨' : '이탈함'}`);
        console.log(`페이지 이동 여부: ${hasPageMoved ? '이동함' : '유지됨'}`);
        console.log(`최종 URL: ${finalURL}`);
        console.log(`테스트 결과: ${testResult}`);
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        
        // 상세 결과
        console.log('\n테스트 상세 결과:');
        testDetails.forEach((detail, index) => {
            console.log(`  ${index + 1}. ${detail}`);
        });
        
        if (testResult === 'PASS') {
            console.log('\n✅ TC-007 테스트 PASS: 잘못된 아이디로 로그인 시도 시 적절한 에러 처리 수행');
        } else {
            console.log('\n❌ TC-007 테스트 FAIL: 잘못된 아이디 로그인 시도가 예상대로 동작하지 않음');
        }
        
        return {
            result: testResult,
            hasDialogPopup,
            dialogMessage,
            errorMessage: loginErrorMessage,
            hasLoginError,
            pageMovement: hasPageMoved,
            finalURL,
            staysOnLoginPage: finallyOnLoginPage,
            movedToMypage: finallyOnMypage,
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
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc007_error.png',
                    fullPage: true 
                });
                console.log('   - 오류 상황 스크린샷 저장 완료');
            } catch (screenshotError) {
                console.error('   - 스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        console.log('❌ TC-007 테스트 ERROR: 실행 중 오류 발생');
        
        return {
            result: 'ERROR',
            error: error.message,
            details: ['테스트 실행 중 오류 발생']
        };
        
    } finally {
        // 리소스 정리
        if (browser) {
            console.log('\n11. 브라우저 종료 중...');
            await browser.close();
        }
        
        console.log('========== TC-007 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runInvalidUsernameTest().catch(console.error);
}

module.exports = { runInvalidUsernameTest };