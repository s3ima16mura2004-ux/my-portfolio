// ============================================================
// omikuji-state.js
// 💾 ゲームの「状態（プレイヤーデータ）」を保持するファイル
// 所持金・フィーバー状態・所有アイテムなど、セッション中に
// 変化する値と、その読み書き・Firestore保存に関する
// 小さなヘルパー関数だけをまとめている。
// ============================================================

let kimagureLastTrigger = ""; // 同じ分に何度も発生しないようにするための記録（セッション内のみ・保存はしない）

let currentUser = null;      // ログイン中のユーザー名
let currentMoney = 10000;    // Firestoreから読み込むまでの仮の初期値
let feverCount = 0;          // フィーバータイム（大吉確率UP）の残り回数
let feverTier = 1;           // フィーバーの強さ（1=通常10倍, 2=大大凶後の20倍）
let prayDate = "";           // 最後にお祈りボーナスを使った日
let prayCount = 0;           // その日にお祈りした回数
let luckyItemKey = "";       // 今日のラッキーアイテムのキー

let ownedItems = {
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
}; // 収集アイテムの所持数
let equippedCollectible = ""; // 装備中の収集アイテム（"koban" / "shinboku" / ""）
let shopItemKey = "";         // 現在発動中のショップアイテムのキー
let shopItemRemaining = 0;    // ショップアイテムの残り効果回数

let totalDraws = 0;       // 累計参拝（おみくじを引いた）回数
let totalDaikichi = 0;    // 累計「大吉」獲得回数
let totalProfit = 0;      // 累計収支（参加料込みの実質損益）
let totalWinnings = 0;    // 累計獲得賞金額（プラスの当選金のみの合計。参拝ランク判定に使用）
let urnLevel = 0;         // おみくじの壺のランクアップ段階
let kamikichiBonus = 0;   // 神吉を引くたびに永久に積み重なる大吉ボーナス（神様との契約）
let companionExp = 0;     // 🐱 相棒「招き猫」の成長値。ショップの効果アイテムを購入するたびに+1される
let ownedFriends = { shirohebi: false, kitsune: false }; // 🐍🦊 賽銭箱の資金で迎えた相棒たちの所持状況

let taianActive = false;  // 本日が「大安吉日」かどうか（ログイン時に個人ごとに抽選済み）
let bankMoney = 0;        // 賽銭箱（貯金）の残高。おみくじには使えないが大凶等のリスクからは守られる
let dexAchieved = { daidaikichi: false, daikichi: false, kamikichi: false, kichi: false, chuukichi: false, syoukichi: false, suekichi: false, kyou: false, daikyou: false, daidaikyou: false }; // 図鑑の達成状況
let dexRewardClaimed = false; // 図鑑コンプリート報酬をすでに受け取ったか
let communityDraws = 0;   // 全ユーザー合計の参拝回数（神社改築コミュニティ目標）

let gotDaidaikichi = false; // 「大大吉」を引いたことがあるか（称号判定用）
let gotKamikichi = false;   // 「神吉」を引いたことがあるか
let gotDaidaikyou = false;  // 「大大凶」を引いたことがあるか
let gotUshimitsuDraw = false; // 丑三つ時に参拝したことがあるか

let ishikoro500Claimed = false; // 石ころ500個の永続ボーナス(壺+1%)を受け取ったか
let gachaTickets = 0;           // 石ころ1000個ごとにもらえるガチャ券の枚数

// 「結果を送信する」ボタンを押すまでの間、おみくじ結果を貯めておく配列
let historyBuffer = [];

// 指定したキーの本日のラッキーアイテム効果が有効かどうか
function hasEffect(key) {
    return luckyItemKey === key;
}

// 指定したキーのショップアイテムが現在発動中かどうか
function hasShopEffect(key) {
    return shopItemKey === key && shopItemRemaining > 0;
}

// 🐱 現在の相棒（招き猫）の成長段階のインデックスを、companionExpから求める
function getCompanionLevelIndex() {
    let index = 0;
    for (let i = 0; i < COMPANION_LEVELS.length; i++) {
        if (companionExp >= COMPANION_LEVELS[i].threshold) index = i;
    }
    return index;
}

function todayStr() {
    return new Date().toLocaleDateString("ja-JP");
}

// 日付が変わっていたら、お祈り回数をリセットする
function refreshPrayDay() {
    const today = todayStr();
    if (prayDate !== today) {
        prayDate = today;
        prayCount = 0;
    }
}

