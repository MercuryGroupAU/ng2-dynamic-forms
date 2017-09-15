import { ClsConfig, DynamicFormControlModel, DynamicFormControlModelConfig } from "../dynamic-form-control.model";
import { serializable } from "../../decorator/serializable.decorator";
import { Utils } from "../../utils/core.utils";

export const DYNAMIC_FORM_CONTROL_TYPE_DISCLAIMER = "DISCLAIMER";

export interface DynamicDisclaimerModelConfig extends DynamicFormControlModelConfig {
    content?: string;
}

export class DynamicDisclaimerModel extends DynamicFormControlModel {

    @serializable() content: string;
    @serializable() readonly type: string = DYNAMIC_FORM_CONTROL_TYPE_DISCLAIMER;

    constructor(config: DynamicDisclaimerModelConfig, cls?: ClsConfig) {

        super(config, cls);
        this.content = config.content;
    }
}