import type { Minister } from './politics';
import type { Bill } from './parliament';

export type MessageSender = 'minister' | 'opposition' | 'faction' | 'foreign_leader' | 'citizen' | 'media' | 'intelligence';

export type MessagePriority = 'urgent' | 'high' | 'normal' | 'low';

export interface BillProposal extends Omit<Bill, 'proposedBy'> {
    proposedBy: 'government'; // Siempre es gobierno cuando viene de un ministro
    ministerId: string; // ID del ministro que propone
    reasoning: string;
    expectedImpact: string;
    estimatedCost?: number;
    requiredSupport?: number;
}

export interface PresidentialMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderType: MessageSender;
    subject: string;
    content: string;
    priority: MessagePriority;
    date: Date;
    read: boolean;
    replied: boolean;
    
    // Opciones específicas según el tipo de mensaje
    billProposals?: BillProposal[];
    meetingRequest?: boolean;
    demandDeadline?: Date;
    
    // Opciones de respuesta disponibles
    responses?: {
        id: string;
        label: string;
        effect?: (state: any) => Partial<any>;
    }[];
}

export interface MessagingState {
    inbox: PresidentialMessage[];
    unreadCount: number;
    archivedMessages: PresidentialMessage[];
}
