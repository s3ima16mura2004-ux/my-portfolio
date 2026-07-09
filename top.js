import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDKvro8iNDBPKVlTEXVp5A8r-OyEJoRgZk",
    authDomain: "omikujisite.firebaseapp.com",
    projectId: "omikujisite",
    storageBucket: "omikujisite.firebasestorage.app",
    messagingSenderId: "213364923898",
    appId: "1:213364923898:web:b8a0a55eef1491bde15843",
    measurementId: "G-BKVJTZKJBQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🎋 ラッキーアイテムの一覧（index.htmlと同じ内容。表示用に名前・説明のみ使用）
const LUCKY_ITEMS = [
    { key: "daikichi_up", emoji: "🍀", name: "四つ葉のクローバー", desc: "今日1日、大吉運が少しだけアップ！" },
    { key: "prize_up", emoji: "🐟", name: "立派な鯛", desc: "今日1日、獲得賞金が10%アップ！" },
    { key: "tax_half", emoji: "🐍", name: "白蛇の抜け殻", desc: "今日1日、大凶のお祓い料がさらに半額に！" },
    { key: "fever_extra", emoji: "🔔", name: "縁起の良い鈴の音", desc: "今日1日、大凶時のフィーバー回数が+1回に！" },
    { key: "zorome_up", emoji: "🌟", name: "流れ星のかけら", desc: "今日1日、ゾロ目ボーナスが+2,000円に！" }
];

const username = localStorage.getItem("logged_in_user");

const userDisplay = document.querySelector("#user-display");
const moneyDisplay = document.querySelector("#money-display");
const luckyBox = document.querySelector("#lucky-item-box");
const luckyName = document.querySelector("#lucky-item-name");
const luckyDesc = document.querySelector("#lucky-item-desc");
const tbody = document.querySelector("#history-table tbody");

async function loadUserInfo() {
    if (userDisplay) userDisplay.textContent = username;

    try {
        const snap = await getDoc(doc(db, "users", username));

        if (snap.exists()) {
            const data = snap.data();
            const money = typeof data.money === "number" ? data.money : 0;
            if (moneyDisplay) moneyDisplay.textContent = money.toLocaleString();

            const picked = LUCKY_ITEMS.find(i => i.key === data.luckyItem);
            if (picked && luckyBox) {
                luckyBox.classList.remove("hidden");
                if (luckyName) luckyName.textContent = picked.emoji + " " + picked.name;
                if (luckyDesc) luckyDesc.textContent = picked.desc;
            }
        } else {
            if (moneyDisplay) moneyDisplay.textContent = "0";
        }
    } catch (e) {
        console.error("ユーザーデータの読み込みに失敗しました: ", e);
        if (moneyDisplay) moneyDisplay.textContent = "―";
    }
}

async function loadHistory() {
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="4">読み込み中…</td></tr>`;

    try {
        // 自分の履歴だけを新しい順に取得
        const q = query(
            collection(db, "history"),
            where("name", "==", username),
            orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="4">まだ履歴がありません</td></tr>`;
            return;
        }

        // 一旦テキストを組み立ててから一括で反映（描画の都度innerHTML+=を避ける）
        let rowsHtml = "";

        snapshot.forEach(docSnap => {
            const data = docSnap.data();

            const dateText = data.date ?? "―";
            const resultText = data.result ?? "―";
            const prizeNum = typeof data.prize === "number" ? data.prize : 0;
            const balanceNum = typeof data.balance === "number" ? data.balance : 0;

            const prizeText = (prizeNum >= 0 ? "+" : "") + prizeNum.toLocaleString() + "円";
            const balanceText = balanceNum.toLocaleString() + "円";

            rowsHtml += `
                <tr>
                    <td>${escapeHtml(dateText)}</td>
                    <td>${escapeHtml(resultText)}</td>
                    <td>${escapeHtml(prizeText)}</td>
                    <td>${escapeHtml(balanceText)}</td>
                </tr>
            `;
        });

        tbody.innerHTML = rowsHtml;
    } catch (e) {
        console.error("履歴の読み込みに失敗しました: ", e);
        // 複合クエリ（where + orderBy）にはFirestoreの複合インデックス作成が必要な場合があります。
        // コンソールのエラーに表示されるリンクをクリックして作成してください。
        tbody.innerHTML = `<tr><td colspan="4">履歴の読み込みに失敗しました</td></tr>`;
    }
}

// XSS対策として簡易エスケープ（Firestoreに保存された文字列をそのままinnerHTMLに入れないため）
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

async function init() {
    if (!username) {
        // 未ログインの場合はログインページへ
        window.location.href = "index.html";
        return;
    }
    await loadUserInfo();
    await loadHistory();
}

init();
