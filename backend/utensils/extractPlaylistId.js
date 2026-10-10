function extractPlaylistId(url) {
  try {
    const playlistId = new URL(url).searchParams.get("list");

    if (!playlistId) {
      return null;
    }

    return playlistId;
  } catch {
    return null;
  }
}

module.exports = {
  extractPlaylistId
};