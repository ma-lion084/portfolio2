// ローディング
window.addEventListener("load", () => {
  document.querySelector(".loader")?.classList.add("is-done");
});

// テーマ切替（localStorage対応）
const themeBtn = document.querySelector(".theme-toggle");
const savedTheme = localStorage.getItem("theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;

themeBtn?.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  themeBtn.setAttribute("aria-pressed", next === "dark");
  localStorage.setItem("theme", next);
});

// スクロール系（ヘッダー & Back To Top）
const header = document.querySelector(".header");
const pagetop = document.querySelector(".pagetop");
window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 50);
  pagetop?.classList.toggle("is-show", window.scrollY > 400);
}, { passive: true });

// スクロール登場（fade-up と skill-card を共通Observerで）
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("is-visible");
      io.unobserve(e.target); // 一度表示したら監視解除（パフォーマンス配慮）
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".fade-up, .skill-card").forEach((el) => io.observe(el));

// 作品フィルター
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-pressed", b === btn);
    });
    const filter = btn.dataset.filter;
    document.querySelectorAll(".card[data-category]").forEach((card) => {
      card.classList.toggle("is-hidden", filter !== "all" && card.dataset.category !== filter);
    });
  });
});
