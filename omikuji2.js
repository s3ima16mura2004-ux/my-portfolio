const omikujiImages = [
    "omikuji_daikichi.png",
    "omikuji_kichi.png",
    "omikuji_chuukichi.png",
    "omikuji_syoukichi.png",
    "omikuji_suekichi.png",
    "omikuji_kyou.png",
    "omikuji_daikyou.png"
];

// 🎋 ラッキーアイテムの一覧（毎日ログイン時に1個抽選・無料）
const LUCKY_ITEMS = [
    { key: "daikichi_up", emoji: "🍀", name: "四つ葉のクローバー", desc: "今日1日、大吉運が少しだけアップ！" },
    { key: "prize_up", emoji: "🐟", name: "立派な鯛", desc: "今日1日、獲得賞金が10%アップ！" },
    { key: "tax_half", emoji: "🐍", name: "白蛇の抜け殻", desc: "今日1日、大凶のお祓い料がさらに半額に！" },
    { key: "fever_extra", emoji: "🔔", name: "縁起の良い鈴の音", desc: "今日1日、大凶時のフィーバー回数が+1回に！" },
    { key: "zorome_up", emoji: "🌟", name: "流れ星のかけら", desc: "今日1日、ゾロ目ボーナスが+2,000円に！" }
];

// 🛍️ ショップで買える「一定回数だけ効果」のアイテム
const SHOP_ITEMS = [
    { key: "manekineko", emoji: "🐱", name: "開運招き猫", price: 10000, duration: 5, desc: "大吉確率が一時的にアップ！" },
    { key: "gofu", emoji: "📜", name: "金運の護符", price: 5000, duration: 5, desc: "獲得賞金が1.1倍に！" },
    { key: "suzu", emoji: "🔔", name: "破邪の鈴", price: 3000, duration: 5, desc: "大凶時の没収額が軽減される！" }
];

// 🎒 おみくじを引くと低確率で手に入る収集アイテム（ドロップ率は独立判定）
const DROP_ITEMS = [
    { key: "koban", emoji: "🪙", name: "黄金の小判", rate: 0.02, desc: "装備中、大凶が確定で「出世大凶（免除）」になる" },
    { key: "shinboku", emoji: "🌳", name: "神社の神木", rate: 0.03, desc: "装備中、大凶時のフィーバー回数が+1回になる" },
    { key: "ishikoro", emoji: "🪨", name: "謎の石ころ", rate: 0.10, desc: "特に効果はないが、100個集めると…？(近日実装)" }
];

let currentUser = null;      // ログイン中のユーザー名
let currentMoney = 10000;    // Firestoreから読み込むまでの仮の初期値
let feverCount = 0;          // フィーバータイム（大吉確率UP）の残り回数
let prayDate = "";           // 最後にお祈りボーナスを使った日
let prayCount = 0;           // その日にお祈りした回数
let luckyItemKey = "";       // 今日のラッキーアイテムのキー

let ownedItems = { koban: 0, shinboku: 0, ishikoro: 0 }; // 収集アイテムの所持数
let equippedCollectible = ""; // 装備中の収集アイテム（"koban" / "shinboku" / ""）
let shopItemKey = "";         // 現在発動中のショップアイテムのキー
let shopItemRemaining = 0;    // ショップアイテムの残り効果回数

// 「結果を送信する」ボタンを押すまでの間、おみくじ結果を貯めておく配列
let historyBuffer = [];

// 指定したキーの本日のラッキーアイテム効果が有効かどうか
function hasEffect(key) {
    return luckyItemKey === key;
}

// 指定したキーのショップアイテムが現在発動中かどうか
function hasShopEffect(key) {
    return shopItemKey === key && shopItemRemaining > 0;
}

function todayStr() {
    return new Date().toLocaleDateString("ja-JP");
}

// 日付が変わっていたら、お祈り回数をリセットする
function refreshPrayDay() {
    const today = todayStr();
    if (prayDate !== today) {
        prayDate = today;
        prayCount = 0;
    }
}

// 所持金・フィーバー回数・お祈り回数・アイテム状態をFirestoreに保存する（ユーザーごとのデータ永続化）
async function saveUserState() {
    if (!currentUser || !window.omikujiDB || !window.omikujiDoc || !window.omikujiUpdateDoc) return;
    try {
        await window.omikujiUpdateDoc(window.omikujiDoc(window.omikujiDB, "users", currentUser), {
            money: currentMoney,
            feverCount: feverCount,
            prayDate: prayDate,
            prayCount: prayCount,
            ownedItems: ownedItems,
            equippedCollectible: equippedCollectible,
            shopItemKey: shopItemKey,
            shopItemRemaining: shopItemRemaining
        });
    } catch (e) {
        console.error("ユーザーデータの保存に失敗しました: ", e);
    }
}

