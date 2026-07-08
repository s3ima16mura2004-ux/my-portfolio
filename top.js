import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    query,
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

const tbody = document.querySelector("#history-table tbody");

async function loadHistory() {
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="4">読み込み中…</td></tr>`;

    try {
        const q = query(
            collection(db, "history"),
            orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="4">まだ履歴がありません</td></tr>`;
            return;
        }

        // 一旦テキストを組み立ててから一括で反映（描画の都度innerHTML+=を避ける）
        let rowsHtml = "";

        snapshot.forEach(doc => {
            const data = doc.data();

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

loadHistory();
