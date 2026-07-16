// ============================================================
// omikuji-data.js
// 🎲 おみくじゲームの「マスターデータ」ファイル
// 景品一覧・ショップ品揃え・ドロップアイテム・称号条件など、
// ゲームバランスに関わる定数だけをまとめている。
// ロジックや画面操作はここには書かない。
// ============================================================

const omikujiImages = [
    "omikuji_daikichi.png",
    "omikuji_kichi.png",
    "omikuji_chuukichi.png",
    "omikuji_syoukichi.png",
    "omikuji_suekichi.png",
    "omikuji_kyou.png",
    "omikuji_daikyou.png",
    "omikuji_daidaikichi.jpg",
    "omikuji_kamikichi.jpg",
    "omikuji_daidaikyou.jpg"
];

// 🎋 ラッキーアイテムの一覧（毎日ログイン時に1個抽選・無料）
const LUCKY_ITEMS = [
    { key: "daikichi_up", emoji: "🍀", name: "四つ葉のクローバー", desc: "今日1日、大吉運が少しだけアップ！" },
    { key: "prize_up", emoji: "🐟", name: "立派な鯛", desc: "今日1日、獲得賞金が10%アップ！" },
    { key: "tax_half", emoji: "🐍", name: "白蛇の抜け殻", desc: "今日1日、大凶のお祓い料がさらに半額に！" },
    { key: "fever_extra", emoji: "🔔", name: "縁起の良い鈴の音", desc: "今日1日、大凶時のフィーバー回数が+1回に！" },
    { key: "zorome_up", emoji: "🌟", name: "流れ星のかけら", desc: "今日1日、ゾロ目ボーナスが+2,000円に！" }
];

// 🛍️ ショップで買える「一定回数だけ効果」のアイテム
const SHOP_ITEMS = [
    { key: "manekineko", emoji: "🐱", name: "開運招き猫", price: 10000, duration: 5, desc: "大吉確率が一時的にアップ！", minRank: 0 },
    { key: "gofu", emoji: "📜", name: "金運の護符", price: 5000, duration: 5, desc: "獲得賞金が1.1倍に！", minRank: 0 },
    { key: "suzu", emoji: "🔔", name: "破邪の鈴", price: 3000, duration: 5, desc: "大凶時の没収額が軽減される！", minRank: 0 },
    { key: "oogi", emoji: "🪭", name: "招福の扇", price: 15000, duration: 5, desc: "獲得賞金が1.15倍に！（護符より強力）", minRank: 1 },
    { key: "gohei", emoji: "🎏", name: "五色の幣", price: 25000, duration: 5, desc: "大吉確率が大きくアップ！（招き猫より強力）", minRank: 2 },
    { key: "ryujin", emoji: "🐉", name: "龍神の逆鱗", price: 50000, duration: 3, desc: "「神の試練」が確認なしで自動的に成功する！", minRank: 3 },
    { key: "amaterasu", emoji: "🌟", name: "天照の玉", price: 100000, duration: 5, desc: "大吉確率アップ＋獲得賞金1.2倍の両方が発動！", minRank: 4 },
    { key: "ikigami", emoji: "🕊️", name: "生き神の御札", price: 300000, duration: 5, desc: "大吉確率が最大級にアップ＋大凶(試練)の没収額を大幅軽減！", minRank: 5 },
    { key: "chitose_ame", emoji: "🍬", name: "千歳飴", price: 12000, duration: 5, desc: "装備中、大凶(神の試練)や大大凶で発動するフィーバーの回数が+2回に！（七五三シーズン限定販売）", minRank: 0, seasonal: "shichigosan" },
    { key: "wakaba_omamori", emoji: "🌱", name: "若葉のお守り", price: 8000, duration: 5, desc: "新生活を応援する若葉のお守り。大吉確率が少しアップ！（春の芽吹きシーズン限定販売）", minRank: 0, seasonal: "haru" }
];

