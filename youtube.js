/* =========================================================
   CRAZY INDIAN PARV
   YOUTUBE VIDEO SYSTEM
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       CONFIG CHECK
       ===================================================== */

    const config = window.SITE_CONFIG;

    if (!config) {

        console.warn(
            "Crazy Indian Parv: SITE_CONFIG not found."
        );

        return;
    }


    /* =====================================================
       SETTINGS
       ===================================================== */

    const youtubeSettings =
        config.youtube || {};

    const API_ENABLED =
        youtubeSettings.enabled === true;

    const API_KEY =
        youtubeSettings.apiKey || "";

    const CHANNEL_ID =
        youtubeSettings.channelId || "";

    const MAX_RESULTS =
        youtubeSettings.maxResults || 6;


    /* =====================================================
       VIDEO SECTION
       ===================================================== */

    const videoGrid =
        document.querySelector(".video-grid");

    if (!videoGrid) {
        return;
    }


    /* =====================================================
       API NOT ENABLED
       ===================================================== */

    if (
        !API_ENABLED ||
        !API_KEY ||
        !CHANNEL_ID
    ) {

        console.log(
            "Crazy Indian Parv: YouTube API is currently disabled."
        );

        return;
    }


    /* =====================================================
       LOAD VIDEOS
       ===================================================== */

    async function loadVideos() {

        try {

            const url =
                "https://www.googleapis.com/youtube/v3/search" +
                "?part=snippet" +
                "&channelId=" +
                encodeURIComponent(CHANNEL_ID) +
                "&maxResults=20" +
                "&order=date" +
                "&type=video" +
                "&key=" +
                encodeURIComponent(API_KEY);


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    "YouTube API request failed."
                );

            }


            const data =
                await response.json();


            if (
                !data.items ||
                !data.items.length
            ) {

                console.warn(
                    "No YouTube videos found."
                );

                return;
            }


            /*
             * Search API can return Shorts as normal videos.
             * We first collect the latest results, then use
             * video details to check their duration.
             */

            const videoIds =
                data.items
                    .filter(function (item) {

                        return (
                            item.id &&
                            item.id.videoId
                        );

                    })
                    .map(function (item) {

                        return item.id.videoId;

                    });


            if (!videoIds.length) {

                console.warn(
                    "No valid YouTube videos found."
                );

                return;
            }


            const detailsUrl =
                "https://www.googleapis.com/youtube/v3/videos" +
                "?part=contentDetails" +
                "&id=" +
                encodeURIComponent(
                    videoIds.join(",")
                ) +
                "&key=" +
                encodeURIComponent(API_KEY);


            const detailsResponse =
                await fetch(detailsUrl);


            if (!detailsResponse.ok) {

                throw new Error(
                    "YouTube video details request failed."
                );

            }


            const detailsData =
                await detailsResponse.json();


            /*
             * Create a map of video ID -> duration.
             */

            const durationMap = {};


            (detailsData.items || []).forEach(
                function (item) {

                    if (
                        item.id &&
                        item.contentDetails &&
                        item.contentDetails.duration
                    ) {

                        durationMap[item.id] =
                            item.contentDetails.duration;

                    }

                }
            );


            /*
             * Remove Shorts.
             *
             * Shorts are normally 60 seconds or less.
             * We keep videos longer than 60 seconds.
             */

            const normalVideos =
                data.items.filter(
                    function (item) {

                        if (
                            !item.id ||
                            !item.id.videoId
                        ) {

                            return false;

                        }


                        const duration =
                            durationMap[
                                item.id.videoId
                            ];


                        if (!duration) {
                            return false;
                        }


                        const seconds =
                            parseISO8601Duration(
                                duration
                            );


                        return seconds > 60;

                    }
                );


            /*
             * Show only the requested number of
             * normal videos.
             */

            renderVideos(
                normalVideos.slice(
                    0,
                    MAX_RESULTS
                )
            );


        } catch (error) {

            console.error(
                "Crazy Indian Parv YouTube Error:",
                error
            );

        }

    }


    /* =====================================================
       RENDER VIDEOS
       ===================================================== */

    function renderVideos(items) {

        videoGrid.innerHTML = "";


        items.forEach(function (item) {

            if (
                !item.id ||
                !item.id.videoId
            ) {

                return;
            }


            const videoId =
                item.id.videoId;


            const title =
                item.snippet?.title ||
                "Crazy Indian Parv";


            const description =
                item.snippet?.description ||
                "Watch this video on YouTube.";


            const thumbnail =
                item.snippet?.thumbnails?.high?.url ||
                item.snippet?.thumbnails?.medium?.url ||
                item.snippet?.thumbnails?.default?.url;


            const videoUrl =
                "https://www.youtube.com/watch?v=" +
                encodeURIComponent(videoId);


            const card =
                document.createElement("article");


            card.className =
                "video-card";


            card.innerHTML = `

                <a
                    href="${videoUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                >

                    <div
                        class="video-thumbnail"
                        style="
                            background-image:
                            url('${thumbnail}');
                            background-size: cover;
                            background-position: center;
                            aspect-ratio: 16 / 9;
                            min-height: 220px;
                            width: 100%;
                        "
                    >

                        <div class="play-button">
                            ▶
                        </div>

                    </div>


                    <div class="video-info">

                        <h3>
                            ${escapeHtml(title)}
                        </h3>

                        <p>
                            ${escapeHtml(
                                shortenText(
                                    description,
                                    80
                                )
                            )}
                        </p>

                    </div>

                </a>

            `;


            videoGrid.appendChild(card);

        });

    }


    /* =====================================================
       ISO 8601 DURATION
       ===================================================== */

    function parseISO8601Duration(duration) {

        if (!duration) {
            return 0;
        }


        const match =
            duration.match(
                /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
            );


        if (!match) {
            return 0;
        }


        const hours =
            parseInt(match[1] || "0", 10);

        const minutes =
            parseInt(match[2] || "0", 10);

        const seconds =
            parseInt(match[3] || "0", 10);


        return (
            hours * 3600 +
            minutes * 60 +
            seconds
        );

    }


    /* =====================================================
       TEXT SECURITY
       ===================================================== */

    function escapeHtml(text) {

        const div =
            document.createElement("div");


        div.textContent =
            text || "";


        return div.innerHTML;

    }


    /* =====================================================
       SHORT DESCRIPTION
       ===================================================== */

    function shortenText(
        text,
        maxLength
    ) {

        if (!text) {
            return "";
        }


        if (
            text.length <= maxLength
        ) {

            return text;

        }


        return (
            text.substring(
                0,
                maxLength
            ).trim() + "..."
        );

    }


    /* =====================================================
       START
       ===================================================== */

    loadVideos();


})();