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
            shrineMapLevel: shrineMapLevel
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
let kiyomeShioActive = false;  // 🧂「清めの塩」の効果が本日有効か（お祓い料がさらに軽減される）
let boostTicketCount = 0;      // 🎟️「所持金1.1倍ブースト券」の所持枚数

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

// 🗺️ 境内マップ関連の状態（所持金を使って1マスずつ買い進める大型の金策先）
let shrineMapLevel = 0; // 購入済みのマス数（0〜MAP_TILES.length）。購入順は固定で、端から埋まっていく

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