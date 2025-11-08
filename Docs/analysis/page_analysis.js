/**
 * 알바몬 로그인 페이지 구조 분석 스크립트
 */

const { chromium } = require('playwright');

async function analyzeLoginPage() {
    let browser;
    let context;
    let page;
    
    try {
        console.log('========== 알바몬 로그인 페이지 구조 분석 시작 ==========');
        
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 500
        });
        
        context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        
        page = await context.newPage();
        
        // 페이지 접속
        console.log('1. 알바몬 로그인 페이지 접속...');
        await page.goto('https://m.albamon.com/user-account/login?my_page=1', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await page.waitForTimeout(3000);
        
        // 페이지의 모든 input 요소 찾기
        console.log('\n2. 페이지의 모든 input 요소 분석...');
        const inputs = await page.$$eval('input', elements => 
            elements.map(el => ({
                type: el.type,
                name: el.name,
                id: el.id,
                placeholder: el.placeholder,
                className: el.className,
                value: el.value,
                outerHTML: el.outerHTML.substring(0, 200)
            }))
        );
        
        console.log('발견된 input 요소들:');
        inputs.forEach((input, index) => {
            console.log(`\n--- Input ${index + 1} ---`);
            console.log(`Type: ${input.type}`);
            console.log(`Name: ${input.name}`);
            console.log(`ID: ${input.id}`);
            console.log(`Placeholder: ${input.placeholder}`);
            console.log(`Class: ${input.className}`);
            console.log(`HTML: ${input.outerHTML}`);
        });
        
        // 모든 button 요소 찾기
        console.log('\n3. 페이지의 모든 button 요소 분석...');
        const buttons = await page.$$eval('button', elements => 
            elements.map(el => ({
                type: el.type,
                textContent: el.textContent?.trim(),
                className: el.className,
                id: el.id,
                outerHTML: el.outerHTML.substring(0, 200)
            }))
        );
        
        console.log('발견된 button 요소들:');
        buttons.forEach((button, index) => {
            console.log(`\n--- Button ${index + 1} ---`);
            console.log(`Type: ${button.type}`);
            console.log(`Text: ${button.textContent}`);
            console.log(`Class: ${button.className}`);
            console.log(`ID: ${button.id}`);
            console.log(`HTML: ${button.outerHTML}`);
        });
        
        // 폼 요소 찾기
        console.log('\n4. 페이지의 모든 form 요소 분석...');
        const forms = await page.$$eval('form', elements => 
            elements.map(el => ({
                action: el.action,
                method: el.method,
                className: el.className,
                id: el.id,
                innerHTML: el.innerHTML.substring(0, 500)
            }))
        );
        
        console.log('발견된 form 요소들:');
        forms.forEach((form, index) => {
            console.log(`\n--- Form ${index + 1} ---`);
            console.log(`Action: ${form.action}`);
            console.log(`Method: ${form.method}`);
            console.log(`Class: ${form.className}`);
            console.log(`ID: ${form.id}`);
            console.log(`HTML: ${form.innerHTML}`);
        });
        
        // 특정 셀렉터들 테스트
        console.log('\n5. 주요 셀렉터들 존재 여부 확인...');
        const selectorsToTest = [
            'input[placeholder*="아이디"]',
            'input[placeholder*="비밀번호"]',
            'button:has-text("로그인")',
            '[data-testid*="username"]',
            '[data-testid*="password"]',
            'input[type="text"]',
            'input[type="password"]',
            '.login-form input',
            'form input'
        ];
        
        for (const selector of selectorsToTest) {
            try {
                const element = await page.$(selector);
                if (element) {
                    const tagName = await element.evaluate(el => el.tagName);
                    const attributes = await element.evaluate(el => {
                        const attrs = {};
                        for (let attr of el.attributes) {
                            attrs[attr.name] = attr.value;
                        }
                        return attrs;
                    });
                    console.log(`✅ ${selector} - 발견됨 (${tagName})`);
                    console.log(`   속성들: ${JSON.stringify(attributes, null, 2)}`);
                } else {
                    console.log(`❌ ${selector} - 찾을 수 없음`);
                }
            } catch (error) {
                console.log(`❌ ${selector} - 오류: ${error.message}`);
            }
        }
        
        // 최종 스크린샷
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\page_analysis_screenshot.png',
            fullPage: true 
        });
        console.log('\n6. 페이지 분석 스크린샷 저장 완료');
        
    } catch (error) {
        console.error('페이지 분석 중 오류 발생:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
        console.log('\n========== 페이지 구조 분석 완료 ==========');
    }
}

// 분석 실행
if (require.main === module) {
    analyzeLoginPage().catch(console.error);
}

module.exports = { analyzeLoginPage };