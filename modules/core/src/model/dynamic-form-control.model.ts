import { DynamicFormControlRelationGroup } from "./dynamic-form-control-relation.model";
import { Subject } from "rxjs/Subject";
import { serializable, serialize } from "../decorator/serializable.decorator";
import { Utils } from "../utils/core.utils";

export interface DynamicPathable {

    id?: string;
    index?: number;
    parent: DynamicPathable;
}

export interface DynamicValidatorConfig {

    name: string;
    args: any;
}

export type DynamicValidatorsMap = { [validatorKey: string]: any | DynamicValidatorConfig };

export interface Cls {

    container?: string;
    control?: string;
    errors?: string;
    group?: string;
    hint?: string;
    host?: string;
    label?: string;
}

export interface ClsConfig {

    element?: Cls;
    grid?: Cls;
}

export function createEmptyClsConfig(): Cls {

    return {
        container: "",
        control: "",
        errors: "",
        group: "",
        hint: "",
        host: "",
        label: ""
    };
}

export interface DynamicFormControlModelConfig {

    disabled?: boolean;
    errorMessages?: DynamicValidatorsMap;
    id?: string;
    label?: string;
    relation?: DynamicFormControlRelationGroup[];
    step?: number;
}

export abstract class DynamicFormControlModel implements DynamicPathable {

    @serializable() cls: any = {};
    @serializable("disabled") _disabled: boolean;
    disabledUpdates: Subject<boolean>;
    hiddenUpdates: Subject<boolean>;
    @serializable() errorMessages: DynamicValidatorsMap | null;
    @serializable() id: string;
    @serializable() label: string | null;
    @serializable() name: string;
    parent: DynamicPathable | null = null;
    @serializable() relation: DynamicFormControlRelationGroup[];
    @serializable() step: number | null;

    abstract readonly type: string;

    constructor(config: DynamicFormControlModelConfig, cls: ClsConfig = {}) {

        if (Utils.isEmptyString(config.id)) {
            throw new Error("string id must be specified for DynamicFormControlModel");
        }

        this.cls.element = Utils.merge(cls.element, createEmptyClsConfig());
        this.cls.grid = Utils.merge(cls.grid, createEmptyClsConfig());

        this._disabled = Utils.isBoolean(config.disabled) ? config.disabled : false;
        this.errorMessages = config.errorMessages || null;
        this.id = config.id;
        this.label = config.label || null;
        this.name = this.id;
        this.relation = Array.isArray(config.relation) ? config.relation : [];

        this.disabledUpdates = new Subject<boolean>();
        this.disabledUpdates.subscribe((value: boolean) => this.disabled = value);

        this.hiddenUpdates = new Subject<boolean>();
        this.hiddenUpdates.subscribe((value: boolean) => {
            return value ?
                this.cls.grid.container = "hidden" :
                this.cls.grid.container = "ui-grid-row";
        });

        this.step = Utils.isNumber(config.step) ? config.step : null;

    }

    set disabled(value: boolean) {
        this._disabled = value;
    }

    get disabled(): boolean {
        return this._disabled;
    }

    get hasErrorMessages(): boolean {
        return Utils.isDefined(this.errorMessages);
    }

    toJSON() {
        return serialize(this);
    }
}