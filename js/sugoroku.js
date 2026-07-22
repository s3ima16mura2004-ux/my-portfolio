// ============================================================
// sugoroku.js
// 🎯 境内すごろく（ミニゲーム第3弾）のゲームロジックと初期化処理
// 参加料を払ってスタートし、サイコロを振りながらゴールを目指す。
// コース（SUGOROKU_COURSES）とプレイヤーの駒（SUGOROKU_TOKENS）はomikuji-data.jsで定義。
// ============================================================

let sugorokuRolling = false;        // サイコロを振っている最中は二重操作を防ぐ
let sugorokuSessionCount = 0;       // このページを開いてからのプレイ回数（保存はしない）
let sugorokuSelectedCourseKey = "standard"; // 参加パネルで選択中のコース（まだ確定していない）
let sugorokuSelectedTokenKey = "walk";      // 参加パネルで選択中の駒

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
        updateSugorokuMoneyDisplay();
        updateSugorokuSessionUI();

        sugorokuSelectedCourseKey = sugorokuCourseKey || "standard";
        sugorokuSelectedTokenKey = sugorokuTokenKey || "walk";

        renderTokenOptions();

        // 🔄 前回途中で離脱したラウンドが残っていれば、そのまま再開する
        const course = getCourseByKey(sugorokuCourseKey);
        if (sugorokuInProgress && course && Array.isArray(sugorokuLayout) && sugorokuLayout.length === course.boardSize - 1) {
            renderSugorokuBoard();
            const entryPanel = document.querySelector("#sugoroku-entry-panel");
            if (entryPanel) entryPanel.classList.add("hidden");
            const rollBtn = document.querySelector("#sugoroku-roll-btn");
            if (rollBtn) rollBtn.classList.remove("hidden");
            logSugoroku("↩️ 前回の続きから再開しました（" + course.emoji + course.name + "・現在" + sugorokuPosition + "マス目、参加料" + sugorokuBet.toLocaleString() + "円）");
        } else {
            sugorokuInProgress = false;
            renderCourseOptions();
            applySugorokuCourseToEntryPanel();
            renderSugorokuBoard();
        }
    } catch (e) {
        console.error("境内すごろくページの読み込みに失敗しました: ", e);
    }
});

// 📱 画面幅が変わったら（回転・リサイズ等）、列数がズレないよう盤面を再描画する
let sugorokuResizeTimer = null;
window.addEventListener("resize", () => {
    clearTimeout(sugorokuResizeTimer);
    sugorokuResizeTimer = setTimeout(renderSugorokuBoard, 150);
});

// 💰 所持金表示の更新（このページは軽量化のため、omikuji2.html等の共通updateMoneyDisplay()は使わない）
function updateSugorokuMoneyDisplay() {
    const moneySpan = document.querySelector("#money");
    if (moneySpan) moneySpan.textContent = currentMoney.toLocaleString();
}

// 🗺️ コースkeyからコース定義を取得する
function getCourseByKey(key) {
    return SUGOROKU_COURSES.find(c => c.key === key) || SUGOROKU_COURSES[0];
}

// 🗺️ 現在有効なコース（進行中ならそのコース、そうでなければ参加パネルで選択中のコース）を返す
function getActiveSugorokuCourse() {
    if (sugorokuInProgress) return getCourseByKey(sugorokuCourseKey);
    return getCourseByKey(sugorokuSelectedCourseKey);
}

// 🗺️ コース選択ボタンの一覧を描画する
function renderCourseOptions() {
    const list = document.querySelector("#sugoroku-course-list");
    if (!list) return;

    list.innerHTML = SUGOROKU_COURSES.map(course => {
        const active = course.key === sugorokuSelectedCourseKey;
        return (
            '<button type="button" class="sugoroku-option-btn' + (active ? " sugoroku-option-active" : "") + '" onclick="selectSugorokuCourse(\'' + course.key + '\')">' +
                '<span class="sugoroku-option-emoji">' + course.emoji + '</span>' +
                '<span class="sugoroku-option-name">' + course.name + '</span>' +
                '<span class="sugoroku-option-desc">' + course.desc + '</span>' +
                '<span class="sugoroku-option-desc">全' + course.boardSize + 'マス・最低' + course.minBet.toLocaleString() + '円〜</span>' +
            '</button>'
        );
    }).join("");
}