// 🎒 おみくじを引くと低確率で手に入る収集アイテム（ドロップ率は独立判定）
const DROP_ITEMS = [
    { key: "koban", emoji: "🪙", name: "黄金の小判", rate: 0.02, desc: "装備中、大凶（神の試練）が確定で勝利／免除になる", minCommunityTier: 0 },
    { key: "shinboku", emoji: "🌳", name: "神社の神木", rate: 0.03, desc: "装備中、大凶（神の試練）時のフィーバー回数が+1回になる", minCommunityTier: 0 },
    { key: "ishikoro", emoji: "🪨", name: "謎の石ころ", rate: 0.10, desc: "100個で称号、500個で永久ボーナス、1000個ごとにガチャ券がもらえる", minCommunityTier: 0 },
    { key: "tanzaku", emoji: "🎏", name: "五色の短冊", rate: 0.02, desc: "装備中、大吉ボーナスが+1%になる（神社改築で本殿完成後に解放）", minCommunityTier: 4 },
    { key: "orihime_thread", emoji: "🎐", name: "織姫の五色糸", rate: 0.06, desc: "七夕（7/1〜7/7）限定ドロップ。彦星の一等星と両方揃うと特別なご縁が結ばれる", minCommunityTier: 0, seasonal: "tanabata" },
    { key: "hikoboshi_star", emoji: "🌠", name: "彦星の一等星", rate: 0.06, desc: "七夕（7/1〜7/7）限定ドロップ。織姫の五色糸と両方揃うと特別なご縁が結ばれる", minCommunityTier: 0, seasonal: "tanabata" },
    { key: "amanogawa_kirameki", emoji: "🌌", name: "天の川のきらめき", rate: 0.05, desc: "七夕（7/1〜7/7）限定ドロップ。夜空を彩る天の川の輝き", minCommunityTier: 0, seasonal: "tanabata" },
    { key: "natsumatsuri_lantern", emoji: "🏮", name: "夏祭りの提灯", rate: 0.05, desc: "夏祭り開催中（8月の夜・週末）限定ドロップ。集めるほど夏祭りが盛り上がる", minCommunityTier: 0, seasonal: "natsumatsuri" },
    { key: "kingyo", emoji: "🐠", name: "金魚すくいの金魚", rate: 0.05, desc: "夏祭り開催中（8月の夜・週末）限定ドロップ", minCommunityTier: 0, seasonal: "natsumatsuri" },
    { key: "kakigori", emoji: "🍧", name: "かき氷", rate: 0.05, desc: "夏祭り開催中（8月の夜・週末）限定ドロップ", minCommunityTier: 0, seasonal: "natsumatsuri" },
    { key: "hanabi_tama", emoji: "🎆", name: "打ち上げ花火の玉", rate: 0.04, desc: "夏祭り開催中（8月の夜・週末）限定ドロップ", minCommunityTier: 0, seasonal: "natsumatsuri" },
    { key: "tsukimi_mochi", emoji: "🐰", name: "月見うさぎの餅", rate: 0.05, desc: "お月見（9/15〜9/30）限定ドロップ。10個で称号「お月見上手」", minCommunityTier: 0, seasonal: "otsukimi" },
    { key: "susuki_hoshi", emoji: "🌾", name: "すすきの穂", rate: 0.05, desc: "お月見（9/15〜9/30）限定ドロップ。夜空に月見だんごと一緒に飾ろう", minCommunityTier: 0, seasonal: "otsukimi" },
    { key: "tsukimi_dango", emoji: "🍡", name: "月見団子", rate: 0.05, desc: "お月見（9/15〜9/30）限定ドロップ。十五夜のお供え物", minCommunityTier: 0, seasonal: "otsukimi" },
    { key: "momiji_shiori", emoji: "🍁", name: "紅葉のしおり", rate: 0.05, desc: "紅葉狩り（11月）限定ドロップ。10個で称号「紅葉狩り名人」", minCommunityTier: 0, seasonal: "koyo" },
    { key: "icho_leaf", emoji: "🍂", name: "黄金の銀杏の葉", rate: 0.05, desc: "紅葉狩り（11月）限定ドロップ。山を彩る黄金色の葉", minCommunityTier: 0, seasonal: "koyo" },
    { key: "kuri", emoji: "🌰", name: "山の恵み・栗", rate: 0.05, desc: "紅葉狩り（11月）限定ドロップ。秋の味覚の代表格", minCommunityTier: 0, seasonal: "koyo" },
    { key: "hatsuyume_fuji", emoji: "🗻", name: "初夢の富士", rate: 0.04, desc: "お正月（1/1〜1/3）限定ドロップ。鷹・茄子と揃うと縁起物コンプリート！", minCommunityTier: 0, seasonal: "oshogatsu" },
    { key: "hatsuyume_taka", emoji: "🦅", name: "初夢の鷹", rate: 0.04, desc: "お正月（1/1〜1/3）限定ドロップ。富士・茄子と揃うと縁起物コンプリート！", minCommunityTier: 0, seasonal: "oshogatsu" },
    { key: "hatsuyume_nasu", emoji: "🍆", name: "初夢の茄子", rate: 0.04, desc: "お正月（1/1〜1/3）限定ドロップ。富士・鷹と揃うと縁起物コンプリート！", minCommunityTier: 0, seasonal: "oshogatsu" },
    { key: "izumo_omamori", emoji: "⛩️", name: "出雲土産のお守り", rate: 0.05, desc: "神無月（10月）限定ドロップ。出雲に集った神様からのお土産", minCommunityTier: 0, seasonal: "kannazuki" },
    { key: "kamisama_wasuremono", emoji: "👣", name: "神様の忘れ物", rate: 0.05, desc: "神無月（10月）限定ドロップ。出雲へ向かう道すがら落としていったもの", minCommunityTier: 0, seasonal: "kannazuki" },
    { key: "kagura_suzu", emoji: "🔔", name: "神楽の鈴", rate: 0.05, desc: "神無月（10月）限定ドロップ。出雲での神議りを彩る神楽の音色", minCommunityTier: 0, seasonal: "kannazuki" },
    { key: "chitose_fukuro", emoji: "👝", name: "千歳飴の松竹梅袋", rate: 0.05, desc: "七五三（11月）限定ドロップ。縁起の良い松竹梅柄の袋", minCommunityTier: 0, seasonal: "shichigosan" },
    { key: "orizuru_negai", emoji: "🕊️", name: "願いの折り鶴", rate: 0.05, desc: "七五三（11月）限定ドロップ。健やかな成長を願って折られた鶴", minCommunityTier: 0, seasonal: "shichigosan" },
    { key: "kinchaku_omamori", emoji: "👛", name: "縁起の巾着", rate: 0.05, desc: "七五三（11月）限定ドロップ。小さな巾着に詰まった縁起物", minCommunityTier: 0, seasonal: "shichigosan" },
    { key: "christmas_ribbon", emoji: "🎀", name: "クリスマスの飾りリボン", rate: 0.05, desc: "クリスマス（12/1〜12/25）限定ドロップ。ツリーを彩る飾りリボン", minCommunityTier: 0, seasonal: "christmas" },
    { key: "seiya_candle", emoji: "🕯️", name: "聖夜のキャンドル", rate: 0.05, desc: "クリスマス（12/1〜12/25）限定ドロップ。静かに揺れる聖夜の灯", minCommunityTier: 0, seasonal: "christmas" },
    { key: "snowman_charm", emoji: "⛄", name: "小さな雪だるまのチャーム", rate: 0.05, desc: "クリスマス（12/1〜12/25）限定ドロップ。境内にちょこんと現れた雪だるま", minCommunityTier: 0, seasonal: "christmas" },
    { key: "choco_kakera", emoji: "🍫", name: "板チョコのかけら", rate: 0.05, desc: "バレンタイン（2/1〜2/14）限定ドロップ。甘い香りのする板チョコ", minCommunityTier: 0, seasonal: "valentine" },
    { key: "akai_ito", emoji: "🧵", name: "運命の赤い糸", rate: 0.05, desc: "バレンタイン（2/1〜2/14）限定ドロップ。良縁を結ぶと言われる赤い糸", minCommunityTier: 0, seasonal: "valentine" },
    { key: "love_letter", emoji: "💌", name: "秘密のラブレター", rate: 0.05, desc: "バレンタイン（2/1〜2/14）限定ドロップ。誰かの想いが込められた手紙", minCommunityTier: 0, seasonal: "valentine" },
    { key: "joya_kane_hibiki", emoji: "🔔", name: "除夜の鐘の残響", rate: 0.05, desc: "年末（12/26〜12/31）限定ドロップ。夜空に響いた鐘の音の余韻", minCommunityTier: 0, seasonal: "nenmatsu" },
    { key: "toshikoshi_soba", emoji: "🍜", name: "年越しそば", rate: 0.05, desc: "年末（12/26〜12/31）限定ドロップ。細く長く…健康長寿を願う一杯", minCommunityTier: 0, seasonal: "nenmatsu" },
    { key: "susuharai_houki", emoji: "🧹", name: "煤払いの箒", rate: 0.05, desc: "年末（12/26〜12/31）限定ドロップ。一年の汚れを払う大掃除の箒", minCommunityTier: 0, seasonal: "nenmatsu" },
    { key: "hanami_dango", emoji: "🍡", name: "お花見団子", rate: 0.05, desc: "お花見（4月）限定ドロップ。「使う」と次の1回の単発おみくじだけ大吉運が少しアップする", minCommunityTier: 0, seasonal: "hanami" },
    { key: "sakura_hanabira", emoji: "🌸", name: "桜の花びら", rate: 0.05, desc: "お花見（4月）限定ドロップ。舞い落ちてきた一片の桜の花びら", minCommunityTier: 0, seasonal: "hanami" },
    { key: "hanami_bento", emoji: "🍱", name: "お花見弁当", rate: 0.05, desc: "お花見（4月）限定ドロップ。桜の下で広げたくなる特製弁当", minCommunityTier: 0, seasonal: "hanami" },
    { key: "fuku_mame", emoji: "🫘", name: "福豆", rate: 0.05, desc: "節分（2/1〜2/3）限定ドロップ。厄除けにまいた炒り豆", minCommunityTier: 0, seasonal: "setsubun" },
    { key: "oni_no_tsuno", emoji: "👹", name: "鬼の角のかけら", rate: 0.05, desc: "節分（2/1〜2/3）限定ドロップ。退治した鬼が落としていった角のかけら", minCommunityTier: 0, seasonal: "setsubun" },
    { key: "hiiragi_iwashi", emoji: "🐟", name: "柊鰯（ひいらぎいわし）", rate: 0.05, desc: "節分（2/1〜2/3）限定ドロップ。魔除けとして戸口に飾る柊鰯", minCommunityTier: 0, seasonal: "setsubun" },
    { key: "wakaba_shinme", emoji: "🌱", name: "若葉の新芽", rate: 0.05, desc: "春の芽吹き（3月）限定ドロップ。花が咲く前にそっと顔を出した新芽", minCommunityTier: 0, seasonal: "haru" },
    { key: "haru_no_tsubomi", emoji: "🌷", name: "春の蕾（つぼみ）", rate: 0.05, desc: "春の芽吹き（3月）限定ドロップ。開花を待つ小さな蕾", minCommunityTier: 0, seasonal: "haru" },
    { key: "harukaze_no_ha", emoji: "🍃", name: "春風にそよぐ葉", rate: 0.05, desc: "春の芽吹き（3月）限定ドロップ。暖かな春風にそよぐ若い葉っぱ", minCommunityTier: 0, seasonal: "haru" },
    { key: "koinobori_uroko", emoji: "🐠", name: "鯉のぼりの鱗（うろこ）", rate: 0.05, desc: "こどもの日（5/1〜5/5）限定ドロップ。空を泳ぐ鯉のぼりから舞い落ちた鱗", minCommunityTier: 0, seasonal: "kodomonohi" },
    { key: "kabuto_kazari", emoji: "🛡️", name: "兜飾りの小柄", rate: 0.05, desc: "こどもの日（5/1〜5/5）限定ドロップ。健やかな成長を願う兜飾りの小さな部品", minCommunityTier: 0, seasonal: "kodomonohi" },
    { key: "shobu_no_ha", emoji: "🌿", name: "菖蒲の葉", rate: 0.05, desc: "こどもの日（5/1〜5/5）限定ドロップ。邪気を払うとされる菖蒲の葉", minCommunityTier: 0, seasonal: "kodomonohi" },
    { key: "chinowa_kaya", emoji: "🌾", name: "茅の輪の茅（かや）", rate: 0.05, desc: "夏越の大祓（6/25〜6/30）限定ドロップ。茅の輪をくぐった際に舞った茅（かや）の葉", minCommunityTier: 0, seasonal: "nagoshi" },
    { key: "minazuki_gashi", emoji: "🍧", name: "水無月（和菓子）", rate: 0.05, desc: "夏越の大祓（6/25〜6/30）限定ドロップ。厄除けに食べる、氷を模した和菓子「水無月」", minCommunityTier: 0, seasonal: "nagoshi" },
    { key: "oharai_no_gohei", emoji: "📿", name: "お祓いの御幣", rate: 0.05, desc: "夏越の大祓（6/25〜6/30）限定ドロップ。穢れを祓う御幣（ごへい）の切れ端", minCommunityTier: 0, seasonal: "nagoshi" }
];

