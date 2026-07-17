// ============================================================
// omikuji-ui-seasonal2.js
// 👘🎄🎊💝 季節イベント表示（七五三・クリスマス・年末/除夜の鐘・冬の雪・バレンタイン）
// ============================================================

function updateShichigosanUI() {
    const banner = document.querySelector("#shichigosan-banner");
    if (!banner) return;
    banner.classList.toggle("hidden", !isSeasonalEventActive("shichigosan"));
}

// 🎄 クリスマス（12/1〜12/25）の表示を更新する。昼は雪、夜はイルミネーション演出にする
function updateChristmasUI() {
    const container = document.querySelector(".container");
    const nightBanner = document.querySelector("#christmas-banner");
    const dayBanner = document.querySelector("#christmas-day-banner");
    const inSeason = isSeasonalEventActive("christmas");
    const night = isNightHour();

    if (container) {
        container.classList.toggle("christmas-active", inSeason && night);
        container.classList.toggle("christmas-day", inSeason && !night);
    }
    if (nightBanner) nightBanner.classList.toggle("hidden", !(inSeason && night));
    if (dayBanner) dayBanner.classList.toggle("hidden", !(inSeason && !night));

    updateWinterSnow();
}

// 🔔 除夜の鐘の演出を1回発生させる（画面中央にふわっと鐘が現れて揺れる）
function spawnJoyaBell() {
    const overlay = document.querySelector("#season-fx-overlay");
    if (!overlay) return;
    const bell = document.createElement("span");
    bell.textContent = "🔔";
    bell.className = "joya-bell";
    overlay.appendChild(bell);
    setTimeout(() => { bell.remove(); }, 3700);
}

// 最後に除夜の鐘の演出を出した時刻（同じ夜に何度も出過ぎないようにする・保存はしない）
let nenmatsuBellShownAt = 0;

// 🎊 年末（12/26〜12/31）の表示を更新する。昼は雪、夜は「除夜の鐘」演出にする
function updateNenmatsuUI() {
    const container = document.querySelector(".container");
    const nightBanner = document.querySelector("#nenmatsu-banner");
    const dayBanner = document.querySelector("#nenmatsu-day-banner");
    const inSeason = isSeasonalEventActive("nenmatsu");
    const night = isNightHour();

    if (container) {
        container.classList.toggle("nenmatsu-active", inSeason && night);
        container.classList.toggle("nenmatsu-day", inSeason && !night);
    }
    if (nightBanner) nightBanner.classList.toggle("hidden", !(inSeason && night));
    if (dayBanner) dayBanner.classList.toggle("hidden", !(inSeason && !night));

    // 🔔 夜間は10分に1回程度、除夜の鐘が響く演出を発生させる
    if (inSeason && night) {
        const now = Date.now();
        if (now - nenmatsuBellShownAt > 10 * 60 * 1000) {
            nenmatsuBellShownAt = now;
            spawnJoyaBell();
        }
    }

    updateWinterSnow();
    updateJoyaBellUI();
}

// ❄️ 雪を1粒だけ画面に降らせる（クリスマス・年末の「昼」で共通して使う）
function spawnSnowflake() {
    const overlay = document.querySelector("#season-fx-overlay");
    if (!overlay) return;
    const flakes = ["❄", "❅", "❆"];
    const flake = document.createElement("span");
    flake.textContent = flakes[Math.floor(Math.random() * flakes.length)];
    flake.className = "snowflake-piece";
    flake.style.left = Math.random() * 100 + "vw";
    flake.style.fontSize = (Math.random() * 10 + 14) + "px";
    flake.style.animationDuration = (Math.random() * 4 + 6) + "s";
    overlay.appendChild(flake);
    setTimeout(() => { flake.remove(); }, 10500);
}

// 雪を定期的に降らせるタイマー（クリスマス・年末どちらかの「昼」の間だけ動かす）
let winterSnowInterval = null;

