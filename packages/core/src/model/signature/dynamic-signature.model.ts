import { ClsConfig } from "../dynamic-form-control.model";
import { DynamicFormValueControlModel, DynamicFormValueControlModelConfig } from "../dynamic-form-value-control.model";
import { serializable } from "../../decorator/serializable.decorator";
import { Utils } from "../../utils/core.utils";

export const DYNAMIC_FORM_CONTROL_TYPE_SIGNATURE = "SIGNATURE";

export interface DynamicSignatureModelConfig extends DynamicFormValueControlModelConfig<string> {}

export class DynamicSignatureModel extends DynamicFormValueControlModel<string> {

    @serializable() readonly type: string = DYNAMIC_FORM_CONTROL_TYPE_SIGNATURE;
    constructor(config: DynamicSignatureModelConfig, cls?: ClsConfig) {
        super(config, cls);
    }
}