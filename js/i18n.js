(function () {
  var STORAGE_KEY = "mc_lang";
  var WA_NUMBER = "992918175700";

  var I18N = {
    ru: {
      meta_desc: "Мастер-класс 13–14 июня — Сайдахтам Атоев. Приглашение на закрытый двухдневный интенсив.",
      doc_title: "Мастер-класс — 13–14 июня | Сайдахтам Атоев",
      lang_aria: "Язык интерфейса",
      top_mark: "эксклюзивное событие",
      hero_kicker: "Приглашаем вас",
      hero_title: "Мастер-класс",
      hero_subtitle:
        "Интенсивный двухдневный формат для тех, кто выстраивает результат на серьёзном уровне. Ведёт практикующий эксперт.",
      month_june: "июня",
      day1_note: "первый день",
      day2_note: "второй день",
      cta_label: "Забронировать место",
      cta_aria: "Написать в WhatsApp, чтобы забронировать место",
      cta_wa_message: "Здравствуйте! Хочу забронировать место на мастер-класс.",
      cta_hint: "Количество мест ограничено",
      speaker_label: "Спикер",
      speaker_role: "Специалист по продажам и построению систем",
      topics_heading: "Темы мастер-класса",
      topic_1:  "Правильный выбор ниши",
      topic_2:  "Построение бизнес-модели",
      topic_3:  "Стратегия и декомпозиция целей",
      topic_4:  "Маркетинг и построение воронки продаж",
      topic_5:  "Воронка найма и условия сотрудничества",
      topic_6:  "Система KPI, мотивация и адаптация сотрудников",
      topic_7:  "Финансовая модель и финансовый план",
      topic_8:  "Организационная политика и оргструктура",
      topic_9:  "Построение отдела продаж",
      topic_10: "Систематизация компании",
      details_heading: "Формат",
      detail_1: "Практика и разбор кейсов в закрытой группе",
      detail_2: "Материалы и доступ к записи по итогам",
      detail_3: "Сертификат участника",
      footer_text: "Организатор свяжется для подтверждения",
    },
    tg: {
      meta_desc:
        "Мастер-класс 13–14 июн — Сайдахтам Атоев. Даъват ба интенсивии дурузаи пӯшида.",
      doc_title: "Мастер-класс — 13–14 июн | Сайдахтам Атоев",
      lang_aria: "Забони интерфейс",
      top_mark: "Ҳодисаи махсус",
      hero_kicker: "Шуморо даъват менамоем",
      hero_title: "Мастер-класс",
      hero_subtitle:
        "Формати интенсивии дуруза барои онҳое, ки натиҷаро дар сатҳи ҷиддӣ месозанд.",
      month_june: "июн",
      day1_note: "рӯзи якум",
      day2_note: "рӯзи дуюм",
      cta_label: "Ҷойро брон кардан",
      cta_aria: "Барои брон кардани ҷой ба WhatsApp нависед",
      cta_wa_message: "Салом! Мехоҳам ҷойро дар мастер-класс брон кунам.",
      cta_hint: "Шумораи ҷойҳо маҳдуд аст",
      speaker_label: "Эксперт",
      speaker_role: "Муттаҳассиси фурӯш ва системасозӣ",
      topics_heading: "Мавзуъҳои мастер-класс",
      topic_1:  "Интихоби дурусти ниша",
      topic_2:  "Сохтани бизнес-модел",
      topic_3:  "Стратегия ва декомпозиция",
      topic_4:  "Маркетинг ва сохтани воронкаи фурӯш",
      topic_5:  "Воронкаи найм ва шартҳои ҳамкорӣ",
      topic_6:  "Системаи KPI, мотивация ва адаптация",
      topic_7:  "Фин-модел ва фин-план",
      topic_8:  "Орг-политика ва орг-структура",
      topic_9:  "Сохтани шуъбаи фурӯш",
      topic_10: "Системакунонии ширкат",
      details_heading: "Формат",
      detail_1: "Амалиёт ва таҳлили намунаҳо дар гурӯҳи пӯшида",
      detail_2: "Моддаҳо ва дастрасӣ ба сабт пас аз чорабинӣ",
      detail_3: "Гувоҳиномаи иштирокчӣ",
      footer_text: "Ташкилкунанда барои тасдиқ бо шумо тамос мегирад",
    },
  };

  function applyLang(lang) {
    var t = I18N[lang] || I18N.ru;
    document.documentElement.lang = lang === "tg" ? "tg" : "ru";
    document.documentElement.setAttribute("data-lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (t[key] !== undefined) el.textContent = t[key];
    });

    var meta = document.querySelector('meta[name="description"]');
    if (meta && t.meta_desc) meta.setAttribute("content", t.meta_desc);
    if (t.doc_title) document.title = t.doc_title;

    var group = document.querySelector(".lang-switch");
    if (group && t.lang_aria) group.setAttribute("aria-label", t.lang_aria);

    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      var active = btn.getAttribute("data-set-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    var cta = document.querySelector("a.cta");
    if (cta) {
      var msg = t.cta_wa_message || "";
      var waUrl = "https://wa.me/" + WA_NUMBER + (msg ? "?text=" + encodeURIComponent(msg) : "");
      cta.setAttribute("href", waUrl);
      if (t.cta_aria) cta.setAttribute("aria-label", t.cta_aria);
    }

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}

    if (typeof window.ScrollTrigger !== "undefined") {
      window.ScrollTrigger.refresh();
    }
  }

  function init() {
    var lang = "tg";
    try {
      lang = localStorage.getItem(STORAGE_KEY) || "tg";
    } catch (e) {}
    if (lang !== "tg" && lang !== "ru") lang = "tg";
    applyLang(lang);

    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-set-lang"));
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
