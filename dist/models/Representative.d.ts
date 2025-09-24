import mongoose, { Document } from 'mongoose';
export interface IRepresentative extends Document {
    name: string;
    cnpj: string;
    contact?: string;
    phone?: string;
    email?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IRepresentative, {}, {}, {}, mongoose.Document<unknown, {}, IRepresentative, {}, {}> & IRepresentative & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Representative.d.ts.map