// 所持金・フィーバー回数・お祈り回数・アイテム状態をFirestoreに保存する（ユーザーごとのデータ永続化）
async function saveUserState() {
    if (!currentUser || !window.omikujiDB || !window.omikujiDoc || !window.omikujiUpdateDoc) return;
    try {
        await window.omikujiUpdateDoc(window.omikujiDoc(window.omikujiDB, "users", currentUser), {
            money: currentMoney,
            feverCount: feverCount,
            feverTier: feverTier,
            prayDate: prayDate,
            prayCount: prayCount,
            ownedItems: ownedItems,
            equippedCollectible: equippedCollectible,
            shopItemKey: shopItemKey,
            shopItemRemaining: shopItemRemaining,
            totalDraws: totalDraws,
            totalDaikichi: totalDaikichi,
            totalProfit: totalProfit,
            totalWinnings: totalWinnings,
            urnLevel: urnLevel,
            companionExp: companionExp,
            ownedFriends: ownedFriends,
            bankMoney: bankMoney,
            dexAchieved: dexAchieved,
            dexRewardClaimed: dexRewardClaimed,
            gotDaidaikichi: gotDaidaikichi,
            gotKamikichi: gotKamikichi,
            gotDaidaikyou: gotDaidaikyou,
            gotUshimitsuDraw: gotUshimitsuDraw,
            kamikichiBonus: kamikichiBonus,
            ishikoro500Claimed: ishikoro500Claimed,
            gachaTickets: gachaTickets,
            birthdayTicket: birthdayTicket,
            kimagureFeverUntil: kimagureFeverUntil,
            tanabataWishDate: tanabataWishDate,
            tanabataLuckDate: tanabataLuckDate,
            orihimeHikoboshiMeetCount: orihimeHikoboshiMeetCount,
            orihimeHikoboshiLastMetYear: orihimeHikoboshiLastMetYear,
            hatsuyumeComplete: hatsuyumeComplete,
            missionDate: missionDate,
            missionKeysToday: missionKeysToday,
            missionProgress: missionProgress,
            missionClaimed: missionClaimed,
            missionDrawsToday: missionDrawsToday,
            wentBankruptToday: wentBankruptToday,
            steadyVisitorEarned: steadyVisitorEarned,
            kiyomeShioActive: kiyomeShioActive,
            boostTicketCount: boostTicketCount,
            kannazukiDeposits: kannazukiDeposits,
            kannazukiRewardedYear: kannazukiRewardedYear,
            santaBagCount: santaBagCount,
            chocoDrawDate: chocoDrawDate,
            chocoDrawCount: chocoDrawCount,
            joyaBellDate: joyaBellDate,
            joyaBellCount: joyaBellCount,
            joyaBellCompleteYear: joyaBellCompleteYear,
            hanamiDangoActive: hanamiDangoActive,
            hanamiDangoTotalCollected: hanamiDangoTotalCollected,
            gotKodomonohiExtreme: gotKodomonohiExtreme,
            mamemakiSuccessCount: mamemakiSuccessCount,
            nagoshiBadCount: nagoshiBadCount,
            nagoshiLastResetYear: nagoshiLastResetYear,
            shrineMapLevel: shrineMapLevel,
            japanShrinePartsOwned: japanShrinePartsOwned,
            japanOkumiyaPartsOwned: japanOkumiyaPartsOwned,
            ownedPowerSpots: ownedPowerSpots,
            powerSpotMapRevealed: powerSpotMapRevealed,
            ownedMiniThemeSpots: ownedMiniThemeSpots,
            miniThemeMapRevealed: miniThemeMapRevealed,
            ownedWorldSpots: ownedWorldSpots,
            worldSpotMapRevealed: worldSpotMapRevealed,
            mapPath6Choice: mapPath6Choice,
            historyMapRevealed: historyMapRevealed,
            ownedHistorySpots: ownedHistorySpots,
            builderModeRevealed: builderModeRevealed,
            builderLevel: builderLevel,
            comboYear: comboYear,
            comboItemsGotThisYear: comboItemsGotThisYear,
            comboLastClaimedYear: comboLastClaimedYear,
            comboCompletedYears: comboCompletedYears,
            kimodameshiDate: kimodameshiDate,
            kimodameshiCount: kimodameshiCount,
            gotHalloweenRareYokai: gotHalloweenRareYokai,
            seasonalActionDates: seasonalActionDates,
            seasonalActionCounts: seasonalActionCounts,
            natsumatsuriRewardClaimedYear: natsumatsuriRewardClaimedYear,
            yearlyAlbum: yearlyAlbum,
            tutorialMissionProgress: tutorialMissionProgress,
            tutorialMissionClaimed: tutorialMissionClaimed,
            equippedTitleKey: equippedTitleKey,
            equippedTitleEmoji: equippedTitleEmoji,
            equippedTitleName: equippedTitleName,
            friends: friends,
            friendRequestsIncoming: friendRequestsIncoming,
            friendRequestsOutgoing: friendRequestsOutgoing,
            sendMoneyDate: sendMoneyDate,
            sendMoneyCountToday: sendMoneyCountToday
        });
    } catch (e) {
        console.error("ユーザーデータの保存に失敗しました: ", e);
    }
}

