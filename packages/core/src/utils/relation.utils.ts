import { FormGroup, FormControl, AbstractControl } from "@angular/forms";
import { DynamicFormControlModel } from "../model/dynamic-form-control.model";
import { DynamicInputModel } from "../model/input/dynamic-input.model";
import {
    DynamicFormControlRelation,
    DynamicFormControlRelationGroup,
	DynamicFormControlWorkflowRelation, 
    DYNAMIC_FORM_CONTROL_ACTION_DISABLE,
    DYNAMIC_FORM_CONTROL_ACTION_ENABLE,
    DYNAMIC_FORM_CONTROL_CONNECTIVE_AND,
    DYNAMIC_FORM_CONTROL_CONNECTIVE_OR,
    DYNAMIC_FORM_CONTROL_ACTION_HIDE, 
    DYNAMIC_FORM_CONTROL_ACTION_SHOW

} from "../model/dynamic-form-control-relation.model";

export class RelationUtils {

static getCalculatedFormControlValue(model: DynamicFormControlModel, controlGroup: FormGroup): number | string | any | null {
		let value: number;
		if (model.id === model.calculatedRelation.initialControlId) {
			throw new Error(`FormControl ${model.id} cannot depend on itself for initial calculation`);
		}
		let initialControl = controlGroup.get(model.calculatedRelation.initialControlId) as FormControl;
		if (!initialControl) {
			console.log("FAILED TO GET INITIAL CONTROL ID", model.calculatedRelation.initialControlId);
			console.log("MODEL", model);
			console.log("FORM GROUP", controlGroup);
		}
		value = null;
		// text calculation (numbers & currency only)
		if (model.type === "INPUT") {
			let type = (model as DynamicInputModel).inputType;
			let directiveType = (model as DynamicInputModel).directiveInputType;
			if ((type && type === "number") || (directiveType && directiveType === "currency")) {
				if (!isNaN(initialControl.value)) {
					value = Number(initialControl.value);
					model.calculatedRelation.operations.forEach(op => {
						if (model.id === op.controlId) {
							throw new Error(`FormControl ${model.id} cannot depend on itself for calculation`);
						}

						let operationControl = controlGroup.get(op.controlId) as FormControl;
						if (operationControl && operationControl.value && !isNaN(operationControl.value)) {
							if (op.operator === "+")
								value = value + Number(operationControl.value);
							if (op.operator === "-")
								value = value - Number(operationControl.value);
							if (op.operator === "*")
								value = value * Number(operationControl.value);
							if (op.operator === "/")
								value = value / Number(operationControl.value);
						}
					});
				}
				return value;
			}
		
			//input type date calculation
			if (type === "date") {
				console.log("CALCULATING INPUT DATE");
				let date: Date;
				date = new Date();
				let startDate = new Date(initialControl.value);
				if (model.calculatedRelation.operations[0].operator === "+") {
					date.setDate(startDate.getDate() + Number(model.calculatedRelation.operations[0].value));
				}
				if (model.calculatedRelation.operations[0].operator === "-") {
					date.setDate(startDate.getDate() - Number(model.calculatedRelation.operations[0].value));
				}
				var sday = date.getDate().toString();
				if (Number(sday) <= 9) sday = "0" + sday;
				var smonth = (date.getMonth() + 1).toString();
				if (Number(smonth) <= 9) smonth = "0" + smonth;
				var syear = date.getFullYear();
				let dateString = syear + "-" + smonth + "-" + sday;
				//let dateString = date.toISOString().substring(0, 10);
				console.log("INPUT DATE VLUE", dateString);
				return dateString;
			}
		}
		
		//date picker calculations
		if (model.type === "DATEPICKER" && initialControl.value) {
			let date: Date;
			date = new Date();
			var originalDate = initialControl.value.date.month + "/" + initialControl.value.date.day + "/" + initialControl.value.date.year;
			let startDate = new Date(originalDate);
			console.log("START DATE", startDate);
			if (model.calculatedRelation.operations[0].operator === "+") {
				date.setDate(startDate.getDate() + Number(model.calculatedRelation.operations[0].value));
			}
			if (model.calculatedRelation.operations[0].operator === "-") {
				date.setDate(startDate.getDate() - Number(model.calculatedRelation.operations[0].value));
			}
			var day = date.getDate();
			var month = date.getMonth() + 1;
			var year = date.getFullYear();
			var pickerDate = { date: { year: year, month: month, day: day }, 
				formatted: day.toString() + "/" + month.toString() + "/" + year.toString() //get format from options
			};
			console.log("ASSIGNING CALCULATED PICKER VALUE", pickerDate);
			return pickerDate;
		}
		return null;
	}

	static getRelatedFormControlsForCalculation(model: DynamicFormControlModel, controlGroup: FormGroup): FormControl[] {
		let controls: FormControl[] = [];
		if (model.id === model.calculatedRelation.initialControlId) {
			throw new Error(`FormControl ${model.id} cannot depend on itself for initial calculation`);
		}
		let initialControl = controlGroup.get(model.calculatedRelation.initialControlId) as FormControl;
		controls.push(initialControl);
		if (model.calculatedRelation.operations) {
			model.calculatedRelation.operations.forEach(op => {

				if (model.id === op.controlId) {
					throw new Error(`FormControl ${model.id} cannot depend on itself for calculation`);
				}
				
				let operationControl = controlGroup.get(op.controlId) as FormControl;
				if (operationControl && !controls.some(controlElement => controlElement === operationControl)) {
					controls.push(operationControl);
				}
			});
		}
		return controls;
	}
	
	static isFormControlToBeDisabledByWorkflow(workflowRelation: DynamicFormControlWorkflowRelation, workflowActions: any[]): boolean | null  {
		if ((!workflowActions || workflowActions.length === 0) || !workflowRelation.workflowResponsible) {
			if (workflowRelation.action === DYNAMIC_FORM_CONTROL_ACTION_DISABLE)
				return true;
			else if (workflowRelation.action === DYNAMIC_FORM_CONTROL_ACTION_ENABLE)
				return false;
			else
				return null;
		}
		else {
			let actions = workflowActions.filter(action => workflowRelation.workflowResponsible.name === action.responsible && workflowRelation.workflowAction === action.name);
			if (actions) {
				if (workflowRelation.action === DYNAMIC_FORM_CONTROL_ACTION_DISABLE)
					return true;
				else if (workflowRelation.action === DYNAMIC_FORM_CONTROL_ACTION_ENABLE)
					return false;
				else
					return null;
			}
		}
		return null;
	}
		
	static isFormControlToBeHiddenByWorkflow(workflowRelation: DynamicFormControlWorkflowRelation, workflowActions: any[]): boolean | null {
		if ((!workflowActions || workflowActions.length === 0) || !workflowRelation.workflowResponsible) {
			if (workflowRelation.action === DYNAMIC_FORM_CONTROL_ACTION_HIDE)
				return true;
			else if (workflowRelation.action === DYNAMIC_FORM_CONTROL_ACTION_SHOW)
				return false;
			else
				return null;
		}
		else {
			let actions = workflowActions.filter(action => workflowRelation.workflowResponsible.name === action.responsible && workflowRelation.workflowAction === action.name);
			if (actions) {
				if (workflowRelation.action === DYNAMIC_FORM_CONTROL_ACTION_HIDE)
					return true;
				else if (workflowRelation.action === DYNAMIC_FORM_CONTROL_ACTION_SHOW)
					return false;
				else
					return null;
			}
		}
		return null;
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
					if (ac instanceof FormGroup) {
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
					if (ac instanceof FormGroup) {
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
					if (ac instanceof FormGroup) {
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