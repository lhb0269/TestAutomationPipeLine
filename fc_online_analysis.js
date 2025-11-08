const { chromium } = require('playwright');

async function analyzeFCOnlineSite() {
    console.log('FC온라인 넥슨 사이트 로그인 기능 분석 시작...');
    
    // 브라우저 실행
    const browser = await chromium.launch({ 
        headless: false, // 브라우저를 보이도록 설정
        slowMo: 1000 // 각 동작 사이에 1초 대기
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // 1. FC온라인 메인 페이지 접속
        console.log('1. FC온라인 메인 페이지 접속 중...');
        try {
            await page.goto('https://fconline.nexon.com/main/index', { 
                waitUntil: 'load',
                timeout: 60000 
            });
        } catch (error) {
            console.log('메인 페이지 접속 재시도 중...');
            await page.goto('https://fconline.nexon.com/', { 
                waitUntil: 'load',
                timeout: 60000 
            });
        }
        
        // 페이지 로딩 대기
        await page.waitForTimeout(3000);
        
        // 2. 메인 페이지 스크린샷 캡처
        console.log('2. 메인 페이지 스크린샷 캡처 중...');
        await page.screenshot({ 
            path: 'C:/AIChallenge(QA)/Docs/Screenshot/fc_online_main_page.png',
            fullPage: true 
        });
        
        // 3. 로그인 관련 요소 찾기
        console.log('3. 로그인 관련 요소 검색 중...');
        
        // 여러 가능한 로그인 요소들을 찾아보기
        const loginElements = [
            'a[href*="login"]',
            'button[class*="login"]',
            'div[class*="login"]',
            '[onclick*="login"]',
            '[onclick*="Login"]',
            'a[href*="nxlogin"]',
            '.login',
            '#login',
            'a:has-text("로그인")',
            'button:has-text("로그인")',
            'div:has-text("로그인")',
            'a:has-text("LOGIN")',
            'button:has-text("LOGIN")'
        ];
        
        let foundLoginElements = [];
        
        for (const selector of loginElements) {
            try {
                const elements = await page.$$(selector);
                if (elements.length > 0) {
                    console.log(`찾은 로그인 요소: ${selector} (${elements.length}개)`);
                    
                    for (let i = 0; i < elements.length; i++) {
                        const element = elements[i];
                        const tagName = await element.evaluate(el => el.tagName);
                        const className = await element.evaluate(el => el.className);
                        const id = await element.evaluate(el => el.id);
                        const href = await element.evaluate(el => el.href);
                        const onclick = await element.evaluate(el => el.onclick ? el.onclick.toString() : '');
                        const textContent = await element.evaluate(el => el.textContent?.trim());
                        
                        foundLoginElements.push({
                            selector: selector,
                            index: i,
                            tagName: tagName,
                            className: className,
                            id: id,
                            href: href,
                            onclick: onclick,
                            textContent: textContent
                        });
                    }
                }
            } catch (error) {
                // 선택자가 유효하지 않을 수 있음
                continue;
            }
        }
        
        console.log('\n=== 발견된 로그인 관련 요소들 ===');
        foundLoginElements.forEach((element, index) => {
            console.log(`\n${index + 1}. 요소 정보:`);
            console.log(`   선택자: ${element.selector}`);
            console.log(`   태그: ${element.tagName}`);
            console.log(`   클래스: ${element.className}`);
            console.log(`   ID: ${element.id}`);
            console.log(`   링크: ${element.href}`);
            console.log(`   onClick: ${element.onclick}`);
            console.log(`   텍스트: ${element.textContent}`);
        });
        
        // 4. 게임 시작 버튼 찾기 (로그인 트리거가 될 수 있음)
        console.log('\n4. 게임 시작 관련 버튼 검색 중...');
        const gameStartSelectors = [
            'a:has-text("게임시작")',
            'button:has-text("게임시작")',
            'div:has-text("게임시작")',
            '[onclick*="GameStart"]',
            '[onclick*="gameStart"]',
            'a:has-text("GAME START")',
            'button:has-text("GAME START")'
        ];
        
        let gameStartElements = [];
        
        for (const selector of gameStartSelectors) {
            try {
                const elements = await page.$$(selector);
                if (elements.length > 0) {
                    console.log(`찾은 게임 시작 요소: ${selector} (${elements.length}개)`);
                    
                    for (let i = 0; i < elements.length; i++) {
                        const element = elements[i];
                        const tagName = await element.evaluate(el => el.tagName);
                        const className = await element.evaluate(el => el.className);
                        const id = await element.evaluate(el => el.id);
                        const href = await element.evaluate(el => el.href);
                        const onclick = await element.evaluate(el => el.onclick ? el.onclick.toString() : '');
                        const textContent = await element.evaluate(el => el.textContent?.trim());
                        
                        gameStartElements.push({
                            selector: selector,
                            index: i,
                            tagName: tagName,
                            className: className,
                            id: id,
                            href: href,
                            onclick: onclick,
                            textContent: textContent
                        });
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        console.log('\n=== 발견된 게임 시작 관련 요소들 ===');
        gameStartElements.forEach((element, index) => {
            console.log(`\n${index + 1}. 요소 정보:`);
            console.log(`   선택자: ${element.selector}`);
            console.log(`   태그: ${element.tagName}`);
            console.log(`   클래스: ${element.className}`);
            console.log(`   ID: ${element.id}`);
            console.log(`   링크: ${element.href}`);
            console.log(`   onClick: ${element.onclick}`);
            console.log(`   텍스트: ${element.textContent}`);
        });
        
        // 5. JavaScript 함수 확인
        console.log('\n5. 페이지 내 로그인 관련 JavaScript 함수 확인 중...');
        const hasLoginFunctions = await page.evaluate(() => {
            const functions = [];
            
            // 전역 함수들 확인
            if (typeof GnxGameStartOnClick === 'function') {
                functions.push('GnxGameStartOnClick');
            }
            
            if (typeof top !== 'undefined' && top.PS && top.PS.nxlogin && typeof top.PS.nxlogin.showLoginLayer === 'function') {
                functions.push('top.PS.nxlogin.showLoginLayer');
            }
            
            // window 객체에서 login 관련 함수 찾기
            for (let prop in window) {
                if (prop.toLowerCase().includes('login') && typeof window[prop] === 'function') {
                    functions.push(prop);
                }
            }
            
            return functions;
        });
        
        console.log('발견된 로그인 관련 JavaScript 함수들:', hasLoginFunctions);
        
        // 6. 로그인 버튼 클릭 시도
        if (gameStartElements.length > 0) {
            console.log('\n6. 게임 시작 버튼 클릭 시도...');
            try {
                // 첫 번째 게임 시작 버튼 클릭
                const firstGameStartButton = gameStartElements[0];
                await page.click(firstGameStartButton.selector);
                await page.waitForTimeout(3000);
                
                console.log('게임 시작 버튼 클릭 완료');
                
                // 로그인 모달이나 새 페이지가 나타났는지 확인
                const currentUrl = page.url();
                console.log('현재 URL:', currentUrl);
                
                // 모달 확인
                const modalSelectors = [
                    '.modal',
                    '.popup',
                    '.login-modal',
                    '.login-popup',
                    '[class*="modal"]',
                    '[class*="popup"]',
                    '[class*="layer"]'
                ];
                
                let modalFound = false;
                for (const selector of modalSelectors) {
                    const modal = await page.$(selector);
                    if (modal) {
                        const isVisible = await modal.isVisible();
                        if (isVisible) {
                            console.log(`로그인 모달 발견: ${selector}`);
                            modalFound = true;
                            break;
                        }
                    }
                }
                
                if (!modalFound) {
                    console.log('로그인 모달을 찾을 수 없습니다.');
                }
                
                // 스크린샷 캡처
                await page.screenshot({ 
                    path: 'C:/AIChallenge(QA)/Docs/Screenshot/fc_online_after_game_start.png',
                    fullPage: true 
                });
                
            } catch (error) {
                console.error('게임 시작 버튼 클릭 중 오류:', error.message);
            }
        }
        
        // 7. 페이지 소스에서 추가 정보 수집
        console.log('\n7. 페이지 소스 분석 중...');
        const pageContent = await page.content();
        
        // 로그인 관련 키워드 검색
        const loginKeywords = ['login', 'Login', 'LOGIN', '로그인', 'nxlogin', 'showLoginLayer'];
        const foundKeywords = [];
        
        loginKeywords.forEach(keyword => {
            if (pageContent.includes(keyword)) {
                const matches = pageContent.match(new RegExp(keyword, 'gi'));
                foundKeywords.push({ keyword, count: matches ? matches.length : 0 });
            }
        });
        
        console.log('페이지에서 발견된 로그인 관련 키워드들:');
        foundKeywords.forEach(item => {
            console.log(`  ${item.keyword}: ${item.count}회`);
        });
        
        // 8. 최종 분석 결과 정리
        console.log('\n\n=== FC온라인 로그인 기능 분석 결과 ===');
        console.log(`✓ 메인 페이지 접속 완료`);
        console.log(`✓ 발견된 로그인 관련 요소: ${foundLoginElements.length}개`);
        console.log(`✓ 발견된 게임 시작 관련 요소: ${gameStartElements.length}개`);
        console.log(`✓ 발견된 JavaScript 함수: ${hasLoginFunctions.length}개`);
        console.log(`✓ 페이지 내 로그인 키워드: ${foundKeywords.reduce((sum, item) => sum + item.count, 0)}개`);
        
    } catch (error) {
        console.error('분석 중 오류 발생:', error.message);
    } finally {
        // 브라우저 종료
        await browser.close();
        console.log('\n분석 완료.');
    }
}

// 스크립트 실행
analyzeFCOnlineSite();