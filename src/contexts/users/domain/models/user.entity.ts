import { Transaction } from "../../../transactions/domain/models/transaction.entity";

export class User {
    constructor(
        public userId: number,
        public username: string,
        public email: string,
        public password?: string,
        public roles?: string[],
        public address?: string,
        public phone?: string,
        public transactions?: Transaction[],
        public createdAt?: Date,
        public updatedAt?: Date,
    ) { }
}