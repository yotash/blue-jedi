const articlesList = document.querySelector(".articles__list");

async function loadArticles() {
    try {
        const response = await fetch("./articles.json");

        if (!response.ok) {
            throw new Error("記事データを取得できませんでした。");
        }

        const articles = await response.json();

        articlesList.innerHTML = "";

        articles.slice(0, 3).forEach((article) => {
            const articleCard = document.createElement("article");

            articleCard.classList.add("article-card");

            articleCard.innerHTML = `
                ${article.image
                    ? `
                            <img
                                class="article-card__image"
                                src="${article.image}"
                                alt=""
                            >
                        `
                    : ""
                }

                <p class="article-card__date">
                    ${article.publishedAt}
                </p>

                <h3 class="article-card__title">
                    ${article.title}
                </h3>

                <p class="article-card__description">
                    ${article.description}
                </p>

                <a
                    class="article-card__link"
                    href="${article.url}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    noteで読む
                </a>
            `;

            articlesList.appendChild(articleCard);
        });
    } catch (error) {
        console.error(error);

        articlesList.innerHTML = `
            <p class="articles__error">
                記事を読み込めませんでした。
            </p>
        `;
    }
}

loadArticles();