// 1回分の結果を履歴バッファに追加する関数
function recordHistory(resultName, prizeMoney, balanceAfter) {
    historyBuffer.push({
        date: new Date().toLocaleDateString("ja-JP"),
        result: resultName,
        prize: prizeMoney,
        balance: balanceAfter,
        timestamp: new Date()
    });
}

// 🎂 誕生日ボーナス関連の状態
let birthdayTicket = false;    // 「大大吉確定チケット」を持っているか（次の単発おみくじで消費）

// 😲 神の気まぐれフィーバー（ショップ全品半額）の終了時刻（ミリ秒のタイムスタンプ。0=発動していない）
let kimagureFeverUntil = 0;

// 🎋 七夕「短冊に願いを書く」関連の状態
let tanabataWishDate = "";  // 最後に短冊を書いた日付（1日1回制限用）
let tanabataLuckDate = "";  // 願いが叶い、金運アップ効果が有効になっている日付

// 🎐🌠 織姫と彦星の再会イベント関連の状態（毎年七夕シーズンに再挑戦できる）
let orihimeHikoboshiMeetCount = 0;     // これまでに再会を果たした回数（称号判定にも使用）
let orihimeHikoboshiLastMetYear = 0;   // 最後に再会した西暦年（同じ年に何度も発生しないようにする）

// 🗻🦅🍆 お正月「初夢の縁起物（一富士二鷹三茄子）」が揃ったことがあるか（一生に一度きりのイベント）
let hatsuyumeComplete = false;

// 🎯 デイリーミッション関連の状態
let missionDate = "";          // ミッションが最後にリセットされた日付（日付が変わったら全ミッションをリセット）
let missionKeysToday = [];     // 本日ローテーションで選ばれたミッションのキー一覧（ランダム5個）
let missionProgress = {};      // 各ミッションの進捗（key: 進捗値）
let missionClaimed = {};       // 各ミッションの報酬を受け取り済みかどうか（key: true/false）
let missionDrawsToday = 0;     // 本日おみくじを引いた回数（「朝の参拝」「連打の極み」の進捗計算に使用）
let wentBankruptToday = false; // 本日ゲームオーバー（破産）になったことがあるか（「お財布の達人」判定用）
let steadyVisitorEarned = false; // 称号「堅実な参拝者」を獲得済みか

// 🎖️ 装備中の称号（名前の横に表示する1つだけを選んで表示する仕組み）
// キーだけでなく絵文字・称号名も一緒に保存しておくことで、top.html側でも
// （古い簡易版のTITLES一覧を持たなくても）表示だけはそのまま行えるようにしている
let equippedTitleKey = "";
let equippedTitleEmoji = "";
let equippedTitleName = "";
let kiyomeShioActive = false;  // 🧂「清めの塩」の効果が本日有効か（お祓い料がさらに軽減される）
let boostTicketCount = 0;      // 🎟️「所持金1.1倍ブースト券」の所持枚数

// 🔰 はじめてガイド（一度きりのチュートリアルミッション）関連の状態。デイリーミッションとは別に、日付が変わってもリセットされない
let tutorialMissionProgress = {};
let tutorialMissionClaimed = {};

// 👥 フレンド機能関連の状態
let friends = {};                  // 承認済みのフレンド一覧（{ "相手の名前": true, ... }）
let friendRequestsIncoming = {};   // 自分宛に届いている申請（{ "申請してきた人の名前": true, ... }）
let friendRequestsOutgoing = {};   // 自分が送った申請（{ "申請した相手の名前": true, ... }）
let sendMoneyDate = "";            // 最後に送金した日付（1日の回数制限用）
let sendMoneyCountToday = 0;       // 本日すでに送金した回数
let currentChatFriend = "";        // 現在チャット画面を開いているフレンドの名前（""なら未オープン。セッション内のみで保存はしない）
let chatUnsubscribe = null;        // 現在のチャットのリアルタイム購読解除関数（セッション内のみ）

// 🌫️ 神無月（10月）関連の状態
let kannazukiDeposits = 0;      // 神無月期間中に賽銭箱へ預けた金額の累計（11月に倍返しされる）
let kannazukiRewardedYear = 0;  // 最後に「倍返し」を受け取った西暦年（同じ年に何度も発生しないようにする）

