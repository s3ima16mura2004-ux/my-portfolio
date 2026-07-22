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

// 🛍️🎒 タブの切り替え（📖図鑑・🗺️境内マップは別ページ(dex.html/map.html)に移設済み）
function showTab(tabName) {
    const missionsTab = document.querySelector("#tab-missions");
    const prizeTab = document.querySelector("#tab-prizes");
    const shopTab = document.querySelector("#tab-shop");
    const collectTab = document.querySelector("#tab-collect");
    const friendsTab = document.querySelector("#tab-friends");
    const missionsBtn = document.querySelector("#tabBtn-missions");
    const prizeBtn = document.querySelector("#tabBtn-prizes");
    const shopBtn = document.querySelector("#tabBtn-shop");
    const collectBtn = document.querySelector("#tabBtn-collect");
    const friendsBtn = document.querySelector("#tabBtn-friends");

    const tabs = [
        { name: "missions", el: missionsTab, btn: missionsBtn },
        { name: "prizes", el: prizeTab, btn: prizeBtn },
        { name: "shop", el: shopTab, btn: shopBtn },
        { name: "collect", el: collectTab, btn: collectBtn },
        { name: "friends", el: friendsTab, btn: friendsBtn }
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

    // 🔰 はじめてガイド：ショップのタブを初めて開いた記録を取る（図鑑・マップは各ページ側で記録する）
    if (typeof trackTutorialMission === "function") {
        if (tabName === "shop") trackTutorialMission("shop_wo_nozoku");
    }
}

// 🔔 サイドバーの通知ベルをタップした時、ミッションタブの「季節限定ミッション」まで移動する
function jumpToSeasonalMissions() {
    showTab("missions");
    const section = document.querySelector("#seasonal-missions-section");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
}

// 👥 フレンド申請の通知ベルをタップした時、フレンドタブまで移動する
function jumpToFriendsTab() {
    showTab("friends");
    const section = document.querySelector("#friend-requests-section");
    if (section) {
        section.open = true;
        section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}