// Types.ts

export interface RolloutResponse {
    success: boolean;
    rolledOutMenu?: any[];
    message?: string;
}

export interface MenuResponse {
    success: boolean;
    menu?: any[];
    message?: string;
}

export interface FeedbackResponse {
    success: boolean;
    itemFeedback?: any[];
    message?: string;
}

export interface DiscardResponse {
    success: boolean;
    discardItems?: any[];
    message?: string;
}

export interface FinalizedMenuResponse {
    success: boolean;
    message?: string;
}

export interface RecommendationResponse {
    success: boolean;
    message?: string;
}

export interface ModifyDiscardListResponse {
    success: boolean;
    message: string;
}
