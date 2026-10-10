import NavComp from "../utils/nav";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import { useEffect, useState } from "react";
//custom imports
import formatDuration from "../utils/formatDuration";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";


function PlaylistTracker() {
  const { token, logout } = useAuth();
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("playlist");
  const [watchedVideos, setWatchedVideos] = useState([]);

  const storageKey = data
    ? `youtube-tracker-watched-${data.playlist.id}`
    : null;  

  async function analyzePlaylist() {
    setError("");
    setData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/playlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        setError(result.error);
        return;
      }
      console.log("API RESULT:", result);
      setData(result);

      setSelectedVideo(result.videos[0] || null);
    } catch (error) {
      setError("Unable to connect to server");
    }
  }

  function toggleWatched(videoId) {
    setWatchedVideos(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId);
      }
      return [...prev, videoId];
    });
  }

  function markAllWatched() {
    if (!data) return;

    setWatchedVideos(data.videos.map(video => video.id));
  }

  function clearProgress() {
    setWatchedVideos([]);
  }

  const filteredVideos = data
    ? [...data.videos]
        .filter(video =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          if (sortBy === "views") {
            return b.views - a.views;
          }

          if (sortBy === "duration") {
            return b.durationSeconds - a.durationSeconds;
          }

          return 0;
        })
    : [];


  const watchProgress =
    data && data.videos.length > 0
      ? (watchedVideos.length / data.videos.length) * 100
      : 0;

  useEffect(() => {
    if (!data) return;

    const key = `youtube-tracker-watched-${data.playlist.id}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      setWatchedVideos(JSON.parse(saved));
    } else {
      setWatchedVideos([]);
    }
  }, [data]);

  useEffect(() => {
    if (!data) return;

    const key = `youtube-tracker-watched-${data.playlist.id}`;

    localStorage.setItem(
      key,
      JSON.stringify(watchedVideos)
    );
  }, [watchedVideos, data]);


  return (
    <div className="home-container">
      <NavComp/>

      <h1 className="title">YouTube Playlist Tracker</h1>

      <input
        className="url-input"
        type="text"
        placeholder="Paste YouTube playlist URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button className="analyse-btn" onClick={analyzePlaylist}>
        Analyze
      </button>

      {error && <p>{error}</p>}

{data && (
  <div className="container-fluid mt-4">

    <h2 className="mb-4">
      {data.playlist.title}
    </h2>

    <div className="row g-4">

      {/* Stats */}
      <div className="col-lg-3">
        <div className="card h-100">
          <div className="card-body">

            <h4>Playlist Stats</h4>

            <hr />

            <p>
              <strong>Videos:</strong>{" "}
              {data.playlist.totalVideos}
            </p>

            <p>
              <strong>Watch time:</strong>{" "}
              {formatDuration(data.stats.totalTime)}
            </p>

            <p>
              <strong>Average:</strong>{" "}
              {formatDuration(data.stats.averageSeconds)}
            </p>

            <p>
              <strong>Most viewed:</strong>{" "}
              {data.stats.mostViewedVideo?.title || "N/A"}
            </p>

          </div>
        </div>
      </div>


      {/* Current Video */}
      <div className="col-lg-6">
        <div className="card h-100">
          <div className="card-body">

            <h4>Current Video</h4>

            {selectedVideo ? (
              <>
                <div className="ratio ratio-16x9 mb-3">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.id}`}
                    title={selectedVideo.title}
                    allowFullScreen
                  />
                </div>

                <h5>{selectedVideo.title}</h5>

                <p className="text-muted">
                  {formatDuration(selectedVideo.durationSeconds)}
                  {" • "}
                  {selectedVideo.views.toLocaleString()} views
                </p>
              </>
            ) : (
              <p>No video selected.</p>
            )}

            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Watch progress</span>
                <span>{Math.round(watchProgress)}%</span>
              </div>

              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${watchProgress}%` }}
                  aria-valuenow={watchProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>

              <small className="text-muted">
                {watchedVideos.length} / {data.videos.length} videos watched
              </small>
            </div>

            <div className="d-flex gap-2 mb-3">
              <button
                className="btn btn-sm btn-success"
                onClick={markAllWatched}
              >
                Mark all watched
              </button>

              <button
                className="btn btn-sm btn-outline-danger"
                onClick={clearProgress}
              >
                Clear progress
              </button>
            </div>

          </div>
        </div>
      </div>


      {/* Video List */}
      <div className="col-lg-3">
        <div className="card h-100">
          <div className="card-body">

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="form-select mb-3"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="playlist">Playlist order</option>
              <option value="views">Most viewed</option>
              <option value="duration">Longest videos</option>
            </select>

            <h4>Videos</h4>

            <p className="text-muted">
              {watchedVideos.length} / {data.videos.length} watched
            </p>

            <div
              className="list-group"
              style={{ maxHeight: "600px", overflowY: "auto" }}
            >

              {filteredVideos.map((video, index) => (
                <button
                  key={video.id}
                  className={`list-group-item list-group-item-action ${
                    selectedVideo?.id === video.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setSelectedVideo(video)}
                >
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={watchedVideos.includes(video.id)}
                    onChange={() => toggleWatched(video.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="fw-bold">
                    {index + 1}. {video.title}
                  </div>

                  <small>
                    {formatDuration(video.durationSeconds)}
                  </small>
                </button>
              ))}

            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
)}

    </div>
  );
}

export default PlaylistTracker;