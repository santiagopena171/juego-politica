import { useGame } from '../context/GameContext';
import { X } from 'lucide-react';

export const NotificationTray = () => {
    const { state, dispatch } = useGame();
    const { notifications } = state;

    if (notifications.length === 0) return null;

    const handleOpen = (id: string) => {
        dispatch({ type: 'OPEN_NOTIFICATION', payload: id });
    };

    const handleDismiss = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        dispatch({ type: 'DISMISS_NOTIFICATION', payload: id });
    };

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-50">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    onClick={() => handleOpen(notif.id)}
                    className={`
            relative group cursor-pointer p-2 rounded-full shadow-lg border-2 transition-all hover:scale-110
            ${notif.type === 'event' ? 'bg-amber-900 border-amber-500 text-amber-100' :
                            notif.type === 'warning' ? 'bg-red-900 border-red-500 text-red-100' :
                                'bg-blue-900 border-blue-500 text-blue-100'}
          `}
                    title={notif.title}
                >
                    <span className="text-xl">{notif.icon || '🔔'}</span>

                    {/* Dismiss Button (visible on hover) */}
                    <button
                        onClick={(e) => handleDismiss(e, notif.id)}
                        className="absolute -top-1 -right-1 bg-slate-800 text-slate-400 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white hover:bg-red-600"
                    >
                        <X className="w-3 h-3" />
                    </button>

                    {/* Tooltip */}
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-slate-200 text-xs p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        <p className="font-bold mb-1">{notif.title}</p>
                        <p>{notif.message}</p>
                        <p className="text-slate-500 mt-1">{notif.date.toLocaleDateString()}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
