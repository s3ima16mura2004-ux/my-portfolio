// ============================================================
// omikuji-draw-helpers.js
// ⚔️🌟 おみくじ抽選まわりの補助ロジック
// 「神の試練」判定、隠し要素（ゾロ目・気まぐれ時刻など）、
// お祈りボーナス・破産チェックをまとめている。
// ============================================================

// ============================================================
// omikuji-draw.js
// ⛩️ おみくじを引くメイン処理（単発・10連）
// 確率抽選・演出・結果反映など、ゲームの中核ロジック。
// ============================================================

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

    trackMissionPray(); // 🎯「お祈りの感謝」ミッションの進捗を更新

    saveUserState();

    alert("🙏 神様が哀れんで 3,000円 を授けてくれました！\n(今日のお祈り： " + prayCount + " / 3回)");
}
function checkBankruptcy() {
    const bonusArea = document.querySelector("#bonus-area");
    const bonusBtn = document.querySelector("#bonusBtn");
    refreshPrayDay();

    if (currentMoney < 1000) {
        if (bonusArea) bonusArea.style.display = "block";

        if (prayCount >= 3) {
            // 💸 資金が尽きても自動的にはトップページへ遷移しない（プレイヤーの操作に任せる）
            wentBankruptToday = true; // 🎯「お財布の達人」ミッション判定用
            saveUserState();
            alert("💸【ゲームオーバー】💸\nお財布が空っぽになり、本日の神様の救済も使い切りました。\n「トップに戻る」ボタンから戻るか、明日また挑戦してください。");
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
function resolveTrial() {
    let outcome;

    // 🐉 龍神の逆鱗が発動中なら、確認なしで自動的に試練に成功する
    if (hasShopEffect("ryujin")) {
        const winAmount = currentMoney;
        outcome = {
            resultName: "神の試練(龍神の加護)",
            imgSrc: "../images/omikuji_daikichi.png",
            prizeMoney: winAmount,
            extraMsg: "🐉【龍神の逆鱗】🐉\n龍神の力で、確認するまでもなく試練に打ち勝ちました！\n所持金が2倍になりました！",
            feverAwarded: false
        };
    } else if (equippedCollectible === "koban") {
        // 🪙 黄金の小判を装備中なら、戦わずして自動的に試練に打ち勝つ
        const winAmount = currentMoney;
        outcome = {
            resultName: "神の試練(小判の加護)",
            imgSrc: "../images/omikuji_daikichi.png",
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
                    imgSrc: "../images/omikuji_daikichi.png",
                    prizeMoney: winAmount,
                    extraMsg: "⚔️【試練達成】⚔️\n見事に打ち勝ちました！所持金が2倍になりました！",
                    feverAwarded: false
                };
            } else {
                let tax = Math.floor(currentMoney * 0.5);
                if (hasEffect("tax_half")) tax = Math.floor(tax / 2);
                if (hasShopEffect("suzu")) tax = Math.floor(tax / 2);
                if (hasShopEffect("ikigami")) tax = Math.floor(tax / 2);
                if (kiyomeShioActive) tax = Math.floor(tax / 2); // 🧂「清めの塩」ミッション報酬効果
                if (ownedFriends.kitsune) tax = Math.floor(tax * 0.9); // 🦊 狐の相棒（賽銭箱で常時1割軽減）
                outcome = {
                    resultName: "神の試練(失敗)",
                    imgSrc: "../images/omikuji_daikyou.png",
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
                    imgSrc: "../images/omikuji_daikyou.png",
                    prizeMoney: 0,
                    extraMsg: "🌟【出世大凶】🌟\n挑戦を避けましたが、神様の温情でお祓い料は免除されました。",
                    feverAwarded: false
                };
            } else {
                let tax = Math.floor(currentMoney * 0.5);
                if (hasEffect("tax_half")) tax = Math.floor(tax / 2);
                if (hasShopEffect("suzu")) tax = Math.floor(tax / 2);
                if (hasShopEffect("ikigami")) tax = Math.floor(tax / 2);
                if (kiyomeShioActive) tax = Math.floor(tax / 2); // 🧂「清めの塩」ミッション報酬効果
                if (ownedFriends.kitsune) tax = Math.floor(tax * 0.9); // 🦊 狐の相棒（賽銭箱で常時1割軽減）
                outcome = {
                    resultName: "神の試練(回避)",
                    imgSrc: "../images/omikuji_daikyou.png",
                    prizeMoney: -tax,
                    extraMsg: "🙏 挑戦を避け、お祓い料として【" + tax.toLocaleString() + "円】を納めました。",
                    feverAwarded: true
                };
            }
        }
    }

    if (outcome.feverAwarded) {
        feverCount = 3;
        feverTier = 1; // 通常の試練は大吉確率10倍のフィーバー
        if (hasEffect("fever_extra")) feverCount++;
        if (hasShopEffect("chitose_ame")) feverCount += CHITOSE_AME_FEVER_BONUS; // 👘 七五三限定「千歳飴」でフィーバー延長
        if (equippedCollectible === "shinboku") {
            feverCount++;
            consumeCollectible("shinboku");
        }
    }

    return outcome;
}