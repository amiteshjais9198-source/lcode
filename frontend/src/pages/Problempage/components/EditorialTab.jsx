import React, { useState, useEffect } from 'react';
import { Lightbulb, Play, Clock, Loader } from 'lucide-react';
import axiosClient from '../../../utilis/axiosClient';
import VideoPlayer from './VideoPlayer';

const formatDuration = (secs) => {
    if (!secs) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
};

export default function EditorialTab({ problemId }) {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        if (!problemId) return;
        const fetchVideos = async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get(`/video/${problemId}`);
                if (res.data?.success) setVideos(res.data.videos || []);
            } catch (err) {
                console.error('Error fetching editorial videos:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, [problemId]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, opacity: 0.45 }}>
                <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: 14 }}>Loading editorial...</p>
                <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', opacity: 0.45, gap: 12, padding: 32,
            }}>
                <Lightbulb size={48} style={{ opacity: 0.4 }} />
                <p style={{ fontSize: 15, fontWeight: 600 }}>No editorial available yet</p>
                <p style={{ fontSize: 13 }}>Check back later for an official editorial video.</p>
            </div>
        );
    }

    return (
        <div style={{ height: '100%', overflowY: 'auto', padding: '20px' }}>

            {/* Video Player Modal */}
            {activeVideo && (
                <VideoPlayer video={activeVideo} onClose={() => setActiveVideo(null)} />
            )}

            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Lightbulb size={16} style={{ color: '#00b8a3' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#00b8a3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Editorial Video{videos.length > 1 ? 's' : ''}
                </span>
            </div>

            {/* Featured video — first one displayed large */}
            {videos[0] && (
                <div
                    onClick={() => setActiveVideo(videos[0])}
                    style={{
                        position: 'relative', borderRadius: 12, overflow: 'hidden',
                        cursor: 'pointer', marginBottom: 16,
                        border: '1px solid rgba(0,184,163,0.2)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    {/* Thumbnail */}
                    <div style={{ width: '100%', aspectRatio: '16/9', background: '#111', position: 'relative', overflow: 'hidden' }}>
                        {videos[0].thumbnailUrl ? (
                            <img src={videos[0].thumbnailUrl} alt="Editorial thumbnail"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Lightbulb size={40} style={{ opacity: 0.2 }} />
                            </div>
                        )}

                        {/* Play overlay */}
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.4)',
                        }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: '#00b8a3',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 20px rgba(0,184,163,0.5)',
                                transition: 'transform 0.2s',
                            }}>
                                <Play size={22} fill="#fff" color="#fff" style={{ marginLeft: 3 }} />
                            </div>
                        </div>

                        {/* Duration badge */}
                        {videos[0].duration > 0 && (
                            <div style={{
                                position: 'absolute', bottom: 10, right: 10,
                                background: 'rgba(0,0,0,0.7)', borderRadius: 5,
                                padding: '3px 7px', fontSize: 11, fontWeight: 700, color: '#fff',
                                display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                                <Clock size={10} /> {formatDuration(videos[0].duration)}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '12px 14px',
                        background: 'rgba(0,184,163,0.06)',
                        borderTop: '1px solid rgba(0,184,163,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700 }}>Official Video Solution</p>
                            <p style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>Click to watch</p>
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 14px', borderRadius: 7,
                            background: '#00b8a3', color: '#fff',
                            fontSize: 12, fontWeight: 700,
                        }}>
                            <Play size={12} fill="#fff" /> Watch Now
                        </div>
                    </div>
                </div>
            )}

            {/* Additional videos (if any) */}
            {videos.length > 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        More Videos
                    </p>
                    {videos.slice(1).map(video => (
                        <div
                            key={video._id}
                            onClick={() => setActiveVideo(video)}
                            style={{
                                display: 'flex', gap: 12, alignItems: 'center',
                                padding: 10, borderRadius: 9, cursor: 'pointer',
                                border: '1px solid var(--tc-border, rgba(100,110,140,0.18))',
                                background: 'rgba(100,110,140,0.04)',
                                transition: 'border-color 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(0,184,163,0.3)'}
                            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--tc-border, rgba(100,110,140,0.18))'}
                        >
                            <div style={{
                                width: 90, height: 52, borderRadius: 6, overflow: 'hidden',
                                background: '#111', flexShrink: 0, position: 'relative',
                            }}>
                                {video.thumbnailUrl
                                    ? <img src={video.thumbnailUrl} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Play size={16} style={{ opacity: 0.3 }} />
                                    </div>
                                }
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 13, fontWeight: 600 }}>Editorial Video</p>
                                <p style={{ fontSize: 11, opacity: 0.45, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={10} /> {formatDuration(video.duration)}
                                </p>
                            </div>
                            <Play size={16} style={{ opacity: 0.4, flexShrink: 0 }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