// 🏺 おみくじの壺のランクアップ（永続的に大吉ボーナスが増える・所持金で購入）
const URN_LEVELS = [
    { level: 0, name: "普通の壺", cost: 0, bonus: 0 },
    { level: 1, name: "上質な壺", cost: 20000, bonus: 0.005 },
    { level: 2, name: "銀の壺", cost: 40000, bonus: 0.01 },
    { level: 3, name: "金の壺", cost: 80000, bonus: 0.015 },
    { level: 4, name: "神代の壺", cost: 150000, bonus: 0.02 },
    { level: 5, name: "伝説の壺", cost: 300000, bonus: 0.03 }
];

// 🗺️ 境内マップ（所持金を使って1マスずつ買い進め、少しずつ神社の境内図を完成させていく大型の金策先）
// 順番に購入するしかない（マップの端から埋まっていくイメージ）。金額は後半になるほど跳ね上がる
const MAP_TILES = [
    { key: "torii", emoji: "⛩️", name: "鳥居", cost: 3000, desc: "境内の入り口に立つ鳥居" },
    { key: "sandou", emoji: "🪨", name: "参道の敷石", cost: 5000, desc: "鳥居から続く石畳の参道" },
    { key: "komainu_a", emoji: "🐕", name: "狛犬（阿形）", cost: 8000, desc: "参道を守る狛犬（口を開けた阿形）" },
    { key: "komainu_b", emoji: "🐕‍🦺", name: "狛犬（吽形）", cost: 12000, desc: "参道を守る狛犬（口を閉じた吽形）" },
    { key: "chozuya", emoji: "💧", name: "手水舎", cost: 18000, desc: "参拝前に手と口を清める手水舎" },
    { key: "lantern_a", emoji: "🏮", name: "石灯籠（東）", cost: 25000, desc: "参道を照らす石灯籠" },
    { key: "lantern_b", emoji: "🏮", name: "石灯籠（西）", cost: 32000, desc: "参道を照らすもう一つの石灯籠" },
    { key: "sacred_tree", emoji: "🌳", name: "御神木", cost: 42000, desc: "境内にそびえる大きな御神木" },
    { key: "ema", emoji: "🪧", name: "絵馬掛け", cost: 55000, desc: "願いごとを書いた絵馬が並ぶ場所" },
    { key: "omikuji_stand", emoji: "🎋", name: "おみくじ結び所", cost: 70000, desc: "引いたおみくじを結ぶための場所" },
    { key: "bridge", emoji: "🌉", name: "太鼓橋", cost: 90000, desc: "境内の池にかかる小さな太鼓橋" },
    { key: "koi_pond", emoji: "🎏", name: "鯉の泳ぐ池", cost: 115000, desc: "色とりどりの鯉が泳ぐ池" },
    { key: "drum_tower", emoji: "🥁", name: "太鼓楼", cost: 145000, desc: "祭礼で太鼓が打ち鳴らされる太鼓楼" },
    { key: "miko", emoji: "👘", name: "巫女舞の舞台", cost: 180000, desc: "神楽や巫女舞が奉納される舞台" },
    { key: "stalls", emoji: "🏯", name: "縁日の屋台通り", cost: 220000, desc: "祭りの日ににぎわう屋台通り" },
    { key: "haiden", emoji: "🛕", name: "拝殿", cost: 270000, desc: "参拝者がお参りをする拝殿" },
    { key: "honden", emoji: "🏛️", name: "本殿", cost: 330000, desc: "御神体が祀られる神聖な本殿" },
    { key: "treasure_hall", emoji: "🏺", name: "宝物殿", cost: 400000, desc: "神社に伝わる宝物を収めた宝物殿" },
    { key: "starry_sky", emoji: "🌌", name: "夜空と星々", cost: 500000, desc: "境内を包む満天の星空" },
    { key: "golden_shrine", emoji: "✨", name: "黄金の御社", cost: 650000, desc: "すべてが完成した証、黄金に輝く御社" }
];

// 🗺️ 境内マップの節目（マス数）で贈られる祝儀。フルコンプリートで永続の大吉ボーナスも付与される
const MAP_MILESTONES = [
    { count: 5, prize: 15000 },
    { count: 10, prize: 40000 },
    { count: 15, prize: 90000 },
    { count: 20, prize: 300000 }
];
const SHRINE_MAP_COMPLETE_BONUS = 0.01; // 境内マップ完成後、永続的に大吉ボーナス+1%

