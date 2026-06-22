export const getStartCode = (problem, langId) => {
    if (!problem?.startCode) return '// Start coding here...\n';
    const found = problem.startCode.find(sc => sc.language === langId);
    return found?.initialCode || '// Start coding here...\n';
};

export const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};
