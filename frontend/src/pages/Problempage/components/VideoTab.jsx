import React, { useState, useEffect } from 'react';
import { Loader, ShieldOff } from 'lucide-react';
import { useSelector } from 'react-redux';
import axiosClient from '../../../utilis/axiosClient';
import AdminUpload from './AdminUpload';
import AdminVideoList from './AdminVideoList';
import VideoPlayer from './VideoPlayer';

export default function VideoTab({ problemId }) {
    const user = useSelector((state) => state.auth.user);
    const isAdmin = user?.role === 'admin';

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/video/${problemId}`);
            if (res.data?.success) setVideos(res.data.videos || []);
        } catch (err) {
            console.error('Error fetching videos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (problemId) fetchVideos();
    }, [problemId]);

    const handleDeleteSuccess = (deletedId) => {
        setVideos(prev => prev.filter(v => v._id !== deletedId));
        if (activeVideo?._id === deletedId) setActiveVideo(null);
    };

    // Block access if not admin
    if (!isAdmin) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', opacity: 0.45, gap: 12, padding: 32,
            }}>
                <ShieldOff size={44} style={{ opacity: 0.4 }} />
                <p style={{ fontSize: 15, fontWeight: 600 }}>Admin Access Only</p>
                <p style={{ fontSize: 13, textAlign: 'center' }}>
                    This section is restricted to administrators.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, opacity: 0.5 }}>
                <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: 14 }}>Loading...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* Video player modal */}
            {activeVideo && (
                <VideoPlayer video={activeVideo} onClose={() => setActiveVideo(null)} />
            )}

            {/* Upload section — Admin only */}
            <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--tc-border, rgba(100,110,140,0.18))',
                flexShrink: 0,
            }}>
                <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.45, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Admin — Upload Editorial Video
                </p>
                <AdminUpload problemId={problemId} onUploadSuccess={fetchVideos} />
            </div>

            {/* Uploaded videos list — Admin can view + delete */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.45, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Uploaded Videos ({videos.length})
                </p>
                <AdminVideoList
                    videos={videos}
                    onPlay={setActiveVideo}
                    onDeleteSuccess={handleDeleteSuccess}
                />
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
