const omikujiImages = [
    "omikuji_daikichi.png",
    "omikuji_kichi.png",
    "omikuji_chuukichi.png",
    "omikuji_syoukichi.png",
    "omikuji_suekichi.png",
    "omikuji_kyou.png",
    "omikuji_daikyou.png"
];

let currentMoney = 10000;

function playSE(id) {
    const audio = document.querySelector("#" + id);
    if (audio) {
        try {
            audio.currentTime = 0;
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log("スマホの制限により音の再生がブロックされました：", e);
                });
            }
        } catch (error) {
            console.log("オーディオ再生エラーを回避しました：", error);
        }
    }
}

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
    if (audio) {
        audio.pause();
    }
}

function startConfetti() {
    const overlay = document.querySelector("#confetti-overlay");
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

function startDoomEffect() {
    document.querySelector("#doom-overlay").style.opacity = "1";
    document.body.classList.add("doom-shake");
}
function stopDoomEffect() {
    document.querySelector("#doom-overlay").style.opacity = "0";
    document.body.classList.remove("doom-shake");
}

function omikuji() {
    const imgElement = document.querySelector("#image");
    const placeholder = document.querySelector("#placeholder-text");
    const submitBtn = document.querySelector("#submitBtn");
    const drawBtn = document.querySelector(".draw-btn");
    const hiddenResult = document.querySelector("#hiddenResult");
    const randomNumSpan = document.querySelector("#randomNumber");
    const moneySpan = document.querySelector("#money");

    if (currentMoney < 1000) {
        alert("🙅 料金が足りません！\nおみくじを引くには1,000円必要です。トップページに戻って出直しましょう！");
        window.location.href = "index.html";
        return;
    }

    playSE("se-coin");

    currentMoney -= 1000;
    moneySpan.innerHTML = currentMoney;

    drawBtn.disabled = true;
    if (submitBtn) submitBtn.disabled = true;

    if (placeholder) placeholder.style.display = "none";
    imgElement.classList.remove("hidden");
    imgElement.classList.add("shaking");

    startShuffleSE();

    let shuffleCount = 0;
    const shuffleInterval = setInterval(() => {
        const randomImg = omikujiImages[Math.floor(Math.random() * omikujiImages.length)];
        imgElement.src = randomImg;
        shuffleCount++;

        if (shuffleCount >= 10) {
            clearInterval(shuffleInterval);
            imgElement.classList.remove("shaking");

            stopShuffleSE();

            determineResult();
        }
    }, 80);
    
    function determineResult(){
        let okj = Math.random();
        randomNumSpan.innerHTML = okj.toFixed(4);

        let resultName = "";
        let imgSrc = "";
        let prizeMoney = 0;
        
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
            prizeMoney = -10000;
        }

        imgElement.src = imgSrc;
        if (hiddenResult) hiddenResult.value = resultName;

        currentMoney += prizeMoney;
        moneySpan.innerHTML = currentMoney;

        drawBtn.disabled = false;
        if (submitBtn) submitBtn.disabled = false;

        if (resultName === "大吉" || resultName === "吉" || resultName === "中吉") {
            playSE("se-win");
            if (resultName === "大吉") startConfetti();
        }else if (resultName === "凶" || resultName === "大凶") {
            playSE("se-lose");
            if (resultName === "大凶") startDoomEffect();
        }

        setTimeout(() => {
            if (resultName === "大吉") {
                alert("🎉 おめでとうございます！【大吉】です！ 🎉\nなんと最高額の 100,000円 が当選しました！");
            } else if (resultName === "吉") {
                alert("✨ やりました！【吉】です！ ✨\nみごと 10,000円 が当選しました！");
            } else if (resultName === "中吉") {
                alert("♫ いいですね！【中吉】です！ ♫\n2,000円 が当選しました！");
            } else if (resultName === "小吉") {
                alert("👍 堅実！【小吉】です！ 👍\n1,000円 が当選しました！（元取れた！）");
            } else if (resultName === "末吉") {
                alert("😄 ちょっぴりお小遣い！【末吉】です！ 😄\n500円 が当選しました！");
            } else if (resultName === "凶") {
                alert("😢残念！【凶】です！ 😢\n景品はありません。はずれです！");
            } else if (resultName === "大凶") {
                alert("😱 大凶を引いてしまいました…！ 😱\nお祓い料として【10,000円】を徴収いたします。");
                stopDoomEffect();
            }

            if (currentMoney <= 0) {
                alert("💸【破産してしまいました…】💸\nお財布が空っぽになりました。トップページに戻って出直しましょう！");
                window.location.href = "index.html";
            }
        }, 200);
    }
}