// 1回分の結果を履歴バッファに追加する関数
function recordHistory(resultName, prizeMoney, balanceAfter) {
    historyBuffer.push({
        date: new Date().toLocaleDateString("ja-JP"),
        result: resultName,
        prize: prizeMoney,
        balance: balanceAfter,
        timestamp: new Date()
    });
}

// 所持金の表示とショップUIの状態をまとめて更新する
function updateMoneyDisplay() {
    const moneySpan = document.querySelector("#money");
    if (moneySpan) moneySpan.innerHTML = currentMoney;
    updateShopUI();
}

// 🛍️🎒 タブの切り替え
function showTab(tabName) {
    const prizeTab = document.querySelector("#tab-prizes");
    const shopTab = document.querySelector("#tab-shop");
    const prizeBtn = document.querySelector("#tabBtn-prizes");
    const shopBtn = document.querySelector("#tabBtn-shop");

    if (tabName === "shop") {
        if (prizeTab) prizeTab.classList.add("hidden");
        if (shopTab) shopTab.classList.remove("hidden");
        if (shopBtn) shopBtn.classList.add("tab-active");
        if (prizeBtn) prizeBtn.classList.remove("tab-active");
    } else {
        if (prizeTab) prizeTab.classList.remove("hidden");
        if (shopTab) shopTab.classList.add("hidden");
        if (prizeBtn) prizeBtn.classList.add("tab-active");
        if (shopBtn) shopBtn.classList.remove("tab-active");
    }
}

// ショップアイテムを購入する
async function buyShopItem(itemKey) {
    const item = SHOP_ITEMS.find(i => i.key === itemKey);
    if (!item) return;

    if (currentMoney < item.price) {
        alert("🙅 所持金が足りません！\n「" + item.name + "」の購入には" + item.price.toLocaleString() + "円必要です。");
        return;
    }

    if (shopItemKey && shopItemRemaining > 0 && shopItemKey !== itemKey) {
        const currentItem = SHOP_ITEMS.find(i => i.key === shopItemKey);
        const ok = confirm(
            "現在「" + (currentItem ? currentItem.name : "") + "」の効果が残り" + shopItemRemaining + "回分あります。\n" +
            "上書きして「" + item.name + "」を購入しますか？（残り効果は消えます）"
        );
        if (!ok) return;
    }

    currentMoney -= item.price;
    shopItemKey = item.key;
    shopItemRemaining = item.duration;

    updateMoneyDisplay();
    playSE("se-coin");
    await saveUserState();

    alert("🛍️ 「" + item.name + "」を購入しました！\n" + item.desc + "\n(効果はこれから" + item.duration + "回のおみくじに適用されます)");
}

// 収集アイテムを装備／解除する
async function equipCollectible(key) {
    if (key && !(ownedItems[key] > 0)) {
        alert("🙅 そのアイテムを持っていません！おみくじを引いて手に入れましょう。");
        return;
    }

    equippedCollectible = key;
    updateShopUI();
    await saveUserState();

    if (key) {
        const item = DROP_ITEMS.find(i => i.key === key);
        alert("🎒 「" + (item ? item.name : "") + "」を装備しました！");
    }
}

// ショップタブ・装備欄・発動中ステータス表示をまとめて更新する
function updateShopUI() {
    SHOP_ITEMS.forEach(item => {
        const card = document.querySelector('.shop-item-card[data-key="' + item.key + '"]');
        if (!card) return;

        const btn = card.querySelector(".btn-shop-buy");
        if (btn) btn.disabled = currentMoney < item.price;

        if (shopItemKey === item.key && shopItemRemaining > 0) {
            card.classList.add("shop-item-active");
        } else {
            card.classList.remove("shop-item-active");
        }
    });

    const shopStatusEl = document.querySelector("#shop-active-status");
    if (shopStatusEl) {
        if (shopItemKey && shopItemRemaining > 0) {
            const item = SHOP_ITEMS.find(i => i.key === shopItemKey);
            shopStatusEl.textContent = "🛍️ 現在発動中：" + (item ? item.name : "") + "（残り" + shopItemRemaining + "回）";
            shopStatusEl.classList.remove("hidden");
        } else {
            shopStatusEl.classList.add("hidden");
        }
    }

    const countKoban = document.querySelector("#count-koban");
    if (countKoban) countKoban.textContent = ownedItems.koban || 0;
    const countShinboku = document.querySelector("#count-shinboku");
    if (countShinboku) countShinboku.textContent = ownedItems.shinboku || 0;
    const countIshikoro = document.querySelector("#count-ishikoro");
    if (countIshikoro) countIshikoro.textContent = ownedItems.ishikoro || 0;

    const equipBtnKoban = document.querySelector("#equipBtn-koban");
    if (equipBtnKoban) equipBtnKoban.disabled = !(ownedItems.koban > 0) || equippedCollectible === "koban";
    const equipBtnShinboku = document.querySelector("#equipBtn-shinboku");
    if (equipBtnShinboku) equipBtnShinboku.disabled = !(ownedItems.shinboku > 0) || equippedCollectible === "shinboku";

    const equipStatusEl = document.querySelector("#equip-status");
    if (equipStatusEl) {
        if (equippedCollectible) {
            const item = DROP_ITEMS.find(i => i.key === equippedCollectible);
            equipStatusEl.textContent = "現在の装備：" + (item ? item.emoji + " " + item.name : "なし");
        } else {
            equipStatusEl.textContent = "現在の装備：なし";
        }
    }

    updateActiveItemsUI();
}