// 🎅 クリスマス（12/1〜12/25）関連の状態
let santaBagCount = 0;   // これまでに開けた「サンタの袋」の回数（称号判定にも使用）

// 💝 バレンタイン（2/1〜2/14）関連の状態
let chocoDrawDate = "";  // 最後にチョコおみくじを引いた日付（1日1回制限用）
let chocoDrawCount = 0;  // これまでにチョコおみくじを引いた回数（称号判定にも使用）

// 🔔 年末（12/26〜12/31）「除夜の鐘をつく」関連の状態
let joyaBellDate = "";        // 最後に鐘をついた日付（日付が変わったら回数をリセット）
let joyaBellCount = 0;        // 本日ついた鐘の回数（108でカンスト）
let joyaBellCompleteYear = 0; // 108回つき終えた西暦年（同じ年に何度もご褒美が出ないようにする）

// 🍡 桜満開・花見（4月）関連の状態
let hanamiDangoActive = false;       // お花見団子を使用済みで、次の1回の単発おみくじに効果が乗る予約状態か
let hanamiDangoTotalCollected = 0;   // これまでに手に入れたお花見団子の累計数（称号判定用。使っても減らない）

// 🎏 こどもの日（5/1〜5/5）関連の状態
let gotKodomonohiExtreme = false; // こどもの日期間中に「大大吉」以上を引いたことがあるか（称号判定用）

// 🫘 節分（2/1〜2/3）関連の状態
let mamemakiSuccessCount = 0; // 豆まきミニゲームで厄払い（お祓い料の完全無効化）に成功した回数

// 🌾 夏越の大祓（6/25〜6/30）関連の状態
let nagoshiBadCount = 0;      // 前回の茅の輪くぐり以降に引いた「凶」「大凶」系の回数
let nagoshiLastResetYear = 0; // 最後に茅の輪くぐりで清算した西暦年

// 👻 ハロウィン（10/25〜10/31）「肝試し」関連の状態
let kimodameshiDate = "";        // 最後に肝試しに出かけた日付（1日1回制限用）
let kimodameshiCount = 0;        // これまでに肝試しに出かけた回数（称号判定用）
let gotHalloweenRareYokai = false; // 肝試しで最高レア「化け狐の大盤振る舞い」に出会ったことがあるか（称号判定用）

// 🎐 季節イベント共通「1日1回ミニアクション」（お月見・紅葉狩り・七五三・クリスマス・春の芽吹き・お花見・こどもの日）の状態
// キーはSEASONAL_DAILY_ACTIONSのevent.keyに対応（例："otsukimi": "2026/9/20"）
let seasonalActionDates = {};  // 各イベントで最後に実行した日付
let seasonalActionCounts = {}; // 各イベントでこれまでに実行した回数（称号判定用）

// 🎆 夏祭り（8月）限定コミュニティ目標「みんなで花火玉を集めよう」関連の状態
let communityNatsumatsuriCount = 0;    // 全ユーザー合計の花火玉個数（セッション内のキャッシュ。Firestoreの共有ドキュメントが正）
let communityNatsumatsuriGoalYear = 0; // 目標が達成された西暦年（0=まだ未達成。セッション内のキャッシュ）
let natsumatsuriRewardClaimedYear = 0; // このユーザーが目標達成ボーナスを受け取った西暦年（同じ年に何度も受け取れないようにする）

// 📖 年間アルバム：年が変わるたびに、その年の実績スナップショットを自動的に記録する（{year, comboCompleted, totalDraws, totalDaikichi, moneyAtEnd, bankMoneyAtEnd}の配列）
let yearlyAlbum = [];

// 🗺️ 境内マップ関連の状態（所持金を使って1マスずつ買い進める大型の金策先）
let shrineMapLevel = 0; // 購入済みのマス数（0〜MAP_TILES.length）。購入順は固定で、端から埋まっていく

