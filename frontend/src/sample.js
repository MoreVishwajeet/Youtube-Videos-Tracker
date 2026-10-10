<div
  className={`list-group-item list-group-item-action ${
    selectedVideo?.id === video.id ? "active" : ""
  }`}
  onClick={() => setSelectedVideo(video)}
>
  <div className="d-flex align-items-center">
    <input
      type="checkbox"
      className="form-check-input me-2"
      checked={watchedVideos.includes(video.id)}
      onChange={() => toggleWatched(video.id)}
      onClick={(e) => e.stopPropagation()}
    />

    <div>
      <div className="fw-bold">
        {video.title}
      </div>

      <small>
        {formatDuration(video.durationSeconds)}
      </small>
    </div>
  </div>
</div>