// 左パネル上部の「発動中アイテム」ミニ表示
function updateActiveItemsUI() {
    const box = document.querySelector("#active-items-box");
    const shopText = document.querySelector("#active-shop-text");
    const equipText = document.querySelector("#active-equip-text");
    if (!box) return;

    let shown = false;

    if (shopItemKey && shopItemRemaining > 0 && shopText) {
        const item = SHOP_ITEMS.find(i => i.key === shopItemKey);
        if (item) {
            shopText.textContent = "🛍️ 発動中：" + item.emoji + " " + item.name + "（残り" + shopItemRemaining + "回）";
            shopText.classList.remove("hidden");
            shown = true;
        }
    } else if (shopText) {
        shopText.classList.add("hidden");
    }

    if (equippedCollectible && equipText) {
        const item = DROP_ITEMS.find(i => i.key === equippedCollectible);
        if (item) {
            equipText.textContent = "🎒 装備中：" + item.emoji + " " + item.name;
            equipText.classList.remove("hidden");
            shown = true;
        }
    } else if (equipText) {
        equipText.classList.add("hidden");
    }

    if (shown) box.classList.remove("hidden"); else box.classList.add("hidden");
}

// おみくじ1回分、収集アイテムのドロップ判定を行う（それぞれ独立判定）
function rollDrops() {
    const dropped = [];

    DROP_ITEMS.forEach(item => {
        if (Math.random() < item.rate) {
            ownedItems[item.key] = (ownedItems[item.key] || 0) + 1;
            dropped.push(item);

            if (item.key === "ishikoro" && ownedItems.ishikoro === 100) {
                setTimeout(() => {
                    alert("🪨 謎の石ころを100個集めました！\n📜「不思議な力を感じる…果たして何が起こるのか…？」\n(この先の展開は近日実装予定です)");
                }, 900);
            }
        }
    });

    return dropped;
}

function dropsToText(dropped) {
    if (dropped.length === 0) return "";
    return "\n\n🎁 アイテムをドロップ！\n" + dropped.map(i => i.emoji + " " + i.name).join("、");
}

// おみくじ結果が出たときに呼ぶ関数
function unlockCollection(fortune) {
    if (collection[fortune] !== undefined && !collection[fortune]) {
        collection[fortune] = true;
        localStorage.setItem("omikuji_collection", JSON.stringify(collection));
        updateCollectionUI();
    }
}

// 神様にお祈りして3,000円もらう関数（1日3回制限）
function getBonusMoney() {
    unlockAllAudio();
    refreshPrayDay();

    if (prayCount >= 3) {
        alert("🙅 神様「欲張ってはならぬ。本日の救済はこれでおしまいじゃ。」\n(また明日お祈りできるようになります)");
        return;
    }

    prayCount++;

    currentMoney += 3000;
    updateMoneyDisplay();

    playSE("se-coin");

    const bonusArea = document.querySelector("#bonus-area");
    if (bonusArea) bonusArea.style.display = "none";

    saveUserState();

    alert("🙏 神様が哀れんで 3,000円 を授けてくれました！\n(今日のお祈り： " + prayCount + " / 3回)");
}

// 所持金が足りなくなった時の破産チェック関数
function checkBankruptcy() {
    const bonusArea = document.querySelector("#bonus-area");
    const bonusBtn = document.querySelector("#bonusBtn");
    refreshPrayDay();

    if (currentMoney < 1000) {
        if (bonusArea) bonusArea.style.display = "block";

        if (prayCount >= 3) {
            // alertでユーザーに通知し、OKを押した後に遷移する
            alert("💸【ゲームオーバー】💸\nお財布が空っぽになり、本日の神様の救済も使い切りました。\nトップページに戻ります。");

            // ファイル名が正しいか必ず確認してください
            window.location.href = "top.html";
        } else {
            // お祈り回数が残っている場合はそのまま留まる
            if (bonusBtn) {
                bonusBtn.disabled = false;
                bonusBtn.innerHTML = "🙏 神様にお祈りして3,000円貰う(残り" + (3 - prayCount) + "回)";
                bonusBtn.style.backgroundColor = "#5bc0de";
            }
            alert("💸【破産寸前！】💸\nおみくじを引くお金がなくなりました。\n神様にお祈りするか、トップページに戻ってください。");
        }
    } else {
        if (bonusArea) bonusArea.style.display = "none";
    }
}

