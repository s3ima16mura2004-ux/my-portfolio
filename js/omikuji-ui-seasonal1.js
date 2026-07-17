// ============================================================
// omikuji-ui-seasonal1.js
// 🎋🌕🍁🎍🌫️ 季節イベント表示（七夕・お月見・紅葉狩り・お正月・神無月）
// ============================================================

function updateTanabataUI() {
    const box = document.querySelector("#tanabata-box");
    const btn = document.querySelector("#tanabata-wish-btn");
    const statusText = document.querySelector("#tanabata-status-text");
    const starText = document.querySelector("#tanabata-star-text");
    if (!box) return;

    if (!isTanabataActive()) {
        box.classList.add("hidden");
        updateSeasonalMissionsBellUI();
        return;
    }
    box.classList.remove("hidden");

    const usedToday = tanabataWishDate === todayStr();
    if (btn) btn.disabled = usedToday;

    if (statusText) {
        if (isTanabataLuckActive()) {
            statusText.textContent = "🎋 短冊の願いが叶いました！本日は大吉運+" + (TANABATA_DAIKICHI_BONUS * 100).toFixed(0) + "%！";
        } else if (usedToday) {
            statusText.textContent = "🎋 今日はもう短冊に願いを書きました。また明日挑戦してください。";
        } else if (isTanabataDay()) {
            statusText.textContent = "🌌 今日は七夕当日！織姫と彦星が逢う特別な日、願いは必ず叶います！";
        } else {
            statusText.textContent = "🎋 短冊に願いを書くと、30%の確率で今日1日だけ金運がアップします！（7/7は確定！）";
        }
    }

    // 🎐🌠 織姫・彦星アイテムの収集状況（毎年七夕シーズンに再挑戦できる）
    if (starText) {
        const alreadyMetThisYear = orihimeHikoboshiLastMetYear === new Date().getFullYear();
        if (alreadyMetThisYear) {
            starText.textContent = "🌌 今年はすでに織姫と彦星の再会を見届けました（来年もまた挑戦できます）。これまでの再会回数：" + orihimeHikoboshiMeetCount + "回";
        } else {
            starText.textContent =
                "🎐 織姫の五色糸：" + (ownedItems.orihime_thread || 0) + "個　" +
                "🌠 彦星の一等星：" + (ownedItems.hikoboshi_star || 0) + "個" +
                "（両方1個ずつ揃うと特別なご縁が結ばれます）";
        }
    }

    updateSeasonalMissionsBellUI();
}

// 🎐🌠🏮🍁🌕🗻 季節限定アイテム（七夕・夏祭り・お月見・紅葉狩り・お正月）の収集状況を表示する
function updateSeasonalItemsUI() {
    const box = document.querySelector("#seasonal-items-box");
    if (!box) return;

    const seasonalItems = DROP_ITEMS.filter(i => i.seasonal);
    const groups = {};
    seasonalItems.forEach(item => {
        if (!groups[item.seasonal]) groups[item.seasonal] = [];
        groups[item.seasonal].push(item);
    });

    let html = "";
    SEASONAL_EVENTS.forEach(event => {
        const items = groups[event.key];
        if (!items) return;

        const hasAny = items.some(i => (ownedItems[i.key] || 0) > 0);
        const isActive = isSeasonalEventActive(event.key);
        if (!isActive && !hasAny) return; // 開催中でも所持もしていなければ表示しない

        html += '<p class="seasonal-group-title">' + event.emoji + " " + event.name +
            (isActive ? '<span class="seasonal-active-tag">開催中</span>' : '') + '</p>';
        html += '<p class="seasonal-group-desc">' + event.desc + '</p>';
        items.forEach(item => {
            html += '<div class="collect-item-row"><span>' + item.emoji + ' ' + item.name + ' × ' + (ownedItems[item.key] || 0) + '</span></div>';
        });
    });

    if (!html) {
        box.classList.add("hidden");
        box.innerHTML = "";
    } else {
        box.classList.remove("hidden");
        box.innerHTML = html;
    }
}

// 🌕 十五夜「月が昇る」演出を1回発生させる（画面右側にふわっと満月を出す）
function spawnMoonRise() {
    const overlay = document.querySelector("#season-fx-overlay");
    if (!overlay) return;
    const moon = document.createElement("span");
    moon.textContent = "🌕";
    moon.className = "moon-rise";
    overlay.appendChild(moon);
    setTimeout(() => { moon.remove(); }, 5200);
}