function omikuji10() {
    const imgElement = document.querySelector("#image");
    const placeholder = document.querySelector("#placeholder-text");
    const submitBtn = document.querySelector("#submitBtn");
    const drawBtn = document.querySelector(".draw-btn");
    const draw10Btn = document.querySelector("#draw10Btn");
    const moneySpan = document.querySelector("#money");
    const backToTopBtn = document.querySelector("#backToTopBtn");

    if (currentMoney < 10000) {
        alert("🙅 資金が足りません！\n10連おみくじを引くには【10,000円】必要です。");
        return;
    }

    playSE("se-coin");

    drawBtn.disabled = true;
    draw10Btn.disabled = true;
    if (submitBtn) submitBtn.disabled = true;

    currentMoney -= 10000;
    moneySpan.innerHTML = currentMoney;

    if (placeholder) placeholder.style.display = "none";
    imgElement.classList.remove("hidden");
    imgElement.classList.add("shaking");

    startShuffleSE();

    let resultsCount = {"大吉": 0, "吉": 0, "中吉": 0, "小吉": 0, "末吉": 0, "凶": 0, "大凶": 0};
    let totalPrize = 0;

    let shuffleCount = 0;
    const shuffleInterval = setInterval(() => {
        const randomImg = omikujiImages[Math.floor(Math.random() * omikujiImages.length)];
        imgElement.src = randomImg;
        shuffleCount++;

        if (shuffleCount >= 15) {
            clearInterval(shuffleInterval);
            imgElement.classList.remove("shaking");

            stopShuffleSE();

            for (let i = 0; i < 10; i++) {
                let okj = Math.random();

                if (okj >= 0.99) {
                    resultsCount["大吉"]++;
                    totalPrize += 100000;
                } else if (okj >= 0.95) {
                    resultsCount["吉"]++;
                    totalPrize += 10000;
                } else if (okj >= 0.85) {
                    resultsCount["中吉"]++;
                    totalPrize += 2000;
                } else if (okj >= 0.7) {
                    resultsCount["小吉"]++;
                    totalPrize += 1000;
                } else if (okj >= 0.6) {
                    resultsCount["末吉"]++;
                    totalPrize += 500;
                } else if (okj >= 0.1) {
                    resultsCount["凶"]++;
                    totalPrize += 0;
                } else {
                    resultsCount["大凶"]++;
                    totalPrize -= 10000;
                }
            }

            const lastRandomImg = omikujiImages[Math.floor(Math.random() * omikujiImages.length)];
            imgElement.src = lastRandomImg;

            currentMoney += totalPrize;
            moneySpan.innerHTML = currentMoney;

            drawBtn.disabled = false;
            draw10Btn.disabled = false;
            if (submitBtn) submitBtn.disabled = false;

            if (totalPrize > 0) {
                playSE("se-win");
            } else if (totalPrize < 0) {
                playSE("se-lose");
            }

            if (resultsCount["大吉"] > 0) startConfetti();
            if (resultsCount["大凶"] > 0) startDoomEffect();

            setTimeout(() => {
                alert(
                    "🔥【10連おみくじ結果発表】🔥\n" +
                    "--------------------------------\n" +
                    "🎉 大吉： " + resultsCount["大吉"] + "回\n" +
                    "✨ 吉 ： " + resultsCount["吉"] + "回\n" +
                    "🎵 中吉： " + resultsCount["中吉"] + "回\n" +
                    "👍 小吉： " + resultsCount["小吉"] + "回\n" +
                    "😄 末吉： " + resultsCount["末吉"] + "回\n" +
                    "😢 凶 ： " + resultsCount["凶"] + "回\n" +
                    "😱 大凶： " + resultsCount["大凶"] + "回\n" +
                    "--------------------------------\n" +
                    "💰 合計獲得賞金：" + totalPrize.toLocaleString() + "円！"
                );

                stopDoomEffect();

                if (currentMoney < 1000) {
                    alert("💸【ゲームオーバー】💸\nおみくじを引くお金が無くなりました。トップへ戻りましょう。");
                    window.location.href = "index.html";
                }
            }, 200);
        }
    }, 80);
}
