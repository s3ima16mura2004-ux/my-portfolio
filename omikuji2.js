const omikujiImages = [
    "omikuji_daikichi.png",
    "omikuji_kichi.png",
    "omikuji_chuukichi.png",
    "omikuji_syoukichi.png",
    "omikuji_suekichi.png",
    "omikuji_kyou.png",
    "omikuji_daikyou.png"
];

// 🎋 ラッキーアイテムの一覧（index.html / top.jsと同じ内容）
const LUCKY_ITEMS = [
    { key: "daikichi_up", emoji: "🍀", name: "四つ葉のクローバー", desc: "今日1日、大吉運が少しだけアップ！" },
    { key: "prize_up", emoji: "🐟", name: "立派な鯛", desc: "今日1日、獲得賞金が10%アップ！" },
    { key: "tax_half", emoji: "🐍", name: "白蛇の抜け殻", desc: "今日1日、大凶のお祓い料がさらに半額に！" },
    { key: "fever_extra", emoji: "🔔", name: "縁起の良い鈴の音", desc: "今日1日、大凶時のフィーバー回数が+1回に！" },
    { key: "zorome_up", emoji: "🌟", name: "流れ星のかけら", desc: "今日1日、ゾロ目ボーナスが+2,000円に！" }
];

let currentUser = null;      // ログイン中のユーザー名
let currentMoney = 10000;    // Firestoreから読み込むまでの仮の初期値
let feverCount = 0;          // フィーバータイム（大吉確率UP）の残り回数
let prayDate = "";           // 最後にお祈りボーナスを使った日
let prayCount = 0;           // その日にお祈りした回数
let luckyItemKey = "";       // 今日のラッキーアイテムのキー

// 「結果を送信する」ボタンを押すまでの間、おみくじ結果を貯めておく配列
let historyBuffer = [];

