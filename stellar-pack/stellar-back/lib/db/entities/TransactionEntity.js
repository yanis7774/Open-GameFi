"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const core_1 = require("@mikro-orm/core");
const BaseEntity_1 = require("./BaseEntity");
let Transaction = class Transaction extends BaseEntity_1.BaseEntity {
    constructor(transactionId, publicId, username, amount) {
        super();
        this.pending = true;
        this.success = false;
        this.errorLog = "";
        this.to = "";
        this.transactionId = transactionId;
        this.publicId = publicId;
        this.amount = amount;
        this.username = username;
    }
};
exports.Transaction = Transaction;
__decorate([
    (0, core_1.Property)({ type: 'string' })
], Transaction.prototype, "transactionId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'string' })
], Transaction.prototype, "publicId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'string' })
], Transaction.prototype, "username", void 0);
__decorate([
    (0, core_1.Property)({ type: 'number' })
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, core_1.Property)({ type: 'boolean' })
], Transaction.prototype, "pending", void 0);
__decorate([
    (0, core_1.Property)({ type: 'boolean' })
], Transaction.prototype, "success", void 0);
__decorate([
    (0, core_1.Property)({ type: 'string' })
], Transaction.prototype, "errorLog", void 0);
__decorate([
    (0, core_1.Property)({ type: 'string' })
], Transaction.prototype, "to", void 0);
exports.Transaction = Transaction = __decorate([
    (0, core_1.Entity)()
], Transaction);
