import React from 'react';
import { Users } from 'lucide-react';

export default function SolutionsTab() {
    return (
        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
            <Users size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
            <p style={{ fontSize: 16, fontWeight: 600 }}>No community solutions yet</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Be the first to share your solution!</p>
        </div>
    );
}
