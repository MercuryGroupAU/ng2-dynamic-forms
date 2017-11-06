import { FormGroup, FormControl, AbstractControl } from "@angular/forms";
import { DynamicFormControlModel } from "../model/dynamic-form-control.model";
import {
    DynamicFormControlRelation,
    DynamicFormControlRelationGroup,
	DynamicFormControlWorkflowStateRelation, 
	DynamicFormControlUserRoleRelation,
    DYNAMIC_FORM_CONTROL_ACTION_DISABLE,
    DYNAMIC_FORM_CONTROL_ACTION_ENABLE,
    DYNAMIC_FORM_CONTROL_CONNECTIVE_AND,
    DYNAMIC_FORM_CONTROL_CONNECTIVE_OR,
    DYNAMIC_FORM_CONTROL_ACTION_HIDE, 
    DYNAMIC_FORM_CONTROL_ACTION_SHOW

} from "../model/dynamic-form-control-relation.model";


export class RelationUtils {

	static isFormControlToBeDisabledByUserRole(userRoleRelation: DynamicFormControlUserRoleRelation): boolean {
		if (userRoleRelation.action === DYNAMIC_FORM_CONTROL_ACTION_DISABLE)
			return true;
		else
			return false;
	}
	
	static isFormControlToBeDisabledByWorkflowState(workflowStateRelation: DynamicFormControlWorkflowStateRelation): boolean  {
		if (workflowStateRelation.action === DYNAMIC_FORM_CONTROL_ACTION_DISABLE)
			return true;
		else
			return false;
	}
	
	static isFormControlToBeHiddenByUserRole(userRoleRelation: DynamicFormControlUserRoleRelation): boolean  {
	if (userRoleRelation.action === DYNAMIC_FORM_CONTROL_ACTION_HIDE)
			return true;
		else
			return false;
	}
	
	static isFormControlToBeHiddenByWorkflowState(workflowStateRelation: DynamicFormControlWorkflowStateRelation): boolean  {
	if (workflowStateRelation.action === DYNAMIC_FORM_CONTROL_ACTION_HIDE)
			return true;
		else
			return false;
	}

    static findActivationRelation(relGroups: DynamicFormControlRelationGroup[]): DynamicFormControlRelationGroup | null {

        let rel = relGroups.find(rel => {
            return rel.action === DYNAMIC_FORM_CONTROL_ACTION_DISABLE || rel.action === DYNAMIC_FORM_CONTROL_ACTION_ENABLE;
        });

        return rel !== undefined ? rel : null;
    }

    static findActivationRelationHidden(relGroups: DynamicFormControlRelationGroup[]): DynamicFormControlRelationGroup {
        return relGroups.find(rel => {
            return rel.action === DYNAMIC_FORM_CONTROL_ACTION_HIDE || rel.action === DYNAMIC_FORM_CONTROL_ACTION_SHOW;
        });
    }
	
    static getRelatedFormControls(model: DynamicFormControlModel, controlGroup: FormGroup): FormControl[] {

        let controls: FormControl[] = [];
        model.relation.forEach(relGroup => relGroup.when.forEach(rel => {

            if (model.id === rel.id) {
                throw new Error(`FormControl ${model.id} cannot depend on itself`);
            }
            let control = controlGroup.get(rel.id) as FormControl;
			//Added this check for CheckBoxGroups, so we can handle events of each checkbox within the array
			if (!control) {
				let subgroups: AbstractControl[] = [];
				
				Object.keys(controlGroup.controls).forEach(c => {
					let ac = controlGroup.get(c);
					if (ac.constructor.name === "FormGroup") {
						 subgroups.push(ac);
					}
				});
				
				subgroups.forEach((sg:FormGroup) => {
					if (sg.controls[rel.id]) {
						control = sg.get(rel.id) as FormControl;
					}
				});
			}
            if (control && !controls.some(controlElement => controlElement === control)) {
                controls.push(control);
            }
        }));

        return controls;
    }

    static isFormControlToBeDisabled(relGroup: DynamicFormControlRelationGroup, formGroup: FormGroup): boolean {
	
        return relGroup.when.reduce((toBeDisabled: boolean, rel: DynamicFormControlRelation, index: number) => {
            let control = formGroup.get(rel.id);
			
			if (!control) {
				let subgroups: AbstractControl[] = [];				
				Object.keys(formGroup.controls).forEach(c => {
					let ac = formGroup.get(c);
					if (ac.constructor.name === "FormGroup") {
						 subgroups.push(ac);
					}
				});
				subgroups.forEach((sg:FormGroup) => {
					if (sg.controls[rel.id]) {
						control = sg.get(rel.id) as FormControl;
					}
				});
			}
			
            if (control && relGroup.action === DYNAMIC_FORM_CONTROL_ACTION_DISABLE) {

                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_AND && !toBeDisabled) {
                    return false;
                }

                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_OR && toBeDisabled) {
                    return true;
                }

                if (control.value === null) { return false; }
								
                return (rel.value !== undefined ? rel.value.toString() : rel.value) === (control.value !== undefined ? control.value.toString() : control.value)
                    || (rel.status !== undefined ? rel.status.toString() : rel.status) === (control.status !== undefined ? control.status.toString() : control.status);

            }

            if (control && relGroup.action === DYNAMIC_FORM_CONTROL_ACTION_ENABLE) {

                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_AND && toBeDisabled) {
                    return true;
                }

                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_OR && !toBeDisabled) {
                    return false;
                }
				
                if (control.value === null) { return false; }
                return !((rel.value !== undefined ? rel.value.toString() : rel.value) === (control.value !== undefined ? control.value.toString() : control.value)
                    || (rel.status !== undefined ? rel.status.toString() : rel.status) === (control.status !== undefined ? control.status.toString() : control.status));

            }

            return false;

        }, false);
    }
	
	static isFormControlToBeHidden(relGroup: DynamicFormControlRelationGroup, formGroup: FormGroup): boolean {
        return relGroup.when.reduce(function (toBeHidden, rel, index) {
            var control = formGroup.get(rel.id);
			
			if (!control) {
				let subgroups: AbstractControl[] = [];				
				Object.keys(formGroup.controls).forEach(c => {
					let ac = formGroup.get(c);
					if (ac.constructor.name === "FormGroup") {
						 subgroups.push(ac);
					}
				});
				subgroups.forEach((sg:FormGroup) => {
					if (sg.controls[rel.id]) {
						control = sg.get(rel.id) as FormControl;
					}
				});
			}
            if (control && relGroup.action === DYNAMIC_FORM_CONTROL_ACTION_HIDE) {
                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_AND && !toBeHidden) {
                    return false;
                }
                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_OR && toBeHidden) {
                    return true;
                }
                if (control.value === null) { return false; }			
                return (rel.value !== undefined ? rel.value.toString() : rel.value) === (control.value !== undefined ? control.value.toString() : control.value)
                    || (rel.status !== undefined ? rel.status.toString() : rel.status) === (control.status !== undefined ? control.status.toString() : control.status);
            }
            if (control && relGroup.action === DYNAMIC_FORM_CONTROL_ACTION_SHOW) {
                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_AND && toBeHidden) {
                    return true;
                }
                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_OR && !toBeHidden) {
                    return false;
                }
                if (control.value === null) { return true; }
                return !((rel.value !== undefined ? rel.value.toString() : rel.value) === (control.value !== undefined ? control.value.toString() : control.value)
                    || (rel.status !== undefined ? rel.status.toString() : rel.status) === (control.status !== undefined ? control.status.toString() : control.status));
            }
            return false;
        }, false);
    }
}