// 最後に「月が昇る」演出を出した時刻（同じ夜に何度も出過ぎないようにする・保存はしない）
let otsukimiMoonShownAt = 0;

// 🌕 お月見（9/15〜9/30）の表示を更新する。夜間は「月が昇る」十五夜演出、昼間は淡い夕月演出にする
function updateOtsukimiUI() {
    const container = document.querySelector(".container");
    const nightBanner = document.querySelector("#otsukimi-banner");
    const dayBanner = document.querySelector("#otsukimi-day-banner");
    const inSeason = isSeasonalEventActive("otsukimi");
    const night = isNightHour();

    if (container) {
        container.classList.toggle("otsukimi-active", inSeason && night);
        container.classList.toggle("otsukimi-day", inSeason && !night);
    }
    if (nightBanner) nightBanner.classList.toggle("hidden", !(inSeason && night));
    if (dayBanner) dayBanner.classList.toggle("hidden", !(inSeason && !night));

    // 🌕 夜間は10分に1回程度、月が昇る演出を発生させる
    if (inSeason && night) {
        const now = Date.now();
        if (now - otsukimiMoonShownAt > 10 * 60 * 1000) {
            otsukimiMoonShownAt = now;
            spawnMoonRise();
        }
    }
}

// 🍁 紅葉狩り中に舞い落ちる葉っぱを1枚だけ画面に出す
function spawnFallingLeaf() {
    const overlay = document.querySelector("#season-fx-overlay");
    if (!overlay) return;
    const leaves = ["🍁", "🍂"];
    const leaf = document.createElement("span");
    leaf.textContent = leaves[Math.floor(Math.random() * leaves.length)];
    leaf.className = "leaf-piece";
    leaf.style.left = Math.random() * 100 + "vw";
    leaf.style.animationDuration = (Math.random() * 3 + 5) + "s";
    overlay.appendChild(leaf);
    setTimeout(() => { leaf.remove(); }, 8500);
}

// 落ち葉を定期的に降らせるタイマー（紅葉狩り期間中だけ動かす）
let koyoLeafInterval = null;

// 🍁 紅葉狩り（11月）の表示を更新する
function updateKoyoUI() {
    const container = document.querySelector(".container");
    const banner = document.querySelector("#koyo-banner");
    const active = isSeasonalEventActive("koyo");

    if (container) container.classList.toggle("koyo-active", active);
    if (banner) banner.classList.toggle("hidden", !active);

    if (active && !koyoLeafInterval) {
        koyoLeafInterval = setInterval(spawnFallingLeaf, 900);
    } else if (!active && koyoLeafInterval) {
        clearInterval(koyoLeafInterval);
        koyoLeafInterval = null;
    }
}

// 🎍 お正月（1/1〜1/3）の表示を更新する（初日の出をイメージした演出）
function updateOshogatsuUI() {
    const container = document.querySelector(".container");
    const banner = document.querySelector("#oshogatsu-banner");
    const glow = document.querySelector("#oshogatsu-glow");
    const active = isSeasonalEventActive("oshogatsu");

    if (container) container.classList.toggle("oshogatsu-active", active);
    if (banner) banner.classList.toggle("hidden", !active);
    if (glow) glow.classList.toggle("hidden", !active);
}

// 🌫️ 神無月（10月）の表示を更新する（背景を少し寂しい雰囲気にする）
function updateKannazukiUI() {
    const container = document.querySelector(".container");
    const banner = document.querySelector("#kannazuki-banner");
    const active = isSeasonalEventActive("kannazuki");

    if (container) container.classList.toggle("kannazuki-active", active);
    if (banner) {
        banner.classList.toggle("hidden", !active);
        if (active) {
            banner.textContent = kannazukiDeposits > 0
                ? "🌫️ ただいま「神無月」…神様は出雲へお出かけ中です（現在の預け入れ累計：" + kannazukiDeposits.toLocaleString() + "円。11月に倍返し！）"
                : "🌫️ ただいま「神無月」…神様は出雲へお出かけ中です。賽銭箱に預けると11月に倍返しされます";
        }
    }
}

// 👘 七五三（11月）の表示を更新する（バナーのみ。ショップの千歳飴はupdateShopUIで表示切替）