// ❄️ クリスマス・年末のどちらかが「昼」表示中なら、雪を降らせ続ける（両者から呼ばれる共通処理）
function updateWinterSnow() {
    const container = document.querySelector(".container");
    const snowing = !!(container && (container.classList.contains("christmas-day") || container.classList.contains("nenmatsu-day")));

    if (snowing && !winterSnowInterval) {
        winterSnowInterval = setInterval(spawnSnowflake, 500);
    } else if (!snowing && winterSnowInterval) {
        clearInterval(winterSnowInterval);
        winterSnowInterval = null;
    }
}

// 🔔 除夜の鐘（108回つき）欄の表示を更新する
function updateJoyaBellUI() {
    const box = document.querySelector("#nenmatsu-bell-box");
    const btn = document.querySelector("#joya-bell-btn");
    const statusText = document.querySelector("#joya-bell-status-text");
    if (!box) return;

    const active = isSeasonalEventActive("nenmatsu");
    box.classList.toggle("hidden", !active);
    if (!active) return;

    const today = todayStr();
    const count = joyaBellDate === today ? joyaBellCount : 0;
    const done = count >= JOYA_BELL_TARGET;

    if (btn) btn.disabled = done;
    if (statusText) {
        statusText.textContent = done
            ? "🔔 今年の除夜の鐘は108回つき終えました。良いお年を…！"
            : "🔔 除夜の鐘：" + count + " / " + JOYA_BELL_TARGET + "回（108回つくと煩悩祓いのご褒美があります）";
    }
}

// 🎁 サンタの袋の演出テキストを組み立てる
function santaBagToText(amount) {
    if (!amount) return "";
    return "\n\n🎅🎁【サンタの袋、開封！】🎁🎅\n袋を開けてみると…なんと【" + amount.toLocaleString() + "円】が入っていました！メリークリスマス！";
}

// 💝 バレンタイン（2/1〜2/14）「チョコおみくじ」欄の表示を更新する
function updateValentineUI() {
    const container = document.querySelector(".container");
    const box = document.querySelector("#valentine-box");
    const btn = document.querySelector("#choco-omikuji-btn");
    const statusText = document.querySelector("#choco-status-text");
    const active = isSeasonalEventActive("valentine");

    if (container) container.classList.toggle("valentine-active", active);
    if (!box) return;

    box.classList.toggle("hidden", !active);
    if (!active) return;

    const usedToday = chocoDrawDate === todayStr();
    if (btn) btn.disabled = usedToday;
    if (statusText) {
        statusText.textContent = usedToday
            ? "💝 今日はもうチョコおみくじを引きました。また明日挑戦してください。（これまでに引いた回数：" + chocoDrawCount + "回）"
            : "💝 チョコおみくじを引くと、運勢とあなたの「ペア運勢」がわかります！（ハズレなし・1日1回）";
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

// 🎆 夏祭り限定コミュニティ目標「みんなで花火玉を集めよう」の進捗表示を更新する
function updateNatsumatsuriCommunityUI() {
    const box = document.querySelector("#natsumatsuri-community-box");
    if (!box) return;

    const isAugust = (new Date().getMonth() + 1) === NATSUMATSURI_MONTH;
    box.classList.toggle("hidden", !isAugust);
    if (!isAugust) return;

    const year = new Date().getFullYear();
    if (communityNatsumatsuriGoalYear === year) {
        box.textContent = "🎆 夏祭り・みんなで花火玉：目標達成しました！（合計" + communityNatsumatsuriCount.toLocaleString() + "個。今年参拝した方全員にボーナスが贈られました）";
    } else {
        box.textContent = "🎆 夏祭り・みんなで花火玉：" + communityNatsumatsuriCount.toLocaleString() + " / " + NATSUMATSURI_COMMUNITY_GOAL.toLocaleString() + "個（達成すると、今年参拝した方全員にボーナスがあります）";
    }
}

// 🫘 節分中に豆まきの豆（稀に退治される鬼）を1つだけ画面に出す