// Types.ts

export interface MenuResponse {
    success: boolean;
    menu?: any[];
    message?: string;
    userId?: string;
}

export interface FeedbackResponse {
    success: boolean;
    feedbacks?: any[];
    message?: string;
    userId?: string;
}

export interface NotificationResponse {
    success: boolean;
    notifications?: any[];
    message?: string;
    userId?: string;
}

export interface FinalListResponse {
    success: boolean;
    finalList?: any[];
    message?: string;
    userId?: string;
}

export interface RolloutResponse {
    success: boolean;
    rollOutData?: any[];
    message?: string;
    userId?: string;
}

export interface FeedbackSubmissionResponse {
    success: boolean;
    feedBack?: any;
    message?: string;
    userId?: string;
}

export interface DiscardResponse {
    success: boolean;
    discardedItems?: any[];
    message?: string;
    userId?: string;
}

export interface GiveDiscardResponse {
    success: boolean;
    message?: string;
    userId?: string;
}

export interface VoteForMenuResponse {
    success: boolean;
    message?: string;
    userId?: string;
}

export interface CreateProfileResponse {
    success: boolean;
    message?: string;
    userId?: string;
}

export interface RecipeSubmissionResponse {
    success: boolean;
    message?: string;
    userId?: string;
}
