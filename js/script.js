const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const DOM = {
    input: $('#input'),
    c: $('#c'), // 子音の入力フィールド
    v: $('#v'), // 母音の入力フィールド
    categories: $('#categories'), // 現在未使用ですが、DOM要素として保持
    generate: $('#generate'),
    result: $('#result'),
};

/**
 * DOMから必要な子音・母音、そして入力された単語とカテゴリのペアを整形して返す
 */
function DOMAcquisition() {
    const cChars = [...DOM.c.value]; // 子音の配列
    const vChars = [...DOM.v.value]; // 母音の配列

    // 入力テキストを「単語\tカテゴリ」のペアとしてパース
    let parsedInputData = DOM.input.value.split('\n')
        .filter(line => line.trim() !== '') // 空行を除外
        .map(line => {
            const parts = line.split('\t').filter(word => word.trim() !== '');
            if (parts.length >= 2) {
                return {
                    originalWord: parts[0], // 元の単語（今回は出力に使わないが、データとして保持）
                    category: parts[1]      // カテゴリ名
                };
            }
            return null; // 不完全な行はnullとしてマーク
        })
        .filter(item => item !== null); // nullを除外

    return { cChars, vChars, parsedInputData };
}

/**
 * 配列からランダムな文字を1つ返すヘルパー関数
 */
function getRandomChar(charArray) {
    if (!charArray || charArray.length === 0) return '';
    return charArray[Math.floor(Math.random() * charArray.length)];
}

/**
 * ランダムなCV（子音+母音）を生成する関数
 */
function generateRandomCV(cArray, vArray) {
    const c = getRandomChar(cArray);
    const v = getRandomChar(vArray);
    return `${c}${v}`;
}

DOM.generate.addEventListener('click', () => {
    // 1. 必要なデータをDOMから取得
    const { cChars, vChars, parsedInputData } = DOMAcquisition();

    // エラーチェック: 子音や母音がない場合は処理を中断
    if (cChars.length === 0 || vChars.length === 0) {
        DOM.result.textContent = '子音と母音を入力してください。';
        return;
    }

    // 2. ユニークなカテゴリを抽出し、それぞれに固有のCV（第二のCV）を割り当てる
    const uniqueCategories = [...new Set(parsedInputData.map(item => item.category))];
    const categorySpecificCVMappings = {}; // 例: { "食べ物": "ta", "動物": "do" }

    uniqueCategories.forEach(category => {
        // 各カテゴリに対して、一度だけランダムなCVを生成し、割り当てる
        categorySpecificCVMappings[category] = generateRandomCV(cChars, vChars);
    });
    // console.log("カテゴリ固有のCVマッピング:", categorySpecificCVMappings); // デバッグ用

    let generatedWordsResult = [];

    // 3. 入力された単語とカテゴリのペアごとに処理を実行
    parsedInputData.forEach(item => {
        const category = item.category;

        // 4. その行のカテゴリに割り当てられた固有のCV（第二のCV）を取得
        const categorySpecificCV = categorySpecificCVMappings[category];

        // 5. その行のために、ランダムなCV（第一のCV）を新しく生成
        const randomPrefixCV = generateRandomCV(cChars, vChars);

        // 6. 「第一のCV（ランダム）」 + 「第二のCV（カテゴリ固有）」で新しい単語を生成
        const newWord = `${randomPrefixCV}${categorySpecificCV}`;

        // 出力例: 元の単語 (カテゴリ) -> 生成された単語
        generatedWordsResult.push(`${item.originalWord} ${category} ${newWord}`);
    });

    // 7. 結果を表示
    DOM.result.innerText = generatedWordsResult.join('\n');
});
