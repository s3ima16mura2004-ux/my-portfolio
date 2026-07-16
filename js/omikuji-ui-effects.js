// ============================================================
// omikuji-ui-effects.js
// ✨🔊🎉 神社改築演出・キラキラ演出・効果音・花火/紙吹雪/大凶演出・誕生日/フィーバー表示
// ============================================================

function applyShrineTierVisual() {
    const container = document.querySelector(".container");
    if (!container) return;
    container.classList.remove("shrine-tier1", "shrine-tier2", "shrine-tier3", "shrine-tier4", "shrine-tier5", "shrine-tier6");

    const tier = getCommunityTier(communityDraws);
    if (tier >= 1) container.classList.add("shrine-tier" + Math.min(tier, 6));

    const communityBox = document.querySelector("#community-status-box");
    if (communityBox) {
        const current = COMMUNITY_TIERS[tier];
        const next = COMMUNITY_TIERS[tier + 1];
        let text = "🏘️ みんなの参拝合計：" + communityDraws.toLocaleString() + "回（" + current.name + "）";
        if (next) {
            text += "\n次の目標まであと" + (next.threshold - communityDraws).toLocaleString() + "回（" + next.name + "）";
        }
        communityBox.textContent = text;
        communityBox.classList.remove("hidden");
    }
}
function getShuffleTier() {
    if (totalDraws >= 500) return 2;
    if (totalDraws >= 100) return 1;
    return 0;
}

// シャッフル中の演出をランクに応じて開始する
function applyShuffleTierEffect() {
    const box = document.querySelector(".omikuji-box");
    if (!box) return;
    box.classList.remove("shuffle-glow-gold", "shuffle-glow-rainbow");

    const tier = getShuffleTier();
    if (tier === 1) {
        box.classList.add("shuffle-glow-gold");
    } else if (tier === 2) {
        box.classList.add("shuffle-glow-rainbow");
        startSparkle();
    }
}

function clearShuffleTierEffect() {
    const box = document.querySelector(".omikuji-box");
    if (box) box.classList.remove("shuffle-glow-gold", "shuffle-glow-rainbow");
}

// 参拝500回達成者向けのキラキラ演出
function startSparkle() {
    const overlay = document.querySelector("#confetti-overlay");
    if (!overlay) return;

    for (let i = 0; i < 20; i++) {
        const star = document.createElement("span");
        star.textContent = "✨";
        star.style.position = "absolute";
        star.style.left = Math.random() * 100 + "vw";
        star.style.top = Math.random() * 100 + "vh";
        star.style.fontSize = (Math.random() * 14 + 10) + "px";
        star.style.animation = "sparkle-fall 1.2s ease-out forwards";
        overlay.appendChild(star);
        setTimeout(() => { star.remove(); }, 1300);
    }
}

// 左パネル上部の「発動中アイテム」ミニ表示
function updateActiveItemsUI() {
    const box = document.querySelector("#active-items-box");
    const shopText = document.querySelector("#active-shop-text");
    const equipText = document.querySelector("#active-equip-text");
    if (!box) return;

    let shown = false;

    if (shopItemKey && shopItemRemaining > 0 && shopText) {
        const item = SHOP_ITEMS.find(i => i.key === shopItemKey);
        if (item) {
            shopText.textContent = "🛍️ 発動中：" + item.emoji + " " + item.name + "（残り" + shopItemRemaining + "回）";
            shopText.classList.remove("hidden");
            shown = true;
        }
    } else if (shopText) {
        shopText.classList.add("hidden");
    }

    if (equippedCollectible && equipText) {
        const item = DROP_ITEMS.find(i => i.key === equippedCollectible);
        if (item) {
            equipText.textContent = "🎒 装備中：" + item.emoji + " " + item.name;
            equipText.classList.remove("hidden");
            shown = true;
        }
    } else if (equipText) {
        equipText.classList.add("hidden");
    }

    if (shown) box.classList.remove("hidden"); else box.classList.add("hidden");
}
function dropsToText(dropped) {
    if (dropped.length === 0) return "";
    return "\n\n🎁 アイテムをドロップ！\n" + dropped.map(i => i.emoji + " " + i.name).join("、");
}

function fukuDarumaToText(amount) {
    if (!amount) return "";
    return "\n\n🎊【福だるま登場！】🎊\n福だるまがコロコロ転がってきて【" + amount.toLocaleString() + "円】を授けてくれました！";
}
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
// 🎆 夏祭り開催中（8月の夜・週末）の大吉系当選時に打ち上げる花火演出
function startFireworks() {
    const overlay = document.querySelector("#confetti-overlay");
    if (!overlay) return;

    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const burst = document.createElement("span");
            burst.textContent = "🎆";
            burst.style.position = "absolute";
            burst.style.left = (Math.random() * 80 + 10) + "vw";
            burst.style.top = (Math.random() * 50 + 5) + "vh";
            burst.style.fontSize = (Math.random() * 20 + 30) + "px";
            burst.style.animation = "sparkle-fall 1.2s ease-out forwards";
            overlay.appendChild(burst);
            setTimeout(() => { burst.remove(); }, 1300);
        }, i * 180);
    }
}
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

// 🎂 誕生日の「大大吉確定チケット」の表示を更新する
function updateBirthdayTicketUI() {
    const box = document.querySelector("#birthday-ticket-box");
    if (!box) return;
    if (birthdayTicket) {
        box.textContent = "🎂 大大吉確定チケット：あり（次の単発おみくじで自動発動！）";
        box.classList.remove("hidden");
    } else {
        box.classList.add("hidden");
    }
}

// 😲 神の気まぐれフィーバー（ショップ半額）の残り時間表示を更新する
function updateShopFeverUI() {
    const box = document.querySelector("#shop-fever-box");
    if (!box) return;

    if (isShopFeverActive()) {
        const remainMs = kimagureFeverUntil - Date.now();
        const remainMin = Math.max(1, Math.ceil(remainMs / 60000));
        box.textContent = "😲 神の気まぐれフィーバー中！ショップ全品が半額です！（残り約" + remainMin + "分）";
        box.classList.remove("hidden");
    } else {
        box.classList.add("hidden");
    }
    updateShopUI();
}

// 🎋 七夕「短冊に願いを書く」欄の表示を更新する（7月のみ表示）