// 指定したキーの本日のラッキーアイテム効果が有効かどうか
function hasEffect(key) {
    return luckyItemKey === key;
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

// 所持金・フィーバー回数・お祈り回数をFirestoreに保存する（ユーザーごとのデータ永続化）
async function saveUserState() {
    if (!currentUser || !window.omikujiDB || !window.omikujiDoc || !window.omikujiUpdateDoc) return;
    try {
        await window.omikujiUpdateDoc(window.omikujiDoc(window.omikujiDB, "users", currentUser), {
            money: currentMoney,
            feverCount: feverCount,
            prayDate: prayDate,
            prayCount: prayCount
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
    const moneySpan = document.querySelector("#money");
    if (moneySpan) moneySpan.innerHTML = currentMoney;

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
        const moneySpan = document.querySelector("#money");
        if (moneySpan) moneySpan.innerHTML = currentMoney;

        playSE("se-win");
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
    const moneySpan = document.querySelector("#money");

    if (currentMoney < 1000) {
        alert("🙅 料金が足りません！\n神様にお祈りして資金を分けてもらいましょう！");
        checkBankruptcy();
        return;
    }

    currentMoney -= 1000;
    if (moneySpan) moneySpan.innerHTML = currentMoney;

    let result = "大吉";

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

        // 🍀ラッキーアイテム「四つ葉のクローバー」で大吉運がわずかにアップ
        if (hasEffect("daikichi_up")) {
            okj = Math.min(1, okj + 0.03);
        }

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

            // 💡 20%の確率(Math.random() < 0.2)で「出世大凶（お祓い料免除）」
            if (Math.random() < 0.2) {
                isDoomExempted = true;
                actualDoomTax = 0;
            } else {
                // 💡 免除されなかったら、現在のお財布の「半分（50%）」を計算（端数切り捨て）
                actualDoomTax = Math.floor(currentMoney * 0.5);

                // 🐍ラッキーアイテム「白蛇の抜け殻」でお祓い料がさらに半額に
                if (hasEffect("tax_half")) {
                    actualDoomTax = Math.floor(actualDoomTax / 2);
                }
            }
            prizeMoney = -actualDoomTax; // マイナスとして計算
        }

        // 🐟ラッキーアイテム「立派な鯛」で獲得賞金が10%アップ（プラスの賞金のみ対象）
        if (hasEffect("prize_up") && prizeMoney > 0) {
            prizeMoney = Math.floor(prizeMoney * 1.1);
        }

        if (imgElement) imgElement.src = imgSrc;
        if (hiddenResult) hiddenResult.value = resultName;

        currentMoney += prizeMoney;
        if (moneySpan) moneySpan.innerHTML = currentMoney;

        recordHistory(resultName, prizeMoney, currentMoney);

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
            // 🔔ラッキーアイテム「縁起の良い鈴の音」でフィーバー回数+1
            feverCount = hasEffect("fever_extra") ? 4 : 3;
        }

        saveUserState();

        setTimeout(() => {
            if (resultName === "大吉") {
                alert("🎉 おめでとうございます！【大吉】です！ 🎉\nなんと最高額の 100,000円 が当選しました！");
            } else if (resultName === "吉") {
                alert("✨ やりました！【吉】です！ ✨\nみごと 10,000円 が当選しました！");
            } else if (resultName === "中吉") {
                alert("♫ いいですね！【中吉】です！ ♫\n2,000円 が当選しました！");
            } else if (resultName === "小吉") {
                alert("👍 堅実！【小吉】です！ 👍\n1,000円 が当選しました！(元取れた！)");
            } else if (resultName === "末吉") {
                alert("😄 ちょっぴりお小遣い！【末吉】です！ 😄\n500円 が当選しました！");
            } else if (resultName === "凶") {
                alert("😢残念！【凶】です！ 😢\n景品はありません。はずれです！");
            } else if (resultName === "大凶") {
                if (isDoomExempted) {
                    alert("😱【大凶】を引いてしまった…が！？\n\n🌟「出世大凶」発動！🌟\n神様「今回は特別にお祓い料（免除）にしてしんぜよう！」\nお祓い料はなんと【0円】です！\n\n🔥さらに！災い転じて福となす！次の単発おみくじ3回分は【大吉の確率が10倍(10%)】になります！");
                } else {
                    alert("😱 大凶を引いてしまいました…！ 😱\nお祓い料として、お財布の半額【" + actualDoomTax.toLocaleString() + "円】を徴収いたします。\n\n🔥しかし！災い転じて福となす！次の単発おみくじ3回分は【大吉の確率が10倍(10%)】に跳ね上がります！");
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
    const moneySpan = document.querySelector("#money");
    const randomNumSpan = document.querySelector("#randomNumber");

    if (currentMoney < 10000) {
        alert("🙅 資金が足りません！\n10連おみくじを引くには【10,000円】必要です。");
        return;
    }

    currentMoney -= 10000;
    if (moneySpan) moneySpan.innerHTML = currentMoney;

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

                // 🍀ラッキーアイテム「四つ葉のクローバー」で大吉運がわずかにアップ
                if (hasEffect("daikichi_up")) {
                    okj = Math.min(1, okj + 0.03);
                }

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

                    // 💡10連おみくじの中での大凶も同じルールを適用
                    if (Math.random() < 0.2) {
                        exemptedCount++; // 免除！
                    } else {
                        // 半分持っていかれる（連続で大凶が出ると、その都度残り金額の半分が減っていきます）
                        let tax = Math.floor((currentMoney + totalPrize) * 0.5);

                        // 🐍ラッキーアイテム「白蛇の抜け殻」でお祓い料がさらに半額に
                        if (hasEffect("tax_half")) {
                            tax = Math.floor(tax / 2);
                        }

                        totalDoomTax += tax;
                        prize = -tax;
                    }
                }

                // 🐟ラッキーアイテム「立派な鯛」で獲得賞金が10%アップ（プラスの賞金のみ対象）
                if (hasEffect("prize_up") && prize > 0) {
                    prize = Math.floor(prize * 1.1);
                }

                totalPrize += prize;
                checkZoromeBonus(okj);
            }

            if (gotDaikyouIn10) {
                // 🔔ラッキーアイテム「縁起の良い鈴の音」でフィーバー回数+1
                feverCount = hasEffect("fever_extra") ? 4 : 3;
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
            if (moneySpan) moneySpan.innerHTML = currentMoney;

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
                    alertMsg += "\n\n🔥【厄落としフィーバー発動！】🔥\n大凶が含まれていたため、次の単発おみくじ3回は【大吉確率10倍(10%)】になります！";
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

    const moneySpan = document.querySelector("#money");
    const luckyBox = document.querySelector("#lucky-item-box");
    const luckyName = document.querySelector("#lucky-item-name");
    const luckyDesc = document.querySelector("#lucky-item-desc");
    const drawBtn = document.querySelector(".btn-draw");
    const draw10Btn = document.querySelector("#draw10Btn");

    // Firestoreからのデータ取得が終わるまで、おみくじボタンを一旦ロックしておく
    if (drawBtn) drawBtn.disabled = true;
    if (draw10Btn) draw10Btn.disabled = true;

    try {
        // index.html / omikuji2.html内のFirebase初期化(モジュール)が終わるのを少し待つ
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
        }

        if (moneySpan) moneySpan.innerHTML = currentMoney;

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