// 🗾 全国神社巡りマップ（境内マップ完成後に解放される第2段階）
// 日本地図風のマス目（row=北→南、col=西→東のおおよその位置）に47都道府県を配置し、
// 各都道府県ごとに2〜3個の神社を用意。どの神社からでも自由な順番で購入できる（コンプリート型の金策先）
const JAPAN_PREFECTURES = [
    {
        key: "hokkaido", name: "北海道", row: 1, col: 8,
        shrines: [
            { key: "hokkaido_s1", emoji: "🦌", name: "北海道神宮", cost: 50000 },
            { key: "hokkaido_s2", emoji: "🏯", name: "北海道護國神社", cost: 80000 },
        ]
    },
    {
        key: "aomori", name: "青森県", row: 2, col: 8,
        shrines: [
            { key: "aomori_s1", emoji: "🍎", name: "岩木山神社", cost: 60000 },
            { key: "aomori_s2", emoji: "⛩️", name: "善知鳥神社", cost: 90000 },
        ]
    },
    {
        key: "iwate", name: "岩手県", row: 3, col: 9,
        shrines: [
            { key: "iwate_s1", emoji: "🐎", name: "盛岡八幡宮", cost: 60000 },
            { key: "iwate_s2", emoji: "⛩️", name: "駒形神社", cost: 95000 },
        ]
    },
    {
        key: "miyagi", name: "宮城県", row: 4, col: 9,
        shrines: [
            { key: "miyagi_s1", emoji: "🌾", name: "大崎八幡宮", cost: 70000 },
            { key: "miyagi_s2", emoji: "⛩️", name: "鹽竈神社", cost: 105000 },
        ]
    },
    {
        key: "akita", name: "秋田県", row: 3, col: 7,
        shrines: [
            { key: "akita_s1", emoji: "🐕", name: "太平山三吉神社", cost: 75000 },
            { key: "akita_s2", emoji: "⛩️", name: "秋田縣護國神社", cost: 115000 },
        ]
    },
    {
        key: "yamagata", name: "山形県", row: 4, col: 7,
        shrines: [
            { key: "yamagata_s1", emoji: "🍒", name: "出羽三山神社", cost: 80000 },
            { key: "yamagata_s2", emoji: "⛩️", name: "鳥海山大物忌神社", cost: 125000 },
        ]
    },
    {
        key: "fukushima", name: "福島県", row: 5, col: 9,
        shrines: [
            { key: "fukushima_s1", emoji: "🍑", name: "開成山大神宮", cost: 90000 },
            { key: "fukushima_s2", emoji: "⛩️", name: "馬場都々古別神社", cost: 135000 },
        ]
    },
    {
        key: "ibaraki", name: "茨城県", row: 6, col: 10,
        shrines: [
            { key: "ibaraki_s1", emoji: "⚔️", name: "鹿島神宮", cost: 100000 },
            { key: "ibaraki_s2", emoji: "⛩️", name: "笠間稲荷神社", cost: 150000 },
        ]
    },
    {
        key: "tochigi", name: "栃木県", row: 6, col: 9,
        shrines: [
            { key: "tochigi_s1", emoji: "🐒", name: "日光東照宮", cost: 105000 },
            { key: "tochigi_s2", emoji: "⛩️", name: "日光二荒山神社", cost: 165000 },
        ]
    },
    {
        key: "gunma", name: "群馬県", row: 6, col: 8,
        shrines: [
            { key: "gunma_s1", emoji: "♨️", name: "一之宮貫前神社", cost: 115000 },
            { key: "gunma_s2", emoji: "⛩️", name: "赤城神社", cost: 180000 },
        ]
    },
    {
        key: "saitama", name: "埼玉県", row: 7, col: 9,
        shrines: [
            { key: "saitama_s1", emoji: "🏯", name: "氷川神社", cost: 125000 },
            { key: "saitama_s2", emoji: "⛩️", name: "秩父神社", cost: 195000 },
        ]
    },
    {
        key: "chiba", name: "千葉県", row: 7, col: 10,
        shrines: [
            { key: "chiba_s1", emoji: "✈️", name: "香取神宮", cost: 145000 },
            { key: "chiba_s2", emoji: "⛩️", name: "玉前神社", cost: 220000 },
        ]
    },
    {
        key: "tokyo", name: "東京都", row: 8, col: 9,
        shrines: [
            { key: "tokyo_s1", emoji: "🗼", name: "明治神宮", cost: 130000 },
            { key: "tokyo_s2", emoji: "⛩️", name: "神田明神", cost: 205000 },
            { key: "tokyo_s3", emoji: "🦊", name: "東京大神宮", cost: 310000 },
        ]
    },
    {
        key: "kanagawa", name: "神奈川県", row: 9, col: 9,
        shrines: [
            { key: "kanagawa_s1", emoji: "⛵", name: "鶴岡八幡宮", cost: 145000 },
            { key: "kanagawa_s2", emoji: "⛩️", name: "寒川神社", cost: 220000 },
            { key: "kanagawa_s3", emoji: "🏔️", name: "箱根神社", cost: 340000 },
        ]
    },
    {
        key: "niigata", name: "新潟県", row: 5, col: 7,
        shrines: [
            { key: "niigata_s1", emoji: "🍶", name: "彌彦神社", cost: 180000 },
            { key: "niigata_s2", emoji: "⛩️", name: "白山神社", cost: 280000 },
        ]
    },
    {
        key: "toyama", name: "富山県", row: 6, col: 5,
        shrines: [
            { key: "toyama_s1", emoji: "🏔️", name: "高瀬神社", cost: 200000 },
            { key: "toyama_s2", emoji: "⛩️", name: "雄山神社", cost: 310000 },
        ]
    },
    {
        key: "ishikawa", name: "石川県", row: 5, col: 4,
        shrines: [
            { key: "ishikawa_s1", emoji: "🥇", name: "尾山神社", cost: 220000 },
            { key: "ishikawa_s2", emoji: "⛩️", name: "気多大社", cost: 340000 },
        ]
    },
    {
        key: "fukui", name: "福井県", row: 6, col: 4,
        shrines: [
            { key: "fukui_s1", emoji: "🦕", name: "氣比神宮", cost: 240000 },
            { key: "fukui_s2", emoji: "⛩️", name: "劔神社", cost: 370000 },
        ]
    },
    {
        key: "yamanashi", name: "山梨県", row: 7, col: 8,
        shrines: [
            { key: "yamanashi_s1", emoji: "🗻", name: "北口本宮冨士浅間神社", cost: 260000 },
            { key: "yamanashi_s2", emoji: "⛩️", name: "武田神社", cost: 400000 },
        ]
    },
    {
        key: "nagano", name: "長野県", row: 6, col: 7,
        shrines: [
            { key: "nagano_s1", emoji: "🍎", name: "諏訪大社", cost: 285000 },
            { key: "nagano_s2", emoji: "⛩️", name: "戸隠神社", cost: 440000 },
        ]
    },
    {
        key: "gifu", name: "岐阜県", row: 7, col: 6,
        shrines: [
            { key: "gifu_s1", emoji: "🦆", name: "南宮大社", cost: 310000 },
            { key: "gifu_s2", emoji: "⛩️", name: "飛騨一宮水無神社", cost: 480000 },
        ]
    },
    {
        key: "shizuoka", name: "静岡県", row: 8, col: 7,
        shrines: [
            { key: "shizuoka_s1", emoji: "🍵", name: "富士山本宮浅間大社", cost: 345000 },
            { key: "shizuoka_s2", emoji: "⛩️", name: "三嶋大社", cost: 530000 },
        ]
    },
    {
        key: "aichi", name: "愛知県", row: 8, col: 6,
        shrines: [
            { key: "aichi_s1", emoji: "⚔️", name: "熱田神宮", cost: 375000 },
            { key: "aichi_s2", emoji: "⛩️", name: "真清田神社", cost: 580000 },
        ]
    },
    {
        key: "mie", name: "三重県", row: 9, col: 6,
        shrines: [
            { key: "mie_s1", emoji: "🦞", name: "伊勢神宮（内宮）", cost: 345000 },
            { key: "mie_s2", emoji: "⛩️", name: "伊勢神宮（外宮）", cost: 540000 },
            { key: "mie_s3", emoji: "⚔️", name: "椿大神社", cost: 820000 },
        ]
    },
    {
        key: "shiga", name: "滋賀県", row: 8, col: 5,
        shrines: [
            { key: "shiga_s1", emoji: "🐒", name: "日吉大社", cost: 450000 },
            { key: "shiga_s2", emoji: "⛩️", name: "多賀大社", cost: 690000 },
        ]
    },
    {
        key: "kyoto", name: "京都府", row: 8, col: 4,
        shrines: [
            { key: "kyoto_s1", emoji: "🦊", name: "伏見稲荷大社", cost: 420000 },
            { key: "kyoto_s2", emoji: "⛩️", name: "八坂神社", cost: 650000 },
            { key: "kyoto_s3", emoji: "🐉", name: "貴船神社", cost: 990000 },
        ]
    },
    {
        key: "osaka", name: "大阪府", row: 9, col: 4,
        shrines: [
            { key: "osaka_s1", emoji: "🐙", name: "住吉大社", cost: 455000 },
            { key: "osaka_s2", emoji: "⛩️", name: "大阪天満宮", cost: 710000 },
            { key: "osaka_s3", emoji: "🌸", name: "枚岡神社", cost: 1080000 },
        ]
    },
    {
        key: "hyogo", name: "兵庫県", row: 8, col: 3,
        shrines: [
            { key: "hyogo_s1", emoji: "🐄", name: "廣田神社", cost: 590000 },
            { key: "hyogo_s2", emoji: "⛩️", name: "生田神社", cost: 910000 },
        ]
    },
    {
        key: "nara", name: "奈良県", row: 9, col: 5,
        shrines: [
            { key: "nara_s1", emoji: "🦌", name: "春日大社", cost: 540000 },
            { key: "nara_s2", emoji: "⛩️", name: "大神神社", cost: 840000 },
            { key: "nara_s3", emoji: "🌸", name: "石上神宮", cost: 1290000 },
        ]
    },
    {
        key: "wakayama", name: "和歌山県", row: 10, col: 4,
        shrines: [
            { key: "wakayama_s1", emoji: "🍊", name: "熊野本宮大社", cost: 720000 },
            { key: "wakayama_s2", emoji: "⛩️", name: "熊野速玉大社", cost: 1100000 },
        ]
    },
    {
        key: "tottori", name: "鳥取県", row: 9, col: 3,
        shrines: [
            { key: "tottori_s1", emoji: "🐫", name: "宇倍神社", cost: 780000 },
            { key: "tottori_s2", emoji: "⛩️", name: "倭文神社", cost: 1200000 },
        ]
    },
    {
        key: "shimane", name: "島根県", row: 10, col: 3,
        shrines: [
            { key: "shimane_s1", emoji: "💑", name: "出雲大社", cost: 720000 },
            { key: "shimane_s2", emoji: "⛩️", name: "須佐神社", cost: 1100000 },
            { key: "shimane_s3", emoji: "🌸", name: "美保神社", cost: 1690000 },
        ]
    },
    {
        key: "okayama", name: "岡山県", row: 9, col: 2,
        shrines: [
            { key: "okayama_s1", emoji: "🍑", name: "吉備津神社", cost: 910000 },
            { key: "okayama_s2", emoji: "⛩️", name: "石上布都魂神社", cost: 1400000 },
        ]
    },
    {
        key: "hiroshima", name: "広島県", row: 10, col: 2,
        shrines: [
            { key: "hiroshima_s1", emoji: "⛩️", name: "厳島神社", cost: 850000 },
            { key: "hiroshima_s2", emoji: "🌸", name: "饒津神社", cost: 1320000 },
            { key: "hiroshima_s3", emoji: "⚔️", name: "素盞嗚神社", cost: 2020000 },
        ]
    },
    {
        key: "yamaguchi", name: "山口県", row: 11, col: 2,
        shrines: [
            { key: "yamaguchi_s1", emoji: "🐡", name: "住吉神社", cost: 1100000 },
            { key: "yamaguchi_s2", emoji: "⛩️", name: "赤間神宮", cost: 1700000 },
        ]
    },
    {
        key: "tokushima", name: "徳島県", row: 11, col: 5,
        shrines: [
            { key: "tokushima_s1", emoji: "🌪️", name: "大麻比古神社", cost: 1200000 },
            { key: "tokushima_s2", emoji: "⛩️", name: "阿波井神社", cost: 1850000 },
        ]
    },
    {
        key: "kagawa", name: "香川県", row: 10, col: 5,
        shrines: [
            { key: "kagawa_s1", emoji: "🍜", name: "金刀比羅宮", cost: 1330000 },
            { key: "kagawa_s2", emoji: "⛩️", name: "田村神社", cost: 2050000 },
        ]
    },
    {
        key: "ehime", name: "愛媛県", row: 11, col: 4,
        shrines: [
            { key: "ehime_s1", emoji: "🍊", name: "大山祇神社", cost: 1240000 },
            { key: "ehime_s2", emoji: "⛩️", name: "伊佐爾波神社", cost: 1910000 },
            { key: "ehime_s3", emoji: "♨️", name: "石鎚神社", cost: 2920000 },
        ]
    },
    {
        key: "kochi", name: "高知県", row: 12, col: 4,
        shrines: [
            { key: "kochi_s1", emoji: "🐟", name: "土佐神社", cost: 1590000 },
            { key: "kochi_s2", emoji: "⛩️", name: "潮江天満宮", cost: 2450000 },
        ]
    },
    {
        key: "fukuoka", name: "福岡県", row: 12, col: 2,
        shrines: [
            { key: "fukuoka_s1", emoji: "📚", name: "太宰府天満宮", cost: 1460000 },
            { key: "fukuoka_s2", emoji: "⛩️", name: "宗像大社", cost: 2250000 },
            { key: "fukuoka_s3", emoji: "🌊", name: "筥崎宮", cost: 3440000 },
        ]
    },
    {
        key: "saga", name: "佐賀県", row: 13, col: 1,
        shrines: [
            { key: "saga_s1", emoji: "🏺", name: "佐嘉神社", cost: 1880000 },
            { key: "saga_s2", emoji: "⛩️", name: "祐徳稲荷神社", cost: 2900000 },
        ]
    },
    {
        key: "nagasaki", name: "長崎県", row: 14, col: 1,
        shrines: [
            { key: "nagasaki_s1", emoji: "🐳", name: "諏訪神社", cost: 2080000 },
            { key: "nagasaki_s2", emoji: "⛩️", name: "亀山八幡宮", cost: 3200000 },
        ]
    },
    {
        key: "kumamoto", name: "熊本県", row: 13, col: 2,
        shrines: [
            { key: "kumamoto_s1", emoji: "🌋", name: "阿蘇神社", cost: 1930000 },
            { key: "kumamoto_s2", emoji: "⛩️", name: "藤崎八旛宮", cost: 2980000 },
            { key: "kumamoto_s3", emoji: "⚔️", name: "加藤神社", cost: 4550000 },
        ]
    },
    {
        key: "oita", name: "大分県", row: 12, col: 3,
        shrines: [
            { key: "oita_s1", emoji: "♨️", name: "宇佐神宮", cost: 2470000 },
            { key: "oita_s2", emoji: "⛩️", name: "柞原八幡宮", cost: 3800000 },
        ]
    },
    {
        key: "miyazaki", name: "宮崎県", row: 14, col: 3,
        shrines: [
            { key: "miyazaki_s1", emoji: "🐉", name: "高千穂神社", cost: 2730000 },
            { key: "miyazaki_s2", emoji: "⛩️", name: "宮崎神宮", cost: 4200000 },
        ]
    },
    {
        key: "kagoshima", name: "鹿児島県", row: 15, col: 2,
        shrines: [
            { key: "kagoshima_s1", emoji: "🌋", name: "鹿児島神宮", cost: 2500000 },
            { key: "kagoshima_s2", emoji: "⛩️", name: "霧島神宮", cost: 3870000 },
            { key: "kagoshima_s3", emoji: "⚔️", name: "照國神社", cost: 5920000 },
        ]
    },
    {
        key: "okinawa", name: "沖縄県", row: 17, col: 1,
        shrines: [
            { key: "okinawa_s1", emoji: "🌺", name: "波上宮", cost: 3250000 },
            { key: "okinawa_s2", emoji: "⛩️", name: "首里観音堂", cost: 5000000 },
        ]
    },
];

