// ============================================================
// omikuji-ui-shop.js
// 🛍️🏅📖🏦 ショップ・参拝ランク・称号・図鑑・賽銭箱の表示更新
// ============================================================

function updateShopUI() {
    const rank = getVisitorRank(totalWinnings);

    SHOP_ITEMS.forEach(item => {
        const card = document.querySelector('.shop-item-card[data-key="' + item.key + '"]');
        if (!card) return;

        // 🍬 季節限定アイテムは開催期間外だとカードごと非表示にする
        if (item.seasonal) {
            const seasonActive = isSeasonalEventActive(item.seasonal);
            card.classList.toggle("hidden", !seasonActive);
            if (!seasonActive) return;
        }

        const btn = card.querySelector(".btn-shop-buy");
        const lockOverlay = card.querySelector(".shop-item-lock");
        const isLocked = rank < item.minRank;

        if (isLocked) {
            card.classList.add("shop-item-locked");
            if (btn) btn.disabled = true;
            if (lockOverlay) {
                lockOverlay.textContent = "🔒 参拝ランク「" + VISITOR_RANKS[item.minRank].name + "」で解放";
                lockOverlay.classList.remove("hidden");
            }
        } else {
            card.classList.remove("shop-item-locked");
            const effectivePrice = isShopFeverActive() ? Math.floor(item.price / 2) : item.price;
            if (btn) btn.disabled = currentMoney < effectivePrice;
            const priceEl = card.querySelector(".shop-item-price");
            if (priceEl) {
                priceEl.textContent = isShopFeverActive()
                    ? "🈹 " + effectivePrice.toLocaleString() + "円（半額！）"
                    : item.price.toLocaleString() + "円";
            }
            if (lockOverlay) lockOverlay.classList.add("hidden");
        }

        if (shopItemKey === item.key && shopItemRemaining > 0) {
            card.classList.add("shop-item-active");
        } else {
            card.classList.remove("shop-item-active");
        }
    });

    const shopStatusEl = document.querySelector("#shop-active-status");
    if (shopStatusEl) {
        if (shopItemKey && shopItemRemaining > 0) {
            const item = SHOP_ITEMS.find(i => i.key === shopItemKey);
            shopStatusEl.textContent = "🛍️ 現在発動中：" + (item ? item.name : "") + "（残り" + shopItemRemaining + "回）";
            shopStatusEl.classList.remove("hidden");
        } else {
            shopStatusEl.classList.add("hidden");
        }
    }

    const countKoban = document.querySelector("#count-koban");
    if (countKoban) countKoban.textContent = ownedItems.koban || 0;
    const countShinboku = document.querySelector("#count-shinboku");
    if (countShinboku) countShinboku.textContent = ownedItems.shinboku || 0;
    const countIshikoro = document.querySelector("#count-ishikoro");
    if (countIshikoro) countIshikoro.textContent = ownedItems.ishikoro || 0;

    // 🍡 お花見団子（消費型アイテム。装備ではなく「使う」とすぐ予約状態になる）
    const countHanamiDango = document.querySelector("#count-hanami-dango");
    if (countHanamiDango) countHanamiDango.textContent = ownedItems.hanami_dango || 0;
    const hanamiDangoRow = document.querySelector("#hanami-dango-row");
    if (hanamiDangoRow) hanamiDangoRow.classList.toggle("hidden", !((ownedItems.hanami_dango || 0) > 0 || isHanamiActive()));
    const hanamiDangoBtn = document.querySelector("#hanami-dango-use-btn");
    if (hanamiDangoBtn) {
        hanamiDangoBtn.disabled = !(ownedItems.hanami_dango > 0) || hanamiDangoActive;
        hanamiDangoBtn.textContent = hanamiDangoActive ? "次のおみくじで発動待ち" : "使う";
    }

    const gachaTicketCount = document.querySelector("#gacha-ticket-count");
    if (gachaTicketCount) gachaTicketCount.textContent = gachaTickets;
    const gachaBtn = document.querySelector("#gacha-draw-btn");
    if (gachaBtn) gachaBtn.disabled = gachaTickets <= 0;

    const equipBtnKoban = document.querySelector("#equipBtn-koban");
    if (equipBtnKoban) {
        if (equippedCollectible === "koban") {
            equipBtnKoban.textContent = "装備を外す";
            equipBtnKoban.disabled = false;
        } else {
            equipBtnKoban.textContent = "装備する";
            equipBtnKoban.disabled = !(ownedItems.koban > 0);
        }
    }

    const equipBtnShinboku = document.querySelector("#equipBtn-shinboku");
    if (equipBtnShinboku) {
        if (equippedCollectible === "shinboku") {
            equipBtnShinboku.textContent = "装備を外す";
            equipBtnShinboku.disabled = false;
        } else {
            equipBtnShinboku.textContent = "装備する";
            equipBtnShinboku.disabled = !(ownedItems.shinboku > 0);
        }
    }

    // 🎏 五色の短冊（神社改築ティア4で解放される収集アイテム）
    const tanzakuRow = document.querySelector("#tanzaku-row");
    const tanzakuDesc = document.querySelector("#tanzaku-desc");
    const tanzakuUnlocked = getCommunityTier(communityDraws) >= 4;
    if (tanzakuRow) tanzakuRow.classList.toggle("hidden", !tanzakuUnlocked);
    if (tanzakuDesc) tanzakuDesc.classList.toggle("hidden", !tanzakuUnlocked);

    const countTanzaku = document.querySelector("#count-tanzaku");
    if (countTanzaku) countTanzaku.textContent = ownedItems.tanzaku || 0;

    const equipBtnTanzaku = document.querySelector("#equipBtn-tanzaku");
    if (equipBtnTanzaku) {
        if (equippedCollectible === "tanzaku") {
            equipBtnTanzaku.textContent = "装備を外す";
            equipBtnTanzaku.disabled = false;
        } else {
            equipBtnTanzaku.textContent = "装備する";
            equipBtnTanzaku.disabled = !(ownedItems.tanzaku > 0);
        }
    }

    const equipStatusEl = document.querySelector("#equip-status");
    if (equipStatusEl) {
        if (equippedCollectible) {
            const item = DROP_ITEMS.find(i => i.key === equippedCollectible);
            equipStatusEl.textContent = "現在の装備：" + (item ? item.emoji + " " + item.name : "なし");
        } else {
            equipStatusEl.textContent = "現在の装備：なし";
        }
    }

    // 🎐🌠🏮🗻 季節限定アイテム（七夕・夏祭り・お月見・紅葉狩り・お正月）の表示
    updateSeasonalItemsUI();

    updateActiveItemsUI();
    updateUrnUI();
    updateCompanionUI();
    updateRankUI();
    updateShrineMapUI();
}
function updateUrnUI() {
    const current = URN_LEVELS[urnLevel];
    const next = URN_LEVELS[urnLevel + 1];

    const currentText = document.querySelector("#urn-current-text");
    if (currentText) {
        currentText.textContent = "現在の壺：" + current.name + "（大吉ボーナス +" + (current.bonus * 100).toFixed(1) + "%）";
    }

    const nextBox = document.querySelector("#urn-next-box");
    const nextText = document.querySelector("#urn-next-text");
    const upgradeBtn = document.querySelector("#urn-upgrade-btn");

    if (!next) {
        if (nextText) nextText.textContent = "🏆 壺は最大までランクアップ済みです！";
        if (upgradeBtn) upgradeBtn.classList.add("hidden");
        return;
    }

    if (nextBox) nextBox.classList.remove("hidden");
    if (nextText) {
        nextText.textContent = "次の壺：" + next.name + "（" + next.cost.toLocaleString() + "円、大吉ボーナス+" + (next.bonus * 100).toFixed(1) + "%）";
    }
    if (upgradeBtn) {
        upgradeBtn.classList.remove("hidden");
        upgradeBtn.disabled = currentMoney < next.cost;
    }
}
// 🐱 相棒「招き猫」の成長段階の表示を更新する
// 🐍🦊 賽銭箱で迎えられる相棒たち（白蛇・狐）の一覧を描画する
function renderCompanionFriendsUI() {
    const list = document.querySelector("#companion-friends-list");
    if (!list) return;

    list.innerHTML = COMPANION_FRIENDS.map(f => {
        const owned = !!ownedFriends[f.key];
        const canAfford = bankMoney >= f.cost;
        return '<div class="collect-item-row">' +
            '<span>' + f.emoji + ' ' + f.name + (owned ? '' : '（' + f.cost.toLocaleString() + '円）') + '</span>' +
            (owned
                ? '<span class="equip-status" style="margin:0;">✅ 効果発動中</span>'
                : '<button class="btn-equip" ' + (canAfford ? '' : 'disabled') + ' onclick="buyCompanionFriend(\'' + f.key + '\')" type="button">迎える</button>') +
            '</div>' +
            '<p class="collect-item-desc">' + f.desc + '</p>';
    }).join("");
}

