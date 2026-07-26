async function testNoteApi() {
    try {
        const url =
            "https://note.com/api/v2/creators/witty_avocet996/contents?kind=note&page=1";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`取得に失敗しました: ${response.status}`);
        }

        const result = await response.json();

        console.log(result);
    } catch (error) {
        console.error("note APIの取得に失敗しました。");
        console.error(error);
    }
}

testNoteApi();