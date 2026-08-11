/* =========================================================
   CRAZY INDIAN PARV
   YOUTUBE VIDEOS + SHORTS
   API KEY IS NOT STORED HERE
   ========================================================= */

(function () {

    const WORKER_URL =
        "https://crazy-indian-parv-api.sumitparv923.workers.dev";

    const config = window.SITE_CONFIG;

    if (!config || !config.youtube) {
        console.error("SITE_CONFIG not found.");
        return;
    }

    const CHANNEL_ID = config.youtube.channelId;
    const MAX_RESULTS = 6;

    // Videos up to 3 minutes are treated as Shorts
    const SHORT_MAX_SECONDS = 180;


    /* =========================================================
       WORKER REQUEST
       ========================================================= */

    async function workerRequest(path, params) {

        const query = new URLSearchParams(params);

        const response = await fetch(
            WORKER_URL + path + "?" + query.toString()
        );

        if (!response.ok) {
            throw new Error(
                "Worker request failed: " + response.status
            );
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(
                data.error.message || "YouTube API error"
            );
        }

        return data;
    }


    /* =========================================================
       SEARCH LATEST CHANNEL UPLOADS
       ========================================================= */

    async function getLatestSearchResults() {

        return workerRequest("/search", {
            part: "snippet",
            channelId: CHANNEL_ID,
            order: "date",
            type: "video",
            maxResults: "50"
        });
    }


    /* =========================================================
       GET VIDEO DETAILS
       ========================================================= */

    async function getVideoDetails(videoIds) {

        if (!videoIds.length) {
            return [];
        }

        const data = await workerRequest("/videos", {
            part: "snippet,contentDetails,statistics",
            id: videoIds.join(",")
        });

        return Array.isArray(data.items)
            ? data.items
            : [];
    }


    /* =========================================================
       CONVERT YOUTUBE DURATION TO SECONDS
       ========================================================= */

    function durationToSeconds(duration) {

        if (!duration) {
            return 0;
        }

        const match = duration.match(
            /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/
        );

        if (!match) {
            return 0;
        }

        const hours = Number(match[1] || 0);
        const minutes = Number(match[2] || 0);
        const seconds = Number(match[3] || 0);

        return (
            hours * 3600 +
            minutes * 60 +
            seconds
        );
    }


    /* =========================================================
       HTML SECURITY
       ========================================================= */

    function escapeHtml(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =========================================================
       SHORTEN DESCRIPTION
       ========================================================= */

    function shortenText(text, maxLength) {

        const value = String(text || "").trim();

        if (value.length <= maxLength) {
            return value;
        }

        return value.substring(0, maxLength).trim() + "...";
    }


    /* =========================================================
       GET THUMBNAIL
       ========================================================= */

    function getThumbnail(item) {

        const thumbnails =
            item.snippet &&
            item.snippet.thumbnails;

        if (!thumbnails) {
            return "";
        }

        const image =
            thumbnails.maxres ||
            thumbnails.high ||
            thumbnails.medium ||
            thumbnails.default;

        return image ? image.url : "";
    }


    /* =========================================================
       CREATE NORMAL VIDEO CARD
       ========================================================= */

    function createVideoCard(item) {

        const videoId = item.id;

        const snippet = item.snippet || {};

        const title =
            snippet.title || "Crazy Indian Parv";

        const description =
            snippet.description || "";

        const thumbnail =
            getThumbnail(item);

        const card =
            document.createElement("article");

        card.className = "video-card";

        card.innerHTML = `
            <a
                href="https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}"
                target="_blank"
                rel="noopener noreferrer"
            >

                <div
                    class="video-thumbnail"
                    style="
                        background-image:
                        url('${escapeHtml(thumbnail)}');
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
                        shortenText(description, 150)
                    )}
                </p>

            </div>
        `;

        return card;
    }


    /* =========================================================
       CREATE SHORT CARD
       ========================================================= */

    function createShortCard(item, number) {

        const videoId = item.id;

        const snippet = item.snippet || {};

        const title =
            snippet.title || "Crazy Indian Parv Short";

        const description =
            snippet.description || "";

        const thumbnail =
            getThumbnail(item);

        const card =
            document.createElement("article");

        card.className = "short-card";

        card.innerHTML = `
            <a
                href="https://www.youtube.com/shorts/${encodeURIComponent(videoId)}"
                target="_blank"
                rel="noopener noreferrer"
            >

                <div
                    class="short-visual"
                    style="
                        background-image:
                        url('${escapeHtml(thumbnail)}');
                        background-size: cover;
                        background-position: center;
                    "
                >

                    <span>
                        SHORTS / ${String(number).padStart(2, "0")}
                    </span>

                    <div class="short-play">
                        ▶
                    </div>

                </div>

            </a>

            <div class="short-info">

                <h3>
                    ${escapeHtml(title)}
                </h3>

                <p>
                    ${escapeHtml(
                        shortenText(description, 150)
                    )}
                </p>

                <a
                    class="short-btn"
                    href="https://www.youtube.com/shorts/${encodeURIComponent(videoId)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ▶ Watch Short
                </a>

            </div>
        `;

        return card;
    }


    /* =========================================================
       SHOW NORMAL VIDEOS
       ========================================================= */

    function renderVideos(items) {

        const container =
            document.getElementById("youtube-videos");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        const videos =
            items.slice(0, MAX_RESULTS);

        if (!videos.length) {

            container.innerHTML = `
                <div class="video-loading">
                    No normal videos found.
                </div>
            `;

            return;
        }

        videos.forEach(function (item) {

            container.appendChild(
                createVideoCard(item)
            );

        });
    }


    /* =========================================================
       SHOW SHORTS
       ========================================================= */

    function renderShorts(items) {

        const container =
            document.getElementById("youtube-shorts");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        const shorts =
            items.slice(0, MAX_RESULTS);

        if (!shorts.length) {

            container.innerHTML = `
                <div class="video-loading">
                    No Shorts found.
                </div>
            `;

            return;
        }

        shorts.forEach(function (item, index) {

            container.appendChild(
                createShortCard(
                    item,
                    index + 1
                )
            );

        });
    }


    /* =========================================================
       LOAD VIDEOS + SHORTS
       ========================================================= */

    async function loadYouTubeContent() {

        const videosContainer =
            document.getElementById("youtube-videos");

        const shortsContainer =
            document.getElementById("youtube-shorts");


        try {

            if (videosContainer) {

                videosContainer.innerHTML = `
                    <div class="video-loading">
                        Loading latest videos...
                    </div>
                `;

            }

            if (shortsContainer) {

                shortsContainer.innerHTML = `
                    <div class="video-loading">
                        Loading latest Shorts...
                    </div>
                `;

            }


            /* Get latest 50 uploads */

            const searchData =
                await getLatestSearchResults();


            const searchItems =
                Array.isArray(searchData.items)
                    ? searchData.items
                    : [];


            const videoIds =
                searchItems
                    .map(function (item) {

                        return item.id &&
                            item.id.videoId;

                    })
                    .filter(Boolean);


            if (!videoIds.length) {

                renderVideos([]);
                renderShorts([]);

                return;
            }


            /* Get duration + details */

            const details =
                await getVideoDetails(videoIds);


            const detailMap =
                new Map(
                    details.map(function (item) {

                        return [
                            item.id,
                            item
                        ];

                    })
                );


            /* Keep YouTube's latest-date order */

            const allItems =
                searchItems
                    .map(function (searchItem) {

                        const id =
                            searchItem.id &&
                            searchItem.id.videoId;

                        const detail =
                            detailMap.get(id);

                        if (!detail) {
                            return null;
                        }

                        return {

                            id: id,

                            snippet:
                                detail.snippet ||
                                searchItem.snippet ||
                                {},

                            contentDetails:
                                detail.contentDetails ||
                                {}

                        };

                    })
                    .filter(Boolean);


            const normalVideos = [];
            const shorts = [];


            allItems.forEach(function (item) {

                const seconds =
                    durationToSeconds(
                        item.contentDetails.duration
                    );


                if (
                    seconds > 0 &&
                    seconds <= SHORT_MAX_SECONDS
                ) {

                    shorts.push(item);

                } else if (
                    seconds > SHORT_MAX_SECONDS
                ) {

                    normalVideos.push(item);

                }

            });


            /* 6 normal videos */

            renderVideos(normalVideos);


            /* 6 Shorts */

            renderShorts(shorts);


            console.log(
                "Crazy Indian Parv:",
                normalVideos.length,
                "normal videos,",
                shorts.length,
                "Shorts."
            );


        } catch (error) {

            console.error(
                "YouTube loading error:",
                error
            );


            if (videosContainer) {

                videosContainer.innerHTML = `
                    <div class="video-loading">
                        Unable to load latest videos.
                        Please try again later.
                    </div>
                `;

            }


            if (shortsContainer) {

                shortsContainer.innerHTML = `
                    <div class="video-loading">
                        Unable to load latest Shorts.
                        Please try again later.
                    </div>
                `;

            }

        }
    }


    /* =========================================================
       PUBLIC FUNCTIONS
       ========================================================= */

    window.CrazyIndianParvYouTube = {

        loadLatestVideos:
            loadYouTubeContent,

        loadYouTubeContent:
            loadYouTubeContent,

        getVideoDetails:
            getVideoDetails

    };


    /* =========================================================
       START
       ========================================================= */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            loadYouTubeContent
        );

    } else {

        loadYouTubeContent();

    }

})();