// 🗾 全国神社巡りマップの全神社数（106社）を数えるためのヘルパー
const JAPAN_SHRINE_COUNT = JAPAN_PREFECTURES.reduce((sum, p) => sum + p.shrines.length, 0);

// 🗾 全国神社巡りマップの節目（コンプリートした神社の数）で贈られる祝儀
const MAP_JAPAN_MILESTONES = [
    { count: 25, prize: 300000 },
    { count: 50, prize: 900000 },
    { count: 75, prize: 2200000 },
    { count: JAPAN_SHRINE_COUNT, prize: 8000000 }
];
const SHRINE_MAP_JAPAN_COMPLETE_BONUS = 0.02; // 全国制覇後、さらに永続的に大吉ボーナス+2%（境内マップ分と合算で+3%）

// 🔨 神社を少しずつ組み立てていくための共通パーツ（全国どの神社にも同じ4パーツを使い回し、神社ごとの金額を配分する）
const SHRINE_BUILD_PARTS = [
    { key: "torii", emoji: "⛩️", name: "鳥居", weight: 0.15 },
    { key: "sando", emoji: "🪨", name: "参道", weight: 0.15 },
    { key: "chozuya", emoji: "💧", name: "手水舎", weight: 0.2 },
    { key: "haiden", emoji: "🛕", name: "社殿", weight: 0.5 }
];

