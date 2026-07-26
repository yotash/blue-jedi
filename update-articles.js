const fs = require("fs");
const Parser = require("rss-parser");

const parser = new Parser({
    customFields: {
        item: [["media:thumbnail", "thumbnail"]]
    }
});

async function updateArticles() {
    try {
        const feed = await parser.parseURL(
            "https://note.com/witty_avocet996/rss"
        );

        const articles = feed.items.slice(0, 3).map((item) => ({
            title: item.title || "",
            link: item.link || "",
            date: item.pubDate || "",
            image: item.thumbnail || "",
            description: (item.contentSnippet || "")
                .replace("続きをみる", "")
                .trim()
        }));

        fs.writeFileSync(
            "articles.json",
            JSON.stringify(articles, null, 2),
            "utf-8"
        );

        console.log("articles.json updated!");
    } catch (error) {
        console.error("Failed to update articles.json");
        console.error(error);
        process.exit(1);
    }
}

updateArticles();