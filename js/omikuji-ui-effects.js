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

// 🎐 年間コンボ（季節イベントの代表アイテムを1年で集めきる）達成時のメッセージ
function yearlyComboToText(amount) {
    if (!amount) return "";
    return "\n\n🎐👑【年間コンボ達成！】👑🎐\n1年を通して季節イベントの代表アイテムをすべて集めきりました！\n特別ボーナスとして【" + amount.toLocaleString() + "円】を授かりました！";
}
// 🎐 年間コンボ（季節イベントの代表アイテムを1年で集めきる）の進捗表示を更新する
function updateYearlyComboUI() {
    const box = document.querySelector("#yearly-combo-box");
    if (!box) return;

    checkYearlyComboReset();
    box.classList.remove("hidden");

    const gotCount = YEARLY_COMBO_ITEMS.filter(c => comboItemsGotThisYear[c.itemKey]).length;
    if (comboLastClaimedYear === comboYear) {
        box.textContent = "🎐 年間コンボ：今年はすでに達成済みです！（来年またチャレンジできます）";
    } else {
        box.textContent = "🎐 年間コンボ：季節の代表アイテムを " + gotCount + " / " + YEARLY_COMBO_ITEMS.length + " 種類、今年すでに入手済み（すべて揃うと特別ボーナス！）";
    }
}

// 🎐 季節イベント共通「1日1回ミニアクション」（お月見・紅葉狩り・七五三・クリスマス・春の芽吹き・お花見・こどもの日）の表示を更新する
function updateSeasonalActionsUI() {
    const today = todayStr();
    SEASONAL_DAILY_ACTIONS.forEach(config => {
        const box = document.querySelector("#seasonal-action-box-" + config.key);
        const btn = document.querySelector("#seasonal-action-btn-" + config.key);
        const statusText = document.querySelector("#seasonal-action-status-" + config.key);
        if (!box) return;

        const active = isSeasonalEventActive(config.key);
        box.classList.toggle("hidden", !active);
        if (!active) return;

        const usedToday = seasonalActionDates[config.key] === today;
        if (btn) btn.disabled = usedToday;
        if (statusText) {
            const count = seasonalActionCounts[config.key] || 0;
            statusText.textContent = usedToday
                ? config.emoji + " 今日はもう「" + config.label + "」を行いました。また明日挑戦してください。（これまでの回数：" + count + "回）"
                : config.emoji + " 「" + config.label + "」を行うと、ちょっとしたご利益がもらえます！（ハズレなし・1日1回）";
        }
    });

    updateSeasonalMissionsBellUI();
}

// 🎰 季節限定ガチャ（全季節共通）の表示を更新する。開催中のイベントの分だけボックスを表示する
function updateSeasonalGachaUI() {
    SEASONAL_EVENTS.forEach(event => {
        const box = document.querySelector("#seasonal-gacha-box-" + event.key);
        const btn = document.querySelector("#seasonal-gacha-btn-" + event.key);
        const statusText = document.querySelector("#seasonal-gacha-status-" + event.key);
        if (!box) return;

        const active = isSeasonalEventActive(event.key);
        box.classList.toggle("hidden", !active);
        if (!active) return;

        const items = DROP_ITEMS.filter(i => i.seasonal === event.key);
        const totalOwned = items.reduce((sum, i) => sum + (ownedItems[i.key] || 0), 0);
        const ready = totalOwned >= SEASONAL_GACHA_COST;

        if (btn) btn.disabled = !ready;
        if (statusText) {
            statusText.textContent = ready
                ? event.emoji + " 限定アイテムが" + totalOwned + "個集まりました！ガチャに挑戦できます（" + SEASONAL_GACHA_COST + "個消費）"
                : event.emoji + " 限定アイテムを集めよう：" + totalOwned + " / " + SEASONAL_GACHA_COST + "個（3種類の合計でOK）";
        }
    });

    updateSeasonalMissionsBellUI();
}

