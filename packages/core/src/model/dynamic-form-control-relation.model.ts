import { DynamicFormControlValue } from "./dynamic-form-value-control.model";

export const DYNAMIC_FORM_CONTROL_ACTION_DISABLE = "DISABLE";
export const DYNAMIC_FORM_CONTROL_ACTION_ENABLE = "ENABLE";
export const DYNAMIC_FORM_CONTROL_ACTION_HIDE = "HIDE";
export const DYNAMIC_FORM_CONTROL_ACTION_SHOW = "SHOW";

export const DYNAMIC_FORM_CONTROL_CONNECTIVE_AND = "AND";
export const DYNAMIC_FORM_CONTROL_CONNECTIVE_OR = "OR";

export const DYNAMIC_FORM_CONTROL_OPERATOR_ADD = "+";
export const DYNAMIC_FORM_CONTROL_OPERATOR_SUBSTRACT = "-";
export const DYNAMIC_FORM_CONTROL_OPERATOR_MULTIPLY = "*";
export const DYNAMIC_FORM_CONTROL_OPERATOR_DIVIDE = "/";

export interface DynamicFormControlRelation {

    id: string;
    status?: string;
    value?: DynamicFormControlValue;
}

export interface DynamicFormControlRelationGroup {

    action: string;
    connective?: string;
    when: DynamicFormControlRelation[];
}

export interface DynamicFormControlWorkflowRelation {
    action: string;
	group?: any;
    workflowAction?: any;
	workflowResponsible?: any;
}

export interface DynamicFormControlCalculatedRelation {
	initialControlId: string;
	operations: DynamicFormControlCalculatedRelationOperations[];
}

export interface DynamicFormControlCalculatedRelationOperations {
	operator: string;
	controlId?: string;
	value?: string;
}