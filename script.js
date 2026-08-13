/* ==========================================================
   script.js | まーらいおん Portfolio
   ----------------------------------------------------------
   設計方針
   - 機能ごとに init〇〇() へ分割(1機能 = 1関数)
   - DOM要素が無くても落ちないようガード節を徹底
   - 状態クラス(.is-*)の付与のみ行い、見た目はCSSに委譲
   - prefers-reduced-motion / JS無効環境に配慮
   ----------------------------------------------------------
   目次
   01. ユーティリティ
   02. ローディング解除
   03. テーマ切替(ダークモード)
   04. モバイルナビ(ハンバーガーメニュー)
   05. スクロール連動(ヘッダー影 / ページトップボタン)
   06. スクロール表示アニメーション(fade-up)
   07. Worksフィルター
   08. お問い合わせフォーム(バリデーション)
   09. コピーライト年号
   10. 初期化
   ========================================================== */
"use strict";

(() => {
  /* ========================================================
     01. ユーティリティ
     ======================================================== */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ========================================================
     02. ローディング解除
     - window load 後に .is-done を付与してフェードアウト
     - 万一 load が発火しなくても4秒で強制解除(フェイルセーフ)
     ======================================================== */
  const initLoader = () => {
    const loader = $("#loader");
    if (!loader) return;

    const done = () => loader.classList.add("is-done");

    if (document.readyState === "complete") {
      done();
    } else {
      window.addEventListener("load", done, { once: true });
    }
    setTimeout(done, 4000);
  };

  /* ========================================================
     03. テーマ切替(ダークモード)
     - 優先順位: localStorage > OS設定(prefers-color-scheme)
     - html[data-theme] と aria-pressed を常に同期
     - localStorage が使えない環境でも動作(try/catch)
     ======================================================== */
  const THEME_STORAGE_KEY = "portfolio-theme";

  const initTheme = () => {
    const toggle = $("#themeToggle");
    if (!toggle) return;

    const root = document.documentElement;

    const getStoredTheme = () => {
      try {
        return localStorage.getItem(THEME_STORAGE_KEY);
      } catch {
        return null;
      }
    };

    const storeTheme = (theme) => {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        /* プライベートモード等で保存不可でも継続 */
      }
    };

    const applyTheme = (theme) => {
      root.dataset.theme = theme;
      toggle.setAttribute("aria-pressed", String(theme === "dark"));
    };

    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    applyTheme(getStoredTheme() ?? (systemPrefersDark.matches ? "dark" : "light"));

    toggle.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      storeTheme(next);
    });

    // 未保存ユーザーはOS設定の変更に追従
    systemPrefersDark.addEventListener("change", (event) => {
      if (!getStoredTheme()) applyTheme(event.matches ? "dark" : "light");
    });
  };

  /* ========================================================
     04. モバイルナビ(ハンバーガーメニュー)
     - .is-open / body.is-menu-open / aria-expanded を同期
     - リンク選択・Escキー・オーバーレイクリックで閉じる
     ======================================================== */
  const initMenu = () => {
    const toggle = $("#menuToggle");
    const nav = $("#globalNav");
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.classList.toggle("is-open", open);
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("is-menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    };

    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

    toggle.addEventListener("click", () => setOpen(!isOpen()));

    // ナビ内リンク選択で閉じる
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    // Escキーで閉じてトグルへフォーカスを戻す
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // ナビ外(オーバーレイ)クリックで閉じる
    document.addEventListener("click", (event) => {
      if (isOpen() && !event.target.closest("#globalNav, #menuToggle")) {
        setOpen(false);
      }
    });
  };

  /* ========================================================
     05. スクロール連動(ヘッダー影 / ページトップボタン)
     ======================================================== */
  const initScrollEffects = () => {
    const header = $("#header");
    const toTop = $("#toTop");

    const onScroll = () => {
      const y = window.scrollY;
      header?.classList.toggle("is-scrolled", y > 8);
      toTop?.classList.toggle("is-visible", y > 400);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    toTop?.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    });
  };

  /* ========================================================
     06. スクロール表示アニメーション(fade-up)
     - IntersectionObserver で可視化時に .is-visible を付与
     - 非対応環境・reduce設定時は即時表示
     ======================================================== */
  const initReveal = () => {
    const targets = $$(".fade-up");
    if (!targets.length) return;

    const showAll = () => targets.forEach((el) => el.classList.add("is-visible"));

    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      showAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px" }
    );

    targets.forEach((el) => observer.observe(el));
  };

  /* ========================================================
     07. Worksフィルター
     - data-filter とカードの data-category を突合
     - .is-active / aria-pressed / .is-hidden を同期
     ======================================================== */
  const initWorksFilter = () => {
    const buttons = $$(".filter-btn");
    const cards = $$(".works__grid .card");
    if (!buttons.length || !cards.length) return;

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const { filter } = button.dataset;

        buttons.forEach((b) => {
          const isActive = b === button;
          b.classList.toggle("is-active", isActive);
          b.setAttribute("aria-pressed", String(isActive));
        });

        cards.forEach((card) => {
          const show = filter === "all" || card.dataset.category === filter;
          card.classList.toggle("is-hidden", !show);
        });
      });
    });
  };

  /* ========================================================
     08. お問い合わせフォーム(バリデーション)
     - blur時に項目単位、submit時に全項目を検証
     - .is-invalid / aria-invalid / エラー文言を同期
     - 送信処理は Formspree 等の導入時に fetch へ差し替え
     ======================================================== */
  const initContactForm = () => {
    const form = $("#contactForm");
    if (!form) return;

    const result = $("#formResult");
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validators = {
      name: (value) => (value ? "" : "お名前を入力してください。"),
      email: (value) => {
        if (!value) return "メールアドレスを入力してください。";
        return EMAIL_PATTERN.test(value) ? "" : "メールアドレスの形式が正しくありません。";
      },
      message: (value) => (value ? "" : "メッセージを入力してください。"),
    };

    const setFieldError = (fieldName, message) => {
      const input = form.elements[fieldName];
      const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
      if (!input) return;

      input.classList.toggle("is-invalid", Boolean(message));
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (errorEl) errorEl.textContent = message;
    };

    /** @returns {boolean} 妥当ならtrue */
    const validateField = (fieldName) => {
      const input = form.elements[fieldName];
      if (!input) return true;
      const message = validators[fieldName](input.value.trim());
      setFieldError(fieldName, message);
      return !message;
    };

    const setResult = (message, type) => {
      if (!result) return;
      result.textContent = message;
      result.classList.toggle("is-success", type === "success");
      result.classList.toggle("is-error", type === "error");
    };

    // 入力を離れたタイミングで項目単位の検証
    Object.keys(validators).forEach((fieldName) => {
      form.elements[fieldName]?.addEventListener("blur", () => validateField(fieldName));
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const invalidFields = Object.keys(validators).filter(
        (fieldName) => !validateField(fieldName)
      );

      if (invalidFields.length > 0) {
        setResult("入力内容をご確認ください。", "error");
        form.elements[invalidFields[0]]?.focus();
        return;
      }

      // TODO: Formspree等の導入時、ここを fetch(form.action, ...) に差し替え
      setResult("送信ありがとうございました。2〜3日以内にご返信いたします。", "success");
      form.reset();
    });
  };

  /* ========================================================
     09. コピーライト年号
     ======================================================== */
  const initCopyrightYear = () => {
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  };

  /* ========================================================
     10. 初期化(script.js は defer 読込のためDOM構築済み)
     ======================================================== */
  initLoader();
  initTheme();
  initMenu();
  initScrollEffects();
  initReveal();
  initWorksFilter();
  initContactForm();
  initCopyrightYear();
})();
