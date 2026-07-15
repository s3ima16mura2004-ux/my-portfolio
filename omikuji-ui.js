// ============================================================
// omikuji-ui.js
// 🖥️ 画面表示・演出まわりのファイル
// DOM操作、タブ切り替え、各種ステータス表示の更新、
// 効果音・アニメーション演出をまとめている。
// お金やアイテムの計算ロジックそのものはここには書かない。
// ============================================================

function getTimePeriod() {
    const hour = new Date().getHours();
    if (hour >= 2 && hour < 4) return "ushimitsu"; // 丑三つ時（深夜2時〜4時）
    if (hour >= 5 && hour < 11) return "morning";  // 朝
    if (hour >= 11 && hour < 17) return "afternoon"; // 昼
    return "evening"; // 夜（17時〜翌2時）
}

// 現在の時間帯に応じて背景演出とバナー表示を切り替える
function applyTimeTheme() {
    const container = document.querySelector(".container");
    const period = getTimePeriod();

    if (container) {
        container.classList.remove("time-morning", "time-afternoon", "time-evening", "time-ushimitsu");
        container.classList.add("time-" + period);
    }

    const banner = document.querySelector("#ushimitsu-banner");
    if (banner) {
        if (period === "ushimitsu") {
            banner.classList.remove("hidden");
        } else {
            banner.classList.add("hidden");
        }
    }

    return period;
}
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
            const effectivePrice = isShopFeverActive() ? Math.floor(item.price / 2) : item.price;
            if (btn) btn.disabled = currentMoney < effectivePrice;
            const priceEl = card.querySelector(".shop-item-price");
            if (priceEl) {
                priceEl.textContent = isShopFeverActive()
                    ? "🈹 " + effectivePrice.toLocaleString() + "円（半額！）"
                    : item.price.toLocaleString() + "円";
            }
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

    const gachaTicketCount = document.querySelector("#gacha-ticket-count");
    if (gachaTicketCount) gachaTicketCount.textContent = gachaTickets;
    const gachaBtn = document.querySelector("#gacha-draw-btn");
    if (gachaBtn) gachaBtn.disabled = gachaTickets <= 0;

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

    // 🎏 五色の短冊（神社改築ティア4で解放される収集アイテム）
    const tanzakuRow = document.querySelector("#tanzaku-row");
    const tanzakuDesc = document.querySelector("#tanzaku-desc");
    const tanzakuUnlocked = getCommunityTier(communityDraws) >= 4;
    if (tanzakuRow) tanzakuRow.classList.toggle("hidden", !tanzakuUnlocked);
    if (tanzakuDesc) tanzakuDesc.classList.toggle("hidden", !tanzakuUnlocked);

    const countTanzaku = document.querySelector("#count-tanzaku");
    if (countTanzaku) countTanzaku.textContent = ownedItems.tanzaku || 0;

    const equipBtnTanzaku = document.querySelector("#equipBtn-tanzaku");
    if (equipBtnTanzaku) {
        if (equippedCollectible === "tanzaku") {
            equipBtnTanzaku.textContent = "装備を外す";
            equipBtnTanzaku.disabled = false;
        } else {
            equipBtnTanzaku.textContent = "装備する";
            equipBtnTanzaku.disabled = !(ownedItems.tanzaku > 0);
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

    // 🎐🌠 織姫の五色糸・彦星の一等星（七夕7/1〜7/7限定。所持している間は期間外でも表示し続ける）
    const orihimeRow = document.querySelector("#orihime-row");
    const showOrihimeRow = isTanabataActive() || (ownedItems.orihime_thread || 0) > 0 || (ownedItems.hikoboshi_star || 0) > 0;
    if (orihimeRow) orihimeRow.classList.toggle("hidden", !showOrihimeRow);
    const countOrihime = document.querySelector("#count-orihime");
    if (countOrihime) countOrihime.textContent = ownedItems.orihime_thread || 0;
    const countHikoboshi = document.querySelector("#count-hikoboshi");
    if (countHikoboshi) countHikoboshi.textContent = ownedItems.hikoboshi_star || 0;

    // 🏮 夏祭りの提灯（8月限定。所持している間は月をまたいでも表示し続ける）
    const lanternRow = document.querySelector("#lantern-row");
    const isAugustNow = (new Date().getMonth() + 1) === NATSUMATSURI_MONTH;
    const showLanternRow = isAugustNow || (ownedItems.natsumatsuri_lantern || 0) > 0;
    if (lanternRow) lanternRow.classList.toggle("hidden", !showLanternRow);
    const countLantern = document.querySelector("#count-lantern");
    if (countLantern) countLantern.textContent = ownedItems.natsumatsuri_lantern || 0;

    updateActiveItemsUI();
    updateUrnUI();
    updateRankUI();
}
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

    const stats = { totalDraws, totalDaikichi, totalProfit, urnLevel, ownedItems, dexRewardClaimed, gotDaidaikichi, gotKamikichi, gotDaidaikyou, gotUshimitsuDraw, ishikoro500Claimed, communityDraws, orihimeHikoboshiMet };
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
function updateBankUI() {
    const bankDisplay = document.querySelector("#bank-money-display");
    if (bankDisplay) bankDisplay.textContent = bankMoney.toLocaleString();
    const bankDisplayTop = document.querySelector("#bank-money-display-top");
    if (bankDisplayTop) bankDisplayTop.textContent = bankMoney.toLocaleString();
}
function applyShrineTierVisual() {
    const container = document.querySelector(".container");
    if (!container) return;
    container.classList.remove("shrine-tier1", "shrine-tier2", "shrine-tier3", "shrine-tier4", "shrine-tier5", "shrine-tier6");

    const tier = getCommunityTier(communityDraws);
    if (tier >= 1) container.classList.add("shrine-tier" + Math.min(tier, 6));

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
function dropsToText(dropped) {
    if (dropped.length === 0) return "";
    return "\n\n🎁 アイテムをドロップ！\n" + dropped.map(i => i.emoji + " " + i.name).join("、");
}

function fukuDarumaToText(amount) {
    if (!amount) return "";
    return "\n\n🎊【福だるま登場！】🎊\n福だるまがコロコロ転がってきて【" + amount.toLocaleString() + "円】を授けてくれました！";
}
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
// 🎆 夏祭り開催中（8月の夜・週末）の大吉系当選時に打ち上げる花火演出
function startFireworks() {
    const overlay = document.querySelector("#confetti-overlay");
    if (!overlay) return;

    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const burst = document.createElement("span");
            burst.textContent = "🎆";
            burst.style.position = "absolute";
            burst.style.left = (Math.random() * 80 + 10) + "vw";
            burst.style.top = (Math.random() * 50 + 5) + "vh";
            burst.style.fontSize = (Math.random() * 20 + 30) + "px";
            burst.style.animation = "sparkle-fall 1.2s ease-out forwards";
            overlay.appendChild(burst);
            setTimeout(() => { burst.remove(); }, 1300);
        }, i * 180);
    }
}
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

