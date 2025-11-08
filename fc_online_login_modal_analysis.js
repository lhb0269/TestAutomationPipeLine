const { chromium } = require('playwright');

async function analyzeFCOnlineLoginModal() {
    console.log('FC온라인 로그인 모달 상세 분석 시작...');
    
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
            waitUntil: 'load',
            timeout: 60000 
        });
        
        await page.waitForTimeout(3000);
        
        // 2. 로그인 버튼 클릭
        console.log('2. 로그인 버튼 클릭 시도...');
        try {
            // 메인 로그인 버튼 찾기
            const loginButton = await page.$('a.btn_login');
            if (loginButton) {
                console.log('로그인 버튼 발견, 클릭 시도...');
                await loginButton.click();
                await page.waitForTimeout(3000);
                
                console.log('로그인 버튼 클릭 완료');
                
                // 스크린샷 캡처
                await page.screenshot({ 
                    path: 'C:/AIChallenge(QA)/Docs/Screenshot/fc_online_login_button_clicked.png',
                    fullPage: true 
                });
                
            } else {
                console.log('메인 로그인 버튼을 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('로그인 버튼 클릭 오류:', error.message);
        }
        
        // 3. 새 창 또는 iframe 확인
        console.log('3. 새 창 또는 iframe 확인 중...');
        
        // 새 창이 열렸는지 확인
        const pages = context.pages();
        console.log(`현재 열린 페이지 수: ${pages.length}`);
        
        if (pages.length > 1) {
            console.log('새 창이 열렸습니다. 새 창으로 전환...');
            const newPage = pages[pages.length - 1];
            await newPage.bringToFront();
            await newPage.waitForTimeout(3000);
            
            // 새 창 URL 확인
            console.log('새 창 URL:', newPage.url());
            
            // 새 창 스크린샷
            await newPage.screenshot({ 
                path: 'C:/AIChallenge(QA)/Docs/Screenshot/fc_online_login_new_page.png',
                fullPage: true 
            });
            
            // 새 창에서 로그인 폼 분석
            await analyzeLoginForm(newPage);
            
        } else {
            console.log('새 창이 열리지 않았습니다. iframe 확인...');
            
            // iframe 확인
            const frames = page.frames();
            console.log(`현재 프레임 수: ${frames.length}`);
            
            for (let i = 0; i < frames.length; i++) {
                const frame = frames[i];
                const frameUrl = frame.url();
                console.log(`프레임 ${i} URL: ${frameUrl}`);
                
                if (frameUrl.includes('login') || frameUrl.includes('nxlogin')) {
                    console.log(`로그인 관련 프레임 발견: ${frameUrl}`);
                    await analyzeLoginForm(frame);
                }
            }
        }
        
        // 4. 현재 페이지에서 로그인 모달 확인
        console.log('4. 현재 페이지에서 로그인 모달 확인...');
        
        const modalSelectors = [
            '.modal',
            '.popup',
            '.login-modal',
            '.login-popup',
            '[class*="modal"]',
            '[class*="popup"]',
            '[class*="layer"]',
            '[style*="display: block"]',
            '[style*="visibility: visible"]'
        ];
        
        let modalFound = false;
        for (const selector of modalSelectors) {
            try {
                const modals = await page.$$(selector);
                for (const modal of modals) {
                    const isVisible = await modal.isVisible();
                    const boundingBox = await modal.boundingBox();
                    const innerHTML = await modal.evaluate(el => el.innerHTML);
                    
                    if (isVisible && boundingBox && innerHTML.includes('login')) {
                        console.log(`로그인 모달 발견: ${selector}`);
                        console.log(`위치: x=${boundingBox.x}, y=${boundingBox.y}, width=${boundingBox.width}, height=${boundingBox.height}`);
                        modalFound = true;
                        
                        await analyzeLoginForm(page, modal);
                        break;
                    }
                }
                if (modalFound) break;
            } catch (error) {
                continue;
            }
        }
        
        if (!modalFound) {
            console.log('로그인 모달을 찾을 수 없습니다.');
        }
        
        // 5. 페이지의 모든 input 요소 확인
        console.log('5. 페이지의 모든 input 요소 확인...');
        const allInputs = await page.$$('input');
        console.log(`총 input 요소 수: ${allInputs.length}`);
        
        for (let i = 0; i < allInputs.length; i++) {
            const input = allInputs[i];
            const type = await input.getAttribute('type');
            const name = await input.getAttribute('name');
            const id = await input.getAttribute('id');
            const placeholder = await input.getAttribute('placeholder');
            const className = await input.getAttribute('class');
            const isVisible = await input.isVisible();
            
            if (isVisible && (type === 'text' || type === 'email' || type === 'password')) {
                console.log(`\nInput ${i + 1}:`);
                console.log(`  타입: ${type}`);
                console.log(`  이름: ${name}`);
                console.log(`  ID: ${id}`);
                console.log(`  플레이스홀더: ${placeholder}`);
                console.log(`  클래스: ${className}`);
                console.log(`  보임: ${isVisible}`);
            }
        }
        
        // 최종 스크린샷
        await page.screenshot({ 
            path: 'C:/AIChallenge(QA)/Docs/Screenshot/fc_online_final_analysis.png',
            fullPage: true 
        });
        
    } catch (error) {
        console.error('분석 중 오류 발생:', error.message);
    } finally {
        await browser.close();
        console.log('\n로그인 모달 분석 완료.');
    }
}

