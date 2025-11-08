/**
 * TC-006: 아이디와 비밀번호 모두 미입력 시 검증 테스트
 * 
 * 테스트 시나리오:
 * 1. 알바몬 로그인 페이지 접속
 * 2. 아이디 입력 필드를 비운 상태로 유지
 * 3. 비밀번호 입력 필드를 비운 상태로 유지
 * 4. 로그인 버튼 클릭
 * 5. "아이디를 입력해주세요." 또는 "아이디와 비밀번호를 입력해주세요." 검증 메시지 표시 확인
 * 6. 로그인이 진행되지 않음을 확인
 * 7. 페이지 이동이 발생하지 않음을 확인
 */

const { chromium } = require('playwright');

async function runBothFieldsEmptyTest() {
    let browser;
    let context;
    let page;
    
    try {
        console.log('========== TC-006: 아이디와 비밀번호 모두 미입력 검증 테스트 시작 ==========');
        
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
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc006_01_initial_page.png',
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
        
        // 스텝 3: 비밀번호 입력 필드 확인 (비운 상태로 유지)
        console.log('4. 비밀번호 입력 필드 확인 (미입력 상태 유지)...');
        
        // 비밀번호 필드 셀렉터
        const passwordSelector = '#memberPassword';
        
        // 비밀번호 필드 대기 및 확인
        await page.waitForSelector(passwordSelector, { timeout: 10000 });
        console.log(`   - 비밀번호 필드 발견: ${passwordSelector}`);
        
        // 비밀번호 필드가 비어있는지 확인
        const passwordValue = await page.inputValue(passwordSelector);
        console.log(`   - 비밀번호 필드 현재 값: "${passwordValue}"`);
        
        // 비밀번호 필드가 값이 있다면 비우기
        if (passwordValue.length > 0) {
            await page.fill(passwordSelector, '');
            console.log('   - 비밀번호 필드를 비움');
        } else {
            console.log('   - 비밀번호 필드는 이미 비어있음');
        }
        
        // 스크린샷 캡처 - 두 필드 모두 비어있는 상태
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc006_02_both_fields_empty.png',
            fullPage: true 
        });
        console.log('   - 두 필드 모두 비어있는 상태 스크린샷 저장 완료');
        
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
        
        // 다이얼로그 감지를 위한 추가 대기
        await page.waitForTimeout(2000);
        
        // 검증 메시지 처리 대기
        await page.waitForTimeout(2000);
        
        // 스텝 5: 검증 메시지 확인
        console.log('6. 입력 필드 검증 메시지 확인 중...');
        
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
            '.message',
            '.notice',
            '.warning'
        ];
        
        let validationMessage = '';
        let hasValidationError = false;
        let validationMessageType = '';
        
        // 각 셀렉터로 에러 메시지 찾기
        for (const selector of errorSelectors) {
            try {
                const elements = await page.$$(selector);
                for (const element of elements) {
                    const text = await element.textContent();
                    if (text && text.trim().length > 0) {
                        const messageText = text.trim();
                        console.log(`   - 메시지 발견 (${selector}): "${messageText}"`);
                        
                        // 다양한 검증 메시지 패턴 확인
                        const lowerText = messageText.toLowerCase();
                        if (lowerText.includes('아이디') || 
                            lowerText.includes('id') || 
                            lowerText.includes('사용자') ||
                            lowerText.includes('비밀번호') ||
                            lowerText.includes('password') ||
                            lowerText.includes('패스워드') ||
                            lowerText.includes('입력') ||
                            lowerText.includes('필수') ||
                            lowerText.includes('required') ||
                            lowerText.includes('empty') ||
                            lowerText.includes('빈') ||
                            lowerText.includes('공백')) {
                            
                            // 우선순위에 따른 메시지 선택
                            if (!hasValidationError || 
                                lowerText.includes('아이디') || 
                                (lowerText.includes('입력') && lowerText.includes('아이디'))) {
                                
                                validationMessage = messageText;
                                hasValidationError = true;
                                
                                // 메시지 유형 판단
                                if (lowerText.includes('아이디') && lowerText.includes('비밀번호')) {
                                    validationMessageType = 'both';
                                } else if (lowerText.includes('아이디')) {
                                    validationMessageType = 'username';
                                } else if (lowerText.includes('비밀번호')) {
                                    validationMessageType = 'password';
                                } else {
                                    validationMessageType = 'general';
                                }
                            }
                        }
                    }
                }
                if (hasValidationError && validationMessageType === 'both') break;
            } catch (e) {
                // 해당 셀렉터로 요소를 찾을 수 없음
            }
        }
        
        // HTML5 기본 검증 메시지 확인 (validity API 사용)
        if (!hasValidationError) {
            try {
                // 아이디 필드 검증 메시지 확인
                const userIdField = await page.$(userIdSelector);
                if (userIdField) {
                    const validationMessage_html5_userid = await page.evaluate((field) => {
                        return field.validationMessage;
                    }, userIdField);
                    
                    if (validationMessage_html5_userid && validationMessage_html5_userid.trim().length > 0) {
                        validationMessage = validationMessage_html5_userid.trim();
                        hasValidationError = true;
                        validationMessageType = 'username_html5';
                        console.log(`   - 아이디 필드 HTML5 검증 메시지 발견: "${validationMessage}"`);
                    }
                }
                
                // 비밀번호 필드 검증 메시지 확인 (아이디 검증 메시지가 없는 경우)
                if (!hasValidationError) {
                    const passwordField = await page.$(passwordSelector);
                    if (passwordField) {
                        const validationMessage_html5_password = await page.evaluate((field) => {
                            return field.validationMessage;
                        }, passwordField);
                        
                        if (validationMessage_html5_password && validationMessage_html5_password.trim().length > 0) {
                            validationMessage = validationMessage_html5_password.trim();
                            hasValidationError = true;
                            validationMessageType = 'password_html5';
                            console.log(`   - 비밀번호 필드 HTML5 검증 메시지 발견: "${validationMessage}"`);
                        }
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
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc006_03_validation_result.png',
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
            console.log('   ✅ 조건 1 PASS: 입력 필드 검증 메시지 표시됨');
            testDetails.push(`검증 메시지: "${validationMessage}"`);
            testDetails.push(`메시지 유형: ${validationMessageType}`);
            
            // 메시지 적절성 확인
            const messageRelevance = validationMessageType === 'both' ? 'EXCELLENT' :
                                   validationMessageType === 'username' ? 'GOOD' :
                                   validationMessageType === 'password' ? 'ACCEPTABLE' : 'BASIC';
            console.log(`   - 메시지 적절성: ${messageRelevance}`);
            testDetails.push(`메시지 적절성: ${messageRelevance}`);
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
            
            if (userIdCurrentValue.length === 0 && passwordCurrentValue.length === 0) {
                console.log('   ✅ 두 필드 모두 여전히 비어있음');
                testDetails.push('입력 필드 상태 유지 확인');
            } else {
                console.log('   ⚠️ 일부 필드에 값이 입력됨');
                if (userIdCurrentValue.length > 0) {
                    testDetails.push(`아이디 필드에 예상외 값: "${userIdCurrentValue}"`);
                }
                if (passwordCurrentValue.length > 0) {
                    testDetails.push('비밀번호 필드에 예상외 값 존재');
                }
            }
            
        } catch (e) {
            console.log('   - 폼 필드 상태 확인 중 오류:', e.message);
        }
        
        // 브라우저 개발자 도구 콘솔 에러 확인
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`   - 콘솔 에러: ${msg.text()}`);
                testDetails.push(`콘솔 에러: ${msg.text()}`);
            }
        });
        
        // 테스트 결과 요약
        console.log('\n========== 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-006 아이디와 비밀번호 모두 미입력 검증`);
        console.log(`테스트 시나리오: 아이디 미입력 + 비밀번호 미입력 + 로그인 시도`);
        console.log(`다이얼로그 팝업 표시: ${hasDialogPopup ? '예' : '아니오'}`);
        if (hasDialogPopup) {
            console.log(`다이얼로그 메시지: "${dialogMessage}"`);
        }
        console.log(`검증 메시지 표시: ${hasValidationError ? '예' : '아니오'}`);
        if (hasValidationError) {
            console.log(`검증 메시지 내용: "${validationMessage}"`);
            console.log(`검증 메시지 유형: ${validationMessageType}`);
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
        
        // 테스트 분석 및 권장사항
        console.log('\n테스트 분석:');
        if (hasValidationError) {
            if (validationMessageType === 'both') {
                console.log('  - EXCELLENT: 두 필드 모두 필요하다는 메시지 표시');
            } else if (validationMessageType === 'username') {
                console.log('  - GOOD: 아이디 입력 우선 요구 (일반적인 UX 패턴)');
            } else if (validationMessageType === 'password') {
                console.log('  - ACCEPTABLE: 비밀번호 입력 요구');
            } else {
                console.log('  - BASIC: 일반적인 입력 요구 메시지');
            }
        }
        
        if (testResult === 'PASS') {
            console.log('\n✅ TC-006 테스트 PASS: 두 필드 모두 미입력 시 적절한 검증 수행');
        } else {
            console.log('\n❌ TC-006 테스트 FAIL: 두 필드 모두 미입력 검증이 예상대로 동작하지 않음');
        }
        
        return {
            result: testResult,
            hasDialogPopup,
            dialogMessage,
            validationMessage,
            validationMessageType,
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
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc006_error.png',
                    fullPage: true 
                });
                console.log('   - 오류 상황 스크린샷 저장 완료');
            } catch (screenshotError) {
                console.error('   - 스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        console.log('❌ TC-006 테스트 ERROR: 실행 중 오류 발생');
        
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
        
        console.log('========== TC-006 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runBothFieldsEmptyTest().catch(console.error);
}

module.exports = { runBothFieldsEmptyTest };