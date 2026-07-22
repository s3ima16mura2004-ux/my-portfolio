// ============================================================
// goshuincho.js
// 📔 goshuincho.html（御朱印帳ページ）専用の初期化処理
// 図鑑・境内マップ各段階・称号の達成状況を1ページにまとめて表示する（読み取り専用）。
// ============================================================

window.addEventListener("DOMContentLoaded", async () => {
    currentUser = localStorage.getItem("logged_in_user");

    if (!currentUser) {
        window.location.href = "index.html";
        return;
    }

    const userDisplay = document.querySelector("#user-display");
    if (userDisplay) userDisplay.textContent = currentUser;

    try {
        await loadUserState();

        const moneySpan = document.querySelector("#money");
        if (moneySpan) moneySpan.textContent = currentMoney.toLocaleString();

        renderGoshuinchoUI();
    } catch (e) {
        console.error("御朱印帳ページの読み込みに失敗しました: ", e);
    }
});

// 📔 各コレクションの達成状況を集計し、開閉式のカード一覧として描画する
function renderGoshuinchoUI() {
    const container = document.querySelector("#goshuincho-list");
    if (!container) return;

    const dexCurrent = Object.keys(dexAchieved).filter(k => dexAchieved[k]).length;
    const dexTotal = DEX_ENTRIES.length;

    const stats = buildTitleStats();
    const earnedTitleKeys = TITLES.filter(t => t.condition(stats)).map(t => t.key);

    const items = [
        {
            emoji: "📖", name: "おみくじ図鑑", current: dexCurrent, total: dexTotal, link: "dex.html", linkLabel: "図鑑ページへ",
            detailDesc: "おみくじの結果10種類を、大吉から大凶（神の試練）まで一通り引くとコンプリートです。",
            subItems: DEX_ENTRIES.map(e => ({ name: e.emoji + " " + e.name, done: !!dexAchieved[e.key], cond: "この結果を1回引く" }))
        },
        {
            emoji: "⛩️", name: "境内マップ", current: shrineMapLevel, total: MAP_TILES.length, link: "map.html", linkLabel: "境内マップページへ",
            detailDesc: "所持金を使って境内のマスを端から1つずつ購入していくと完成します。マスが後半になるほど費用が上がります。全" + MAP_TILES.length + "マスを埋めるとコンプリートです。"
        },
        {
            emoji: "🗾", name: "全国神社巡り", current: getJapanShrineOwnedCount(), total: JAPAN_SHRINE_COUNT, link: "map.html", linkLabel: "境内マップページへ",
            detailDesc: "境内マップ完成後に解放されます。全国47都道府県、各2〜3社の神社を、所持金でパーツを購入して組み立てると完成します。全" + JAPAN_SHRINE_COUNT + "社を完成させるとコンプリートです。"
        },
        {
            emoji: "🏯", name: "奥宮・摂社", current: getOkumiyaCompleteCount(), total: JAPAN_SHRINE_COUNT, link: "map.html", linkLabel: "境内マップページへ",
            detailDesc: "神社本体が完成した後に、その神社の「奥宮」を追加で組み立てると完成します。全国神社巡りと同じ" + JAPAN_SHRINE_COUNT + "社が対象です。"
        },
        {
            emoji: "🌄", name: "パワースポット", current: getPowerSpotOwnedCount(), total: POWER_SPOT_COUNT, link: "map.html", linkLabel: "境内マップページへ",
            detailDesc: "全国神社巡り・奥宮の両方を完成させると解放されます。各都道府県のパワースポットを所持金で訪れると完成します。全" + POWER_SPOT_COUNT + "箇所を訪れるとコンプリートです。"
        },
        {
            emoji: "🎏", name: "日本三大○○", current: getMiniThemeOwnedCount(), total: MINI_THEME_SPOT_COUNT, link: "map.html", linkLabel: "境内マップページへ",
            detailDesc: "パワースポット編を完成させると解放されます。テーマごとに3箇所ずつ訪れ、全" + MINI_THEME_COLLECTIONS.length + "テーマ・" + MINI_THEME_SPOT_COUNT + "箇所を訪れるとコンプリートです。"
        },
        {
            emoji: "🌍", name: "世界の絶景・名所", current: getWorldSpotOwnedCount(), total: WORLD_SPOT_COUNT, link: "map.html", linkLabel: "境内マップページへ",
            detailDesc: "「日本三大○○」を完成させると解放されます。世界各地の絶景・名所、全" + WORLD_SPOT_COUNT + "箇所を訪れるとコンプリートです。"
        },
        {
            emoji: "🎖️", name: "称号", current: earnedTitleKeys.length, total: TITLES.length, link: "omikuji2.html", linkLabel: "称号を選ぶ（おみくじページ）",
            detailDesc: "様々な条件を満たすと自動的に獲得できる称号の一覧です。獲得後は「おみくじ」ページの称号欄から1つだけ選んで名前の横に表示できます。",
            subItems: TITLES.map(t => ({ name: t.emoji + " " + t.name, done: earnedTitleKeys.includes(t.key), cond: t.desc }))
        }
    ];

    container.innerHTML = items.map(item => {
        const pct = item.total > 0 ? Math.floor((item.current / item.total) * 100) : 0;
        const complete = item.total > 0 && item.current >= item.total;

        let subListHtml = "";
        if (item.subItems) {
            subListHtml = '<div class="goshuin-sub-list">' + item.subItems.map(sub =>
                '<div class="goshuin-sub-row' + (sub.done ? " goshuin-sub-done" : "") + '">' +
                    '<span class="goshuin-sub-name">' + (sub.done ? "✅" : "⬜") + " " + sub.name + '</span>' +
                    '<span class="goshuin-sub-cond">' + sub.cond + '</span>' +
                '</div>'
            ).join("") + '</div>';
        }

        return (
            '<details class="goshuin-card' + (complete ? " goshuin-card-complete" : "") + '">' +
                '<summary>' +
                    '<div class="goshuin-emoji">' + item.emoji + '</div>' +
                    '<div class="goshuin-body">' +
                        '<p class="goshuin-name">' + item.name + (complete ? " 🈴コンプリート" : "") + '</p>' +
                        '<div class="mission-progress-outer"><div class="mission-progress-inner" style="width:' + pct + '%"></div></div>' +
                        '<p class="goshuin-progress">' + item.current.toLocaleString() + ' / ' + item.total.toLocaleString() + '（' + pct + '%）</p>' +
                    '</div>' +
                '</summary>' +
                '<div class="goshuin-detail-body">' +
                    '<p class="goshuin-detail-desc">' + item.detailDesc + '</p>' +
                    subListHtml +
                    '<a href="' + item.link + '" class="goshuin-detail-link">' + item.linkLabel + ' ▶</a>' +
                '</div>' +
            '</details>'
        );
    }).join("");
}