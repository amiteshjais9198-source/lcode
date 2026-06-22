import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import axiosClient from '../../../utilis/axiosClient';

export default function AdminUpload({ problemId, onUploadSuccess }) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef(null);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            setUploadError('Please select a valid video file.');
            return;
        }
        if (file.size > 200 * 1024 * 1024) {
            setUploadError('File size must be under 200MB.');
            return;
        }

        setUploadError('');
        setUploading(true);
        setUploadProgress(0);

        try {
            // Step 1: Get secure upload signature from backend
            const sigRes = await axiosClient.post('/video/generate-signature');
            const { signature, timestamp, cloudName, apiKey, folder } = sigRes.data;

            // Step 2: Upload directly to Cloudinary with XHR for progress tracking
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', folder);
            formData.append('resource_type', 'video');

            const cloudRes = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        setUploadProgress(Math.round((event.loaded / event.total) * 100));
                    }
                };
                xhr.onload = () => {
                    if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
                    else reject(new Error('Cloudinary upload failed'));
                };
                xhr.onerror = () => reject(new Error('Network error during upload'));
                xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
                xhr.send(formData);
            });

            // Step 3: Save metadata to MongoDB via backend
            await axiosClient.post('/video/save', {
                problemId,
                cloudinaryPublicId: cloudRes.public_id,
                secureUrl: cloudRes.secure_url,
                thumbnailUrl: cloudRes.secure_url
                    .replace('/upload/', '/upload/so_0,w_480,h_270,c_fill/')
                    .replace(/\.[^.]+$/, '.jpg'),
                duration: Math.round(cloudRes.duration || 0),
            });

            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            console.error('Upload error:', err);
            setUploadError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <input
                type="file"
                accept="video/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleUpload}
                id="admin-video-upload"
            />

            {uploading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.65 }}>
                        <span>Uploading to Cloudinary...</span>
                        <span style={{ fontWeight: 700 }}>{uploadProgress}%</span>
                    </div>
                    <div style={{
                        height: 7, borderRadius: 6,
                        background: 'rgba(100,110,140,0.2)', overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%', borderRadius: 6,
                            background: 'linear-gradient(90deg, #00b8a3, #00e5cf)',
                            width: `${uploadProgress}%`,
                            transition: 'width 0.3s ease',
                        }} />
                    </div>
                    <p style={{ fontSize: 11, opacity: 0.5 }}>Do not close this tab during upload.</p>
                </div>
            ) : (
                <label
                    htmlFor="admin-video-upload"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '11px 16px', borderRadius: 8, cursor: 'pointer',
                        border: '1.5px dashed rgba(0,184,163,0.45)',
                        color: '#00b8a3', fontSize: 13, fontWeight: 600,
                        background: 'rgba(0,184,163,0.05)',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.background = 'rgba(0,184,163,0.12)';
                        e.currentTarget.style.borderColor = 'rgba(0,184,163,0.7)';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.background = 'rgba(0,184,163,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(0,184,163,0.45)';
                    }}
                >
                    <Upload size={15} />
                    Upload Editorial Video
                </label>
            )}

            {uploadError && (
                <p style={{ fontSize: 12, color: '#ff375f', marginTop: 8 }}>{uploadError}</p>
            )}
        </div>
    );
}