// スマホの音声ミュート制限をまとめて解除する関数
function unlockAllAudio() {
    const ids = ["se-coin", "se-shuffle", "se-win", "se-lose", "se-doom"];
    ids.forEach(id => {
        const audio = document.querySelector("#" + id);
        if (audio) {
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
            }).catch(() => {});
        }
    });
}

// 効果音を最初から再生する関数
function playSE(id) {
    const audio = document.querySelector("#" + id);
    if (audio) {
        try {
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => { console.log(e); });
            }
        } catch (error) { console.log(error); }
    }
}

// シャッフル音（ループ再生）
function startShuffleSE() {
    const audio = document.querySelector("#se-shuffle");
    if (audio) {
        audio.currentTime = 0;
        audio.loop = true;
        audio.play().catch(e => {});
    }
}

function stopShuffleSE() {
    const audio = document.querySelector("#se-shuffle");
    if (audio) { audio.pause(); }
}

// 大吉用の紙吹雪演出
function startConfetti() {
    const overlay = document.querySelector("#confetti-overlay");
    if (!overlay) return;
    const colors = ["#f44336", "#e91e63", "#9c27b0", "#2196f3", "#4caf50", "#ffeb3b", "#ff9800", "#fff"];

    for (let i = 0; i < 80; i++) {
        const piece = document.createElement("div");
        piece.classList.add("confetti-piece");
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (Math.random() * 2 + 2) + "s";
        piece.style.animationDelay = Math.random() * 1 + "s";
        overlay.appendChild(piece);
        setTimeout(() => { piece.remove(); }, 5000);
    }
}

// 大凶用の画面赤フラッシュ・画面揺れ演出
function startDoomEffect() {
    const overlay = document.querySelector("#doom-overlay");
    if (overlay) overlay.style.opacity = "1";
    document.body.classList.add("doom-shake");
}

function stopDoomEffect() {
    const overlay = document.querySelector("#doom-overlay");
    if (overlay) overlay.style.opacity = "0";
    document.body.classList.remove("doom-shake");
}

// ゾロ目かどうか判定してボーナスを出す関数 (下4桁が同じ数字かチェック)
function checkZoromeBonus(num) {
    const str = num.toFixed(4);
    const lastFour = str.split(".")[1];

    if (lastFour[0] === lastFour[1] && lastFour[1] === lastFour[2] && lastFour[2] === lastFour[3]) {
        // 🌟ラッキーアイテム「流れ星のかけら」でゾロ目ボーナスが+2,000円
        const bonusAmount = hasEffect("zorome_up") ? 7000 : 5000;

        currentMoney += bonusAmount;
        updateMoneyDisplay();

        playSE("se-win");
        recordHistory("🌟ゾロ目ボーナス", bonusAmount, currentMoney);
        saveUserState();

        setTimeout(() => {
            alert("🌟【ゾロ目大吉ボーナス！】🌟\n奇跡が起きました！乱数の下4桁が「" + lastFour + "」のゾロ目です！\n神様から御祝儀として【" + bonusAmount.toLocaleString() + "円】が支給されました！");
        }, 600);
    }
}

