"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigSetting = void 0;
const core_1 = require("@mikro-orm/core");
const BaseEntity_1 = require("./BaseEntity");
let ConfigSetting = class ConfigSetting extends BaseEntity_1.BaseEntity {
    constructor(configName, value) {
        super();
        this.configName = configName;
        this.value = value;
    }
};
exports.ConfigSetting = ConfigSetting;
__decorate([
    (0, core_1.Property)({ type: 'string' })
], ConfigSetting.prototype, "configName", void 0);
__decorate([
    (0, core_1.Property)({ type: 'any' })
], ConfigSetting.prototype, "value", void 0);
exports.ConfigSetting = ConfigSetting = __decorate([
    (0, core_1.Entity)()
], ConfigSetting);
