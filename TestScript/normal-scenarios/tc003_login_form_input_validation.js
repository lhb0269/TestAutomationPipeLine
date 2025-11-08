/**
 * TC-003: 로그인 폼의 입력 필드가 정상적으로 작동하는지 확인
 * 
 * 테스트 시나리오:
 * 1. 알바몬 로그인 페이지 접속
 * 2. 아이디 입력 필드 클릭
 * 3. 'testuser' 입력
 * 4. 비밀번호 입력 필드 클릭
 * 5. 'testpass' 입력
 * 6. 입력된 값 확인:
 *    - 아이디 필드에 입력된 텍스트가 정상 표시됨
 *    - 비밀번호 필드에 입력된 텍스트가 마스킹되어 표시됨
 *    - 입력 포커스가 정상적으로 이동됨
 */

const { chromium } = require('playwright');

async function runInputValidationTest() {
    let browser;
    let context;
    let page;
    
    try {
        console.log('========== TC-003: 로그인 폼 입력 기능 확인 테스트 시작 ==========');
        
        // 브라우저 실행
        console.log('1. 브라우저 실행 중...');
        browser = await chromium.launch({ 
            headless: false,  // 테스트 과정을 시각적으로 확인
            slowMo: 1000      // 액션 간 1초 대기
        });
        
        context = await browser.newContext({
            viewport: { width: 375, height: 667 }, // 모바일 뷰포트
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
        await page.waitForTimeout(3000);
        
        // 페이지 제목 확인
        const title = await page.title();
        console.log(`   - 페이지 제목: ${title}`);
        
        // 스크린샷 캡처 - 초기 페이지
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc003_01_initial_page.png',
            fullPage: true 
        });
        console.log('   - 초기 페이지 스크린샷 저장 완료');
        
        // 스텝 2: 아이디 입력 필드 확인 및 클릭
        console.log('3. 아이디 입력 필드 확인 및 클릭 중...');
        
        const userIdSelectors = [
            '#memberId',
            '#userId',
            'input[name="userId"]',
            'input[placeholder*="아이디"]',
            'input[type="text"]:first-of-type'
        ];
        
        let userIdElement = null;
        let userIdSelector = '';
        
        for (const selector of userIdSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 2000 });
                userIdElement = await page.$(selector);
                if (userIdElement) {
                    console.log(`   - 아이디 필드 발견: ${selector}`);
                    userIdSelector = selector;
                    break;
                }
            } catch (error) {
                // 다음 선택자 시도
            }
        }
        
        if (!userIdElement) {
            throw new Error('아이디 입력 필드를 찾을 수 없습니다.');
        }
        
        // 아이디 필드 클릭
        await page.click(userIdSelector);
        console.log('   ✅ 아이디 입력 필드 클릭 완료');
        
        // 스텝 3: 아이디 텍스트 입력
        console.log('4. 아이디 텍스트 입력 중...');
        
        const testUserId = 'testuser';
        await page.fill(userIdSelector, '');  // 기존 값 지우기
        await page.type(userIdSelector, testUserId, { delay: 100 });
        console.log(`   - 아이디 "${testUserId}" 입력 완료`);
        
        // 입력된 값 확인
        const enteredUserId = await page.inputValue(userIdSelector);
        console.log(`   - 입력된 아이디 값: ${enteredUserId}`);
        
        // 스크린샷 캡처 - 아이디 입력 완료
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc003_02_userid_entered.png',
            fullPage: true 
        });
        console.log('   - 아이디 입력 후 스크린샷 저장 완료');
        
        // 스텝 4: 비밀번호 입력 필드 확인 및 클릭
        console.log('5. 비밀번호 입력 필드 확인 및 클릭 중...');
        
        const passwordSelectors = [
            '#memberPassword',
            '#userPw',
            'input[name="userPw"]',
            'input[placeholder*="비밀번호"]',
            'input[type="password"]'
        ];
        
        let passwordElement = null;
        let passwordSelector = '';
        
        for (const selector of passwordSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 2000 });
                passwordElement = await page.$(selector);
                if (passwordElement) {
                    console.log(`   - 비밀번호 필드 발견: ${selector}`);
                    passwordSelector = selector;
                    break;
                }
            } catch (error) {
                // 다음 선택자 시도
            }
        }
        
        if (!passwordElement) {
            throw new Error('비밀번호 입력 필드를 찾을 수 없습니다.');
        }
        
        // 비밀번호 필드 클릭
        await page.click(passwordSelector);
        console.log('   ✅ 비밀번호 입력 필드 클릭 완료');
        
        // 스텝 5: 비밀번호 텍스트 입력
        console.log('6. 비밀번호 텍스트 입력 중...');
        
        const testPassword = 'testpass';
        await page.fill(passwordSelector, '');  // 기존 값 지우기
        await page.type(passwordSelector, testPassword, { delay: 100 });
        console.log(`   - 비밀번호 "${testPassword}" 입력 완료`);
        
        // 입력된 값 확인
        const enteredPassword = await page.inputValue(passwordSelector);
        console.log(`   - 입력된 비밀번호 값: ${enteredPassword}`);
        
        // 스크린샷 캡처 - 비밀번호 입력 완료
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc003_03_password_entered.png',
            fullPage: true 
        });
        console.log('   - 비밀번호 입력 후 스크린샷 저장 완료');
        
        // 스텝 6: 입력값 검증
        console.log('7. 입력값 검증 수행 중...');
        
        // 1. 아이디 필드 텍스트 표시 확인
        const userIdDisplayed = await page.inputValue(userIdSelector);
        const isUserIdCorrect = userIdDisplayed === testUserId;
        console.log(`   - 아이디 필드 표시 검증: ${isUserIdCorrect ? '✅ 성공' : '❌ 실패'}`);
        console.log(`     예상값: ${testUserId}, 실제값: ${userIdDisplayed}`);
        
        // 2. 비밀번호 필드 마스킹 확인
        const passwordType = await page.getAttribute(passwordSelector, 'type');
        const isPasswordMasked = passwordType === 'password';
        console.log(`   - 비밀번호 마스킹 검증: ${isPasswordMasked ? '✅ 성공' : '❌ 실패'}`);
        console.log(`     필드 타입: ${passwordType}`);
        
        // 3. 비밀번호 값 저장 확인
        const passwordDisplayed = await page.inputValue(passwordSelector);
        const isPasswordCorrect = passwordDisplayed === testPassword;
        console.log(`   - 비밀번호 값 저장 검증: ${isPasswordCorrect ? '✅ 성공' : '❌ 실패'}`);
        console.log(`     예상값: ${testPassword}, 실제값: ${passwordDisplayed}`);
        
        // 4. 포커스 이동 테스트
        await page.click(userIdSelector);
        const userIdFocused = await page.evaluate(() => document.activeElement.id || document.activeElement.tagName);
        
        await page.click(passwordSelector);
        const passwordFocused = await page.evaluate(() => document.activeElement.id || document.activeElement.tagName);
        
        const isFocusWorking = passwordFocused !== userIdFocused;
        console.log(`   - 포커스 이동 검증: ${isFocusWorking ? '✅ 성공' : '❌ 실패'}`);
        console.log(`     아이디 클릭 후: ${userIdFocused}, 비밀번호 클릭 후: ${passwordFocused}`);
        
        // 스크린샷 캡처 - 최종 검증
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc003_04_final_validation.png',
            fullPage: true 
        });
        console.log('   - 최종 검증 스크린샷 저장 완료');
        
        // 테스트 결과 요약
        console.log('\n========== 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-003 로그인 폼 입력 기능 확인`);
        console.log(`아이디 텍스트 표시: ${isUserIdCorrect ? '성공' : '실패'}`);
        console.log(`비밀번호 마스킹: ${isPasswordMasked ? '성공' : '실패'}`);
        console.log(`비밀번호 값 저장: ${isPasswordCorrect ? '성공' : '실패'}`);
        console.log(`포커스 이동 기능: ${isFocusWorking ? '성공' : '실패'}`);
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        
        // 전체 결과 계산
        const allTests = [isUserIdCorrect, isPasswordMasked, isPasswordCorrect, isFocusWorking];
        const passedTests = allTests.filter(test => test === true).length;
        const totalTests = allTests.length;
        
        console.log(`\n전체 테스트: ${totalTests}개`);
        console.log(`성공한 테스트: ${passedTests}개`);
        console.log(`실패한 테스트: ${totalTests - passedTests}개`);
        console.log(`성공률: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        if (passedTests === totalTests) {
            console.log('✅ TC-003 테스트 PASS: 로그인 폼 입력 기능 정상 동작 확인');
        } else {
            console.log('❌ TC-003 테스트 FAIL: 일부 입력 기능에서 문제 발견');
        }
        
    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류 발생:');
        console.error(error.message);
        
        // 오류 발생 시에도 스크린샷 저장
        if (page) {
            try {
                await page.screenshot({ 
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc003_error.png',
                    fullPage: true 
                });
                console.log('   - 오류 상황 스크린샷 저장 완료');
            } catch (screenshotError) {
                console.error('   - 스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        console.log('❌ TC-003 테스트 ERROR: 실행 중 오류 발생');
        
    } finally {
        // 리소스 정리
        if (browser) {
            console.log('\n8. 브라우저 종료 중...');
            await browser.close();
        }
        
        console.log('========== TC-003 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runInputValidationTest().catch(console.error);
}

module.exports = { runInputValidationTest };