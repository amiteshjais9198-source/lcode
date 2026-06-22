import React from 'react';
import { DIFFICULTY_CONFIG, STATUS_CONFIG } from '../constants';

export function DifficultyBadge({ difficulty }) {
    const cfg = DIFFICULTY_CONFIG[difficulty?.toLowerCase()] || {};
    return (
        <span style={{ color: cfg.color, backgroundColor: cfg.bg, padding: '2px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
            {difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : ''}
        </span>
    );
}

export function TagBadge({ tag }) {
    return (
        <span style={{
            background: 'var(--tag-bg, rgba(100,110,140,0.15))',
            color: 'var(--tag-color, #a0aec0)',
            padding: '2px 10px', borderRadius: 12, fontSize: 12
        }}>
            {tag}
        </span>
    );
}

export function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: cfg.color, fontWeight: 600, fontSize: 13 }}>
            <Icon size={14} /> {cfg.label}
        </span>
    );
}
