"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorEntry = void 0;
const core_1 = require("@mikro-orm/core");
const BaseEntity_1 = require("./BaseEntity");
let ErrorEntry = class ErrorEntry extends BaseEntity_1.BaseEntity {
    constructor(tgId, username, error, data) {
        super();
        this.publicId = tgId;
        this.username = username;
        this.error = error;
        this.data = data;
    }
};
exports.ErrorEntry = ErrorEntry;
__decorate([
    (0, core_1.Property)({ type: 'string' })
], ErrorEntry.prototype, "publicId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'string' })
], ErrorEntry.prototype, "username", void 0);
__decorate([
    (0, core_1.Property)({ type: 'string' })
], ErrorEntry.prototype, "error", void 0);
__decorate([
    (0, core_1.Property)({ type: 'object' })
], ErrorEntry.prototype, "data", void 0);
exports.ErrorEntry = ErrorEntry = __decorate([
    (0, core_1.Entity)()
], ErrorEntry);
