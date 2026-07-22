// ============================================================
// minigames.js
// 🎲 minigames.html（ミニゲーム広場）専用の初期化処理
// ここでは所持金と累計成績の表示のみを行う（ゲーム自体は各ゲームページで実行）。
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

        const playCountSpan = document.querySelector("#minigame-play-count");
        if (playCountSpan) playCountSpan.textContent = minigamePlayCount.toLocaleString();

        const totalWonSpan = document.querySelector("#minigame-total-won");
        if (totalWonSpan) totalWonSpan.textContent = minigameTotalWon.toLocaleString();
    } catch (e) {
        console.error("ミニゲーム広場ページの読み込みに失敗しました: ", e);
    }
});
