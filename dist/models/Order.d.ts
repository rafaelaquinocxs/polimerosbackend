import mongoose, { Document } from 'mongoose';
export interface IOrderItem {
    product: string;
    quantity: number;
    unitPrice: number;
}
export interface IOrder extends Document {
    orderNumber: string;
    client: string;
    representative: string;
    carrier: string;
    orderDate: Date;
    paymentConditions: string;
    status: string;
    observations?: string;
    items: IOrderItem[];
    totalValue: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Order.d.ts.map