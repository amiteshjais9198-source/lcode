import React from 'react';
import { DifficultyBadge, TagBadge } from './Badges';

export default function DescriptionTab({ problem }) {
    if (!problem) return <div className="p-6 text-base-content/50">Loading...</div>;
    return (
        <div style={{ padding: '24px 20px', overflowY: 'auto', height: '100%' }}>
            {/* Title + Difficulty */}
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>
                {problem.title}
            </h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <DifficultyBadge difficulty={problem.difficulty} />
                {problem.tags?.map(tag => <TagBadge key={tag} tag={tag} />)}
            </div>

            {/* Description */}
            <div style={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--tw-text-opacity, inherit)', whiteSpace: 'pre-wrap', marginBottom: 24 }}>
                {problem.description}
            </div>

            {/* Visible Test Cases */}
            {problem.visibleTestCases?.length > 0 && (
                <div>
                    <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Examples</h3>
                    {problem.visibleTestCases.map((tc, i) => (
                        <div key={i} style={{
                            background: 'var(--tc-bg, rgba(100,110,140,0.08))',
                            border: '1px solid var(--tc-border, rgba(100,110,140,0.18))',
                            borderRadius: 8, padding: '14px 16px', marginBottom: 12
                        }}>
                            <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, opacity: 0.7 }}>Example {i + 1}</p>
                            <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ fontWeight: 600, opacity: 0.8, marginBottom: 2 }}>Input:</div>
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{tc.input}</div>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ fontWeight: 600, opacity: 0.8, marginBottom: 2 }}>Output:</div>
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{tc.output}</div>
                                </div>
                                {tc.explanation && (
                                    <div style={{ marginTop: 6, opacity: 0.75, fontSize: 12.5, fontFamily: 'sans-serif' }}>
                                        <span style={{ fontWeight: 600 }}>Explanation:&nbsp;</span>{tc.explanation}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
