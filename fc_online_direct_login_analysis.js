const { chromium } = require('playwright');

async function analyzeFCOnlineDirectLogin() {
    console.log('FC온라인 직접 로그인 함수 호출 분석 시작...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // 1. FC온라인 메인 페이지 접속
        console.log('1. FC온라인 메인 페이지 접속 중...');
        await page.goto('https://fconline.nexon.com/', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        await page.waitForTimeout(5000);
        
        // 2. 초기 페이지 스크린샷
        await page.screenshot({ 
            path: 'C:/AIChallenge(QA)/Docs/Screenshot/fc_online_initial_page.png',
            fullPage: true 
        });
        
        // 3. JavaScript로 직접 로그인 레이어 호출
        console.log('2. JavaScript 함수로 직접 로그인 레이어 호출...');
        
        try {
            // top.PS.nxlogin.showLoginLayer() 함수 호출
            await page.evaluate(() => {
                if (typeof top !== 'undefined' && top.PS && top.PS.nxlogin && typeof top.PS.nxlogin.showLoginLayer === 'function') {
                    top.PS.nxlogin.showLoginLayer();
                    return 'showLoginLayer 호출 성공';
                } else {
                    return 'showLoginLayer 함수를 찾을 수 없음';
                }
            });
            
            console.log('로그인 레이어 함수 호출 완료');
            await page.waitForTimeout(5000);
            
            // 로그인 레이어 호출 후 스크린샷
            await page.screenshot({ 
                path: 'C:/AIChallenge(QA)/Docs/Screenshot/fc_online_after_login_layer_call.png',
                fullPage: true 
            });
            
        } catch (error) {
            console.error('로그인 레이어 호출 오류:', error.message);
        }
        
        // 4. 새 창 또는 팝업 확인
        console.log('3. 새 창 또는 팝업 확인 중...');
        
        const pages = context.pages();
        console.log(`현재 열린 페이지 수: ${pages.length}`);
        
        // 모든 페이지 확인
        for (let i = 0; i < pages.length; i++) {
            const currentPage = pages[i];
            const url = currentPage.url();
            console.log(`페이지 ${i + 1} URL: ${url}`);
            
            if (url.includes('login') || url.includes('nxlogin') || url !== 'about:blank') {
                console.log(`로그인 관련 페이지 발견: ${url}`);
                
                await currentPage.bringToFront();
                await currentPage.waitForTimeout(3000);
                
                // 로그인 페이지 스크린샷
                await currentPage.screenshot({ 
                    path: `C:/AIChallenge(QA)/Docs/Screenshot/fc_online_login_page_${i}.png`,
                    fullPage: true 
                });
                
                // 로그인 페이지 분석
                await analyzeLoginPage(currentPage);
            }
        }
        
        // 5. iframe 확인 (더 상세하게)
        console.log('4. iframe 상세 확인...');
        
        const frames = page.frames();
        console.log(`총 프레임 수: ${frames.length}`);
        
        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            const frameUrl = frame.url();
            console.log(`프레임 ${i} URL: ${frameUrl}`);
            
            if (frameUrl.includes('login') || frameUrl.includes('nxlogin') || frameUrl.includes('nexon')) {
                console.log(`로그인 관련 프레임 발견: ${frameUrl}`);
                
                try {
                    // 프레임 내용 분석
                    await analyzeLoginPage(frame);
                } catch (error) {
                    console.error(`프레임 ${i} 분석 오류:`, error.message);
                }
            }
        }
        
        // 6. 페이지의 모든 윈도우 객체 확인
        console.log('5. 윈도우 객체 및 전역 변수 확인...');
        
        const windowInfo = await page.evaluate(() => {
            const info = {
                hasNxLogin: false,
                hasPS: false,
                nxLoginMethods: [],
                allWindows: []
            };
            
            // top.PS 확인
            if (typeof top !== 'undefined' && top.PS) {
                info.hasPS = true;
                if (top.PS.nxlogin) {
                    info.hasNxLogin = true;
                    // nxlogin 객체의 모든 메서드 확인
                    for (let prop in top.PS.nxlogin) {
                        if (typeof top.PS.nxlogin[prop] === 'function') {
                            info.nxLoginMethods.push(prop);
                        }
                    }
                }
            }
            
            // 모든 윈도우 확인
            if (window.frames) {
                for (let i = 0; i < window.frames.length; i++) {
                    try {
                        info.allWindows.push({
                            index: i,
                            location: window.frames[i].location.href
                        });
                    } catch (e) {
                        info.allWindows.push({
                            index: i,
                            location: '접근 불가 (CORS)'
                        });
                    }
                }
            }
            
            return info;
        });
        
        console.log('윈도우 정보:', windowInfo);
        
        // 7. 특정 선택자로 로그인 관련 요소 다시 검색
        console.log('6. 로그인 관련 요소 재검색...');
        
        const specificSelectors = [
            '.gnbLogin',
            '.btn_login',
            '.before_login',
            '[onclick*="showLoginLayer"]',
            'a[href*="login"]'
        ];
        
        for (const selector of specificSelectors) {
            try {
                const elements = await page.$$(selector);
                console.log(`선택자 ${selector}: ${elements.length}개 요소 발견`);
                
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    const isVisible = await element.isVisible();
                    const boundingBox = await element.boundingBox();
                    const textContent = await element.evaluate(el => el.textContent?.trim());
                    const onclick = await element.evaluate(el => el.onclick ? el.onclick.toString() : '');
                    const href = await element.getAttribute('href');
                    
                    console.log(`  요소 ${i + 1}:`);
                    console.log(`    보임: ${isVisible}`);
                    console.log(`    위치: ${boundingBox ? `${boundingBox.x},${boundingBox.y}` : '없음'}`);
                    console.log(`    텍스트: ${textContent}`);
                    console.log(`    onClick: ${onclick}`);
                    console.log(`    href: ${href}`);
                    
                    // 보이는 요소라면 클릭 시도
                    if (isVisible && boundingBox) {
                        console.log(`    클릭 시도...`);
                        try {
                            await element.click();
                            await page.waitForTimeout(3000);
                            
                            // 클릭 후 상태 확인
                            const afterClickPages = context.pages();
                            console.log(`    클릭 후 페이지 수: ${afterClickPages.length}`);
                            
                            if (afterClickPages.length > pages.length) {
                                const newPage = afterClickPages[afterClickPages.length - 1];
                                console.log(`    새 창 URL: ${newPage.url()}`);
                                await analyzeLoginPage(newPage);
                            }
                            
                            // 클릭 후 스크린샷
                            await page.screenshot({ 
                                path: `C:/AIChallenge(QA)/Docs/Screenshot/fc_online_after_click_${selector.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
                                fullPage: true 
                            });
                            
                        } catch (clickError) {
                            console.error(`    클릭 오류:`, clickError.message);
                        }
                        
                        break; // 첫 번째 보이는 요소만 클릭
                    }
                }
            } catch (error) {
                console.error(`선택자 ${selector} 검색 오류:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('분석 중 오류 발생:', error.message);
    } finally {
        // 브라우저는 바로 닫지 않고 잠시 대기
        console.log('10초 후 브라우저를 종료합니다...');
        await page.waitForTimeout(10000);
        await browser.close();
        console.log('\n직접 로그인 분석 완료.');
    }
}

// 로그인 페이지 분석 함수
async function analyzeLoginPage(page) {
    console.log('\n=== 로그인 페이지 상세 분석 ===');
    
    try {
        const url = page.url();
        console.log(`분석 중인 페이지 URL: ${url}`);
        
        // 1. 페이지 제목
        const title = await page.title();
        console.log(`페이지 제목: ${title}`);
        
        // 2. 모든 input 요소 분석
        const inputs = await page.$$('input');
        console.log(`입력 요소 수: ${inputs.length}`);
        
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const inputInfo = {
                index: i,
                type: await input.getAttribute('type'),
                name: await input.getAttribute('name'),
                id: await input.getAttribute('id'),
                placeholder: await input.getAttribute('placeholder'),
                className: await input.getAttribute('class'),
                value: await input.getAttribute('value'),
                required: await input.getAttribute('required'),
                isVisible: await input.isVisible()
            };
            
            if (inputInfo.isVisible && (inputInfo.type === 'text' || inputInfo.type === 'email' || inputInfo.type === 'password')) {
                console.log(`입력 필드 ${i + 1}:`, inputInfo);
            }
        }
        
        // 3. 모든 button 및 a 요소 분석
        const buttons = await page.$$('button, a[role="button"], input[type="submit"], input[type="button"]');
        console.log(`버튼 요소 수: ${buttons.length}`);
        
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            const isVisible = await button.isVisible();
            
            if (isVisible) {
                const buttonInfo = {
                    index: i,
                    tagName: await button.evaluate(el => el.tagName),
                    type: await button.getAttribute('type'),
                    className: await button.getAttribute('class'),
                    id: await button.getAttribute('id'),
                    textContent: await button.evaluate(el => el.textContent?.trim()),
                    href: await button.getAttribute('href'),
                    onclick: await button.evaluate(el => el.onclick ? el.onclick.toString() : '')
                };
                
                console.log(`버튼 ${i + 1}:`, buttonInfo);
            }
        }
        
        // 4. SNS 로그인 관련 요소 검색
        const snsKeywords = ['카카오', '네이버', '구글', 'kakao', 'naver', 'google', 'facebook'];
        for (const keyword of snsKeywords) {
            const snsElements = await page.$$(`[class*="${keyword}"], [id*="${keyword}"], *:has-text("${keyword}")`);
            if (snsElements.length > 0) {
                console.log(`${keyword} 관련 요소 ${snsElements.length}개 발견`);
            }
        }
        
        // 5. 폼 요소 분석
        const forms = await page.$$('form');
        console.log(`폼 요소 수: ${forms.length}`);
        
        for (let i = 0; i < forms.length; i++) {
            const form = forms[i];
            const formInfo = {
                index: i,
                action: await form.getAttribute('action'),
                method: await form.getAttribute('method'),
                className: await form.getAttribute('class'),
                id: await form.getAttribute('id')
            };
            console.log(`폼 ${i + 1}:`, formInfo);
        }
        
    } catch (error) {
        console.error('로그인 페이지 분석 중 오류:', error.message);
    }
}

// 스크립트 실행
analyzeFCOnlineDirectLogin();