// 🗾 全国神社巡りマップ関連の状態（境内マップ完成後に解放される第2段階。どの神社からでも自由な順番で参拝できる）
let japanShrinePartsOwned = {}; // 組み立て済みの神社パーツ（{ "神社key:パーツkey": true, ... }）。全パーツ揃うとその神社が完成する
let japanOkumiyaPartsOwned = {}; // 🏯 第二弾「奥宮・摂社」の組み立て済みパーツ（構造はjapanShrinePartsOwnedと同じ）
let ownedPowerSpots = {}; // 🌄 第三弾「パワースポット編」で訪れた（購入した）スポット（{ "スポットkey": true, ... }）
let powerSpotMapRevealed = false; // 🌄 「パワースポット編へ進む」ボタンを押して第三弾を解放済みかどうか
let ownedMiniThemeSpots = {}; // 🎏 第四弾「日本三大○○」ミニマップ集で訪れた（購入した）スポット
let miniThemeMapRevealed = false; // 🎏 「日本三大○○へ進む」ボタンを押して第四弾を解放済みかどうか
let ownedWorldSpots = {}; // 🌍 第五弾「世界の絶景・名所編」で訪れた（購入した）スポット
let worldSpotMapRevealed = false; // 🌍 「世界の絶景・名所へ進む」ボタンを押して第五弾を解放済みかどうか
let selectedJapanPrefKey = ""; // 現在マップ上で選択中の都道府県（表示用。セッション内のみで保存はしない）
let selectedPowerSpotPrefKey = ""; // 🌄 パワースポット編で選択中の都道府県（表示用。セッション内のみで保存はしない）

// 🔀 第六弾：世界の絶景・名所編完成後に分岐する「歴史編」／「神社ビルダーモード」関連の状態
let mapPath6Choice = "";        // 最初にどちらを選んだか（"history" / "builder" / ""）。記録用で、選んでいなくても両方後から解放されうる
let historyMapRevealed = false; // 🏯 歴史編が解放（表示）されているかどうか
let ownedHistorySpots = {};     // 🏯 歴史編で訪れた（購入した）史跡（{ "スポットkey": true, ... }）
let selectedHistoryEraKey = ""; // 🏯 歴史編で選択中の時代（表示用。セッション内のみで保存はしない）
let builderModeRevealed = false; // 🏗️ 神社ビルダーモードが解放（表示）されているかどうか
let builderLevel = 0;            // 🏗️ 神社ビルダーモードで完成させたパーツ数（0〜BUILDER_PARTS.length）

// 🎐 年間コンボ（季節イベントの代表アイテムを1年で集めきる）関連の状態
let comboYear = 0;              // 集計対象の西暦年（年が変わったら自動的にリセットされる）
let comboItemsGotThisYear = {}; // 今年すでに入手済みの代表アイテム（{ "アイテムkey": true, ... }）
let comboLastClaimedYear = 0;   // 最後に年間コンボのご褒美を受け取った西暦年（同じ年に何度も受け取れないようにする）
let comboCompletedYears = 0;    // これまでに年間コンボを達成した通算回数（称号判定用）

// 😲 神の気まぐれフィーバーが現在有効かどうか
function isShopFeverActive() {
    return kimagureFeverUntil > 0 && Date.now() < kimagureFeverUntil;
}

// 🎋 本日、七夕の願いが叶っているかどうか
function isTanabataLuckActive() {
    return tanabataLuckDate === todayStr();
}

// 🎋 今日が七夕期間（7/1〜7/7）かどうか（マスターデータはomikuji-seasonal.jsで管理）
function isTanabataActive() {
    return isSeasonalEventActive("tanabata");
}

// 🎋 今日が七夕当日（7/7・織姫と彦星が逢う日）かどうか
function isTanabataDay() {
    const now = new Date();
    return (now.getMonth() + 1) === TANABATA_MONTH && now.getDate() === TANABATA_DAY;
}

// 🎆 夏祭りが本格的に開催中かどうか（8月の夜、または8月の週末）
function isNatsumatsuriFestivalActive() {
    return isSeasonalEventActive("natsumatsuri");
}

// 🌻 8月だが夏祭りは開催していない時間帯（軽い「夏っぽい」演出だけ表示する）
function isSummerThemeActive() {
    return (new Date().getMonth() + 1) === NATSUMATSURI_MONTH && !isNatsumatsuriFestivalActive();
}

// 🌕 お月見（9/15〜9/30）期間中かどうか
function isOtsukimiActive() {
    return isSeasonalEventActive("otsukimi");
}

// 🍁 紅葉狩り（11月）期間中かどうか
function isKoyoActive() {
    return isSeasonalEventActive("koyo");
}

// 🎍 お正月（1/1〜1/3）期間中かどうか
function isOshogatsuActive() {
    return isSeasonalEventActive("oshogatsu");
}

// 🫘 節分（2/1〜2/3）期間中かどうか
function isSetsubunActive() {
    return isSeasonalEventActive("setsubun");
}

// 🌱 春の芽吹き（3月）期間中かどうか
function isHaruActive() {
    return isSeasonalEventActive("haru");
}

// 🌸 桜満開・花見（4月）期間中かどうか
function isHanamiActive() {
    return isSeasonalEventActive("hanami");
}

