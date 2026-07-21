// ============================================================
// omikuji-main.js
// 🚀 ページ読み込み時の初期化と、結果送信処理
// 他のファイルで定義された関数・状態変数を使って
// 画面を起動するエントリーポイント。
// ============================================================

// 画面が開いた瞬間に、ログイン確認とユーザーごとのデータ読み込みを行う
window.addEventListener("DOMContentLoaded", async () => {
    currentUser = localStorage.getItem("logged_in_user");

    if (!currentUser) {
        // 未ログインの場合はログインページへ
        window.location.href = "index.html";
        return;
    }

    const userDisplay = document.querySelector("#user-display");
    if (userDisplay) userDisplay.innerHTML = currentUser;

    const luckyBox = document.querySelector("#lucky-item-box");
    const luckyName = document.querySelector("#lucky-item-name");
    const luckyDesc = document.querySelector("#lucky-item-desc");
    const drawBtn = document.querySelector(".btn-draw");
    const draw10Btn = document.querySelector("#draw10Btn");

    // Firestoreからのデータ取得が終わるまで、おみくじボタンを一旦ロックしておく
    if (drawBtn) drawBtn.disabled = true;
    if (draw10Btn) draw10Btn.disabled = true;

    try {
        // omikuji2.html内のFirebase初期化(モジュール)が終わるのを少し待つ
        let tries = 0;
        while ((!window.omikujiDB || !window.omikujiDoc || !window.omikujiGetDoc) && tries < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            tries++;
        }

        const userRef = window.omikujiDoc(window.omikujiDB, "users", currentUser);
        const snap = await window.omikujiGetDoc(userRef);

        if (snap.exists()) {
            const data = snap.data();
            currentMoney = typeof data.money === "number" ? data.money : 10000;
            feverCount = typeof data.feverCount === "number" ? data.feverCount : 0;
            feverTier = typeof data.feverTier === "number" ? data.feverTier : 1;
            prayDate = data.prayDate || "";
            prayCount = typeof data.prayCount === "number" ? data.prayCount : 0;
            luckyItemKey = data.luckyItem || "";
            ownedItems = Object.assign({
                koban: 0, shinboku: 0, ishikoro: 0, tanzaku: 0,
                orihime_thread: 0, hikoboshi_star: 0, amanogawa_kirameki: 0,
                natsumatsuri_lantern: 0, kingyo: 0, kakigori: 0, hanabi_tama: 0,
                tsukimi_mochi: 0, susuki_hoshi: 0, tsukimi_dango: 0,
                momiji_shiori: 0, icho_leaf: 0, kuri: 0,
                hatsuyume_fuji: 0, hatsuyume_taka: 0, hatsuyume_nasu: 0,
                izumo_omamori: 0, kamisama_wasuremono: 0, kagura_suzu: 0,
                chitose_fukuro: 0, orizuru_negai: 0, kinchaku_omamori: 0,
                christmas_ribbon: 0, seiya_candle: 0, snowman_charm: 0,
                choco_kakera: 0, akai_ito: 0, love_letter: 0,
                joya_kane_hibiki: 0, toshikoshi_soba: 0, susuharai_houki: 0,
                hanami_dango: 0, sakura_hanabira: 0, hanami_bento: 0,
                fuku_mame: 0, oni_no_tsuno: 0, hiiragi_iwashi: 0,
                wakaba_shinme: 0, haru_no_tsubomi: 0, harukaze_no_ha: 0,
                koinobori_uroko: 0, kabuto_kazari: 0, shobu_no_ha: 0,
                chinowa_kaya: 0, minazuki_gashi: 0, oharai_no_gohei: 0
            }, data.ownedItems || {});
            equippedCollectible = data.equippedCollectible || "";
            shopItemKey = data.shopItemKey || "";
            shopItemRemaining = typeof data.shopItemRemaining === "number" ? data.shopItemRemaining : 0;
            totalDraws = typeof data.totalDraws === "number" ? data.totalDraws : 0;
            totalDaikichi = typeof data.totalDaikichi === "number" ? data.totalDaikichi : 0;
            totalProfit = typeof data.totalProfit === "number" ? data.totalProfit : 0;
            totalWinnings = typeof data.totalWinnings === "number" ? data.totalWinnings : 0;
            urnLevel = typeof data.urnLevel === "number" ? data.urnLevel : 0;
            companionExp = typeof data.companionExp === "number" ? data.companionExp : 0;
            ownedFriends = Object.assign({ shirohebi: false, kitsune: false }, data.ownedFriends || {});

            const today = todayStr();
            taianActive = (data.taianDate === today) && data.taianActive === true;
            bankMoney = typeof data.bankMoney === "number" ? data.bankMoney : 0;
            dexAchieved = Object.assign(
                { daidaikichi: false, daikichi: false, kamikichi: false, kichi: false, chuukichi: false, syoukichi: false, suekichi: false, kyou: false, daikyou: false, daidaikyou: false },
                data.dexAchieved || {}
            );
            dexRewardClaimed = data.dexRewardClaimed === true;
            gotDaidaikichi = data.gotDaidaikichi === true;
            gotKamikichi = data.gotKamikichi === true;
            gotDaidaikyou = data.gotDaidaikyou === true;
            gotUshimitsuDraw = data.gotUshimitsuDraw === true;
            kamikichiBonus = typeof data.kamikichiBonus === "number" ? data.kamikichiBonus : 0;
            ishikoro500Claimed = data.ishikoro500Claimed === true;
            gachaTickets = typeof data.gachaTickets === "number" ? data.gachaTickets : 0;
            birthdayTicket = data.birthdayTicket === true;
            kimagureFeverUntil = typeof data.kimagureFeverUntil === "number" ? data.kimagureFeverUntil : 0;
            tanabataWishDate = data.tanabataWishDate || "";
            tanabataLuckDate = data.tanabataLuckDate || "";
            orihimeHikoboshiMeetCount = typeof data.orihimeHikoboshiMeetCount === "number" ? data.orihimeHikoboshiMeetCount : 0;
            orihimeHikoboshiLastMetYear = typeof data.orihimeHikoboshiLastMetYear === "number" ? data.orihimeHikoboshiLastMetYear : 0;
            hatsuyumeComplete = data.hatsuyumeComplete === true;

            missionDate = data.missionDate || "";
            missionKeysToday = Array.isArray(data.missionKeysToday) ? data.missionKeysToday : [];
            missionProgress = data.missionProgress || {};
            missionClaimed = data.missionClaimed || {};
            missionDrawsToday = typeof data.missionDrawsToday === "number" ? data.missionDrawsToday : 0;
            wentBankruptToday = data.wentBankruptToday === true;
            steadyVisitorEarned = data.steadyVisitorEarned === true;
            kiyomeShioActive = data.kiyomeShioActive === true;
            boostTicketCount = typeof data.boostTicketCount === "number" ? data.boostTicketCount : 0;
            kannazukiDeposits = typeof data.kannazukiDeposits === "number" ? data.kannazukiDeposits : 0;
            kannazukiRewardedYear = typeof data.kannazukiRewardedYear === "number" ? data.kannazukiRewardedYear : 0;
            santaBagCount = typeof data.santaBagCount === "number" ? data.santaBagCount : 0;
            chocoDrawDate = data.chocoDrawDate || "";
            chocoDrawCount = typeof data.chocoDrawCount === "number" ? data.chocoDrawCount : 0;
            joyaBellDate = data.joyaBellDate || "";
            joyaBellCount = typeof data.joyaBellCount === "number" ? data.joyaBellCount : 0;
            joyaBellCompleteYear = typeof data.joyaBellCompleteYear === "number" ? data.joyaBellCompleteYear : 0;
            hanamiDangoActive = data.hanamiDangoActive === true;
            hanamiDangoTotalCollected = typeof data.hanamiDangoTotalCollected === "number" ? data.hanamiDangoTotalCollected : 0;
            gotKodomonohiExtreme = data.gotKodomonohiExtreme === true;
            mamemakiSuccessCount = typeof data.mamemakiSuccessCount === "number" ? data.mamemakiSuccessCount : 0;
            nagoshiBadCount = typeof data.nagoshiBadCount === "number" ? data.nagoshiBadCount : 0;
            nagoshiLastResetYear = typeof data.nagoshiLastResetYear === "number" ? data.nagoshiLastResetYear : 0;
            shrineMapLevel = typeof data.shrineMapLevel === "number" ? data.shrineMapLevel : 0;

            // 🔨 神社パーツ単位の所持データを読み込む。旧形式（神社ごとのtrue/false）が残っていた場合は、
            // その神社の全パーツを完成済みとして自動的に引き継ぐ（過去の参拝実績を失わないための移行措置）
            japanShrinePartsOwned = (data.japanShrinePartsOwned && typeof data.japanShrinePartsOwned === "object") ? data.japanShrinePartsOwned : {};
            japanOkumiyaPartsOwned = (data.japanOkumiyaPartsOwned && typeof data.japanOkumiyaPartsOwned === "object") ? data.japanOkumiyaPartsOwned : {};
            ownedPowerSpots = (data.ownedPowerSpots && typeof data.ownedPowerSpots === "object") ? data.ownedPowerSpots : {};
            powerSpotMapRevealed = data.powerSpotMapRevealed === true;
            ownedMiniThemeSpots = (data.ownedMiniThemeSpots && typeof data.ownedMiniThemeSpots === "object") ? data.ownedMiniThemeSpots : {};
            miniThemeMapRevealed = data.miniThemeMapRevealed === true;
            ownedWorldSpots = (data.ownedWorldSpots && typeof data.ownedWorldSpots === "object") ? data.ownedWorldSpots : {};
            worldSpotMapRevealed = data.worldSpotMapRevealed === true;
            if (data.japanShrinesOwned && typeof data.japanShrinesOwned === "object") {
                JAPAN_PREFECTURES.forEach(pref => {
                    pref.shrines.forEach(shrine => {
                        if (data.japanShrinesOwned[shrine.key]) {
                            SHRINE_BUILD_PARTS.forEach(part => {
                                japanShrinePartsOwned[shrine.key + ":" + part.key] = true;
                            });
                        }
                    });
                });
            }
        }

        refreshDailyMissions(); // 🎯 日付が変わっていればデイリーミッションをリセット（前日分の「お財布の達人」判定も含む）

        updateMoneyDisplay();
        updateTitlesUI();
        updateDexUI();
        updateBankUI();
        updateCompanionUI(); // 🐱 相棒「招き猫」の成長状況を表示
        updateBirthdayTicketUI();
        updateShopFeverUI();
        updateTanabataUI();
        updateNatsumatsuriUI();
        updateMissionsUI();
        applyTimeTheme();
        setInterval(applyTimeTheme, 60000); // 1分ごとに時間帯を再チェック（長時間開いたままでも自動で切り替わる）
        setInterval(updateShopFeverUI, 30000); // 😲 神の気まぐれフィーバーの残り時間を定期的に更新
        setInterval(updateNatsumatsuriUI, 60000); // 🎆 夏祭り（夜・週末）の切り替わりを定期的に再チェック
        updateOtsukimiUI();
        setInterval(updateOtsukimiUI, 60000); // 🌕 お月見（夜・昼の切り替わり／月が昇る演出）を定期的に再チェック
        updateKoyoUI();
        setInterval(updateKoyoUI, 60000); // 🍁 紅葉狩り（落ち葉演出）の開催状況を定期的に再チェック
        updateOshogatsuUI();
        setInterval(updateOshogatsuUI, 60000); // 🎍 お正月（初日の出演出）の開催状況を定期的に再チェック
        updateKannazukiUI();
        setInterval(updateKannazukiUI, 60000); // 🌫️ 神無月（寂しい演出）の開催状況を定期的に再チェック
        updateShichigosanUI();
        setInterval(updateShichigosanUI, 60000); // 👘 七五三（千歳飴バナー）の開催状況を定期的に再チェック
        updateChristmasUI();
        setInterval(updateChristmasUI, 60000); // 🎄 クリスマス（昼は雪・夜はイルミネーション）の開催状況を定期的に再チェック
        updateNenmatsuUI();
        setInterval(updateNenmatsuUI, 60000); // 🎊 年末（昼は雪・夜は除夜の鐘）の開催状況を定期的に再チェック
        updateJoyaBellUI(); // 🔔 除夜の鐘の進捗表示を初期化
        updateValentineUI();
        setInterval(updateValentineUI, 60000); // 💝 バレンタイン（チョコおみくじ欄）の開催状況を定期的に再チェック
        updateSetsubunUI();
        setInterval(updateSetsubunUI, 60000); // 🫘 節分（豆まきミニゲーム対象期間）の開催状況を定期的に再チェック
        updateHaruUI();
        setInterval(updateHaruUI, 60000); // 🌱 春の芽吹き（ショップの若葉のお守り）の開催状況を定期的に再チェック
        updateHanamiUI();
        setInterval(updateHanamiUI, 60000); // 🌸 桜満開・花見（桜吹雪演出）の開催状況を定期的に再チェック
        updateKodomonohiUI();
        setInterval(updateKodomonohiUI, 60000); // 🎏 こどもの日（鯉のぼり演出）の開催状況を定期的に再チェック
        updateNagoshiUI(); // 🌾 夏越の大祓（茅の輪くぐり）の進捗表示を初期化
        updateShrineMapUI(); // 🗺️ 境内マップの進捗表示を初期化
        checkKannazukiReturn(); // ⛩️ 11月になっていれば、神無月に貯めた賽銭箱の預け入れ額を「倍返し」する
        startCountdownTimers(); // ⏳ 次の季節イベント／次のボーナスタイムまでのカウントダウンを開始
        if (typeof schedulePhantomSpawn === "function") schedulePhantomSpawn(); // 🐱🐸 幻の参拝客の出現スケジュールを開始

        // 🎊 本日が大安吉日なら表示する
        const taianBox = document.querySelector("#taian-status-box");
        if (taianBox) {
            if (taianActive) {
                taianBox.textContent = "🎊 本日は【大安吉日】！大吉運UP＆おみくじ料金半額中！";
                taianBox.classList.remove("hidden");
            } else {
                taianBox.classList.add("hidden");
            }
        }

        // 🏘️ みんなの参拝合計（神社改築コミュニティ目標）を取得
        try {
            if (window.omikujiCommunityRef && window.omikujiGetDoc) {
                const communitySnap = await window.omikujiGetDoc(window.omikujiCommunityRef);
                communityDraws = (communitySnap.exists() && typeof communitySnap.data().totalDraws === "number")
                    ? communitySnap.data().totalDraws
                    : 0;
            }
        } catch (e) {
            console.error("コミュニティ目標データの読み込みに失敗しました: ", e);
        }
        applyShrineTierVisual();

        const picked = LUCKY_ITEMS.find(i => i.key === luckyItemKey);
        if (picked && luckyBox) {
            luckyBox.classList.remove("hidden");
            if (luckyName) luckyName.textContent = picked.emoji + " " + picked.name;
            if (luckyDesc) luckyDesc.textContent = picked.desc;
        }

        checkBankruptcy();
    } catch (e) {
        console.error("ユーザーデータの読み込みに失敗しました: ", e);
    } finally {
        if (drawBtn) drawBtn.disabled = false;
        if (draw10Btn) draw10Btn.disabled = false;
    }

    const randomNumSpan = document.querySelector("#randomNumber");
    if (randomNumSpan) {
        randomNumSpan.innerHTML = "まだ引いていません (通常モード)";
    }
});
// 「結果を送信する」ボタンから呼ばれる関数
// たまった履歴（historyBuffer）をFirebaseに書き込んでからtop.htmlへ移動する
async function submitResults() {
    const submitBtn = document.querySelector("#submitBtn");
    const userName = currentUser || localStorage.getItem("logged_in_user") || "名無しの参拝者";

    if (historyBuffer.length === 0) {
        alert("🙅 まだおみくじを引いていません！\nまずはおみくじを引いてから送信してください。");
        return;
    }

    if (!window.omikujiDB || !window.omikujiAddDoc || !window.omikujiCollectionRef) {
        alert("⚠️ データベースへの接続準備ができていません。少し待ってからもう一度お試しください。");
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "送信中…";
    }

    try {
        for (const entry of historyBuffer) {
            await window.omikujiAddDoc(window.omikujiCollectionRef, {
                name: userName,
                date: entry.date,
                result: entry.result,
                prize: entry.prize,
                balance: entry.balance,
                timestamp: entry.timestamp
            });
        }

        historyBuffer = [];
        trackMissionSubmit(); // 🎯「大吉を目指せ」ミッションの進捗を更新
        await saveUserState();
        window.location.href = "top.html";
    } catch (e) {
        console.error("Firebaseへの送信に失敗しました: ", e);
        alert("❌ 結果の送信に失敗しました。通信環境をご確認の上、もう一度お試しください。");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "結果を送信する";
        }
    }
}