// 通常おみくじ（1回引き）のメイン処理
function omikuji() {

    unlockAllAudio();

    const imgElement = document.querySelector("#fortune-image");
    const placeholder = document.querySelector("#placeholder-text");
    const submitBtn = document.querySelector("#submitBtn");
    const drawBtn = document.querySelector(".btn-draw");
    const hiddenResult = document.querySelector("#hiddenResult");
    const randomNumSpan = document.querySelector("#randomNumber");

    if (currentMoney < 1000) {
        alert("🙅 料金が足りません！\n神様にお祈りして資金を分けてもらいましょう！");
        checkBankruptcy();
        return;
    }

    currentMoney -= 1000;
    updateMoneyDisplay();

    playSE("se-coin");

    if (drawBtn) drawBtn.disabled = true;
    if (submitBtn) submitBtn.disabled = true;

    if (placeholder) placeholder.style.display = "none";
    if (imgElement) {
        imgElement.classList.remove("hidden");
        imgElement.classList.add("shaking");
    }

    startShuffleSE();

    let shuffleCount = 0;
    const shuffleInterval = setInterval(() => {
        if (imgElement) {
            const randomImg = omikujiImages[Math.floor(Math.random() * omikujiImages.length)];
            imgElement.src = randomImg;
        }
        shuffleCount++;

        if (shuffleCount >= 10) {
            clearInterval(shuffleInterval);
            if (imgElement) imgElement.classList.remove("shaking");
            stopShuffleSE();
            determineResult();
        }
    }, 80);

    function determineResult() {
        let okj = Math.random();
        let isFeverActiveThisTurn = false;

        if (feverCount > 0) {
            isFeverActiveThisTurn = true;
            feverCount--;
            if (okj >= 0.90) {
                okj = 0.995;
            }
        }

        // 🍀🐱 大吉運アップ効果（ラッキーアイテム＋ショップの招き猫は加算で重複可）
        let daikichiBonus = 0;
        if (hasEffect("daikichi_up")) daikichiBonus += 0.03;
        if (hasShopEffect("manekineko")) daikichiBonus += 0.05;
        if (daikichiBonus > 0) okj = Math.min(1, okj + daikichiBonus);

        if (randomNumSpan) {
            let feverText = feverCount > 0 ? ` (🔥フィーバー残り: ${feverCount}回)` : " (通常モード)";
            if (isFeverActiveThisTurn && feverCount === 0) feverText = " (🔥フィーバーラスト！)";
            randomNumSpan.innerHTML = okj.toFixed(4) + feverText;
        }

        let resultName = "";
        let imgSrc = "";
        let prizeMoney = 0;

        // 💡【新仕様】大凶の免除・徴収額を計算するためのフラグ
        let isDoomExempted = false; // 出世大凶（免除）になったか
        let actualDoomTax = 0;     // 実際に取られる金額

        if (okj >= 0.99) {
            imgSrc = "omikuji_daikichi.png";
            resultName = "大吉";
            prizeMoney = 100000;
        } else if (okj >= 0.95) {
            imgSrc = "omikuji_kichi.png";
            resultName = "吉";
            prizeMoney = 10000;
        } else if (okj >= 0.85) {
            imgSrc = "omikuji_chuukichi.png";
            resultName = "中吉";
            prizeMoney = 2000;
        } else if (okj >= 0.7) {
            imgSrc = "omikuji_syoukichi.png";
            resultName = "小吉";
            prizeMoney = 1000;
        } else if (okj >= 0.6) {
            imgSrc = "omikuji_suekichi.png";
            resultName = "末吉";
            prizeMoney = 500;
        } else if (okj >= 0.1) {
            imgSrc = "omikuji_kyou.png";
            resultName = "凶";
            prizeMoney = 0;
        } else {
            imgSrc = "omikuji_daikyou.png";
            resultName = "大凶";

            // 🪙装備中なら「黄金の小判」で確定免除
            if (equippedCollectible === "koban") {
                isDoomExempted = true;
                actualDoomTax = 0;
            } else if (Math.random() < 0.2) {
                // 💡 20%の確率(Math.random() < 0.2)で「出世大凶（お祓い料免除）」
                isDoomExempted = true;
                actualDoomTax = 0;
            } else {
                // 💡 免除されなかったら、現在のお財布の「半分（50%）」を計算（端数切り捨て）
                actualDoomTax = Math.floor(currentMoney * 0.5);

                // 🐍🔔 お祓い料軽減効果（ラッキーアイテム＋ショップの鈴は重複で半額×半額）
                if (hasEffect("tax_half")) actualDoomTax = Math.floor(actualDoomTax / 2);
                if (hasShopEffect("suzu")) actualDoomTax = Math.floor(actualDoomTax / 2);
            }
            prizeMoney = -actualDoomTax; // マイナスとして計算
        }

        // 🐟📜 獲得賞金アップ効果（ラッキーアイテム＋ショップの護符は掛け算で重複可）
        if (prizeMoney > 0) {
            let prizeMultiplier = 1;
            if (hasEffect("prize_up")) prizeMultiplier *= 1.1;
            if (hasShopEffect("gofu")) prizeMultiplier *= 1.1;
            if (prizeMultiplier > 1) prizeMoney = Math.floor(prizeMoney * prizeMultiplier);
        }

        if (imgElement) imgElement.src = imgSrc;
        if (hiddenResult) hiddenResult.value = resultName;

        currentMoney += prizeMoney;
        updateMoneyDisplay();

        // 🛍️ ショップアイテムの残り回数を消費
        if (shopItemKey && shopItemRemaining > 0) {
            shopItemRemaining--;
            if (shopItemRemaining <= 0) {
                shopItemKey = "";
                shopItemRemaining = 0;
            }
            updateShopUI();
        }

        // 🎒 収集アイテムのドロップ判定
        const dropped = rollDrops();
        updateShopUI();

        recordHistory(resultName, prizeMoney, currentMoney);
        saveUserState();

        if (drawBtn) drawBtn.disabled = false;
        if (submitBtn) submitBtn.disabled = false;

        if (resultName === "大吉" || resultName === "吉" || resultName === "中吉") {
            playSE("se-win");
            if (resultName === "大吉") startConfetti();
        } else if (resultName === "凶") {
            playSE("se-lose");
        } else if (resultName === "大凶") {
            playSE("se-doom");
            startDoomEffect();
            // 🔔🌳 フィーバー回数+1効果（ラッキーアイテム or 神社の神木装備）
            feverCount = 3;
            if (hasEffect("fever_extra")) feverCount++;
            if (equippedCollectible === "shinboku") feverCount++;
        }

        setTimeout(() => {
            if (resultName === "大吉") {
                alert("🎉 おめでとうございます！【大吉】です！ 🎉\nなんと最高額の 100,000円 が当選しました！" + dropsToText(dropped));
            } else if (resultName === "吉") {
                alert("✨ やりました！【吉】です！ ✨\nみごと 10,000円 が当選しました！" + dropsToText(dropped));
            } else if (resultName === "中吉") {
                alert("♫ いいですね！【中吉】です！ ♫\n2,000円 が当選しました！" + dropsToText(dropped));
            } else if (resultName === "小吉") {
                alert("👍 堅実！【小吉】です！ 👍\n1,000円 が当選しました！(元取れた！)" + dropsToText(dropped));
            } else if (resultName === "末吉") {
                alert("😄 ちょっぴりお小遣い！【末吉】です！ 😄\n500円 が当選しました！" + dropsToText(dropped));
            } else if (resultName === "凶") {
                alert("😢残念！【凶】です！ 😢\n景品はありません。はずれです！" + dropsToText(dropped));
            } else if (resultName === "大凶") {
                if (isDoomExempted) {
                    alert(
                        "😱【大凶】を引いてしまった…が！？\n\n🌟「出世大凶」発動！🌟\n神様「今回は特別にお祓い料（免除）にしてしんぜよう！」\nお祓い料はなんと【0円】です！\n\n🔥さらに！災い転じて福となす！次の単発おみくじ" + feverCount + "回分は【大吉の確率が10倍(10%)】になります！" + dropsToText(dropped)
                    );
                } else {
                    alert(
                        "😱 大凶を引いてしまいました…！ 😱\nお祓い料として、お財布の半額【" + actualDoomTax.toLocaleString() + "円】を徴収いたします。\n\n🔥しかし！災い転じて福となす！次の単発おみくじ" + feverCount + "回分は【大吉の確率が10倍(10%)】に跳ね上がります！" + dropsToText(dropped)
                    );
                }
                stopDoomEffect();
            }

            checkZoromeBonus(okj);
            checkBankruptcy();
        }, 200);
    }
}

