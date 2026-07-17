// ============================================================
// omikuji-ui-core.js
// 🕐📑 時間帯テーマ・所持金表示・タブ/モバイルメニューの切替（画面まわりの基本操作）
// ============================================================

function getTimePeriod() {
    const hour = new Date().getHours();
    if (hour >= 2 && hour < 4) return "ushimitsu"; // 丑三つ時（深夜2時〜4時）
    if (hour >= 5 && hour < 11) return "morning";  // 朝
    if (hour >= 11 && hour < 17) return "afternoon"; // 昼
    return "evening"; // 夜（17時〜翌2時）
}

// 現在の時間帯に応じて背景演出とバナー表示を切り替える
function applyTimeTheme() {
    const container = document.querySelector(".container");
    const period = getTimePeriod();

    if (container) {
        container.classList.remove("time-morning", "time-afternoon", "time-evening", "time-ushimitsu");
        container.classList.add("time-" + period);
    }

    const banner = document.querySelector("#ushimitsu-banner");
    if (banner) {
        if (period === "ushimitsu") {
            banner.classList.remove("hidden");
        } else {
            banner.classList.add("hidden");
        }
    }

    return period;
}
function updateMoneyDisplay() {
    const moneySpan = document.querySelector("#money");
    if (moneySpan) moneySpan.innerHTML = currentMoney.toLocaleString();
    updateShopUI();
}

// 🛍️🎒 タブの切り替え
function showTab(tabName) {
    const missionsTab = document.querySelector("#tab-missions");
    const prizeTab = document.querySelector("#tab-prizes");
    const shopTab = document.querySelector("#tab-shop");
    const collectTab = document.querySelector("#tab-collect");
    const dexTab = document.querySelector("#tab-dex");
    const mapTab = document.querySelector("#tab-map");
    const missionsBtn = document.querySelector("#tabBtn-missions");
    const prizeBtn = document.querySelector("#tabBtn-prizes");
    const shopBtn = document.querySelector("#tabBtn-shop");
    const collectBtn = document.querySelector("#tabBtn-collect");
    const dexBtn = document.querySelector("#tabBtn-dex");
    const mapBtn = document.querySelector("#tabBtn-map");

    const tabs = [
        { name: "missions", el: missionsTab, btn: missionsBtn },
        { name: "prizes", el: prizeTab, btn: prizeBtn },
        { name: "shop", el: shopTab, btn: shopBtn },
        { name: "collect", el: collectTab, btn: collectBtn },
        { name: "dex", el: dexTab, btn: dexBtn },
        { name: "map", el: mapTab, btn: mapBtn }
    ];

    tabs.forEach(t => {
        if (!t.el) return;
        if (t.name === tabName) {
            t.el.classList.remove("hidden");
            if (t.btn) t.btn.classList.add("tab-active");
        } else {
            t.el.classList.add("hidden");
            if (t.btn) t.btn.classList.remove("tab-active");
        }
    });

    // 📂 図鑑・境内マップはモバイルでは「もっと」ドロワー配下にあるので、
    // 選択状態を「もっと」ボタン側にも反映させる
    const moreBtn = document.querySelector("#tabBtn-more");
    const moreDexBtn = document.querySelector("#moreBtn-dex");
    const moreMapBtn = document.querySelector("#moreBtn-map");
    const isMoreTab = (tabName === "dex" || tabName === "map");

    if (moreBtn) moreBtn.classList.toggle("tab-active", isMoreTab);
    if (moreDexBtn) moreDexBtn.classList.toggle("more-menu-item-active", tabName === "dex");
    if (moreMapBtn) moreMapBtn.classList.toggle("more-menu-item-active", tabName === "map");
}

// 📂 モバイル用サイドメニュー（図鑑・境内マップ）の開閉
function toggleMoreMenu() {
    const drawer = document.querySelector("#more-menu-drawer");
    const overlay = document.querySelector("#more-menu-overlay");
    if (!drawer || !overlay) return;

    if (drawer.classList.contains("open")) {
        closeMoreMenu();
    } else {
        drawer.classList.add("open");
        overlay.classList.add("open");
    }
}

function closeMoreMenu() {
    const drawer = document.querySelector("#more-menu-drawer");
    const overlay = document.querySelector("#more-menu-overlay");
    if (drawer) drawer.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
}

// 📖🗺️ サイドメニューから図鑑／境内マップを選んだ時の処理
function selectMoreTab(tabName) {
    showTab(tabName);
    closeMoreMenu();
}

// 🔔 サイドバーの通知ベルをタップした時、ミッションタブの「季節限定ミッション」まで移動する
function jumpToSeasonalMissions() {
    showTab("missions");
    closeMoreMenu();
    const section = document.querySelector("#seasonal-missions-section");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
}