function updateCompanionUI() {
    renderCompanionFriendsUI(); // 🐍🦊 賽銭箱で迎えられる相棒たちの一覧を先に描画（招き猫が最大成長でもここは常に表示する）

    const index = getCompanionLevelIndex();
    const current = COMPANION_LEVELS[index];
    const next = COMPANION_LEVELS[index + 1];

    const currentText = document.querySelector("#companion-current-text");
    if (currentText) {
        currentText.textContent = current.emoji + " 現在の相棒：" + current.name +
            (current.bonus > 0 ? "（大吉ボーナス +" + (current.bonus * 100).toFixed(0) + "%）" : "");
    }

    const descText = document.querySelector("#companion-desc-text");
    if (descText) descText.textContent = current.desc;

    const progressOuter = document.querySelector("#companion-progress-outer");
    const progressInner = document.querySelector("#companion-progress-inner");
    const nextText = document.querySelector("#companion-next-text");

    if (!next) {
        if (progressOuter) progressOuter.classList.add("hidden");
        if (nextText) nextText.textContent = "🏆 相棒はすでに最大まで成長しています！";
        return;
    }

    if (progressOuter) progressOuter.classList.remove("hidden");
    const gained = companionExp - current.threshold;
    const needed = next.threshold - current.threshold;
    const pct = Math.min(100, Math.floor((gained / needed) * 100));
    if (progressInner) progressInner.style.width = pct + "%";
    if (nextText) {
        nextText.textContent = "次は「" + next.name + "」" + next.emoji + "（あと" + (next.threshold - companionExp) + "回、効果アイテムを購入）";
    }
}

