// ============================================================
// slot.js
// 🎰 神社スロット（ミニゲーム第2弾）のゲームロジックと初期化処理
// ============================================================

let slotSpinning = false;   // スピン中は二重に賭けられないようにする
let slotSessionCount = 0;   // このページを開いてからのプレイ回数（保存はしない）

// ページ初期化：ログイン確認とユーザーデータの読み込み
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
        updateSlotMoneyDisplay();
        updateSlotSessionUI();
        renderSlotPaytable();
    } catch (e) {
        console.error("神社スロットページの読み込みに失敗しました: ", e);
    }
});

// 💰 所持金表示の更新（このページは軽量化のため、omikuji2.html等の共通updateMoneyDisplay()は使わない）
function updateSlotMoneyDisplay() {
    const moneySpan = document.querySelector("#money");
    if (moneySpan) moneySpan.textContent = currentMoney.toLocaleString();
}

// 💰 賭け金入力欄にプリセット金額を反映する
function setSlotBet(amount) {
    const input = document.querySelector("#slot-bet-input");
    if (input) input.value = amount;
}

// 💰 賭け金入力欄に所持金全額を反映する
function setSlotBetAll() {
    const input = document.querySelector("#slot-bet-input");
    if (input) input.value = currentMoney;
}

// 📊 セッション中の成績表示を更新する
function updateSlotSessionUI(lastResultText) {
    const countEl = document.querySelector("#slot-session-count");
    if (countEl) countEl.textContent = slotSessionCount.toLocaleString();

    if (lastResultText) {
        const streakEl = document.querySelector("#slot-session-streak");
        if (streakEl) streakEl.textContent = lastResultText;
    }
}

// 📋 配当表を描画する
function renderSlotPaytable() {
    const body = document.querySelector("#slot-paytable-body");
    if (!body) return;
    body.innerHTML = SLOT_SYMBOLS.map(sym =>
        "<tr><td>" + sym.emoji + sym.emoji + sym.emoji + "</td><td>" + sym.payout + "倍</td></tr>"
    ).join("") + "<tr><td>（絵柄を問わず）2つ揃い</td><td>" + SLOT_TWO_MATCH_PAYOUT + "倍（おあいこ）</td></tr>";
}

// 🔒 スピン中はボタン類を操作不可にする
function setSlotButtonsDisabled(disabled) {
    const spinBtn = document.querySelector("#slot-spin-btn");
    if (spinBtn) spinBtn.disabled = disabled;
    document.querySelectorAll(".bet-preset-btn").forEach(btn => { btn.disabled = disabled; });
    const betInput = document.querySelector("#slot-bet-input");
    if (betInput) betInput.disabled = disabled;
}

// 🎰 出現重みに従って絵柄を1つランダムに選ぶ
function pickWeightedSlotSymbol() {
    const total = SLOT_SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let r = Math.random() * total;
    for (const sym of SLOT_SYMBOLS) {
        if (r < sym.weight) return sym;
        r -= sym.weight;
    }
    return SLOT_SYMBOLS[SLOT_SYMBOLS.length - 1];
}

// 🎰 神社スロットの本体処理
async function playSlot() {
    if (slotSpinning) return;

    const betInput = document.querySelector("#slot-bet-input");
    const resultBox = document.querySelector("#slot-result-box");
    const bet = betInput ? parseInt(betInput.value, 10) : NaN;

    if (!Number.isFinite(bet) || bet <= 0) {
        alert("🙅 賭け金を正しく入力してください。");
        return;
    }
    if (bet < 100) {
        alert("🙅 賭け金は100円以上にしてください。");
        return;
    }
    if (bet > currentMoney) {
        alert("🙅 所持金が足りません！\n所持金：" + currentMoney.toLocaleString() + "円");
        return;
    }

    slotSpinning = true;
    setSlotButtonsDisabled(true);

    const reels = [
        document.querySelector("#slot-reel-1"),
        document.querySelector("#slot-reel-2"),
        document.querySelector("#slot-reel-3")
    ];

    if (resultBox) {
        resultBox.textContent = "🎰 リールが回転中…";
        resultBox.className = "chohan-result-box";
    }
    reels.forEach(r => { if (r) { r.classList.add("slot-reel-spinning"); r.classList.remove("slot-reel-win"); } });

    if (typeof startShuffleSE === "function") startShuffleSE();

    // 🎰 回転中は絵柄をランダムに切り替えて演出する（すでに止まったリールは上書きしない）
    const reelStopped = [false, false, false];
    const spinInterval = setInterval(() => {
        reels.forEach((r, i) => {
            if (r && !reelStopped[i]) r.textContent = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].emoji;
        });
    }, 80);

    const results = [pickWeightedSlotSymbol(), pickWeightedSlotSymbol(), pickWeightedSlotSymbol()];

    // 🎰 リールを1つずつ順番に止めていく（左→中→右）
    const stopReel = (index) => new Promise(resolve => {
        setTimeout(() => {
            reelStopped[index] = true;
            if (reels[index]) {
                reels[index].textContent = results[index].emoji;
                reels[index].classList.remove("slot-reel-spinning");
            }
            resolve();
        }, 600 + index * 500);
    });

    await Promise.all([stopReel(0), stopReel(1), stopReel(2)]);
    clearInterval(spinInterval);
    if (typeof stopShuffleSE === "function") stopShuffleSE();

    const allThreeMatch = results[0].key === results[1].key && results[1].key === results[2].key;
    const twoMatch = !allThreeMatch && (
        results[0].key === results[1].key || results[1].key === results[2].key || results[0].key === results[2].key
    );

    let netChange;
    let resultLabel;

    if (allThreeMatch) {
        netChange = bet * (results[0].payout - 1);
        resultLabel = results[0].emoji + "3つ揃い！（" + results[0].payout + "倍）";
        reels.forEach(r => { if (r) r.classList.add("slot-reel-win"); });
    } else if (twoMatch) {
        netChange = 0;
        resultLabel = "2つ揃い（おあいこ）";
    } else {
        netChange = -bet;
        resultLabel = "揃わず…";
    }

    slotSessionCount++;
    minigamePlayCount++;
    if (typeof trackWeeklyMinigamePlay === "function") trackWeeklyMinigamePlay(); // 📅 週間ミッション「週間ミニゲーム挑戦」の進捗を更新

    currentMoney += netChange;
    if (netChange > 0) minigameTotalWon += netChange;

    updateSlotMoneyDisplay();

    if (netChange > 0) {
        if (typeof playSE === "function") playSE("se-win");
        if (typeof startConfetti === "function" && allThreeMatch) startConfetti();
    } else if (netChange < 0) {
        if (typeof playSE === "function") playSE("se-lose");
    } else {
        if (typeof playSE === "function") playSE("se-found");
    }

    if (resultBox) {
        resultBox.textContent =
            resultLabel + "　" +
            (netChange > 0 ? "+" + netChange.toLocaleString() : netChange < 0 ? netChange.toLocaleString() : "±0") + "円";
        if (netChange > 0) resultBox.classList.add("chohan-result-win");
        else if (netChange < 0) resultBox.classList.add("chohan-result-lose");
    }

    updateSlotSessionUI(resultLabel);

    const historyLabel = "🎰神社スロット（" + resultLabel + "）";
    if (typeof recordMinigameHistory === "function") {
        await recordMinigameHistory(historyLabel, netChange, currentMoney);
    }
    if (typeof saveUserState === "function") await saveUserState();

    setSlotButtonsDisabled(false);
    slotSpinning = false;
}