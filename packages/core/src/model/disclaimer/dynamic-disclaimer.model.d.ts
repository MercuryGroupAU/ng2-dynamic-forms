import { ClsConfig, DynamicFormControlModel, DynamicFormControlModelConfig } from "../dynamic-form-control.model";
export declare const DYNAMIC_FORM_CONTROL_TYPE_DISCLAIMER = "DISCLAIMER";
export interface DynamicDisclaimerModelConfig extends DynamicFormControlModelConfig {
    content?: string;
}
export declare class DynamicDisclaimerModel extends DynamicFormControlModel {
    content: string;
    readonly type: string;
    constructor(config: DynamicDisclaimerModelConfig, cls?: ClsConfig);
}
