// ============================================================
// goshuincho.js
// 📔 goshuincho.html（御朱印帳ページ）専用の初期化処理
// 図鑑・境内マップ各段階・称号の達成状況を1ページにまとめて表示する（読み取り専用）。
// ============================================================

window.addEventListener("DOMContentLoaded", async () => {
    currentUser = localStorage.getItem("logged_in_user");

    if (!currentUser) {
        window.location.href = "index.html";
        return;
    }

    const userDisplay = document.querySelector("#user-display");
    if (userDisplay) userDisplay.textContent = currentUser;

    try {
        await loadUserState();

        const moneySpan = document.querySelector("#money");
        if (moneySpan) moneySpan.textContent = currentMoney.toLocaleString();

        renderGoshuinchoUI();
    } catch (e) {
        console.error("御朱印帳ページの読み込みに失敗しました: ", e);
    }
});

// 📔 各コレクションの達成状況を集計し、カード一覧として描画する
function renderGoshuinchoUI() {
    const container = document.querySelector("#goshuincho-list");
    if (!container) return;

    const dexCurrent = Object.keys(dexAchieved).filter(k => dexAchieved[k]).length;
    const dexTotal = DEX_ENTRIES.length;

    const stats = buildTitleStats();
    const earnedTitles = TITLES.filter(t => t.condition(stats));

    const items = [
        { emoji: "📖", name: "おみくじ図鑑", current: dexCurrent, total: dexTotal, link: "dex.html" },
        { emoji: "⛩️", name: "境内マップ", current: shrineMapLevel, total: MAP_TILES.length, link: "map.html" },
        { emoji: "🗾", name: "全国神社巡り", current: getJapanShrineOwnedCount(), total: JAPAN_SHRINE_COUNT, link: "map.html" },
        { emoji: "🏯", name: "奥宮・摂社", current: getOkumiyaCompleteCount(), total: JAPAN_SHRINE_COUNT, link: "map.html" },
        { emoji: "🌄", name: "パワースポット", current: getPowerSpotOwnedCount(), total: POWER_SPOT_COUNT, link: "map.html" },
        { emoji: "🎏", name: "日本三大○○", current: getMiniThemeOwnedCount(), total: MINI_THEME_SPOT_COUNT, link: "map.html" },
        { emoji: "🌍", name: "世界の絶景・名所", current: getWorldSpotOwnedCount(), total: WORLD_SPOT_COUNT, link: "map.html" },
        { emoji: "🎖️", name: "称号", current: earnedTitles.length, total: TITLES.length, link: "omikuji2.html" }
    ];

    container.innerHTML = items.map(item => {
        const pct = item.total > 0 ? Math.floor((item.current / item.total) * 100) : 0;
        const complete = item.total > 0 && item.current >= item.total;
        return (
            '<a href="' + item.link + '" class="goshuin-card' + (complete ? " goshuin-card-complete" : "") + '">' +
                '<div class="goshuin-emoji">' + item.emoji + '</div>' +
                '<div class="goshuin-body">' +
                    '<p class="goshuin-name">' + item.name + (complete ? " 🈴コンプリート" : "") + '</p>' +
                    '<div class="mission-progress-outer"><div class="mission-progress-inner" style="width:' + pct + '%"></div></div>' +
                    '<p class="goshuin-progress">' + item.current.toLocaleString() + ' / ' + item.total.toLocaleString() + '（' + pct + '%）</p>' +
                '</div>' +
            '</a>'
        );
    }).join("");
}
