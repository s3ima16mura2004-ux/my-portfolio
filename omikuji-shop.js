// ============================================================
// omikuji-shop.js
// 🛍️ ショップ・貯金・収集アイテム・コミュニティ目標のロジック
// お金やアイテム数を実際に増減させる処理をまとめている。
// ============================================================

async function buyShopItem(itemKey) {
    const item = SHOP_ITEMS.find(i => i.key === itemKey);
    if (!item) return;

    // 😲 神の気まぐれフィーバー中はショップ全品が半額になる
    const price = isShopFeverActive() ? Math.floor(item.price / 2) : item.price;

    if (currentMoney < price) {
        alert("🙅 所持金が足りません！\n「" + item.name + "」の購入には" + price.toLocaleString() + "円必要です。");
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

    currentMoney -= price;
    shopItemKey = item.key;
    shopItemRemaining = item.duration;

    updateMoneyDisplay();
    playSE("se-coin");
    await saveUserState();

    alert("🛍️ 「" + item.name + "」を購入しました！\n" + item.desc + "\n(効果はこれから" + item.duration + "回のおみくじに適用されます)" + (price !== item.price ? "\n😲 神の気まぐれフィーバーで半額の" + price.toLocaleString() + "円でした！" : ""));
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

// 🎰 ガチャ券を使って収集アイテムをランダムに1つ入手する
async function drawGacha() {
    if (gachaTickets <= 0) {
        alert("🙅 ガチャ券を持っていません！\n謎の石ころを1,000個集めるごとに1枚もらえます。");
        return;
    }

    gachaTickets--;

    const picked = Math.random() < 0.5 ? "koban" : "shinboku";
    ownedItems[picked] = (ownedItems[picked] || 0) + 1;
    const item = DROP_ITEMS.find(i => i.key === picked);

    updateShopUI();
    playSE("se-win");
    await saveUserState();

    alert("🎰 ガチャ結果…🎰\n" + item.emoji + "「" + item.name + "」が出ました！\n（残りガチャ券：" + gachaTickets + "枚）");
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
function getCommunityTier(draws) {
    let tier = 0;
    COMMUNITY_TIERS.forEach(t => {
        if (draws >= t.threshold) tier = t.tier;
    });
    return tier;
}

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
    const tier = getCommunityTier(communityDraws);
    if (tier < 2) return 0;
    const rate = tier >= 5 ? FUKU_DARUMA_RATE_BOOSTED : FUKU_DARUMA_RATE_NORMAL;
    if (Math.random() < rate) return FUKU_DARUMA_PRIZE;
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
function rollDrops() {
    const dropped = [];

    // 🎆 夏祭り（8月の夜・週末限定）：収集アイテムのドロップ率が1.5倍になる
    const isNatsumatsuri = isNatsumatsuriFestivalActive();
    const isTanabata = isTanabataActive();

    DROP_ITEMS.forEach(item => {
        if (item.minCommunityTier && getCommunityTier(communityDraws) < item.minCommunityTier) return;
        if (item.seasonal === "tanabata" && !isTanabata) return;       // 七夕（7/1〜7/7）限定アイテム
        if (item.seasonal === "natsumatsuri" && !isNatsumatsuri) return; // 夏祭り（8月の夜・週末）限定アイテム

        const effectiveRate = isNatsumatsuri ? item.rate * NATSUMATSURI_DROP_MULTIPLIER : item.rate;
        if (Math.random() < effectiveRate) {
            ownedItems[item.key] = (ownedItems[item.key] || 0) + 1;
            dropped.push(item);

            if (item.key === "ishikoro") {
                if (ownedItems.ishikoro === 100) {
                    setTimeout(() => {
                        alert("🪨【石ころ収集家】🪨\n謎の石ころを100個集めました！称号を獲得しました！\n引き続き集めると、さらなる恩恵があるかもしれません…");
                    }, 900);
                }

                if (ownedItems.ishikoro === 500 && !ishikoro500Claimed) {
                    ishikoro500Claimed = true;
                    setTimeout(() => {
                        alert("🪨✨【賢者の石】✨🪨\n謎の石ころが500個集まり、ついに「賢者の石」へと変化しました！\n大吉ボーナスが永久に+1.0%になりました！");
                    }, 1000);
                }

                if (ownedItems.ishikoro % 1000 === 0 && ownedItems.ishikoro > 0) {
                    gachaTickets++;
                    setTimeout(() => {
                        alert("🎰【ガチャ券獲得！】🎰\n謎の石ころが" + ownedItems.ishikoro.toLocaleString() + "個に達し、ガチャ券を1枚手に入れました！\n（現在の所持枚数：" + gachaTickets + "枚）\nショップタブの「収集アイテム」欄から使えます。");
                    }, 1100);
                }
            }
        }
    });

    checkOrihimeHikoboshiMeeting();

    return dropped;
}

// 🎐🌠 織姫の五色糸と彦星の一等星が両方揃うと、一生に一度だけ特別なご縁イベントが発生する
function checkOrihimeHikoboshiMeeting() {
    if (orihimeHikoboshiMet) return;
    if ((ownedItems.orihime_thread || 0) >= 1 && (ownedItems.hikoboshi_star || 0) >= 1) {
        ownedItems.orihime_thread--;
        ownedItems.hikoboshi_star--;
        orihimeHikoboshiMet = true;

        currentMoney += ORIHIME_HIKOBOSHI_MEETING_PRIZE;
        totalWinnings += ORIHIME_HIKOBOSHI_MEETING_PRIZE;
        updateMoneyDisplay();
        recordHistory("🌌織姫と彦星の逢瀬", ORIHIME_HIKOBOSHI_MEETING_PRIZE, currentMoney);
        updateTitlesUI();

        setTimeout(() => {
            alert(
                "🎐🌠【織姫と彦星、天の川で逢う】🌠🎐\n" +
                "織姫の五色糸と彦星の一等星、両方を手に入れたことで、二人はついに再会を果たしました！\n" +
                "神様からのお祝いとして【" + ORIHIME_HIKOBOSHI_MEETING_PRIZE.toLocaleString() + "円】を授かりました！\n" +
                "（称号「星々を結ぶ者」を獲得！）"
            );
        }, 1300);
    }
}

// 🎋 七夕「短冊に願いを書く」ボタンの処理（7/1〜7/7限定・1日1回・30%で当日の金運アップ／7/7は確定）
async function tanabataWish() {
    if (!isTanabataActive()) return;

    const today = todayStr();
    if (tanabataWishDate === today) {
        alert("🎋 今日はもう短冊に願いを書きました。また明日挑戦してください。");
        return;
    }

    tanabataWishDate = today;
    const onTanabataDay = isTanabataDay();
    const success = Math.random() < (onTanabataDay ? TANABATA_DAY_SUCCESS_RATE : TANABATA_SUCCESS_RATE);
    if (success) {
        tanabataLuckDate = today;
    }

    updateTanabataUI();
    playSE(success ? "se-win" : "se-coin");
    await saveUserState();

    if (success) {
        const specialMsg = onTanabataDay
            ? "🌌 今日は七夕当日…織姫と彦星が天の川で逢う特別な日です。あなたの願いも必ず届きました！\n"
            : "";
        alert("🎋✨【短冊の願い、叶う】✨🎋\n" + specialMsg + "短冊に書いた願いが天に届きました！\n本日1日、大吉運が+" + (TANABATA_DAIKICHI_BONUS * 100).toFixed(0) + "%アップします！");
    } else {
        alert("🎋 短冊を笹に結びました。\n今日のところは特に変化はなさそうです…また来年！");
    }
}