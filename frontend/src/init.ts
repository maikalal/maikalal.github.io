import {
  setDebug,
  themeParams,
  initData,
  viewport,
  init as initSDK,
  mockTelegramEnv,
  type ThemeParams,
  retrieveLaunchParams,
  emitEvent,
  miniApp,
  backButton,
} from '@tma.js/sdk-react';

/**
 * Binds safe area insets to CSS variables
 */
function bindSafeAreaCssVars() {
  // contentSafeAreaInsets includes both system safe areas AND Telegram UI elements
  const insets = viewport.contentSafeAreaInsets();
  
  console.log('Safe area insets:', insets);
  
  document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${insets.top}px`);
  document.documentElement.style.setProperty('--tg-safe-area-inset-right', `${insets.right}px`);
  document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', `${insets.bottom}px`);
  document.documentElement.style.setProperty('--tg-safe-area-inset-left', `${insets.left}px`);
}

/**
 * Initializes the application and configures its dependencies.
 */
export async function init(options: {
  debug: boolean;
  eruda: boolean;
  mockForMacOS: boolean;
}): Promise<void> {
  // Set @telegram-apps/sdk-react debug mode and initialize it.
  setDebug(options.debug);
  initSDK();

  // Add Eruda if needed.
  options.eruda && void import('eruda').then(({ default: eruda }) => {
    eruda.init();
    eruda.position({ x: window.innerWidth - 50, y: 0 });
  });

  // Telegram for macOS has a ton of bugs, including cases, when the client doesn't
  // even response to the "web_app_request_theme" method. It also generates an incorrect
  // event for the "web_app_request_safe_area" method.
  if (options.mockForMacOS) {
    let firstThemeSent = false;
    mockTelegramEnv({
      onEvent(event, next) {
        if (event.name === 'web_app_request_theme') {
          let tp: ThemeParams|{} = {};
          if (firstThemeSent) {
            tp = themeParams.state();
          } else {
            firstThemeSent = true;
            tp ||= retrieveLaunchParams().tgWebAppThemeParams;
          }
          return emitEvent('theme_changed', { theme_params: tp });
        }

        if (event.name === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', { left: 0, top: 0, right: 0, bottom: 0 });
        }

        next();
      },
    });
  }

  // Mount all components used in the project.
  backButton.mount.ifAvailable();
  initData.restore();

  if (miniApp.mount.isAvailable()) {
    themeParams.mount();
    miniApp.mount();
    themeParams.bindCssVars();
  }

  if (viewport.mount.isAvailable()) {
    await viewport.mount();
    viewport.bindCssVars();
    // Expand to fullscreen for proper safe area handling
    viewport.expand();
    // Bind safe area insets to CSS variables after a short delay
    // to ensure Telegram has returned the safe area values
    setTimeout(bindSafeAreaCssVars, 100);
  }
}