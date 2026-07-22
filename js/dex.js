// ============================================================
// dex.js
// 📖 dex.html（おみくじ図鑑ページ）専用の初期化処理
// おみくじを引く処理は行わないため、必要最小限のデータ読み込みのみ行う。
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

        updateDexUI();
        updateYearlyAlbumUI();
        updateEquippedTitleDisplay();

        // 🔰 はじめてガイド「図鑑を覗く」の達成記録（omikuji2.html側のタブ切替に代わる記録タイミング）
        if (typeof trackTutorialMission === "function") trackTutorialMission("zukan_wo_miru");
    } catch (e) {
        console.error("図鑑ページの読み込みに失敗しました: ", e);
    }
});
