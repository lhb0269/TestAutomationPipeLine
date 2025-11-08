/**
 * TC-012: 브라우저 뒤로가기 후 재접근 테스트
 * 
 * 테스트 시나리오:
 * 1. 로그인 페이지 접속
 * 2. 알바몬 메인 페이지(https://m.albamon.com)로 이동
 * 3. 브라우저 뒤로가기 버튼 클릭
 * 4. 로그인 폼 상태 확인
 * 
 * 예상 결과:
 * - 로그인 페이지가 정상적으로 표시됨
 * - 입력 필드가 초기화된 상태
 * - 모든 기능이 정상적으로 동작함
 */

const { chromium } = require('playwright');

async function runBrowserBackTest() {
    let browser;
    let context;
    let page;
    
    try {
        console.log('========== TC-012: 브라우저 뒤로가기 후 재접근 테스트 시작 ==========');
        
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
        
        // 스텝 1: 로그인 페이지 접속
        console.log('2. 알바몬 로그인 페이지 접속 중...');
        await page.goto('https://m.albamon.com/user-account/login?my_page=1', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        // 페이지 로딩 완료 대기
        await page.waitForTimeout(2000);
        
        // 페이지 제목 확인
        const loginTitle = await page.title();
        console.log(`   - 로그인 페이지 제목: ${loginTitle}`);
        
        // 로그인 폼 요소들 확인
        const userIdSelector = '#memberId';
        const passwordSelector = '#memberPassword';
        const loginButtonSelector = 'button[type="submit"]';
        
        await page.waitForSelector(userIdSelector, { timeout: 10000 });
        await page.waitForSelector(passwordSelector, { timeout: 10000 });
        await page.waitForSelector(loginButtonSelector, { timeout: 10000 });
        
        console.log('   - 로그인 폼 요소들 정상 확인');
        
        // 스크린샷 캡처 - 초기 로그인 페이지
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc012_01_initial_login_page.png',
            fullPage: true 
        });
        console.log('   - 초기 로그인 페이지 스크린샷 저장 완료');
        
        // 스텝 2: 알바몬 메인 페이지로 이동
        console.log('3. 알바몬 메인 페이지로 이동 중...');
        await page.goto('https://m.albamon.com', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        // 메인 페이지 로딩 완료 대기
        await page.waitForTimeout(2000);
        
        // 메인 페이지 제목 확인
        const mainTitle = await page.title();
        console.log(`   - 메인 페이지 제목: ${mainTitle}`);
        
        // 현재 URL 확인
        const mainURL = page.url();
        console.log(`   - 메인 페이지 URL: ${mainURL}`);
        
        // 스크린샷 캡처 - 메인 페이지
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc012_02_main_page.png',
            fullPage: true 
        });
        console.log('   - 메인 페이지 스크린샷 저장 완료');
        
        // 스텝 3: 브라우저 뒤로가기 버튼 클릭
        console.log('4. 브라우저 뒤로가기 버튼 클릭 중...');
        await page.goBack();
        
        // 뒤로가기 후 페이지 로딩 대기
        await page.waitForTimeout(3000);
        
        // 현재 URL 확인
        const backURL = page.url();
        console.log(`   - 뒤로가기 후 URL: ${backURL}`);
        
        // 스텝 4: 로그인 폼 상태 확인
        console.log('5. 로그인 폼 상태 확인 중...');
        
        // 로그인 페이지로 돌아왔는지 확인
        let isBackToLoginPage = false;
        if (backURL.includes('login')) {
            console.log('   ✅ 로그인 페이지로 정상 복귀');
            isBackToLoginPage = true;
        } else {
            console.log('   ❌ 로그인 페이지로 복귀하지 못함');
        }
        
        // 페이지 제목 재확인
        const backTitle = await page.title();
        console.log(`   - 복귀 후 페이지 제목: ${backTitle}`);
        
        let allElementsPresent = false;
        let fieldsCleared = false;
        let functionalityWorking = false;
        
        if (isBackToLoginPage) {
            // 로그인 폼 요소들이 정상적으로 표시되는지 확인
            console.log('6. 로그인 폼 요소들 정상 표시 확인 중...');
            
            try {
                // 아이디 필드 확인
                await page.waitForSelector(userIdSelector, { timeout: 5000 });
                const userIdField = await page.$(userIdSelector);
                console.log('   ✅ 아이디 입력 필드 정상 표시');
                
                // 비밀번호 필드 확인
                await page.waitForSelector(passwordSelector, { timeout: 5000 });
                const passwordField = await page.$(passwordSelector);
                console.log('   ✅ 비밀번호 입력 필드 정상 표시');
                
                // 로그인 버튼 확인
                await page.waitForSelector(loginButtonSelector, { timeout: 5000 });
                const loginButton = await page.$(loginButtonSelector);
                console.log('   ✅ 로그인 버튼 정상 표시');
                
                allElementsPresent = true;
                
                // 입력 필드가 초기화된 상태인지 확인
                console.log('7. 입력 필드 초기화 상태 확인 중...');
                
                const userIdValue = await page.inputValue(userIdSelector);
                const passwordValue = await page.inputValue(passwordSelector);
                
                console.log(`   - 아이디 필드 값: "${userIdValue}"`);
                console.log(`   - 비밀번호 필드 값: "${passwordValue}"`);
                
                if (!userIdValue && !passwordValue) {
                    console.log('   ✅ 입력 필드가 정상적으로 초기화됨');
                    fieldsCleared = true;
                } else {
                    console.log('   ⚠️ 입력 필드에 이전 값이 남아있음');
                    fieldsCleared = false;
                }
                
                // 모든 기능이 정상적으로 동작하는지 확인
                console.log('8. 로그인 폼 기능 동작 확인 중...');
                
                // 테스트용 데이터 입력해보기
                await page.fill(userIdSelector, 'test123');
                await page.waitForTimeout(500);
                
                await page.fill(passwordSelector, 'testpass');
                await page.waitForTimeout(500);
                
                // 입력이 정상적으로 되었는지 확인
                const testUserId = await page.inputValue(userIdSelector);
                const testPassword = await page.inputValue(passwordSelector);
                
                if (testUserId === 'test123' && testPassword === 'testpass') {
                    console.log('   ✅ 입력 기능 정상 동작');
                    functionalityWorking = true;
                    
                    // 버튼 클릭 가능 여부 확인
                    const buttonEnabled = await page.isEnabled(loginButtonSelector);
                    if (buttonEnabled) {
                        console.log('   ✅ 로그인 버튼 클릭 가능');
                    } else {
                        console.log('   ⚠️ 로그인 버튼이 비활성화 상태');
                    }
                } else {
                    console.log('   ❌ 입력 기능에 문제 발생');
                    functionalityWorking = false;
                }
                
                // 테스트용 입력 데이터 정리
                await page.fill(userIdSelector, '');
                await page.fill(passwordSelector, '');
                
            } catch (error) {
                console.log('   ❌ 로그인 폼 요소 확인 중 오류 발생:', error.message);
                allElementsPresent = false;
            }
        }
        
        // 최종 스크린샷 캡처
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc012_03_back_to_login.png',
            fullPage: true 
        });
        console.log('   - 뒤로가기 후 로그인 페이지 스크린샷 저장 완료');
        
        // 추가 검증: 페이지 소스에서 필수 요소들 확인
        console.log('9. 페이지 소스 레벨에서 추가 검증 중...');
        
        const pageContent = await page.content();
        const hasLoginForm = pageContent.includes('memberId') && pageContent.includes('memberPassword');
        const hasSubmitButton = pageContent.includes('type="submit"') || pageContent.includes('로그인');
        
        console.log(`   - 로그인 폼 존재 여부: ${hasLoginForm ? '✅ 존재' : '❌ 없음'}`);
        console.log(`   - 제출 버튼 존재 여부: ${hasSubmitButton ? '✅ 존재' : '❌ 없음'}`);
        
        // 전체 테스트 결과 평가
        const overallSuccess = isBackToLoginPage && allElementsPresent && fieldsCleared && functionalityWorking;
        
        // 테스트 결과 요약
        console.log('\n========== 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-012 브라우저 뒤로가기 후 재접근`);
        console.log(`테스트 URL: ${backURL}`);
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        console.log('\n--- 상세 검증 결과 ---');
        console.log(`✓ 로그인 페이지 복귀: ${isBackToLoginPage ? 'PASS' : 'FAIL'}`);
        console.log(`✓ 폼 요소들 표시: ${allElementsPresent ? 'PASS' : 'FAIL'}`);
        console.log(`✓ 입력 필드 초기화: ${fieldsCleared ? 'PASS' : 'FAIL'}`);
        console.log(`✓ 기능 정상 동작: ${functionalityWorking ? 'PASS' : 'FAIL'}`);
        console.log(`✓ 페이지 소스 검증: ${(hasLoginForm && hasSubmitButton) ? 'PASS' : 'FAIL'}`);
        
        if (overallSuccess) {
            console.log('\n✅ TC-012 테스트 PASS: 브라우저 뒤로가기 후 로그인 페이지가 정상적으로 동작함');
        } else {
            console.log('\n❌ TC-012 테스트 FAIL: 브라우저 뒤로가기 후 일부 기능에 문제 발생');
        }
        
        return {
            success: overallSuccess,
            backToLoginPage: isBackToLoginPage,
            allElementsPresent: allElementsPresent,
            fieldsCleared: fieldsCleared,
            functionalityWorking: functionalityWorking,
            pageSourceValid: hasLoginForm && hasSubmitButton
        };
        
    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류 발생:');
        console.error(error.message);
        
        // 오류 발생 시에도 스크린샷 저장
        if (page) {
            try {
                await page.screenshot({ 
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc012_error.png',
                    fullPage: true 
                });
                console.log('   - 오류 상황 스크린샷 저장 완료');
            } catch (screenshotError) {
                console.error('   - 스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        console.log('❌ TC-012 테스트 ERROR: 실행 중 오류 발생');
        
        return {
            success: false,
            error: error.message,
            backToLoginPage: false,
            allElementsPresent: false,
            fieldsCleared: false,
            functionalityWorking: false,
            pageSourceValid: false
        };
        
    } finally {
        // 리소스 정리
        if (browser) {
            console.log('\n10. 브라우저 종료 중...');
            await browser.close();
        }
        
        console.log('========== TC-012 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runBrowserBackTest().catch(console.error);
}

module.exports = { runBrowserBackTest };