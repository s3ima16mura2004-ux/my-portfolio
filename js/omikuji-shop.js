// ============================================================
// omikuji-shop.js
// 🛍️ ショップ・貯金・収集アイテム・コミュニティ目標のロジック
// お金やアイテム数を実際に増減させる処理をまとめている。
// ============================================================

async function buyShopItem(itemKey) {
    const item = SHOP_ITEMS.find(i => i.key === itemKey);
    if (!item) return;

    // 🍬 季節限定アイテムは開催期間外だと購入できない
    if (item.seasonal && !isSeasonalEventActive(item.seasonal)) {
        alert("🙅 「" + item.name + "」は現在販売されていません。開催シーズンにまた訪れてください。");
        return;
    }

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

    // 🐱 相棒「招き猫」は効果アイテムを購入するたびに育つ
    const prevCompanionLevel = getCompanionLevelIndex();
    companionExp++;
    const grownCompanion = getCompanionLevelIndex() > prevCompanionLevel ? COMPANION_LEVELS[getCompanionLevelIndex()] : null;
    updateCompanionUI();

    updateMoneyDisplay();
    playSE("se-coin");
    trackMissionShopBuy(); // 🎯「ショップの常連」ミッションの進捗を更新
    await saveUserState();

    alert("🛍️ 「" + item.name + "」を購入しました！\n" + item.desc + "\n(効果はこれから" + item.duration + "回のおみくじに適用されます)" + (price !== item.price ? "\n😲 神の気まぐれフィーバーで半額の" + price.toLocaleString() + "円でした！" : ""));

    if (grownCompanion) {
        setTimeout(() => {
            alert("🐱✨【招き猫が成長しました！】✨🐱\n" + grownCompanion.emoji + " 「" + grownCompanion.name + "」になりました！\n" + grownCompanion.desc);
        }, 400);
    }
}

