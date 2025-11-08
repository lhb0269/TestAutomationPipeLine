/**
 * TC-001: 유효한 계정 정보로 로그인이 성공하는지 확인
 * 
 * 테스트 시나리오:
 * 1. 알바몬 로그인 페이지 접속
 * 2. 아이디 입력 필드에 ' ' 입력
 * 3. 비밀번호 입력 필드에 '  ' 입력
 * 4. 로그인 버튼 클릭
 * 5. 로그인 성공하여 /personal/mypage 페이지로 이동하는지 확인
 * 6. 마이페이지가 정상적으로 표시되는지 확인
 */

const { chromium } = require('playwright');

async function runLoginTest() {
    let browser;
    let context;
    let page;
    
    try {
        console.log('========== TC-001: 유효한 계정 정보 로그인 테스트 시작 ==========');
        
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
        
        // 스크린샷 캡처 - 로그인 페이지
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\screenshot_01_login_page.png',
            fullPage: true 
        });
        console.log('   - 로그인 페이지 스크린샷 저장 완료');
        
        // 스텝 2: 아이디 입력 필드 확인 및 입력
        console.log('3. 아이디 입력 필드 확인 및 입력 중...');
        
        // 정확한 아이디 필드 셀렉터 사용
        const userIdSelector = '#memberId';
        
        // 아이디 필드 대기 및 확인
        await page.waitForSelector(userIdSelector, { timeout: 10000 });
        console.log(`   - 아이디 필드 발견: ${userIdSelector}`);
        
        // 아이디 입력
        await page.fill(userIdSelector, '');  // 기존 값 지우기
        await page.type(userIdSelector, '', { delay: 100 });
        console.log('   - 아이디 " " 입력 완료');
        
        // 스텝 3: 비밀번호 입력 필드 확인 및 입력
        console.log('4. 비밀번호 입력 필드 확인 및 입력 중...');
        
        // 정확한 비밀번호 필드 셀렉터 사용
        const passwordSelector = '#memberPassword';
        
        // 비밀번호 필드 대기 및 확인
        await page.waitForSelector(passwordSelector, { timeout: 10000 });
        console.log(`   - 비밀번호 필드 발견: ${passwordSelector}`);
        
        // 비밀번호 입력
        await page.fill(passwordSelector, '');  // 기존 값 지우기
        await page.type(passwordSelector, '  ', { delay: 100 });
        console.log('   - 비밀번호 입력 완료');
        
        // 스크린샷 캡처 - 입력 완료
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\screenshot_02_input_completed.png',
            fullPage: true 
        });
        console.log('   - 입력 완료 스크린샷 저장 완료');
        
        // 스텝 4: 로그인 버튼 클릭
        console.log('5. 로그인 버튼 클릭 중...');
        
        // 정확한 로그인 버튼 셀렉터 사용
        const loginButtonSelector = 'button[type="submit"]';
        
        // 로그인 버튼 대기 및 확인
        await page.waitForSelector(loginButtonSelector, { timeout: 10000 });
        console.log(`   - 로그인 버튼 발견: ${loginButtonSelector}`);
        
        // 로그인 버튼 클릭
        await page.click(loginButtonSelector);
        console.log('   - 로그인 버튼 클릭 완료');
        
        // 로그인 처리 대기
        console.log('6. 로그인 처리 대기 중...');
        await page.waitForTimeout(3000);
        
        // 스텝 5: 로그인 성공하여 마이페이지로 이동 확인
        console.log('7. 로그인 성공 및 페이지 이동 확인 중...');
        
        // 현재 URL 확인
        const currentURL = page.url();
        console.log(`   - 현재 URL: ${currentURL}`);
        
        // 마이페이지로 이동 확인
        let isLoginSuccess = false;
        
        if (currentURL.includes('/personal/mypage')) {
            console.log('   ✅ 로그인 성공: 마이페이지로 정상 이동');
            isLoginSuccess = true;
        } else if (currentURL.includes('mypage') || currentURL.includes('my-page')) {
            console.log('   ✅ 로그인 성공: 마이페이지 관련 URL로 이동');
            isLoginSuccess = true;
        } else {
            // 에러 메시지 확인
            const errorSelectors = [
                '.error-message',
                '.alert',
                '[class*="error"]',
                '.login-error',
                '#errorMsg'
            ];
            
            let hasError = false;
            for (const selector of errorSelectors) {
                try {
                    const errorElement = await page.$(selector);
                    if (errorElement) {
                        const errorText = await errorElement.textContent();
                        console.log(`   ❌ 로그인 실패 - 에러 메시지: ${errorText}`);
                        hasError = true;
                        break;
                    }
                } catch (e) {
                    // 에러 요소 없음
                }
            }
            
            if (!hasError) {
                console.log('   ⚠️ 로그인 결과 불명확 - 페이지가 예상과 다른 위치에 있음');
                console.log('   - 몇 초 더 대기 후 재확인...');
                
                await page.waitForTimeout(5000);
                const newURL = page.url();
                console.log(`   - 재확인 URL: ${newURL}`);
                
                if (newURL.includes('mypage') || newURL.includes('my-page') || newURL.includes('personal')) {
                    console.log('   ✅ 로그인 성공 확인: 마이페이지 관련 페이지로 이동');
                    isLoginSuccess = true;
                }
            }
        }
        
        // 스텝 6: 마이페이지 정상 표시 확인
        if (isLoginSuccess) {
            console.log('8. 마이페이지 정상 표시 확인 중...');
            
            // 페이지 로딩 완료 대기
            await page.waitForLoadState('networkidle', { timeout: 10000 });
            
            // 마이페이지 요소 확인
            const mypageSelectors = [
                'h1:has-text("마이페이지")',
                '.mypage',
                '[class*="my-page"]',
                'h1, h2, h3',  // 제목 요소들
                '.user-info, .profile'  // 사용자 정보 영역
            ];
            
            let mypageFound = false;
            for (const selector of mypageSelectors) {
                try {
                    const element = await page.$(selector);
                    if (element) {
                        const text = await element.textContent();
                        console.log(`   - 마이페이지 요소 발견: ${text?.trim()}`);
                        mypageFound = true;
                        break;
                    }
                } catch (e) {
                    // 요소 없음
                }
            }
            
            // 최종 스크린샷 캡처
            await page.screenshot({ 
                path: 'C:\\AIChallenge(QA)\\screenshot_03_mypage_result.png',
                fullPage: true 
            });
            console.log('   - 최종 결과 스크린샷 저장 완료');
            
            if (mypageFound) {
                console.log('   ✅ 마이페이지가 정상적으로 표시됨');
            } else {
                console.log('   ⚠️ 마이페이지 요소 확인 불가 - 스크린샷으로 수동 확인 필요');
            }
        }
        
        // 테스트 결과 요약
        console.log('\n========== 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-001 유효한 계정 정보 로그인`);
        console.log(`테스트 계정:  `);
        console.log(`최종 URL: ${page.url()}`);
        console.log(`로그인 성공 여부: ${isLoginSuccess ? '성공' : '실패'}`);
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        
        if (isLoginSuccess) {
            console.log('✅ TC-001 테스트 PASS: 유효한 계정으로 로그인 성공');
        } else {
            console.log('❌ TC-001 테스트 FAIL: 로그인 실패 또는 예상과 다른 결과');
        }
        
    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류 발생:');
        console.error(error.message);
        
        // 오류 발생 시에도 스크린샷 저장
        if (page) {
            try {
                await page.screenshot({ 
                    path: 'C:\\AIChallenge(QA)\\screenshot_error.png',
                    fullPage: true 
                });
                console.log('   - 오류 상황 스크린샷 저장 완료');
            } catch (screenshotError) {
                console.error('   - 스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        console.log('❌ TC-001 테스트 ERROR: 실행 중 오류 발생');
        
    } finally {
        // 리소스 정리
        if (browser) {
            console.log('\n9. 브라우저 종료 중...');
            await browser.close();
        }
        
        console.log('========== TC-001 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runLoginTest().catch(console.error);
}

module.exports = { runLoginTest };