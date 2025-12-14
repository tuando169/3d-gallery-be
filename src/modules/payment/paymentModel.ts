export interface OrderUploadModel {
    user_id: string;
    order_code: number;
    amount: number;
    type: string;
    status: string;
    created_at?: string;
    description?: string;
    reference_id?: string;
}

export interface OrderModel {
    id: string
    user_id: string;
    order_code: number;
    amount: number;
    type: string;
    status: string;
    created_at?: string;
    description?: string;
    reference_id?: string;
}