// 🎐 季節限定ミッション（七夕・バレンタイン・ハロウィン肝試し・季節ミニアクション等）の
// 「本日まだやっていないものが何件あるか」を数えて、サイドバーの通知ベルに表示する。
// 各ボックス自身の表示/非表示・ボタンのdisabled状態は既存の各update関数がすでに正しく設定しているので、
// ここではそれをそのまま数えるだけで、判定ロジックを二重に持たないようにしている。
function updateSeasonalMissionsBellUI() {
    const bell = document.querySelector("#seasonal-missions-bell");
    const section = document.querySelector("#seasonal-missions-section");
    const emptyText = document.querySelector("#seasonal-missions-empty");
    const sectionBadge = document.querySelector("#seasonal-missions-badge");
    if (!section) return;

    const boxes = section.querySelectorAll(".lucky-item-box");
    let activeCount = 0;
    let pendingCount = 0;

    boxes.forEach(box => {
        if (box.classList.contains("hidden")) return; // 現在開催されていないイベント
        activeCount++;
        const btn = box.querySelector("button");
        if (btn && !btn.disabled) pendingCount++;
    });

    if (emptyText) emptyText.classList.toggle("hidden", activeCount > 0);

    if (sectionBadge) {
        sectionBadge.textContent = activeCount > 0
            ? "（" + activeCount + "件開催中）"
            : "（現在開催中のものはありません）";
    }

    if (bell) {
        if (pendingCount > 0) {
            bell.textContent = "🔔 季節限定ミッション：本日未実施 " + pendingCount + "件（タップでミッションタブへ）";
            bell.classList.remove("hidden");
        } else {
            bell.classList.add("hidden");
        }
    }
}

// 🎐 現在アクティブな季節イベントを、絵文字バッジの一覧としてサイドバーに表示する
// （長いバナー一覧を毎回開かなくても、今何が開催中かひと目で分かるようにするための軽量な表示）
function updateSeasonBadgeRow() {
    const row = document.querySelector("#season-badge-row");
    if (!row) return;

    const active = SEASONAL_EVENTS.filter(e => isSeasonalEventActive(e.key));
    if (active.length === 0) {
        row.classList.add("hidden");
        row.innerHTML = "";
        return;
    }

    row.classList.remove("hidden");
    row.innerHTML = active.map(e =>
        '<span class="season-badge" title="' + e.name.replace(/"/g, "&quot;") + '" onclick="openDailyNotices()">' + e.emoji + '</span>'
    ).join("");
}

// 🎐 季節バッジをタップした時、「本日のお知らせ」の折りたたみを開いて詳細を見られるようにする
function openDailyNotices() {
    const details = document.querySelector("#sidebar-daily-notices");
    if (!details) return;
    details.open = true;
    details.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ============================================================
// 🍞 トースト通知：達成系のお知らせ（ミッション達成・連続参拝ボーナス等）を
// alert()の代わりに画面右上にスッと表示して自動で消えるようにする
// ============================================================

// トーストを1件表示する。type: "gold"(達成・報酬系) / "success"(成功) / 省略(通常)
function showToast(message, type, duration) {
    const container = getOrCreateToastContainer();

    const toast = document.createElement("div");
    toast.className = "omikuji-toast" + (type ? " omikuji-toast-" + type : "");
    toast.innerHTML = message;
    container.appendChild(toast);

    // 描画が確定してからshowクラスを付けて、フェードインのtransitionを発火させる
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add("omikuji-toast-show"));
    });

    const lifespan = duration || 4500;
    setTimeout(() => {
        toast.classList.remove("omikuji-toast-show");
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 350);
    }, lifespan);
}

function getOrCreateToastContainer() {
    let el = document.querySelector("#omikuji-toast-container");
    if (!el) {
        el = document.createElement("div");
        el.id = "omikuji-toast-container";
        document.body.appendChild(el);
    }
    return el;
}

function unlockAllAudio() {
    const ids = ["se-coin", "se-found", "se-purchase", "se-shuffle", "se-win", "se-kamikichi", "se-daidaikichi", "se-levelup", "se-milestone", "se-complete", "se-lose", "se-doom"];
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