// 🎏 こどもの日（5/1〜5/5）期間中かどうか
function isKodomonohiActive() {
    return isSeasonalEventActive("kodomonohi");
}

// 🌾 夏越の大祓（6/25〜6/30）期間中かどうか
function isNagoshiActive() {
    return isSeasonalEventActive("nagoshi");
}

// 🌾 引いた結果が「凶」「大凶」系（お祓い料が発生した、または凶だった）なら、夏越の大祓カウントに加算する
function trackNagoshiBadLuck(resultName, prizeMoney) {
    if (resultName === "凶" || prizeMoney < 0) {
        nagoshiBadCount++;
    }
}

// 🗺️ 境内マップをすべて埋め終えたかどうか
function isShrineMapComplete() {
    return shrineMapLevel >= MAP_TILES.length;
}

// 🔨 神社の1パーツ分の金額を計算する（神社の総額をSHRINE_BUILD_PARTSの重みで配分し、キリの良い数字に丸める）
function getShrinePartCost(shrine, part) {
    const raw = shrine.cost * part.weight;
    let rounded;
    if (raw < 50000) rounded = Math.round(raw / 1000) * 1000;
    else if (raw < 500000) rounded = Math.round(raw / 5000) * 5000;
    else rounded = Math.round(raw / 10000) * 10000;
    return Math.max(1000, rounded);
}

// 🔨 指定した神社の指定パーツが組み立て済みかどうか
function isJapanShrinePartOwned(shrine, part) {
    return !!japanShrinePartsOwned[shrine.key + ":" + part.key];
}

// 🔨 指定した神社で組み立て済みのパーツ数
function getJapanShrinePartsOwnedCount(shrine) {
    return SHRINE_BUILD_PARTS.filter(part => isJapanShrinePartOwned(shrine, part)).length;
}

// ⛩️ 指定した神社のパーツがすべて揃い、完成しているかどうか
function isJapanShrineComplete(shrine) {
    return SHRINE_BUILD_PARTS.every(part => isJapanShrinePartOwned(shrine, part));
}

// 🔨 これまでに組み立てたパーツの総数（全国すべての神社をまたいだ累計。称号判定に使用）
function getJapanShrinePartsTotalOwnedCount() {
    return Object.keys(japanShrinePartsOwned).filter(k => japanShrinePartsOwned[k]).length;
}

// 🗾 参拝済み（完成済み）の神社の総数（コンプリート状況の表示・称号判定に使用）
function getJapanShrineOwnedCount() {
    let count = 0;
    JAPAN_PREFECTURES.forEach(pref => {
        pref.shrines.forEach(shrine => { if (isJapanShrineComplete(shrine)) count++; });
    });
    return count;
}

// 🗾 指定した都道府県の神社をすべて完成済みかどうか
function isJapanPrefectureComplete(pref) {
    return pref.shrines.every(isJapanShrineComplete);
}

// 🗾 コンプリート（神社をすべて完成）した都道府県の数
function getJapanPrefectureCompleteCount() {
    return JAPAN_PREFECTURES.filter(isJapanPrefectureComplete).length;
}

// 🗾 全国神社巡りマップをすべて埋め終えたかどうか（全都道府県の全神社を完成済み）
function isShrineMapJapanComplete() {
    return getJapanShrineOwnedCount() >= JAPAN_SHRINE_COUNT;
}

// 🏯 奥宮の1パーツ分の金額を計算する（神社の総額×1.5倍をOKUMIYA_BUILD_PARTSの重みで配分し、キリの良い数字に丸める）
function getOkumiyaPartCost(shrine, part) {
    const raw = shrine.cost * OKUMIYA_COST_MULTIPLIER * part.weight;
    let rounded;
    if (raw < 50000) rounded = Math.round(raw / 1000) * 1000;
    else if (raw < 500000) rounded = Math.round(raw / 5000) * 5000;
    else rounded = Math.round(raw / 10000) * 10000;
    return Math.max(1000, rounded);
}

// 🏯 指定した神社の指定した奥宮パーツが組み立て済みかどうか
function isOkumiyaPartOwned(shrine, part) {
    return !!japanOkumiyaPartsOwned[shrine.key + ":" + part.key];
}

// 🏯 指定した神社で組み立て済みの奥宮パーツ数
function getOkumiyaPartsOwnedCount(shrine) {
    return OKUMIYA_BUILD_PARTS.filter(part => isOkumiyaPartOwned(shrine, part)).length;
}

// 🏯 指定した神社の奥宮が完成しているかどうか（元の神社自体が完成していることが前提条件）
function isOkumiyaComplete(shrine) {
    return isJapanShrineComplete(shrine) && OKUMIYA_BUILD_PARTS.every(part => isOkumiyaPartOwned(shrine, part));
}

