// ============================================================
// sugoroku.js
// 🎯 境内すごろく（ミニゲーム第3弾）のゲームロジックと初期化処理
// 参加料を払ってスタートし、サイコロを振りながらゴールを目指す。
// 止まったマスのご利益はSUGOROKU_EFFECT_TABLE（omikuji-data.js）から抽選する。
// ============================================================

let sugorokuActive = false;    // 現在ラウンド進行中かどうか
let sugorokuRolling = false;   // サイコロを振っている最中は二重操作を防ぐ
let sugorokuPosition = 0;      // 現在のマス目（0=スタート、SUGOROKU_BOARD_SIZE=ゴール）
let sugorokuBet = 0;           // このラウンドの参加料
let sugorokuWinnings = 0;      // このラウンドで積み上がった獲得額の合計（参加料は含まない）
let sugorokuSessionCount = 0;  // このページを開いてからのプレイ回数（保存はしない）

// ページ初期化：ログイン確認とユーザーデータの読み込み
window.addEventListener("DOMContentLoaded", async () => {
    currentUser = localStorage.getItem("logged_in_user");

    if (!currentUser) {
        window.location.href = "index.html";
        return;
    }

    const userDisplay = document.querySelector("#user-display");
    if (userDisplay) userDisplay.textContent = currentUser;

    const sizeText = document.querySelector("#sugoroku-board-size-text");
    if (sizeText) sizeText.textContent = SUGOROKU_BOARD_SIZE;

    try {
        await loadUserState();
        updateSugorokuMoneyDisplay();
        updateSugorokuSessionUI();
        renderSugorokuBoard();
    } catch (e) {
        console.error("境内すごろくページの読み込みに失敗しました: ", e);
    }
});

// 💰 所持金表示の更新（このページは軽量化のため、omikuji2.html等の共通updateMoneyDisplay()は使わない）
function updateSugorokuMoneyDisplay() {
    const moneySpan = document.querySelector("#money");
    if (moneySpan) moneySpan.textContent = currentMoney.toLocaleString();
}

// 💰 賭け金入力欄にプリセット金額を反映する
function setSugorokuBet(amount) {
    const input = document.querySelector("#sugoroku-bet-input");
    if (input) input.value = amount;
}

// 💰 賭け金入力欄に所持金全額を反映する
function setSugorokuBetAll() {
    const input = document.querySelector("#sugoroku-bet-input");
    if (input) input.value = currentMoney;
}

// 📊 セッション中の成績表示を更新する
function updateSugorokuSessionUI(lastResultText) {
    const countEl = document.querySelector("#sugoroku-session-count");
    if (countEl) countEl.textContent = sugorokuSessionCount.toLocaleString();

    if (lastResultText) {
        const streakEl = document.querySelector("#sugoroku-session-streak");
        if (streakEl) streakEl.textContent = lastResultText;
    }
}

// 📜 ログ欄に1行追加する
function logSugoroku(text) {
    const log = document.querySelector("#sugoroku-log");
    if (!log) return;
    const p = document.createElement("p");
    p.textContent = text;
    log.appendChild(p);
}

// 🗺️ 盤面（0〜SUGOROKU_BOARD_SIZE）を、5列で折り返す蛇行パスとして描画する
// 各マスの効果は固定（SUGOROKU_TILE_LAYOUT）なので、形・色・絵文字であらかじめ見当がつくようにする
function renderSugorokuBoard() {
    const board = document.querySelector("#sugoroku-board");
    if (!board) return;

    const COLS = 5;
    let html = "";
    for (let i = 0; i <= SUGOROKU_BOARD_SIZE; i++) {
        const row = Math.floor(i / COLS);
        const colInRow = i % COLS;
        // 偶数行は左→右、奇数行は右→左に並べて、盤面が蛇行するようにする
        const col = (row % 2 === 0) ? colInRow : (COLS - 1 - colInRow);

        const classes = ["sugoroku-tile"];
        if (i === 0) classes.push("sugoroku-tile-start");
        if (i === SUGOROKU_BOARD_SIZE) classes.push("sugoroku-tile-goal");
        if (i < sugorokuPosition) classes.push("sugoroku-tile-passed");
        if (i === sugorokuPosition) classes.push("sugoroku-tile-current");

        let inner;
        if (i === 0) {
            inner = '<span class="sugoroku-tile-main">出発</span>';
        } else if (i === SUGOROKU_BOARD_SIZE) {
            inner = '<span class="sugoroku-tile-main">🏁</span>';
        } else {
            const effect = getSugorokuTileEffect(i);
            classes.push("sugoroku-tile-effect-" + effect.key);
            inner =
                '<span class="sugoroku-tile-main">' + effect.emoji + '</span>' +
                '<span class="sugoroku-tile-num">' + i + '</span>';
        }

        html += '<div class="' + classes.join(" ") + '" style="grid-row:' + (row + 1) + ';grid-column:' + (col + 1) + ';">' + inner + '</div>';
    }
    board.innerHTML = html;
}

