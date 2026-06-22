import React from 'react';
import { X } from 'lucide-react';

export default function VideoPlayer({ video, onClose }) {
    if (!video) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.88)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 24,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    position: 'relative', width: '100%', maxWidth: 880,
                    borderRadius: 14, overflow: 'hidden', background: '#000',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: 12, right: 12, zIndex: 10,
                        background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%',
                        width: 38, height: 38, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', color: '#fff',
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    <X size={18} />
                </button>

                {/* Video player */}
                <video
                    key={video._id}
                    src={video.secureUrl}
                    controls
                    autoPlay
                    style={{ width: '100%', maxHeight: '70vh', display: 'block' }}
                />

                {/* Footer */}
                <div style={{ padding: '12px 18px', background: '#111' }}>
                    <p style={{ fontSize: 13, color: '#ddd', fontWeight: 600 }}>
                        Editorial Solution Video
                    </p>
                    <p style={{ fontSize: 12, color: '#666', marginTop: 3 }}>
                        Uploaded on {formatDate(video.createdAt)}
                    </p>
                </div>
            </div>
        </div>
    );
}