// 🏯 これまでに組み立てた奥宮パーツの総数（全国すべての神社をまたいだ累計。称号判定に使用）
function getOkumiyaPartsTotalOwnedCount() {
    return Object.keys(japanOkumiyaPartsOwned).filter(k => japanOkumiyaPartsOwned[k]).length;
}

// 🏯 奥宮が完成済みの神社の総数（コンプリート状況の表示・称号判定に使用）
function getOkumiyaCompleteCount() {
    let count = 0;
    JAPAN_PREFECTURES.forEach(pref => {
        pref.shrines.forEach(shrine => { if (isOkumiyaComplete(shrine)) count++; });
    });
    return count;
}

// 🏯 全国すべての神社の奥宮を完成させ終えたかどうか
function isShrineMapOkumiyaComplete() {
    return getOkumiyaCompleteCount() >= JAPAN_SHRINE_COUNT;
}

// 🌄 パワースポット編（全国神社巡り完成後に解放される第三弾）が解放されているかどうか
// 🌄 パワースポット編（第三弾）に進むための条件を満たしているか（全国神社巡り＋奥宮の両方が完成）
function isPowerSpotMapEligible() {
    return isShrineMapJapanComplete() && isShrineMapOkumiyaComplete();
}

// 🌄 パワースポット編がすでに解放（プレイヤーが「進む」ボタンを押して表示）されているかどうか
function isPowerSpotMapUnlocked() {
    return powerSpotMapRevealed;
}

// 🌄 指定したパワースポットを訪れた（購入した）かどうか
function isPowerSpotOwned(spot) {
    return !!ownedPowerSpots[spot.key];
}

// 🌄 訪れたパワースポットの総数（コンプリート状況の表示・称号判定に使用）
function getPowerSpotOwnedCount() {
    return Object.keys(ownedPowerSpots).filter(k => ownedPowerSpots[k]).length;
}

// 🌄 指定した都道府県のパワースポットをすべて訪れ済みかどうか
function isPowerSpotPrefectureComplete(pref) {
    return pref.spots.every(isPowerSpotOwned);
}

// 🌄 コンプリート（パワースポットをすべて訪問）した都道府県の数
function getPowerSpotPrefectureCompleteCount() {
    return POWER_SPOT_PREFECTURES.filter(isPowerSpotPrefectureComplete).length;
}

// 🌄 全国すべてのパワースポットを訪れ終えたかどうか
function isShrineMapPowerSpotComplete() {
    return getPowerSpotOwnedCount() >= POWER_SPOT_COUNT;
}

// 🎏 「日本三大○○」ミニマップ集（第四弾）に進むための条件を満たしているか（パワースポット編が完成）
function isMiniThemeMapEligible() {
    return isShrineMapPowerSpotComplete();
}

// 🎏 「日本三大○○」ミニマップ集がすでに解放（プレイヤーが「進む」ボタンを押して表示）されているかどうか
function isMiniThemeMapUnlocked() {
    return miniThemeMapRevealed;
}

// 🎏 指定したミニテーマのスポットを訪れた（購入した）かどうか
function isMiniThemeSpotOwned(spot) {
    return !!ownedMiniThemeSpots[spot.key];
}

// 🎏 訪れたミニテーマのスポットの総数（コンプリート状況の表示・称号判定に使用）
function getMiniThemeOwnedCount() {
    return Object.keys(ownedMiniThemeSpots).filter(k => ownedMiniThemeSpots[k]).length;
}

// 🎏 指定したミニテーマ（例：日本三大稲荷）のスポットをすべて訪れ済みかどうか
function isMiniThemeComplete(theme) {
    return theme.spots.every(isMiniThemeSpotOwned);
}

// 🎏 コンプリートしたミニテーマの数
function getMiniThemeCompleteCount() {
    return MINI_THEME_COLLECTIONS.filter(isMiniThemeComplete).length;
}

// 🎏 「日本三大○○」ミニマップ集を全制覇し終えたかどうか
function isShrineMapMiniThemeComplete() {
    return getMiniThemeOwnedCount() >= MINI_THEME_SPOT_COUNT;
}

// 🌍 世界の絶景・名所編（第五弾）に進むための条件を満たしているか（日本三大○○が完成）
function isWorldSpotMapEligible() {
    return isShrineMapMiniThemeComplete();
}

// 🌍 世界の絶景・名所編がすでに解放（プレイヤーが「進む」ボタンを押して表示）されているかどうか
function isWorldSpotMapUnlocked() {
    return worldSpotMapRevealed;
}