function getVisitorRank(winnings) {
    let tier = 0;
    VISITOR_RANKS.forEach(r => { if (winnings >= r.threshold) tier = r.tier; });
    return tier;
}

// ⛩️ 参拝ランクの表示を更新する
function updateRankUI() {
    const rank = getVisitorRank(totalWinnings);
    const current = VISITOR_RANKS[rank];
    const next = VISITOR_RANKS[rank + 1];

    const rankNameEl = document.querySelector("#rank-name-display");
    if (rankNameEl) rankNameEl.textContent = "⛩️ 参拝ランク：" + current.name;

    const rankProgressEl = document.querySelector("#rank-progress-display");
    if (rankProgressEl) {
        if (next) {
            rankProgressEl.textContent =
                "累計獲得賞金：" + totalWinnings.toLocaleString() + "円（次の「" + next.name + "」まであと" +
                (next.threshold - totalWinnings).toLocaleString() + "円）";
        } else {
            rankProgressEl.textContent = "累計獲得賞金：" + totalWinnings.toLocaleString() + "円（最高ランクです！）";
        }
    }
}

// 🎖️ 称号バッジの表示を更新する
function updateTitlesUI() {
    const box = document.querySelector("#titles-box");
    const list = document.querySelector("#titles-list");
    if (!box || !list) return;

    const stats = {
        totalDraws, totalDaikichi, totalProfit, urnLevel, ownedItems, dexRewardClaimed,
        gotDaidaikichi, gotKamikichi, gotDaidaikyou, gotUshimitsuDraw, ishikoro500Claimed,
        communityDraws, orihimeHikoboshiMeetCount, hatsuyumeComplete, steadyVisitorEarned,
        hanamiDangoTotalCollected, gotKodomonohiExtreme, mamemakiSuccessCount, nagoshiLastResetYear,
        shrineMapLevel, japanShrineOwnedCount: getJapanShrineOwnedCount(), japanPrefCompleteCount: getJapanPrefectureCompleteCount(),
        japanShrinePartsOwnedCount: getJapanShrinePartsTotalOwnedCount(), companionExp, ownedFriends,
        okumiyaCompleteCount: getOkumiyaCompleteCount(), okumiyaPartsOwnedCount: getOkumiyaPartsTotalOwnedCount()
    };
    const earned = TITLES.filter(t => t.condition(stats));

    if (earned.length === 0) {
        box.classList.add("hidden");
        list.innerHTML = "";
        return;
    }

    box.classList.remove("hidden");
    list.innerHTML = earned.map(t =>
        '<span class="title-badge" title="' + t.desc.replace(/"/g, "&quot;") + '">' + t.emoji + " " + t.name + "</span>"
    ).join("");
}

// 📖 図鑑タブの表示を更新する
function updateDexUI() {
    const grid = document.querySelector("#dex-grid");
    if (grid) {
        grid.innerHTML = DEX_ENTRIES.map(entry => {
            const achieved = !!dexAchieved[entry.key];
            return (
                '<div class="dex-slot ' + (achieved ? "dex-achieved" : "dex-locked") + '">' +
                '<div class="dex-emoji">' + (achieved ? entry.emoji : "❓") + '</div>' +
                '<div class="dex-name">' + (achieved ? entry.name : "？？？") + '</div>' +
                '</div>'
            );
        }).join("");
    }

    const progressEl = document.querySelector("#dex-progress");
    const achievedCount = DEX_ENTRIES.filter(e => dexAchieved[e.key]).length;
    if (progressEl) {
        progressEl.textContent = "達成状況：" + achievedCount + " / " + DEX_ENTRIES.length;
    }

    const rewardEl = document.querySelector("#dex-reward-status");
    if (rewardEl) {
        if (dexRewardClaimed) {
            rewardEl.textContent = "🏆 図鑑コンプリート達成済み！（大吉ボーナス永続+1%を授かっています）";
            rewardEl.classList.remove("hidden");
        } else {
            rewardEl.classList.add("hidden");
        }
    }
}

// おみくじの結果を図鑑に記録する。全種類そろったら報酬を授与する
function markDex(resultName) {
    const entry = DEX_ENTRIES.find(e => e.match(resultName));
    if (!entry) return;
    if (!dexAchieved[entry.key]) {
        dexAchieved[entry.key] = true;
        trackMissionDexProgress(); // 🎯「図鑑を進めよう」ミッションの進捗を更新

        const allDone = DEX_ENTRIES.every(e => dexAchieved[e.key]);
        if (allDone && !dexRewardClaimed) {
            dexRewardClaimed = true;
            setTimeout(() => {
                alert("📖🏆【図鑑コンプリート！】🏆📖\n大吉から大凶(神の試練)まで、すべての結果を集めました！\n神様から御神宝を授かり、大吉ボーナスが永続的に+1%になりました！");
            }, 1000);
        }
    }
    updateDexUI();
}
function updateBankUI() {
    const bankDisplay = document.querySelector("#bank-money-display");
    if (bankDisplay) bankDisplay.textContent = bankMoney.toLocaleString();
    const bankDisplayTop = document.querySelector("#bank-money-display-top");
    if (bankDisplayTop) bankDisplayTop.textContent = bankMoney.toLocaleString();
    const bankDisplaySide = document.querySelector("#bank-money-display-side");
    if (bankDisplaySide) bankDisplaySide.textContent = bankMoney.toLocaleString();
}