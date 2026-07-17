// ============================================================
// omikuji-ui-map.js
// 🗺️🗾 境内マップ・全国神社巡りマップの表示更新
// ============================================================

function updateShrineMapUI() {
    const grid = document.querySelector("#map-grid");
    if (!grid) return;

    grid.innerHTML = MAP_TILES.map((tile, i) => {
        const owned = i < shrineMapLevel;
        const isNext = i === shrineMapLevel;
        const tooltip = owned
            ? tile.name + "：" + tile.desc
            : (isNext ? "次に購入できるマス：" + tile.name + "（" + tile.cost.toLocaleString() + "円）" : "？？？（未購入）");
        return (
            '<div class="map-tile' + (owned ? " map-tile-owned" : "") + (isNext ? " map-tile-next" : "") + '" title="' +
            tooltip.replace(/"/g, "&quot;") + '">' +
            '<div class="map-tile-emoji">' + (owned ? tile.emoji : "❔") + '</div>' +
            '</div>'
        );
    }).join("");

    const progressEl = document.querySelector("#map-progress");
    if (progressEl) {
        progressEl.textContent = "完成状況：" + shrineMapLevel + " / " + MAP_TILES.length + "マス";
    }

    const nextText = document.querySelector("#map-next-text");
    const buyBtn = document.querySelector("#map-buy-btn");
    const next = MAP_TILES[shrineMapLevel];

    if (!next) {
        if (nextText) nextText.textContent = "🏆 境内マップが完成しました！永続的に大吉ボーナス+" + (SHRINE_MAP_COMPLETE_BONUS * 100).toFixed(1) + "%を授かっています。";
        if (buyBtn) buyBtn.classList.add("hidden");
        updateShrineMapJapanUI(); // 🗾 境内マップ完成後も、全国神社巡りマップの表示更新は続ける
        return;
    }

    if (nextText) {
        nextText.textContent = "次のマス：" + next.emoji + " " + next.name + "（" + next.cost.toLocaleString() + "円）　" + next.desc;
    }
    if (buyBtn) {
        buyBtn.classList.remove("hidden");
        buyBtn.disabled = currentMoney < next.cost;
    }

    updateShrineMapJapanUI(); // 🗾 境内マップの状態が変わるたびに、全国神社巡りマップの解放状況も一緒に見直す
}

// 🗾 全国神社巡りマップ（境内マップ完成後に解放される第2段階）の表示を更新する
function updateShrineMapJapanUI() {
    const lockedBox = document.querySelector("#map-japan-locked");
    const unlockedBox = document.querySelector("#map-japan-unlocked");
    if (!lockedBox || !unlockedBox) return;

    const unlocked = isShrineMapComplete();
    lockedBox.classList.toggle("hidden", unlocked);
    unlockedBox.classList.toggle("hidden", !unlocked);
    if (!unlocked) return;

    // 🗾 日本地図風のマス目に47都道府県を配置する（row/colは実際の位置関係を簡略化したもの）
    const grid = document.querySelector("#map-japan-grid");
    if (grid) {
        grid.innerHTML = JAPAN_PREFECTURES.map(pref => {
            const ownedCount = pref.shrines.filter(isJapanShrineComplete).length;
            const total = pref.shrines.length;
            const complete = ownedCount === total;
            const partial = ownedCount > 0 && !complete;
            const selected = selectedJapanPrefKey === pref.key;
            const shortName = pref.name.replace(/(都|府|県)$/, "");
            const cls = "map-japan-tile" +
                (complete ? " map-japan-tile-complete" : "") +
                (partial ? " map-japan-tile-partial" : "") +
                (selected ? " map-japan-tile-selected" : "");
            return (
                '<button type="button" class="' + cls + '" style="grid-row:' + pref.row + ';grid-column:' + pref.col + ';" ' +
                'onclick="selectJapanPrefecture(\'' + pref.key + '\')" title="' + pref.name + '：' + ownedCount + '/' + total + '参拝済み">' +
                '<span class="map-japan-tile-label">' + shortName + '</span>' +
                '<span class="map-japan-tile-count">' + ownedCount + '/' + total + '</span>' +
                '</button>'
            );
        }).join("");
    }

    // 🗾 コンプリート状況：神社の数、都道府県の数の両方を表示
    const shrineCount = getJapanShrineOwnedCount();
    const prefCount = getJapanPrefectureCompleteCount();
    const okumiyaCount = getOkumiyaCompleteCount();
    const progressEl = document.querySelector("#map-japan-progress");
    if (progressEl) {
        progressEl.textContent =
            "⛩️ コンプリートした神社：" + shrineCount + " / " + JAPAN_SHRINE_COUNT + "社　｜　" +
            "🗾 コンプリートした都道府県：" + prefCount + " / " + JAPAN_PREFECTURES.length + "県　｜　" +
            "🏯 完成した奥宮：" + okumiyaCount + " / " + JAPAN_SHRINE_COUNT + "社";
    }

    // 🗾 選択中の都道府県の詳細（神社ごとのパーツ組み立て状況）を表示する
    const detailBox = document.querySelector("#map-japan-detail");
    if (detailBox) {
        const pref = JAPAN_PREFECTURES.find(p => p.key === selectedJapanPrefKey);
        if (!pref) {
            detailBox.innerHTML = '<p class="collect-item-desc">👆 上の地図から、好きな都道府県をタップして参拝先を選びましょう。</p>';
        } else {
            const shrinesHtml = pref.shrines.map(shrine => {
                const complete = isJapanShrineComplete(shrine);
                const ownedParts = getJapanShrinePartsOwnedCount(shrine);
                const partsHtml = SHRINE_BUILD_PARTS.map(part => {
                    const owned = isJapanShrinePartOwned(shrine, part);
                    const cost = getShrinePartCost(shrine, part);
                    const actionHtml = owned
                        ? '<span class="mission-status-tag mission-status-done">✅</span>'
                        : '<button class="btn-shop-buy" onclick="buyJapanShrinePart(\'' + pref.key + '\',\'' + shrine.key + '\',\'' + part.key + '\')" type="button"' +
                          (currentMoney < cost ? " disabled" : "") + '>' + cost.toLocaleString() + '円</button>';
                    return '<div class="map-japan-part-row"><span>' + part.emoji + ' ' + part.name + '</span>' + actionHtml + '</div>';
                }).join("");

                // 🏯 本殿が完成した神社だけ、第二弾「奥宮・摂社」の建立セクションを表示する
                let okumiyaHtml = "";
                if (complete) {
                    const okumiyaCompleteFlag = isOkumiyaComplete(shrine);
                    const okumiyaOwnedParts = getOkumiyaPartsOwnedCount(shrine);
                    const okumiyaPartsHtml = OKUMIYA_BUILD_PARTS.map(part => {
                        const owned = isOkumiyaPartOwned(shrine, part);
                        const cost = getOkumiyaPartCost(shrine, part);
                        const actionHtml = owned
                            ? '<span class="mission-status-tag mission-status-done">✅</span>'
                            : '<button class="btn-shop-buy" onclick="buyOkumiyaPart(\'' + pref.key + '\',\'' + shrine.key + '\',\'' + part.key + '\')" type="button"' +
                              (currentMoney < cost ? " disabled" : "") + '>' + cost.toLocaleString() + '円</button>';
                        return '<div class="map-japan-part-row"><span>' + part.emoji + ' ' + part.name + '</span>' + actionHtml + '</div>';
                    }).join("");
                    okumiyaHtml =
                        '<div class="map-japan-shrine-block' + (okumiyaCompleteFlag ? " map-japan-shrine-complete" : "") + '" style="margin-top:6px;">' +
                        '<p class="map-japan-shrine-title">🏯 奥宮・摂社（第二弾）' +
                        (okumiyaCompleteFlag ? ' <span class="mission-status-tag mission-status-done">🏯 完成</span>' : ' <span class="map-japan-shrine-progress">(' + okumiyaOwnedParts + '/' + OKUMIYA_BUILD_PARTS.length + ')</span>') +
                        '</p>' + okumiyaPartsHtml + '</div>';
                }

                return (
                    '<div class="map-japan-shrine-block' + (complete ? " map-japan-shrine-complete" : "") + '">' +
                    '<p class="map-japan-shrine-title">' + shrine.emoji + ' ' + shrine.name +
                    (complete ? ' <span class="mission-status-tag mission-status-done">⛩️ 完成</span>' : ' <span class="map-japan-shrine-progress">(' + ownedParts + '/' + SHRINE_BUILD_PARTS.length + ')</span>') +
                    '</p>' + partsHtml + okumiyaHtml + '</div>'
                );
            }).join("");
            const completeTag = isJapanPrefectureComplete(pref) ? '<span class="mission-status-tag mission-status-done">🎏 コンプリート！</span>' : "";
            detailBox.innerHTML =
                '<p class="shop-section-title" style="margin-top:0;">' + pref.name + " " + completeTag + '</p>' +
                shrinesHtml;
        }
    }

    const container = document.querySelector(".container");
    if (container) container.classList.toggle("japan-map-complete", isShrineMapJapanComplete());

    updateShrineMapPowerSpotUI(); // 🌄 全国神社巡りの状態が変わるたびに、パワースポット編（第三弾）の解放状況も一緒に見直す
}

// 🌄 パワースポット編（全国神社巡り＋奥宮の両方が完成すると進めるようになる第三弾）の表示を更新する
function updateShrineMapPowerSpotUI() {
    const lockedBox = document.querySelector("#map-powerspot-locked");
    const readyBox = document.querySelector("#map-powerspot-ready");
    const unlockedBox = document.querySelector("#map-powerspot-unlocked");
    if (!lockedBox || !readyBox || !unlockedBox) return;

    const eligible = isPowerSpotMapEligible();
    const revealed = isPowerSpotMapUnlocked();

    lockedBox.classList.toggle("hidden", eligible || revealed);
    readyBox.classList.toggle("hidden", !(eligible && !revealed));
    unlockedBox.classList.toggle("hidden", !revealed);
    if (!revealed) return;

    // 🌄 日本地図風のマス目に47都道府県を配置する（JAPAN_PREFECTURESと同じ位置関係を使う）
    const grid = document.querySelector("#map-powerspot-grid");
    if (grid) {
        grid.innerHTML = POWER_SPOT_PREFECTURES.map(pref => {
            const ownedCount = pref.spots.filter(isPowerSpotOwned).length;
            const total = pref.spots.length;
            const complete = ownedCount === total;
            const partial = ownedCount > 0 && !complete;
            const selected = selectedPowerSpotPrefKey === pref.key;
            const shortName = pref.name.replace(/(都|府|県)$/, "");
            const cls = "map-japan-tile" +
                (complete ? " map-japan-tile-complete" : "") +
                (partial ? " map-japan-tile-partial" : "") +
                (selected ? " map-japan-tile-selected" : "");
            return (
                '<button type="button" class="' + cls + '" style="grid-row:' + pref.row + ';grid-column:' + pref.col + ';" ' +
                'onclick="selectPowerSpotPrefecture(\'' + pref.key + '\')" title="' + pref.name + '：' + ownedCount + '/' + total + '訪問済み">' +
                '<span class="map-japan-tile-label">' + shortName + '</span>' +
                '<span class="map-japan-tile-count">' + ownedCount + '/' + total + '</span>' +
                '</button>'
            );
        }).join("");
    }

    // 🌄 コンプリート状況：スポットの数、都道府県の数の両方を表示
    const spotCount = getPowerSpotOwnedCount();
    const prefCount = getPowerSpotPrefectureCompleteCount();
    const progressEl = document.querySelector("#map-powerspot-progress");
    if (progressEl) {
        progressEl.textContent =
            "🌄 訪れたスポット：" + spotCount + " / " + POWER_SPOT_COUNT + "箇所　｜　" +
            "🗾 コンプリートした都道府県：" + prefCount + " / " + POWER_SPOT_PREFECTURES.length + "県";
    }

    // 🌄 選択中の都道府県の詳細（スポットごとの訪問状況）を表示する
    const detailBox = document.querySelector("#map-powerspot-detail");
    if (detailBox) {
        const pref = POWER_SPOT_PREFECTURES.find(p => p.key === selectedPowerSpotPrefKey);
        if (!pref) {
            detailBox.innerHTML = '<p class="collect-item-desc">👆 上の地図から、好きな都道府県をタップして訪問先を選びましょう。</p>';
        } else {
            const spotsHtml = pref.spots.map(spot => {
                const owned = isPowerSpotOwned(spot);
                const actionHtml = owned
                    ? '<span class="mission-status-tag mission-status-done">✅ 訪問済み</span>'
                    : '<button class="btn-shop-buy" onclick="buyPowerSpot(\'' + pref.key + '\',\'' + spot.key + '\')" type="button"' +
                      (currentMoney < spot.cost ? " disabled" : "") + '>' + spot.cost.toLocaleString() + '円</button>';
                return (
                    '<div class="map-japan-shrine-block' + (owned ? " map-japan-shrine-complete" : "") + '">' +
                    '<p class="map-japan-shrine-title">' + spot.emoji + ' ' + spot.name + '</p>' +
                    '<div class="map-japan-part-row"><span>' + spot.emoji + ' ' + spot.name + '</span>' + actionHtml + '</div>' +
                    '</div>'
                );
            }).join("");
            const completeTag = isPowerSpotPrefectureComplete(pref) ? '<span class="mission-status-tag mission-status-done">🎏 コンプリート！</span>' : "";
            detailBox.innerHTML =
                '<p class="shop-section-title" style="margin-top:0;">' + pref.name + " " + completeTag + '</p>' +
                spotsHtml;
        }
    }
}

// 🌄 パワースポット編の地図上で都道府県をタップした時の処理（同じ県を再タップすると選択解除）
function selectPowerSpotPrefecture(prefKey) {
    selectedPowerSpotPrefKey = (selectedPowerSpotPrefKey === prefKey) ? "" : prefKey;
    updateShrineMapPowerSpotUI();
}

// 🗾 地図上の都道府県をタップした時の処理（同じ県を再タップすると選択解除）
function selectJapanPrefecture(prefKey) {
    selectedJapanPrefKey = (selectedJapanPrefKey === prefKey) ? "" : prefKey;
    updateShrineMapJapanUI();
}