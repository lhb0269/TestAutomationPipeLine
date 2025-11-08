/**
 * TC-002: 로그인 페이지에 정상적으로 접근할 수 있는지 확인
 * 
 * 테스트 시나리오:
 * 1. 알바몬 로그인 페이지 접속
 * 2. 페이지 로딩 완료 대기
 * 3. 로그인 폼 요소 확인:
 *    - 아이디 입력 필드가 표시됨
 *    - 비밀번호 입력 필드가 표시됨
 *    - 로그인 버튼이 표시됨
 *    - SNS 로그인 버튼들(카카오, 네이버)이 표시됨
 */

const { chromium } = require('playwright');

async function runPageAccessTest() {
    let browser;
    let context;
    let page;
    
    try {
        console.log('========== TC-002: 로그인 페이지 접근 확인 테스트 시작 ==========');
        
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
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc002_01_initial_page.png',
            fullPage: true 
        });
        console.log('   - 초기 페이지 스크린샷 저장 완료');
        
        // 스텝 2: 페이지 접근 확인
        console.log('3. 페이지 접근 상태 확인 중...');
        const currentURL = page.url();
        console.log(`   - 현재 URL: ${currentURL}`);
        
        let pageAccessSuccess = false;
        if (currentURL.includes('albamon.com') && currentURL.includes('login')) {
            console.log('   ✅ 페이지 접근 성공');
            pageAccessSuccess = true;
        } else {
            console.log('   ❌ 페이지 접근 실패');
        }
        
        // 스텝 3: 아이디 입력 필드 확인
        console.log('4. 아이디 입력 필드 확인 중...');
        
        const userIdSelectors = [
            '#memberId',
            '#userId',
            'input[name="userId"]',
            'input[placeholder*="아이디"]',
            'input[type="text"]:first-of-type'
        ];
        
        let userIdFound = false;
        let userIdSelector = '';
        
        for (const selector of userIdSelectors) {
            try {
                const element = await page.waitForSelector(selector, { timeout: 2000 });
                if (element) {
                    console.log(`   - 아이디 필드 발견: ${selector}`);
                    userIdFound = true;
                    userIdSelector = selector;
                    break;
                }
            } catch (error) {
                // 다음 선택자 시도
            }
        }
        
        if (userIdFound) {
            console.log('   ✅ 아이디 입력 필드 정상 표시됨');
        } else {
            console.log('   ❌ 아이디 입력 필드 미발견');
        }
        
        // 스텝 4: 비밀번호 입력 필드 확인
        console.log('5. 비밀번호 입력 필드 확인 중...');
        
        const passwordSelectors = [
            '#memberPassword',
            '#userPw',
            'input[name="userPw"]',
            'input[placeholder*="비밀번호"]',
            'input[type="password"]'
        ];
        
        let passwordFound = false;
        let passwordSelector = '';
        
        for (const selector of passwordSelectors) {
            try {
                const element = await page.waitForSelector(selector, { timeout: 2000 });
                if (element) {
                    console.log(`   - 비밀번호 필드 발견: ${selector}`);
                    passwordFound = true;
                    passwordSelector = selector;
                    break;
                }
            } catch (error) {
                // 다음 선택자 시도
            }
        }
        
        if (passwordFound) {
            console.log('   ✅ 비밀번호 입력 필드 정상 표시됨');
        } else {
            console.log('   ❌ 비밀번호 입력 필드 미발견');
        }
        
        // 스텝 5: 로그인 버튼 확인
        console.log('6. 로그인 버튼 확인 중...');
        
        const loginButtonSelectors = [
            'button[type="submit"]',
            '#loginBtn',
            '.login-btn',
            'button:has-text("로그인")'
        ];
        
        let loginButtonFound = false;
        let loginButtonSelector = '';
        
        for (const selector of loginButtonSelectors) {
            try {
                const element = await page.waitForSelector(selector, { timeout: 2000 });
                if (element) {
                    console.log(`   - 로그인 버튼 발견: ${selector}`);
                    loginButtonFound = true;
                    loginButtonSelector = selector;
                    break;
                }
            } catch (error) {
                // 다음 선택자 시도
            }
        }
        
        if (loginButtonFound) {
            console.log('   ✅ 로그인 버튼 정상 표시됨');
        } else {
            console.log('   ❌ 로그인 버튼 미발견');
        }
        
        // 스텝 6: SNS 로그인 버튼 확인
        console.log('7. SNS 로그인 버튼들 확인 중...');
        
        // 카카오 로그인 버튼 확인
        const kakaoSelectors = [
            'button:has-text("카카오")',
            '#kakaoLogin',
            '.kakao-btn',
            '[data-provider="kakao"]'
        ];
        
        let kakaoFound = false;
        for (const selector of kakaoSelectors) {
            try {
                const element = await page.waitForSelector(selector, { timeout: 2000 });
                if (element) {
                    console.log(`   - 카카오 로그인 버튼 발견: ${selector}`);
                    kakaoFound = true;
                    break;
                }
            } catch (error) {
                // 다음 선택자 시도
            }
        }
        
        if (kakaoFound) {
            console.log('   ✅ 카카오 로그인 버튼 정상 표시됨');
        } else {
            console.log('   ❌ 카카오 로그인 버튼 미발견');
        }
        
        // 네이버 로그인 버튼 확인
        const naverSelectors = [
            'button:has-text("네이버")',
            '#naverLogin',
            '.naver-btn',
            '[data-provider="naver"]'
        ];
        
        let naverFound = false;
        for (const selector of naverSelectors) {
            try {
                const element = await page.waitForSelector(selector, { timeout: 2000 });
                if (element) {
                    console.log(`   - 네이버 로그인 버튼 발견: ${selector}`);
                    naverFound = true;
                    break;
                }
            } catch (error) {
                // 다음 선택자 시도
            }
        }
        
        if (naverFound) {
            console.log('   ✅ 네이버 로그인 버튼 정상 표시됨');
        } else {
            console.log('   ❌ 네이버 로그인 버튼 미발견');
        }
        
        // 스크린샷 캡처 - 최종 결과
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc002_02_final_result.png',
            fullPage: true 
        });
        console.log('   - 최종 결과 스크린샷 저장 완료');
        
        // 테스트 결과 요약
        console.log('\n========== 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-002 로그인 페이지 접근 확인`);
        console.log(`페이지 접근: ${pageAccessSuccess ? '성공' : '실패'}`);
        console.log(`아이디 필드: ${userIdFound ? '표시됨' : '미표시'}`);
        console.log(`비밀번호 필드: ${passwordFound ? '표시됨' : '미표시'}`);
        console.log(`로그인 버튼: ${loginButtonFound ? '표시됨' : '미표시'}`);
        console.log(`카카오 버튼: ${kakaoFound ? '표시됨' : '미표시'}`);
        console.log(`네이버 버튼: ${naverFound ? '표시됨' : '미표시'}`);
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        
        // 필수 요소 검증
        const requiredElements = [pageAccessSuccess, userIdFound, passwordFound, loginButtonFound];
        const allRequiredFound = requiredElements.every(result => result === true);
        
        const totalChecks = 6;
        const successChecks = [pageAccessSuccess, userIdFound, passwordFound, loginButtonFound, kakaoFound, naverFound].filter(Boolean).length;
        
        console.log(`\n전체 검증 항목: ${totalChecks}개`);
        console.log(`성공 항목: ${successChecks}개`);
        console.log(`실패 항목: ${totalChecks - successChecks}개`);
        console.log(`성공률: ${((successChecks / totalChecks) * 100).toFixed(1)}%`);
        
        if (allRequiredFound) {
            console.log('✅ TC-002 테스트 PASS: 로그인 페이지 접근 및 필수 UI 요소 확인 성공');
        } else {
            console.log('❌ TC-002 테스트 FAIL: 일부 필수 UI 요소 미발견');
        }
        
    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류 발생:');
        console.error(error.message);
        
        // 오류 발생 시에도 스크린샷 저장
        if (page) {
            try {
                await page.screenshot({ 
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc002_error.png',
                    fullPage: true 
                });
                console.log('   - 오류 상황 스크린샷 저장 완료');
            } catch (screenshotError) {
                console.error('   - 스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        console.log('❌ TC-002 테스트 ERROR: 실행 중 오류 발생');
        
    } finally {
        // 리소스 정리
        if (browser) {
            console.log('\n8. 브라우저 종료 중...');
            await browser.close();
        }
        
        console.log('========== TC-002 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runPageAccessTest().catch(console.error);
}

module.exports = { runPageAccessTest };