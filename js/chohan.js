// ============================================================
// chohan.js
// 🎲 丁半博打（ミニゲーム第1弾）のゲームロジックと初期化処理
// ============================================================

// 🎲 サイコロの目（1〜6）を表す絵文字。DICE_FACES[出目] で参照する（0番目は未使用）
const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

let chohanRolling = false;      // サイコロを振っている最中は二重に賭けられないようにする
let chohanSessionCount = 0;     // このページを開いてからのプレイ回数（保存はしない。累計はminigamePlayCountが担当）

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
        updateChohanMoneyDisplay();
        updateChohanSessionUI();
    } catch (e) {
        console.error("丁半博打ページの読み込みに失敗しました: ", e);
    }
});

// 💰 所持金表示の更新（このページは軽量化のため、omikuji2.html等の共通updateMoneyDisplay()は使わない）
function updateChohanMoneyDisplay() {
    const moneySpan = document.querySelector("#money");
    if (moneySpan) moneySpan.textContent = currentMoney.toLocaleString();
}

// 💰 賭け金入力欄にプリセット金額を反映する
function setChohanBet(amount) {
    const input = document.querySelector("#chohan-bet-input");
    if (input) input.value = amount;
}

// 💰 賭け金入力欄に所持金全額を反映する
function setChohanBetAll() {
    const input = document.querySelector("#chohan-bet-input");
    if (input) input.value = currentMoney;
}

// 📊 セッション中の成績表示を更新する
function updateChohanSessionUI(lastResultText) {
    const countEl = document.querySelector("#chohan-session-count");
    if (countEl) countEl.textContent = chohanSessionCount.toLocaleString();

    if (lastResultText) {
        const streakEl = document.querySelector("#chohan-session-streak");
        if (streakEl) streakEl.textContent = lastResultText;
    }
}

// 🔒 賭け中はボタン類を操作不可にする
function setChohanButtonsDisabled(disabled) {
    ["chohan-cho-btn", "chohan-han-btn", "chohan-bet-all-btn"].forEach(id => {
        const el = document.querySelector("#" + id);
        if (el) el.disabled = disabled;
    });
    document.querySelectorAll(".bet-preset-btn").forEach(btn => { btn.disabled = disabled; });
    const betInput = document.querySelector("#chohan-bet-input");
    if (betInput) betInput.disabled = disabled;
}

// 🎲 丁半博打の本体処理。choiceは "cho"（丁＝偶数）か "han"（半＝奇数）
async function playChohan(choice) {
    if (chohanRolling) return;

    const betInput = document.querySelector("#chohan-bet-input");
    const resultBox = document.querySelector("#chohan-result-box");
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

    chohanRolling = true;
    setChohanButtonsDisabled(true);

    const dice1 = document.querySelector("#dice-1");
    const dice2 = document.querySelector("#dice-2");

    if (resultBox) {
        resultBox.textContent = "🎲 サイコロを振っています…";
        resultBox.className = "chohan-result-box";
    }
    if (dice1) dice1.classList.add("dice-rolling");
    if (dice2) dice2.classList.add("dice-rolling");

    if (typeof startShuffleSE === "function") startShuffleSE();

    // 🎲 振っている間、サイコロの目をランダムに切り替えて演出する
    const rollInterval = setInterval(() => {
        if (dice1) dice1.textContent = DICE_FACES[1 + Math.floor(Math.random() * 6)];
        if (dice2) dice2.textContent = DICE_FACES[1 + Math.floor(Math.random() * 6)];
    }, 80);

    setTimeout(async () => {
        clearInterval(rollInterval);
        if (typeof stopShuffleSE === "function") stopShuffleSE();

        const d1 = 1 + Math.floor(Math.random() * 6);
        const d2 = 1 + Math.floor(Math.random() * 6);
        if (dice1) { dice1.textContent = DICE_FACES[d1]; dice1.classList.remove("dice-rolling"); }
        if (dice2) { dice2.textContent = DICE_FACES[d2]; dice2.classList.remove("dice-rolling"); }

        const sum = d1 + d2;
        const isCho = sum % 2 === 0;
        const resultLabel = isCho ? "丁" : "半";
        const win = (isCho && choice === "cho") || (!isCho && choice === "han");

        chohanSessionCount++;
        minigamePlayCount++;

        if (win) {
            currentMoney += bet;
            minigameTotalWon += bet;
        } else {
            currentMoney -= bet;
        }

        updateChohanMoneyDisplay();
        if (typeof playSE === "function") playSE(win ? "se-win" : "se-lose");

        if (resultBox) {
            resultBox.textContent =
                (win ? "🎉 的中！ " : "😢 残念、外れ… ") +
                "（🎲" + d1 + " + 🎲" + d2 + " = " + sum + " → " + resultLabel + "）　" +
                (win ? "+" + bet.toLocaleString() : "-" + bet.toLocaleString()) + "円";
            resultBox.classList.add(win ? "chohan-result-win" : "chohan-result-lose");
        }

        updateChohanSessionUI(resultLabel + "（" + (win ? "的中" : "外れ") + "）");

        const historyLabel = "🎲丁半博打（" + resultLabel + (win ? "・的中" : "・外れ") + "）";
        if (typeof recordMinigameHistory === "function") {
            await recordMinigameHistory(historyLabel, win ? bet : -bet, currentMoney);
        }
        if (typeof saveUserState === "function") await saveUserState();

        setChohanButtonsDisabled(false);
        chohanRolling = false;
    }, 900);
}
