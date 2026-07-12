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
    { key: "manekineko", emoji: "🐱", name: "開運招き猫", price: 10000, duration: 5, desc: "大吉確率が一時的にアップ！", minRank: 0 },
    { key: "gofu", emoji: "📜", name: "金運の護符", price: 5000, duration: 5, desc: "獲得賞金が1.1倍に！", minRank: 0 },
    { key: "suzu", emoji: "🔔", name: "破邪の鈴", price: 3000, duration: 5, desc: "大凶時の没収額が軽減される！", minRank: 0 },
    { key: "oogi", emoji: "🪭", name: "招福の扇", price: 15000, duration: 5, desc: "獲得賞金が1.15倍に！（護符より強力）", minRank: 1 },
    { key: "gohei", emoji: "🎏", name: "五色の幣", price: 25000, duration: 5, desc: "大吉確率が大きくアップ！（招き猫より強力）", minRank: 2 },
    { key: "ryujin", emoji: "🐉", name: "龍神の逆鱗", price: 50000, duration: 3, desc: "「神の試練」が確認なしで自動的に成功する！", minRank: 3 }
];

// 🎒 おみくじを引くと低確率で手に入る収集アイテム（ドロップ率は独立判定）
const DROP_ITEMS = [
    { key: "koban", emoji: "🪙", name: "黄金の小判", rate: 0.02, desc: "装備中、大凶（神の試練）が確定で勝利／免除になる" },
    { key: "shinboku", emoji: "🌳", name: "神社の神木", rate: 0.03, desc: "装備中、大凶（神の試練）時のフィーバー回数が+1回になる" },
    { key: "ishikoro", emoji: "🪨", name: "謎の石ころ", rate: 0.10, desc: "特に効果はないが、100個集めると…？(近日実装)" }
];

// 🏺 おみくじの壺のランクアップ（永続的に大吉ボーナスが増える・所持金で購入）
const URN_LEVELS = [
    { level: 0, name: "普通の壺", cost: 0, bonus: 0 },
    { level: 1, name: "上質な壺", cost: 20000, bonus: 0.005 },
    { level: 2, name: "銀の壺", cost: 40000, bonus: 0.01 },
    { level: 3, name: "金の壺", cost: 80000, bonus: 0.015 },
    { level: 4, name: "神代の壺", cost: 150000, bonus: 0.02 },
    { level: 5, name: "伝説の壺", cost: 300000, bonus: 0.03 }
];

// 📖 図鑑（これまでに引いた結果を記録するコレクション。7種類すべて達成で永続ボーナス）
const DEX_ENTRIES = [
    { key: "daikichi", emoji: "🎉", name: "大吉", match: r => r === "大吉" },
    { key: "kichi", emoji: "✨", name: "吉", match: r => r === "吉" },
    { key: "chuukichi", emoji: "🎵", name: "中吉", match: r => r === "中吉" },
    { key: "syoukichi", emoji: "👍", name: "小吉", match: r => r === "小吉" },
    { key: "suekichi", emoji: "😄", name: "末吉", match: r => r === "末吉" },
    { key: "kyou", emoji: "😢", name: "凶", match: r => r === "凶" },
    { key: "daikyou", emoji: "⚔️", name: "大凶(神の試練)", match: r => r.startsWith("神の試練") || r === "大凶" }
];

// 🏘️ 神社改築（コミュニティ目標）の段階（全ユーザー合計の参拝回数で判定）
const COMMUNITY_TIERS = [
    { tier: 0, threshold: 0, name: "いつもの境内" },
    { tier: 1, threshold: 1000, name: "少し賑わう境内（金色の輝き）" },
    { tier: 2, threshold: 5000, name: "大改築された境内（🎊福だるま登場！）" }
];

// 🎊 神社改築レベル2で解放される「福だるま」ボーナス枠
const FUKU_DARUMA_RATE = 0.05;
const FUKU_DARUMA_PRIZE = 3000;

// ⛩️ 参拝ランク（累計獲得賞金額で判定。ランクが上がるとショップの品揃えが増える）
const VISITOR_RANKS = [
    { tier: 0, name: "平参拝者", threshold: 0 },
    { tier: 1, name: "常連客", threshold: 50000 },
    { tier: 2, name: "氏子", threshold: 300000 },
    { tier: 3, name: "神の寵愛者", threshold: 1500000 }
];

// 🎊 隠し要素（イースターエッグ）関連の設定
const STRAIGHT_BONUS_PRIZE = 8000;
const KIMAGURE_BONUS_PRIZE = 10000;
const KIMAGURE_TIMES = ["01:01", "03:33", "04:44", "05:55", "11:11", "12:12", "22:22", "23:23"];
const LUCKY_MONEY_PATTERNS = [777, 7777, 77777, 777777, 888, 8888, 88888, 888888, 1234, 12345, 123456, 111111, 222222, 333333, 555555, 999999];
let kimagureLastTrigger = ""; // 同じ分に何度も発生しないようにするための記録（セッション内のみ・保存はしない）

