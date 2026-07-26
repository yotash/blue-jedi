const articlesList = document.querySelector(".articles__list");
const moreButton = document.querySelector(".articles-page__more");

const articlesPerPage = 12;

let allArticles = [];
let displayedCount = 0;

async function loadArticles() {
    try {
        const response = await fetch("./articles.json");

        if (!response.ok) {
            throw new Error("articles.jsonを取得できませんでした。");
        }

        allArticles = await response.json();

        articlesList.innerHTML = "";

        showMoreArticles();
    } catch (error) {
        console.error(error);

        articlesList.innerHTML = `
            <p class="articles__error">
                記事を読み込めませんでした。
            </p>
        `;

        moreButton.hidden = true;
    }
}

function showMoreArticles() {
    const nextArticles = allArticles.slice(
        displayedCount,
        displayedCount + articlesPerPage
    );

    nextArticles.forEach((article) => {
        const card = createArticleCard(article);
        articlesList.appendChild(card);
    });

    displayedCount += nextArticles.length;

    if (displayedCount >= allArticles.length) {
        moreButton.hidden = true;
    }
}

function createArticleCard(article) {
    const card = document.createElement("a");

    card.classList.add("article-card");
    card.href = article.link;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const formattedDate = formatDate(article.date);

    card.innerHTML = `
        <img
            class="article-card__image"
            src="${article.image}"
            alt="${escapeHtml(article.title)}"
        >

        <div class="article-card__content">
            <p class="article-card__date">
                ${formattedDate}
            </p>

            <h3 class="article-card__title">
                ${escapeHtml(article.title)}
            </h3>

            <p class="article-card__description">
                ${escapeHtml(article.description)}
            </p>

            <span class="article-card__link">
                noteで読む
            </span>
        </div>
    `;

    return card;
}

function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);
}

function escapeHtml(text) {
    return String(text || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

moreButton.addEventListener("click", showMoreArticles);

loadArticles();