/**
 * TC-020: 네이버 로그인 성공 시나리오
 * 
 * 테스트 시나리오:
 * 1. 알바몬 로그인 페이지 접속 (https://m.albamon.com/user-account/login?my_page=1)
 * 2. 네이버 로그인 버튼 클릭
 * 3. 네이버 인증 페이지 이동 확인
 * 4. 네이버 계정 정보 입력 (, )
 * 5. 네이버 로그인 버튼 클릭
 * 6. 알바몬 마이페이지 이동 확인 (/personal/mypage)
 * 
 * 예상 결과:
 * - 네이버 로그인이 성공하여 /personal/mypage 페이지로 이동
 * - 마이페이지가 정상적으로 표시됨
 * - 네이버 계정으로 연동된 사용자 정보 표시
 */

const { chromium } = require('playwright');

async function runNaverLoginSuccessTest() {
    let browser;
    let context;
    let page;
    let naverAuthPage = null;
    
    try {
        console.log('========== TC-020: 네이버 로그인 성공 시나리오 테스트 시작 ==========');
        
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
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc020_01_initial_login_page.png',
            fullPage: true 
        });
        console.log('   - 초기 로그인 페이지 스크린샷 저장 완료');
        
        // 스텝 2: 네이버 로그인 버튼 클릭
        console.log('3. 네이버 로그인 버튼 찾기 및 클릭 중...');
        
        // 네이버 로그인 버튼을 찾기 위한 다양한 셀렉터
        const naverButtonSelectors = [
            'button:has-text("네이버")',                   // 네이버 텍스트가 포함된 버튼
            'a[href*="naver"]',                           // 네이버 링크가 포함된 a 태그
            '.naver-login',                               // 네이버 로그인 클래스
            '[class*="naver"]',                           // 네이버가 포함된 클래스
            'img[alt*="네이버"], img[src*="naver"]',       // 네이버 이미지
            '.sns-login a:nth-child(2)',                  // SNS 로그인 두 번째 링크 (일반적으로 네이버)
            '.social-login a[href*="naver"]',             // 소셜 로그인 네이버 링크
            'a[onclick*="naver"]',                        // 네이버 onclick 이벤트
            'button[data-social="naver"]',                // 네이버 데이터 속성
            'a[title*="네이버"]',                          // 네이버 title 속성
            'a[href*="nid.naver.com"]',                   // 네이버 아이디 도메인 링크
            'a[href*="oauth.naver.com"]'                  // 네이버 OAuth 도메인 링크
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
                    
                    console.log(`   - 버튼 텍스트: ${buttonText?.trim() || 'N/A'}`);
                    console.log(`   - 버튼 href: ${buttonHref || 'N/A'}`);
                    break;
                }
            } catch (error) {
                continue;
            }
        }
        
        if (!naverButton) {
            throw new Error('네이버 로그인 버튼을 찾을 수 없습니다.');
        }
        
        // 버튼이 화면에 보이는지 확인하고 스크롤
        const isVisible = await naverButton.isVisible();
        if (!isVisible) {
            await naverButton.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
        }
        
        // 네이버 버튼 클릭 전 현재 URL 저장
        const beforeClickURL = page.url();
        console.log(`   - 클릭 전 URL: ${beforeClickURL}`);
        
        // 새 페이지 열림을 감지하기 위한 리스너 설정
        const newPagePromise = context.waitForEvent('page');
        
        // 네이버 로그인 버튼 클릭
        await naverButton.click();
        console.log('   - 네이버 로그인 버튼 클릭 완료');
        
        // 스크린샷 캡처 - 네이버 버튼 찾기 완료
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc020_02_naver_button_found.png',
            fullPage: true 
        });
        console.log('   - 네이버 버튼 발견 스크린샷 저장 완료');
        
        // 스텝 3: 네이버 인증 페이지 이동 확인
        console.log('4. 네이버 인증 페이지 이동 확인 중...');
        
        let isNewTabOpened = false;
        
        try {
            // 새 탭이 열리는지 확인 (타임아웃 10초)
            naverAuthPage = await Promise.race([
                newPagePromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('새 탭 타임아웃')), 10000)
                )
            ]);
            
            if (naverAuthPage) {
                isNewTabOpened = true;
                page = naverAuthPage; // 페이지 참조 업데이트
                console.log('   ✅ 새 탭에서 네이버 인증 페이지가 열렸습니다.');
                
                // 새 페이지 로딩 대기
                await page.waitForLoadState('networkidle', { timeout: 15000 });
            }
            
        } catch (error) {
            console.log('   - 새 탭이 열리지 않았습니다. 현재 탭에서 이동을 확인합니다...');
            
            // 현재 페이지에서 URL 변경 확인
            await page.waitForTimeout(3000);
        }
        
        const naverURL = page.url();
        console.log(`   - 현재 URL: ${naverURL}`);
        
        // 네이버 도메인 확인
        if (!naverURL.includes('nid.naver.com') && !naverURL.includes('naver.com') && !naverURL.includes('oauth.naver.com')) {
            throw new Error(`네이버 인증 페이지로 이동하지 않았습니다. 현재 URL: ${naverURL}`);
        }
        
        console.log('   ✅ 네이버 인증 도메인으로 정상 이동 확인');
        
        // 스크린샷 캡처 - 네이버 인증 페이지
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc020_03_naver_auth_page.png',
            fullPage: true 
        });
        console.log('   - 네이버 인증 페이지 스크린샷 저장 완료');
        
        // 스텝 4: 네이버 계정 정보 입력
        console.log('5. 네이버 계정 정보 입력 중...');
        
        // 네이버 로그인 폼 요소 확인 및 대기
        const loginIdSelectors = [
            'input[name="id"]',
            'input[name="userId"]',
            'input[name="loginId"]',
            'input[type="text"]',
            '#id',
            '#userId',
            '#loginId',
            'input[placeholder*="아이디"], input[placeholder*="ID"]'
        ];
        
        const passwordSelectors = [
            'input[name="pw"]',
            'input[name="password"]',
            'input[type="password"]',
            '#pw',
            '#password',
            'input[placeholder*="비밀번호"], input[placeholder*="패스워드"]'
        ];
        
        // 아이디 입력 필드 찾기
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
            throw new Error('네이버 로그인 아이디 입력 필드를 찾을 수 없습니다.');
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
            throw new Error('네이버 로그인 비밀번호 입력 필드를 찾을 수 없습니다.');
        }
        
        // 네이버 계정 정보 입력
        console.log('   - 네이버 아이디 입력 중: ');
        await loginIdField.fill('');  // 기존 값 지우기
        await loginIdField.type('', { delay: 100 });
        
        console.log('   - 네이버 비밀번호 입력 중...');
        await passwordField.fill('');  // 기존 값 지우기
        await passwordField.type('', { delay: 100 });
        
        console.log('   - 네이버 계정 정보 입력 완료');
        
        // 스크린샷 캡처 - 계정 정보 입력 완료
        await page.screenshot({ 
            path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc020_04_naver_credentials_entered.png',
            fullPage: true 
        });
        console.log('   - 계정 정보 입력 완료 스크린샷 저장 완료');
        
        // 스텝 5: 네이버 로그인 버튼 클릭
        console.log('6. 네이버 로그인 버튼 클릭 중...');
        
        // 네이버 로그인 버튼 찾기
        const naverLoginButtonSelectors = [
            'button[type="submit"]',
            '.btn_login',
            '.login-btn',
            'button:has-text("로그인")',
            'input[type="submit"]',
            'button.submit',
            '#log\\.login',
            'input[value="로그인"]'
        ];
        
        let naverLoginButton = null;
        for (const selector of naverLoginButtonSelectors) {
            try {
                naverLoginButton = await page.$(selector);
                if (naverLoginButton) {
                    const isEnabled = await naverLoginButton.isEnabled();
                    if (isEnabled) {
                        console.log(`   ✅ 네이버 로그인 버튼 발견: ${selector}`);
                        break;
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        if (!naverLoginButton) {
            throw new Error('네이버 로그인 제출 버튼을 찾을 수 없습니다.');
        }
        
        // 로그인 버튼 클릭 (알바몬으로 돌아갈 것을 예상)
        await naverLoginButton.click();
        console.log('   - 네이버 로그인 버튼 클릭 완료');
        
        // 로그인 처리 및 알바몬 페이지 이동 대기
        console.log('7. 로그인 처리 및 알바몬 페이지 이동 대기 중...');
        
        // 페이지 이동을 기다리는 함수
        const waitForPageChange = async (maxWaitSeconds = 20) => {
            let waitCount = 0;
            let currentURL;
            
            while (waitCount < maxWaitSeconds) {
                try {
                    currentURL = page.url();
                    
                    // 알바몬으로 돌아갔는지 확인
                    if (currentURL.includes('albamon.com')) {
                        console.log(`   ✅ 알바몬 페이지로 돌아왔습니다: ${currentURL}`);
                        return { success: true, url: currentURL };
                    }
                    
                    // 네이버 페이지에서 추가 처리가 필요한지 확인
                    if (currentURL.includes('naver.com') || currentURL.includes('nid.naver.com')) {
                        // 에러 메시지 확인
                        const errorSelectors = [
                            '.error_txt',
                            '.error-message', 
                            '.alert-danger',
                            '[class*="error"]',
                            '.field_error'
                        ];
                        
                        for (const selector of errorSelectors) {
                            try {
                                const errorElement = await page.$(selector);
                                if (errorElement) {
                                    const errorText = await errorElement.textContent();
                                    console.log(`   ❌ 네이버 로그인 오류 발견: ${errorText?.trim()}`);
                                    return { success: false, error: errorText?.trim(), url: currentURL };
                                }
                            } catch (e) {
                                // 에러 요소 없음
                            }
                        }
                        
                        // 동의 버튼이 있는지 확인
                        const continueSelectors = [
                            'button:has-text("동의하고 계속하기")',
                            'button:has-text("계속하기")',
                            'button:has-text("확인")',
                            '.btn_agree',
                            'button[type="submit"]'
                        ];
                        
                        for (const selector of continueSelectors) {
                            try {
                                const continueButton = await page.$(selector);
                                if (continueButton && await continueButton.isVisible() && await continueButton.isEnabled()) {
                                    console.log(`   - 추가 동의 버튼 발견하여 클릭: ${selector}`);
                                    await continueButton.click();
                                    console.log('   - 동의 버튼 클릭 완료');
                                    // 클릭 후 잠시 대기
                                    await page.waitForTimeout(2000);
                                    break;
                                }
                            } catch (error) {
                                // 버튼이 없거나 클릭 실패
                            }
                        }
                    }
                    
                    console.log(`   - 대기 중... (${waitCount + 1}/${maxWaitSeconds}초) - 현재 URL: ${currentURL.substring(0, 80)}...`);
                    await page.waitForTimeout(1000);
                    waitCount++;
                    
                } catch (error) {
                    console.log(`   - 페이지 상태 확인 중 오류: ${error.message}`);
                    // 페이지가 닫혔거나 이동했을 수 있으므로, 브라우저의 모든 페이지를 확인
                    try {
                        const allPages = context.pages();
                        for (const p of allPages) {
                            const pageURL = p.url();
                            if (pageURL.includes('albamon.com')) {
                                console.log(`   ✅ 다른 페이지에서 알바몬 발견: ${pageURL}`);
                                page = p; // 페이지 참조 업데이트
                                return { success: true, url: pageURL };
                            }
                        }
                    } catch (contextError) {
                        console.log(`   - 컨텍스트 확인 중 오류: ${contextError.message}`);
                    }
                    
                    waitCount++;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            return { success: false, timeout: true, url: currentURL };
        };
        
        // 페이지 변경 대기
        const result = await waitForPageChange(20);
        
        // 스텝 6: 알바몬 마이페이지 이동 확인
        console.log('8. 알바몬 마이페이지 이동 확인 중...');
        
        let currentURL;
        let isLoginSuccess = false;
        let isMyPageSuccess = false;
        
        // 결과에 따른 처리
        if (result.success) {
            currentURL = result.url;
            console.log(`   - 최종 URL: ${currentURL}`);
            console.log('   ✅ 알바몬 사이트로 정상 복귀');
            
            // 마이페이지로 이동했는지 확인
            if (currentURL.includes('/personal/mypage') || 
                currentURL.includes('mypage') || 
                currentURL.includes('my-page')) {
                console.log('   ✅ 마이페이지로 정상 이동 확인');
                isLoginSuccess = true;
                isMyPageSuccess = true;
            } else {
                console.log('   ⚠️ 알바몬에는 돌아왔지만 마이페이지가 아닌 다른 페이지에 있습니다.');
                console.log(`   - 현재 URL: ${currentURL}`);
                
                // 로그인이 성공했다면 마이페이지로 리다이렉트되어야 함
                // 잠시 더 기다려서 확인
                try {
                    await page.waitForTimeout(3000);
                    const newURL = page.url();
                    if (newURL.includes('mypage') || newURL.includes('my-page') || newURL.includes('personal')) {
                        console.log('   ✅ 추가 대기 후 마이페이지 이동 확인');
                        isLoginSuccess = true;
                        isMyPageSuccess = true;
                        currentURL = newURL;
                    } else {
                        // 로그인은 성공했을 가능성이 있지만 마이페이지가 아님
                        isLoginSuccess = true;
                        console.log('   ⚠️ 로그인은 성공한 것으로 보이지만 마이페이지 확인 불가');
                    }
                } catch (error) {
                    console.log(`   - 추가 확인 중 오류: ${error.message}`);
                    isLoginSuccess = true; // 알바몬에 돌아온 것만으로도 로그인 성공으로 간주
                }
            }
        } else if (result.error) {
            console.log(`   ❌ 네이버 로그인 중 오류 발생: ${result.error}`);
            currentURL = result.url;
        } else if (result.timeout) {
            console.log('   ❌ 페이지 이동 대기 시간 초과');
            currentURL = result.url || 'unknown';
            console.log(`   - 타임아웃 시점 URL: ${currentURL}`);
        } else {
            console.log('   ❌ 알바몬 사이트로 돌아오지 않았습니다.');
            currentURL = result.url || page.url();
            console.log(`   - 현재 URL: ${currentURL}`);
        }
        
        // 스크린샷 캡처 - 최종 결과 (안전하게 처리)
        try {
            await page.screenshot({ 
                path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc020_05_final_result.png',
                fullPage: true 
            });
            console.log('   - 최종 결과 스크린샷 저장 완료');
        } catch (screenshotError) {
            console.log(`   - 최종 스크린샷 저장 실패: ${screenshotError.message}`);
        }
        
        // 마이페이지가 정상적으로 표시되는지 확인
        if (isMyPageSuccess) {
            console.log('9. 마이페이지 정상 표시 및 사용자 정보 확인 중...');
            
            try {
                // 페이지 로딩 완료 대기
                await page.waitForLoadState('networkidle', { timeout: 10000 });
                
                // 마이페이지 관련 요소 확인
                const mypageSelectors = [
                    'h1:has-text("마이페이지")',
                    'h2:has-text("마이페이지")',
                    '.mypage-title',
                    '.user-name',
                    '.profile-info',
                    '.my-info'
                ];
                
                let mypageElementsFound = [];
                for (const selector of mypageSelectors) {
                    try {
                        const element = await page.$(selector);
                        if (element) {
                            const text = await element.textContent();
                            mypageElementsFound.push(`${selector}: ${text?.trim()}`);
                        }
                    } catch (e) {
                        // 요소 없음
                    }
                }
                
                if (mypageElementsFound.length > 0) {
                    console.log('   ✅ 마이페이지 요소들이 정상적으로 표시됨:');
                    mypageElementsFound.forEach(element => {
                        console.log(`     - ${element}`);
                    });
                } else {
                    console.log('   ⚠️ 명시적인 마이페이지 요소를 찾을 수 없지만, URL은 마이페이지입니다.');
                }
                
                // 네이버 로그인으로 연동된 사용자 정보 확인
                const userInfoSelectors = [
                    '.user-info',
                    '.profile',
                    '.member-info',
                    '[class*="user"], [class*="profile"]'
                ];
                
                let userInfoFound = false;
                for (const selector of userInfoSelectors) {
                    try {
                        const element = await page.$(selector);
                        if (element) {
                            const text = await element.textContent();
                            if (text && text.trim()) {
                                console.log(`   ✅ 사용자 정보 영역 발견: ${text.trim().substring(0, 100)}...`);
                                userInfoFound = true;
                                break;
                            }
                        }
                    } catch (e) {
                        // 요소 없음
                    }
                }
                
                if (!userInfoFound) {
                    console.log('   ⚠️ 명시적인 사용자 정보 영역을 찾을 수 없습니다.');
                }
                
            } catch (mypageError) {
                console.log(`   - 마이페이지 확인 중 오류: ${mypageError.message}`);
            }
        }
        
        // 테스트 결과 요약
        console.log('\n========== 테스트 결과 요약 ==========');
        console.log(`테스트 케이스: TC-020 네이버 로그인 성공 시나리오`);
        console.log(`네이버 계정: `);
        console.log(`네이버 버튼 선택자: ${naverButtonSelector}`);
        console.log(`새 탭 열림 여부: ${isNewTabOpened ? '예' : '아니오'}`);
        console.log(`최종 URL: ${currentURL}`);
        console.log(`알바몬 복귀 여부: ${currentURL.includes('albamon.com') ? '성공' : '실패'}`);
        console.log(`마이페이지 이동 여부: ${isMyPageSuccess ? '성공' : '실패'}`);
        console.log(`전체 로그인 성공 여부: ${isLoginSuccess ? '성공' : '실패'}`);
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        
        // 최종 판정
        if (isLoginSuccess && isMyPageSuccess) {
            console.log('✅ TC-020 테스트 PASS: 네이버 로그인이 성공하여 마이페이지로 이동 완료');
        } else if (isLoginSuccess) {
            console.log('⚠️ TC-020 테스트 PARTIAL: 네이버 로그인은 성공했지만 마이페이지 이동 미확인');
        } else {
            console.log('❌ TC-020 테스트 FAIL: 네이버 로그인 실패 또는 예상과 다른 결과');
        }
        
        return {
            success: isLoginSuccess && isMyPageSuccess,
            partialSuccess: isLoginSuccess,
            naverButtonFound: !!naverButton,
            authPageReached: true,
            credentialsEntered: true,
            albamonReturned: currentURL.includes('albamon.com'),
            mypageReached: isMyPageSuccess,
            newTabOpened: isNewTabOpened,
            finalURL: currentURL
        };
        
    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류 발생:');
        console.error(error.message);
        console.error('스택 트레이스:', error.stack);
        
        // 오류 발생 시에도 스크린샷 저장
        if (page) {
            try {
                await page.screenshot({ 
                    path: 'C:\\AIChallenge(QA)\\Docs\\Screenshot\\tc020_error.png',
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
        
        console.log('❌ TC-020 테스트 ERROR: 실행 중 오류 발생');
        
        return {
            success: false,
            partialSuccess: false,
            error: error.message,
            naverButtonFound: false,
            authPageReached: false,
            credentialsEntered: false,
            albamonReturned: false,
            mypageReached: false,
            newTabOpened: false,
            finalURL: page ? page.url() : 'unknown'
        };
        
    } finally {
        // 리소스 정리
        if (browser) {
            console.log('\n10. 브라우저 종료 중...');
            await browser.close();
        }
        
        console.log('========== TC-020 테스트 완료 ==========\n');
    }
}

// 테스트 실행
if (require.main === module) {
    runNaverLoginSuccessTest().catch(console.error);
}

module.exports = { runNaverLoginSuccessTest };