// 🚶 駒選択ボタンの一覧を描画する
function renderTokenOptions() {
    const list = document.querySelector("#sugoroku-token-list");
    if (!list) return;

    list.innerHTML = SUGOROKU_TOKENS.map(token => {
        const active = token.key === sugorokuSelectedTokenKey;
        return (
            '<button type="button" class="sugoroku-token-btn' + (active ? " sugoroku-option-active" : "") + '" onclick="selectSugorokuToken(\'' + token.key + '\')" title="' + token.name + '">' +
                token.emoji +
            '</button>'
        );
    }).join("");
}

// 🗺️ コースを選び直した時の処理（賭け金入力欄・プリセット・盤面プレビューを選んだコースに合わせる）
function selectSugorokuCourse(key) {
    if (sugorokuInProgress) return;
    sugorokuSelectedCourseKey = key;
    renderCourseOptions();
    applySugorokuCourseToEntryPanel();
    renderSugorokuBoard();
}

// 🚶 駒を選び直した時の処理
async function selectSugorokuToken(key) {
    sugorokuSelectedTokenKey = key;
    sugorokuTokenKey = key; // 次回以降も同じ駒を使えるよう記録しておく
    renderTokenOptions();
    if (!sugorokuInProgress) renderSugorokuBoard();
    if (typeof saveUserState === "function") await saveUserState();
}

// 🗺️ 選択中のコースに合わせて、賭け金入力欄・プリセット・盤面サイズ表記・凡例を更新する
function applySugorokuCourseToEntryPanel() {
    const course = getCourseByKey(sugorokuSelectedCourseKey);

    const sizeText = document.querySelector("#sugoroku-board-size-text");
    if (sizeText) sizeText.textContent = course.boardSize;

    const betInput = document.querySelector("#sugoroku-bet-input");
    if (betInput) {
        betInput.min = course.minBet;
        if (!betInput.value || parseInt(betInput.value, 10) < course.minBet) {
            betInput.value = course.minBet;
        }
    }

    renderSugorokuBetPresets(course);
    renderSugorokuLegend(course);
}

// 💰 コースの最低賭け金に応じたプリセット金額ボタンを描画する
function renderSugorokuBetPresets(course) {
    const row = document.querySelector("#sugoroku-bet-preset-row");
    if (!row) return;

    const presets = course.minBet >= 10000
        ? [10000, 50000, 100000, 500000]
        : [1000, 5000, 10000, 50000];

    let html = presets.map(amount =>
        '<button type="button" class="bet-preset-btn" onclick="setSugorokuBet(' + amount + ')">' + amount.toLocaleString() + '円</button>'
    ).join("");
    html += '<button type="button" class="bet-preset-btn" id="sugoroku-bet-all-btn" onclick="setSugorokuBetAll()">全額</button>';

    row.innerHTML = html;
}