// 📖 図鑑（これまでに引いた結果を記録するコレクション。7種類すべて達成で永続ボーナス）
const DEX_ENTRIES = [
    { key: "daidaikichi", emoji: "☀️", name: "大大吉", match: r => r === "大大吉" },
    { key: "daikichi", emoji: "🎉", name: "大吉", match: r => r === "大吉" },
    { key: "kamikichi", emoji: "😊", name: "神吉", match: r => r === "神吉" },
    { key: "kichi", emoji: "✨", name: "吉", match: r => r === "吉" },
    { key: "chuukichi", emoji: "🎵", name: "中吉", match: r => r === "中吉" },
    { key: "syoukichi", emoji: "👍", name: "小吉", match: r => r === "小吉" },
    { key: "suekichi", emoji: "😄", name: "末吉", match: r => r === "末吉" },
    { key: "kyou", emoji: "😢", name: "凶", match: r => r === "凶" },
    { key: "daikyou", emoji: "⚔️", name: "大凶(神の試練)", match: r => r.startsWith("神の試練") || r === "大凶" },
    { key: "daidaikyou", emoji: "💀", name: "大大凶", match: r => r === "大大凶" }
];

// ☀️😊💀 超激レア枠（大大吉・神吉・大大凶）の設定
const DAIDAIKICHI_PRIZE = 500000;
const KAMIKICHI_PRIZE = 777777; // 大大吉を超える全枠中最高額
const KAMIKICHI_BONUS_PER_DRAW = 0.005; // 神吉を引くたびに永久に積み重なる大吉ボーナス
const DAIDAIKICHI_THRESHOLD_NORMAL = 0.9995;   // 上位0.05%
const DAIDAIKICHI_THRESHOLD_USHIMITSU = 0.995; // 丑三つ時は上位0.5%に跳ね上がる
const DAIDAIKYOU_THRESHOLD_NORMAL = 0.0005;    // 下位0.05%
const DAIDAIKYOU_THRESHOLD_USHIMITSU = 0.005;  // 丑三つ時は下位0.5%に跳ね上がる
const KAMIKICHI_THRESHOLD = 0.99995; // 上位0.005%（大大吉よりもさらに珍しい特別枠）

// 🏘️ 神社改築（コミュニティ目標）の段階（全ユーザー合計の参拝回数で判定）
const COMMUNITY_TIERS = [
    { tier: 0, threshold: 0, name: "いつもの境内" },
    { tier: 1, threshold: 1000, name: "少し賑わう境内（金色の輝き）" },
    { tier: 2, threshold: 5000, name: "大改築された境内（🎊福だるま登場！）" },
    { tier: 3, threshold: 20000, name: "大鳥居建立（10連おみくじが1,000円割引）" },
    { tier: 4, threshold: 100000, name: "本殿完成（新しい収集アイテム「五色の短冊」解放）" },
    { tier: 5, threshold: 500000, name: "全国的に有名な神社に（福だるまの発生率アップ）" },
    { tier: 6, threshold: 1000000, name: "国宝指定（称号「初代宮司」を全員に付与）" }
];

// 🎊 神社改築レベル2で解放される「福だるま」ボーナス枠（レベル5でさらに発生率アップ）
const FUKU_DARUMA_RATE_NORMAL = 0.05;
const FUKU_DARUMA_RATE_BOOSTED = 0.08; // 神社改築ティア5(50万回)以降
const FUKU_DARUMA_PRIZE = 3000;

// 🏯 神社改築ティア3(2万回)以降、10連おみくじが割引になる金額
const SHRINE_TIER3_DISCOUNT = 1000;

// ⛩️ 参拝ランク（累計獲得賞金額で判定。ランクが上がるとショップの品揃えが増える）
const VISITOR_RANKS = [
    { tier: 0, name: "平参拝者", threshold: 0 },
    { tier: 1, name: "常連客", threshold: 50000 },
    { tier: 2, name: "氏子", threshold: 300000 },
    { tier: 3, name: "神の寵愛者", threshold: 1500000 },
    { tier: 4, name: "神社の重鎮", threshold: 5000000 },
    { tier: 5, name: "生き神様", threshold: 20000000 }
];

