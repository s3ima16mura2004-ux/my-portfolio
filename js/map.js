// ============================================================
// map.js
// 🗺️ map.html（境内マップページ）専用の初期化処理
// マス購入・都道府県選択などは omikuji-shop.js / omikuji-ui-map.js の
// 既存関数（omikuji2.htmlと共通）をそのまま利用する。
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

        updateMoneyDisplay(); // 所持金表示＋ショップ関連の付随更新（内部でupdateShrineMapUIも呼ばれる）
        updateTitlesUI();
        updateShrineMapUI();
        applyTimeTheme();

        // 🔰 はじめてガイド「境内マップを覗く」の達成記録（omikuji2.html側のタブ切替に代わる記録タイミング）
        if (typeof trackTutorialMission === "function") trackTutorialMission("map_wo_miru");
    } catch (e) {
        console.error("境内マップページの読み込みに失敗しました: ", e);
    }
});
