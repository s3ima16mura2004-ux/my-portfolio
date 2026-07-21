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

    updateJapanMapArchiveUI(revealed); // 🌄 第三弾解放時、第一弾・第二弾の日本地図をアーカイブ（折りたたみ）へ移動する
    updateMiniThemeMapUI(); // 🎏 パワースポット編の状態が変わるたびに、第四弾の解放状況も一緒に見直す
    updateWorldSpotMapUI(); // 🌍 第四弾の状態が変わるたびに、第五弾（最終章）の解放状況も一緒に見直す

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

// 🌄 パワースポット編（第三弾）が解放されたら、全国神社巡り・奥宮（第一弾・第二弾）の日本地図セクションを
// メインの位置から折りたたみ式のアーカイブへ移動する（DOM要素そのものを移動するのでidの重複は起きない）
function updateJapanMapArchiveUI(revealed) {
    const section = document.querySelector("#japan-map-section");
    const inlineSlot = document.querySelector("#japan-map-inline-slot");
    const archiveBox = document.querySelector("#japan-map-archive");
    const archiveBody = document.querySelector("#japan-map-archive-body");
    if (!section || !inlineSlot || !archiveBox || !archiveBody) return;

    if (revealed) {
        if (section.parentElement !== archiveBody) archiveBody.appendChild(section);
        archiveBox.classList.remove("hidden");
    } else {
        if (section.parentElement !== inlineSlot) inlineSlot.appendChild(section);
        archiveBox.classList.add("hidden");
    }
}

// 🗾 地図上の都道府県をタップした時の処理（同じ県を再タップすると選択解除）
function selectJapanPrefecture(prefKey) {
    selectedJapanPrefKey = (selectedJapanPrefKey === prefKey) ? "" : prefKey;
    updateShrineMapJapanUI();
}

// 🎏 「日本三大○○」ミニマップ集（パワースポット編が完成すると進めるようになる第四弾）の表示を更新する
// 🎏 「日本三大○○」（第四弾）が解放されたら、パワースポット編（第三弾）のセクションを
// メインの位置から折りたたみ式のアーカイブへ移動する（第一弾・第二弾と同じ考え方）
function updatePowerSpotMapArchiveUI(revealed) {
    const section = document.querySelector("#map-powerspot-section");
    const inlineSlot = document.querySelector("#powerspot-inline-slot");
    const archiveBox = document.querySelector("#powerspot-map-archive");
    const archiveBody = document.querySelector("#powerspot-map-archive-body");
    if (!section || !inlineSlot || !archiveBox || !archiveBody) return;

    if (revealed) {
        if (section.parentElement !== archiveBody) archiveBody.appendChild(section);
        archiveBox.classList.remove("hidden");
    } else {
        if (section.parentElement !== inlineSlot) inlineSlot.appendChild(section);
        archiveBox.classList.add("hidden");
    }
}

function updateMiniThemeMapUI() {
    const lockedBox = document.querySelector("#map-minitheme-locked");
    const readyBox = document.querySelector("#map-minitheme-ready");
    const unlockedBox = document.querySelector("#map-minitheme-unlocked");
    if (!lockedBox || !readyBox || !unlockedBox) return;

    const eligible = isMiniThemeMapEligible();
    const revealed = isMiniThemeMapUnlocked();

    lockedBox.classList.toggle("hidden", eligible || revealed);
    readyBox.classList.toggle("hidden", !(eligible && !revealed));
    unlockedBox.classList.toggle("hidden", !revealed);
    updatePowerSpotMapArchiveUI(revealed); // 🌄 第四弾解放時、第三弾（パワースポット編）をアーカイブ（折りたたみ）へ移動する
    if (!revealed) return;

    const progressEl = document.querySelector("#map-minitheme-progress");
    if (progressEl) {
        progressEl.textContent =
            "🎏 訪れたスポット：" + getMiniThemeOwnedCount() + " / " + MINI_THEME_SPOT_COUNT + "箇所　｜　" +
            "🏆 コンプリートしたテーマ：" + getMiniThemeCompleteCount() + " / " + MINI_THEME_COLLECTIONS.length;
    }

    const listEl = document.querySelector("#minitheme-list");
    if (listEl) {
        listEl.innerHTML = MINI_THEME_COLLECTIONS.map(theme => {
            const ownedCount = theme.spots.filter(isMiniThemeSpotOwned).length;
            const complete = ownedCount === theme.spots.length;
            const spotsHtml = theme.spots.map(spot => {
                const owned = isMiniThemeSpotOwned(spot);
                const actionHtml = owned
                    ? '<span class="mission-status-tag mission-status-done">✅ 訪問済み</span>'
                    : '<button class="btn-shop-buy" onclick="buyMiniThemeSpot(\'' + theme.key + '\',\'' + spot.key + '\')" type="button"' +
                      (currentMoney < spot.cost ? " disabled" : "") + '>' + spot.cost.toLocaleString() + '円</button>';
                return '<div class="map-japan-part-row"><span>' + spot.emoji + ' ' + spot.name + '</span>' + actionHtml + '</div>';
            }).join("");
            return (
                '<div class="map-japan-shrine-block' + (complete ? " map-japan-shrine-complete" : "") + '">' +
                '<p class="map-japan-shrine-title">' + theme.emoji + ' ' + theme.name +
                (complete ? ' <span class="mission-status-tag mission-status-done">🎏 コンプリート</span>' : ' <span class="map-japan-shrine-progress">(' + ownedCount + '/' + theme.spots.length + ')</span>') +
                '</p>' + spotsHtml + '</div>'
            );
        }).join("");
    }
}

