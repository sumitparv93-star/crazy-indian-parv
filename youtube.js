/* =========================================================
   CRAZY INDIAN PARV
   YOUTUBE VIDEO SYSTEM
   NORMAL VIDEOS ONLY
   ========================================================= */

(function () {
    "use strict";

    const config = window.SITE_CONFIG;

    if (!config) {
        console.error("Crazy Indian Parv: config.js not found.");
        return;
    }

    const youtube = config.youtube || {};

    const API_ENABLED = youtube.enabled === true;
    const API_KEY = youtube.apiKey || "";
    const CHANNEL_ID = youtube.channelId || "";
    const MAX_RESULTS = 6;

    const videoGrid = document.querySelector(".video-grid");

    if (!videoGrid) {
        console.error("Crazy Indian Parv: .video-grid not found.");
        return;
    }


    /* =========================================================
       LOAD VIDEOS
       ========================================================= */

    async function loadVideos() {

        if (!API_ENABLED || !API_KEY || !CHANNEL_ID) {
            showMessage("YouTube API settings are incomplete.");
            return;
        }

        try {

            /* STEP 1: Get latest videos */

            const searchUrl =
                "https://www.googleapis.com/youtube/v3/search" +
                "?part=snippet" +
                "&channelId=" + encodeURIComponent(CHANNEL_ID) +
                "&maxResults=20" +
                "&order=date" +
                "&type=video" +
                "&key=" + encodeURIComponent(API_KEY);


            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();


            if (!searchResponse.ok) {
                console.error("YouTube Search API error:", searchData);
                showMessage("YouTube videos could not be loaded.");
                return;
            }


            const items = Array.isArray(searchData.items)
                ? searchData.items.filter(function (item) {
                    return item.id && item.id.videoId;
                })
                : [];


            if (items.length === 0) {
                showMessage("No YouTube videos were found.");
                return;
            }


            /* =====================================================
               STEP 2: Get video details
               This lets us remove Shorts / very short videos.
               ===================================================== */

            const videoIds = items.map(function (item) {
                return item.id.videoId;
            });


            const detailsUrl =
                "https://www.googleapis.com/youtube/v3/videos" +
                "?part=snippet,contentDetails" +
                "&id=" + encodeURIComponent(videoIds.join(",")) +
                "&key=" + encodeURIComponent(API_KEY);


            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();


            if (!detailsResponse.ok) {
                console.error("YouTube Videos API error:", detailsData);
                showMessage("YouTube videos could not be loaded.");
                return;
            }


            const details = Array.isArray(detailsData.items)
                ? detailsData.items
                : [];


            /* =====================================================
               NORMAL VIDEO FILTER

               Videos of 60 seconds or less are excluded.
               ===================================================== */

            const normalVideos = details.filter(function (video) {

                if (!video.contentDetails) {
                    return false;
                }

                const duration =
                    parseDuration(video.contentDetails.duration);

                return duration > 60;
            });


            if (normalVideos.length === 0) {
                showMessage("No normal YouTube videos were found.");
                return;
            }


            /* Keep original newest order */

            const orderedVideos = [];

            items.forEach(function (searchItem) {

                const found = normalVideos.find(function (video) {
                    return video.id === searchItem.id.videoId;
                });

                if (found) {
                    orderedVideos.push(found);
                }

            });


            renderVideos(
                orderedVideos.slice(0, MAX_RESULTS)
            );


        } catch (error) {

            console.error(
                "Crazy Indian Parv YouTube Error:",
                error
            );

            showMessage("YouTube videos could not be loaded.");
        }
    }


    /* =========================================================
       CONVERT YOUTUBE ISO DURATION TO SECONDS

       Example: PT5M20S = 320 seconds
       ========================================================= */

    function parseDuration(duration) {

        if (!duration) {
            return 0;
        }

        const match = duration.match(
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


    /* =========================================================
       RENDER VIDEOS
       ========================================================= */

    function renderVideos(items) {

        videoGrid.innerHTML = "";

        items.forEach(function (item) {

            const videoId = item.id;

            const snippet =
                item.snippet || {};


            const title =
                snippet.title ||
                "Crazy Indian Parv";


            const description =
                snippet.description ||
                "Watch this video on YouTube.";


            const thumbnail =
                (
                    snippet.thumbnails &&
                    snippet.thumbnails.high &&
                    snippet.thumbnails.high.url
                ) ||

                (
                    snippet.thumbnails &&
                    snippet.thumbnails.medium &&
                    snippet.thumbnails.medium.url
                ) ||

                (
                    snippet.thumbnails &&
                    snippet.thumbnails.default &&
                    snippet.thumbnails.default.url
                );


            const videoUrl =
                "https://www.youtube.com/watch?v=" +
                encodeURIComponent(videoId);


            /* =================================================
               CARD
               ================================================= */

            const card =
                document.createElement("article");

            card.className = "video-card";


            /* =================================================
               LINK
               ================================================= */

            const link =
                document.createElement("a");

            link.href = videoUrl;

            link.target = "_blank";

            link.rel =
                "noopener noreferrer";


            link.style.textDecoration =
                "none";

            link.style.color =
                "inherit";

            link.style.display =
                "block";


            /* =================================================
               THUMBNAIL
               ================================================= */

            const thumbnailBox =
                document.createElement("div");

            thumbnailBox.className =
                "video-thumbnail";


            if (thumbnail) {

                thumbnailBox.style.backgroundImage =
                    "url('" +
                    thumbnail.replace(/'/g, "%27") +
                    "')";

                thumbnailBox.style.backgroundSize =
                    "cover";

                thumbnailBox.style.backgroundPosition =
                    "center";
            }


            /* =================================================
               PLAY BUTTON
               ================================================= */

            const playButton =
                document.createElement("div");

            playButton.className =
                "play-button";

            playButton.textContent =
                "▶";


            /* =================================================
               VIDEO INFORMATION
               ================================================= */

            const info =
                document.createElement("div");

            info.className =
                "video-info";


            const heading =
                document.createElement("h3");

            heading.textContent =
                title;


            const paragraph =
                document.createElement("p");

            paragraph.textContent =
                shortenText(
                    description,
                    120
                );


            info.appendChild(heading);

            info.appendChild(paragraph);


            thumbnailBox.appendChild(
                playButton
            );


            link.appendChild(
                thumbnailBox
            );

            link.appendChild(
                info
            );


            card.appendChild(
                link
            );


            videoGrid.appendChild(
                card
            );

        });
    }


    /* =========================================================
       ERROR / MESSAGE
       ========================================================= */

    function showMessage(message) {

        videoGrid.innerHTML = "";

        const box =
            document.createElement("div");

        box.className =
            "video-api-message";

        box.textContent =
            message;

        box.style.padding =
            "20px";

        box.style.textAlign =
            "center";

        videoGrid.appendChild(
            box
        );
    }


    /* =========================================================
       SHORTEN DESCRIPTION
       ========================================================= */

    function shortenText(
        text,
        maxLength
    ) {

        if (!text) {
            return "";
        }

        if (text.length <= maxLength) {
            return text;
        }

        return (
            text
                .substring(
                    0,
                    maxLength
                )
                .trim() +
            "..."
        );
    }


    /* =========================================================
       START
       ========================================================= */

    loadVideos();

})();
