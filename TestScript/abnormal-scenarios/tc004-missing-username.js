/**
 * TC-004: 아이디 미입력 시 검증 테스트
 * 
 * 테스트 시나리오:
 * 1. 알바몬 로그인 페이지 접속
 * 2. 아이디 입력 필드를 비운 상태로 유지
 * 3. 비밀번호 입력 필드에 ' ' 입력
 * 4. 로그인 버튼 클릭
 * 5. "아이디를 입력해주세요." 또는 유사한 검증 메시지 표시 확인
 * 6. 로그인이 진행되지 않음을 확인
 * 7. 페이지 이동이 발생하지 않음을 확인
 */

const { chromium } = require('playwright');

async function runMissingUsernameTest() {
    let browser;
    let context;
    let page;
    
    try {
        console.log('========== TC-004: 아이디 미입력 검증 테스트 시작 ==========');
        
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
        
        // 다이얼로그 팝업 확인 (alert, confirm, prompt 등) - 페이지 로딩 전에 미리 설정
        let hasDialogPopup = false;
        let dialogMessage = '';
        
        // 페이지에서 다이얼로그 이벤트 리스너 설정 (페이지 생성 직후)
        page.on('dialog', async (dialog) => {
            console.log(`   - 다이얼로그 팝업 감지: ${dialog.type()}`);
            console.log(`   - 다이얼로그 메시지: "${dialog.message()}"`);
            dialogMessage = dialog.message();
            hasDialogPopup = true;
            await dialog.accept(); // 다이얼로그 승인
        });
        
        // 스텝 1: 알바몬 로그인 페이지 접속
        console.log('2. 알바몬 로그인 페이지 접속 중...');
        const targetURL = 'https://m.albamon.com/user-account/login?my_page=1';
        
        await page.goto(targetURL, {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        // 페이지 로딩 완료 대기
        await page.waitForTimeout(2000);
        
        // 페이지 제목 및 URL 확인
        const title = await page.title();
        const currentURL = page.url();
        console.log(`   - 페이지 제목: ${title}`);
        console.log(`   - 현재 URL: ${currentURL}`);
        
        // 스크린샷 캡처 - 초기 로그인 페이지
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc004_01_initial_page.png',
            fullPage: true 
        });
        console.log('   - 초기 페이지 스크린샷 저장 완료');
        
        // 스텝 2: 아이디 입력 필드 확인 (비운 상태로 유지)
        console.log('3. 아이디 입력 필드 확인 (미입력 상태 유지)...');
        
        // 아이디 필드 셀렉터
        const userIdSelector = '#memberId';
        
        // 아이디 필드 대기 및 확인
        await page.waitForSelector(userIdSelector, { timeout: 10000 });
        console.log(`   - 아이디 필드 발견: ${userIdSelector}`);
        
        // 아이디 필드가 비어있는지 확인
        const userIdValue = await page.inputValue(userIdSelector);
        console.log(`   - 아이디 필드 현재 값: "${userIdValue}"`);
        
        // 아이디 필드가 값이 있다면 비우기
        if (userIdValue.length > 0) {
            await page.fill(userIdSelector, '');
            console.log('   - 아이디 필드를 비움');
        } else {
            console.log('   - 아이디 필드는 이미 비어있음');
        }
        
        // 스텝 3: 비밀번호 입력 필드 확인 및 입력
        console.log('4. 비밀번호 입력 필드 확인 및 입력 중...');
        
        // 비밀번호 필드 셀렉터
        const passwordSelector = '#memberPassword';
        
        // 비밀번호 필드 대기 및 확인
        await page.waitForSelector(passwordSelector, { timeout: 10000 });
        console.log(`   - 비밀번호 필드 발견: ${passwordSelector}`);
        
        // 비밀번호 입력
        await page.fill(passwordSelector, '');  // 기존 값 지우기
        await page.type(passwordSelector, ' ', { delay: 100 });
        console.log('   - 비밀번호 " " 입력 완료');
        
        // 스크린샷 캡처 - 비밀번호만 입력된 상태
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc004_02_password_only.png',
            fullPage: true 
        });
        console.log('   - 비밀번호만 입력된 상태 스크린샷 저장 완료');
        
        // 스텝 4: 로그인 버튼 클릭
        console.log('5. 로그인 버튼 클릭 중...');
        
        // 로그인 버튼 셀렉터
        const loginButtonSelector = 'button[type="submit"]';
        
        // 로그인 버튼 대기 및 확인
        await page.waitForSelector(loginButtonSelector, { timeout: 10000 });
        console.log(`   - 로그인 버튼 발견: ${loginButtonSelector}`);
        
        // 현재 URL 저장 (페이지 이동 여부 확인용)
        const urlBeforeClick = page.url();
        console.log(`   - 로그인 버튼 클릭 전 URL: ${urlBeforeClick}`);
        
        // 로그인 버튼 클릭
        await page.click(loginButtonSelector);
        console.log('   - 로그인 버튼 클릭 완료');
        
        // 검증 메시지 처리 대기
        await page.waitForTimeout(2000);
        
        // 스텝 5: 다이얼로그 팝업 및 검증 메시지 확인
        console.log('6. 다이얼로그 팝업 및 검증 메시지 확인 중...');
        
        // 다이얼로그 감지를 위한 추가 대기
        await page.waitForTimeout(2000);
        
        // 다양한 에러 메시지 셀렉터들
        const errorSelectors = [
            '.error-message',
            '.alert',
            '[class*="error"]',
            '.login-error',
            '#errorMsg',
            '.validation-message',
            '[role="alert"]',
            '.form-error',
            '.field-error',
            'span[class*="error"]',
            'div[class*="error"]',
            'p[class*="error"]',
            // 다이얼로그 관련 셀렉터 추가
            '.dialog',
            '.modal',
            '[role="dialog"]',
            '.popup',
            '.overlay'
        ];
        
        let validationMessage = '';
        let hasValidationError = false;
        
        // 각 셀렉터로 에러 메시지 찾기
        for (const selector of errorSelectors) {
            try {
                const elements = await page.$$(selector);
                for (const element of elements) {
                    const text = await element.textContent();
                    if (text && text.trim().length > 0) {
                        console.log(`   - 에러 메시지 발견 (${selector}): "${text.trim()}"`);
                        
                        // 아이디 관련 검증 메시지인지 확인
                        const lowerText = text.toLowerCase();
                        if (lowerText.includes('아이디') || 
                            lowerText.includes('id') || 
                            lowerText.includes('사용자') ||
                            lowerText.includes('입력') ||
                            lowerText.includes('필수') ||
                            lowerText.includes('required')) {
                            validationMessage = text.trim();
                            hasValidationError = true;
                            break;
                        }
                    }
                }
                if (hasValidationError) break;
            } catch (e) {
                // 해당 셀렉터로 요소를 찾을 수 없음
            }
        }
        
        // HTML5 기본 검증 메시지 확인 (validity API 사용)
        if (!hasValidationError) {
            try {
                const userIdField = await page.$(userIdSelector);
                if (userIdField) {
                    const validationMessage_html5 = await page.evaluate((field) => {
                        return field.validationMessage;
                    }, userIdField);
                    
                    if (validationMessage_html5 && validationMessage_html5.trim().length > 0) {
                        validationMessage = validationMessage_html5.trim();
                        hasValidationError = true;
                        console.log(`   - HTML5 검증 메시지 발견: "${validationMessage}"`);
                    }
                }
            } catch (e) {
                console.log('   - HTML5 검증 메시지 확인 중 오류:', e.message);
            }
        }
        
        // 스텝 6: 로그인이 진행되지 않음을 확인
        console.log('7. 로그인 진행 여부 확인 중...');
        
        // 추가 대기 후 URL 확인
        await page.waitForTimeout(3000);
        const urlAfterClick = page.url();
        console.log(`   - 로그인 버튼 클릭 후 URL: ${urlAfterClick}`);
        
        // 페이지 이동 여부 확인
        const hasPageMoved = (urlBeforeClick !== urlAfterClick);
        const isOnLoginPage = urlAfterClick.includes('login');
        const hasMovedToMypage = urlAfterClick.includes('mypage') || urlAfterClick.includes('personal');
        
        console.log(`   - 페이지 이동 여부: ${hasPageMoved ? '이동함' : '이동하지 않음'}`);
        console.log(`   - 로그인 페이지 유지: ${isOnLoginPage ? '예' : '아니오'}`);
        console.log(`   - 마이페이지 이동: ${hasMovedToMypage ? '예' : '아니오'}`);
        
        // 최종 스크린샷 캡처
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc004_03_validation_result.png',
            fullPage: true 
        });
        console.log('   - 검증 결과 스크린샷 저장 완료');
        
        // 스텝 7: 테스트 결과 분석
        console.log('8. 테스트 결과 분석 중...');
        
        let testResult = 'PASS';
        let testDetails = [];
        
        // 검증 조건 1: 다이얼로그 팝업 또는 검증 메시지가 표시되었는가?
        if (hasDialogPopup) {
            console.log('   ✅ 조건 1 PASS: 다이얼로그 팝업이 표시됨');
            testDetails.push(`다이얼로그 메시지: "${dialogMessage}"`);
            hasValidationError = true; // 다이얼로그도 검증으로 간주
            validationMessage = dialogMessage;
        } else if (hasValidationError) {
            console.log('   ✅ 조건 1 PASS: 아이디 미입력 검증 메시지 표시됨');
            testDetails.push(`검증 메시지: "${validationMessage}"`);
        } else {
            console.log('   ❌ 조건 1 FAIL: 다이얼로그 팝업이나 검증 메시지가 표시되지 않음');
            testResult = 'FAIL';
            testDetails.push('다이얼로그 팝업 및 검증 메시지 미표시');
        }
        
        // 검증 조건 2: 로그인이 진행되지 않았는가?
        if (!hasMovedToMypage) {
            console.log('   ✅ 조건 2 PASS: 마이페이지로 이동하지 않음 (로그인 차단됨)');
            testDetails.push('로그인 진행 차단 확인');
        } else {
            console.log('   ❌ 조건 2 FAIL: 마이페이지로 이동함 (로그인이 진행됨)');
            testResult = 'FAIL';
            testDetails.push('예상과 달리 로그인 진행됨');
        }
        
        // 검증 조건 3: 로그인 페이지에서 벗어나지 않았는가?
        if (isOnLoginPage) {
            console.log('   ✅ 조건 3 PASS: 로그인 페이지에 머무름');
            testDetails.push('로그인 페이지 유지 확인');
        } else if (!hasMovedToMypage) {
            console.log('   ⚠️ 조건 3 WARNING: 로그인 페이지가 아니지만 마이페이지도 아님');
            testDetails.push('페이지 위치 불명확');
        } else {
            console.log('   ❌ 조건 3 FAIL: 로그인 페이지에서 벗어남');
            testDetails.push('로그인 페이지 이탈');
        }
        
        // 추가 검증: 폼 필드 상태 확인
        try {
            const userIdCurrentValue = await page.inputValue(userIdSelector);
            const passwordCurrentValue = await page.inputValue(passwordSelector);
            
            console.log(`   - 최종 아이디 필드 값: "${userIdCurrentValue}"`);
            console.log(`   - 최종 비밀번호 필드 값: "${passwordCurrentValue.length > 0 ? '[입력됨]' : '[비어있음]'}"`);
            
            if (userIdCurrentValue.length === 0) {
                console.log('   ✅ 아이디 필드가 여전히 비어있음');
            } else {
                console.log('   ⚠️ 아이디 필드에 값이 입력됨');
            }
            
        } catch (e) {
            console.log('   - 폼 필드 상태 확인 중 오류:', e.message);
        }
        
        // 테스트 결과 요약
        console.log('\n========== 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-004 아이디 미입력 검증`);
        console.log(`테스트 시나리오: 아이디 미입력 + 비밀번호 입력 + 로그인 시도`);
        console.log(`다이얼로그 팝업 표시: ${hasDialogPopup ? '예' : '아니오'}`);
        console.log(`검증 메시지 표시: ${hasValidationError ? '예' : '아니오'}`);
        if (hasDialogPopup) {
            console.log(`다이얼로그 메시지: "${dialogMessage}"`);
        } else if (hasValidationError) {
            console.log(`검증 메시지 내용: "${validationMessage}"`);
        }
        console.log(`로그인 차단 여부: ${!hasMovedToMypage ? '차단됨' : '진행됨'}`);
        console.log(`페이지 이동 여부: ${hasPageMoved ? '이동함' : '유지됨'}`);
        console.log(`최종 URL: ${urlAfterClick}`);
        console.log(`테스트 결과: ${testResult}`);
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        
        // 상세 결과
        console.log('\n테스트 상세 결과:');
        testDetails.forEach((detail, index) => {
            console.log(`  ${index + 1}. ${detail}`);
        });
        
        if (testResult === 'PASS') {
            console.log('\n✅ TC-004 테스트 PASS: 아이디 미입력 시 적절한 검증 수행');
        } else {
            console.log('\n❌ TC-004 테스트 FAIL: 아이디 미입력 검증이 예상대로 동작하지 않음');
        }
        
        return {
            result: testResult,
            hasDialogPopup,
            dialogMessage,
            validationMessage,
            hasValidationError,
            pageMovement: hasPageMoved,
            finalURL: urlAfterClick,
            details: testDetails
        };
        
    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류 발생:');
        console.error(error.message);
        console.error('스택 트레이스:', error.stack);
        
        // 오류 발생 시에도 스크린샷 저장
        if (page) {
            try {
                await page.screenshot({ 
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc004_error.png',
                    fullPage: true 
                });
                console.log('   - 오류 상황 스크린샷 저장 완료');
            } catch (screenshotError) {
                console.error('   - 스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        console.log('❌ TC-004 테스트 ERROR: 실행 중 오류 발생');
        
        return {
            result: 'ERROR',
            error: error.message,
            details: ['테스트 실행 중 오류 발생']
        };
        
    } finally {
        // 리소스 정리
        if (browser) {
            console.log('\n9. 브라우저 종료 중...');
            await browser.close();
        }
        
        console.log('========== TC-004 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runMissingUsernameTest().catch(console.error);
}

module.exports = { runMissingUsernameTest };