// 🌍 世界の絶景・名所編（日本三大○○が完成すると進めるようになる第五弾・最終章）の表示を更新する
function updateWorldSpotMapUI() {
    const lockedBox = document.querySelector("#map-worldspot-locked");
    const readyBox = document.querySelector("#map-worldspot-ready");
    const unlockedBox = document.querySelector("#map-worldspot-unlocked");
    if (!lockedBox || !readyBox || !unlockedBox) return;

    const eligible = isWorldSpotMapEligible();
    const revealed = isWorldSpotMapUnlocked();

    lockedBox.classList.toggle("hidden", eligible || revealed);
    readyBox.classList.toggle("hidden", !(eligible && !revealed));
    unlockedBox.classList.toggle("hidden", !revealed);
    if (!revealed) return;

    const progressEl = document.querySelector("#map-worldspot-progress");
    if (progressEl) {
        progressEl.textContent =
            "🌍 訪れたスポット：" + getWorldSpotOwnedCount() + " / " + WORLD_SPOT_COUNT + "箇所　｜　" +
            "🏆 コンプリートした地域：" + getWorldSpotRegionCompleteCount() + " / " + WORLD_SPOT_REGIONS.length;
    }

    const listEl = document.querySelector("#worldspot-list");
    if (listEl) {
        listEl.innerHTML = WORLD_SPOT_REGIONS.map(region => {
            const ownedCount = region.spots.filter(isWorldSpotOwned).length;
            const complete = ownedCount === region.spots.length;
            const spotsHtml = region.spots.map(spot => {
                const owned = isWorldSpotOwned(spot);
                const actionHtml = owned
                    ? '<span class="mission-status-tag mission-status-done">✅ 訪問済み</span>'
                    : '<button class="btn-shop-buy" onclick="buyWorldSpot(\'' + region.key + '\',\'' + spot.key + '\')" type="button"' +
                      (currentMoney < spot.cost ? " disabled" : "") + '>' + spot.cost.toLocaleString() + '円</button>';
                return '<div class="map-japan-part-row"><span>' + spot.emoji + ' ' + spot.name + '</span>' + actionHtml + '</div>';
            }).join("");
            return (
                '<div class="map-japan-shrine-block' + (complete ? " map-japan-shrine-complete" : "") + '">' +
                '<p class="map-japan-shrine-title">' + region.emoji + ' ' + region.name +
                (complete ? ' <span class="mission-status-tag mission-status-done">🌍 コンプリート</span>' : ' <span class="map-japan-shrine-progress">(' + ownedCount + '/' + region.spots.length + ')</span>') +
                '</p>' + spotsHtml + '</div>'
            );
        }).join("");
    }

    updateMapPath6UI(); // 🔀 世界の絶景・名所編の状態が変わるたびに、第六弾（歴史編／神社ビルダーモード）の解放状況も一緒に見直す
}
// ============================================================
// 🔀 第六弾：世界の絶景・名所編（第五弾）完成後に分岐する「歴史編」／「神社ビルダーモード」の表示更新
// ============================================================

// 🔀 分岐選択画面（歴史編／神社ビルダーモードのどちらを選ぶか）の表示を更新する
function updateMapPath6UI() {
    const choiceBox = document.querySelector("#map-path6-choice");
    if (choiceBox) {
        choiceBox.classList.toggle("hidden", !isMapPath6ChoicePending());
    }
    updateHistoryMapUI();
    updateBuilderModeUI();
}