// 🌍 指定した世界のスポットを訪れた（購入した）かどうか
function isWorldSpotOwned(spot) {
    return !!ownedWorldSpots[spot.key];
}

// 🌍 訪れた世界のスポットの総数（コンプリート状況の表示・称号判定に使用）
function getWorldSpotOwnedCount() {
    return Object.keys(ownedWorldSpots).filter(k => ownedWorldSpots[k]).length;
}

// 🌍 指定した地域のスポットをすべて訪れ済みかどうか
function isWorldSpotRegionComplete(region) {
    return region.spots.every(isWorldSpotOwned);
}

// 🌍 コンプリートした地域の数
function getWorldSpotRegionCompleteCount() {
    return WORLD_SPOT_REGIONS.filter(isWorldSpotRegionComplete).length;
}

// 🌍 世界の絶景・名所編を全制覇し終えたかどうか
function isShrineMapWorldSpotComplete() {
    return getWorldSpotOwnedCount() >= WORLD_SPOT_COUNT;
}

// ============================================================
// 🔀 第六弾：世界の絶景・名所編完成後に分岐する「歴史編」／「神社ビルダーモード」
// ============================================================

// 🔀 分岐の選択画面を表示すべきかどうか（第五弾完成済み・まだどちらも解放していない）
function isMapPath6ChoicePending() {
    return isShrineMapWorldSpotComplete() && !historyMapRevealed && !builderModeRevealed;
}

// 🏯 歴史編がすでに解放されているかどうか
function isHistoryMapUnlocked() {
    return historyMapRevealed;
}

// 🏯 指定した史跡を訪れた（購入した）かどうか
function isHistorySpotOwned(spot) {
    return !!ownedHistorySpots[spot.key];
}

// 🏯 訪れた史跡の総数
function getHistoryOwnedCount() {
    return Object.keys(ownedHistorySpots).filter(k => ownedHistorySpots[k]).length;
}

// 🏯 指定した時代の史跡をすべて訪れ済みかどうか
function isHistoryEraComplete(era) {
    return era.spots.every(isHistorySpotOwned);
}

// 🏯 コンプリートした時代の数
function getHistoryEraCompleteCount() {
    return HISTORY_ERAS.filter(isHistoryEraComplete).length;
}

// 🏯 歴史編を全制覇し終えたかどうか
function isHistoryMapComplete() {
    return getHistoryOwnedCount() >= HISTORY_SPOT_COUNT;
}

// 🏗️ 神社ビルダーモードがすでに解放されているかどうか
function isBuilderModeUnlocked() {
    return builderModeRevealed;
}

// 🏗️ 神社ビルダーモードを全制覇し終えたかどうか
function isBuilderModeComplete() {
    return builderLevel >= BUILDER_PARTS.length;
}

// ============================================================
// 🎐 年間コンボ（季節イベントの代表アイテムを1年ですべて集めきる）
// ============================================================

// 🎐 年が変わっていたら、今年の集計をリセットする（あわせて、去年分の実績を年間アルバムにスナップショットとして残す）
function checkYearlyComboReset() {
    const y = new Date().getFullYear();
    if (comboYear !== y) {
        if (comboYear > 0) {
            yearlyAlbum.push({
                year: comboYear,
                comboCompleted: comboLastClaimedYear === comboYear,
                totalDraws: totalDraws,
                totalDaikichi: totalDaikichi,
                moneyAtEnd: currentMoney,
                bankMoneyAtEnd: bankMoney
            });
            if (typeof updateYearlyAlbumUI === "function") updateYearlyAlbumUI();
        }
        comboYear = y;
        comboItemsGotThisYear = {};
    }
}

// 🎐 今年、代表アイテムをすべて入手済みかどうか
function isYearlyComboComplete() {
    return YEARLY_COMBO_ITEMS.every(c => comboItemsGotThisYear[c.itemKey]);
}

// 🎐 年間コンボが達成されていて、かつ今年まだご褒美を受け取っていなければ、ご褒美を授与する
// （所持金反映・履歴記録まで行う。戻り値は授与した金額、対象外なら0）
function checkYearlyComboComplete() {
    checkYearlyComboReset();
    if (comboLastClaimedYear === comboYear) return 0;
    if (!isYearlyComboComplete()) return 0;

    comboLastClaimedYear = comboYear;
    comboCompletedYears++;

    currentMoney += YEARLY_COMBO_PRIZE;
    totalWinnings += YEARLY_COMBO_PRIZE;
    updateMoneyDisplay();
    recordHistory("🎐年間コンボ達成ボーナス", YEARLY_COMBO_PRIZE, currentMoney);

    return YEARLY_COMBO_PRIZE;
}