// 🎯 指定したマス目（1〜19）に固定で割り当てられた効果を返す
function getSugorokuTileEffect(position) {
    const key = SUGOROKU_TILE_LAYOUT[position - 1];
    return SUGOROKU_EFFECT_TABLE.find(e => e.key === key) || SUGOROKU_EFFECT_TABLE[0];
}

// 🔒 賭け中はボタン類を操作不可にする
function setSugorokuEntryDisabled(disabled) {
    const startBtn = document.querySelector("#sugoroku-start-btn");
    if (startBtn) startBtn.disabled = disabled;
    document.querySelectorAll("#sugoroku-entry-panel .bet-preset-btn").forEach(btn => { btn.disabled = disabled; });
    const betInput = document.querySelector("#sugoroku-bet-input");
    if (betInput) betInput.disabled = disabled;
}

// 🎫 参加料を払ってラウンドをスタートする
async function startSugorokuRound() {
    if (sugorokuActive) return;

    const betInput = document.querySelector("#sugoroku-bet-input");
    const bet = betInput ? parseInt(betInput.value, 10) : NaN;

    if (!Number.isFinite(bet) || bet <= 0) {
        alert("🙅 参加料を正しく入力してください。");
        return;
    }
    if (bet < 100) {
        alert("🙅 参加料は100円以上にしてください。");
        return;
    }
    if (bet > currentMoney) {
        alert("🙅 所持金が足りません！\n所持金：" + currentMoney.toLocaleString() + "円");
        return;
    }

    sugorokuActive = true;
    sugorokuBet = bet;
    sugorokuWinnings = 0;
    sugorokuPosition = 0;

    currentMoney -= bet;
    updateSugorokuMoneyDisplay();
    renderSugorokuBoard();

    const log = document.querySelector("#sugoroku-log");
    if (log) log.innerHTML = "";
    logSugoroku("🎫 参加料 " + bet.toLocaleString() + "円を払って出発しました！");

    const entryPanel = document.querySelector("#sugoroku-entry-panel");
    if (entryPanel) entryPanel.classList.add("hidden");
    const rollBtn = document.querySelector("#sugoroku-roll-btn");
    if (rollBtn) rollBtn.classList.remove("hidden");
    const resetBtn = document.querySelector("#sugoroku-reset-btn");
    if (resetBtn) resetBtn.classList.add("hidden");

    if (typeof playSE === "function") playSE("se-found");
    if (typeof saveUserState === "function") await saveUserState(); // 参加料の減額を確実に保存しておく
}

