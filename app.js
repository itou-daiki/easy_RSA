// RSA暗号のロジック

// モジュラー累乗 (a^b mod m)
function modPow(base, exponent, modulus) {
    if (modulus === 1n) return 0n;

    let result = 1n;
    base = base % modulus;

    while (exponent > 0n) {
        if (exponent % 2n === 1n) {
            result = (result * base) % modulus;
        }
        exponent = exponent >> 1n;
        base = (base * base) % modulus;
    }

    return result;
}

// 最大公約数を求める
function gcd(a, b) {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// 拡張ユークリッドアルゴリズム
function extendedGcd(a, b) {
    if (b === 0) {
        return [a, 1, 0];
    }
    const [g, x1, y1] = extendedGcd(b, a % b);
    const x = y1;
    const y = x1 - Math.floor(a / b) * y1;
    return [g, x, y];
}

// モジュラー逆元を求める
function modInverse(e, z) {
    const [g, x, y] = extendedGcd(e, z);
    if (g !== 1) {
        return null; // 逆元が存在しない
    }
    return ((x % z) + z) % z;
}

// 鍵生成のロジック
function updateKeyGen() {
    const p = parseInt(document.getElementById('prime-p').value);
    const q = parseInt(document.getElementById('prime-q').value);
    const resultDiv = document.getElementById('keygen-result');

    if (p === q) {
        resultDiv.innerHTML = '<div class="alert alert-danger">【エラー】 p と q が同じ数字のため、鍵生成を実行できません。pとqは別々の数字にしてください。</div>';
        return;
    }

    if (p * q < 143) {
        resultDiv.innerHTML = '<div class="alert alert-warning">【エラー】 p と q が小さい or 近すぎるため、鍵生成を実行できません。<br>【エラー】 p × q ≥ 143 になるような数字にしてください。</div>';
        return;
    }

    const n = p * q;
    const z = (p - 1) * (q - 1);

    let html = '<div class="alert alert-success">条件を満たしています。次のステップに進みます。</div>';
    html += `<p>③　n = p × q を求めます。 p ( ${p} ) × q ( ${q} ) のため、 n は ${n} になります。</p>`;
    html += `<p>④　z = ( p - 1 ) × ( q - 1 ) を求めます。 p - 1 = ${p - 1}、 q - 1 = ${q - 1} のため、z は ${z} になります。</p>`;

    // e の選択肢を表示
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    html += '<p>⑤　z を割ることのできない素数( e )を選んでください。</p>';
    html += '<select id="prime-e" class="form-select mb-3">';
    primes.forEach(prime => {
        html += `<option value="${prime}">${prime}</option>`;
    });
    html += '</select>';
    html += '<div id="e-result"></div>';

    resultDiv.innerHTML = html;

    // e の変更イベント
    document.getElementById('prime-e').addEventListener('change', updateESelection);

    // 初期値で更新
    updateESelection();
}

function updateESelection() {
    const p = parseInt(document.getElementById('prime-p').value);
    const q = parseInt(document.getElementById('prime-q').value);
    const e = parseInt(document.getElementById('prime-e').value);
    const z = (p - 1) * (q - 1);
    const n = p * q;

    const eResultDiv = document.getElementById('e-result');

    if (z % e === 0) {
        eResultDiv.innerHTML = `<div class="alert alert-danger">e ( ${e} ) は z ( ${z} ) を割ることができます。<br>z ( ${z} ) ÷ e ( ${e} ) = ${Math.floor(z / e)}</div>`;
        return;
    }

    let html = '<div class="alert alert-success">条件を満たしています。次のステップに進みます。</div>';
    html += '<p>⑥　m ( p - 1 )( q - 1 )  ≡ 1 （ mod e ）となる数（ m ）を求める（1≦m≦e-1）</p>';
    html += `<p>z ( ${z} ) × m と -1 を e ( ${e} ) で割って、余りが等しくなる数 ( m ) を求めます。</p>`;
    html += `<p>ただし、m は 1 以上、e - 1 ( ${e - 1} ) 以下でないといけません。 ( 1 ≦ m ≦ ${e - 1} )</p>`;
    html += '<p>つまり、「zm を e で割った余り」と「-1 を e で割った余り」が等しくなるような m を探してください</p>';

    const targetRemainder = ((-1 % e) + e) % e;
    html += `<p>-1 を e ( ${e} ) で割った余りは ${targetRemainder} です。</p>`;
    html += `<p>→ ${z} × m を e ( ${e} ) で割った余りが ${targetRemainder} になるような m を探してください。</p>`;

    html += `<label class="form-label">m を選択してください（1 ≦ m ≦ ${e - 1}）</label>`;
    html += `<input type="number" id="m-value" class="form-control mb-3" min="1" max="${e - 1}" value="1">`;
    html += '<div id="m-result"></div>';

    eResultDiv.innerHTML = html;

    // m の変更イベント
    document.getElementById('m-value').addEventListener('input', updateMSelection);

    // 初期値で更新
    updateMSelection();
}

function updateMSelection() {
    const p = parseInt(document.getElementById('prime-p').value);
    const q = parseInt(document.getElementById('prime-q').value);
    const e = parseInt(document.getElementById('prime-e').value);
    const m = parseInt(document.getElementById('m-value').value);
    const z = (p - 1) * (q - 1);
    const n = p * q;

    const mResultDiv = document.getElementById('m-result');

    const targetRemainder = ((-1 % e) + e) % e;
    const actualRemainder = (z * m) % e;

    if (targetRemainder !== actualRemainder) {
        mResultDiv.innerHTML = '<div class="alert alert-danger">【エラー】「zm を e で割った余り」と「-1 を e で割った余り」が等しくありません</div>';
        return;
    }

    const d = Math.floor((m * z + 1) / e);

    let html = '<div class="alert alert-success">条件を満たしています。</div>';
    html += `<p>⑦　m ( ${m} ) × ( p - 1 )( q - 1 ) + 1 を e ( ${e} ) で割った商（ d ）を求めます。d は ${d} です。</p>`;
    html += '<p>公開鍵（n,e）と秘密鍵（p,q,d）の生成が完了しました。</p>';
    html += '<h5>公開鍵（相手に教える値）</h5>';
    html += `<h3>n = ${n}、e = ${e}</h3>`;
    html += '<h5>秘密鍵（教えてはいけない値）</h5>';
    html += `<h3>p = ${p}、q = ${q}、d = ${d}</h3>`;

    mResultDiv.innerHTML = html;
}

// 平文を処理する
function processPlaintext() {
    const plaintext = document.getElementById('plaintext').value;
    const resultDiv = document.getElementById('plaintext-result');

    if (!plaintext) {
        resultDiv.innerHTML = '<div class="alert alert-danger">【エラー】暗号化したい文字列を入力してください。</div>';
        return;
    }

    const expandedList = [];
    let unknownChars = false;

    for (let ch of plaintext) {
        if (charToNum[ch] !== undefined) {
            expandedList.push({文字: ch, 数値: charToNum[ch]});
        } else if (dakutenMap[ch]) {
            const [baseChar, mark] = dakutenMap[ch];
            if (charToNum[baseChar] !== undefined && charToNum[mark] !== undefined) {
                expandedList.push({文字: baseChar, 数値: charToNum[baseChar]});
                expandedList.push({文字: mark, 数値: charToNum[mark]});
            } else {
                unknownChars = true;
                break;
            }
        } else {
            unknownChars = true;
            break;
        }
    }

    if (unknownChars) {
        resultDiv.innerHTML = '<div class="alert alert-warning">【エラー】リストにない文字、または分解できない文字が含まれています。</div>';
        return;
    }

    // テーブルを作成
    let html = '<p>入力文字の分解・数値化結果:</p>';
    html += '<table class="table table-bordered"><thead><tr><th>文字</th><th>数値</th></tr></thead><tbody>';
    expandedList.forEach(item => {
        html += `<tr><td>${item.文字}</td><td>${item.数値}</td></tr>`;
    });
    html += '</tbody></table>';

    const numsList = expandedList.map(item => item.数値).join(' ');
    html += `<p>上記の数値リスト: ${numsList}</p>`;

    resultDiv.innerHTML = html;

    // 暗号化ボタンを有効化
    document.getElementById('encrypt-btn').disabled = false;
}

// 暗号化を実行
function encrypt() {
    const plaintext = document.getElementById('plaintext').value;
    const n = BigInt(document.getElementById('encrypt-n').value);
    const e = BigInt(document.getElementById('encrypt-e').value);
    const resultDiv = document.getElementById('encrypted-result');

    if (!plaintext) {
        resultDiv.innerHTML = '<div class="alert alert-danger">【エラー】暗号化したい文字列を入力してください。</div>';
        return;
    }

    const expandedList = [];
    let unknownChars = false;

    for (let ch of plaintext) {
        if (charToNum[ch] !== undefined) {
            expandedList.push({文字: ch, 数値: charToNum[ch]});
        } else if (dakutenMap[ch]) {
            const [baseChar, mark] = dakutenMap[ch];
            if (charToNum[baseChar] !== undefined && charToNum[mark] !== undefined) {
                expandedList.push({文字: baseChar, 数値: charToNum[baseChar]});
                expandedList.push({文字: mark, 数値: charToNum[mark]});
            } else {
                unknownChars = true;
                break;
            }
        } else {
            unknownChars = true;
            break;
        }
    }

    if (unknownChars) {
        resultDiv.innerHTML = '<div class="alert alert-warning">【エラー】リストにない文字、または分解できない文字が含まれています。</div>';
        return;
    }

    // RSA暗号化
    const encryptedNums = expandedList.map(item => {
        return modPow(BigInt(item.数値), e, n).toString();
    });

    // テーブルを作成
    let html = '<h5>暗号化された数値:</h5>';
    html += '<table class="table table-bordered"><thead><tr>';
    encryptedNums.forEach((_, i) => {
        html += `<th>文字${i + 1}</th>`;
    });
    html += '</tr></thead><tbody><tr>';
    encryptedNums.forEach(num => {
        html += `<td>${num}</td>`;
    });
    html += '</tr></tbody></table>';

    html += `<p>暗号化された数値（スペース区切り）: ${encryptedNums.join(' ')}</p>`;
    html += '<button class="btn btn-secondary" onclick="copyToClipboard(\'' + encryptedNums.join(' ') + '\')">クリップボードにコピー</button>';

    resultDiv.innerHTML = html;
}

// 復号を実行
function decrypt() {
    const n = BigInt(document.getElementById('decrypt-n').value);
    const d = BigInt(document.getElementById('decrypt-d').value);
    const ciphertext = document.getElementById('ciphertext').value;
    const resultDiv = document.getElementById('decrypted-result');

    const encryptedList = ciphertext.trim().split(/\s+/).filter(num => /^\d+$/.test(num));

    if (encryptedList.length === 0) {
        resultDiv.innerHTML = '<div class="alert alert-danger">【エラー】暗号化された数値を入力してください。</div>';
        return;
    }

    // RSA復号
    const decryptedNums = encryptedList.map(num => {
        return Number(modPow(BigInt(num), d, n));
    });

    // 数値を文字に変換
    const decryptedChars = decryptedNums.map(num => numToChar[num] || '?');

    // テーブルを作成
    let html = '<h5>復号された文字:</h5>';
    html += '<table class="table table-bordered"><thead><tr>';
    decryptedChars.forEach((_, i) => {
        html += `<th>文字${i + 1}</th>`;
    });
    html += '</tr></thead><tbody><tr>';
    decryptedChars.forEach(char => {
        html += `<td>${char}</td>`;
    });
    html += '</tr></tbody></table>';

    html += `<p>復号された文字列: ${decryptedChars.join('')}</p>`;

    resultDiv.innerHTML = html;
}

// クリップボードにコピー
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('クリップボードにコピーしました');
    }).catch(err => {
        console.error('コピーに失敗しました:', err);
    });
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', () => {
    // 鍵生成タブ
    document.getElementById('prime-p').addEventListener('change', updateKeyGen);
    document.getElementById('prime-q').addEventListener('change', updateKeyGen);

    // 暗号化タブ
    document.getElementById('plaintext').addEventListener('input', processPlaintext);
    document.getElementById('encrypt-btn').addEventListener('click', encrypt);

    // 復号タブ
    document.getElementById('decrypt-btn').addEventListener('click', decrypt);

    // 初期状態で鍵生成を更新
    updateKeyGen();
});
