/**
 * TC-015: 카카오 로그인 버튼 기능 확인
 * 
 * 테스트 시나리오:
 * 1. 알바몬 로그인 페이지 접속
 * 2. 카카오 로그인 버튼 위치 확인
 * 3. 카카오 로그인 버튼 클릭
 * 4. 페이지 이동 확인
 * 5. 카카오 인증 페이지 로딩 확인
 * 
 * 예상 결과:
 * - 카카오 인증 페이지로 정상 이동
 * - 카카오 로그인 폼이 표시됨
 * - 알바몬으로 돌아가기 옵션 제공
 */

const { chromium } = require('playwright');

async function runKakaoLoginButtonTest() {
    let browser;
    let context;
    let page;
    
    try {
        console.log('========== TC-015: 카카오 로그인 버튼 기능 확인 테스트 시작 ==========');
        
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
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc015_01_initial_page.png',
            fullPage: true 
        });
        console.log('   - 초기 로그인 페이지 스크린샷 저장 완료');
        
        // 스텝 2: 카카오 로그인 버튼 위치 확인
        console.log('3. 카카오 로그인 버튼 위치 확인 중...');
        
        // 카카오 로그인 버튼을 찾기 위한 다양한 셀렉터
        const kakaoButtonSelectors = [
            'a[href*="kakao"]',                           // 카카오 링크가 포함된 a 태그
            'button:has-text("카카오")',                   // 카카오 텍스트가 포함된 버튼
            '.kakao-login',                               // 카카오 로그인 클래스
            '[class*="kakao"]',                           // 카카오가 포함된 클래스
            'img[alt*="카카오"], img[src*="kakao"]',       // 카카오 이미지
            '.sns-login a:first-child',                   // SNS 로그인 첫 번째 링크
            '.social-login a[href*="kakao"]',             // 소셜 로그인 카카오 링크
            'a[onclick*="kakao"]'                         // 카카오 onclick 이벤트
        ];
        
        let kakaoButton = null;
        let kakaoButtonSelector = '';
        
        // 카카오 버튼 찾기
        for (const selector of kakaoButtonSelectors) {
            try {
                kakaoButton = await page.$(selector);
                if (kakaoButton) {
                    kakaoButtonSelector = selector;
                    console.log(`   ✅ 카카오 로그인 버튼 발견: ${selector}`);
                    
                    // 버튼의 텍스트나 속성 정보 확인
                    const buttonText = await kakaoButton.textContent();
                    const buttonHref = await kakaoButton.getAttribute('href');
                    const buttonClass = await kakaoButton.getAttribute('class');
                    
                    console.log(`   - 버튼 텍스트: ${buttonText?.trim() || 'N/A'}`);
                    console.log(`   - 버튼 href: ${buttonHref || 'N/A'}`);
                    console.log(`   - 버튼 class: ${buttonClass || 'N/A'}`);
                    break;
                }
            } catch (error) {
                // 해당 셀렉터로 요소를 찾을 수 없음
                continue;
            }
        }
        
        if (!kakaoButton) {
            console.log('   ❌ 카카오 로그인 버튼을 찾을 수 없습니다.');
            console.log('   - 페이지의 모든 링크와 버튼을 확인해보겠습니다...');
            
            // 모든 링크와 버튼 요소 확인
            const allLinks = await page.$$eval('a', links => 
                links.map(link => ({
                    text: link.textContent?.trim(),
                    href: link.href,
                    class: link.className
                })).filter(link => link.text || link.href)
            );
            
            const allButtons = await page.$$eval('button', buttons => 
                buttons.map(button => ({
                    text: button.textContent?.trim(),
                    class: button.className,
                    type: button.type
                })).filter(button => button.text)
            );
            
            console.log('   - 페이지의 모든 링크:');
            allLinks.forEach((link, index) => {
                if (index < 10) { // 처음 10개만 출력
                    console.log(`     ${index + 1}. "${link.text}" - ${link.href} (${link.class})`);
                }
            });
            
            console.log('   - 페이지의 모든 버튼:');
            allButtons.forEach((button, index) => {
                if (index < 10) { // 처음 10개만 출력
                    console.log(`     ${index + 1}. "${button.text}" (${button.class})`);
                }
            });
            
            throw new Error('카카오 로그인 버튼을 찾을 수 없습니다.');
        }
        
        // 버튼이 화면에 보이는지 확인
        const isVisible = await kakaoButton.isVisible();
        const isEnabled = await kakaoButton.isEnabled();
        
        console.log(`   - 버튼 가시성: ${isVisible ? '보임' : '안보임'}`);
        console.log(`   - 버튼 활성화: ${isEnabled ? '활성' : '비활성'}`);
        
        if (!isVisible) {
            console.log('   - 버튼이 보이지 않습니다. 스크롤하여 찾아보겠습니다...');
            await kakaoButton.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
        }
        
        // 카카오 버튼 하이라이트를 위한 스크린샷
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc015_02_kakao_button_found.png',
            fullPage: true 
        });
        console.log('   - 카카오 버튼 확인 스크린샷 저장 완료');
        
        // 스텝 3: 카카오 로그인 버튼 클릭
        console.log('4. 카카오 로그인 버튼 클릭 중...');
        
        // 버튼 클릭 전 현재 URL 저장
        const beforeClickURL = page.url();
        console.log(`   - 클릭 전 URL: ${beforeClickURL}`);
        
        // 새 페이지 열림을 감지하기 위한 리스너 설정
        let newPagePromise = context.waitForEvent('page');
        
        // 카카오 로그인 버튼 클릭
        await kakaoButton.click();
        console.log('   - 카카오 로그인 버튼 클릭 완료');
        
        // 스텝 4: 페이지 이동 확인
        console.log('5. 페이지 이동 확인 중...');
        
        let kakaoAuthPage = null;
        let isNewTabOpened = false;
        
        try {
            // 새 탭이 열리는지 확인 (타임아웃 5초)
            kakaoAuthPage = await Promise.race([
                newPagePromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('새 탭 타임아웃')), 5000)
                )
            ]);
            
            if (kakaoAuthPage) {
                isNewTabOpened = true;
                console.log('   ✅ 새 탭에서 카카오 인증 페이지가 열렸습니다.');
                
                // 새 페이지 로딩 대기
                await kakaoAuthPage.waitForLoadState('networkidle', { timeout: 15000 });
                
                const kakaoURL = kakaoAuthPage.url();
                console.log(`   - 카카오 인증 페이지 URL: ${kakaoURL}`);
                
                // 카카오 도메인 확인
                if (kakaoURL.includes('kauth.kakao.com') || kakaoURL.includes('kakao.com')) {
                    console.log('   ✅ 카카오 인증 도메인으로 정상 이동 확인');
                } else {
                    console.log('   ⚠️ 예상과 다른 도메인으로 이동했습니다.');
                }
                
                page = kakaoAuthPage; // 페이지 참조 업데이트
            }
            
        } catch (error) {
            console.log('   - 새 탭이 열리지 않았습니다. 현재 탭에서 이동을 확인합니다...');
            
            // 현재 페이지에서 URL 변경 확인
            await page.waitForTimeout(3000);
            const afterClickURL = page.url();
            console.log(`   - 클릭 후 URL: ${afterClickURL}`);
            
            if (afterClickURL !== beforeClickURL) {
                console.log('   ✅ 현재 탭에서 페이지 이동 확인');
                
                if (afterClickURL.includes('kakao.com')) {
                    console.log('   ✅ 카카오 도메인으로 이동 확인');
                } else {
                    console.log('   ⚠️ 카카오가 아닌 다른 페이지로 이동했습니다.');
                }
            } else {
                console.log('   ❌ 페이지 이동이 감지되지 않았습니다.');
            }
        }
        
        // 스텝 5: 카카오 인증 페이지 로딩 확인
        console.log('6. 카카오 인증 페이지 로딩 확인 중...');
        
        await page.waitForTimeout(2000);
        
        // 카카오 인증 페이지 요소 확인
        const kakaoAuthSelectors = [
            'input[name="loginId"]',              // 카카오 아이디 입력 필드
            'input[name="password"]',             // 카카오 비밀번호 입력 필드
            '.login_form',                        // 로그인 폼
            '.login-form',                        // 로그인 폼 (다른 클래스명)
            'form[action*="login"]',              // 로그인 액션 폼
            '.kakao_account',                     // 카카오 계정 관련
            '#loginId, #password',                // ID 기반 입력 필드
            'button[type="submit"]',              // 제출 버튼
            '.btn_login',                         // 로그인 버튼
            'img[alt*="카카오"], img[src*="kakao"]' // 카카오 로고
        ];
        
        let kakaoAuthFound = false;
        let foundElements = [];
        
        for (const selector of kakaoAuthSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    const elementText = await element.textContent();
                    const elementTag = await element.evaluate(el => el.tagName);
                    foundElements.push(`${elementTag}: ${elementText?.trim() || selector}`);
                    kakaoAuthFound = true;
                }
            } catch (error) {
                // 요소를 찾을 수 없음
            }
        }
        
        if (kakaoAuthFound) {
            console.log('   ✅ 카카오 인증 페이지 요소 발견:');
            foundElements.forEach(element => {
                console.log(`     - ${element}`);
            });
        } else {
            console.log('   ⚠️ 카카오 인증 페이지 요소를 찾을 수 없습니다.');
            console.log('   - 페이지 내용을 확인해보겠습니다...');
            
            // 페이지 제목 확인
            const pageTitle = await page.title();
            console.log(`   - 페이지 제목: ${pageTitle}`);
            
            // 페이지의 주요 텍스트 확인
            const bodyText = await page.evaluate(() => {
                return document.body?.textContent?.substring(0, 500) || '';
            });
            console.log(`   - 페이지 내용 (처음 500자): ${bodyText.trim()}`);
        }
        
        // 알바몬으로 돌아가기 옵션 확인
        console.log('7. 알바몬으로 돌아가기 옵션 확인 중...');
        
        const backToAlbamonSelectors = [
            'a:has-text("알바몬")',
            'a:has-text("돌아가기")',
            'a:has-text("취소")',
            'button:has-text("취소")',
            'button:has-text("돌아가기")',
            '.back-button',
            '.cancel-button',
            'a[href*="albamon"]'
        ];
        
        let backOptionFound = false;
        
        for (const selector of backToAlbamonSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    const elementText = await element.textContent();
                    console.log(`   ✅ 돌아가기 옵션 발견: "${elementText?.trim()}" (${selector})`);
                    backOptionFound = true;
                    break;
                }
            } catch (error) {
                // 요소를 찾을 수 없음
            }
        }
        
        if (!backOptionFound) {
            console.log('   ⚠️ 명시적인 알바몬 돌아가기 옵션을 찾을 수 없습니다.');
            console.log('   - 브라우저 뒤로가기 버튼으로 돌아갈 수 있습니다.');
        }
        
        // 최종 스크린샷 캡처
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc015_03_kakao_auth_page.png',
            fullPage: true 
        });
        console.log('   - 카카오 인증 페이지 스크린샷 저장 완료');
        
        // 테스트 결과 요약
        console.log('\n========== 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-015 카카오 로그인 버튼 기능 확인`);
        console.log(`카카오 버튼 선택자: ${kakaoButtonSelector}`);
        console.log(`최종 URL: ${page.url()}`);
        console.log(`새 탭 열림 여부: ${isNewTabOpened ? '예' : '아니오'}`);
        console.log(`카카오 인증 페이지 확인: ${kakaoAuthFound ? '성공' : '실패'}`);
        console.log(`돌아가기 옵션 확인: ${backOptionFound ? '있음' : '없음'}`);
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        
        // 최종 판정
        const isTestPass = kakaoButton && (page.url().includes('kakao.com') || kakaoAuthFound);
        
        if (isTestPass) {
            console.log('✅ TC-015 테스트 PASS: 카카오 로그인 버튼이 정상적으로 동작함');
        } else {
            console.log('❌ TC-015 테스트 FAIL: 카카오 로그인 버튼 기능에 문제가 있음');
        }
        
        return {
            success: isTestPass,
            kakaoButtonFound: !!kakaoButton,
            pageRedirected: page.url().includes('kakao.com'),
            authPageFound: kakaoAuthFound,
            backOptionFound: backOptionFound,
            newTabOpened: isNewTabOpened,
            finalURL: page.url()
        };
        
    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류 발생:');
        console.error(error.message);
        
        // 오류 발생 시에도 스크린샷 저장
        if (page) {
            try {
                await page.screenshot({ 
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc015_error.png',
                    fullPage: true 
                });
                console.log('   - 오류 상황 스크린샷 저장 완료');
            } catch (screenshotError) {
                console.error('   - 스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        console.log('❌ TC-015 테스트 ERROR: 실행 중 오류 발생');
        
        return {
            success: false,
            error: error.message,
            kakaoButtonFound: false,
            pageRedirected: false,
            authPageFound: false,
            backOptionFound: false,
            newTabOpened: false,
            finalURL: page ? page.url() : 'unknown'
        };
        
    } finally {
        // 리소스 정리
        if (browser) {
            console.log('\n8. 브라우저 종료 중...');
            await browser.close();
        }
        
        console.log('========== TC-015 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runKakaoLoginButtonTest().catch(console.error);
}

module.exports = { runKakaoLoginButtonTest };