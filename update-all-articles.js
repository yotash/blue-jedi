const fs = require("fs");

async function updateAllArticles() {
    try {
        const allArticles = [];

        let page = 1;
        let isLastPage = false;

        while (!isLastPage) {
            const url =
                `https://note.com/api/v2/creators/witty_avocet996/contents?kind=note&page=${page}`;

            console.log(`${page}ページ目を取得しています...`);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `${page}ページ目の取得に失敗しました: ${response.status}`
                );
            }

            const result = await response.json();

            const contents = result.data.contents;

            console.log(`ページ ${page}: ${contents.length} 件`);

            contents.forEach((item) => {
                allArticles.push({
                    title: item.name || "",
                    link: item.noteUrl || "",
                    date: item.publishAt || "",
                    image: item.eyecatch || "",
                    description: item.body || ""
                });
            });

            isLastPage = result.data.isLastPage;
            page += 1;
        }

        fs.writeFileSync(
            "articles.json",
            JSON.stringify(allArticles, null, 2),
            "utf-8"
        );

        console.log(`${allArticles.length}件の記事を保存しました。`);
    } catch (error) {
        console.error("全記事の取得に失敗しました。");
        console.error(error);
        process.exit(1);
    }
}

updateAllArticles();