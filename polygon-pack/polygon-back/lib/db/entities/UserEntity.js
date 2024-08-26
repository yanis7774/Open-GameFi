"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const core_1 = require("@mikro-orm/core");
const BaseEntity_1 = require("./BaseEntity");
let User = class User extends BaseEntity_1.BaseEntity {
    constructor(username, publicId, password, secretId, mnemonic) {
        super();
        this.lastPresence = new Date();
        this.currency = 0;
        this.generators = 0;
        this.reward = 0;
        this.nft = false;
        this.publicId = publicId;
        this.username = username;
        this.password = password;
        this.secretId = secretId;
        this.mnemonic = mnemonic;
    }
};
exports.User = User;
__decorate([
    (0, core_1.Property)({ type: 'string' })
], User.prototype, "username", void 0);
__decorate([
    (0, core_1.Property)({ type: 'string' })
], User.prototype, "password", void 0);
__decorate([
    (0, core_1.Property)({ type: 'string' })
], User.prototype, "publicId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'string' })
], User.prototype, "secretId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'string' })
], User.prototype, "mnemonic", void 0);
__decorate([
    (0, core_1.Property)({ type: 'date' })
], User.prototype, "lastPresence", void 0);
__decorate([
    (0, core_1.Property)({ type: 'number' })
], User.prototype, "currency", void 0);
__decorate([
    (0, core_1.Property)({ type: 'number' })
], User.prototype, "generators", void 0);
__decorate([
    (0, core_1.Property)({ type: 'number' })
], User.prototype, "reward", void 0);
__decorate([
    (0, core_1.Property)({ type: 'boolean' })
], User.prototype, "nft", void 0);
exports.User = User = __decorate([
    (0, core_1.Entity)()
], User);
