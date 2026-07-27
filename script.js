const articlesCarousel = document.querySelector(".articles__carousel");
const articlesViewport = document.querySelector(".articles__viewport");
const articlesList = document.querySelector(".articles__list");
const articlesIndicators = document.querySelector(".articles__indicators");

const previousButton = document.querySelector(".articles__arrow--prev");
const nextButton = document.querySelector(".articles__arrow--next");

let articles = [];
let currentIndex = 0;
let autoPlayTimer = null;

const AUTO_PLAY_INTERVAL = 6000;

async function loadArticles() {
    try {
        const response = await fetch("./articles.json");

        if (!response.ok) {
            throw new Error("articles.jsonを取得できませんでした。");
        }

        const allArticles = await response.json();

        articles = allArticles.slice(0, 12);

        articlesList.innerHTML = "";

        articles.forEach((article) => {
            const card = createArticleCard(article);
            articlesList.appendChild(card);
        });

        createIndicators();
        updateCarousel(false);
        startAutoPlay();
    } catch (error) {
        console.error(error);

        articlesList.innerHTML = `
            <p class="articles__error">
                記事を読み込めませんでした。
            </p>
        `;
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

function getVisibleCardCount() {
    if (window.innerWidth <= 640) {
        return 1;
    }

    if (window.innerWidth <= 900) {
        return 2;
    }

    return 3;
}

function getMaximumIndex() {
    return Math.max(
        articles.length - getVisibleCardCount(),
        0
    );
}

function createIndicators() {
    articlesIndicators.innerHTML = "";

    const maximumIndex = getMaximumIndex();

    for (let index = 0; index <= maximumIndex; index += 1) {
        const indicator = document.createElement("button");

        indicator.classList.add("articles__indicator");
        indicator.type = "button";
        indicator.setAttribute(
            "aria-label",
            `${index + 1}番目の記事位置を表示`
        );

        indicator.addEventListener("click", () => {
            currentIndex = index;
            updateCarousel();
            startAutoPlay();
        });

        articlesIndicators.appendChild(indicator);
    }

    updateIndicators();
}

function updateIndicators() {
    const indicators = articlesIndicators.querySelectorAll(
        ".articles__indicator"
    );

    indicators.forEach((indicator, index) => {
        const isActive = index === currentIndex;

        indicator.classList.toggle("is-active", isActive);

        if (isActive) {
            indicator.setAttribute("aria-current", "true");
        } else {
            indicator.removeAttribute("aria-current");
        }
    });
}

function updateCarousel(useAnimation = true) {
    const firstCard = articlesList.querySelector(".article-card");

    if (!firstCard) {
        return;
    }

    const listStyles = window.getComputedStyle(articlesList);
    const gap = Number.parseFloat(listStyles.columnGap) || 0;

    const cardWidth = firstCard.getBoundingClientRect().width;
    const movementDistance = cardWidth + gap;

    articlesList.style.transition = useAnimation
        ? "transform 0.6s ease"
        : "none";

    articlesList.style.transform =
        `translateX(-${currentIndex * movementDistance}px)`;

    updateIndicators();
}

function showNextArticles() {
    const maximumIndex = getMaximumIndex();

    if (currentIndex >= maximumIndex) {
        currentIndex = 0;
    } else {
        currentIndex += 1;
    }

    updateCarousel();
}

function showPreviousArticles() {
    const maximumIndex = getMaximumIndex();

    if (currentIndex <= 0) {
        currentIndex = maximumIndex;
    } else {
        currentIndex -= 1;
    }

    updateCarousel();
}

function startAutoPlay() {
    stopAutoPlay();

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
        return;
    }

    autoPlayTimer = window.setInterval(
        showNextArticles,
        AUTO_PLAY_INTERVAL
    );
}

function stopAutoPlay() {
    if (autoPlayTimer !== null) {
        window.clearInterval(autoPlayTimer);
        autoPlayTimer = null;
    }
}

previousButton.addEventListener("click", () => {
    showPreviousArticles();
    startAutoPlay();
});

nextButton.addEventListener("click", () => {
    showNextArticles();
    startAutoPlay();
});

articlesCarousel.addEventListener("mouseenter", stopAutoPlay);
articlesCarousel.addEventListener("mouseleave", startAutoPlay);

let touchStartX = 0;
let touchEndX = 0;

articlesViewport.addEventListener(
    "touchstart",
    (event) => {
        touchStartX = event.changedTouches[0].clientX;
        stopAutoPlay();
    },
    {
        passive: true
    }
);

articlesViewport.addEventListener(
    "touchend",
    (event) => {
        touchEndX = event.changedTouches[0].clientX;

        handleSwipe();
        startAutoPlay();
    },
    {
        passive: true
    }
);

function handleSwipe() {
    const swipeDistance = touchStartX - touchEndX;
    const minimumSwipeDistance = 50;

    if (swipeDistance > minimumSwipeDistance) {
        showNextArticles();
    }

    if (swipeDistance < -minimumSwipeDistance) {
        showPreviousArticles();
    }
}

window.addEventListener("resize", () => {
    currentIndex = Math.min(
        currentIndex,
        getMaximumIndex()
    );

    createIndicators();
    updateCarousel(false);
});

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

loadArticles();