// 🎂 誕生日の「大大吉確定チケット」の表示を更新する
function updateBirthdayTicketUI() {
    const box = document.querySelector("#birthday-ticket-box");
    if (!box) return;
    if (birthdayTicket) {
        box.textContent = "🎂 大大吉確定チケット：あり（次の単発おみくじで自動発動！）";
        box.classList.remove("hidden");
    } else {
        box.classList.add("hidden");
    }
}

// 😲 神の気まぐれフィーバー（ショップ半額）の残り時間表示を更新する
function updateShopFeverUI() {
    const box = document.querySelector("#shop-fever-box");
    if (!box) return;

    if (isShopFeverActive()) {
        const remainMs = kimagureFeverUntil - Date.now();
        const remainMin = Math.max(1, Math.ceil(remainMs / 60000));
        box.textContent = "😲 神の気まぐれフィーバー中！ショップ全品が半額です！（残り約" + remainMin + "分）";
        box.classList.remove("hidden");
    } else {
        box.classList.add("hidden");
    }
    updateShopUI();
}

// 🎋 七夕「短冊に願いを書く」欄の表示を更新する（7月のみ表示）
function updateTanabataUI() {
    const box = document.querySelector("#tanabata-box");
    const btn = document.querySelector("#tanabata-wish-btn");
    const statusText = document.querySelector("#tanabata-status-text");
    const starText = document.querySelector("#tanabata-star-text");
    if (!box) return;

    if (!isTanabataActive()) {
        box.classList.add("hidden");
        return;
    }
    box.classList.remove("hidden");

    const usedToday = tanabataWishDate === todayStr();
    if (btn) btn.disabled = usedToday;

    if (statusText) {
        if (isTanabataLuckActive()) {
            statusText.textContent = "🎋 短冊の願いが叶いました！本日は大吉運+" + (TANABATA_DAIKICHI_BONUS * 100).toFixed(0) + "%！";
        } else if (usedToday) {
            statusText.textContent = "🎋 今日はもう短冊に願いを書きました。また明日挑戦してください。";
        } else if (isTanabataDay()) {
            statusText.textContent = "🌌 今日は七夕当日！織姫と彦星が逢う特別な日、願いは必ず叶います！";
        } else {
            statusText.textContent = "🎋 短冊に願いを書くと、30%の確率で今日1日だけ金運がアップします！（7/7は確定！）";
        }
    }

    // 🎐🌠 織姫・彦星アイテムの収集状況
    if (starText) {
        if (orihimeHikoboshiMet) {
            starText.textContent = "🌌 織姫と彦星はすでに再会を果たしました。";
        } else {
            starText.textContent =
                "🎐 織姫の五色糸：" + (ownedItems.orihime_thread || 0) + "個　" +
                "🌠 彦星の一等星：" + (ownedItems.hikoboshi_star || 0) + "個" +
                "（両方1個ずつ揃うと特別なご縁が結ばれます）";
        }
    }
}

// 🎆 夏祭り（8月限定・夜と週末は本格的な演出、それ以外は夏っぽい軽い演出）の表示を更新する
function updateNatsumatsuriUI() {
    const matsuriBanner = document.querySelector("#natsumatsuri-banner");
    const summerBanner = document.querySelector("#summer-theme-banner");
    const container = document.querySelector(".container");
    const isAugust = (new Date().getMonth() + 1) === NATSUMATSURI_MONTH;
    const festivalActive = isNatsumatsuriFestivalActive();

    if (container) {
        container.classList.toggle("natsumatsuri-active", isAugust && festivalActive);
        container.classList.toggle("summer-theme", isAugust && !festivalActive);
    }

    if (matsuriBanner) matsuriBanner.classList.toggle("hidden", !(isAugust && festivalActive));
    if (summerBanner) summerBanner.classList.toggle("hidden", !(isAugust && !festivalActive));
}