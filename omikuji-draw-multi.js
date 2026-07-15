// ============================================================
// omikuji-draw-multi.js
// 🔥 10連おみくじのメイン処理
// ============================================================

function omikuji10() {
    unlockAllAudio();

    const imgElement = document.querySelector("#fortune-image");
    const placeholder = document.querySelector("#placeholder-text");
    const submitBtn = document.querySelector("#submitBtn");
    const drawBtn = document.querySelector(".btn-draw");
    const draw10Btn = document.querySelector("#draw10Btn");
    const randomNumSpan = document.querySelector("#randomNumber");

    let drawCost10 = taianActive ? 5000 : 10000;
    if (getCommunityTier(communityDraws) >= 3) drawCost10 -= SHRINE_TIER3_DISCOUNT;

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

    let resultsCount = {"大大吉": 0, "大吉": 0, "神吉": 0, "吉": 0, "中吉": 0, "小吉": 0, "末吉": 0, "凶": 0, "大凶": 0, "大大凶": 0};
    let totalPrize = 0;
    let lastRandomNum = 0;
    let gotDaikyouIn10 = false;
    let gotDaidaikyouIn10 = false;
    let totalDoomTax = 0; // 💡10連の中で取られた大凶(試練)お祓い料の合計
    let exemptedCount = 0; // 💡10連の中で免除された大凶(試練)の数
    let allDropped = []; // 10連まとめてのドロップ一覧
    let totalFukuDaruma = 0; // 10連の中で発生した福だるまボーナスの合計

    // 🌙 現在の時間帯を判定（丑三つ時は大大吉・大大凶の確率が跳ね上がる。10連は1回だけ判定）
    const timePeriod10 = getTimePeriod();
    if (timePeriod10 === "ushimitsu") gotUshimitsuDraw = true;
    const daidaikichiThreshold10 = timePeriod10 === "ushimitsu" ? DAIDAIKICHI_THRESHOLD_USHIMITSU : DAIDAIKICHI_THRESHOLD_NORMAL;
    const daidaikyouThreshold10 = timePeriod10 === "ushimitsu" ? DAIDAIKYOU_THRESHOLD_USHIMITSU : DAIDAIKYOU_THRESHOLD_NORMAL;

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
            trackMissionDraw10(); // 🎯「大盤振る舞い」ミッションの進捗を更新

            for (let i = 0; i < 10; i++) {
                let okj = Math.random();

                // 🍀🐱🏺🎊📖 大吉運アップ効果
                let daikichiBonus = 0;
                if (hasEffect("daikichi_up")) daikichiBonus += 0.03;
                if (hasShopEffect("manekineko")) daikichiBonus += 0.05;
        if (hasShopEffect("gohei")) daikichiBonus += 0.12;
        if (hasShopEffect("amaterasu")) daikichiBonus += 0.08;
        if (hasShopEffect("ikigami")) daikichiBonus += 0.15;
                daikichiBonus += URN_LEVELS[urnLevel].bonus;
        daikichiBonus += kamikichiBonus;
                if (taianActive) daikichiBonus += 0.002;
                if (dexRewardClaimed) daikichiBonus += 0.01;
        if (ishikoro500Claimed) daikichiBonus += 0.01;
        if (equippedCollectible === "tanzaku") daikichiBonus += 0.01;
        if (isTanabataLuckActive()) daikichiBonus += TANABATA_DAIKICHI_BONUS; // 🎋 七夕の願いが叶った日
                if (daikichiBonus > 0) okj = Math.min(1, okj + daikichiBonus);

                if (i === 9) lastRandomNum = okj;

                let prize = 0;
                let isExtremeTier10 = false;
                let resultName10 = "";

                if (okj >= KAMIKICHI_THRESHOLD) {
                    resultsCount["神吉"]++;
                    resultName10 = "神吉";
                    prize = KAMIKICHI_PRIZE;
                    isExtremeTier10 = true;
                    gotKamikichi = true;
            kamikichiBonus += KAMIKICHI_BONUS_PER_DRAW;
                } else if (okj >= daidaikichiThreshold10) {
                    resultsCount["大大吉"]++;
                    resultName10 = "大大吉";
                    prize = DAIDAIKICHI_PRIZE;
                    isExtremeTier10 = true;
                    gotDaidaikichi = true;
                } else if (okj >= 0.99) {
                    resultsCount["大吉"]++;
                    resultName10 = "大吉";
                    prize = 100000;
                } else if (okj >= 0.95) {
                    resultsCount["吉"]++;
                    resultName10 = "吉";
                    prize = 10000;
                } else if (okj >= 0.85) {
                    resultsCount["中吉"]++;
                    resultName10 = "中吉";
                    prize = 2000;
                } else if (okj >= 0.7) {
                    resultsCount["小吉"]++;
                    resultName10 = "小吉";
                    prize = 1000;
                } else if (okj >= 0.6) {
                    resultsCount["末吉"]++;
                    resultName10 = "末吉";
                    prize = 500;
                } else if (okj >= 0.1) {
                    resultsCount["凶"]++;
                    resultName10 = "凶";
                    prize = 0;
                } else if (okj >= daidaikyouThreshold10) {
                    resultsCount["大凶"]++;
                    resultName10 = "大凶";
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
                if (hasShopEffect("ikigami")) tax = Math.floor(tax / 2);
                        if (kiyomeShioActive) tax = Math.floor(tax / 2); // 🧂「清めの塩」ミッション報酬効果

                        totalDoomTax += tax;
                        prize = -tax;
                    }
                } else {
                    // 💀 激レア「大大凶」：免除なしで、その時点の残高の80%を没収
                    resultsCount["大大凶"]++;
                    resultName10 = "大大凶";
                    isExtremeTier10 = true;
                    gotDaidaikyou = true;
                    gotDaidaikyouIn10 = true;

                    const tax = Math.floor((currentMoney + totalPrize) * 0.8);
                    totalDoomTax += tax;
                    prize = -tax;
                }

                // 🐟📜 獲得賞金アップ効果
                if (!isExtremeTier10 && prize > 0) {
                    let prizeMultiplier = 1;
                    if (hasEffect("prize_up")) prizeMultiplier *= 1.1;
                    if (hasShopEffect("gofu")) prizeMultiplier *= 1.1;
                    if (hasShopEffect("oogi")) prizeMultiplier *= 1.15;
            if (hasShopEffect("amaterasu")) prizeMultiplier *= 1.2;
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
                if (okj >= KAMIKICHI_THRESHOLD) markDex("神吉");
                else if (okj >= daidaikichiThreshold10) markDex("大大吉");
                else if (okj >= 0.99) markDex("大吉");
                else if (okj >= 0.95) markDex("吉");
                else if (okj >= 0.85) markDex("中吉");
                else if (okj >= 0.7) markDex("小吉");
                else if (okj >= 0.6) markDex("末吉");
                else if (okj >= 0.1) markDex("凶");
                else if (okj >= daidaikyouThreshold10) markDex("大凶");
                else markDex("大大凶");

                // 🏘️ みんなの参拝合計を更新（神社改築コミュニティ目標）
                incrementCommunityDraws();

                // 🎊 福だるまボーナス抽選
                const fukuDarumaPull = rollFukuDarumaAmount();
                if (fukuDarumaPull) {
                    totalFukuDaruma += fukuDarumaPull;
                }

                // 🎖️ 称号判定用の累計データを更新（10連の1回1回もカウント）
                totalDraws++;
                if (okj >= 0.99 && okj < daidaikichiThreshold10) totalDaikichi++;
                totalProfit += (prize - (drawCost10 / 10));
                if (prize > 0) totalWinnings += prize;

                totalPrize += prize;
                checkZoromeBonus(okj);
                trackMissionDraw(resultName10, prize); // 🎯 デイリーミッション（参拝回数・凶克服・連勝街道・大金稼ぎ等）の進捗を更新
            }

            if (gotDaidaikyouIn10 || gotDaikyouIn10) {
                // 🔔🌳 フィーバー回数+1効果（大大凶が混ざっていれば基礎5回・20倍、通常の試練なら3回・10倍）
                feverCount = gotDaidaikyouIn10 ? 5 : 3;
                feverTier = gotDaidaikyouIn10 ? 2 : 1;
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
                if (resultsCount["大凶"] > 0 || resultsCount["大大凶"] > 0) {
                    playSE("se-doom");
                } else {
                    playSE("se-lose");
                }
            }

            if (resultsCount["大吉"] > 0 || resultsCount["大大吉"] > 0 || resultsCount["神吉"] > 0) {
                startConfetti();
                if (isNatsumatsuriFestivalActive()) startFireworks();
            }
            if (resultsCount["大凶"] > 0 || resultsCount["大大凶"] > 0) startDoomEffect();

            setTimeout(() => {
                let alertMsg =
                    "🔥【10連おみくじ結果発表】🔥\n" +
                    "--------------------------------\n" +
                    "☀️ 大大吉： " + resultsCount["大大吉"] + "回\n" +
                    "🎉 大吉： " + resultsCount["大吉"] + "回\n" +
                    "😊 神吉： " + resultsCount["神吉"] + "回\n" +
                    "✨ 吉 ： " + resultsCount["吉"] + "回\n" +
                    "🎵 中吉： " + resultsCount["中吉"] + "回\n" +
                    "👍 小吉： " + resultsCount["小吉"] + "回\n" +
                    "😄 末吉： " + resultsCount["末吉"] + "回\n" +
                    "😢 凶 ： " + resultsCount["凶"] + "回\n" +
                    "⚔️ 神の試練(大凶枠)： " + resultsCount["大凶"] + "回\n" +
                    "💀 大大凶： " + resultsCount["大大凶"] + "回\n" +
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

                if (gotDaidaikyouIn10) {
                    alertMsg += "\n\n💀🔥【大厄落としフィーバー発動！】🔥💀\n「大大凶」を乗り越えたため、次の単発おみくじ" + feverCount + "回は【大吉確率20倍(20%)】になります！";
                } else if (gotDaikyouIn10) {
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