// 🐍🦊 賽銭箱（貯金）の資金で、新しい相棒を迎える
async function buyCompanionFriend(key) {
    const friend = COMPANION_FRIENDS.find(f => f.key === key);
    if (!friend) return;

    if (ownedFriends[key]) {
        alert("🙅 「" + friend.name + "」はすでに迎えています。");
        return;
    }

    if (bankMoney < friend.cost) {
        alert("🙅 賽銭箱の残高が足りません！\n「" + friend.name + "」を迎えるには" + friend.cost.toLocaleString() + "円必要です。\n（現在の賽銭箱残高：" + bankMoney.toLocaleString() + "円）");
        return;
    }

    bankMoney -= friend.cost;
    ownedFriends[key] = true;

    updateBankUI();
    updateCompanionUI();
    playSE("se-coin");
    await saveUserState();

    alert(friend.emoji + "✨【新しい相棒を迎えました！】✨" + friend.emoji + "\n「" + friend.name + "」が仲間になりました！\n" + friend.desc);
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
    trackMissionDeposit(amount); // 🎯「貯蓄家」ミッションの進捗を更新
    trackKannazukiDeposit(amount); // 🌫️ 神無月期間中なら「倍返し」対象として記録
    await saveUserState();
    alert("🏦 " + amount.toLocaleString() + "円を賽銭箱に預けました。\n（このお金はおみくじには使えませんが、大凶や神の試練で失うこともありません）" + (isSeasonalEventActive("kannazuki") ? "\n🌫️ 今は神無月…この預け入れは11月の「倍返し」の対象です！" : ""));
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

    // 🎆 夏祭り（8月の夜・週末限定）：ドロップ率が1.5倍になる（対象は全アイテム）
    const isNatsumatsuri = isNatsumatsuriFestivalActive();

    DROP_ITEMS.forEach(item => {
        if (item.minCommunityTier && getCommunityTier(communityDraws) < item.minCommunityTier) return;
        if (item.seasonal && !isSeasonalEventActive(item.seasonal)) return; // 季節限定アイテムは期間外はドロップしない

        const effectiveRate = isNatsumatsuri ? item.rate * NATSUMATSURI_DROP_MULTIPLIER : item.rate;
        if (Math.random() < effectiveRate) {
            ownedItems[item.key] = (ownedItems[item.key] || 0) + 1;
            dropped.push(item);

            if (item.key === "hanami_dango") hanamiDangoTotalCollected++; // 🍡 称号「花見団子の達人」判定用（使っても減らない累計）

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
    checkOshogatsuHatsuyumeSet();

    if (dropped.length > 0) trackMissionDropItem(); // 🎯「収集家見習い」ミッションの進捗を更新

    return dropped;
}

// 🎐🌠 織姫の五色糸と彦星の一等星が両方揃うと、特別なご縁イベントが発生する（毎年七夕シーズンに1回まで再挑戦可）
function checkOrihimeHikoboshiMeeting() {
    const currentYear = new Date().getFullYear();
    if (orihimeHikoboshiLastMetYear === currentYear) return; // 今年はもう再会済み

    if ((ownedItems.orihime_thread || 0) >= 1 && (ownedItems.hikoboshi_star || 0) >= 1) {
        ownedItems.orihime_thread--;
        ownedItems.hikoboshi_star--;
        orihimeHikoboshiMeetCount++;
        orihimeHikoboshiLastMetYear = currentYear;

        const isFirstMeeting = orihimeHikoboshiMeetCount === 1;
        const prize = isFirstMeeting ? ORIHIME_HIKOBOSHI_MEETING_PRIZE : ORIHIME_HIKOBOSHI_REUNION_PRIZE;

        currentMoney += prize;
        totalWinnings += prize;
        updateMoneyDisplay();
        recordHistory(isFirstMeeting ? "🌌織姫と彦星の逢瀬" : "🌌織姫と彦星、" + orihimeHikoboshiMeetCount + "年目の再会", prize, currentMoney);
        updateTitlesUI();

        setTimeout(() => {
            if (isFirstMeeting) {
                alert(
                    "🎐🌠【織姫と彦星、天の川で逢う】🌠🎐\n" +
                    "織姫の五色糸と彦星の一等星、両方を手に入れたことで、二人はついに再会を果たしました！\n" +
                    "神様からのお祝いとして【" + prize.toLocaleString() + "円】を授かりました！\n" +
                    "（称号「星々を結ぶ者」を獲得！来年の七夕もまた再会のチャンスがあります）"
                );
            } else {
                let msg =
                    "🌌🎊【織姫と彦星、" + orihimeHikoboshiMeetCount + "年目の再会】🎊🌌\n" +
                    "今年もまた、二人は天の川で巡り会うことができました！\n" +
                    "神様からのお祝いとして【" + prize.toLocaleString() + "円】を授かりました！";
                if (orihimeHikoboshiMeetCount === 5) {
                    msg += "\n\n✨5年連続の再会を見届け、称号「星々の守り人」を獲得しました！✨";
                }
                alert(msg);
            }
        }, 1300);
    }
}

// 🗻🦅🍆 お正月「初夢の縁起物（一富士二鷹三茄子）」が3つ揃うと、一生に一度だけ特別なご褒美が発生する
function checkOshogatsuHatsuyumeSet() {
    if (hatsuyumeComplete) return;
    if ((ownedItems.hatsuyume_fuji || 0) >= 1 && (ownedItems.hatsuyume_taka || 0) >= 1 && (ownedItems.hatsuyume_nasu || 0) >= 1) {
        ownedItems.hatsuyume_fuji--;
        ownedItems.hatsuyume_taka--;
        ownedItems.hatsuyume_nasu--;
        hatsuyumeComplete = true;

        currentMoney += HATSUYUME_COMPLETE_PRIZE;
        totalWinnings += HATSUYUME_COMPLETE_PRIZE;
        updateMoneyDisplay();
        recordHistory("🗻初夢コンプリート", HATSUYUME_COMPLETE_PRIZE, currentMoney);
        updateTitlesUI();

        setTimeout(() => {
            alert(
                "🗻🦅🍆【一富士二鷹三茄子！】🍆🦅🗻\n" +
                "初夢に見ると縁起が良いとされる三つがすべて揃いました！\n" +
                "今年一年の幸運を先取りし、神様から【" + HATSUYUME_COMPLETE_PRIZE.toLocaleString() + "円】を授かりました！\n" +
                "（称号「一富士二鷹三茄子」を獲得！）"
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

// 🌫️ 神無月（10月）の間に賽銭箱へ預けた金額を記録する（depositBank()から呼ばれる）
function trackKannazukiDeposit(amount) {
    if (!isSeasonalEventActive("kannazuki")) return;
    kannazukiDeposits += amount;
}

// ⛩️ 神様が出雲から戻る11月になったら、神無月に貯めた賽銭箱の預け入れ額を「倍返し」する（ログイン時に呼ぶ）
async function checkKannazukiReturn() {
    if ((new Date().getMonth() + 1) !== 11) return; // 11月以外は何もしない
    if (kannazukiDeposits <= 0) return;

    const currentYear = new Date().getFullYear();
    if (kannazukiRewardedYear === currentYear) return; // 今年はもう倍返し済み

    const bonus = kannazukiDeposits;
    bankMoney += bonus;
    kannazukiRewardedYear = currentYear;
    kannazukiDeposits = 0;

    updateBankUI();
    updateTitlesUI();
    await saveUserState();

    setTimeout(() => {
        alert(
            "⛩️🎉【神様、出雲より帰還】🎉⛩️\n" +
            "神無月の間に賽銭箱へ預けたお金を、神様が見ていてくださいました！\n" +
            "神様のお力で預け入れ額が【倍返し】され、賽銭箱に【" + bonus.toLocaleString() + "円】が追加されました！\n" +
            "（称号「神無月の信心」を獲得！）"
        );
    }, 1200);
}

// 🎅 クリスマス（12/1〜12/25）限定：低確率で「サンタの袋」が現れ、開けると所持金が大きく増える
function rollSantaBag() {
    if (!isSeasonalEventActive("christmas")) return 0;
    if (Math.random() >= SANTA_BAG_RATE) return 0;

    const amount = SANTA_BAG_MIN_PRIZE + Math.floor(Math.random() * (SANTA_BAG_MAX_PRIZE - SANTA_BAG_MIN_PRIZE + 1));
    currentMoney += amount;
    totalWinnings += amount;
    santaBagCount++;
    updateMoneyDisplay();
    recordHistory("🎅サンタの袋", amount, currentMoney);
    return amount;
}

// 💝 バレンタイン（2/1〜2/14）限定：「チョコおみくじ」を1日1回引く。ハズレなしで、運勢＋ペア運勢がもらえる
async function chocoOmikuji() {
    if (!isSeasonalEventActive("valentine")) return;

    const today = todayStr();
    if (chocoDrawDate === today) {
        alert("💝 今日はもうチョコおみくじを引きました。また明日挑戦してください。");
        return;
    }

    unlockAllAudio();
    chocoDrawDate = today;

    const roll = Math.random();
    const tier = CHOCO_TIERS.find(t => roll >= t.min);
    const pair = CHOCO_PAIR_TYPES[Math.floor(Math.random() * CHOCO_PAIR_TYPES.length)];

    currentMoney += tier.prize;
    totalWinnings += tier.prize;
    chocoDrawCount++;

    updateMoneyDisplay();
    playSE("se-win");
    recordHistory("💝チョコおみくじ：" + tier.name + "（ペア運勢：" + pair.emoji + pair.label + "）", tier.prize, currentMoney);
    updateValentineUI();
    updateTitlesUI();
    await saveUserState();

    alert(
        "💝🍫【チョコおみくじ】🍫💝\n" +
        "今日の運勢は【" + tier.name + "】！【" + tier.prize.toLocaleString() + "円】を授かりました。\n" +
        "そしてあなたの「ペア運勢」は…" + pair.emoji + "【" + pair.label + "】でした！\n" +
        "良いご縁がありますように…♡"
    );
}

// 🍡 お花見団子を1個使って、次の1回の単発おみくじだけ大吉運を少しアップさせる（花見シーズン以外でも所持していれば使用可）
async function useHanamiDango() {
    if (!(ownedItems.hanami_dango > 0)) {
        alert("🙅 お花見団子を持っていません！お花見（4月）シーズン中のおみくじで手に入るかもしれません。");
        return;
    }
    if (hanamiDangoActive) {
        alert("🍡 すでに1個、効果の準備ができています。次の単発おみくじで発動します。");
        return;
    }

    ownedItems.hanami_dango--;
    hanamiDangoActive = true;

    updateShopUI();
    playSE("se-coin");
    await saveUserState();

    alert("🍡【お花見団子、実食！】🍡\n次の単発おみくじで、大吉運が少しだけアップします！");
}

// 🗺️ 境内マップの次の1マスを購入する（所持金を使って少しずつマップを完成させていく大型の金策先）
async function buyNextMapTile() {
    const tile = MAP_TILES[shrineMapLevel];
    if (!tile) {
        alert("🗺️ 境内マップはすでに完成しています！");
        return;
    }
    if (currentMoney < tile.cost) {
        alert("🙅 所持金が足りません！\n「" + tile.name + "」の購入には" + tile.cost.toLocaleString() + "円必要です。");
        return;
    }

    currentMoney -= tile.cost;
    shrineMapLevel++;

    updateMoneyDisplay();
    playSE("se-coin");

    // 🎉 節目（5・10・15・20マス）に到達したらお祝い金を授与する
    let milestoneMsg = "";
    const milestone = MAP_MILESTONES.find(m => m.count === shrineMapLevel);
    if (milestone) {
        currentMoney += milestone.prize;
        totalWinnings += milestone.prize;
        updateMoneyDisplay();
        recordHistory("🗺️境内マップ・節目ボーナス", milestone.prize, currentMoney);
        milestoneMsg = "\n\n🎉【節目ボーナス！】🎉\n境内マップが" + shrineMapLevel + "マス埋まったお祝いに【" + milestone.prize.toLocaleString() + "円】を授かりました！";
    }

    const completeMsg = isShrineMapComplete()
        ? "\n\n🏆✨【境内マップ完成！】✨🏆\nすべてのマスが埋まり、神社の境内図が完成しました！\n永続的に大吉ボーナス+" + (SHRINE_MAP_COMPLETE_BONUS * 100).toFixed(1) + "%を授かりました！"
        : "";

    updateShrineMapUI();
    updateTitlesUI();
    await saveUserState();

    alert("🗺️ 「" + tile.emoji + " " + tile.name + "」のマスが埋まりました！\n" + tile.desc + milestoneMsg + completeMsg);
}

// 🗾 全国神社巡りマップ（境内マップ完成後に解放される第2段階）の次の1県を購入する
// 🗾 全国神社巡りマップ（境内マップ完成後に解放される第2段階）の神社を1つ参拝する（どの都道府県・神社からでも自由な順番でOK）
// 🔨 全国神社巡りマップ（境内マップ完成後に解放される第2段階）の神社パーツを1つ組み立てる。
// 1つの神社は「鳥居→参道→手水舎→社殿」の4パーツすべてが揃うと完成（参拝済み）になる
async function buyJapanShrinePart(prefKey, shrineKey, partKey) {
    if (!isShrineMapComplete()) {
        alert("🙅 全国神社巡りマップは、境内マップを完成させると解放されます。");
        return;
    }

    const pref = JAPAN_PREFECTURES.find(p => p.key === prefKey);
    if (!pref) return;
    const shrine = pref.shrines.find(s => s.key === shrineKey);
    if (!shrine) return;
    const part = SHRINE_BUILD_PARTS.find(p => p.key === partKey);
    if (!part) return;

    if (isJapanShrinePartOwned(shrine, part)) {
        alert("🔨 「" + shrine.name + "」の" + part.name + "はすでに組み立て済みです。");
        return;
    }

    const cost = getShrinePartCost(shrine, part);
    if (currentMoney < cost) {
        alert("🙅 所持金が足りません！\n「" + shrine.name + "」の" + part.name + "の建立には" + cost.toLocaleString() + "円必要です。");
        return;
    }

    currentMoney -= cost;
    japanShrinePartsOwned[shrine.key + ":" + part.key] = true;

    updateMoneyDisplay();
    playSE("se-coin");

    // ⛩️ このパーツで神社がちょうど完成したかを確認する
    const shrineJustCompleted = isJapanShrineComplete(shrine);
    let shrineCompleteMsg = "";
    let milestoneMsg = "";
    let prefCompleteMsg = "";
    let completeMsg = "";

    if (shrineJustCompleted) {
        shrineCompleteMsg = "\n\n⛩️【" + shrine.name + "、完成！】⛩️\n社殿が組み上がり、正式にご参拝いただけるようになりました！";

        // 🎉 節目（コンプリートした神社の数）に到達したらお祝い金を授与する
        const newCount = getJapanShrineOwnedCount();
        const milestone = MAP_JAPAN_MILESTONES.find(m => m.count === newCount);
        if (milestone) {
            currentMoney += milestone.prize;
            totalWinnings += milestone.prize;
            updateMoneyDisplay();
            recordHistory("🗾全国神社巡り・節目ボーナス", milestone.prize, currentMoney);
            milestoneMsg = "\n\n🎉【節目ボーナス！】🎉\n完成した神社が" + newCount + "社に達したお祝いに【" + milestone.prize.toLocaleString() + "円】を授かりました！";
        }

        // 🎏 その都道府県の神社をすべて完成し終えたらお祝いメッセージ
        if (isJapanPrefectureComplete(pref)) {
            prefCompleteMsg = "\n\n🎏【" + pref.name + "コンプリート！】🎏\n" + pref.name + "の神社をすべて完成させました！";
        }

        completeMsg = isShrineMapJapanComplete()
            ? "\n\n👑🗾【日本全国制覇！】🗾👑\n全国" + JAPAN_SHRINE_COUNT + "社すべての神社を完成させました！\n永続的に大吉ボーナス+" + (SHRINE_MAP_JAPAN_COMPLETE_BONUS * 100).toFixed(1) + "%を授かりました！"
            : "";
    }

    updateShrineMapUI();
    updateTitlesUI();
    await saveUserState();

    alert("🔨 「" + shrine.name + "」の" + part.emoji + part.name + "が組み上がりました！\n（" + pref.name + "）" + shrineCompleteMsg + milestoneMsg + prefCompleteMsg + completeMsg);
}

// 🏯 全国神社巡りマップ・第二弾「奥宮・摂社」のパーツを1つ組み立てる。
// 元の神社（鳥居〜社殿）が完成した後だけ挑戦できる、より高額な深掘りコンテンツ
async function buyOkumiyaPart(prefKey, shrineKey, partKey) {
    const pref = JAPAN_PREFECTURES.find(p => p.key === prefKey);
    if (!pref) return;
    const shrine = pref.shrines.find(s => s.key === shrineKey);
    if (!shrine) return;

    if (!isJapanShrineComplete(shrine)) {
        alert("🙅 「" + shrine.name + "」の奥宮は、まず本殿（鳥居〜社殿）を完成させると建立できるようになります。");
        return;
    }

    const part = OKUMIYA_BUILD_PARTS.find(p => p.key === partKey);
    if (!part) return;

    if (isOkumiyaPartOwned(shrine, part)) {
        alert("🏯 「" + shrine.name + "」の奥宮の" + part.name + "はすでに組み立て済みです。");
        return;
    }

    const cost = getOkumiyaPartCost(shrine, part);
    if (currentMoney < cost) {
        alert("🙅 所持金が足りません！\n「" + shrine.name + "」奥宮の" + part.name + "の建立には" + cost.toLocaleString() + "円必要です。");
        return;
    }

    currentMoney -= cost;
    japanOkumiyaPartsOwned[shrine.key + ":" + part.key] = true;

    updateMoneyDisplay();
    playSE("se-coin");

    // 🏯 このパーツで奥宮がちょうど完成したかを確認する
    const okumiyaJustCompleted = isOkumiyaComplete(shrine);
    let okumiyaCompleteMsg = "";
    let milestoneMsg = "";
    let completeMsg = "";

    if (okumiyaJustCompleted) {
        okumiyaCompleteMsg = "\n\n🏯【" + shrine.name + "・奥宮、完成！】🏯\nさらに奥深い聖域が完成しました！";

        // 🎉 節目（完成した奥宮の数）に到達したらお祝い金を授与する
        const newCount = getOkumiyaCompleteCount();
        const milestone = MAP_OKUMIYA_MILESTONES.find(m => m.count === newCount);
        if (milestone) {
            currentMoney += milestone.prize;
            totalWinnings += milestone.prize;
            updateMoneyDisplay();
            recordHistory("🏯奥宮巡り・節目ボーナス", milestone.prize, currentMoney);
            milestoneMsg = "\n\n🎉【節目ボーナス！】🎉\n完成した奥宮が" + newCount + "社に達したお祝いに【" + milestone.prize.toLocaleString() + "円】を授かりました！";
        }

        completeMsg = isShrineMapOkumiyaComplete()
            ? "\n\n👑🏯【奥宮制覇！】🏯👑\n全国" + JAPAN_SHRINE_COUNT + "社すべての奥宮を完成させました！\n永続的に大吉ボーナス+" + (SHRINE_MAP_OKUMIYA_COMPLETE_BONUS * 100).toFixed(1) + "%を授かりました！"
            : "";
    }

    updateShrineMapUI();
    updateTitlesUI();
    await saveUserState();

    alert("🏯 「" + shrine.name + "」奥宮の" + part.emoji + part.name + "が組み上がりました！\n（" + pref.name + "）" + okumiyaCompleteMsg + milestoneMsg + completeMsg);
}

// 🌾 夏越の大祓（6/25〜6/30）限定：「茅の輪くぐり」ボタン。半年分の「凶」「大凶」の累計を清算してご褒美を得る
async function nagoshiChinowaKuguri() {
    if (!isSeasonalEventActive("nagoshi")) return;

    if (nagoshiBadCount <= 0) {
        alert("🌾 まだ祓うべき凶事が記録されていません。ここまで清らかな参拝でしたね！");
        return;
    }

    unlockAllAudio();
    const clearedCount = nagoshiBadCount;
    const prize = Math.min(clearedCount * NAGOSHI_PRIZE_PER_BAD, NAGOSHI_PRIZE_CAP);

    currentMoney += prize;
    totalWinnings += prize;
    nagoshiBadCount = 0;
    nagoshiLastResetYear = new Date().getFullYear();

    updateMoneyDisplay();
    playSE("se-win");
    recordHistory("🌾夏越の大祓・茅の輪くぐり", prize, currentMoney);
    updateNagoshiUI();
    updateTitlesUI();
    await saveUserState();

    alert(
        "⛩️🌾【夏越の大祓・茅の輪くぐり】🌾⛩️\n" +
        "半年間の「凶」「大凶」の穢れ、合計" + clearedCount + "回分をすべて祓い清めました！\n" +
        "神様から清めの証として【" + prize.toLocaleString() + "円】を授かりました！\n" +
        "（称号「茅の輪をくぐりし者」を獲得！）"
    );
}

// 🔔 年末（12/26〜12/31）限定：「除夜の鐘をつく」ボタン。1日108回まで、つき終えると煩悩祓いのご褒美
async function ringJoyaBell() {
    if (!isSeasonalEventActive("nenmatsu")) return;

    unlockAllAudio();
    const today = todayStr();
    if (joyaBellDate !== today) {
        joyaBellDate = today;
        joyaBellCount = 0;
    }

    if (joyaBellCount >= JOYA_BELL_TARGET) return;

    joyaBellCount++;
    playSE("se-coin");
    updateJoyaBellUI();

    if (joyaBellCount >= JOYA_BELL_TARGET) {
        const currentYear = new Date().getFullYear();
        currentMoney += JOYA_BELL_COMPLETE_PRIZE;
        totalWinnings += JOYA_BELL_COMPLETE_PRIZE;
        joyaBellCompleteYear = currentYear;

        updateMoneyDisplay();
        playSE("se-win");
        recordHistory("🔔除夜の鐘・煩悩祓い", JOYA_BELL_COMPLETE_PRIZE, currentMoney);
        updateTitlesUI();
        await saveUserState();

        setTimeout(() => {
            alert(
                "🔔✨【百八の煩悩祓い、達成！】✨🔔\n" +
                "除夜の鐘を108回つき終え、一年の煩悩が祓われました。\n" +
                "神様から【" + JOYA_BELL_COMPLETE_PRIZE.toLocaleString() + "円】を授かりました！\n" +
                "（称号「百八の煩悩祓い」を獲得！）良いお年を…"
            );
        }, 300);
    } else {
        await saveUserState();
    }
}