// 10連おみくじ処理
function omikuji10() {
    unlockAllAudio();

    const imgElement = document.querySelector("#fortune-image");
    const placeholder = document.querySelector("#placeholder-text");
    const submitBtn = document.querySelector("#submitBtn");
    const drawBtn = document.querySelector(".btn-draw");
    const draw10Btn = document.querySelector("#draw10Btn");
    const randomNumSpan = document.querySelector("#randomNumber");

    if (currentMoney < 10000) {
        alert("🙅 資金が足りません！\n10連おみくじを引くには【10,000円】必要です。");
        return;
    }

    currentMoney -= 10000;
    updateMoneyDisplay();

    playSE("se-coin");

    if (drawBtn) drawBtn.disabled = true;
    if (draw10Btn) draw10Btn.disabled = true;
    if (submitBtn) submitBtn.disabled = true;

    if (placeholder) placeholder.style.display = "none";
    if (imgElement) {
        imgElement.classList.remove("hidden");
        imgElement.classList.add("shaking");
    }

    startShuffleSE();

    let resultsCount = {"大吉": 0, "吉": 0, "中吉": 0, "小吉": 0, "末吉": 0, "凶": 0, "大凶": 0};
    let totalPrize = 0;
    let lastRandomNum = 0;
    let gotDaikyouIn10 = false;
    let totalDoomTax = 0; // 💡10連の中で取られた大凶お祓い料の合計
    let exemptedCount = 0; // 💡10連の中で免除された大凶の数
    let allDropped = []; // 10連まとめてのドロップ一覧

    let shuffleCount = 0;
    const shuffleInterval = setInterval(() => {
        if (imgElement) {
            const randomImg = omikujiImages[Math.floor(Math.random() * omikujiImages.length)];
            imgElement.src = randomImg;
        }
        shuffleCount++;

        if (shuffleCount >= 15) {
            clearInterval(shuffleInterval);
            if (imgElement) imgElement.classList.remove("shaking");
            stopShuffleSE();

            for (let i = 0; i < 10; i++) {
                let okj = Math.random();

                // 🍀🐱 大吉運アップ効果
                let daikichiBonus = 0;
                if (hasEffect("daikichi_up")) daikichiBonus += 0.03;
                if (hasShopEffect("manekineko")) daikichiBonus += 0.05;
                if (daikichiBonus > 0) okj = Math.min(1, okj + daikichiBonus);

                if (i === 9) lastRandomNum = okj;

                let prize = 0;

                if (okj >= 0.99) {
                    resultsCount["大吉"]++;
                    prize = 100000;
                } else if (okj >= 0.95) {
                    resultsCount["吉"]++;
                    prize = 10000;
                } else if (okj >= 0.85) {
                    resultsCount["中吉"]++;
                    prize = 2000;
                } else if (okj >= 0.7) {
                    resultsCount["小吉"]++;
                    prize = 1000;
                } else if (okj >= 0.6) {
                    resultsCount["末吉"]++;
                    prize = 500;
                } else if (okj >= 0.1) {
                    resultsCount["凶"]++;
                    prize = 0;
                } else {
                    resultsCount["大凶"]++;
                    gotDaikyouIn10 = true;

                    // 🪙装備中なら「黄金の小判」で確定免除
                    if (equippedCollectible === "koban") {
                        exemptedCount++;
                    } else if (Math.random() < 0.2) {
                        exemptedCount++; // 免除！
                    } else {
                        // 半分持っていかれる（連続で大凶が出ると、その都度残り金額の半分が減っていきます）
                        let tax = Math.floor((currentMoney + totalPrize) * 0.5);

                        // 🐍🔔 お祓い料軽減効果
                        if (hasEffect("tax_half")) tax = Math.floor(tax / 2);
                        if (hasShopEffect("suzu")) tax = Math.floor(tax / 2);

                        totalDoomTax += tax;
                        prize = -tax;
                    }
                }

                // 🐟📜 獲得賞金アップ効果
                if (prize > 0) {
                    let prizeMultiplier = 1;
                    if (hasEffect("prize_up")) prizeMultiplier *= 1.1;
                    if (hasShopEffect("gofu")) prizeMultiplier *= 1.1;
                    if (prizeMultiplier > 1) prize = Math.floor(prize * prizeMultiplier);
                }

                // 🛍️ ショップアイテムの残り回数を消費（1回引くごとに1消費）
                if (shopItemKey && shopItemRemaining > 0) {
                    shopItemRemaining--;
                    if (shopItemRemaining <= 0) {
                        shopItemKey = "";
                        shopItemRemaining = 0;
                    }
                }

                // 🎒 収集アイテムのドロップ判定
                allDropped = allDropped.concat(rollDrops());

                totalPrize += prize;
                checkZoromeBonus(okj);
            }

            if (gotDaikyouIn10) {
                // 🔔🌳 フィーバー回数+1効果
                feverCount = 3;
                if (hasEffect("fever_extra")) feverCount++;
                if (equippedCollectible === "shinboku") feverCount++;
            }

            if (randomNumSpan) {
                let feverText = feverCount > 0 ? ` (🔥フィーバーチャージ完了:残り ${feverCount}回)` : " (通常モード)";
                randomNumSpan.innerHTML = lastRandomNum.toFixed(4) + feverText;
            }

            if (imgElement) {
                const lastRandomImg = omikujiImages[Math.floor(Math.random() * omikujiImages.length)];
                imgElement.src = lastRandomImg;
            }

            currentMoney += totalPrize;
            updateMoneyDisplay();
            updateShopUI();

            // 10連の内訳を1件の履歴としてまとめて記録（0回だったものは表示しない）
            const breakdown = Object.entries(resultsCount)
                .filter(([, count]) => count > 0)
                .map(([name, count]) => name + "×" + count)
                .join("、");
            recordHistory("10連（" + breakdown + "）", totalPrize, currentMoney);

            saveUserState();

            if (drawBtn) drawBtn.disabled = false;
            if (draw10Btn) draw10Btn.disabled = false;
            if (submitBtn) submitBtn.disabled = false;

            if (totalPrize > 0) {
                playSE("se-win");
            } else if (totalPrize < 0) {
                if (resultsCount["大凶"] > 0) {
                    playSE("se-doom");
                } else {
                    playSE("se-lose");
                }
            }

            if (resultsCount["大吉"] > 0) startConfetti();
            if (resultsCount["大凶"] > 0) startDoomEffect();

            setTimeout(() => {
                let alertMsg =
                    "🔥【10連おみくじ結果発表】🔥\n" +
                    "--------------------------------\n" +
                    "🎉 大吉： " + resultsCount["大吉"] + "回\n" +
                    "✨ 吉 ： " + resultsCount["吉"] + "回\n" +
                    "🎵 中吉： " + resultsCount["中吉"] + "回\n" +
                    "👍 小吉： " + resultsCount["小吉"] + "回\n" +
                    "😄 末吉： " + resultsCount["末吉"] + "回\n" +
                    "😢 凶 ： " + resultsCount["凶"] + "回\n" +
                    "😱 大凶： " + resultsCount["大凶"] + "回\n" +
                    "--------------------------------\n";

                if (totalDoomTax > 0) {
                    alertMsg += "💸 大凶お祓い料(合計)：-" + totalDoomTax.toLocaleString() + "円\n";
                }
                if (exemptedCount > 0) {
                    alertMsg += "🌟 出世大凶(免除)：" + exemptedCount + "回発生！(セーフ！)\n";
                }

                alertMsg += "💰 合計損益：" + totalPrize.toLocaleString() + "円！";

                if (gotDaikyouIn10) {
                    alertMsg += "\n\n🔥【厄落としフィーバー発動！】🔥\n大凶が含まれていたため、次の単発おみくじ" + feverCount + "回は【大吉確率10倍(10%)】になります！";
                }

                // まとめてドロップしたアイテムを個数集計して表示
                if (allDropped.length > 0) {
                    const tally = {};
                    allDropped.forEach(item => {
                        tally[item.key] = (tally[item.key] || 0) + 1;
                    });
                    const dropText = DROP_ITEMS
                        .filter(item => tally[item.key])
                        .map(item => item.emoji + " " + item.name + "×" + tally[item.key])
                        .join("、");
                    alertMsg += "\n\n🎁 今回のドロップ：\n" + dropText;
                }

                alert(alertMsg);
                stopDoomEffect();
                checkBankruptcy();
            }, 200);
        }
    }, 80);
}