// 🎊 隠し要素（イースターエッグ）関連の設定
const STRAIGHT_BONUS_PRIZE = 8000;
const KIMAGURE_BONUS_PRIZE = 10000;
const KIMAGURE_TIMES = ["01:01", "03:33", "04:44", "05:55", "11:11", "12:12", "22:22", "23:23"];
const LUCKY_MONEY_PATTERNS = [777, 7777, 77777, 777777, 888, 8888, 88888, 888888, 1234, 12345, 123456, 111111, 222222, 333333, 555555, 999999];
// 🎖️ 称号（達成条件を満たすと自動的に付与される。プレイヤーの各種累計値で判定）
const TITLES = [
    { key: "hyakuman", emoji: "💰", name: "百万長者", desc: "累計収支+1,000,000円を達成", condition: s => s.totalProfit >= 1000000 },
    { key: "juman", emoji: "💴", name: "実は儲かってる人", desc: "累計収支+100,000円を達成", condition: s => s.totalProfit >= 100000 },
    { key: "daikichi_hunter", emoji: "🎯", name: "大吉ハンター", desc: "大吉を合計10回引いた", condition: s => s.totalDaikichi >= 10 },
    { key: "daikichi_master", emoji: "🏹", name: "大吉マスター", desc: "大吉を合計30回引いた", condition: s => s.totalDaikichi >= 30 },
    { key: "veteran", emoji: "⛩️", name: "生き字引", desc: "累計参拝回数500回を達成", condition: s => s.totalDraws >= 500 },
    { key: "regular", emoji: "🙏", name: "常連参拝者", desc: "累計参拝回数100回を達成", condition: s => s.totalDraws >= 100 },
    { key: "first_visit", emoji: "🔰", name: "初参拝", desc: "はじめての参拝を達成", condition: s => s.totalDraws >= 1 },
    { key: "urn_master", emoji: "🏺", name: "壺のマイスター", desc: "おみくじの壺を最大までランクアップ", condition: s => s.urnLevel >= URN_LEVELS.length - 1 },
    { key: "stone_collector", emoji: "🪨", name: "石ころコレクター", desc: "謎の石ころを100個集めた", condition: s => (s.ownedItems && s.ownedItems.ishikoro || 0) >= 100 },
    { key: "sages_stone", emoji: "🪨✨", name: "賢者の石の使い手", desc: "謎の石ころを500個集め「賢者の石」に変化させた", condition: s => s.ishikoro500Claimed === true },
    { key: "dex_complete", emoji: "📖", name: "図鑑コンプリート", desc: "大吉〜大凶(神の試練)まで全種類を達成", condition: s => s.dexRewardClaimed === true },
    { key: "daidaikichi_title", emoji: "☀️", name: "天啓を受けし者", desc: "「大大吉」を引いた", condition: s => s.gotDaidaikichi === true },
    { key: "kamikichi_title", emoji: "😊", name: "神様に微笑まれし者", desc: "「神吉」を引いた", condition: s => s.gotKamikichi === true },
    { key: "daidaikyou_title", emoji: "💀", name: "丑三つ時の生還者", desc: "「大大凶」を乗り越えた", condition: s => s.gotDaidaikyou === true },
    { key: "ushimitsu_title", emoji: "🌙", name: "丑三つ時の参拝者", desc: "深夜2時〜4時の「丑三つ時」に参拝した", condition: s => s.gotUshimitsuDraw === true },
    { key: "founding_priest", emoji: "⛩️👑", name: "初代宮司", desc: "神社改築が「国宝指定」まで到達した（全員に付与）", condition: s => s.communityDraws >= 1000000 },
    { key: "tanabata_matchmaker", emoji: "🌌", name: "星々を結ぶ者", desc: "織姫と彦星を引き合わせた", condition: s => (s.orihimeHikoboshiMeetCount || 0) >= 1 },
    { key: "tanabata_matchmaker_5", emoji: "🌌✨", name: "星々の守り人", desc: "織姫と彦星の再会を5年連続で見届けた", condition: s => (s.orihimeHikoboshiMeetCount || 0) >= 5 },
    { key: "matsuri_regular", emoji: "🏮", name: "夏祭りの常連", desc: "夏祭りの提灯を10個集めた", condition: s => (s.ownedItems && s.ownedItems.natsumatsuri_lantern || 0) >= 10 },
    { key: "matsuri_master", emoji: "🎇", name: "夏祭りマスター", desc: "夏祭りの限定アイテムを合計20個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.natsumatsuri_lantern || 0) + (oi.kingyo || 0) + (oi.kakigori || 0) + (oi.hanabi_tama || 0)) >= 20;
    } },
    { key: "tsukimi_lover", emoji: "🌕", name: "お月見上手", desc: "月見うさぎの餅を10個集めた", condition: s => (s.ownedItems && s.ownedItems.tsukimi_mochi || 0) >= 10 },
    { key: "otsukimi_master", emoji: "🌕✨", name: "名月の智者", desc: "お月見の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.tsukimi_mochi || 0) + (oi.susuki_hoshi || 0) + (oi.tsukimi_dango || 0)) >= 15;
    } },
    { key: "koyo_master", emoji: "🍁", name: "紅葉狩り名人", desc: "紅葉のしおりを10個集めた", condition: s => (s.ownedItems && s.ownedItems.momiji_shiori || 0) >= 10 },
    { key: "koyo_grandmaster", emoji: "🍁✨", name: "錦秋の匠", desc: "紅葉狩りの限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.momiji_shiori || 0) + (oi.icho_leaf || 0) + (oi.kuri || 0)) >= 15;
    } },
    { key: "hatsuyume_complete", emoji: "🗻", name: "一富士二鷹三茄子", desc: "初夢の縁起物（富士・鷹・茄子）を揃えた", condition: s => s.hatsuyumeComplete === true },
    { key: "steady_visitor", emoji: "💼", name: "堅実な参拝者", desc: "デイリーミッション「お財布の達人」を達成（破産せずに1日を終えた）", condition: s => s.steadyVisitorEarned === true },
    { key: "kannazuki_faithful", emoji: "🌫️⛩️", name: "神無月の信心", desc: "神無月に賽銭を貯め、神様の「倍返し」を受け取った", condition: s => !!s.kannazukiRewardedYear },
    { key: "christmas_santa", emoji: "🎅✨", name: "サンタの相棒", desc: "クリスマスに「サンタの袋」を5回開けた", condition: s => (s.santaBagCount || 0) >= 5 },
    { key: "valentine_matchmaker", emoji: "💝", name: "縁結びの達人", desc: "チョコおみくじを5回引いた", condition: s => (s.chocoDrawCount || 0) >= 5 },
    { key: "tanabata_stargazer", emoji: "🌌", name: "星降る夜の参拝者", desc: "七夕の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.orihime_thread || 0) + (oi.hikoboshi_star || 0) + (oi.amanogawa_kirameki || 0)) >= 15;
    } },
    { key: "kannazuki_collector", emoji: "⛩️👣", name: "出雲詣での証", desc: "神無月の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.izumo_omamori || 0) + (oi.kamisama_wasuremono || 0) + (oi.kagura_suzu || 0)) >= 15;
    } },
    { key: "shichigosan_collector", emoji: "👘✨", name: "健やかな成長の証", desc: "七五三の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.chitose_fukuro || 0) + (oi.orizuru_negai || 0) + (oi.kinchaku_omamori || 0)) >= 15;
    } },
    { key: "christmas_collector", emoji: "🎄✨", name: "聖夜の飾り師", desc: "クリスマスの限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.christmas_ribbon || 0) + (oi.seiya_candle || 0) + (oi.snowman_charm || 0)) >= 15;
    } },
    { key: "valentine_collector", emoji: "💝🍫", name: "恋心の収集家", desc: "バレンタインの限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.choco_kakera || 0) + (oi.akai_ito || 0) + (oi.love_letter || 0)) >= 15;
    } },
    { key: "nenmatsu_collector", emoji: "🎊🧹", name: "一年の締めくくり", desc: "年末の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.joya_kane_hibiki || 0) + (oi.toshikoshi_soba || 0) + (oi.susuharai_houki || 0)) >= 15;
    } },
    { key: "joya_kane_title", emoji: "🔔✨", name: "百八の煩悩祓い", desc: "除夜の鐘を108回ついた", condition: s => !!s.joyaBellCompleteYear },
    { key: "hanami_lover", emoji: "🍡🌸", name: "花見団子の達人", desc: "お花見団子を累計10個手に入れた", condition: s => (s.hanamiDangoTotalCollected || 0) >= 10 },
    { key: "hanami_collector", emoji: "🌸✨", name: "花吹雪の詠み人", desc: "お花見の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.hanami_dango || 0) + (oi.sakura_hanabira || 0) + (oi.hanami_bento || 0)) >= 15;
    } },
    { key: "setsubun_oni", emoji: "🫘👹", name: "鬼退治の達人", desc: "節分の豆まきで5回、厄払いに成功した", condition: s => (s.mamemakiSuccessCount || 0) >= 5 },
    { key: "setsubun_collector", emoji: "🫘✨", name: "福は内の使者", desc: "節分の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.fuku_mame || 0) + (oi.oni_no_tsuno || 0) + (oi.hiiragi_iwashi || 0)) >= 15;
    } },
    { key: "haru_collector", emoji: "🌱✨", name: "新生活の芽吹き", desc: "春の芽吹きの限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.wakaba_shinme || 0) + (oi.haru_no_tsubomi || 0) + (oi.harukaze_no_ha || 0)) >= 15;
    } },
    { key: "kodomonohi_koi", emoji: "🎏", name: "登り龍の証", desc: "こどもの日に「大大吉」以上を引いた", condition: s => s.gotKodomonohiExtreme === true },
    { key: "kodomonohi_collector", emoji: "🎏✨", name: "空を泳ぐ鯉の友", desc: "こどもの日の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.koinobori_uroko || 0) + (oi.kabuto_kazari || 0) + (oi.shobu_no_ha || 0)) >= 15;
    } },
    { key: "nagoshi_purified", emoji: "⛩️🌾", name: "茅の輪をくぐりし者", desc: "夏越の大祓で半年間の厄を祓い清めた", condition: s => !!s.nagoshiLastResetYear },
    { key: "nagoshi_collector", emoji: "🌾✨", name: "夏越の清め手", desc: "夏越の大祓の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.chinowa_kaya || 0) + (oi.minazuki_gashi || 0) + (oi.oharai_no_gohei || 0)) >= 15;
    } },
    { key: "shrine_map_halfway", emoji: "🗺️", name: "境内図の道半ば", desc: "境内マップを半分（10マス）まで埋めた", condition: s => (s.shrineMapLevel || 0) >= 10 },
    { key: "shrine_map_complete", emoji: "🗺️✨", name: "境内マップ完成", desc: "境内マップをすべて（20マス）埋め、神社を完成させた", condition: s => (s.shrineMapLevel || 0) >= MAP_TILES.length },
    { key: "japan_map_quarter", emoji: "🗾", name: "神社巡りの旅人", desc: "全国神社巡りマップで25社を参拝した", condition: s => (s.japanShrineOwnedCount || 0) >= 25 },
    { key: "japan_map_half", emoji: "🗾✨", name: "神社巡りの達人", desc: "全国神社巡りマップで50社を参拝した", condition: s => (s.japanShrineOwnedCount || 0) >= 50 },
    { key: "japan_pref_master", emoji: "🎏", name: "都道府県制覇の証", desc: "全国神社巡りマップで20都道府県をコンプリートした", condition: s => (s.japanPrefCompleteCount || 0) >= 20 },
    { key: "shrine_builder", emoji: "🔨", name: "宮大工の心得", desc: "全国神社巡りマップで神社のパーツを100個組み立てた", condition: s => (s.japanShrinePartsOwnedCount || 0) >= 100 },
    { key: "japan_map_complete", emoji: "🗾👑", name: "日本全国制覇", desc: "全国のすべての神社（" + JAPAN_SHRINE_COUNT + "社）を参拝し終えた", condition: s => (s.japanShrineOwnedCount || 0) >= JAPAN_SHRINE_COUNT }
];