// 로그인 폼 분석 함수
async function analyzeLoginForm(pageOrFrame, modalElement = null) {
    console.log('\n=== 로그인 폼 상세 분석 ===');
    
    try {
        let searchContext = pageOrFrame;
        if (modalElement) {
            searchContext = modalElement;
        }
        
        // 1. 로그인 관련 입력 필드 찾기
        const inputSelectors = [
            'input[type="text"]',
            'input[type="email"]',
            'input[type="password"]',
            'input[name*="id"]',
            'input[name*="user"]',
            'input[name*="login"]',
            'input[name*="pass"]',
            'input[id*="id"]',
            'input[id*="user"]',
            'input[id*="login"]',
            'input[id*="pass"]',
            'input[placeholder*="아이디"]',
            'input[placeholder*="비밀번호"]',
            'input[placeholder*="ID"]',
            'input[placeholder*="Password"]'
        ];
        
        console.log('로그인 입력 필드 검색 중...');
        let foundInputs = [];
        
        for (const selector of inputSelectors) {
            try {
                let inputs;
                if (modalElement) {
                    inputs = await modalElement.$$(selector);
                } else {
                    inputs = await pageOrFrame.$$(selector);
                }
                
                for (const input of inputs) {
                    const isVisible = await input.isVisible();
                    if (isVisible) {
                        const inputInfo = {
                            selector: selector,
                            type: await input.getAttribute('type'),
                            name: await input.getAttribute('name'),
                            id: await input.getAttribute('id'),
                            placeholder: await input.getAttribute('placeholder'),
                            className: await input.getAttribute('class'),
                            value: await input.getAttribute('value'),
                            required: await input.getAttribute('required')
                        };
                        
                        foundInputs.push(inputInfo);
                        console.log(`발견된 입력 필드:`, inputInfo);
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        // 2. 로그인 버튼 찾기
        const buttonSelectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button:has-text("로그인")',
            'button:has-text("LOGIN")',
            'a:has-text("로그인")',
            'a:has-text("LOGIN")',
            '[class*="login"]',
            '[id*="login"]',
            '[onclick*="login"]'
        ];
        
        console.log('로그인 버튼 검색 중...');
        let foundButtons = [];
        
        for (const selector of buttonSelectors) {
            try {
                let buttons;
                if (modalElement) {
                    buttons = await modalElement.$$(selector);
                } else {
                    buttons = await pageOrFrame.$$(selector);
                }
                
                for (const button of buttons) {
                    const isVisible = await button.isVisible();
                    if (isVisible) {
                        const buttonInfo = {
                            selector: selector,
                            tagName: await button.evaluate(el => el.tagName),
                            type: await button.getAttribute('type'),
                            className: await button.getAttribute('class'),
                            id: await button.getAttribute('id'),
                            textContent: await button.evaluate(el => el.textContent?.trim()),
                            onclick: await button.evaluate(el => el.onclick ? el.onclick.toString() : ''),
                            href: await button.getAttribute('href')
                        };
                        
                        foundButtons.push(buttonInfo);
                        console.log(`발견된 버튼:`, buttonInfo);
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        // 3. SNS 로그인 버튼 찾기
        const snsSelectors = [
            'a:has-text("카카오")',
            'button:has-text("카카오")',
            'a:has-text("네이버")',
            'button:has-text("네이버")',
            'a:has-text("Google")',
            'button:has-text("Google")',
            '[class*="kakao"]',
            '[class*="naver"]',
            '[class*="google"]',
            '[id*="kakao"]',
            '[id*="naver"]',
            '[id*="google"]'
        ];
        
        console.log('SNS 로그인 버튼 검색 중...');
        let foundSnsButtons = [];
        
        for (const selector of snsSelectors) {
            try {
                let buttons;
                if (modalElement) {
                    buttons = await modalElement.$$(selector);
                } else {
                    buttons = await pageOrFrame.$$(selector);
                }
                
                for (const button of buttons) {
                    const isVisible = await button.isVisible();
                    if (isVisible) {
                        const snsInfo = {
                            selector: selector,
                            tagName: await button.evaluate(el => el.tagName),
                            className: await button.getAttribute('class'),
                            id: await button.getAttribute('id'),
                            textContent: await button.evaluate(el => el.textContent?.trim()),
                            href: await button.getAttribute('href')
                        };
                        
                        foundSnsButtons.push(snsInfo);
                        console.log(`발견된 SNS 버튼:`, snsInfo);
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        // 4. 에러 메시지 영역 찾기
        const errorSelectors = [
            '.error',
            '.err',
            '.warning',
            '.alert',
            '[class*="error"]',
            '[class*="err"]',
            '[class*="warn"]',
            '[class*="alert"]',
            '[id*="error"]',
            '[id*="err"]'
        ];
        
        console.log('에러 메시지 영역 검색 중...');
        let foundErrorAreas = [];
        
        for (const selector of errorSelectors) {
            try {
                let elements;
                if (modalElement) {
                    elements = await modalElement.$$(selector);
                } else {
                    elements = await pageOrFrame.$$(selector);
                }
                
                for (const element of elements) {
                    const errorInfo = {
                        selector: selector,
                        className: await element.getAttribute('class'),
                        id: await element.getAttribute('id'),
                        textContent: await element.evaluate(el => el.textContent?.trim()),
                        isVisible: await element.isVisible()
                    };
                    
                    foundErrorAreas.push(errorInfo);
                    console.log(`발견된 에러 영역:`, errorInfo);
                }
            } catch (error) {
                continue;
            }
        }
        
        console.log('\n=== 로그인 폼 분석 요약 ===');
        console.log(`✓ 입력 필드: ${foundInputs.length}개`);
        console.log(`✓ 로그인 버튼: ${foundButtons.length}개`);
        console.log(`✓ SNS 로그인 버튼: ${foundSnsButtons.length}개`);
        console.log(`✓ 에러 메시지 영역: ${foundErrorAreas.length}개`);
        
        return {
            inputs: foundInputs,
            buttons: foundButtons,
            snsButtons: foundSnsButtons,
            errorAreas: foundErrorAreas
        };
        
    } catch (error) {
        console.error('로그인 폼 분석 중 오류:', error.message);
        return null;
    }
}

// 스크립트 실행
analyzeFCOnlineLoginModal();