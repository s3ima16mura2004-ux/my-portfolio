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
        await loadUserState();

        refreshDailyMissions(); // 🎯 日付が変わっていればデイリーミッションをリセット（前日分の「お財布の達人」判定も含む）

        updateMoneyDisplay();
        updateTitlesUI();
        updateFriendsUI(); // 👥 フレンド機能の表示を初期化
        setInterval(refreshFriendsFromServer, 30000); // 👥 他ユーザーからの申請・承認を定期的に反映
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
        checkNatsumatsuriCommunityReward();
        setInterval(checkNatsumatsuriCommunityReward, 60000); // 🎆 夏祭りコミュニティ目標（みんなで花火玉を集めよう）の状況を定期的に再チェック
        updateOtsukimiUI();
        setInterval(updateOtsukimiUI, 60000); // 🌕 お月見（夜・昼の切り替わり／月が昇る演出）を定期的に再チェック
        updateKoyoUI();
        setInterval(updateKoyoUI, 60000); // 🍁 紅葉狩り（落ち葉演出）の開催状況を定期的に再チェック
        updateOshogatsuUI();
        setInterval(updateOshogatsuUI, 60000); // 🎍 お正月（初日の出演出）の開催状況を定期的に再チェック
        updateKannazukiUI();
        setInterval(updateKannazukiUI, 60000); // 🌫️ 神無月（寂しい演出）の開催状況を定期的に再チェック
        updateHalloweenUI();
        setInterval(updateHalloweenUI, 60000); // 👻 ハロウィン（妖怪祭り・肝試し欄）の開催状況を定期的に再チェック
        updateSeasonalActionsUI();
        setInterval(updateSeasonalActionsUI, 60000); // 🎐 季節イベント共通ミニアクション（お月見・紅葉狩り等）の開催状況を定期的に再チェック
        updateSeasonalGachaUI();
        setInterval(updateSeasonalGachaUI, 60000); // 🎰 季節限定ガチャの開催状況・アイテム所持数を定期的に再チェック
        updateSeasonBadgeRow();
        setInterval(updateSeasonBadgeRow, 60000); // 🎐 サイドバーの季節バッジ行を定期的に再チェック
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
        updateYearlyComboUI(); // 🎐 年間コンボの進捗表示を初期化
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