// 🎖️ 称号（達成条件を満たすと自動的に付与される。プレイヤーの各種累計値で判定）
const TITLES = [
    { key: "hyakuman", emoji: "💰", name: "百万長者", desc: "累計収支+1,000,000円を達成", condition: s => s.totalProfit >= 1000000 },
    { key: "juman", emoji: "💴", name: "実は儲かってる人", desc: "累計収支+100,000円を達成", condition: s => s.totalProfit >= 100000 },
    { key: "daikichi_hunter", emoji: "🎯", name: "大吉ハンター", desc: "大吉を合計10回引いた", condition: s => s.totalDaikichi >= 10 },
    { key: "daikichi_master", emoji: "🏹", name: "大吉マスター", desc: "大吉を合計30回引いた", condition: s => s.totalDaikichi >= 30 },
    { key: "veteran", emoji: "⛩️", name: "生き字引", desc: "累計参拝回数500回を達成", condition: s => s.totalDraws >= 500 },
    { key: "regular", emoji: "🙏", name: "常連参拝者", desc: "累計参拝回数100回を達成", condition: s => s.totalDraws >= 100 },
    { key: "first_visit", emoji: "🔰", name: "初参拝", desc: "はじめての参拝を達成", condition: s => s.totalDraws >= 1 },
    { key: "urn_master", emoji: "🏺", name: "壺のマイスター", desc: "おみくじの壺を最大までランクアップ", condition: s => s.urnLevel >= URN_LEVELS.length - 1 },
    { key: "stone_collector", emoji: "🪨", name: "石ころコレクター", desc: "謎の石ころを100個集めた", condition: s => (s.ownedItems && s.ownedItems.ishikoro || 0) >= 100 },
    { key: "dex_complete", emoji: "📖", name: "図鑑コンプリート", desc: "大吉〜大凶(神の試練)まで全種類を達成", condition: s => s.dexRewardClaimed === true }
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

let totalDraws = 0;       // 累計参拝（おみくじを引いた）回数
let totalDaikichi = 0;    // 累計「大吉」獲得回数
let totalProfit = 0;      // 累計収支（参加料込みの実質損益）
let totalWinnings = 0;    // 累計獲得賞金額（プラスの当選金のみの合計。参拝ランク判定に使用）
let urnLevel = 0;         // おみくじの壺のランクアップ段階

let taianActive = false;  // 本日が「大安吉日」かどうか（ログイン時に個人ごとに抽選済み）
let bankMoney = 0;        // 賽銭箱（貯金）の残高。おみくじには使えないが大凶等のリスクからは守られる
let dexAchieved = { daikichi: false, kichi: false, chuukichi: false, syoukichi: false, suekichi: false, kyou: false, daikyou: false }; // 図鑑の達成状況
let dexRewardClaimed = false; // 図鑑コンプリート報酬をすでに受け取ったか
let communityDraws = 0;   // 全ユーザー合計の参拝回数（神社改築コミュニティ目標）

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
            shopItemRemaining: shopItemRemaining,
            totalDraws: totalDraws,
            totalDaikichi: totalDaikichi,
            totalProfit: totalProfit,
            totalWinnings: totalWinnings,
            urnLevel: urnLevel,
            bankMoney: bankMoney,
            dexAchieved: dexAchieved,
            dexRewardClaimed: dexRewardClaimed
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
    const dexTab = document.querySelector("#tab-dex");
    const prizeBtn = document.querySelector("#tabBtn-prizes");
    const shopBtn = document.querySelector("#tabBtn-shop");
    const dexBtn = document.querySelector("#tabBtn-dex");

    const tabs = [
        { name: "prizes", el: prizeTab, btn: prizeBtn },
        { name: "shop", el: shopTab, btn: shopBtn },
        { name: "dex", el: dexTab, btn: dexBtn }
    ];

    tabs.forEach(t => {
        if (!t.el) return;
        if (t.name === tabName) {
            t.el.classList.remove("hidden");
            if (t.btn) t.btn.classList.add("tab-active");
        } else {
            t.el.classList.add("hidden");
            if (t.btn) t.btn.classList.remove("tab-active");
        }
    });
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
// 装備中の収集アイテムを1個消費する。無くなったら自動的に装備を外す
function consumeCollectible(key) {
    if (!(ownedItems[key] > 0)) return;
    ownedItems[key]--;
    if (ownedItems[key] <= 0) {
        ownedItems[key] = 0;
        if (equippedCollectible === key) {
            equippedCollectible = "";
        }
    }
    updateShopUI();
}

async function equipCollectible(key) {
    // すでに装備中のアイテムをクリックした場合は「外す」動作にする
    if (key && equippedCollectible === key) {
        equippedCollectible = "";
        updateShopUI();
        await saveUserState();
        alert("🎒 装備を外しました。");
        return;
    }

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
    const rank = getVisitorRank(totalWinnings);

    SHOP_ITEMS.forEach(item => {
        const card = document.querySelector('.shop-item-card[data-key="' + item.key + '"]');
        if (!card) return;

        const btn = card.querySelector(".btn-shop-buy");
        const lockOverlay = card.querySelector(".shop-item-lock");
        const isLocked = rank < item.minRank;

        if (isLocked) {
            card.classList.add("shop-item-locked");
            if (btn) btn.disabled = true;
            if (lockOverlay) {
                lockOverlay.textContent = "🔒 参拝ランク「" + VISITOR_RANKS[item.minRank].name + "」で解放";
                lockOverlay.classList.remove("hidden");
            }
        } else {
            card.classList.remove("shop-item-locked");
            if (btn) btn.disabled = currentMoney < item.price;
            if (lockOverlay) lockOverlay.classList.add("hidden");
        }

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
    if (equipBtnKoban) {
        if (equippedCollectible === "koban") {
            equipBtnKoban.textContent = "装備を外す";
            equipBtnKoban.disabled = false;
        } else {
            equipBtnKoban.textContent = "装備する";
            equipBtnKoban.disabled = !(ownedItems.koban > 0);
        }
    }

    const equipBtnShinboku = document.querySelector("#equipBtn-shinboku");
    if (equipBtnShinboku) {
        if (equippedCollectible === "shinboku") {
            equipBtnShinboku.textContent = "装備を外す";
            equipBtnShinboku.disabled = false;
        } else {
            equipBtnShinboku.textContent = "装備する";
            equipBtnShinboku.disabled = !(ownedItems.shinboku > 0);
        }
    }

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
    updateUrnUI();
    updateRankUI();
}

// 🏺 壺のランクアップ欄の表示を更新する
function updateUrnUI() {
    const current = URN_LEVELS[urnLevel];
    const next = URN_LEVELS[urnLevel + 1];

    const currentText = document.querySelector("#urn-current-text");
    if (currentText) {
        currentText.textContent = "現在の壺：" + current.name + "（大吉ボーナス +" + (current.bonus * 100).toFixed(1) + "%）";
    }

    const nextBox = document.querySelector("#urn-next-box");
    const nextText = document.querySelector("#urn-next-text");
    const upgradeBtn = document.querySelector("#urn-upgrade-btn");

    if (!next) {
        if (nextText) nextText.textContent = "🏆 壺は最大までランクアップ済みです！";
        if (upgradeBtn) upgradeBtn.classList.add("hidden");
        return;
    }

    if (nextBox) nextBox.classList.remove("hidden");
    if (nextText) {
        nextText.textContent = "次の壺：" + next.name + "（" + next.cost.toLocaleString() + "円、大吉ボーナス+" + (next.bonus * 100).toFixed(1) + "%）";
    }
    if (upgradeBtn) {
        upgradeBtn.classList.remove("hidden");
        upgradeBtn.disabled = currentMoney < next.cost;
    }
}

// 壺をランクアップする
async function upgradeUrn() {
    const next = URN_LEVELS[urnLevel + 1];
    if (!next) {
        alert("🏺 壺はすでに最大までランクアップ済みです！");
        return;
    }
    if (currentMoney < next.cost) {
        alert("🙅 所持金が足りません！\n「" + next.name + "」へのランクアップには" + next.cost.toLocaleString() + "円必要です。");
        return;
    }

    currentMoney -= next.cost;
    urnLevel++;

    updateMoneyDisplay();
    playSE("se-coin");
    await saveUserState();
    updateTitlesUI();

    alert("🏺 壺が「" + next.name + "」にランクアップしました！\n大吉ボーナスが永続的に+" + (next.bonus * 100).toFixed(1) + "%になりました！");
}

// ⛩️ 累計獲得賞金額から参拝ランクのティア番号を返す
function getVisitorRank(winnings) {
    let tier = 0;
    VISITOR_RANKS.forEach(r => { if (winnings >= r.threshold) tier = r.tier; });
    return tier;
}

// ⛩️ 参拝ランクの表示を更新する
function updateRankUI() {
    const rank = getVisitorRank(totalWinnings);
    const current = VISITOR_RANKS[rank];
    const next = VISITOR_RANKS[rank + 1];

    const rankNameEl = document.querySelector("#rank-name-display");
    if (rankNameEl) rankNameEl.textContent = "⛩️ 参拝ランク：" + current.name;

    const rankProgressEl = document.querySelector("#rank-progress-display");
    if (rankProgressEl) {
        if (next) {
            rankProgressEl.textContent =
                "累計獲得賞金：" + totalWinnings.toLocaleString() + "円（次の「" + next.name + "」まであと" +
                (next.threshold - totalWinnings).toLocaleString() + "円）";
        } else {
            rankProgressEl.textContent = "累計獲得賞金：" + totalWinnings.toLocaleString() + "円（最高ランクです！）";
        }
    }
}

// 🎖️ 称号バッジの表示を更新する
function updateTitlesUI() {
    const box = document.querySelector("#titles-box");
    const list = document.querySelector("#titles-list");
    if (!box || !list) return;

    const stats = { totalDraws, totalDaikichi, totalProfit, urnLevel, ownedItems };
    const earned = TITLES.filter(t => t.condition(stats));

    if (earned.length === 0) {
        box.classList.add("hidden");
        list.innerHTML = "";
        return;
    }

    box.classList.remove("hidden");
    list.innerHTML = earned.map(t =>
        '<span class="title-badge" title="' + t.desc.replace(/"/g, "&quot;") + '">' + t.emoji + " " + t.name + "</span>"
    ).join("");
}

// 📖 図鑑タブの表示を更新する
function updateDexUI() {
    const grid = document.querySelector("#dex-grid");
    if (grid) {
        grid.innerHTML = DEX_ENTRIES.map(entry => {
            const achieved = !!dexAchieved[entry.key];
            return (
                '<div class="dex-slot ' + (achieved ? "dex-achieved" : "dex-locked") + '">' +
                '<div class="dex-emoji">' + (achieved ? entry.emoji : "❓") + '</div>' +
                '<div class="dex-name">' + (achieved ? entry.name : "？？？") + '</div>' +
                '</div>'
            );
        }).join("");
    }

    const progressEl = document.querySelector("#dex-progress");
    const achievedCount = DEX_ENTRIES.filter(e => dexAchieved[e.key]).length;
    if (progressEl) {
        progressEl.textContent = "達成状況：" + achievedCount + " / " + DEX_ENTRIES.length;
    }

    const rewardEl = document.querySelector("#dex-reward-status");
    if (rewardEl) {
        if (dexRewardClaimed) {
            rewardEl.textContent = "🏆 図鑑コンプリート達成済み！（大吉ボーナス永続+1%を授かっています）";
            rewardEl.classList.remove("hidden");
        } else {
            rewardEl.classList.add("hidden");
        }
    }
}

// おみくじの結果を図鑑に記録する。全種類そろったら報酬を授与する
function markDex(resultName) {
    const entry = DEX_ENTRIES.find(e => e.match(resultName));
    if (!entry) return;
    if (!dexAchieved[entry.key]) {
        dexAchieved[entry.key] = true;

        const allDone = DEX_ENTRIES.every(e => dexAchieved[e.key]);
        if (allDone && !dexRewardClaimed) {
            dexRewardClaimed = true;
            setTimeout(() => {
                alert("📖🏆【図鑑コンプリート！】🏆📖\n大吉から大凶(神の試練)まで、すべての結果を集めました！\n神様から御神宝を授かり、大吉ボーナスが永続的に+1%になりました！");
            }, 1000);
        }
    }
    updateDexUI();
}

// 🏦 賽銭箱（貯金）の表示を更新する
function updateBankUI() {
    const bankDisplay = document.querySelector("#bank-money-display");
    if (bankDisplay) bankDisplay.textContent = bankMoney.toLocaleString();
    const bankDisplayTop = document.querySelector("#bank-money-display-top");
    if (bankDisplayTop) bankDisplayTop.textContent = bankMoney.toLocaleString();
}

// 所持金を賽銭箱に預ける
async function depositBank() {
    const input = document.querySelector("#bank-amount-input");
    const amount = input ? parseInt(input.value, 10) : NaN;

    if (!amount || amount <= 0) {
        alert("🙅 預ける金額を正しく入力してください。");
        return;
    }
    if (amount > currentMoney) {
        alert("🙅 所持金が足りません！\n預けられるのは最大" + currentMoney.toLocaleString() + "円です。");
        return;
    }

    currentMoney -= amount;
    bankMoney += amount;
    updateMoneyDisplay();
    updateBankUI();
    if (input) input.value = "";
    playSE("se-coin");
    await saveUserState();
    alert("🏦 " + amount.toLocaleString() + "円を賽銭箱に預けました。\n（このお金はおみくじには使えませんが、大凶や神の試練で失うこともありません）");
}

// 賽銭箱から所持金へ引き出す
async function withdrawBank() {
    const input = document.querySelector("#bank-amount-input");
    const amount = input ? parseInt(input.value, 10) : NaN;

    if (!amount || amount <= 0) {
        alert("🙅 引き出す金額を正しく入力してください。");
        return;
    }
    if (amount > bankMoney) {
        alert("🙅 賽銭箱の残高が足りません！\n引き出せるのは最大" + bankMoney.toLocaleString() + "円です。");
        return;
    }

    bankMoney -= amount;
    currentMoney += amount;
    updateMoneyDisplay();
    updateBankUI();
    if (input) input.value = "";
    playSE("se-coin");
    await saveUserState();
    alert("🏦 賽銭箱から" + amount.toLocaleString() + "円を引き出しました。");
}

// 🏘️ 全ユーザー合計の参拝回数から、神社改築のティア(0/1/2)を返す
function getCommunityTier(draws) {
    let tier = 0;
    COMMUNITY_TIERS.forEach(t => {
        if (draws >= t.threshold) tier = t.tier;
    });
    return tier;
}

// 神社改築の見た目を反映する（背景の演出切り替え）
function applyShrineTierVisual() {
    const container = document.querySelector(".container");
    if (!container) return;
    container.classList.remove("shrine-tier1", "shrine-tier2");

    const tier = getCommunityTier(communityDraws);
    if (tier === 1) container.classList.add("shrine-tier1");
    if (tier === 2) container.classList.add("shrine-tier2");

    const communityBox = document.querySelector("#community-status-box");
    if (communityBox) {
        const current = COMMUNITY_TIERS[tier];
        const next = COMMUNITY_TIERS[tier + 1];
        let text = "🏘️ みんなの参拝合計：" + communityDraws.toLocaleString() + "回（" + current.name + "）";
        if (next) {
            text += "\n次の目標まであと" + (next.threshold - communityDraws).toLocaleString() + "回（" + next.name + "）";
        }
        communityBox.textContent = text;
        communityBox.classList.remove("hidden");
    }
}

// 全ユーザー共有の参拝カウンターを1増やす（神社改築コミュニティ目標用）
async function incrementCommunityDraws() {
    if (!window.omikujiDB || !window.omikujiCommunityRef || !window.omikujiSetDoc || !window.omikujiIncrement) return;
    try {
        await window.omikujiSetDoc(
            window.omikujiCommunityRef,
            { totalDraws: window.omikujiIncrement(1) },
            { merge: true }
        );
        communityDraws++;
        applyShrineTierVisual();
    } catch (e) {
        console.error("コミュニティカウンターの更新に失敗しました: ", e);
    }
}

// 🎊「福だるま」ボーナス抽選の純粋ロジック（金額のみ返す。副作用なし）
function rollFukuDarumaAmount() {
    if (getCommunityTier(communityDraws) < 2) return 0;
    if (Math.random() < FUKU_DARUMA_RATE) return FUKU_DARUMA_PRIZE;
    return 0;
}

// 🎊「福だるま」ボーナス抽選（単発おみくじ用。当選時は所持金反映＆履歴記録まで行う）
function rollFukuDaruma() {
    const amount = rollFukuDarumaAmount();
    if (amount > 0) {
        currentMoney += amount;
        totalWinnings += amount;
        updateMoneyDisplay();
        recordHistory("🎊福だるま", amount, currentMoney);
        return amount;
    }
    return 0;
}
function getShuffleTier() {
    if (totalDraws >= 500) return 2;
    if (totalDraws >= 100) return 1;
    return 0;
}

// シャッフル中の演出をランクに応じて開始する
function applyShuffleTierEffect() {
    const box = document.querySelector(".omikuji-box");
    if (!box) return;
    box.classList.remove("shuffle-glow-gold", "shuffle-glow-rainbow");

    const tier = getShuffleTier();
    if (tier === 1) {
        box.classList.add("shuffle-glow-gold");
    } else if (tier === 2) {
        box.classList.add("shuffle-glow-rainbow");
        startSparkle();
    }
}

function clearShuffleTierEffect() {
    const box = document.querySelector(".omikuji-box");
    if (box) box.classList.remove("shuffle-glow-gold", "shuffle-glow-rainbow");
}

// 参拝500回達成者向けのキラキラ演出
function startSparkle() {
    const overlay = document.querySelector("#confetti-overlay");
    if (!overlay) return;

    for (let i = 0; i < 20; i++) {
        const star = document.createElement("span");
        star.textContent = "✨";
        star.style.position = "absolute";
        star.style.left = Math.random() * 100 + "vw";
        star.style.top = Math.random() * 100 + "vh";
        star.style.fontSize = (Math.random() * 14 + 10) + "px";
        star.style.animation = "sparkle-fall 1.2s ease-out forwards";
        overlay.appendChild(star);
        setTimeout(() => { star.remove(); }, 1300);
    }
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

function fukuDarumaToText(amount) {
    if (!amount) return "";
    return "\n\n🎊【福だるま登場！】🎊\n福だるまがコロコロ転がってきて【" + amount.toLocaleString() + "円】を授けてくれました！";
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
        totalWinnings += bonusAmount;
        updateMoneyDisplay();

        playSE("se-win");
        recordHistory("🌟ゾロ目ボーナス", bonusAmount, currentMoney);
        saveUserState();

        setTimeout(() => {
            alert("🌟【ゾロ目大吉ボーナス！】🌟\n奇跡が起きました！乱数の下4桁が「" + lastFour + "」のゾロ目です！\n神様から御祝儀として【" + bonusAmount.toLocaleString() + "円】が支給されました！");
        }, 600);
        return;
    }

    checkStraightBonus(num, lastFour);
}

// 🌈 隠し要素：乱数の下4桁が「1234」「9876」のような階段状に並んだ時の奇跡
function checkStraightBonus(num, lastFour) {
    const digits = lastFour.split("").map(Number);
    const isAscending = digits.every((d, i) => i === 0 || d === digits[i - 1] + 1);
    const isDescending = digits.every((d, i) => i === 0 || d === digits[i - 1] - 1);

    if (isAscending || isDescending) {
        currentMoney += STRAIGHT_BONUS_PRIZE;
        totalWinnings += STRAIGHT_BONUS_PRIZE;
        updateMoneyDisplay();

        playSE("se-win");
        recordHistory("🌈階段の奇跡", STRAIGHT_BONUS_PRIZE, currentMoney);
        saveUserState();

        setTimeout(() => {
            alert("🌈【階段の奇跡】🌈\n乱数の下4桁が「" + lastFour + "」の階段状に並びました！\n神様の粋な計らいで【" + STRAIGHT_BONUS_PRIZE.toLocaleString() + "円】を授かりました！");
        }, 600);
    }
}

// 🕛 隠し要素：実際の時計がゾロ目時刻ぴったりの瞬間におみくじを引くと発生する「神様の気まぐれ」
function checkKimagureTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const timeStr = hh + ":" + mm;
    const triggerKey = todayStr() + " " + timeStr;

    if (KIMAGURE_TIMES.includes(timeStr) && kimagureLastTrigger !== triggerKey) {
        kimagureLastTrigger = triggerKey;

        currentMoney += KIMAGURE_BONUS_PRIZE;
        totalWinnings += KIMAGURE_BONUS_PRIZE;
        updateMoneyDisplay();

        playSE("se-win");
        recordHistory("🕛神様の気まぐれ", KIMAGURE_BONUS_PRIZE, currentMoney);
        saveUserState();

        setTimeout(() => {
            alert("🕛【神様の気まぐれ】🕛\n時刻がちょうど「" + timeStr + "」……なんという偶然でしょう！\n神様の気まぐれで【" + KIMAGURE_BONUS_PRIZE.toLocaleString() + "円】を授かりました！");
        }, 700);
    }
}

// 🎊 隠し要素：所持金がちょうど縁起の良い数字になった瞬間の演出（お金の増減はなし）
function checkLuckyMoneyWhim() {
    if (LUCKY_MONEY_PATTERNS.includes(currentMoney)) {
        setTimeout(() => {
            alert("🎊【ご縁の数字】🎊\nあなたの所持金がちょうど「" + currentMoney.toLocaleString() + "円」になりました！\nこれは良いことが起こる予兆かもしれません…✨");
        }, 1000);
    }
}

// ⚔️「神の試練」を解決する（単発おみくじの「大凶」枠で発生。挑戦するか選べる）
function resolveTrial() {
    let outcome;

    // 🐉 龍神の逆鱗が発動中なら、確認なしで自動的に試練に成功する
    if (hasShopEffect("ryujin")) {
        const winAmount = currentMoney;
        outcome = {
            resultName: "神の試練(龍神の加護)",
            imgSrc: "omikuji_daikichi.png",
            prizeMoney: winAmount,
            extraMsg: "🐉【龍神の逆鱗】🐉\n龍神の力で、確認するまでもなく試練に打ち勝ちました！\n所持金が2倍になりました！",
            feverAwarded: false
        };
    } else if (equippedCollectible === "koban") {
        // 🪙 黄金の小判を装備中なら、戦わずして自動的に試練に打ち勝つ
        const winAmount = currentMoney;
        outcome = {
            resultName: "神の試練(小判の加護)",
            imgSrc: "omikuji_daikichi.png",
            prizeMoney: winAmount,
            extraMsg: "🪙【黄金の小判の加護】🪙\n戦わずして試練に打ち勝ちました！\n所持金が2倍になりました！",
            feverAwarded: false
        };
        consumeCollectible("koban");
    } else {
        const challenge = confirm(
            "⚔️【神の試練】⚔️\n" +
            "神様「その運、試してみるか…？」\n\n" +
            "挑戦して成功すれば、所持金がまるごと2倍に！\n" +
            "失敗すれば、所持金の半分を没収されます。\n\n" +
            "OK：挑戦する　/　キャンセル：穏便に断る"
        );

        if (challenge) {
            if (Math.random() < 0.5) {
                const winAmount = currentMoney;
                outcome = {
                    resultName: "神の試練(成功)",
                    imgSrc: "omikuji_daikichi.png",
                    prizeMoney: winAmount,
                    extraMsg: "⚔️【試練達成】⚔️\n見事に打ち勝ちました！所持金が2倍になりました！",
                    feverAwarded: false
                };
            } else {
                let tax = Math.floor(currentMoney * 0.5);
                if (hasEffect("tax_half")) tax = Math.floor(tax / 2);
                if (hasShopEffect("suzu")) tax = Math.floor(tax / 2);
                outcome = {
                    resultName: "神の試練(失敗)",
                    imgSrc: "omikuji_daikyou.png",
                    prizeMoney: -tax,
                    extraMsg: "💥【試練失敗】💥\n試練に敗れました…所持金の半分【" + tax.toLocaleString() + "円】を没収されました。",
                    feverAwarded: true
                };
            }
        } else {
            // 穏便に断る＝従来の「大凶」と同じ挙動（20%で免除、それ以外は半額徴収）
            if (Math.random() < 0.2) {
                outcome = {
                    resultName: "神の試練(回避)",
                    imgSrc: "omikuji_daikyou.png",
                    prizeMoney: 0,
                    extraMsg: "🌟【出世大凶】🌟\n挑戦を避けましたが、神様の温情でお祓い料は免除されました。",
                    feverAwarded: false
                };
            } else {
                let tax = Math.floor(currentMoney * 0.5);
                if (hasEffect("tax_half")) tax = Math.floor(tax / 2);
                if (hasShopEffect("suzu")) tax = Math.floor(tax / 2);
                outcome = {
                    resultName: "神の試練(回避)",
                    imgSrc: "omikuji_daikyou.png",
                    prizeMoney: -tax,
                    extraMsg: "🙏 挑戦を避け、お祓い料として【" + tax.toLocaleString() + "円】を納めました。",
                    feverAwarded: true
                };
            }
        }
    }

    if (outcome.feverAwarded) {
        feverCount = 3;
        if (hasEffect("fever_extra")) feverCount++;
        if (equippedCollectible === "shinboku") {
            feverCount++;
            consumeCollectible("shinboku");
        }
    }

    return outcome;
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

    const drawCost = taianActive ? 500 : 1000;

    if (currentMoney < drawCost) {
        alert("🙅 料金が足りません！\n神様にお祈りして資金を分けてもらいましょう！");
        checkBankruptcy();
        return;
    }

    currentMoney -= drawCost;
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
    applyShuffleTierEffect();

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
            clearShuffleTierEffect();
            determineResult();
        }
    }, 80);

    function determineResult() {
        let okj = Math.random();
        let isFeverActiveThisTurn = false;

        // 🕛 隠し要素：ゾロ目時刻の「神様の気まぐれ」チェック
        checkKimagureTime();

        if (feverCount > 0) {
            isFeverActiveThisTurn = true;
            feverCount--;
            if (okj >= 0.90) {
                okj = 0.995;
            }
        }

        // 🍀🐱🏺🎊📖 大吉運アップ効果（ラッキーアイテム＋ショップの招き猫＋壺＋大安吉日＋図鑑報酬は加算で重複可）
        let daikichiBonus = 0;
        if (hasEffect("daikichi_up")) daikichiBonus += 0.03;
        if (hasShopEffect("manekineko")) daikichiBonus += 0.05;
        if (hasShopEffect("gohei")) daikichiBonus += 0.12;
        daikichiBonus += URN_LEVELS[urnLevel].bonus;
        if (taianActive) daikichiBonus += 0.002;
        if (dexRewardClaimed) daikichiBonus += 0.01;
        if (daikichiBonus > 0) okj = Math.min(1, okj + daikichiBonus);

        if (randomNumSpan) {
            let feverText = feverCount > 0 ? ` (🔥フィーバー残り: ${feverCount}回)` : " (通常モード)";
            if (isFeverActiveThisTurn && feverCount === 0) feverText = " (🔥フィーバーラスト！)";
            randomNumSpan.innerHTML = okj.toFixed(4) + feverText;
        }

        let resultName = "";
        let imgSrc = "";
        let prizeMoney = 0;
        let isTrial = false;
        let trialExtraMsg = "";

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
            // ⚔️「大凶」の代わりに「神の試練」が発生（挑戦するか選べる）
            isTrial = true;
            const trialOutcome = resolveTrial();
            resultName = trialOutcome.resultName;
            imgSrc = trialOutcome.imgSrc;
            prizeMoney = trialOutcome.prizeMoney;
            trialExtraMsg = trialOutcome.extraMsg;
        }

        // 🐟📜 獲得賞金アップ効果（ラッキーアイテム＋ショップの護符は掛け算で重複可。神の試練の結果には適用しない）
        if (!isTrial && prizeMoney > 0) {
            let prizeMultiplier = 1;
            if (hasEffect("prize_up")) prizeMultiplier *= 1.1;
            if (hasShopEffect("gofu")) prizeMultiplier *= 1.1;
            if (hasShopEffect("oogi")) prizeMultiplier *= 1.15;
            if (prizeMultiplier > 1) prizeMoney = Math.floor(prizeMoney * prizeMultiplier);
        }

        if (imgElement) imgElement.src = imgSrc;
        if (hiddenResult) hiddenResult.value = resultName;

        currentMoney += prizeMoney;
        updateMoneyDisplay();
        checkLuckyMoneyWhim();

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

        // 🎖️ 称号判定用の累計データを更新
        totalDraws++;
        if (resultName === "大吉") totalDaikichi++;
        totalProfit += (prizeMoney - drawCost);
        if (prizeMoney > 0) totalWinnings += prizeMoney;
        updateTitlesUI();
        updateRankUI();

        // 📖 図鑑に記録
        markDex(resultName);

        // 🏘️ みんなの参拝合計を更新（神社改築コミュニティ目標）
        incrementCommunityDraws();

        // 🎊 福だるまボーナス抽選（神社改築ティア2で解放）
        const fukuDarumaWon = rollFukuDaruma();

        recordHistory(resultName, prizeMoney, currentMoney);
        saveUserState();

        if (drawBtn) drawBtn.disabled = false;
        if (submitBtn) submitBtn.disabled = false;

        if (resultName === "大吉" || resultName === "吉" || resultName === "中吉") {
            playSE("se-win");
            if (resultName === "大吉") startConfetti();
        } else if (resultName === "凶") {
            playSE("se-lose");
        } else if (isTrial) {
            if (prizeMoney > 0) {
                playSE("se-win");
                startConfetti();
            } else {
                playSE("se-doom");
                startDoomEffect();
            }
        }

        setTimeout(() => {
            if (resultName === "大吉") {
                alert("🎉 おめでとうございます！【大吉】です！ 🎉\nなんと最高額の 100,000円 が当選しました！" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon));
            } else if (resultName === "吉") {
                alert("✨ やりました！【吉】です！ ✨\nみごと 10,000円 が当選しました！" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon));
            } else if (resultName === "中吉") {
                alert("♫ いいですね！【中吉】です！ ♫\n2,000円 が当選しました！" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon));
            } else if (resultName === "小吉") {
                alert("👍 堅実！【小吉】です！ 👍\n1,000円 が当選しました！(元取れた！)" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon));
            } else if (resultName === "末吉") {
                alert("😄 ちょっぴりお小遣い！【末吉】です！ 😄\n500円 が当選しました！" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon));
            } else if (resultName === "凶") {
                alert("😢残念！【凶】です！ 😢\n景品はありません。はずれです！" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon));
            } else if (isTrial) {
                alert(trialExtraMsg + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon));
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

    const drawCost10 = taianActive ? 5000 : 10000;

    if (currentMoney < drawCost10) {
        alert("🙅 資金が足りません！\n10連おみくじを引くには【" + drawCost10.toLocaleString() + "円】必要です。");
        return;
    }

    currentMoney -= drawCost10;
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
    applyShuffleTierEffect();

    let resultsCount = {"大吉": 0, "吉": 0, "中吉": 0, "小吉": 0, "末吉": 0, "凶": 0, "大凶": 0};
    let totalPrize = 0;
    let lastRandomNum = 0;
    let gotDaikyouIn10 = false;
    let totalDoomTax = 0; // 💡10連の中で取られた大凶(試練)お祓い料の合計
    let exemptedCount = 0; // 💡10連の中で免除された大凶(試練)の数
    let allDropped = []; // 10連まとめてのドロップ一覧
    let totalFukuDaruma = 0; // 10連の中で発生した福だるまボーナスの合計

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
            clearShuffleTierEffect();

            // 🕛 隠し要素：ゾロ目時刻の「神様の気まぐれ」チェック（10連は1回だけ判定）
            checkKimagureTime();

            for (let i = 0; i < 10; i++) {
                let okj = Math.random();

                // 🍀🐱🏺🎊📖 大吉運アップ効果
                let daikichiBonus = 0;
                if (hasEffect("daikichi_up")) daikichiBonus += 0.03;
                if (hasShopEffect("manekineko")) daikichiBonus += 0.05;
        if (hasShopEffect("gohei")) daikichiBonus += 0.12;
                daikichiBonus += URN_LEVELS[urnLevel].bonus;
                if (taianActive) daikichiBonus += 0.002;
                if (dexRewardClaimed) daikichiBonus += 0.01;
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
                        consumeCollectible("koban");
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
            if (hasShopEffect("oogi")) prizeMultiplier *= 1.15;
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

                // 📖 図鑑に記録
                if (okj >= 0.99) markDex("大吉");
                else if (okj >= 0.95) markDex("吉");
                else if (okj >= 0.85) markDex("中吉");
                else if (okj >= 0.7) markDex("小吉");
                else if (okj >= 0.6) markDex("末吉");
                else if (okj >= 0.1) markDex("凶");
                else markDex("大凶");

                // 🏘️ みんなの参拝合計を更新（神社改築コミュニティ目標）
                incrementCommunityDraws();

                // 🎊 福だるまボーナス抽選
                const fukuDarumaPull = rollFukuDarumaAmount();
                if (fukuDarumaPull) {
                    totalFukuDaruma += fukuDarumaPull;
                }

                // 🎖️ 称号判定用の累計データを更新（10連の1回1回もカウント）
                totalDraws++;
                if (okj >= 0.99) totalDaikichi++;
                totalProfit += (prize - (drawCost10 / 10));
                if (prize > 0) totalWinnings += prize;

                totalPrize += prize;
                checkZoromeBonus(okj);
            }

            if (gotDaikyouIn10) {
                // 🔔🌳 フィーバー回数+1効果
                feverCount = 3;
                if (hasEffect("fever_extra")) feverCount++;
                if (equippedCollectible === "shinboku") {
                    feverCount++;
                    consumeCollectible("shinboku");
                }
            }

            if (randomNumSpan) {
                let feverText = feverCount > 0 ? ` (🔥フィーバーチャージ完了:残り ${feverCount}回)` : " (通常モード)";
                randomNumSpan.innerHTML = lastRandomNum.toFixed(4) + feverText;
            }

            if (imgElement) {
                const lastRandomImg = omikujiImages[Math.floor(Math.random() * omikujiImages.length)];
                imgElement.src = lastRandomImg;
            }

            totalPrize += totalFukuDaruma;
            if (totalFukuDaruma > 0) totalWinnings += totalFukuDaruma;

            currentMoney += totalPrize;
            updateMoneyDisplay();
            updateShopUI();
            updateTitlesUI();
            updateRankUI();
            checkLuckyMoneyWhim();

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
                    "⚔️ 神の試練(大凶枠)： " + resultsCount["大凶"] + "回\n" +
                    "--------------------------------\n";

                if (totalDoomTax > 0) {
                    alertMsg += "💸 試練のお祓い料(合計)：-" + totalDoomTax.toLocaleString() + "円\n";
                }
                if (exemptedCount > 0) {
                    alertMsg += "🌟 試練の免除：" + exemptedCount + "回発生！(セーフ！)\n";
                }

                if (totalFukuDaruma > 0) {
                    alertMsg += "🎊 福だるまボーナス(合計)：+" + totalFukuDaruma.toLocaleString() + "円\n";
                }

                alertMsg += "💰 合計損益：" + totalPrize.toLocaleString() + "円！";

                if (gotDaikyouIn10) {
                    alertMsg += "\n\n🔥【厄落としフィーバー発動！】🔥\n神の試練(大凶枠)が含まれていたため、次の単発おみくじ" + feverCount + "回は【大吉確率10倍(10%)】になります！";
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
            totalDraws = typeof data.totalDraws === "number" ? data.totalDraws : 0;
            totalDaikichi = typeof data.totalDaikichi === "number" ? data.totalDaikichi : 0;
            totalProfit = typeof data.totalProfit === "number" ? data.totalProfit : 0;
            totalWinnings = typeof data.totalWinnings === "number" ? data.totalWinnings : 0;
            urnLevel = typeof data.urnLevel === "number" ? data.urnLevel : 0;

            const today = todayStr();
            taianActive = (data.taianDate === today) && data.taianActive === true;
            bankMoney = typeof data.bankMoney === "number" ? data.bankMoney : 0;
            dexAchieved = Object.assign(
                { daikichi: false, kichi: false, chuukichi: false, syoukichi: false, suekichi: false, kyou: false, daikyou: false },
                data.dexAchieved || {}
            );
            dexRewardClaimed = data.dexRewardClaimed === true;
        }

        updateMoneyDisplay();
        updateTitlesUI();
        updateDexUI();
        updateBankUI();

        // 🎊 本日が大安吉日なら表示する
        const taianBox = document.querySelector("#taian-status-box");
        if (taianBox) {
            if (taianActive) {
                taianBox.textContent = "🎊 本日は【大安吉日】！大吉運UP＆おみくじ料金半額中！";
                taianBox.classList.remove("hidden");
            } else {
                taianBox.classList.add("hidden");
            }
        }

        // 🏘️ みんなの参拝合計（神社改築コミュニティ目標）を取得
        try {
            if (window.omikujiCommunityRef && window.omikujiGetDoc) {
                const communitySnap = await window.omikujiGetDoc(window.omikujiCommunityRef);
                communityDraws = (communitySnap.exists() && typeof communitySnap.data().totalDraws === "number")
                    ? communitySnap.data().totalDraws
                    : 0;
            }
        } catch (e) {
            console.error("コミュニティ目標データの読み込みに失敗しました: ", e);
        }
        applyShrineTierVisual();

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
