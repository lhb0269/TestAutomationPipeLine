/**
 * TC-014: 동시 다중 로그인 시도 테스트
 * 
 * 테스트 시나리오:
 * 1. 로그인 페이지 접속
 * 2. 아이디 입력 필드에 ' ' 입력
 * 3. 비밀번호 입력 필드에 ' ' 입력
 * 4. 로그인 버튼을 빠르게 5번 연속 클릭
 * 5. 서버 응답 및 UI 변화 확인
 * 
 * 예상 결과:
 * - 첫 번째 클릭 후 버튼이 비활성화됨
 * - 중복 요청이 방지됨
 * - 한 번의 로그인 처리만 수행됨
 */

const { chromium } = require('playwright');

async function runMultipleLoginAttemptsTest() {
    let browser;
    let context;
    let page;
    
    try {
        console.log('========== TC-014: 동시 다중 로그인 시도 테스트 시작 ==========');
        
        // 브라우저 실행
        console.log('1. 브라우저 실행 중...');
        browser = await chromium.launch({ 
            headless: false,  // 테스트 과정을 시각적으로 확인
            slowMo: 500       // 액션 간 0.5초 대기
        });
        
        context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        page = await context.newPage();
        
        // 네트워크 요청 모니터링을 위한 리스너 설정
        const networkRequests = [];
        page.on('request', request => {
            if (request.url().includes('login') || request.method() === 'POST') {
                networkRequests.push({
                    url: request.url(),
                    method: request.method(),
                    timestamp: new Date().toISOString()
                });
                console.log(`   📡 네트워크 요청 감지: ${request.method()} ${request.url()}`);
            }
        });
        
        // 스텝 1: 로그인 페이지 접속
        console.log('2. 알바몬 로그인 페이지 접속 중...');
        await page.goto('https://m.albamon.com/user-account/login?my_page=1', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        // 페이지 로딩 완료 대기
        await page.waitForTimeout(2000);
        
        // 페이지 제목 확인
        const title = await page.title();
        console.log(`   - 페이지 제목: ${title}`);
        
        // 로그인 폼 요소들 확인 및 대기
        const userIdSelector = '#memberId';
        const passwordSelector = '#memberPassword';
        const loginButtonSelector = 'button[type="submit"]';
        
        console.log('3. 로그인 폼 요소들 확인 중...');
        
        await page.waitForSelector(userIdSelector, { timeout: 10000 });
        await page.waitForSelector(passwordSelector, { timeout: 10000 });
        await page.waitForSelector(loginButtonSelector, { timeout: 10000 });
        
        console.log('   ✅ 모든 로그인 폼 요소들 정상 확인');
        
        // 초기 페이지 스크린샷 캡처
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc014_01_initial_page.png',
            fullPage: true 
        });
        console.log('   - 초기 페이지 스크린샷 저장 완료');
        
        // 스텝 2: 아이디 입력
        console.log('4. 아이디 입력 중...');
        await page.fill(userIdSelector, ' ');
        await page.waitForTimeout(500);
        
        // 입력된 값 확인
        const enteredUserId = await page.inputValue(userIdSelector);
        console.log(`   - 입력된 아이디: ${enteredUserId}`);
        
        // 아이디 입력 후 스크린샷
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc014_02_userid_entered.png',
            fullPage: true 
        });
        
        // 스텝 3: 비밀번호 입력
        console.log('5. 비밀번호 입력 중...');
        await page.fill(passwordSelector, ' ');
        await page.waitForTimeout(500);
        
        // 입력된 값 확인 (보안상 길이만 표시)
        const enteredPassword = await page.inputValue(passwordSelector);
        console.log(`   - 비밀번호 입력 완료 (길이: ${enteredPassword.length}자)`);
        
        // 비밀번호 입력 후 스크린샷
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc014_03_password_entered.png',
            fullPage: true 
        });
        
        // 스텝 4: 로그인 버튼 상태 확인
        console.log('6. 로그인 버튼 초기 상태 확인 중...');
        
        const initialButtonEnabled = await page.isEnabled(loginButtonSelector);
        const initialButtonText = await page.textContent(loginButtonSelector);
        
        console.log(`   - 버튼 활성화 상태: ${initialButtonEnabled ? '활성화' : '비활성화'}`);
        console.log(`   - 버튼 텍스트: "${initialButtonText}"`);
        
        // 네트워크 요청 카운터 초기화
        const initialRequestCount = networkRequests.length;
        console.log(`   - 초기 네트워크 요청 수: ${initialRequestCount}`);
        
        // 스텝 5: 로그인 버튼을 빠르게 5번 연속 클릭
        console.log('7. 로그인 버튼 빠른 연속 클릭 시작 (5회)...');
        
        const clickResults = [];
        const clickTimestamps = [];
        
        // 버튼 연속 클릭 실행
        for (let i = 1; i <= 5; i++) {
            const clickStartTime = Date.now();
            clickTimestamps.push(clickStartTime);
            
            try {
                // 버튼 클릭 전 상태 확인
                const buttonEnabled = await page.isEnabled(loginButtonSelector);
                console.log(`   클릭 ${i}: 버튼 상태 - ${buttonEnabled ? '활성화' : '비활성화'}`);
                
                if (buttonEnabled) {
                    // 클릭 실행
                    await page.click(loginButtonSelector);
                    clickResults.push({
                        clickNumber: i,
                        successful: true,
                        timestamp: clickStartTime,
                        buttonWasEnabled: buttonEnabled
                    });
                    console.log(`   ✅ 클릭 ${i} 실행 완료`);
                } else {
                    clickResults.push({
                        clickNumber: i,
                        successful: false,
                        timestamp: clickStartTime,
                        buttonWasEnabled: buttonEnabled,
                        reason: '버튼이 비활성화됨'
                    });
                    console.log(`   ⏹️ 클릭 ${i} 실행 불가 - 버튼이 비활성화됨`);
                }
                
                // 매우 짧은 대기 (실제 사용자의 빠른 클릭을 시뮬레이션)
                await page.waitForTimeout(50);
                
            } catch (error) {
                clickResults.push({
                    clickNumber: i,
                    successful: false,
                    timestamp: clickStartTime,
                    error: error.message
                });
                console.log(`   ❌ 클릭 ${i} 실행 중 오류: ${error.message}`);
            }
        }
        
        // 클릭 완료 후 페이지 상태 안정화 대기
        console.log('8. 클릭 완료 후 페이지 상태 안정화 대기 중...');
        await page.waitForTimeout(3000);
        
        // 클릭 후 스크린샷
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc014_04_after_clicks.png',
            fullPage: true 
        });
        
        // 스텝 6: 서버 응답 및 UI 변화 확인
        console.log('9. 서버 응답 및 UI 변화 분석 중...');
        
        // 네트워크 요청 분석
        const finalRequestCount = networkRequests.length;
        const newRequestCount = finalRequestCount - initialRequestCount;
        
        console.log('\n--- 네트워크 요청 분석 ---');
        console.log(`총 새로운 요청 수: ${newRequestCount}`);
        
        if (networkRequests.length > initialRequestCount) {
            console.log('새로 발생한 요청들:');
            networkRequests.slice(initialRequestCount).forEach((req, index) => {
                console.log(`  ${index + 1}. ${req.method} ${req.url} (${req.timestamp})`);
            });
        }
        
        // 버튼 상태 재확인
        const finalButtonEnabled = await page.isEnabled(loginButtonSelector);
        const finalButtonText = await page.textContent(loginButtonSelector);
        
        console.log('\n--- 버튼 상태 변화 분석 ---');
        console.log(`초기 버튼 상태: ${initialButtonEnabled ? '활성화' : '비활성화'}`);
        console.log(`최종 버튼 상태: ${finalButtonEnabled ? '활성화' : '비활성화'}`);
        console.log(`초기 버튼 텍스트: "${initialButtonText}"`);
        console.log(`최종 버튼 텍스트: "${finalButtonText}"`);
        
        // URL 변화 확인
        const currentUrl = page.url();
        const urlChanged = !currentUrl.includes('login');
        
        console.log('\n--- 페이지 상태 분석 ---');
        console.log(`현재 URL: ${currentUrl}`);
        console.log(`페이지 이동 발생: ${urlChanged ? '예' : '아니오'}`);
        
        // 에러 메시지 확인
        console.log('10. 에러 메시지 또는 알림 확인 중...');
        
        let errorMessages = [];
        try {
            // 일반적인 에러 메시지 선택자들
            const errorSelectors = [
                '.error-message',
                '.alert',
                '.warning',
                '[class*="error"]',
                '[class*="alert"]',
                '[id*="error"]'
            ];
            
            for (const selector of errorSelectors) {
                const elements = await page.$$(selector);
                for (const element of elements) {
                    const text = await element.textContent();
                    if (text && text.trim()) {
                        errorMessages.push({
                            selector: selector,
                            message: text.trim()
                        });
                    }
                }
            }
            
            if (errorMessages.length > 0) {
                console.log('   발견된 에러/알림 메시지:');
                errorMessages.forEach((err, index) => {
                    console.log(`   ${index + 1}. ${err.message} (${err.selector})`);
                });
            } else {
                console.log('   ✅ 특별한 에러 메시지 없음');
            }
            
        } catch (error) {
            console.log(`   ⚠️ 에러 메시지 확인 중 예외 발생: ${error.message}`);
        }
        
        // 클릭 시간 간격 분석
        console.log('\n--- 클릭 타이밍 분석 ---');
        for (let i = 1; i < clickTimestamps.length; i++) {
            const interval = clickTimestamps[i] - clickTimestamps[i-1];
            console.log(`   클릭 ${i}와 클릭 ${i+1} 간격: ${interval}ms`);
        }
        
        // 최종 스크린샷
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc014_05_final_result.png',
            fullPage: true 
        });
        console.log('   - 최종 결과 스크린샷 저장 완료');
        
        // 테스트 결과 평가
        const successfulClicks = clickResults.filter(result => result.successful).length;
        const buttonDisabledAfterFirstClick = clickResults.length > 1 && 
            clickResults[0].successful && 
            !clickResults[1].buttonWasEnabled;
        
        const duplicateRequestsPrevented = newRequestCount <= 1;
        const singleLoginProcessing = newRequestCount === 1 || newRequestCount === 0;
        
        // 전체 테스트 성공 여부 판단
        const testPassed = buttonDisabledAfterFirstClick && 
                           duplicateRequestsPrevented && 
                           (singleLoginProcessing || urlChanged);
        
        // 테스트 결과 요약
        console.log('\n========== 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-014 동시 다중 로그인 시도`);
        console.log(`테스트 URL: https://m.albamon.com/user-account/login?my_page=1`);
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        
        console.log('\n--- 클릭 실행 결과 ---');
        clickResults.forEach(result => {
            const status = result.successful ? '성공' : '실패';
            const reason = result.reason || result.error || '';
            console.log(`클릭 ${result.clickNumber}: ${status} ${reason ? '(' + reason + ')' : ''}`);
        });
        
        console.log('\n--- 상세 검증 결과 ---');
        console.log(`✓ 성공한 클릭 수: ${successfulClicks}/5`);
        console.log(`✓ 첫 클릭 후 버튼 비활성화: ${buttonDisabledAfterFirstClick ? 'PASS' : 'FAIL'}`);
        console.log(`✓ 중복 요청 방지: ${duplicateRequestsPrevented ? 'PASS' : 'FAIL'} (${newRequestCount}개 요청)`);
        console.log(`✓ 단일 로그인 처리: ${singleLoginProcessing ? 'PASS' : 'FAIL'}`);
        console.log(`✓ 페이지 이동 발생: ${urlChanged ? '예' : '아니오'}`);
        
        if (testPassed) {
            console.log('\n✅ TC-014 테스트 PASS: 동시 다중 로그인 시도가 적절히 제어됨');
        } else {
            console.log('\n❌ TC-014 테스트 FAIL: 동시 다중 로그인 시도 제어에 문제 발생');
        }
        
        return {
            success: testPassed,
            successfulClicks: successfulClicks,
            totalClicks: clickResults.length,
            buttonDisabledAfterFirstClick: buttonDisabledAfterFirstClick,
            duplicateRequestsPrevented: duplicateRequestsPrevented,
            singleLoginProcessing: singleLoginProcessing,
            networkRequests: newRequestCount,
            urlChanged: urlChanged,
            clickResults: clickResults,
            errorMessages: errorMessages,
            finalUrl: currentUrl
        };
        
    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류 발생:');
        console.error(error.message);
        
        // 오류 발생 시에도 스크린샷 저장
        if (page) {
            try {
                await page.screenshot({ 
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc014_error.png',
                    fullPage: true 
                });
                console.log('   - 오류 상황 스크린샷 저장 완료');
            } catch (screenshotError) {
                console.error('   - 스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        console.log('❌ TC-014 테스트 ERROR: 실행 중 오류 발생');
        
        return {
            success: false,
            error: error.message,
            successfulClicks: 0,
            totalClicks: 0,
            buttonDisabledAfterFirstClick: false,
            duplicateRequestsPrevented: false,
            singleLoginProcessing: false,
            networkRequests: 0,
            urlChanged: false
        };
        
    } finally {
        // 리소스 정리
        if (browser) {
            console.log('\n11. 브라우저 종료 중...');
            await browser.close();
        }
        
        console.log('========== TC-014 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runMultipleLoginAttemptsTest().catch(console.error);
}

module.exports = { runMultipleLoginAttemptsTest };