import React from 'react';
import { Play, Trash2, Clock, Video } from 'lucide-react';
import axiosClient from '../../../utilis/axiosClient';

const formatDuration = (secs) => {
    if (!secs) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
};

export default function AdminVideoList({ videos, onPlay, onDeleteSuccess }) {

    const handleDelete = async (videoId) => {
        if (!window.confirm('Are you sure you want to delete this video? This cannot be undone.')) return;
        try {
            await axiosClient.delete(`/video/${videoId}`);
            if (onDeleteSuccess) onDeleteSuccess(videoId);
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    if (videos.length === 0) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '40px 0', opacity: 0.4, gap: 10,
            }}>
                <Video size={36} />
                <p style={{ fontSize: 14, fontWeight: 600 }}>No videos uploaded yet</p>
                <p style={{ fontSize: 12 }}>Upload an editorial video above to get started.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {videos.map((video) => (
                <div
                    key={video._id}
                    style={{
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                        padding: 12, borderRadius: 10,
                        border: '1px solid var(--tc-border, rgba(100,110,140,0.18))',
                        background: 'rgba(100,110,140,0.04)',
                        transition: 'border-color 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(0,184,163,0.3)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--tc-border, rgba(100,110,140,0.18))'}
                >
                    {/* Thumbnail */}
                    <div
                        onClick={() => onPlay(video)}
                        style={{
                            position: 'relative', flexShrink: 0,
                            width: 120, height: 68, borderRadius: 7,
                            overflow: 'hidden', background: 'rgba(0,0,0,0.35)',
                            cursor: 'pointer',
                        }}
                    >
                        {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt="thumbnail"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Video size={22} style={{ opacity: 0.35 }} />
                            </div>
                        )}
                        {/* Play overlay */}
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s',
                        }}
                            onMouseOver={e => e.currentTarget.style.opacity = 1}
                            onMouseOut={e => e.currentTarget.style.opacity = 0}
                        >
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%', background: '#00b8a3',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Play size={13} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Editorial Video</p>
                        <div style={{ display: 'flex', gap: 12, fontSize: 11, opacity: 0.5 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={10} /> {formatDuration(video.duration)}
                            </span>
                            <span>{formatDate(video.createdAt)}</span>
                        </div>
                        <button
                            onClick={() => onPlay(video)}
                            style={{
                                marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '4px 11px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                background: '#00b8a3', border: 'none', color: '#fff', cursor: 'pointer',
                                transition: 'background 0.15s',
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#00a090'}
                            onMouseOut={e => e.currentTarget.style.background = '#00b8a3'}
                        >
                            <Play size={11} fill="#fff" /> Watch
                        </button>
                    </div>

                    {/* Delete */}
                    <button
                        onClick={() => handleDelete(video._id)}
                        title="Delete this video"
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#ff375f', opacity: 0.35, padding: 4,
                            borderRadius: 6, transition: 'opacity 0.15s', flexShrink: 0,
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = 1}
                        onMouseOut={e => e.currentTarget.style.opacity = 0.35}
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            ))}
        </div>
    );
}
