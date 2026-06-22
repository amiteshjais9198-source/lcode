import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

export const LANGUAGES = [
    { id: 'python',     label: 'Python',     monacoLang: 'python'     },
    { id: 'c++',        label: 'C++',        monacoLang: 'cpp'        },
    { id: 'java',       label: 'Java',       monacoLang: 'java'       },
];

export const DIFFICULTY_CONFIG = {
    easy:   { color: '#00b8a3', bg: 'rgba(0,184,163,0.12)'  },
    medium: { color: '#ffc01e', bg: 'rgba(255,192,30,0.12)' },
    hard:   { color: '#ff375f', bg: 'rgba(255,55,95,0.12)'  },
};

export const STATUS_CONFIG = {
    accepted: { icon: CheckCircle2, color: '#00b8a3', label: 'Accepted'     },
    wrong:    { icon: XCircle,      color: '#ff375f', label: 'Wrong Answer'  },
    error:    { icon: AlertCircle,  color: '#ffc01e', label: 'Error'         },
    pending:  { icon: Clock,        color: '#a0aec0', label: 'Pending'       },
};