// 画面が開いた瞬間に、ログイン確認とユーザーごとのデータ読み込みを行う
window.addEventListener("DOMContentLoaded", async () => {
    currentUser = localStorage.getItem("logged_in_user");

    if (!currentUser) {
        // 未ログインの場合はログインページへ
        window.location.href = "index.html";
        return;
    }

    const userDisplay = document.querySelector("#user-display");
    if (userDisplay) userDisplay.innerHTML = currentUser;

    const luckyBox = document.querySelector("#lucky-item-box");
    const luckyName = document.querySelector("#lucky-item-name");
    const luckyDesc = document.querySelector("#lucky-item-desc");
    const drawBtn = document.querySelector(".btn-draw");
    const draw10Btn = document.querySelector("#draw10Btn");

    // Firestoreからのデータ取得が終わるまで、おみくじボタンを一旦ロックしておく
    if (drawBtn) drawBtn.disabled = true;
    if (draw10Btn) draw10Btn.disabled = true;

    try {
        // omikuji2.html内のFirebase初期化(モジュール)が終わるのを少し待つ
        let tries = 0;
        while ((!window.omikujiDB || !window.omikujiDoc || !window.omikujiGetDoc) && tries < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            tries++;
        }

        const userRef = window.omikujiDoc(window.omikujiDB, "users", currentUser);
        const snap = await window.omikujiGetDoc(userRef);

        if (snap.exists()) {
            const data = snap.data();
            currentMoney = typeof data.money === "number" ? data.money : 10000;
            feverCount = typeof data.feverCount === "number" ? data.feverCount : 0;
            prayDate = data.prayDate || "";
            prayCount = typeof data.prayCount === "number" ? data.prayCount : 0;
            luckyItemKey = data.luckyItem || "";
            ownedItems = Object.assign({ koban: 0, shinboku: 0, ishikoro: 0 }, data.ownedItems || {});
            equippedCollectible = data.equippedCollectible || "";
            shopItemKey = data.shopItemKey || "";
            shopItemRemaining = typeof data.shopItemRemaining === "number" ? data.shopItemRemaining : 0;
        }

        updateMoneyDisplay();

        const picked = LUCKY_ITEMS.find(i => i.key === luckyItemKey);
        if (picked && luckyBox) {
            luckyBox.classList.remove("hidden");
            if (luckyName) luckyName.textContent = picked.emoji + " " + picked.name;
            if (luckyDesc) luckyDesc.textContent = picked.desc;
        }

        checkBankruptcy();
    } catch (e) {
        console.error("ユーザーデータの読み込みに失敗しました: ", e);
    } finally {
        if (drawBtn) drawBtn.disabled = false;
        if (draw10Btn) draw10Btn.disabled = false;
    }

    const randomNumSpan = document.querySelector("#randomNumber");
    if (randomNumSpan) {
        randomNumSpan.innerHTML = "まだ引いていません (通常モード)";
    }
});

