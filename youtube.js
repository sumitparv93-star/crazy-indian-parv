/* =========================================================
   CRAZY INDIAN PARV
   YOUTUBE API
   API KEY IS NOT STORED HERE
   ========================================================= */

(function () {

    const WORKER_URL =
        "https://crazy-indian-parv-api.sumitparv923.workers.dev";

    /* ===============================
       GET CONFIG
       =============================== */

    const config = window.SITE_CONFIG;

    if (!config || !config.youtube) {
        console.error("SITE_CONFIG not found.");
        return;
    }


    /* ===============================
       LOAD LATEST VIDEOS
       =============================== */

    async function loadLatestVideos() {

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
                WORKER_URL + "/search?" + params.toString()
            );


            if (!response.ok) {

                throw new Error(
                    "YouTube API request failed: " +
                    response.status
                );

            }


            const data = await response.json();


            console.log(
                "Crazy Indian Parv YouTube Data:",
                data
            );


            return data;


        } catch (error) {

            console.error(
                "YouTube loading error:",
                error
            );

            return {
                items: []
            };

        }

    }


    /* ===============================
       GET VIDEO DETAILS
       =============================== */

    async function getVideoDetails(videoIds) {

        if (!videoIds || videoIds.length === 0) {
            return {
                items: []
            };
        }


        try {

            const params = new URLSearchParams({

                part: "snippet,contentDetails,statistics",

                id: videoIds.join(",")

            });


            const response = await fetch(
                WORKER_URL + "/videos?" + params.toString()
            );


            if (!response.ok) {

                throw new Error(
                    "Video details request failed: " +
                    response.status
                );

            }


            const data = await response.json();


            return data;


        } catch (error) {

            console.error(
                "Video details error:",
                error
            );

            return {
                items: []
            };

        }

    }


    /* ===============================
       MAKE FUNCTIONS AVAILABLE
       =============================== */

    window.CrazyIndianParvYouTube = {

        loadLatestVideos,

        getVideoDetails

    };


})();