// 🎲 サイコロを振って1マス分進む
async function rollSugoroku() {
    if (!sugorokuActive || sugorokuRolling) return;

    sugorokuRolling = true;
    const rollBtn = document.querySelector("#sugoroku-roll-btn");
    if (rollBtn) rollBtn.disabled = true;

    const diceEl = document.querySelector("#sugoroku-dice");
    if (diceEl) diceEl.classList.remove("hidden");

    if (typeof startShuffleSE === "function") startShuffleSE();

    const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    let ticks = 0;
    const rollInterval = setInterval(() => {
        if (diceEl) diceEl.textContent = DICE_FACES[1 + Math.floor(Math.random() * 6)];
        ticks++;
    }, 80);

    await new Promise(resolve => setTimeout(resolve, 700));
    clearInterval(rollInterval);
    if (typeof stopShuffleSE === "function") stopShuffleSE();

    const steps = 1 + Math.floor(Math.random() * 6);
    if (diceEl) diceEl.textContent = DICE_FACES[steps];

    sugorokuPosition = Math.min(SUGOROKU_BOARD_SIZE, sugorokuPosition + steps);
    renderSugorokuBoard();

    if (sugorokuPosition >= SUGOROKU_BOARD_SIZE) {
        const bonus = Math.round(sugorokuBet * SUGOROKU_GOAL_BONUS_MULT);
        sugorokuWinnings += bonus;
        currentMoney += bonus;
        updateSugorokuMoneyDisplay();
        logSugoroku("🎲 " + steps + "の目が出て、ゴールに到着！");
        logSugoroku("🏆 ゴール到達ボーナス +" + bonus.toLocaleString() + "円");
        if (typeof playSE === "function") playSE("se-complete");
        if (typeof startConfetti === "function") startConfetti();
        await finishSugorokuRound();
    } else {
        const effect = getSugorokuTileEffect(sugorokuPosition);
        const amount = Math.round(sugorokuBet * effect.mult);
        sugorokuWinnings += amount;
        currentMoney += amount;
        updateSugorokuMoneyDisplay();

        logSugoroku(
            "🎲 " + steps + "マス進んで" + sugorokuPosition + "マス目「" + effect.label + "」" +
            (amount > 0 ? "　+" + amount.toLocaleString() + "円" : "")
        );

        if (amount > 0 && typeof playSE === "function") playSE("se-win");

        if (typeof saveUserState === "function") await saveUserState();
        if (rollBtn) rollBtn.disabled = false;
    }

    sugorokuRolling = false;
}

// 📊 ゴール到達後の精算処理
async function finishSugorokuRound() {
    const net = sugorokuWinnings - sugorokuBet;

    sugorokuSessionCount++;
    minigamePlayCount++;
    if (typeof trackWeeklyMinigamePlay === "function") trackWeeklyMinigamePlay(); // 📅 週間ミッション「週間ミニゲーム挑戦」の進捗を更新
    if (net > 0) minigameTotalWon += net;

    logSugoroku(
        "📊 今回の収支：" + (net >= 0 ? "+" : "") + net.toLocaleString() + "円" +
        "（獲得合計" + sugorokuWinnings.toLocaleString() + "円 － 参加料" + sugorokuBet.toLocaleString() + "円）"
    );

    updateSugorokuSessionUI((net >= 0 ? "+" : "") + net.toLocaleString() + "円");

    const historyLabel = "🎯境内すごろく（ゴール到達・収支" + (net >= 0 ? "+" : "") + net.toLocaleString() + "円）";
    if (typeof recordMinigameHistory === "function") {
        await recordMinigameHistory(historyLabel, net, currentMoney);
    }

    sugorokuActive = false;
    if (typeof saveUserState === "function") await saveUserState();

    const rollBtn = document.querySelector("#sugoroku-roll-btn");
    if (rollBtn) rollBtn.classList.add("hidden");
    const resetBtn = document.querySelector("#sugoroku-reset-btn");
    if (resetBtn) resetBtn.classList.remove("hidden");
}

// 🔄 精算後、もう一度挑戦できるように参加パネルを出し直す
function resetSugorokuEntryPanel() {
    sugorokuPosition = 0;
    renderSugorokuBoard();

    const log = document.querySelector("#sugoroku-log");
    if (log) log.innerHTML = "";

    const diceEl = document.querySelector("#sugoroku-dice");
    if (diceEl) diceEl.classList.add("hidden");

    const entryPanel = document.querySelector("#sugoroku-entry-panel");
    if (entryPanel) entryPanel.classList.remove("hidden");
    setSugorokuEntryDisabled(false);

    const resetBtn = document.querySelector("#sugoroku-reset-btn");
    if (resetBtn) resetBtn.classList.add("hidden");
}