// 🎂 誕生日ボーナス（ログイン画面で任意設定。誕生日当日のログインで「大大吉確定チケット」を1枚獲得）
// チケットは次の単発おみくじ1回で確定的に「大大吉」を発動させる（10連おみくじには使えない）

// 😲 神の気まぐれフィーバー（ログイン時2%抽選。当選すると1時間だけショップの全アイテムが半額になる）
const KIMAGURE_FEVER_CHANCE = 0.02;
const KIMAGURE_FEVER_DURATION_MS = 60 * 60 * 1000; // 1時間

// 🎋 七夕（7月1日〜7日限定）：「短冊に願いを書く」ボタン。1日1回、30%の確率で当日限定の金運アップ効果
// 七夕当日(7/7)は織姫と彦星が天の川で逢う特別な日として、願いが必ず叶う
const TANABATA_MONTH = 7;
const TANABATA_START_DAY = 1;
const TANABATA_END_DAY = 7;
const TANABATA_DAY = 7; // 七夕当日
const TANABATA_SUCCESS_RATE = 0.3;
const TANABATA_DAY_SUCCESS_RATE = 1.0; // 七夕当日は確定で願いが叶う
const TANABATA_DAIKICHI_BONUS = 0.03; // 短冊の願いが叶った日は大吉運+3%
const ORIHIME_HIKOBOSHI_MEETING_PRIZE = 30000; // 織姫の糸＋彦星の星が揃った時（初回）のご祝儀
const ORIHIME_HIKOBOSHI_REUNION_PRIZE = 15000; // 2年目以降の再会イベントのご祝儀

// 🎆 夏祭り（8月限定）：夜と週末だけ本格的なお祭り演出＆ドロップ率アップ。それ以外の8月は「夏っぽい」軽い演出だけになる
const NATSUMATSURI_MONTH = 8;
const NATSUMATSURI_DROP_MULTIPLIER = 1.5;
const NATSUMATSURI_NIGHT_START_HOUR = 17; // 17時〜翌5時を「夜」とみなす
const NATSUMATSURI_NIGHT_END_HOUR = 5;

// 🗻🦅🍆 お正月（1/1〜1/3）：初夢の縁起物「一富士二鷹三茄子」が3つ揃った時のご褒美
const HATSUYUME_COMPLETE_PRIZE = 50000;

// 🌫️ 神無月（10月）：期間中に賽銭箱へ預けた金額は、11月に神様が戻った時「倍返し」される
const KANNAZUKI_MONTH = 10;

// 👘 七五三（11月）：ショップ限定アイテム「千歳飴」装備中はフィーバー回数が+2回になる
const CHITOSE_AME_FEVER_BONUS = 2;

// 🎅 クリスマス（12/1〜12/25）：低確率で「サンタの袋」が現れ、開けると所持金が大きく増える
const SANTA_BAG_RATE = 0.04;
const SANTA_BAG_MIN_PRIZE = 3000;
const SANTA_BAG_MAX_PRIZE = 30000;

// 🔔 年末（12/26〜12/31）：「除夜の鐘」を108回つくと煩悩祓いのご褒美がもらえる
const JOYA_BELL_TARGET = 108;
const JOYA_BELL_COMPLETE_PRIZE = 10800;

// 🫘 節分（2/1〜2/3）：大凶（神の試練）のお祓い料を「豆まき」ミニゲームで軽減・無効化できる
const SETSUBUN_MAMEMAKI_SUCCESS_RATE = 0.5; // 豆まき成功（完全無効化）の確率。失敗しても半額になる
const SETSUBUN_MULTI_EXEMPTION_BONUS = 0.15; // 10連おみくじ中は個別のミニゲームができないため、免除率を底上げする

// 🌱 春の芽吹き（3月）：ショップの新アイテム「若葉のお守り」に関する設定はSHOP_ITEMSを参照

// 🍡 桜満開・花見（4月）：「お花見団子」を使うと、次の1回の単発おみくじだけ大吉運がアップする
const HANAMI_DANGO_BONUS = 0.02;

// 🎏 こどもの日（5/1〜5/5）：昇り龍にあやかり、大大吉以上ランクの出現率がアップ（各しきい値を少し引き下げる）
const KODOMONOHI_DAIDAIKICHI_REDUCTION = 0.0015;
const KODOMONOHI_KAMIKICHI_REDUCTION = 0.00015;

// 🌾 夏越の大祓（6/25〜6/30）：半年間の「凶」「大凶」を「茅の輪くぐり」で清算できる
const NAGOSHI_PRIZE_PER_BAD = 300;
const NAGOSHI_PRIZE_CAP = 50000;

// 💝 バレンタイン（2/1〜2/14）：「チョコおみくじ」を1日1回引くと、運勢＋ペア運勢がもらえる（ハズレなしの縁結びイベント）
const CHOCO_PAIR_TYPES = [
    { emoji: "🔥", label: "情熱タイプ" },
    { emoji: "🌊", label: "癒し系タイプ" },
    { emoji: "🍀", label: "堅実タイプ" },
    { emoji: "🌪️", label: "自由奔放タイプ" },
    { emoji: "🌙", label: "ミステリアスタイプ" },
    { emoji: "☀️", label: "太陽のような明るいタイプ" },
    { emoji: "📚", label: "知的タイプ" },
    { emoji: "🎨", label: "芸術家タイプ" }
];
const CHOCO_TIERS = [
    { min: 0.97, name: "運命の大吉", prize: 10000 },
    { min: 0.85, name: "大吉", prize: 3000 },
    { min: 0.6, name: "吉", prize: 1000 },
    { min: 0.3, name: "中吉", prize: 300 },
    { min: 0, name: "小吉", prize: 100 }
];