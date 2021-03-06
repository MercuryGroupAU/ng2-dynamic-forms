import { DynamicFormControlRelationGroup, 
		 DynamicFormControlWorkflowRelation,
		 DynamicFormControlCalculatedRelation
		} from "./dynamic-form-control-relation.model";
import { Subject } from "rxjs/Subject";
import { serializable, serialize } from "../decorator/serializable.decorator";
import { Utils } from "../utils/core.utils";

export interface DynamicPathable {

    id?: string;
    index?: number | null;
    parent: DynamicPathable | null;
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
    option?: string;
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
        label: "",
        option: ""
    };
}

export interface DynamicFormControlModelConfig {

    disabled?: boolean;
    errorMessages?: DynamicValidatorsMap;
    id?: string;
    label?: string;
    relation?: DynamicFormControlRelationGroup[];
	workflowRelation?: DynamicFormControlWorkflowRelation[];
	calculatedRelation?: DynamicFormControlCalculatedRelation;
	showLabel?: boolean;
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
	@serializable() workflowRelation: DynamicFormControlWorkflowRelation[];
	@serializable() calculatedRelation: DynamicFormControlCalculatedRelation;
	@serializable() showLabel: boolean;

    abstract readonly type: string;

    constructor(config: DynamicFormControlModelConfig, cls: ClsConfig = {}) {

        if (typeof config.id === "string" && config.id.length > 0) {
            this.id = config.id;
        } else {
            throw new Error("string id must be specified for DynamicFormControlModel");
        }

        this.cls.element = Utils.merge(cls.element, createEmptyClsConfig());
        this.cls.grid = Utils.merge(cls.grid, createEmptyClsConfig());

        this._disabled = typeof config.disabled === "boolean" ? config.disabled : false;
        this.errorMessages = config.errorMessages || null;
        this.label = config.label || null;
        this.name = this.id;
        this.relation = Array.isArray(config.relation) ? config.relation : [];
		this.workflowRelation = Array.isArray(config.workflowRelation) ? config.workflowRelation : [];
		this.calculatedRelation = config.calculatedRelation ? config.calculatedRelation : null;

        this.disabledUpdates = new Subject<boolean>();
        this.disabledUpdates.subscribe((value: boolean) => this.disabled = value);
		this.hiddenUpdates = new Subject<boolean>();
        this.hiddenUpdates.subscribe((value: boolean) => {
            return value ?
                this.cls.grid.container = "hidden" :
                this.cls.grid.container = "ui-grid-row";
        });

		this.showLabel = typeof config.showLabel === "boolean" ? config.showLabel : true;
    }

    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;
    }
	
    get hasErrorMessages(): boolean {
        return Utils.isDefined(this.errorMessages);
    }

    toJSON() {
        return serialize(this);
    }
}