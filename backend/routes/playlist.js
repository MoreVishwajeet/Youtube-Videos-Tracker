const express = require("express");
const route = express.Router();

const {parseDuration} = require("../utensils/Duration-parser");
const {extractPlaylistId} = require("../utensils/extractPlaylistId")
const {
    getPlaylist,
    getPlaylistItems,
    getVideoDetails,
    handleYouTubeError
} = require("../services/youtube")
const authenticateToken = require("../middleware/auth");


route.get("/" ,(req, res) => {
    res.send("Hello from YouTube Playlist Tracker!, from server, this is home page");
});

route.post("/playlist", authenticateToken, async (req, res) => {
    const { url } = req.body;
    if(!url) {
        return res.status(400).json({error : "Playlist URL is required"
        });
    }

    let playlistId = extractPlaylistId(url);

    if (!playlistId) {
        return res.status(400).json({
            error: "Playlist ID not found"
        });
    }


    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const playlistResponse = await getPlaylist(playlistId, apiKey);

        const videoItems = await getPlaylistItems(playlistId, apiKey);

        const videoIds = videoItems.map(item => item.contentDetails.videoId);

        let allVideoDetails = await getVideoDetails(videoIds, apiKey);
        //extracting required info from complete api data
        const playlist = await playlistResponse.items[0];
        const videos = allVideoDetails.map(video => {
            const durationSeconds = parseDuration(video.contentDetails.duration);

            return {
                id: video.id,
                title: video.snippet.title,
                duration: video.contentDetails.duration,
                durationSeconds,
                views: Number(video.statistics?.viewCount || 0)
            };

        });
        //calculating total time
        const totalSeconds = videos.reduce((total, video) => total + video.durationSeconds, 0)
        //Calculating average duration
        const averageSeconds = videos.length > 0 ?  totalSeconds / videos.length : 0;
        //Most viewed video
        let mostViewedVideo = null;
        if (videos.length > 0) {
            mostViewedVideo = videos.reduce((mostViewed, video) =>
                video.views > mostViewed.views ? video : mostViewed
            );
        }
        res.json({
            playlist : {
                id : playlist.id,
                title: playlist.snippet.title,
                totalVideos: playlist.contentDetails.itemCount
            }, 
            stats : {
                totalTime : totalSeconds,
                averageSeconds,
                mostViewedVideo : mostViewedVideo,
            },
            videos
        });
    } catch (error) {
        console.error(error.response?.data || error.message);

        const apiError = handleYouTubeError(error);

        res.status(apiError.status).json({
            error: apiError.message
        });
    }
});

module.exports = route;