// 📋 選択中のコースの配当倍率で、マス効果の凡例を描画する
function renderSugorokuLegend(course) {
    const legend = document.querySelector("#sugoroku-legend");
    if (!legend) return;

    const shapeStyles = {
        none: "border-radius:50%/42%;",
        coin: "clip-path:circle(46% at 50% 50%);background:#fff8e0;",
        dango: "clip-path:polygon(50% 4%,96% 50%,50% 96%,4% 50%);background:#ffeef0;",
        gift: "clip-path:polygon(25% 4%,75% 4%,98% 50%,75% 96%,25% 96%,2% 50%);background:#eafbe8;",
        big: "clip-path:polygon(50% 0%,63% 33%,98% 36%,71% 58%,80% 92%,50% 72%,20% 92%,29% 58%,2% 36%,37% 33%);background:linear-gradient(135deg,#ffe0b3,#ffb84d);",
        jackpot: "clip-path:polygon(50% 0%,63% 33%,98% 36%,71% 58%,80% 92%,50% 72%,20% 92%,29% 58%,2% 36%,37% 33%);background:linear-gradient(135deg,#fff2cc,#ffd700);"
    };

    legend.innerHTML = SUGOROKU_EFFECT_TABLE.map(effect => {
        const scaledMult = effect.mult * course.effectMultScale;
        return (
            '<span class="sugoroku-legend-item">' +
                '<span class="sugoroku-legend-shape" style="' + (shapeStyles[effect.key] || "") + '"></span>' +
                effect.emoji + ' ' + effect.label.slice(2) + ' +' + scaledMult.toFixed(1) + '倍' +
            '</span>'
        );
    }).join("");
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

// 🗺️ 盤面（0〜コースのboardSize）を、画面幅に応じた列数で折り返す蛇行パスとして描画する
// 各マスの効果はラウンドごとにランダムで決まる（sugorokuLayout）ので、形・色・絵文字で見当がつくようにする
function getSugorokuColumnCount() {
    return window.innerWidth <= 600 ? 4 : 5;
}

function renderSugorokuBoard() {
    const board = document.querySelector("#sugoroku-board");
    if (!board) return;

    const course = getActiveSugorokuCourse();
    const boardSize = course.boardSize;
    const tokenEmoji = (SUGOROKU_TOKENS.find(t => t.key === sugorokuSelectedTokenKey) || SUGOROKU_TOKENS[0]).emoji;

    const COLS = getSugorokuColumnCount();
    let html = "";
    for (let i = 0; i <= boardSize; i++) {
        const row = Math.floor(i / COLS);
        const colInRow = i % COLS;
        // 偶数行は左→右、奇数行は右→左に並べて、盤面が蛇行するようにする
        const col = (row % 2 === 0) ? colInRow : (COLS - 1 - colInRow);

        const classes = ["sugoroku-tile"];
        if (i === 0) classes.push("sugoroku-tile-start");
        if (i === boardSize) classes.push("sugoroku-tile-goal");
        if (sugorokuInProgress && i < sugorokuPosition) classes.push("sugoroku-tile-passed");

        let inner;
        if (i === 0) {
            inner = '<span class="sugoroku-tile-main">出発</span>';
        } else if (i === boardSize) {
            inner = '<span class="sugoroku-tile-main">🏁</span>';
        } else {
            const effect = getSugorokuTileEffect(i);
            classes.push("sugoroku-tile-effect-" + effect.key);
            inner =
                '<span class="sugoroku-tile-main">' + effect.emoji + '</span>' +
                '<span class="sugoroku-tile-num">' + i + '</span>';
        }

        const isCurrent = sugorokuInProgress ? (i === sugorokuPosition) : (i === 0);
        if (isCurrent) {
            classes.push("sugoroku-tile-current");
            inner = '<span class="sugoroku-token-marker">' + tokenEmoji + '</span>' + inner;
        }

        html += '<div class="' + classes.join(" ") + '" style="grid-row:' + (row + 1) + ';grid-column:' + (col + 1) + ';">' + inner + '</div>';
    }
    board.innerHTML = html;
}

// 🎯 指定したマス目に、現在のラウンドで割り当てられている効果を返す
function getSugorokuTileEffect(position) {
    const key = sugorokuLayout[position - 1];
    return SUGOROKU_EFFECT_TABLE.find(e => e.key === key) || SUGOROKU_EFFECT_TABLE[0];
}

// 🎲 コースのtileCountsの内訳に従って、マス効果をランダムな順番に並べた盤面を1つ生成する
function generateSugorokuLayout(course) {
    const pool = [];
    Object.keys(course.tileCounts).forEach(key => {
        for (let i = 0; i < course.tileCounts[key]; i++) pool.push(key);
    });
    // Fisher-Yatesシャッフル
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    return pool;
}

// 🔒 賭け中はボタン類を操作不可にする
function setSugorokuEntryDisabled(disabled) {
    const startBtn = document.querySelector("#sugoroku-start-btn");
    if (startBtn) startBtn.disabled = disabled;
    document.querySelectorAll("#sugoroku-entry-panel .bet-preset-btn").forEach(btn => { btn.disabled = disabled; });
    document.querySelectorAll("#sugoroku-course-list .sugoroku-option-btn").forEach(btn => { btn.disabled = disabled; });
    const betInput = document.querySelector("#sugoroku-bet-input");
    if (betInput) betInput.disabled = disabled;
}

// 🎫 参加料を払ってラウンドをスタートする
async function startSugorokuRound() {
    if (sugorokuInProgress) return;

    const course = getCourseByKey(sugorokuSelectedCourseKey);
    const betInput = document.querySelector("#sugoroku-bet-input");
    const bet = betInput ? parseInt(betInput.value, 10) : NaN;

    if (!Number.isFinite(bet) || bet <= 0) {
        alert("🙅 参加料を正しく入力してください。");
        return;
    }
    if (bet < course.minBet) {
        alert("🙅 「" + course.name + "」の参加料は" + course.minBet.toLocaleString() + "円以上にしてください。");
        return;
    }
    if (bet > currentMoney) {
        alert("🙅 所持金が足りません！\n所持金：" + currentMoney.toLocaleString() + "円");
        return;
    }

    sugorokuInProgress = true;
    sugorokuCourseKey = course.key;
    sugorokuTokenKey = sugorokuSelectedTokenKey;
    sugorokuBet = bet;
    sugorokuWinnings = 0;
    sugorokuPosition = 0;
    sugorokuLayout = generateSugorokuLayout(course); // 🎲 このラウンド専用の盤面をシャッフルして生成

    currentMoney -= bet;
    updateSugorokuMoneyDisplay();
    renderSugorokuBoard();

    const log = document.querySelector("#sugoroku-log");
    if (log) log.innerHTML = "";
    logSugoroku("🎫 " + course.emoji + course.name + "に参加料 " + bet.toLocaleString() + "円を払って出発しました！");

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
    if (!sugorokuInProgress || sugorokuRolling) return;

    const course = getCourseByKey(sugorokuCourseKey);

    sugorokuRolling = true;
    const rollBtn = document.querySelector("#sugoroku-roll-btn");
    if (rollBtn) rollBtn.disabled = true;

    const diceEl = document.querySelector("#sugoroku-dice");
    if (diceEl) diceEl.classList.remove("hidden");

    if (typeof startShuffleSE === "function") startShuffleSE();

    const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    const rollInterval = setInterval(() => {
        if (diceEl) diceEl.textContent = DICE_FACES[1 + Math.floor(Math.random() * 6)];
    }, 80);

    await new Promise(resolve => setTimeout(resolve, 700));
    clearInterval(rollInterval);
    if (typeof stopShuffleSE === "function") stopShuffleSE();

    const steps = 1 + Math.floor(Math.random() * 6);
    if (diceEl) diceEl.textContent = DICE_FACES[steps];

    sugorokuPosition = Math.min(course.boardSize, sugorokuPosition + steps);
    renderSugorokuBoard();

    if (sugorokuPosition >= course.boardSize) {
        const bonus = Math.round(sugorokuBet * course.goalBonusMult);
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
        const amount = Math.round(sugorokuBet * effect.mult * course.effectMultScale);
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

    sugorokuInProgress = false;
    if (typeof saveUserState === "function") await saveUserState();

    const rollBtn = document.querySelector("#sugoroku-roll-btn");
    if (rollBtn) rollBtn.classList.add("hidden");
    const resetBtn = document.querySelector("#sugoroku-reset-btn");
    if (resetBtn) resetBtn.classList.remove("hidden");
}

// 🔄 精算後、もう一度挑戦できるように参加パネルを出し直す
function resetSugorokuEntryPanel() {
    sugorokuPosition = 0;

    const log = document.querySelector("#sugoroku-log");
    if (log) log.innerHTML = "";

    const diceEl = document.querySelector("#sugoroku-dice");
    if (diceEl) diceEl.classList.add("hidden");

    const entryPanel = document.querySelector("#sugoroku-entry-panel");
    if (entryPanel) entryPanel.classList.remove("hidden");
    setSugorokuEntryDisabled(false);

    const resetBtn = document.querySelector("#sugoroku-reset-btn");
    if (resetBtn) resetBtn.classList.add("hidden");

    renderCourseOptions();
    applySugorokuCourseToEntryPanel();
    renderSugorokuBoard();
}