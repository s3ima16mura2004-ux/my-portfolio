// ============================================================
// omikuji-ui-seasonal3.js
// 🎆🫘🌱🌸🎏 季節イベント表示（夏祭り・節分・春の芽吹き・お花見・こどもの日・夏越の大祓）
// ============================================================

function spawnMamemakiPiece() {
    const overlay = document.querySelector("#season-fx-overlay");
    if (!overlay) return;
    const isOni = Math.random() < 0.12; // 稀に鬼が混ざる
    const piece = document.createElement("span");
    piece.textContent = isOni ? "👹" : "🫘";
    piece.className = isOni ? "setsubun-oni-piece" : "mamemaki-bean";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.animationDuration = (Math.random() * 2 + 3) + "s";
    overlay.appendChild(piece);
    setTimeout(() => { piece.remove(); }, 6000);
}

// 豆まきの豆を定期的にまくタイマー（節分期間中だけ動かす）
let setsubunBeanInterval = null;

// 🫘 節分（2/1〜2/3）の表示を更新する。豆まきをイメージした演出＋豆まきミニゲームはomikuji-draw-helpers.jsで発生
function updateSetsubunUI() {
    const container = document.querySelector(".container");
    const banner = document.querySelector("#setsubun-banner");
    const active = isSeasonalEventActive("setsubun");

    if (container) container.classList.toggle("setsubun-active", active);
    if (banner) banner.classList.toggle("hidden", !active);

    if (active && !setsubunBeanInterval) {
        setsubunBeanInterval = setInterval(spawnMamemakiPiece, 900);
    } else if (!active && setsubunBeanInterval) {
        clearInterval(setsubunBeanInterval);
        setsubunBeanInterval = null;
    }
}

// 🌱 春の芽吹き中に、若葉や新芽がふわりと立ちのぼる演出を1つだけ画面に出す
function spawnHaruSprout() {
    const overlay = document.querySelector("#season-fx-overlay");
    if (!overlay) return;
    const sprouts = ["🌱", "🍃"];
    const sprout = document.createElement("span");
    sprout.textContent = sprouts[Math.floor(Math.random() * sprouts.length)];
    sprout.className = "haru-sprout";
    sprout.style.left = Math.random() * 100 + "vw";
    sprout.style.animationDuration = (Math.random() * 3 + 6) + "s";
    overlay.appendChild(sprout);
    setTimeout(() => { sprout.remove(); }, 9500);
}

// 若葉の演出を定期的に立ちのぼらせるタイマー（春の芽吹き期間中だけ動かす）
let haruSproutInterval = null;

// 🌱 春の芽吹き（3月）の表示を更新する。花が咲く前の若葉・新芽をイメージした演出
function updateHaruUI() {
    const container = document.querySelector(".container");
    const banner = document.querySelector("#haru-banner");
    const active = isSeasonalEventActive("haru");

    if (container) container.classList.toggle("haru-active", active);
    if (banner) banner.classList.toggle("hidden", !active);

    if (active && !haruSproutInterval) {
        haruSproutInterval = setInterval(spawnHaruSprout, 1100);
    } else if (!active && haruSproutInterval) {
        clearInterval(haruSproutInterval);
        haruSproutInterval = null;
    }
}

// 🌸 桜満開・花見中に舞い散る桜の花びらを1枚だけ画面に出す
function spawnSakuraPetal() {
    const overlay = document.querySelector("#season-fx-overlay");
    if (!overlay) return;
    const petal = document.createElement("span");
    petal.textContent = "🌸";
    petal.className = "sakura-petal";
    petal.style.left = Math.random() * 100 + "vw";
    petal.style.animationDuration = (Math.random() * 3 + 5) + "s";
    overlay.appendChild(petal);
    setTimeout(() => { petal.remove(); }, 8500);
}

// 桜の花びらを定期的に降らせるタイマー（花見期間中だけ動かす）
let hanamiSakuraInterval = null;

// 🌸 桜満開・花見（4月）の表示を更新する
function updateHanamiUI() {
    const container = document.querySelector(".container");
    const banner = document.querySelector("#hanami-banner");
    const active = isSeasonalEventActive("hanami");

    if (container) container.classList.toggle("hanami-active", active);
    if (banner) banner.classList.toggle("hidden", !active);

    if (active && !hanamiSakuraInterval) {
        hanamiSakuraInterval = setInterval(spawnSakuraPetal, 700);
    } else if (!active && hanamiSakuraInterval) {
        clearInterval(hanamiSakuraInterval);
        hanamiSakuraInterval = null;
    }

    updateShopUI(); // お花見団子の「使う」ボタン表示も一緒に更新する
}

// 🎏 こどもの日、黄金の鯉のぼり（稀に昇り龍）が画面を横切る演出を1匹だけ出す
function spawnKoinobori() {
    const overlay = document.querySelector("#season-fx-overlay");
    if (!overlay) return;
    const koi = document.createElement("span");
    const isDragon = Math.random() < 0.15; // 稀に「昇り龍」が混ざる
    koi.textContent = isDragon ? "🐲" : "🎏";
    koi.className = "koinobori-piece" + (isDragon ? " koinobori-dragon" : "");
    koi.style.top = (Math.random() * 40 + 8) + "vh";
    koi.style.animationDuration = (Math.random() * 3 + 7) + "s";
    overlay.appendChild(koi);
    setTimeout(() => { koi.remove(); }, 10500);
}

// 鯉のぼりを定期的に泳がせるタイマー（こどもの日期間中だけ動かす）
let koinoboriInterval = null;

// 🎏 こどもの日（5/1〜5/5）の表示を更新する
function updateKodomonohiUI() {
    const container = document.querySelector(".container");
    const banner = document.querySelector("#kodomonohi-banner");
    const active = isSeasonalEventActive("kodomonohi");

    if (container) container.classList.toggle("kodomonohi-active", active);
    if (banner) banner.classList.toggle("hidden", !active);

    if (active && !koinoboriInterval) {
        spawnKoinobori();
        koinoboriInterval = setInterval(spawnKoinobori, 4500);
    } else if (!active && koinoboriInterval) {
        clearInterval(koinoboriInterval);
        koinoboriInterval = null;
    }
}

// 🌾 夏越の大祓（6/25〜6/30）「茅の輪くぐり」欄の表示を更新する
function updateNagoshiUI() {
    const box = document.querySelector("#nagoshi-box");
    const btn = document.querySelector("#nagoshi-btn");
    const statusText = document.querySelector("#nagoshi-status-text");
    if (!box) return;

    const active = isSeasonalEventActive("nagoshi");
    box.classList.toggle("hidden", !active);
    if (!active) return;

    if (btn) btn.disabled = nagoshiBadCount <= 0;
    if (statusText) {
        statusText.textContent = nagoshiBadCount > 0
            ? "🌾 半年間で祓うべき凶事：" + nagoshiBadCount + "回（茅の輪をくぐると清められます）"
            : "🌾 現在、祓うべき凶事は記録されていません。清らかな半年でしたね！";
    }
}

// 🗺️ 境内マップタブの表示を更新する（所持金を使って1マスずつ買い進めるマップの完成状況）
