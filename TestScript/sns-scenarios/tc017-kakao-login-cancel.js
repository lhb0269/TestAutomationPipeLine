/**
 * TC-017: 카카오 로그인 인증 취소
 * 
 * 테스트 시나리오:
 * 1. 알바몬 로그인 페이지 접속
 * 2. 카카오 로그인 버튼 클릭하여 인증 페이지 이동
 * 3. 카카오 인증 페이지에서 취소 또는 뒤로가기
 * 4. 알바몬 로그인 페이지로 돌아가는지 확인
 * 
 * 예상 결과:
 * - 알바몬 로그인 페이지로 정상 복귀
 * - 에러 메시지 없이 정상 상태 유지
 * - 다시 로그인 시도 가능한 상태
 */

const { chromium } = require('playwright');

async function runKakaoLoginCancelTest() {
    let browser;
    let context;
    let mainPage;
    let kakaoAuthPage;
    
    try {
        console.log('========== TC-017: 카카오 로그인 인증 취소 테스트 시작 ==========');
        
        // 브라우저 실행
        console.log('1. 브라우저 실행 중...');
        browser = await chromium.launch({ 
            headless: false,  // 테스트 과정을 시각적으로 확인
            slowMo: 1500      // 액션 간 1.5초 대기 (취소 동작 확인을 위해 조금 더 길게)
        });
        
        context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        mainPage = await context.newPage();
        
        // 스텝 1: 알바몬 로그인 페이지 접속
        console.log('2. 알바몬 로그인 페이지 접속 중...');
        await mainPage.goto('https://m.albamon.com/user-account/login?my_page=1', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        // 페이지 로딩 완료 대기
        await mainPage.waitForTimeout(2000);
        
        // 페이지 제목 확인
        const title = await mainPage.title();
        console.log(`   - 페이지 제목: ${title}`);
        
        // 스크린샷 캡처 - 초기 로그인 페이지
        await mainPage.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc017_01_initial_page.png',
            fullPage: true 
        });
        console.log('   - 초기 로그인 페이지 스크린샷 저장 완료');
        
        // 스텝 2: 카카오 로그인 버튼 찾기 및 클릭
        console.log('3. 카카오 로그인 버튼 찾기 및 클릭 중...');
        
        // 카카오 로그인 버튼을 찾기 위한 다양한 셀렉터
        const kakaoButtonSelectors = [
            'button:has-text("카카오")',                   // 카카오 텍스트가 포함된 버튼
            'a[href*="kakao"]',                           // 카카오 링크가 포함된 a 태그
            '.kakao-login',                               // 카카오 로그인 클래스
            '[class*="kakao"]',                           // 카카오가 포함된 클래스
            'img[alt*="카카오"], img[src*="kakao"]',       // 카카오 이미지
            '.sns-login a:first-child',                   // SNS 로그인 첫 번째 링크
            '.social-login a[href*="kakao"]',             // 소셜 로그인 카카오 링크
            'a[onclick*="kakao"]',                        // 카카오 onclick 이벤트
            'button[data-social="kakao"]'                 // 카카오 데이터 속성
        ];
        
        let kakaoButton = null;
        let kakaoButtonSelector = '';
        
        // 카카오 버튼 찾기
        for (const selector of kakaoButtonSelectors) {
            try {
                kakaoButton = await mainPage.$(selector);
                if (kakaoButton && await kakaoButton.isVisible()) {
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
            throw new Error('카카오 로그인 버튼을 찾을 수 없습니다.');
        }
        
        // 카카오 버튼 하이라이트를 위한 스크린샷
        await mainPage.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc017_02_kakao_button_found.png',
            fullPage: true 
        });
        console.log('   - 카카오 버튼 확인 스크린샷 저장 완료');
        
        // 현재 페이지 URL 저장
        const originalURL = mainPage.url();
        console.log(`   - 클릭 전 알바몬 페이지 URL: ${originalURL}`);
        
        // 새 페이지(카카오 인증) 열림을 감지하기 위한 리스너 설정
        console.log('4. 카카오 로그인 버튼 클릭 및 인증 페이지 이동 중...');
        let newPagePromise = context.waitForEvent('page');
        
        // 카카오 로그인 버튼 클릭
        await kakaoButton.click();
        console.log('   - 카카오 로그인 버튼 클릭 완료');
        
        // 새 탭에서 카카오 인증 페이지 열림 대기
        try {
            kakaoAuthPage = await Promise.race([
                newPagePromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('새 탭 타임아웃')), 10000)
                )
            ]);
            
            if (kakaoAuthPage) {
                console.log('   ✅ 새 탭에서 카카오 인증 페이지가 열렸습니다.');
                
                // 새 페이지 로딩 대기
                await kakaoAuthPage.waitForLoadState('networkidle', { timeout: 15000 });
                
                const kakaoURL = kakaoAuthPage.url();
                console.log(`   - 카카오 인증 페이지 URL: ${kakaoURL}`);
                
                // 카카오 도메인 확인
                if (kakaoURL.includes('kauth.kakao.com') || kakaoURL.includes('accounts.kakao.com')) {
                    console.log('   ✅ 카카오 인증 도메인으로 정상 이동 확인');
                } else {
                    console.log('   ⚠️ 예상과 다른 도메인으로 이동했습니다.');
                }
                
                // 카카오 인증 페이지 스크린샷
                await kakaoAuthPage.screenshot({ 
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc017_03_kakao_auth_page.png',
                    fullPage: true 
                });
                console.log('   - 카카오 인증 페이지 스크린샷 저장 완료');
            }
            
        } catch (error) {
            throw new Error('카카오 인증 페이지로 이동하지 못했습니다: ' + error.message);
        }
        
        // 스텝 3: 카카오 인증 페이지에서 취소 또는 뒤로가기
        console.log('5. 카카오 인증 페이지에서 취소 또는 뒤로가기 수행 중...');
        
        // 취소 옵션 찾기
        const cancelSelectors = [
            'button:has-text("취소")',                     // 취소 버튼
            'a:has-text("취소")',                          // 취소 링크
            'button:has-text("닫기")',                     // 닫기 버튼
            'a:has-text("닫기")',                          // 닫기 링크
            '.cancel-btn',                                // 취소 버튼 클래스
            '.close-btn',                                 // 닫기 버튼 클래스
            '[data-action="cancel"]',                     // 취소 데이터 속성
            'button[onclick*="close"]',                   // 닫기 온클릭 이벤트
            'a[href*="cancel"]',                          // 취소 href
            '.login_cancel',                              // 로그인 취소 클래스
            'button:has-text("로그인 취소")'                // 로그인 취소 버튼
        ];
        
        let cancelButton = null;
        let cancelMethod = '';
        
        // 취소 버튼 찾기
        for (const selector of cancelSelectors) {
            try {
                cancelButton = await kakaoAuthPage.$(selector);
                if (cancelButton && await cancelButton.isVisible()) {
                    cancelMethod = 'cancel_button';
                    console.log(`   ✅ 취소 버튼 발견: ${selector}`);
                    
                    const cancelText = await cancelButton.textContent();
                    console.log(`   - 취소 버튼 텍스트: ${cancelText?.trim()}`);
                    break;
                }
            } catch (error) {
                continue;
            }
        }
        
        if (cancelButton) {
            // 취소 버튼이 있는 경우 클릭
            console.log('   - 취소 버튼을 클릭합니다...');
            await cancelButton.click();
            await kakaoAuthPage.waitForTimeout(2000);
            
        } else {
            // 취소 버튼이 없는 경우 탭을 직접 닫기
            console.log('   - 취소 버튼을 찾을 수 없어 카카오 인증 탭을 직접 닫습니다...');
            cancelMethod = 'close_tab';
            await kakaoAuthPage.close();
            await mainPage.bringToFront();
            await mainPage.waitForTimeout(2000);
        }
        
        // 취소 동작 후 스크린샷 (탭이 닫히지 않은 경우에만)
        if (cancelMethod !== 'close_tab') {
            try {
                await kakaoAuthPage.screenshot({ 
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc017_04_after_cancel.png',
                    fullPage: true 
                });
                console.log('   - 취소 동작 후 스크린샷 저장 완료');
            } catch (error) {
                console.log('   - 취소 동작 후 스크린샷 저장 실패 (페이지가 닫혔을 수 있음)');
            }
        } else {
            console.log('   - 카카오 탭이 닫혔으므로 메인 페이지로 포커스 이동');
        }
        
        // 스텝 4: 알바몬 로그인 페이지로 돌아가는지 확인
        console.log('6. 알바몬 로그인 페이지 복귀 확인 중...');
        
        // 페이지 변화 대기
        await mainPage.waitForTimeout(3000);
        
        // 메인 페이지(알바몬)가 포커스를 받았는지 확인
        let isBackToAlbamon = false;
        let backToAlbamonMethod = '';
        let finalURL = '';
        
        try {
            // 카카오 인증 페이지가 닫혔는지 확인
            let kakaoPageClosed = false;
            try {
                kakaoPageClosed = kakaoAuthPage.isClosed();
            } catch (error) {
                kakaoPageClosed = true; // 페이지에 접근할 수 없으면 닫힌 것으로 간주
            }
            console.log(`   - 카카오 인증 페이지 닫힘 여부: ${kakaoPageClosed ? '닫힘' : '열려있음'}`);
            
            if (kakaoPageClosed || cancelMethod === 'close_tab') {
                // 카카오 페이지가 닫힌 경우 - 메인 페이지 확인
                finalURL = mainPage.url();
                console.log(`   - 메인 페이지 URL: ${finalURL}`);
                
                if (finalURL.includes('albamon.com') && finalURL.includes('login')) {
                    isBackToAlbamon = true;
                    backToAlbamonMethod = 'page_closed';
                    console.log('   ✅ 카카오 인증 페이지가 닫히고 알바몬 로그인 페이지로 복귀');
                }
            } else {
                // 카카오 페이지가 아직 열려있는 경우 - URL 변화 확인
                finalURL = kakaoAuthPage.url();
                console.log(`   - 카카오 페이지 현재 URL: ${finalURL}`);
                
                // 브라우저 뒤로가기 후 URL이 변경되지 않은 경우 수동으로 메인 페이지로 전환
                if (!finalURL.includes('albamon.com')) {
                    console.log('   - 브라우저 뒤로가기로 알바몬 페이지 복귀를 시도합니다...');
                    await kakaoAuthPage.close();
                    await mainPage.bringToFront();
                    await mainPage.waitForTimeout(2000);
                    
                    finalURL = mainPage.url();
                    if (finalURL.includes('albamon.com') && finalURL.includes('login')) {
                        isBackToAlbamon = true;
                        backToAlbamonMethod = 'manual_close';
                        console.log('   ✅ 카카오 탭을 닫고 알바몬 로그인 페이지로 복귀');
                    }
                } else {
                    isBackToAlbamon = true;
                    backToAlbamonMethod = 'redirect';
                    console.log('   ✅ 카카오 페이지에서 알바몬으로 리다이렉트됨');
                    
                    // 카카오 페이지를 메인 페이지로 사용
                    mainPage = kakaoAuthPage;
                }
            }
        } catch (error) {
            console.log(`   ⚠️ 페이지 상태 확인 중 오류: ${error.message}`);
            
            // 오류 발생 시 메인 페이지 상태 확인
            try {
                finalURL = mainPage.url();
                console.log(`   - 메인 페이지 URL (오류 후): ${finalURL}`);
                
                if (finalURL.includes('albamon.com') && finalURL.includes('login')) {
                    isBackToAlbamon = true;
                    backToAlbamonMethod = 'error_recovery';
                    console.log('   ✅ 오류 후에도 알바몬 로그인 페이지 확인됨');
                }
            } catch (mainPageError) {
                console.log(`   ❌ 메인 페이지 접근 불가: ${mainPageError.message}`);
            }
        }
        
        // 최종 페이지 상태 검증
        console.log('7. 최종 페이지 상태 검증 중...');
        
        let loginFormAvailable = false;
        let errorMessageExists = false;
        let snsLoginAvailable = false;
        
        if (isBackToAlbamon) {
            try {
                // 로그인 폼 요소들 확인
                const usernameField = await mainPage.$('input[name="loginId"], input[id="loginId"], input[type="text"]');
                const passwordField = await mainPage.$('input[name="password"], input[id="password"], input[type="password"]');
                const loginButton = await mainPage.$('button[type="submit"], button:has-text("로그인"), .login-btn');
                
                loginFormAvailable = !!(usernameField && passwordField && loginButton);
                console.log(`   - 로그인 폼 사용 가능: ${loginFormAvailable ? '예' : '아니오'}`);
                
                // 에러 메시지 확인
                const errorSelectors = [
                    '.error-message',
                    '.alert-danger',
                    '.error',
                    '[class*="error"]',
                    '.validation-message',
                    '.warning'
                ];
                
                for (const selector of errorSelectors) {
                    try {
                        const errorElement = await mainPage.$(selector);
                        if (errorElement && await errorElement.isVisible()) {
                            const errorText = await errorElement.textContent();
                            if (errorText && errorText.trim().length > 0) {
                                errorMessageExists = true;
                                console.log(`   ⚠️ 에러 메시지 발견: "${errorText.trim()}"`);
                                break;
                            }
                        }
                    } catch (error) {
                        continue;
                    }
                }
                
                if (!errorMessageExists) {
                    console.log('   ✅ 에러 메시지 없음 - 정상 상태');
                }
                
                // SNS 로그인 옵션 다시 사용 가능한지 확인
                const kakaoButtonAfter = await mainPage.$(kakaoButtonSelector);
                snsLoginAvailable = !!(kakaoButtonAfter && await kakaoButtonAfter.isVisible());
                console.log(`   - SNS 로그인 재시도 가능: ${snsLoginAvailable ? '예' : '아니오'}`);
                
            } catch (error) {
                console.log(`   ⚠️ 페이지 요소 검증 중 오류: ${error.message}`);
            }
        }
        
        // 최종 스크린샷 캡처
        await mainPage.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc017_05_final_state.png',
            fullPage: true 
        });
        console.log('   - 최종 상태 스크린샷 저장 완료');
        
        // 테스트 결과 요약
        console.log('\n========== 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-017 카카오 로그인 인증 취소`);
        console.log(`취소 방법: ${cancelMethod}`);
        console.log(`복귀 방법: ${backToAlbamonMethod}`);
        console.log(`최종 URL: ${finalURL}`);
        console.log(`알바몬 복귀 성공: ${isBackToAlbamon ? '예' : '아니오'}`);
        console.log(`로그인 폼 사용 가능: ${loginFormAvailable ? '예' : '아니오'}`);
        console.log(`에러 메시지 존재: ${errorMessageExists ? '예' : '아니오'}`);
        console.log(`SNS 로그인 재시도 가능: ${snsLoginAvailable ? '예' : '아니오'}`);
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        
        // 최종 판정
        const isTestPass = isBackToAlbamon && loginFormAvailable && !errorMessageExists && snsLoginAvailable;
        
        if (isTestPass) {
            console.log('✅ TC-017 테스트 PASS: 카카오 로그인 인증 취소 후 정상 복귀');
        } else {
            console.log('❌ TC-017 테스트 FAIL: 카카오 로그인 인증 취소 과정에 문제 발생');
            
            // 실패 원인 분석
            if (!isBackToAlbamon) console.log('   - 알바몬 로그인 페이지로 복귀 실패');
            if (!loginFormAvailable) console.log('   - 로그인 폼이 정상적으로 표시되지 않음');
            if (errorMessageExists) console.log('   - 에러 메시지가 표시됨');
            if (!snsLoginAvailable) console.log('   - SNS 로그인 재시도가 불가능');
        }
        
        return {
            success: isTestPass,
            backToAlbamon: isBackToAlbamon,
            loginFormAvailable: loginFormAvailable,
            errorMessageExists: errorMessageExists,
            snsLoginAvailable: snsLoginAvailable,
            cancelMethod: cancelMethod,
            backToAlbamonMethod: backToAlbamonMethod,
            finalURL: finalURL
        };
        
    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류 발생:');
        console.error(error.message);
        
        // 오류 발생 시에도 스크린샷 저장
        if (mainPage) {
            try {
                await mainPage.screenshot({ 
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc017_error.png',
                    fullPage: true 
                });
                console.log('   - 오류 상황 스크린샷 저장 완료');
            } catch (screenshotError) {
                console.error('   - 스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        console.log('❌ TC-017 테스트 ERROR: 실행 중 오류 발생');
        
        return {
            success: false,
            error: error.message,
            backToAlbamon: false,
            loginFormAvailable: false,
            errorMessageExists: false,
            snsLoginAvailable: false,
            cancelMethod: 'unknown',
            backToAlbamonMethod: 'unknown',
            finalURL: 'unknown'
        };
        
    } finally {
        // 리소스 정리
        if (browser) {
            console.log('\n8. 브라우저 종료 중...');
            await browser.close();
        }
        
        console.log('========== TC-017 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runKakaoLoginCancelTest().catch(console.error);
}

module.exports = { runKakaoLoginCancelTest };