import {
    DynamicFormControlModel,
    DynamicFormControlModelConfig,
    DynamicValidatorsMap,
    ClsConfig
} from "../dynamic-form-control.model";
import { serializable } from "../../decorator/serializable.decorator";
import { Utils } from "../../utils/core.utils";

export const DYNAMIC_FORM_CONTROL_TYPE_GROUP = "GROUP";

export interface DynamicFormGroupModelConfig extends DynamicFormControlModelConfig {

    asyncValidator?: DynamicValidatorsMap;
    group?: DynamicFormControlModel[];
    legend?: string;
    validator?: DynamicValidatorsMap;
	nextControlId?: number;
}

export class DynamicFormGroupModel extends DynamicFormControlModel {

    @serializable() asyncValidator: DynamicValidatorsMap | null;
    @serializable() group: DynamicFormControlModel[] = [];
    @serializable() legend: string | null;
    @serializable() validator: DynamicValidatorsMap | null;
	@serializable() nextControlId: number | null;

    @serializable() readonly type: string = DYNAMIC_FORM_CONTROL_TYPE_GROUP;

    constructor(config: DynamicFormGroupModelConfig, cls?: ClsConfig) {

        super(config, cls);

        this.asyncValidator = config.asyncValidator || null;
        this.group = Array.isArray(config.group) ? config.group : [];
        this.legend = config.legend || null;
        this.validator = config.validator || null;
		this.nextControlId = typeof config.nextControlId === "number" ? config.nextControlId : 1;
    }

    get(index: number): DynamicFormControlModel {
        return this.group[index];
    }

    set(index: number, controlModel: DynamicFormControlModel,): void {
        this.group[index] = controlModel;
    }

    add(controlModel: DynamicFormControlModel): void {
        this.group.push(controlModel);
    }

    insert(index: number, controlModel: DynamicFormControlModel): void {
        this.group.splice(index, 0, controlModel);
    }

    move(index: number, step: number): void {
        this.group.splice(index + step, 0, ...this.group.splice(index, 1));
    }

    remove(index: number) {
        this.group.splice(index, 1);
    }

    size(): number {
        return this.group.length;
    }
}