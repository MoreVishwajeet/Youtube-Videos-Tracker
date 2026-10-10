const axios = require("axios");

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";

function handleYouTubeError(error) {
  const apiError = error.response?.data?.error;

  if (!apiError) {
    return {
      status: 500,
      message: "Failed to communicate with YouTube"
    };
  }

  const reason = apiError.errors?.[0]?.reason;

  if (reason === "playlistNotFound") {
    return {
      status: 404,
      message: "Playlist not found"
    };
  }

  if (reason === "keyInvalid") {
    return {
      status: 500,
      message: "YouTube API key is invalid"
    };
  }

  if (reason === "quotaExceeded") {
    return {
      status: 429,
      message: "YouTube API quota exceeded"
    };
  }

  return {
    status: 500,
    message: apiError.message || "YouTube API request failed"
  };
}

async function getPlaylist(playlistId, apiKey) {
    const response = await axios.get(
        `${YOUTUBE_API_URL}/playlists`,
        {
            params: {
                part: "snippet,contentDetails",
                id: playlistId,
                key: apiKey
            }
        }
    );

    return response.data;
}

async function getPlaylistItems(playlistId, apiKey) {
    let videoItems = [];
    let nextPageToken;

    do {
        const response = await axios.get(
            `${YOUTUBE_API_URL}/playlistItems`,
            {
                params: {
                    part: "snippet,contentDetails",
                    playlistId,
                    maxResults: 50,
                    pageToken: nextPageToken,
                    key: apiKey
                }
            }
        );

        videoItems.push(...response.data.items);
        nextPageToken = response.data.nextPageToken;

    } while (nextPageToken);

    return videoItems;
}

async function getVideoDetails(videoIds, apiKey) {
    let allVideoDetails = [];

    for (let i = 0; i < videoIds.length; i += 50) {
        const batch = videoIds.slice(i, i + 50);

        const response = await axios.get(
            `${YOUTUBE_API_URL}/videos`,
            {
                params: {
                    part: "snippet,contentDetails,statistics",
                    id: batch.join(","),
                    key: apiKey
                }
            }
        );

        allVideoDetails.push(...response.data.items);
    }

    return allVideoDetails;
}

module.exports = {
    getPlaylist,
    getPlaylistItems,
    getVideoDetails,
    handleYouTubeError
}