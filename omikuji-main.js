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
                orihime_thread: 0, hikoboshi_star: 0,
                natsumatsuri_lantern: 0, kingyo: 0, kakigori: 0, hanabi_tama: 0,
                tsukimi_mochi: 0, susuki_hoshi: 0, tsukimi_dango: 0,
                momiji_shiori: 0, icho_leaf: 0, kuri: 0,
                hatsuyume_fuji: 0, hatsuyume_taka: 0, hatsuyume_nasu: 0
            }, data.ownedItems || {});
            equippedCollectible = data.equippedCollectible || "";
            shopItemKey = data.shopItemKey || "";
            shopItemRemaining = typeof data.shopItemRemaining === "number" ? data.shopItemRemaining : 0;
            totalDraws = typeof data.totalDraws === "number" ? data.totalDraws : 0;
            totalDaikichi = typeof data.totalDaikichi === "number" ? data.totalDaikichi : 0;
            totalProfit = typeof data.totalProfit === "number" ? data.totalProfit : 0;
            totalWinnings = typeof data.totalWinnings === "number" ? data.totalWinnings : 0;
            urnLevel = typeof data.urnLevel === "number" ? data.urnLevel : 0;

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
        }

        refreshDailyMissions(); // 🎯 日付が変わっていればデイリーミッションをリセット（前日分の「お財布の達人」判定も含む）

        updateMoneyDisplay();
        updateTitlesUI();
        updateDexUI();
        updateBankUI();
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
