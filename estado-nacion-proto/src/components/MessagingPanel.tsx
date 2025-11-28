import { useState } from 'react';
import * as React from 'react';
import { useGame } from '../context/GameContext';
import { 
    Mail, MailOpen, Archive, Clock, AlertCircle, CheckCircle, X,
    FileText, User, Users, Globe, Newspaper, Shield
} from 'lucide-react';
import type { PresidentialMessage, MessageSender } from '../types/messaging';

const SENDER_ICONS: Record<MessageSender, typeof Mail> = {
    'minister': FileText,
    'opposition': Users,
    'faction': User,
    'foreign_leader': Globe,
    'citizen': User,
    'media': Newspaper,
    'intelligence': Shield
};

const PRIORITY_COLORS = {
    'urgent': 'border-l-rose-500 bg-rose-500/5',
    'high': 'border-l-amber-500 bg-amber-500/5',
    'normal': 'border-l-cyan-500 bg-cyan-500/5',
    'low': 'border-l-slate-500 bg-slate-500/5'
};

const PRIORITY_LABELS = {
    'urgent': 'URGENTE',
    'high': 'ALTA',
    'normal': 'NORMAL',
    'low': 'BAJA'
};

export const MessagingPanel = () => {
    const { state, dispatch } = useGame();
    const messages = state.messaging?.inbox || [];
    const [selectedMessage, setSelectedMessage] = useState<PresidentialMessage | null>(null);
    const [filter, setFilter] = useState<'all' | 'unread' | 'minister'>('all');

    const filteredMessages = messages.filter(msg => {
        if (filter === 'unread') return !msg.read;
        if (filter === 'minister') return msg.senderType === 'minister';
        return true;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());

    const handleSelectMessage = (message: PresidentialMessage) => {
        setSelectedMessage(message);
        if (!message.read) {
            dispatch({ type: 'MARK_MESSAGE_READ', payload: message.id });
        }
    };

    const handleProposeBill = (billProposal: any) => {
        dispatch({ type: 'PROPOSE_BILL', payload: { bill: billProposal } });
        dispatch({ type: 'REPLY_TO_MESSAGE', payload: { 
            messageId: selectedMessage!.id, 
            response: 'accept_proposal' 
        }});
        setSelectedMessage(null);
    };

    const handleRejectProposal = () => {
        if (selectedMessage) {
            dispatch({ type: 'REPLY_TO_MESSAGE', payload: { 
                messageId: selectedMessage.id, 
                response: 'reject_proposal' 
            }});
            setSelectedMessage(null);
        }
    };

    const handleArchive = (messageId: string) => {
        dispatch({ type: 'ARCHIVE_MESSAGE', payload: messageId });
        if (selectedMessage?.id === messageId) {
            setSelectedMessage(null);
        }
    };

    const formatDate = (date: Date) => {
        const now = state.time.date;
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Hoy';
        if (days === 1) return 'Ayer';
        if (days < 7) return `Hace ${days} días`;
        return new Intl.DateTimeFormat('es-ES', { 
            day: 'numeric', 
            month: 'short' 
        }).format(date);
    };

    return (
        <div className="glass-panel p-6 h-[calc(100vh-200px)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3">
                        <Mail className="w-7 h-7 text-cyan-400" />
                        Mensajes Presidenciales
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        {state.messaging?.unreadCount || 0} mensajes sin leer
                    </p>
                </div>

                {/* Filtros */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === 'all'
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === 'unread'
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        No leídos
                    </button>
                    <button
                        onClick={() => setFilter('minister')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === 'minister'
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        Ministros
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
                {/* Lista de mensajes */}
                <div className="col-span-1 glass-panel-light overflow-y-auto space-y-2 p-3">
                    {filteredMessages.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No hay mensajes</p>
                        </div>
                    ) : (
                        filteredMessages.map(message => {
                            const SenderIcon = SENDER_ICONS[message.senderType];
                            const isSelected = selectedMessage?.id === message.id;
                            
                            return (
                                <button
                                    key={message.id}
                                    onClick={() => handleSelectMessage(message)}
                                    className={`w-full text-left p-4 rounded-lg border-l-4 transition-all ${
                                        PRIORITY_COLORS[message.priority]
                                    } ${
                                        isSelected
                                            ? 'bg-cyan-500/20 border-l-cyan-400'
                                            : 'hover:bg-white/5'
                                    } ${
                                        !message.read ? 'font-semibold' : 'opacity-75'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <SenderIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                                            <span className="text-sm text-white truncate">
                                                {message.senderName}
                                            </span>
                                        </div>
                                        {!message.read && (
                                            <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0" />
                                        )}
                                    </div>
                                    
                                    <h3 className="text-sm text-white mb-1 truncate">
                                        {message.subject}
                                    </h3>
                                    
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span className="uppercase">{PRIORITY_LABELS[message.priority]}</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(message.date)}
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Detalle del mensaje */}
                <div className="col-span-2 glass-panel-light overflow-y-auto p-6">
                    {!selectedMessage ? (
                        <div className="h-full flex items-center justify-center text-slate-400">
                            <div className="text-center">
                                <MailOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">Selecciona un mensaje para leer</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Header del mensaje */}
                            <div className="border-b border-white/10 pb-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            {React.createElement(SENDER_ICONS[selectedMessage.senderType], {
                                                className: 'w-5 h-5 text-cyan-400'
                                            })}
                                            <h2 className="font-display text-2xl font-bold text-white">
                                                {selectedMessage.subject}
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-400">
                                            <span>De: <span className="text-white">{selectedMessage.senderName}</span></span>
                                            <span>•</span>
                                            <span>{formatDate(selectedMessage.date)}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                selectedMessage.priority === 'urgent' ? 'bg-rose-500/20 text-rose-400' :
                                                selectedMessage.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-cyan-500/20 text-cyan-400'
                                            }`}>
                                                {PRIORITY_LABELS[selectedMessage.priority]}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleArchive(selectedMessage.id)}
                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                        title="Archivar"
                                    >
                                        <Archive className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="prose prose-invert max-w-none">
                                <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                                    {selectedMessage.content}
                                </p>
                            </div>

                            {/* Propuestas de ley */}
                            {selectedMessage.billProposals && selectedMessage.billProposals.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-display text-xl font-bold text-white border-b border-amber-400/30 pb-2">
                                        Proyectos de Ley Propuestos
                                    </h3>
                                    {selectedMessage.billProposals.map((bill, index) => (
                                        <div key={bill.id} className="glass-panel-light p-5 border-l-4 border-l-amber-400">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-display text-lg font-bold text-white mb-1">
                                                        {index + 1}. {bill.title}
                                                    </h4>
                                                    <p className="text-sm text-slate-300 mb-3">
                                                        {bill.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Detalles */}
                                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                <div>
                                                    <span className="text-slate-400">Justificación:</span>
                                                    <p className="text-slate-200 italic">"{bill.reasoning}"</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Impacto Esperado:</span>
                                                    <p className="text-slate-200">{bill.expectedImpact}</p>
                                                </div>
                                            </div>

                                            {bill.estimatedCost && (
                                                <div className="flex items-center gap-2 text-sm mb-3">
                                                    <AlertCircle className="w-4 h-4 text-amber-400" />
                                                    <span className="text-slate-400">
                                                        Costo estimado: <span className="text-amber-400 font-bold">${bill.estimatedCost}B</span>
                                                    </span>
                                                </div>
                                            )}

                                            {/* Botones de acción */}
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleProposeBill(bill)}
                                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Aprobar y Enviar al Parlamento
                                                </button>
                                                <button
                                                    onClick={handleRejectProposal}
                                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Rechazar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Respuestas personalizadas */}
                            {selectedMessage.responses && selectedMessage.responses.length > 0 && !selectedMessage.replied && (
                                <div className="space-y-3">
                                    <h3 className="font-medium text-white">Opciones de respuesta:</h3>
                                    <div className="grid gap-2">
                                        {selectedMessage.responses.map(response => (
                                            <button
                                                key={response.id}
                                                onClick={() => {
                                                    dispatch({ 
                                                        type: 'REPLY_TO_MESSAGE', 
                                                        payload: { 
                                                            messageId: selectedMessage.id, 
                                                            response: response.id 
                                                        }
                                                    });
                                                    setSelectedMessage(null);
                                                }}
                                                className="w-full text-left p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all border border-slate-600 hover:border-cyan-400"
                                            >
                                                <span className="text-white font-medium">{response.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedMessage.replied && (
                                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">Ya has respondido a este mensaje</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
