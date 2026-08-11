/* =========================================================
   CRAZY INDIAN PARV
   YOUTUBE VIDEOS
   API KEY NEVER STORED IN WEBSITE
   ========================================================= */

(function () {

    const WORKER_URL =
        "https://crazy-indian-parv-api.sumitparv923.workers.dev";

    const config = window.SITE_CONFIG;

    if (!config || !config.youtube) {
        console.error("SITE_CONFIG not found.");
        return;
    }


    /* ===============================
       LOAD VIDEOS
       =============================== */

    async function loadLatestVideos() {

        const container =
            document.getElementById("youtube-videos");

        if (!container) {
            console.error("youtube-videos container not found.");
            return;
        }

        try {

            const params = new URLSearchParams({
                part: "snippet",
                channelId: config.youtube.channelId,
                order: "date",
                type: "video",
                maxResults: String(
                    config.youtube.maxResults || 6
                )
            });


            const response = await fetch(
                WORKER_URL +
                "/search?" +
                params.toString()
            );


            if (!response.ok) {
                throw new Error(
                    "YouTube API request failed: " +
                    response.status
                );
            }


            const data = await response.json();


            console.log(
                "Crazy Indian Parv videos:",
                data
            );


            renderVideos(data.items || []);


        } catch (error) {

            console.error(
                "YouTube loading error:",
                error
            );


            container.innerHTML = `
                <div class="video-loading">
                    Unable to load latest videos.
                    Please try again later.
                </div>
            `;

        }

    }


    /* ===============================
       RENDER VIDEOS
       =============================== */

    function renderVideos(items) {

        const container =
            document.getElementById("youtube-videos");


        if (!container) {
            return;
        }


        if (!items.length) {

            container.innerHTML = `
                <div class="video-loading">
                    No videos found.
                </div>
            `;

            return;
        }


        container.innerHTML = "";


        items.forEach(function (item) {

            const videoId =
                item.id &&
                item.id.videoId;


            if (!videoId) {
                return;
            }


            const snippet =
                item.snippet || {};


            const title =
                snippet.title || "Crazy Indian Parv";


            const description =
                snippet.description || "";


            const thumbnail =
                snippet.thumbnails &&
                (
                    snippet.thumbnails.high ||
                    snippet.thumbnails.medium ||
                    snippet.thumbnails.default
                );


            const thumbnailUrl =
                thumbnail
                ? thumbnail.url
                : "";


            const card =
                document.createElement("article");


            card.className = "video-card";


            card.innerHTML = `

                <a
                    href="https://www.youtube.com/watch?v=${videoId}"
                    target="_blank"
                    rel="noopener noreferrer"
                >

                    <div
                        class="video-thumbnail"
                        style="
                            background-image:
                            url('${thumbnailUrl}');
                        "
                    >

                        <div class="play-button">
                            ▶
                        </div>

                    </div>

                </a>


                <div class="video-info">

                    <h3>
                        ${escapeHtml(title)}
                    </h3>

                    <p>
                        ${escapeHtml(
                            shortenText(description, 120)
                        )}
                    </p>

                </div>

            `;


            container.appendChild(card);

        });

    }


    /* ===============================
       SHORTEN DESCRIPTION
       =============================== */

    function shortenText(text, maxLength) {

        if (!text) {
            return "";
        }


        if (text.length <= maxLength) {
            return text;
        }


        return text.substring(0, maxLength) + "...";

    }


    /* ===============================
       HTML SECURITY
       =============================== */

    function escapeHtml(text) {

        return String(text)

            .replace(/&/g, "&amp;")

            .replace(/</g, "&lt;")

            .replace(/>/g, "&gt;")

            .replace(/"/g, "&quot;")

            .replace(/'/g, "&#039;");

    }


    /* ===============================
       MAKE AVAILABLE
       =============================== */

    window.CrazyIndianParvYouTube = {

        loadLatestVideos: loadLatestVideos

    };


    /* ===============================
       START AUTOMATICALLY
       =============================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            loadLatestVideos
        );

    } else {

        loadLatestVideos();

    }


})();
