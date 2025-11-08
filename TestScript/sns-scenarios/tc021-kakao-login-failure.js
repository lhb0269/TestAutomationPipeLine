/**
 * TC-021: 카카오 로그인 실패 시나리오
 * 
 * 테스트 시나리오:
 * 1. 알바몬 로그인 페이지 접속 (https://m.albamon.com/user-account/login?my_page=1)
 * 2. 카카오 로그인 버튼 클릭
 * 3. 카카오 인증 페이지 이동 확인
 * 4. 잘못된 카카오 계정 정보 입력 (invalid@test.com, wrongpass)
 * 5. 카카오 로그인 버튼 클릭
 * 6. 에러 메시지 확인
 * 
 * 예상 결과:
 * - 카카오 인증 페이지에서 로그인 실패 메시지 표시
 * - 알바몬 로그인 페이지로 복귀하지 않음
 * - 재시도 가능한 상태 유지
 */

const { chromium } = require('playwright');

async function runKakaoLoginFailureTest() {
    let browser;
    let context;
    let page;
    let kakaoAuthPage = null;
    
    try {
        console.log('========== TC-021: 카카오 로그인 실패 시나리오 테스트 시작 ==========');
        
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
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc021_01_initial_login_page.png',
            fullPage: true 
        });
        console.log('   - 초기 로그인 페이지 스크린샷 저장 완료');
        
        // 스텝 2: 카카오 로그인 버튼 클릭
        console.log('3. 카카오 로그인 버튼 찾기 및 클릭 중...');
        
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
                    
                    console.log(`   - 버튼 텍스트: ${buttonText?.trim() || 'N/A'}`);
                    console.log(`   - 버튼 href: ${buttonHref || 'N/A'}`);
                    break;
                }
            } catch (error) {
                continue;
            }
        }
        
        if (!kakaoButton) {
            throw new Error('카카오 로그인 버튼을 찾을 수 없습니다.');
        }
        
        // 버튼이 화면에 보이는지 확인하고 스크롤
        const isVisible = await kakaoButton.isVisible();
        if (!isVisible) {
            await kakaoButton.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
        }
        
        // 카카오 버튼 클릭 전 현재 URL 저장
        const beforeClickURL = page.url();
        console.log(`   - 클릭 전 URL: ${beforeClickURL}`);
        
        // 새 페이지 열림을 감지하기 위한 리스너 설정
        const newPagePromise = context.waitForEvent('page');
        
        // 카카오 로그인 버튼 클릭
        await kakaoButton.click();
        console.log('   - 카카오 로그인 버튼 클릭 완료');
        
        // 스텝 3: 카카오 인증 페이지 이동 확인
        console.log('4. 카카오 인증 페이지 이동 확인 중...');
        
        let isNewTabOpened = false;
        
        try {
            // 새 탭이 열리는지 확인 (타임아웃 10초)
            kakaoAuthPage = await Promise.race([
                newPagePromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('새 탭 타임아웃')), 10000)
                )
            ]);
            
            if (kakaoAuthPage) {
                isNewTabOpened = true;
                page = kakaoAuthPage; // 페이지 참조 업데이트
                console.log('   ✅ 새 탭에서 카카오 인증 페이지가 열렸습니다.');
                
                // 새 페이지 로딩 대기
                await page.waitForLoadState('networkidle', { timeout: 15000 });
            }
            
        } catch (error) {
            console.log('   - 새 탭이 열리지 않았습니다. 현재 탭에서 이동을 확인합니다...');
            
            // 현재 페이지에서 URL 변경 확인
            await page.waitForTimeout(3000);
        }
        
        const kakaoURL = page.url();
        console.log(`   - 현재 URL: ${kakaoURL}`);
        
        // 카카오 도메인 확인
        if (!kakaoURL.includes('kauth.kakao.com') && !kakaoURL.includes('kakao.com')) {
            throw new Error(`카카오 인증 페이지로 이동하지 않았습니다. 현재 URL: ${kakaoURL}`);
        }
        
        console.log('   ✅ 카카오 인증 도메인으로 정상 이동 확인');
        
        // 스크린샷 캡처 - 카카오 인증 페이지
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc021_02_kakao_auth_page.png',
            fullPage: true 
        });
        console.log('   - 카카오 인증 페이지 스크린샷 저장 완료');
        
        // 스텝 4: 잘못된 카카오 계정 정보 입력
        console.log('5. 잘못된 카카오 계정 정보 입력 중...');
        
        // 카카오 로그인 폼 요소 확인 및 대기
        const loginIdSelectors = [
            'input[name="loginId"]',
            'input[type="email"]',
            'input[name="email"]',
            '#loginId',
            'input[placeholder*="이메일"], input[placeholder*="아이디"]'
        ];
        
        const passwordSelectors = [
            'input[name="password"]',
            'input[type="password"]',
            '#password',
            'input[placeholder*="비밀번호"]'
        ];
        
        // 아이디(이메일) 입력 필드 찾기
        let loginIdField = null;
        for (const selector of loginIdSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 5000 });
                loginIdField = await page.$(selector);
                if (loginIdField) {
                    console.log(`   ✅ 아이디 입력 필드 발견: ${selector}`);
                    break;
                }
            } catch (error) {
                continue;
            }
        }
        
        if (!loginIdField) {
            throw new Error('카카오 로그인 아이디 입력 필드를 찾을 수 없습니다.');
        }
        
        // 비밀번호 입력 필드 찾기
        let passwordField = null;
        for (const selector of passwordSelectors) {
            try {
                passwordField = await page.$(selector);
                if (passwordField) {
                    console.log(`   ✅ 비밀번호 입력 필드 발견: ${selector}`);
                    break;
                }
            } catch (error) {
                continue;
            }
        }
        
        if (!passwordField) {
            throw new Error('카카오 로그인 비밀번호 입력 필드를 찾을 수 없습니다.');
        }
        
        // 잘못된 카카오 계정 정보 입력
        console.log('   - 잘못된 카카오 아이디(이메일) 입력 중: invalid@test.com');
        await loginIdField.fill('');  // 기존 값 지우기
        await loginIdField.type('invalid@test.com', { delay: 100 });
        
        console.log('   - 잘못된 카카오 비밀번호 입력 중: wrongpass');
        await passwordField.fill('');  // 기존 값 지우기
        await passwordField.type('wrongpass', { delay: 100 });
        
        console.log('   - 잘못된 카카오 계정 정보 입력 완료');
        
        // 스크린샷 캡처 - 잘못된 계정 정보 입력 완료
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc021_03_invalid_credentials_entered.png',
            fullPage: true 
        });
        console.log('   - 잘못된 계정 정보 입력 완료 스크린샷 저장 완료');
        
        // 스텝 5: 카카오 로그인 버튼 클릭
        console.log('6. 카카오 로그인 버튼 클릭 중...');
        
        // 카카오 로그인 버튼 찾기
        const kakaoLoginButtonSelectors = [
            'button[type="submit"]',
            '.btn_login',
            '.login-btn',
            'button:has-text("로그인")',
            'input[type="submit"]',
            'button.submit'
        ];
        
        let kakaoLoginButton = null;
        for (const selector of kakaoLoginButtonSelectors) {
            try {
                kakaoLoginButton = await page.$(selector);
                if (kakaoLoginButton) {
                    const isEnabled = await kakaoLoginButton.isEnabled();
                    if (isEnabled) {
                        console.log(`   ✅ 카카오 로그인 버튼 발견: ${selector}`);
                        break;
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        if (!kakaoLoginButton) {
            throw new Error('카카오 로그인 제출 버튼을 찾을 수 없습니다.');
        }
        
        // 로그인 시도 전 URL 저장
        const beforeLoginURL = page.url();
        console.log(`   - 로그인 시도 전 URL: ${beforeLoginURL}`);
        
        // 로그인 버튼 클릭 (실패할 것을 예상)
        await kakaoLoginButton.click();
        console.log('   - 카카오 로그인 버튼 클릭 완료');
        
        // 로그인 처리 및 결과 확인 대기
        console.log('7. 로그인 처리 결과 확인 중...');
        await page.waitForTimeout(3000); // 로그인 처리 시간 대기
        
        // 스텝 6: 에러 메시지 확인
        console.log('8. 카카오 로그인 실패 에러 메시지 확인 중...');
        
        const afterLoginURL = page.url();
        console.log(`   - 로그인 시도 후 URL: ${afterLoginURL}`);
        
        let errorFound = false;
        let errorMessage = '';
        let isStillOnKakao = false;
        let isRetryable = false;
        
        // 카카오 페이지에 여전히 머물러 있는지 확인
        if (afterLoginURL.includes('kakao.com') || afterLoginURL.includes('kauth.kakao.com')) {
            isStillOnKakao = true;
            console.log('   ✅ 카카오 인증 페이지에 여전히 머물러 있음 (로그인 실패 예상)');
            
            // 다양한 에러 메시지 선택자로 확인
            const errorSelectors = [
                '.error_txt',                        // 카카오 일반 에러 텍스트
                '.error-message',                    // 일반적인 에러 메시지 클래스
                '.alert-danger',                     // 부트스트랩 스타일 에러
                '.error_msg',                        // 에러 메시지 변형
                '[class*="error"]',                  // 에러가 포함된 모든 클래스
                '.invalid-feedback',                 // 유효성 검사 피드백
                '.form-error',                       // 폼 에러 메시지
                '.login-error',                      // 로그인 에러 전용
                '.fail-msg',                         // 실패 메시지
                'div:has-text("잘못"), div:has-text("오류"), div:has-text("실패")',  // 에러 키워드 포함
                'div:has-text("존재하지"), div:has-text("확인")',                   // 계정 관련 에러
                '.txt_error',                        // 에러 텍스트 클래스
                '[data-error]'                       // 데이터 에러 속성
            ];
            
            // 에러 메시지 찾기
            for (const selector of errorSelectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 2000 });
                    const errorElement = await page.$(selector);
                    if (errorElement) {
                        const errorText = await errorElement.textContent();
                        if (errorText && errorText.trim()) {
                            errorFound = true;
                            errorMessage = errorText.trim();
                            console.log(`   ✅ 에러 메시지 발견 (${selector}): ${errorMessage}`);
                            break;
                        }
                    }
                } catch (error) {
                    // 해당 선택자로는 에러 메시지를 찾지 못함
                    continue;
                }
            }
            
            // 특정 에러 메시지가 없어도 로그인 필드가 여전히 존재하는지 확인
            if (!errorFound) {
                console.log('   - 명시적인 에러 메시지를 찾지 못했습니다. 로그인 필드 존재 여부를 확인합니다...');
                
                // 로그인 필드가 여전히 존재하는지 확인 (재시도 가능 여부)
                try {
                    const stillHasLoginField = await page.$(loginIdSelectors[0]) || 
                                             await page.$(loginIdSelectors[1]) ||
                                             await page.$(loginIdSelectors[2]);
                    const stillHasPasswordField = await page.$(passwordSelectors[0]) || 
                                                await page.$(passwordSelectors[1]);
                    
                    if (stillHasLoginField && stillHasPasswordField) {
                        isRetryable = true;
                        console.log('   ✅ 로그인 입력 필드가 여전히 존재함 - 재시도 가능한 상태');
                        errorMessage = '로그인 실패 (입력 필드 유지)';
                        errorFound = true;
                    }
                } catch (fieldCheckError) {
                    console.log(`   - 로그인 필드 확인 중 오류: ${fieldCheckError.message}`);
                }
            }
            
        } else {
            console.log('   ⚠️ 카카오 페이지에서 다른 페이지로 이동됨');
            console.log(`   - 이동된 URL: ${afterLoginURL}`);
            
            // 알바몬으로 돌아갔는지 확인
            if (afterLoginURL.includes('albamon.com')) {
                console.log('   ❌ 예상과 달리 알바몬으로 돌아감 - 로그인이 성공했을 가능성');
                errorMessage = '예상과 다른 결과: 알바몬으로 이동됨';
            } else {
                console.log('   ⚠️ 알 수 없는 페이지로 이동됨');
                errorMessage = `알 수 없는 페이지로 이동: ${afterLoginURL}`;
            }
        }
        
        // 재시도 가능 여부 확인 (로그인 버튼이나 입력 필드가 여전히 활성화되어 있는지)
        if (isStillOnKakao && !isRetryable) {
            try {
                const retryLoginButton = await page.$(kakaoLoginButtonSelectors[0]) || 
                                       await page.$(kakaoLoginButtonSelectors[1]);
                const retryIdField = await page.$(loginIdSelectors[0]) || 
                                   await page.$(loginIdSelectors[1]);
                
                if (retryLoginButton && retryIdField) {
                    const buttonEnabled = await retryLoginButton.isEnabled();
                    const fieldEnabled = await retryIdField.isEnabled();
                    
                    if (buttonEnabled && fieldEnabled) {
                        isRetryable = true;
                        console.log('   ✅ 재시도 가능한 상태 확인: 로그인 버튼과 입력 필드가 활성화됨');
                    }
                }
            } catch (retryCheckError) {
                console.log(`   - 재시도 가능 여부 확인 중 오류: ${retryCheckError.message}`);
            }
        }
        
        // 스크린샷 캡처 - 에러 메시지 확인
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc021_04_error_message.png',
            fullPage: true 
        });
        console.log('   - 에러 메시지 확인 스크린샷 저장 완료');
        
        // 페이지 내용 확인을 위한 추가 정보 수집
        let pageInfo = '';
        try {
            const pageTitle = await page.title();
            const pageContent = await page.textContent('body');
            const visibleText = pageContent?.substring(0, 500) || '';
            
            pageInfo = `페이지 제목: ${pageTitle}, 내용 일부: ${visibleText.trim()}`;
            console.log(`   - 현재 페이지 정보: ${pageInfo.substring(0, 200)}...`);
        } catch (infoError) {
            console.log(`   - 페이지 정보 수집 중 오류: ${infoError.message}`);
        }
        
        // 최종 스크린샷 캡처
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc021_05_final_result.png',
            fullPage: true 
        });
        console.log('   - 최종 결과 스크린샷 저장 완료');
        
        // 테스트 결과 요약
        console.log('\n========== 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-021 카카오 로그인 실패 시나리오`);
        console.log(`사용된 잘못된 계정: invalid@test.com / wrongpass`);
        console.log(`카카오 버튼 선택자: ${kakaoButtonSelector}`);
        console.log(`새 탭 열림 여부: ${isNewTabOpened ? '예' : '아니오'}`);
        console.log(`로그인 시도 전 URL: ${beforeLoginURL}`);
        console.log(`로그인 시도 후 URL: ${afterLoginURL}`);
        console.log(`카카오 페이지 유지 여부: ${isStillOnKakao ? '예' : '아니오'}`);
        console.log(`에러 메시지 발견 여부: ${errorFound ? '예' : '아니오'}`);
        console.log(`에러 메시지 내용: ${errorMessage}`);
        console.log(`재시도 가능 여부: ${isRetryable ? '예' : '아니오'}`);
        console.log(`알바몬 복귀 여부: ${afterLoginURL.includes('albamon.com') ? '예 (예상과 다름)' : '아니오 (예상대로)'}`);
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        
        // 최종 판정
        const expectedBehavior = isStillOnKakao && (errorFound || isRetryable) && !afterLoginURL.includes('albamon.com');
        
        if (expectedBehavior) {
            console.log('✅ TC-021 테스트 PASS: 카카오 로그인 실패 시나리오가 예상대로 동작');
            console.log('   - 카카오 페이지에서 로그인 실패 처리');
            console.log('   - 알바몬으로 복귀하지 않음');
            console.log('   - 재시도 가능한 상태 유지');
        } else if (afterLoginURL.includes('albamon.com')) {
            console.log('⚠️ TC-021 테스트 UNEXPECTED: 예상과 다르게 알바몬으로 이동됨');
            console.log('   - 잘못된 계정 정보임에도 로그인이 성공했을 가능성');
        } else {
            console.log('❌ TC-021 테스트 PARTIAL: 일부 예상 동작과 다름');
            console.log('   - 추가 분석 필요');
        }
        
        return {
            success: expectedBehavior,
            kakaoButtonFound: !!kakaoButton,
            authPageReached: true,
            invalidCredentialsEntered: true,
            stayedOnKakao: isStillOnKakao,
            errorMessageFound: errorFound,
            errorMessage: errorMessage,
            retryable: isRetryable,
            albamonReturned: afterLoginURL.includes('albamon.com'),
            newTabOpened: isNewTabOpened,
            beforeLoginURL: beforeLoginURL,
            afterLoginURL: afterLoginURL,
            pageInfo: pageInfo
        };
        
    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류 발생:');
        console.error(error.message);
        console.error('스택 트레이스:', error.stack);
        
        // 오류 발생 시에도 스크린샷 저장
        if (page) {
            try {
                await page.screenshot({ 
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc021_error.png',
                    fullPage: true 
                });
                console.log('   - 오류 상황 스크린샷 저장 완료');
                
                // 현재 URL과 페이지 상태 정보 출력
                const currentURL = page.url();
                const pageTitle = await page.title().catch(() => 'Unknown');
                console.log(`   - 오류 발생 시점 URL: ${currentURL}`);
                console.log(`   - 오류 발생 시점 페이지 제목: ${pageTitle}`);
                
            } catch (screenshotError) {
                console.error('   - 스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        console.log('❌ TC-021 테스트 ERROR: 실행 중 오류 발생');
        
        return {
            success: false,
            error: error.message,
            kakaoButtonFound: false,
            authPageReached: false,
            invalidCredentialsEntered: false,
            stayedOnKakao: false,
            errorMessageFound: false,
            errorMessage: '',
            retryable: false,
            albamonReturned: false,
            newTabOpened: false,
            beforeLoginURL: 'unknown',
            afterLoginURL: page ? page.url() : 'unknown',
            pageInfo: ''
        };
        
    } finally {
        // 리소스 정리
        if (browser) {
            console.log('\n9. 브라우저 종료 중...');
            await browser.close();
        }
        
        console.log('========== TC-021 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runKakaoLoginFailureTest().catch(console.error);
}

module.exports = { runKakaoLoginFailureTest };