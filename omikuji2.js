const omikujiImages = [
    "omikuji_daikichi.png",
    "omikuji_kichi.png",
    "omikuji_chuukichi.png",
    "omikuji_syoukichi.png",
    "omikuji_suekichi.png",
    "omikuji_kyou.png",
    "omikuji_daikyou.png"
];

function omikuji() {
    const imgElement = document.querySelector("#image");
    const placeholder = document.querySelector("#placeholder-text");
    const submitBtn = document.querySelector("#submitBtn");
    const drawBtn = document.querySelector(".draw-btn");
    const hiddenResult = document.querySelector("#hiddenResult");
    const randomNumSpan = document.querySelector("#randomNumber");

    drawBtn.disabled = true;
    submitBtn.disabled = true;

    if (placeholder) placeholder.style.display = "none";
    imgElement.classList.remove("hidden");
    imgElement.classList.add("shaking");

    let shuffleCount = 0;
    const shuffleInterval = setInterval(() => {
        const randomImg = omikujiImages[Math.floor(Math.random() * omikujiImages.length)];
        imgElement.src = randomImg;
        shuffleCount++;

        if (shuffleCount >= 10) {
            clearInterval(shuffleInterval);
            imgElement.classList.remove("shaking");
            determineResult();
        }
    }, 80);
    
    function determineResult(){
    let okj = Math.random();
    randomNumSpan.innerHTML = okj.toFixed(4);

    let resultName = "";
    let imgSrc = "";
    
    if (okj >= 0.99) {
        imgSrc = "omikuji_daikichi.png";
        resultName = "大吉";
    } else if (okj >=0.95) {
        imgSrc = "omikuji_kichi.png";
        resultName = "吉";
    } else if (okj >=0.85) {
        imgSrc = "omikuji_chuukichi.png";
        resultName = "中吉";
    } else if (okj >=0.7) {
        imgSrc = "omikuji_syoukichi.png";
        resultName = "小吉";
    } else if (okj >=0.6) {
        imgSrc = "omikuji_suekichi.png";
        resultName = "末吉";
    } else if (okj >=0.1) {
        imgSrc = "omikuji_kyou.png";
        resultName = "凶";
    } else {
        imgSrc = "omikuji_daikyou.png";
        resultName = "大凶";
    }

    imgElement.src = imgSrc;
    if (hiddenResult) hiddenResult.value = resultName;

    drawBtn.disabled = false;
    submitBtn.disabled = false;

    setTimeout(() => {
            if (resultName === "大吉") {
                alert("🎉　おめでとうございます！【大吉】です！　🎉\nなんと最高額の　100,000円　が当選しました！");
            } else if (resultName === "吉") {
                alert("✨　やりました！【吉】です！　✨\nみごと　10,000円　が当選しました！");
            } else if (resultName === "中吉") {
                alert("♫　いいですね！【中吉】です！　♫\n2,000円　が当選しました！");
            } else if (resultName === "小吉") {
                alert("👍　堅実！【小吉】です！　👍\n1,000円　が当選しました！（元取れた！）");
            } else if (resultName === "末吉") {
                alert("😄　ちょっぴりお小遣い！【末吉】です！　😄\n500円　が当選しました！");
            } else if (resultName === "凶") {
                alert("😢残念！【凶】です！　😢\n景品はありません。はずれです！");
            }
            else if (resultName === "大凶") {
                alert("😱　大凶を引いてしまいました…！　😱\nお祓い料として【10,000円】を徴収いたします。")
            }
    }, 200);
}
}