// 🏯 歴史編（第六弾-A）の表示を更新する
function updateHistoryMapUI() {
    const lockedBox = document.querySelector("#map-history-locked");
    const unlockedBox = document.querySelector("#map-history-unlocked");
    if (!lockedBox || !unlockedBox) return;

    const revealed = isHistoryMapUnlocked();
    lockedBox.classList.toggle("hidden", revealed || isMapPath6ChoicePending());
    unlockedBox.classList.toggle("hidden", !revealed);
    if (!revealed) return;

    const progressEl = document.querySelector("#map-history-progress");
    if (progressEl) {
        progressEl.textContent =
            "🏯 訪れた史跡：" + getHistoryOwnedCount() + " / " + HISTORY_SPOT_COUNT + "箇所　｜　" +
            "🏆 コンプリートした時代：" + getHistoryEraCompleteCount() + " / " + HISTORY_ERAS.length;
    }

    const grid = document.querySelector("#map-history-era-grid");
    if (grid) {
        grid.innerHTML = HISTORY_ERAS.map(era => {
            const ownedCount = era.spots.filter(isHistorySpotOwned).length;
            const total = era.spots.length;
            const complete = ownedCount === total;
            const selected = selectedHistoryEraKey === era.key;
            const cls = "map-tile" + (complete ? " map-tile-owned" : "") + (selected ? " map-japan-tile-selected" : "");
            return (
                '<button type="button" class="' + cls + '" onclick="selectHistoryEra(\'' + era.key + '\')" ' +
                'title="' + era.name + '：' + ownedCount + '/' + total + '訪問済み">' +
                '<div class="map-tile-emoji">' + era.emoji + '</div>' +
                '<div class="dex-name">' + era.name + '</div>' +
                '</button>'
            );
        }).join("");
    }

    const detailBox = document.querySelector("#map-history-detail");
    if (detailBox) {
        const era = HISTORY_ERAS.find(e => e.key === selectedHistoryEraKey);
        if (!era) {
            detailBox.innerHTML = '<p class="collect-item-desc">👆 上の一覧から、好きな時代をタップして史跡を選びましょう。</p>';
        } else {
            const spotsHtml = era.spots.map(spot => {
                const owned = isHistorySpotOwned(spot);
                const actionHtml = owned
                    ? '<span class="mission-status-tag mission-status-done">✅ 訪問済み</span>'
                    : '<button class="btn-shop-buy" onclick="buyHistorySpot(\'' + era.key + '\',\'' + spot.key + '\')" type="button"' +
                      (currentMoney < spot.cost ? " disabled" : "") + '>' + spot.cost.toLocaleString() + '円</button>';
                return '<div class="map-japan-part-row"><span>' + spot.emoji + ' ' + spot.name + '</span>' + actionHtml + '</div>';
            }).join("");
            const completeTag = isHistoryEraComplete(era) ? '<span class="mission-status-tag mission-status-done">🏯 コンプリート！</span>' : "";
            detailBox.innerHTML =
                '<p class="shop-section-title" style="margin-top:0;">' + era.name + " " + completeTag + '</p>' +
                spotsHtml;
        }
    }
}

// 🏯 歴史編の時代一覧から1つタップした時の処理（同じ時代を再タップすると選択解除）
function selectHistoryEra(eraKey) {
    selectedHistoryEraKey = (selectedHistoryEraKey === eraKey) ? "" : eraKey;
    updateHistoryMapUI();
}

// 🏗️ 神社ビルダーモード（第六弾-B）の表示を更新する
function updateBuilderModeUI() {
    const lockedBox = document.querySelector("#map-builder-locked");
    const unlockedBox = document.querySelector("#map-builder-unlocked");
    if (!lockedBox || !unlockedBox) return;

    const revealed = isBuilderModeUnlocked();
    lockedBox.classList.toggle("hidden", revealed || isMapPath6ChoicePending());
    unlockedBox.classList.toggle("hidden", !revealed);
    if (!revealed) return;

    const progressEl = document.querySelector("#map-builder-progress");
    if (progressEl) {
        progressEl.textContent = "🏗️ 完成状況：" + builderLevel + " / " + BUILDER_PARTS.length + "パーツ";
    }

    const listEl = document.querySelector("#map-builder-list");
    if (listEl) {
        listEl.innerHTML = BUILDER_PARTS.map((part, i) => {
            const owned = i < builderLevel;
            const isNext = i === builderLevel;
            return (
                '<div class="map-japan-part-row"><span>' + (owned ? part.emoji : "❔") + ' ' + (owned ? part.name : "？？？") + '</span>' +
                (owned
                    ? '<span class="mission-status-tag mission-status-done">✅ 完成</span>'
                    : (isNext ? '<span class="mission-status-tag">' + part.cost.toLocaleString() + '円</span>' : '<span class="mission-status-tag">未解放</span>')
                ) + '</div>'
            );
        }).join("");
    }

    const nextText = document.querySelector("#map-builder-next-text");
    const buyBtn = document.querySelector("#map-builder-buy-btn");
    const next = BUILDER_PARTS[builderLevel];

    if (!next) {
        if (nextText) nextText.textContent = "🏆 神社ビルダーモードが完成しました！永続的に大吉ボーナス+" + (SHRINE_MAP_BUILDER_COMPLETE_BONUS * 100).toFixed(1) + "%を授かっています。";
        if (buyBtn) buyBtn.classList.add("hidden");
        return;
    }

    if (nextText) {
        nextText.textContent = "次のパーツ：" + next.emoji + " " + next.name + "（" + next.cost.toLocaleString() + "円）　" + next.desc;
    }
    if (buyBtn) {
        buyBtn.classList.remove("hidden");
        buyBtn.disabled = currentMoney < next.cost;
    }
}