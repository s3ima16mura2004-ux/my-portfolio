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

        await loadMinigameRanking();
    } catch (e) {
        console.error("ミニゲーム広場ページの読み込みに失敗しました: ", e);
    }
});

// 🏆 全ユーザーの minigameTotalWon を集計して番付を表示する（top.htmlの長者番付ランキングと同じ作り）
const MINIGAME_RANK_MEDALS = ["🥇", "🥈", "🥉"];

function escapeHtmlForRanking(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

async function loadMinigameRanking() {
    const tbody = document.querySelector("#minigame-ranking-table tbody");
    const myRankNote = document.querySelector("#minigame-my-rank-note");
    if (!tbody) return;

    if (!window.omikujiDB || !window.omikujiGetDocs || !window.omikujiCollection) {
        tbody.innerHTML = '<tr><td colspan="3">ランキングを読み込めませんでした</td></tr>';
        return;
    }

    try {
        const snapshot = await window.omikujiGetDocs(window.omikujiCollection(window.omikujiDB, "users"));

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="3">まだ参拝者がいません</td></tr>';
            return;
        }

        const entries = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const won = typeof data.minigameTotalWon === "number" ? data.minigameTotalWon : 0;
            entries.push({ name: docSnap.id, total: won });
        });

        entries.sort((a, b) => b.total - a.total);
        const displayEntries = entries.slice(0, 50);

        let myRank = -1;
        entries.forEach((entry, index) => {
            if (entry.name === currentUser) myRank = index + 1;
        });

        let rowsHtml = "";
        displayEntries.forEach((entry, index) => {
            const isMe = entry.name === currentUser;
            const medal = MINIGAME_RANK_MEDALS[index] || "";
            rowsHtml +=
                '<tr class="' + (isMe ? "rank-me" : "") + '">' +
                '<td><span class="rank-medal">' + medal + '</span> ' + (index + 1) + '位</td>' +
                '<td>' + escapeHtmlForRanking(entry.name) + '</td>' +
                '<td>' + entry.total.toLocaleString() + '円</td>' +
                '</tr>';
        });
        tbody.innerHTML = rowsHtml;

        if (myRankNote) {
            myRankNote.textContent = (myRank === -1)
                ? "あなたの順位：まだミニゲームに参加していません"
                : "あなたの現在の順位：" + myRank + "位（全" + entries.length + "人中）";
        }
    } catch (e) {
        console.error("ミニゲーム番付の読み込みに失敗しました: ", e);
        tbody.innerHTML = '<tr><td colspan="3">ランキングの読み込みに失敗しました</td></tr>';
    }
}