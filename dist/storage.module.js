"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StorageEngineModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageEngineModule = void 0;
const common_1 = require("@nestjs/common");
const providerNames_1 = require("./constants/providerNames");
const storageEngine_types_1 = require("./interfaces/storageEngine.types");
const GoogleCloudStorage_1 = require("./providers/GoogleCloudStorage");
const LocalStorage_1 = require("./providers/LocalStorage");
const storage_service_1 = require("./storage.service");
let StorageEngineModule = StorageEngineModule_1 = class StorageEngineModule {
    static createAsyncOptionsProvider(options) {
        return {
            provide: providerNames_1.STORAGE_CONFIG_MODULE_OPTIONS,
            useFactory: options.useFactory,
            inject: options.inject || [],
        };
    }
    static createAsyncProviders(options) {
        if (options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        return [];
    }
    static register(config) {
        return {
            module: StorageEngineModule_1,
            providers: [
                {
                    provide: providerNames_1.STORAGE_CONFIG,
                    useValue: config,
                },
            ],
        };
    }
    static registerAsync(options) {
        return {
            module: StorageEngineModule_1,
            imports: options.imports,
            providers: [
                ...this.createAsyncProviders(options),
                {
                    provide: providerNames_1.STORAGE_CONFIG,
                    useFactory: (config) => config,
                    inject: [providerNames_1.STORAGE_CONFIG_MODULE_OPTIONS],
                },
                ...(options.extraProviders || []),
            ],
        };
    }
};
StorageEngineModule = StorageEngineModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [storage_service_1.StorageEngineService,
            {
                provide: providerNames_1.PROVIDER_ENGINE_NAME,
                useFactory: (config) => {
                    switch (config.providerEngineName) {
                        case storageEngine_types_1.StorageEngineTypes.CGP:
                            return new GoogleCloudStorage_1.GoogleCloudStorage(config);
                        default:
                            return new LocalStorage_1.LocalStorage(config);
                    }
                },
                inject: [providerNames_1.STORAGE_CONFIG],
            }
        ],
        exports: [storage_service_1.StorageEngineService],
    })
], StorageEngineModule);
exports.StorageEngineModule = StorageEngineModule;
