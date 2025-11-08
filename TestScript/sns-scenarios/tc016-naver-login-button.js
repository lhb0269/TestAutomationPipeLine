/**
 * TC-016: 네이버 로그인 버튼 기능 확인
 * 
 * 테스트 시나리오:
 * 1. 알바몬 로그인 페이지 접속
 * 2. 네이버 로그인 버튼 위치 확인
 * 3. 네이버 로그인 버튼 클릭
 * 4. 페이지 이동 확인
 * 5. 네이버 인증 페이지 로딩 확인
 * 
 * 예상 결과:
 * - 네이버 인증 페이지로 정상 이동
 * - 네이버 로그인 폼이 표시됨
 * - 알바몬으로 돌아가기 옵션 제공
 */

const { chromium } = require('playwright');

async function runNaverLoginButtonTest() {
    let browser;
    let context;
    let page;
    
    try {
        console.log('========== TC-016: 네이버 로그인 버튼 기능 확인 테스트 시작 ==========');
        
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
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc016_01_initial_page.png',
            fullPage: true 
        });
        console.log('   - 초기 로그인 페이지 스크린샷 저장 완료');
        
        // 스텝 2: 네이버 로그인 버튼 위치 확인
        console.log('3. 네이버 로그인 버튼 위치 확인 중...');
        
        // 네이버 로그인 버튼을 찾기 위한 다양한 셀렉터
        const naverButtonSelectors = [
            'a[href*="naver"]',                           // 네이버 링크가 포함된 a 태그
            'button:has-text("네이버")',                   // 네이버 텍스트가 포함된 버튼
            '.naver-login',                               // 네이버 로그인 클래스
            '[class*="naver"]',                           // 네이버가 포함된 클래스
            'img[alt*="네이버"], img[src*="naver"]',       // 네이버 이미지
            '.sns-login a:nth-child(2)',                  // SNS 로그인 두 번째 링크
            '.social-login a[href*="naver"]',             // 소셜 로그인 네이버 링크
            'a[onclick*="naver"]',                        // 네이버 onclick 이벤트
            '.sns-login a[href*="id.naver.com"]',         // 네이버 ID 도메인 링크
            '[title*="네이버"], [alt*="네이버"]'           // 네이버 title 또는 alt 속성
        ];
        
        let naverButton = null;
        let naverButtonSelector = '';
        
        // 네이버 버튼 찾기
        for (const selector of naverButtonSelectors) {
            try {
                naverButton = await page.$(selector);
                if (naverButton) {
                    naverButtonSelector = selector;
                    console.log(`   ✅ 네이버 로그인 버튼 발견: ${selector}`);
                    
                    // 버튼의 텍스트나 속성 정보 확인
                    const buttonText = await naverButton.textContent();
                    const buttonHref = await naverButton.getAttribute('href');
                    const buttonClass = await naverButton.getAttribute('class');
                    
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
        
        if (!naverButton) {
            console.log('   ❌ 네이버 로그인 버튼을 찾을 수 없습니다.');
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
            
            // 네이버 관련 텍스트나 요소가 있는지 확인
            const naverRelatedElements = await page.$$eval('*', elements => 
                elements.filter(el => 
                    el.textContent?.includes('네이버') || 
                    el.getAttribute('href')?.includes('naver') ||
                    el.getAttribute('src')?.includes('naver') ||
                    el.getAttribute('alt')?.includes('네이버')
                ).map(el => ({
                    tagName: el.tagName,
                    text: el.textContent?.trim().substring(0, 50),
                    href: el.getAttribute('href'),
                    src: el.getAttribute('src'),
                    className: el.className
                }))
            );
            
            if (naverRelatedElements.length > 0) {
                console.log('   - 네이버 관련 요소들:');
                naverRelatedElements.forEach((element, index) => {
                    console.log(`     ${index + 1}. ${element.tagName}: "${element.text}" (${element.className})`);
                    if (element.href) console.log(`        href: ${element.href}`);
                    if (element.src) console.log(`        src: ${element.src}`);
                });
            }
            
            throw new Error('네이버 로그인 버튼을 찾을 수 없습니다.');
        }
        
        // 버튼이 화면에 보이는지 확인
        const isVisible = await naverButton.isVisible();
        const isEnabled = await naverButton.isEnabled();
        
        console.log(`   - 버튼 가시성: ${isVisible ? '보임' : '안보임'}`);
        console.log(`   - 버튼 활성화: ${isEnabled ? '활성' : '비활성'}`);
        
        if (!isVisible) {
            console.log('   - 버튼이 보이지 않습니다. 스크롤하여 찾아보겠습니다...');
            await naverButton.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
        }
        
        // 네이버 버튼 하이라이트를 위한 스크린샷
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc016_02_naver_button_found.png',
            fullPage: true 
        });
        console.log('   - 네이버 버튼 확인 스크린샷 저장 완료');
        
        // 스텝 3: 네이버 로그인 버튼 클릭
        console.log('4. 네이버 로그인 버튼 클릭 중...');
        
        // 버튼 클릭 전 현재 URL 저장
        const beforeClickURL = page.url();
        console.log(`   - 클릭 전 URL: ${beforeClickURL}`);
        
        // 새 페이지 열림을 감지하기 위한 리스너 설정
        let newPagePromise = context.waitForEvent('page');
        
        // 네이버 로그인 버튼 클릭
        await naverButton.click();
        console.log('   - 네이버 로그인 버튼 클릭 완료');
        
        // 스텝 4: 페이지 이동 확인
        console.log('5. 페이지 이동 확인 중...');
        
        let naverAuthPage = null;
        let isNewTabOpened = false;
        
        try {
            // 새 탭이 열리는지 확인 (타임아웃 5초)
            naverAuthPage = await Promise.race([
                newPagePromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('새 탭 타임아웃')), 5000)
                )
            ]);
            
            if (naverAuthPage) {
                isNewTabOpened = true;
                console.log('   ✅ 새 탭에서 네이버 인증 페이지가 열렸습니다.');
                
                // 새 페이지 로딩 대기
                await naverAuthPage.waitForLoadState('networkidle', { timeout: 15000 });
                
                const naverURL = naverAuthPage.url();
                console.log(`   - 네이버 인증 페이지 URL: ${naverURL}`);
                
                // 네이버 도메인 확인
                if (naverURL.includes('nid.naver.com') || naverURL.includes('naver.com')) {
                    console.log('   ✅ 네이버 인증 도메인으로 정상 이동 확인');
                } else {
                    console.log('   ⚠️ 예상과 다른 도메인으로 이동했습니다.');
                }
                
                page = naverAuthPage; // 페이지 참조 업데이트
            }
            
        } catch (error) {
            console.log('   - 새 탭이 열리지 않았습니다. 현재 탭에서 이동을 확인합니다...');
            
            // 현재 페이지에서 URL 변경 확인
            await page.waitForTimeout(3000);
            const afterClickURL = page.url();
            console.log(`   - 클릭 후 URL: ${afterClickURL}`);
            
            if (afterClickURL !== beforeClickURL) {
                console.log('   ✅ 현재 탭에서 페이지 이동 확인');
                
                if (afterClickURL.includes('naver.com')) {
                    console.log('   ✅ 네이버 도메인으로 이동 확인');
                } else {
                    console.log('   ⚠️ 네이버가 아닌 다른 페이지로 이동했습니다.');
                }
            } else {
                console.log('   ❌ 페이지 이동이 감지되지 않았습니다.');
            }
        }
        
        // 스텝 5: 네이버 인증 페이지 로딩 확인
        console.log('6. 네이버 인증 페이지 로딩 확인 중...');
        
        await page.waitForTimeout(2000);
        
        // 네이버 인증 페이지 요소 확인
        const naverAuthSelectors = [
            'input[name="id"]',                       // 네이버 아이디 입력 필드
            'input[name="pw"]',                       // 네이버 비밀번호 입력 필드
            'input[id="id"]',                         // 네이버 아이디 입력 필드 (ID 기반)
            'input[id="pw"]',                         // 네이버 비밀번호 입력 필드 (ID 기반)
            '.login_wrap',                            // 로그인 래퍼
            '.login-form',                            // 로그인 폼
            'form[action*="login"]',                  // 로그인 액션 폼
            '.naver_id_login',                        // 네이버 ID 로그인
            '#frmNIDLogin',                           // 네이버 로그인 폼 ID
            'button[type="submit"]',                  // 제출 버튼
            '.btn_login',                             // 로그인 버튼
            '.btn_global',                            // 글로벌 버튼
            'img[alt*="네이버"], img[src*="naver"]',   // 네이버 로고
            '.logo_naver',                            // 네이버 로고 클래스
            '.find_info',                             // 계정 찾기 정보
            'a:has-text("아이디"), a:has-text("비밀번호")' // 아이디/비밀번호 찾기 링크
        ];
        
        let naverAuthFound = false;
        let foundElements = [];
        
        for (const selector of naverAuthSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    const elementText = await element.textContent();
                    const elementTag = await element.evaluate(el => el.tagName);
                    const elementType = await element.getAttribute('type');
                    const elementName = await element.getAttribute('name');
                    
                    let elementInfo = `${elementTag}`;
                    if (elementType) elementInfo += `[type="${elementType}"]`;
                    if (elementName) elementInfo += `[name="${elementName}"]`;
                    if (elementText && elementText.trim()) elementInfo += `: "${elementText.trim()}"`;
                    
                    foundElements.push(elementInfo);
                    naverAuthFound = true;
                }
            } catch (error) {
                // 요소를 찾을 수 없음
            }
        }
        
        if (naverAuthFound) {
            console.log('   ✅ 네이버 인증 페이지 요소 발견:');
            foundElements.forEach(element => {
                console.log(`     - ${element}`);
            });
        } else {
            console.log('   ⚠️ 네이버 인증 페이지 요소를 찾을 수 없습니다.');
            console.log('   - 페이지 내용을 확인해보겠습니다...');
            
            // 페이지 제목 확인
            const pageTitle = await page.title();
            console.log(`   - 페이지 제목: ${pageTitle}`);
            
            // 페이지의 주요 텍스트 확인
            const bodyText = await page.evaluate(() => {
                return document.body?.textContent?.substring(0, 500) || '';
            });
            console.log(`   - 페이지 내용 (처음 500자): ${bodyText.trim()}`);
            
            // 네이버 관련 텍스트 검색
            const hasNaverText = bodyText.includes('네이버') || bodyText.includes('NAVER') || bodyText.includes('naver');
            if (hasNaverText) {
                console.log('   ✅ 페이지에서 네이버 관련 텍스트 발견');
            }
        }
        
        // 알바몬으로 돌아가기 옵션 확인
        console.log('7. 알바몬으로 돌아가기 옵션 확인 중...');
        
        const backToAlbamonSelectors = [
            'a:has-text("알바몬")',
            'a:has-text("돌아가기")',
            'a:has-text("취소")',
            'button:has-text("취소")',
            'button:has-text("돌아가기")',
            'a:has-text("이전")',
            '.back-button',
            '.cancel-button',
            '.btn_cancel',
            'a[href*="albamon"]',
            '.close_btn',
            'button[onclick*="close"]',
            'a[onclick*="close"]'
        ];
        
        let backOptionFound = false;
        let backOptions = [];
        
        for (const selector of backToAlbamonSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    const elementText = await element.textContent();
                    const elementHref = await element.getAttribute('href');
                    
                    let optionInfo = `"${elementText?.trim()}" (${selector})`;
                    if (elementHref) optionInfo += ` - href: ${elementHref}`;
                    
                    backOptions.push(optionInfo);
                    backOptionFound = true;
                }
            } catch (error) {
                // 요소를 찾을 수 없음
            }
        }
        
        if (backOptionFound) {
            console.log('   ✅ 돌아가기 옵션 발견:');
            backOptions.forEach(option => {
                console.log(`     - ${option}`);
            });
        } else {
            console.log('   ⚠️ 명시적인 알바몬 돌아가기 옵션을 찾을 수 없습니다.');
            console.log('   - 브라우저 뒤로가기 버튼으로 돌아갈 수 있습니다.');
        }
        
        // 최종 스크린샷 캡처
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc016_03_naver_auth_page.png',
            fullPage: true 
        });
        console.log('   - 네이버 인증 페이지 스크린샷 저장 완료');
        
        // 테스트 결과 요약
        console.log('\n========== 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-016 네이버 로그인 버튼 기능 확인`);
        console.log(`네이버 버튼 선택자: ${naverButtonSelector}`);
        console.log(`최종 URL: ${page.url()}`);
        console.log(`새 탭 열림 여부: ${isNewTabOpened ? '예' : '아니오'}`);
        console.log(`네이버 인증 페이지 확인: ${naverAuthFound ? '성공' : '실패'}`);
        console.log(`돌아가기 옵션 확인: ${backOptionFound ? '있음' : '없음'}`);
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        
        // 최종 판정
        const isTestPass = naverButton && (page.url().includes('naver.com') || naverAuthFound);
        
        if (isTestPass) {
            console.log('✅ TC-016 테스트 PASS: 네이버 로그인 버튼이 정상적으로 동작함');
        } else {
            console.log('❌ TC-016 테스트 FAIL: 네이버 로그인 버튼 기능에 문제가 있음');
        }
        
        return {
            success: isTestPass,
            naverButtonFound: !!naverButton,
            pageRedirected: page.url().includes('naver.com'),
            authPageFound: naverAuthFound,
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
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc016_error.png',
                    fullPage: true 
                });
                console.log('   - 오류 상황 스크린샷 저장 완료');
            } catch (screenshotError) {
                console.error('   - 스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        console.log('❌ TC-016 테스트 ERROR: 실행 중 오류 발생');
        
        return {
            success: false,
            error: error.message,
            naverButtonFound: false,
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
        
        console.log('========== TC-016 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runNaverLoginButtonTest().catch(console.error);
}

module.exports = { runNaverLoginButtonTest };