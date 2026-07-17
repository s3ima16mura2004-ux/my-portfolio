// ============================================================
// omikuji-draw-single.js
// ⛩️ 単発おみくじ（1回引き）のメイン処理
// ============================================================

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
        const rawOkj = okj; // 🛡️ 神吉の判定専用に、ボーナス適用前の生の乱数を保存しておく
        let isFeverActiveThisTurn = false;

        // 🕛 隠し要素：ゾロ目時刻の「神様の気まぐれ」チェック
        checkKimagureTime();

        if (feverCount > 0) {
            isFeverActiveThisTurn = true;
            feverCount--;
            const feverThreshold = feverTier === 2 ? 0.80 : 0.90;
            if (okj >= feverThreshold) {
                okj = 0.995;
            }
            if (feverCount === 0) feverTier = 1; // フィーバー終了時は次回に備えて通常倍率に戻す
        }

        // 🍀🐱🏺🎊📖 大吉運アップ効果（ラッキーアイテム＋ショップの招き猫＋壺＋大安吉日＋図鑑報酬は加算で重複可）
        let daikichiBonus = 0;
        if (hasEffect("daikichi_up")) daikichiBonus += 0.03;
        if (hasShopEffect("manekineko")) daikichiBonus += 0.05;
        if (hasShopEffect("gohei")) daikichiBonus += 0.12;
        if (hasShopEffect("amaterasu")) daikichiBonus += 0.08;
        if (hasShopEffect("ikigami")) daikichiBonus += 0.15;
        daikichiBonus += URN_LEVELS[urnLevel].bonus;
        daikichiBonus += COMPANION_LEVELS[getCompanionLevelIndex()].bonus; // 🐱 相棒「招き猫」の成長ボーナス
        daikichiBonus += kamikichiBonus;
        if (taianActive) daikichiBonus += 0.002;
        if (dexRewardClaimed) daikichiBonus += 0.01;
        if (ishikoro500Claimed) daikichiBonus += 0.01;
        if (equippedCollectible === "tanzaku") daikichiBonus += 0.01;
        if (isTanabataLuckActive()) daikichiBonus += TANABATA_DAIKICHI_BONUS; // 🎋 七夕の願いが叶った日
        if (hasShopEffect("wakaba_omamori")) daikichiBonus += 0.04; // 🌱 春の芽吹き限定ショップアイテム
        if (isShrineMapComplete()) daikichiBonus += SHRINE_MAP_COMPLETE_BONUS; // 🗺️ 境内マップ完成の永続ボーナス
        if (isShrineMapJapanComplete()) daikichiBonus += SHRINE_MAP_JAPAN_COMPLETE_BONUS; // 🗾 全国神社巡り完成の永続ボーナス
        if (isShrineMapOkumiyaComplete()) daikichiBonus += SHRINE_MAP_OKUMIYA_COMPLETE_BONUS; // 🏯 奥宮制覇の永続ボーナス
        const usedHanamiDango = hanamiDangoActive;
        if (usedHanamiDango) daikichiBonus += HANAMI_DANGO_BONUS; // 🍡 お花見団子（次の1回だけ有効）
        daikichiBonus = Math.min(MAX_DAIKICHI_BONUS, daikichiBonus); // 🛡️ 積み上がり過ぎ防止の上限
        if (daikichiBonus > 0) okj = Math.min(1, okj + daikichiBonus);
        if (usedHanamiDango) hanamiDangoActive = false; // 使用済みとして予約状態を解除

        if (randomNumSpan) {
            const feverMultiplierText = feverTier === 2 ? "20倍" : "10倍";
            let feverText = feverCount > 0 ? ` (🔥フィーバー残り: ${feverCount}回・大吉確率${feverMultiplierText})` : " (通常モード)";
            if (isFeverActiveThisTurn && feverCount === 0) feverText = " (🔥フィーバーラスト！)";
            randomNumSpan.innerHTML = okj.toFixed(4) + feverText;
        }

        let resultName = "";
        let imgSrc = "";
        let prizeMoney = 0;
        let isTrial = false;
        let isExtremeTier = false;
        let trialExtraMsg = "";

        // 🌙 現在の時間帯を判定（丑三つ時は大大吉・大大凶の確率が跳ね上がる）
        const timePeriod = getTimePeriod();
        if (timePeriod === "ushimitsu") gotUshimitsuDraw = true;
        // 🎏 こどもの日（5/1〜5/5）は昇り龍にあやかり、大大吉以上ランクのしきい値が少し下がる（＝出現率アップ）
        const kodomonohiActive = isKodomonohiActive();
        const daidaikichiThreshold = (timePeriod === "ushimitsu" ? DAIDAIKICHI_THRESHOLD_USHIMITSU : DAIDAIKICHI_THRESHOLD_NORMAL)
            - (kodomonohiActive ? KODOMONOHI_DAIDAIKICHI_REDUCTION : 0);
        const daidaikyouThreshold = timePeriod === "ushimitsu" ? DAIDAIKYOU_THRESHOLD_USHIMITSU : DAIDAIKYOU_THRESHOLD_NORMAL;
        const kamikichiThreshold = KAMIKICHI_THRESHOLD - (kodomonohiActive ? KODOMONOHI_KAMIKICHI_REDUCTION : 0);

        // 🎂 誕生日の「大大吉確定チケット」があれば、確率計算を飛ばして確定で大大吉にする（単発おみくじ限定）
        const usedBirthdayTicket = birthdayTicket;
        if (usedBirthdayTicket) {
            birthdayTicket = false;
            isExtremeTier = true;
            imgSrc = "../images/omikuji_daidaikichi.jpg";
            resultName = "大大吉";
            prizeMoney = DAIDAIKICHI_PRIZE;
            gotDaidaikichi = true;
            if (kodomonohiActive) gotKodomonohiExtreme = true; // 🎏 こどもの日の称号判定
        } else if (rawOkj >= kamikichiThreshold) {
            // 😊 超激レア「神吉」（大大吉よりもさらに珍しい特別枠）
            // 🛡️ ここだけは大吉運ボーナス適用前の生の乱数(rawOkj)で判定し、アイテムや壺の積み上げの影響を受けないようにしている
            isExtremeTier = true;
            imgSrc = "../images/omikuji_kamikichi.jpg";
            resultName = "神吉";
            prizeMoney = KAMIKICHI_PRIZE;
            gotKamikichi = true;
            kamikichiBonus = Math.min(KAMIKICHI_BONUS_CAP, kamikichiBonus + KAMIKICHI_BONUS_PER_DRAW);
            if (kodomonohiActive) gotKodomonohiExtreme = true; // 🎏 こどもの日の称号判定
        } else if (okj >= daidaikichiThreshold) {
            // ☀️ 激レア「大大吉」
            isExtremeTier = true;
            imgSrc = "../images/omikuji_daidaikichi.jpg";
            resultName = "大大吉";
            prizeMoney = DAIDAIKICHI_PRIZE;
            gotDaidaikichi = true;
            if (kodomonohiActive) gotKodomonohiExtreme = true; // 🎏 こどもの日の称号判定
        } else if (okj >= 0.99) {
            imgSrc = "../images/omikuji_daikichi.png";
            resultName = "大吉";
            prizeMoney = 100000;
        } else if (okj >= 0.95) {
            imgSrc = "../images/omikuji_kichi.png";
            resultName = "吉";
            prizeMoney = 10000;
        } else if (okj >= 0.85) {
            imgSrc = "../images/omikuji_chuukichi.png";
            resultName = "中吉";
            prizeMoney = 2000;
        } else if (okj >= 0.7) {
            imgSrc = "../images/omikuji_syoukichi.png";
            resultName = "小吉";
            prizeMoney = 1000;
        } else if (okj >= 0.6) {
            imgSrc = "../images/omikuji_suekichi.png";
            resultName = "末吉";
            prizeMoney = 500;
        } else if (okj >= 0.1) {
            imgSrc = "../images/omikuji_kyou.png";
            resultName = "凶";
            prizeMoney = 0;
        } else if (okj >= daidaikyouThreshold) {
            // ⚔️「大凶」の代わりに「神の試練」が発生（挑戦するか選べる）
            isTrial = true;
            const trialOutcome = resolveTrial();
            resultName = trialOutcome.resultName;
            imgSrc = trialOutcome.imgSrc;
            prizeMoney = trialOutcome.prizeMoney;
            trialExtraMsg = trialOutcome.extraMsg;
        } else {
            // 💀 激レア「大大凶」：免除なしで所持金の80%を没収する代わりに、大きなフィーバーで挽回のチャンスを与える
            isExtremeTier = true;
            imgSrc = "../images/omikuji_daidaikyou.jpg";
            resultName = "大大凶";
            const tax = Math.floor(currentMoney * 0.8);
            prizeMoney = -tax;
            gotDaidaikyou = true;

            feverCount = 5;
            feverTier = 2; // 大大凶後は大吉確率20倍のフィーバーになる
            if (hasEffect("fever_extra")) feverCount++;
            if (hasShopEffect("chitose_ame")) feverCount += CHITOSE_AME_FEVER_BONUS; // 👘 七五三限定「千歳飴」でフィーバー延長
            if (equippedCollectible === "shinboku") {
                feverCount++;
                consumeCollectible("shinboku");
            }
        }

        // 🐟📜 獲得賞金アップ効果（ラッキーアイテム＋ショップの護符は掛け算で重複可。神の試練・超激レア枠の結果には適用しない）
        if (!isTrial && !isExtremeTier && prizeMoney > 0) {
            let prizeMultiplier = 1;
            if (hasEffect("prize_up")) prizeMultiplier *= 1.1;
            if (hasShopEffect("gofu")) prizeMultiplier *= 1.1;
            if (hasShopEffect("oogi")) prizeMultiplier *= 1.15;
            if (hasShopEffect("amaterasu")) prizeMultiplier *= 1.2;
            if (ownedFriends.shirohebi) prizeMultiplier *= 1.05; // 🐍 白蛇の相棒（賽銭箱で常時+5%）
            if (prizeMultiplier > 1) prizeMoney = Math.floor(prizeMoney * prizeMultiplier);
        }

        if (imgElement) imgElement.src = imgSrc;
        if (hiddenResult) hiddenResult.value = resultName;

        currentMoney += prizeMoney;
        updateMoneyDisplay();
        checkLuckyMoneyWhim();

        trackMissionDraw(resultName, prizeMoney); // 🎯 デイリーミッション（参拝回数・凶克服・連勝街道・大金稼ぎ等）の進捗を更新
        trackNagoshiBadLuck(resultName, prizeMoney); // 🌾 夏越の大祓「茅の輪くぐり」用の凶事カウントを更新

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
        updateBirthdayTicketUI();

        // 📖 図鑑に記録
        markDex(resultName);

        // 🏘️ みんなの参拝合計を更新（神社改築コミュニティ目標）
        incrementCommunityDraws();

        // 🎊 福だるまボーナス抽選（神社改築ティア2で解放）
        const fukuDarumaWon = rollFukuDaruma();

        // 🎅 クリスマス限定「サンタの袋」の抽選
        const santaBagWon = rollSantaBag();

        recordHistory(resultName, prizeMoney, currentMoney);
        saveUserState();

        if (drawBtn) drawBtn.disabled = false;
        if (submitBtn) submitBtn.disabled = false;

        if (resultName === "大大吉") {
            playSE("se-win");
            startConfetti();
            startConfetti();
            if (isNatsumatsuriFestivalActive()) startFireworks();
        } else if (resultName === "大吉" || resultName === "神吉" || resultName === "吉" || resultName === "中吉") {
            playSE("se-win");
            if (resultName === "大吉") {
                startConfetti();
                if (isNatsumatsuriFestivalActive()) startFireworks();
            }
        } else if (resultName === "凶") {
            playSE("se-lose");
        } else if (resultName === "大大凶") {
            playSE("se-doom");
            startDoomEffect();
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
            if (resultName === "大大吉") {
                alert((usedBirthdayTicket ? "🎂🎉【誕生日おめでとうございます！】🎉🎂\n大大吉確定チケットが発動しました！\n" : "☀️🎊【大大吉】🎊☀️\n") + "史上最高の奇跡です！神様が最大級の祝福をくださいました！\n【" + DAIDAIKICHI_PRIZE.toLocaleString() + "円】が当選しました！！！" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon) + santaBagToText(santaBagWon));
            } else if (resultName === "大吉") {
                alert("🎉 おめでとうございます！【大吉】です！ 🎉\nなんと最高額の 100,000円 が当選しました！" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon) + santaBagToText(santaBagWon));
            } else if (resultName === "神吉") {
                alert("😊✨【神吉】✨😊\n全ての中で最も稀なる吉兆…神様との特別な縁が結ばれました！\n【" + KAMIKICHI_PRIZE.toLocaleString() + "円】を授かり、大吉運が永久に+" + (KAMIKICHI_BONUS_PER_DRAW * 100).toFixed(1) + "%上昇しました！(現在の神吉ボーナス合計：+" + (kamikichiBonus * 100).toFixed(1) + "%)" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon) + santaBagToText(santaBagWon));
            } else if (resultName === "吉") {
                alert("✨ やりました！【吉】です！ ✨\nみごと 10,000円 が当選しました！" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon) + santaBagToText(santaBagWon));
            } else if (resultName === "中吉") {
                alert("♫ いいですね！【中吉】です！ ♫\n2,000円 が当選しました！" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon) + santaBagToText(santaBagWon));
            } else if (resultName === "小吉") {
                alert("👍 堅実！【小吉】です！ 👍\n1,000円 が当選しました！(元取れた！)" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon) + santaBagToText(santaBagWon));
            } else if (resultName === "末吉") {
                alert("😄 ちょっぴりお小遣い！【末吉】です！ 😄\n500円 が当選しました！" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon) + santaBagToText(santaBagWon));
            } else if (resultName === "凶") {
                alert("😢残念！【凶】です！ 😢\n景品はありません。はずれです！" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon) + santaBagToText(santaBagWon));
            } else if (resultName === "大大凶") {
                alert("💀⚡【大大凶】⚡💀\n史上最悪の凶事です…お財布の80%【" + Math.abs(prizeMoney).toLocaleString() + "円】が没収されました。\n\n🔥しかし！この上ない災いは、この上ない福に転じます！次の単発おみくじ" + feverCount + "回分は【大吉の確率が20倍(20%)】になります！" + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon) + santaBagToText(santaBagWon));
                stopDoomEffect();
            } else if (isTrial) {
                alert(trialExtraMsg + dropsToText(dropped) + fukuDarumaToText(fukuDarumaWon) + santaBagToText(santaBagWon));
                stopDoomEffect();
            }

            checkZoromeBonus(okj);
            checkBankruptcy();
        }, 200);
    }
}