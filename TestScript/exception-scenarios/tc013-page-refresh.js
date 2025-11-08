/**
 * TC-013: 페이지 새로고침 후 동작 확인
 * 
 * 테스트 시나리오:
 * 1. 알바몬 로그인 페이지 접속
 * 2. 아이디 입력 필드에 'test' 입력
 * 3. F5 키 또는 새로고침 버튼 클릭 (page.reload() 사용)
 * 4. 페이지 로딩 완료 대기
 * 5. 입력 필드 상태 확인
 * 
 * 예상 결과:
 * - 페이지가 정상적으로 새로고침됨
 * - 모든 입력 필드가 초기화됨
 * - 로그인 기능이 정상적으로 동작함
 */

const { chromium } = require('playwright');

async function runPageRefreshTest() {
    let browser;
    let context;
    let page;
    
    try {
        console.log('========== TC-013: 페이지 새로고침 후 동작 확인 테스트 시작 ==========');
        
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
        
        // 스텝 1: 알바몬 로그인 페이지 접속
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
        
        // 스크린샷 캡처 - 초기 로그인 페이지
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc013_01_initial_page.png',
            fullPage: true 
        });
        console.log('   - 초기 로그인 페이지 스크린샷 저장 완료');
        
        // 스텝 2: 아이디 입력 필드에 'test' 입력
        console.log('3. 아이디 입력 필드에 테스트 데이터 입력 중...');
        
        // 정확한 아이디 필드 셀렉터 사용
        const userIdSelector = '#memberId';
        
        // 아이디 필드 대기 및 확인
        await page.waitForSelector(userIdSelector, { timeout: 10000 });
        console.log(`   - 아이디 필드 발견: ${userIdSelector}`);
        
        // 아이디 입력
        await page.fill(userIdSelector, '');  // 기존 값 지우기
        await page.type(userIdSelector, 'test', { delay: 100 });
        console.log('   - 아이디 "test" 입력 완료');
        
        // 입력값 확인
        const inputValue = await page.inputValue(userIdSelector);
        console.log(`   - 입력된 값 확인: "${inputValue}"`);
        
        // 스크린샷 캡처 - 입력 완료
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc013_02_test_input.png',
            fullPage: true 
        });
        console.log('   - 테스트 데이터 입력 스크린샷 저장 완료');
        
        // 스텝 3: 페이지 새로고침 (F5 키 또는 page.reload() 사용)
        console.log('4. 페이지 새로고침 실행 중...');
        
        // 새로고침 전 현재 상태 확인
        const beforeRefreshValue = await page.inputValue(userIdSelector);
        console.log(`   - 새로고침 전 입력값: "${beforeRefreshValue}"`);
        
        // page.reload() 메서드 사용하여 새로고침
        await page.reload({
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        console.log('   - 페이지 새로고침 완료');
        
        // 스텝 4: 페이지 로딩 완료 대기
        console.log('5. 페이지 로딩 완료 대기 중...');
        
        // 추가 로딩 대기
        await page.waitForTimeout(3000);
        
        // 페이지 로딩 상태 확인
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        console.log('   - 페이지 로딩 완료');
        
        // 스텝 5: 입력 필드 상태 확인
        console.log('6. 입력 필드 상태 확인 중...');
        
        // 아이디 필드 다시 확인
        await page.waitForSelector(userIdSelector, { timeout: 10000 });
        console.log(`   - 아이디 필드 재확인 완료: ${userIdSelector}`);
        
        // 새로고침 후 입력값 확인
        const afterRefreshValue = await page.inputValue(userIdSelector);
        console.log(`   - 새로고침 후 입력값: "${afterRefreshValue}"`);
        
        // 비밀번호 필드도 확인
        const passwordSelector = '#memberPassword';
        await page.waitForSelector(passwordSelector, { timeout: 10000 });
        const passwordValue = await page.inputValue(passwordSelector);
        console.log(`   - 비밀번호 필드 값: "${passwordValue}"`);
        
        // 스크린샷 캡처 - 새로고침 후 상태
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc013_03_after_refresh.png',
            fullPage: true 
        });
        console.log('   - 새로고침 후 상태 스크린샷 저장 완료');
        
        // 결과 검증
        console.log('7. 테스트 결과 검증 중...');
        
        let testResult = {
            pageRefreshed: false,
            fieldsCleared: false,
            loginFunctionWorking: false
        };
        
        // 1. 페이지가 정상적으로 새로고침되었는지 확인
        if (page.url() === 'https://m.albamon.com/user-account/login?my_page=1') {
            console.log('   ✅ 페이지가 정상적으로 새로고침됨');
            testResult.pageRefreshed = true;
        } else {
            console.log(`   ❌ 페이지 URL이 예상과 다름: ${page.url()}`);
        }
        
        // 2. 모든 입력 필드가 초기화되었는지 확인
        if (afterRefreshValue === '' && passwordValue === '') {
            console.log('   ✅ 모든 입력 필드가 초기화됨');
            testResult.fieldsCleared = true;
        } else {
            console.log('   ❌ 입력 필드가 완전히 초기화되지 않음');
            console.log(`     - 아이디 필드: "${afterRefreshValue}"`);
            console.log(`     - 비밀번호 필드: "${passwordValue}"`);
        }
        
        // 3. 로그인 기능이 정상적으로 동작하는지 확인
        console.log('8. 로그인 기능 동작 확인 중...');
        
        // 테스트용 유효한 데이터 입력
        await page.fill(userIdSelector, 'test_user');
        await page.fill(passwordSelector, 'test_pass');
        
        console.log('   - 테스트 데이터 재입력 완료');
        
        // 로그인 버튼 확인
        const loginButtonSelector = 'button[type="submit"]';
        
        try {
            await page.waitForSelector(loginButtonSelector, { timeout: 5000 });
            const loginButton = await page.$(loginButtonSelector);
            
            if (loginButton) {
                const isEnabled = await loginButton.isEnabled();
                const isVisible = await loginButton.isVisible();
                
                if (isEnabled && isVisible) {
                    console.log('   ✅ 로그인 버튼이 정상적으로 동작함');
                    testResult.loginFunctionWorking = true;
                } else {
                    console.log(`   ❌ 로그인 버튼 상태 이상 - Enabled: ${isEnabled}, Visible: ${isVisible}`);
                }
            } else {
                console.log('   ❌ 로그인 버튼을 찾을 수 없음');
            }
        } catch (error) {
            console.log('   ❌ 로그인 버튼 확인 실패:', error.message);
        }
        
        // 최종 스크린샷 캡처
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc013_04_final_validation.png',
            fullPage: true 
        });
        console.log('   - 최종 검증 스크린샷 저장 완료');
        
        // 테스트 결과 요약
        console.log('\n========== 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-013 페이지 새로고침 후 동작 확인`);
        console.log(`테스트 URL: ${page.url()}`);
        console.log(`페이지 새로고침 성공: ${testResult.pageRefreshed ? '성공' : '실패'}`);
        console.log(`입력 필드 초기화: ${testResult.fieldsCleared ? '성공' : '실패'}`);
        console.log(`로그인 기능 동작: ${testResult.loginFunctionWorking ? '정상' : '이상'}`);
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        
        // 전체 테스트 결과 판정
        const allTestsPassed = testResult.pageRefreshed && testResult.fieldsCleared && testResult.loginFunctionWorking;
        
        if (allTestsPassed) {
            console.log('✅ TC-013 테스트 PASS: 페이지 새로고침 후 모든 기능이 정상 동작');
        } else {
            console.log('❌ TC-013 테스트 FAIL: 일부 기능에서 문제 발견');
            
            // 실패한 항목 상세 표시
            if (!testResult.pageRefreshed) {
                console.log('   - 페이지 새로고침 실패');
            }
            if (!testResult.fieldsCleared) {
                console.log('   - 입력 필드 초기화 실패');
            }
            if (!testResult.loginFunctionWorking) {
                console.log('   - 로그인 기능 동작 이상');
            }
        }
        
        return testResult;
        
    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류 발생:');
        console.error(error.message);
        console.error('Stack trace:', error.stack);
        
        // 오류 발생 시에도 스크린샷 저장
        if (page) {
            try {
                await page.screenshot({ 
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc013_error.png',
                    fullPage: true 
                });
                console.log('   - 오류 상황 스크린샷 저장 완료');
            } catch (screenshotError) {
                console.error('   - 스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        console.log('❌ TC-013 테스트 ERROR: 실행 중 오류 발생');
        return null;
        
    } finally {
        // 리소스 정리
        if (browser) {
            console.log('\n9. 브라우저 종료 중...');
            await browser.close();
        }
        
        console.log('========== TC-013 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runPageRefreshTest().catch(console.error);
}

module.exports = { runPageRefreshTest };