// 「結果を送信する」ボタンから呼ばれる関数
// たまった履歴（historyBuffer）をFirebaseに書き込んでからtop.htmlへ移動する
async function submitResults() {
    const submitBtn = document.querySelector("#submitBtn");
    const userName = currentUser || localStorage.getItem("logged_in_user") || "名無しの参拝者";

    if (historyBuffer.length === 0) {
        alert("🙅 まだおみくじを引いていません！\nまずはおみくじを引いてから送信してください。");
        return;
    }

    if (!window.omikujiDB || !window.omikujiAddDoc || !window.omikujiCollectionRef) {
        alert("⚠️ データベースへの接続準備ができていません。少し待ってからもう一度お試しください。");
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "送信中…";
    }

    try {
        for (const entry of historyBuffer) {
            await window.omikujiAddDoc(window.omikujiCollectionRef, {
                name: userName,
                date: entry.date,
                result: entry.result,
                prize: entry.prize,
                balance: entry.balance,
                timestamp: entry.timestamp
            });
        }

        historyBuffer = [];
        await saveUserState();
        window.location.href = "top.html";
    } catch (e) {
        console.error("Firebaseへの送信に失敗しました: ", e);
        alert("❌ 結果の送信に失敗しました。通信環境をご確認の上、もう一度お試しください。");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "結果を送信する";
        }
    }
}
