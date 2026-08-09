```javascript
/* ==========================================================================
   まーらいおん Portfolio - script.js
   --------------------------------------------------------------------------
   機能
   1. ローディング
   2. テーマ切替
   3. ヘッダーのスクロール状態
   4. ハンバーガーメニュー
   5. ページトップボタン
   6. スクロール表示アニメーション
   7. Works フィルター
   8. 年号の自動更新
   ========================================================================== */


/* ==========================================================================
   1. DOM読み込み
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ------------------------------------------------------------------------
     要素取得
     ------------------------------------------------------------------------ */

  const html = document.documentElement;
  const body = document.body;

  const loader = document.querySelector(".loader");

  const themeBtn =
    document.querySelector(".theme-toggle");

  const header =
    document.querySelector(".header");

  const nav =
    document.querySelector(".header__nav");

  const navToggle =
    document.querySelector(".header__toggle");

  const pageTop =
    document.querySelector(".to-top");

  const filterButtons =
    document.querySelectorAll(".filter-btn");

  const cards =
    document.querySelectorAll(".card[data-category]");

  const animatedElements =
    document.querySelectorAll(
      ".fade-up, .skill-list__item"
    );


  /* ==========================================================================
     2. ローディング
     ========================================================================== */

  /*
     window.loadではなくDOMContentLoaded後にも処理できるようにする。

     画像などページ内の素材が完全に読み込まれた後に
     loaderを消す処理はwindow.loadで実行。
  */

  window.addEventListener("load", () => {

    if (loader) {
      loader.classList.add("is-done");
    }

  });


  /* ==========================================================================
     3. テーマ切替
     ========================================================================== */

  const savedTheme =
    localStorage.getItem("theme");


  /*
     保存されているテーマを復元
  */

  if (
    savedTheme === "dark" ||
    savedTheme === "light"
  ) {

    html.dataset.theme =
      savedTheme;

  } else {

    /*
       保存設定がない場合は
       OSのダークモード設定を確認
    */

    const prefersDark =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

    html.dataset.theme =
      prefersDark
        ? "dark"
        : "light";
  }


  /*
     aria-pressedを初期状態にも反映
  */

  const updateThemeButton = () => {

    if (!themeBtn) return;

    const isDark =
      html.dataset.theme === "dark";

    themeBtn.setAttribute(
      "aria-pressed",
      String(isDark)
    );

    themeBtn.setAttribute(
      "aria-label",
      isDark
        ? "ライトモードに切り替える"
        : "ダークモードに切り替える"
    );
  };


  updateThemeButton();


  /*
     テーマボタンクリック
  */

  themeBtn?.addEventListener(
    "click",
    () => {

      const current =
        html.dataset.theme;

      const next =
        current === "dark"
          ? "light"
          : "dark";

      html.dataset.theme =
        next;

      localStorage.setItem(
        "theme",
        next
      );

      updateThemeButton();

    }
  );


  /* ==========================================================================
     4. ヘッダーのスクロール状態
     ========================================================================== */

  const updateScrollState = () => {

    const scrollY =
      window.scrollY;

    /*
       50px以上スクロールしたら
       .is-scrolledを付ける
    */

    header?.classList.toggle(
      "is-scrolled",
      scrollY > 50
    );


    /*
       400px以上スクロールしたら
       ページトップボタン表示
    */

    pageTop?.classList.toggle(
      "is-show",
      scrollY > 400
    );

  };


  /*
     初期状態も一度確認
  */

  updateScrollState();


  /*
     スクロールイベント
  */

  window.addEventListener(
    "scroll",
    updateScrollState,
    {
      passive: true
    }
  );


  /* ==========================================================================
     5. ハンバーガーメニュー
     ========================================================================== */

  const closeMenu = () => {

    if (!nav || !navToggle) return;

    nav.classList.remove(
      "is-open"
    );

    navToggle.classList.remove(
      "is-open"
    );

    navToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    body.classList.remove(
      "menu-open"
    );

  };


  const openMenu = () => {

    if (!nav || !navToggle) return;

    nav.classList.add(
      "is-open"
    );

    navToggle.classList.add(
      "is-open"
    );

    navToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    body.classList.add(
      "menu-open"
    );

  };


  navToggle?.addEventListener(
    "click",
    () => {

      const isOpen =
        nav?.classList.contains(
          "is-open"
        );

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }

    }
  );


  /*
     ナビゲーションをクリックしたら閉じる
  */

  nav?.querySelectorAll("a").forEach(
    (link) => {

      link.addEventListener(
        "click",
        () => {
          closeMenu();
        }
      );

    }
  );


  /*
     ESCキーでメニューを閉じる
  */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape"
      ) {

        closeMenu();

      }

    }
  );


  /*
     ウィンドウサイズがPCに戻ったら
     メニュー状態をリセット
  */

  window.addEventListener(
    "resize",
    () => {

      if (
        window.innerWidth > 820
      ) {

        closeMenu();

      }

    }
  );


  /* ==========================================================================
     6. ページトップボタン
     ========================================================================== */

  pageTop?.addEventListener(
    "click",
    () => {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );


  /* ==========================================================================
     7. スクロール表示アニメーション
     ========================================================================== */

  /*
     IntersectionObserverが使えるブラウザ
     */

  if (
    "IntersectionObserver"
    in window
  ) {

    const observer =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            (entry) => {

              if (
                entry.isIntersecting
              ) {

                entry.target.classList.add(
                  "is-visible"
                );

                /*
                   一度表示したら監視解除
                   */

                observer.unobserve(
                  entry.target
                );

              }

            }
          );

        },
        {
          threshold: 0.15
        }
      );


    animatedElements.forEach(
      (element) => {

        observer.observe(
          element
        );

      }
    );


  } else {

    /*
       IntersectionObserver非対応ブラウザ用
    */

    animatedElements.forEach(
      (element) => {

        element.classList.add(
          "is-visible"
        );

      }
    );

  }


  /* ==========================================================================
     8. Works フィルター
     ========================================================================== */

  /*
     フィルターボタンが存在しない場合は
     何もしない
  */

  filterButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          /*
             現在選択されているカテゴリー
          */

          const filter =
            button.dataset.filter;


          /*
             ボタン状態更新
          */

          filterButtons.forEach(
            (btn) => {

              const isActive =
                btn === button;

              btn.classList.toggle(
                "is-active",
                isActive
              );

              btn.setAttribute(
                "aria-pressed",
                String(isActive)
              );

            }
          );


          /*
             カード表示 / 非表示
          */

          cards.forEach(
            (card) => {

              const category =
                card.dataset.category;

              const shouldHide =
                filter !== "all" &&
                category !== filter;

              card.classList.toggle(
                "is-hidden",
                shouldHide
              );

            }
          );

        }
      );

    }
  );


  /* ==========================================================================
     9. 年号の自動更新
     ========================================================================== */

  /*
     HTML側に

     <span id="year"></span>

     がある場合、自動的に現在の年を表示
  */

  const year =
    document.querySelector("#year");

  if (year) {

    year.textContent =
      new Date().getFullYear();

  }


  /* ==========================================================================
     10. 現在のテーマをHTMLに反映
     ========================================================================== */

  /*
     CSS transitionを利用するため、
     初期表示時にも確実にテーマを設定
  */

  html.classList.add(
    "theme-ready"
  );


});
```
