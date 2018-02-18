import {
    AfterViewInit,
    ChangeDetectorRef,
	ApplicationRef,
    EventEmitter,
    OnChanges,
    OnDestroy,
    OnInit,
    QueryList,
    SimpleChange,
    SimpleChanges,
	ViewChild
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subscription } from "rxjs/Subscription";
import { DynamicFormControlModel } from "../model/dynamic-form-control.model";
import { DynamicFormValueControlModel, DynamicFormControlValue } from "../model/dynamic-form-value-control.model";
import { DynamicFormControlRelationGroup } from "../model/dynamic-form-control-relation.model";
import { DynamicFormArrayGroupModel } from "../model/form-array/dynamic-form-array.model";
import { DynamicFormGroupModel } from "../model/form-group/dynamic-form-group.model";
import {
    DynamicInputModel,
    DYNAMIC_FORM_CONTROL_TYPE_INPUT,
    DYNAMIC_FORM_CONTROL_INPUT_TYPE_FILE
} from "../model/input/dynamic-input.model";
import { DynamicDatePickerModel } from "../model/datepicker/dynamic-datepicker.model";
import { DynamicTemplateDirective } from "../directive/dynamic-template.directive";
import { DynamicInputDirective } from "../directive/dynamic-input.directive";
import { Utils } from "../utils/core.utils";
import { RelationUtils } from "../utils/relation.utils";
import { DynamicFormValidationService } from "../service/dynamic-form-validation.service";
import { DynamicFormService } from "../service/dynamic-form.service";
import { IMyDateModel, IMyInputFieldChanged, IMyOptions } from "ngx-mydatepicker";
export interface DynamicFormControlEvent {

    $event: Event | FocusEvent | DynamicFormControlEvent | any;
    context: DynamicFormArrayGroupModel | null;
    control: FormControl;
    group: FormGroup;
    model: DynamicFormControlModel;
}

export interface DocumentEvent {
    modelId: string;
    documentId: number;
	parentId: string;
}

export interface DropEvent {
    type:any;
    el:any;
    source:any;
    value:any;
}

export enum DynamicFormControlEventType {

    Blur = 0,
    Change = 1,
    Focus = 2
}

export abstract class DynamicFormControlComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {

    @ViewChild(DynamicInputDirective) dynamicInputDirective: DynamicInputDirective;
    bindId: boolean;
    context: DynamicFormArrayGroupModel | null;
    control: FormControl;
    group: FormGroup;
    hasErrorMessaging: boolean = false;
    hasFocus: boolean;
    model: DynamicFormControlModel;
	formModel: DynamicFormControlModel[];

    contentTemplates: QueryList<DynamicTemplateDirective>;
    inputTemplates: QueryList<DynamicTemplateDirective> | null = null;
    template: DynamicTemplateDirective;

    blur: EventEmitter<DynamicFormControlEvent>;
    change: EventEmitter<DynamicFormControlEvent>;
    //filter: EventEmitter<DynamicFormControlEvent>;
    focus: EventEmitter<DynamicFormControlEvent>;
    downloadFile: EventEmitter<DocumentEvent>;
    deleteFile: EventEmitter<DocumentEvent>;
    drop: EventEmitter<DropEvent>;
    dragMode: boolean = false;
	readOnlyMode: boolean = false;
	userGroups: any[];
	workflowActions: any[];

    private subscriptions: Subscription[] = [];

    abstract type: number | string | null;

	onDrop(event:any) {
        this.drop.emit({ type:event.type, el: event.el, source: event.source, value:event.value });
    }
    
    onDownloadFile($event: Event | CustomEvent | DynamicFormControlEvent | any) {
		if (this.model.type === "INPUT") {
			this.downloadFile.emit({ modelId: this.model.id, documentId: (this.model as DynamicInputModel).documentId, parentId: null });
		} else {
			this.downloadFile.emit({ modelId: ($event as any).modelId, documentId: ($event as any).documentId, parentId: ($event as any).parentId });
		}
    }
    
    onDeleteFile($event: Event | CustomEvent | DynamicFormControlEvent | any) {
		if (this.model.type === "INPUT") {
			this.deleteFile.emit({ modelId: this.model.id, documentId: (this.model as DynamicInputModel).documentId, parentId: null });
		} else {
			this.deleteFile.emit({ modelId: ($event as any).modelId, documentId: ($event as any).documentId, parentId: ($event as any).parentId });
		}
    }
	onDateOneChanged(event: IMyDateModel): void { 
		if(!event.jsdate) {
			this.updatePickers(false, null); 
			return;
		}
		
		let d: Date = new Date(event.jsdate.getTime());
		this.updatePickers(true, d); 
	}
    
	getParentArray(): DynamicFormControlModel[] {
		//console.log("getting control parent", this.model);
		if (this.model.parent) {
			if ((this.model.parent as DynamicFormControlModel).type === "GROUP")
				return (this.model.parent as DynamicFormGroupModel).group;
		}
		else if (this.model.type === "DATEPICKER" && (this.model as DynamicDatePickerModel).parentId && this.formModel) {
			let parent = this.formModel.filter(c => c.id === (this.model as DynamicDatePickerModel).parentId)[0];
			//console.log("ARRAY PARENT", parent);
		}
		else 
			return this.formModel;
		return null;
	}
	
	updatePickers(isValid:boolean, date:any):void {
		let parent = this.getParentArray();
		//console.log("update picker for id", this.model.id);
		if (parent) {
			let relatedPickers = parent.filter(c => c.type === "DATEPICKER" && c.id !== this.model.id && 
								((c as DynamicDatePickerModel).minDateControlId === this.model.id || (c as DynamicDatePickerModel).maxDateControlId === this.model.id));
			//console.log("relatedPickers", relatedPickers);
			if (relatedPickers) {
				relatedPickers.forEach((picker: DynamicDatePickerModel) => {
					//console.log("Updating picker id", picker.id);
					//console.log("PICKER MIN BEFORE UPDATE", picker.options.disableUntil);
					if (picker.minDateControlId === this.model.id) {
						if (isValid) {
							let d: Date = new Date(date);
							d.setDate(d.getDate() - 1);
							let duCopy: IMyOptions = this.getCopyOfOptions(picker.options);
							duCopy.disableUntil = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
							picker.options = duCopy;
							
						} else {
							//console.log("Reseting DisableUntil (invalid)");
							//picker.options.disableUntil = null;
							let duCopy: IMyOptions = this.getCopyOfOptions(picker.options);
							duCopy.disableUntil = { year: 0, month: 0, day: 0 };
							picker.options = duCopy;
						}
					}
					if (picker.maxDateControlId === this.model.id) {
						if (isValid) {
							let d: Date = new Date(date);
							d.setDate(d.getDate() + 1);
							let dsCopy: IMyOptions = this.getCopyOfOptions(picker.options);
							dsCopy.disableSince = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
							picker.options = dsCopy;
						} else {
							//picker.options.disableSince = null;
							// let d: Date = new Date(date);
							// d.setDate(d.getDate() + 1);
							let dsCopy: IMyOptions = this.getCopyOfOptions(picker.options);
							dsCopy.disableSince = { year: 0, month: 0, day: 0 };
							picker.options = dsCopy;
						}
					}
					//console.log("PICKER MIN AFTER UPDATE", picker.options.disableUntil);
				});
			}
		}
	}
	getCopyOfOptions(options: IMyOptions): IMyOptions {
		return JSON.parse(JSON.stringify(options));
    }
    constructor(protected changeDetectorRef: ChangeDetectorRef,
                protected validationService: DynamicFormValidationService,
				protected dynamicFormService: DynamicFormService) { }

    ngOnChanges(changes: SimpleChanges) {
        let groupChange = changes["group"] as SimpleChange,
            modelChange = changes["model"] as SimpleChange;

        if (groupChange || modelChange) {
            if (this.model) {

                this.unsubscribe();

                if (this.group) {
                    this.control = this.group.get(this.model.id) as FormControl;
				    this.subscriptions.push(this.control.valueChanges.subscribe(value => this.onControlValueChanges(value)));
                }

                this.subscriptions.push(this.model.disabledUpdates.subscribe(value => this.onModelDisabledUpdates(value)));
				this.subscriptions.push(this.model.hiddenUpdates.subscribe(value => this.onModelHiddenUpdates(value)));


                if (this.model instanceof DynamicFormValueControlModel) {

                    let model = this.model as DynamicFormValueControlModel<DynamicFormControlValue>;
				
                    this.subscriptions.push(model.valueUpdates.subscribe(value => this.onModelValueUpdates(value)));
                }

                if (this.model.relation.length > 0) {
                    this.setControlRelations();
                }
				
				if (this.model.calculatedRelation) {
					this.setControlCalculatedRelations();
				}
				
            }
        }
    }

	// getDate(date: any): Date {
        // return new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
    // }
	
    ngOnInit(): void {
		if (this.model.type === "INPUT") {
			let input = this.model as DynamicInputModel;
			if (input.inputType === "date" && !this.dragMode) {
				//for dates on load of a real form (not drag mode)
				//determine their default date & ranges
				if ((input.startDateAdditionalDays || input.startDate) && !input.value) {
					if (input.startDateAdditionalDays) {
						this.control.setValue(Utils.addDaysToToday(Number(input.startDateAdditionalDays)));
					} else {
						this.control.setValue(input.startDate);
					}
				}
				if (input.minAdditionalDays && !input.min) {
					input.min = Utils.addDaysToToday(Number(input.minAdditionalDays));
				}
				if (input.maxAdditionalDays && !input.max) {
					input.max = Utils.addDaysToToday(Number(input.maxAdditionalDays));
				}
			}
		}
		
		if (this.model.type === "DATEPICKER" && !this.dragMode) {
			let picker = this.model as DynamicDatePickerModel;
			if ((picker.startDateAdditionalDays || picker.startDate) && !picker.value) {
				if (picker.startDateAdditionalDays) {
					// var v = { 
						// date : date //, 
						//formatted: formattedDate
						// jsdate: this.getDate(date),
						// epoc: Math.round(this.getDate(date).getTime() / 1000.0)
					//};
					this.control.setValue({ date: Utils.datePickerAddDaysToToday(Number(picker.startDateAdditionalDays)) });
				} else {
					this.control.setValue(picker.startDate);
				}
			}
			if (picker.minAdditionalDays) {
				picker.options.disableUntil = Utils.datePickerAddDaysToToday(Number(picker.minAdditionalDays));
			}
				
			if (picker.maxAdditionalDays) {
				picker.options.disableSince = Utils.datePickerAddDaysToToday(Number(picker.maxAdditionalDays));
			}
			
			if (picker.minDateControlId) {
				let parent = this.getParentArray();
				if (parent) {
					let ctrl = this.group.get(picker.minDateControlId);
					if (ctrl && ctrl.value) {				
						let dsCopy: IMyOptions = this.getCopyOfOptions((this.model as DynamicDatePickerModel).options);
						dsCopy.disableUntil = { year: ctrl.value.date.year, month: ctrl.value.date.month, day: ctrl.value.date.day };
						(this.model as DynamicDatePickerModel).options = dsCopy;
					}
				}
			}
			if (picker.maxDateControlId) {
				let parent = this.getParentArray();
				if (parent) {
				let ctrl = this.group.get(picker.maxDateControlId);
					if (ctrl && ctrl.value) {
						let dsCopy: IMyOptions = this.getCopyOfOptions((this.model as DynamicDatePickerModel).options);
						dsCopy.disableSince = { year: ctrl.value.date.year, month: ctrl.value.date.month, day: ctrl.value.date.day };
						(this.model as DynamicDatePickerModel).options = dsCopy;
					}
				}
			}
		}
		
        if (!Utils.isDefined(this.model) || !Utils.isDefined(this.group)) {
            throw new Error(`no [model] or [group] input set for DynamicFormControlComponent`);
        }
		if (this.model.relation.length > 0) {
            this.setControlRelations();
        }
		
		if (this.model.calculatedRelation) {
			this.setControlCalculatedRelations();
		}
		
		if (!this.dragMode) {
			if (this.model.workflowRelation && this.model.workflowRelation.length > 0) {
				let everyoneRelations = this.model.workflowRelation.filter(c => c.group.id === "Everyone");
				everyoneRelations.forEach(eRelation => {
					this.onModelHiddenUpdates(RelationUtils.isFormControlToBeHiddenByWorkflow(eRelation, this.workflowActions));
					this.onModelDisabledUpdates(RelationUtils.isFormControlToBeDisabledByWorkflow(eRelation, this.workflowActions));
				});
				if (this.userGroups && this.userGroups.length > 0) {
					this.userGroups.forEach(group => {
						let groupRelations = [];
						if (group.name === "Requestor") {
							groupRelations = this.model.workflowRelation.filter(c => c.group.id === "Requestor");
						} else {
							groupRelations = this.model.workflowRelation.filter(c => c.group.id === group.id);
						}
						
						groupRelations.forEach(gRelation => {
							this.onModelHiddenUpdates(RelationUtils.isFormControlToBeHiddenByWorkflow(gRelation, this.workflowActions));
							this.onModelDisabledUpdates(RelationUtils.isFormControlToBeDisabledByWorkflow(gRelation, this.workflowActions));
						});
					});
				}
			}
		}
    }

    ngAfterViewInit(): void {
        this.setTemplates();
        this.changeDetectorRef.detectChanges();
    }

    ngOnDestroy(): void {
        this.unsubscribe();
    }

    get errorMessages(): string[] {

        if (this.hasErrorMessaging && this.model.hasErrorMessages) {
            return this.validationService.createErrorMessages(this.control, this.model);
        }

        return [];
    }

    get hasHint(): boolean { // needed for AOT
        return (this.model as DynamicFormValueControlModel<DynamicFormControlValue>).hint !== null;
    }

    get hasList(): boolean { // needed for AOT
        return (this.model as DynamicInputModel).list !== null;
    }

    get isInvalid(): boolean {
        return this.control.invalid;
    }

    get isValid(): boolean {
        return this.control.valid;
    }

    get showErrorMessages(): boolean {
        return this.hasErrorMessaging && 
		this.isInvalid &&
		((this.control.touched && !this.hasFocus) || 
		((this.model.type === "INPUT" || this.model.type === "TEXTAREA" || this.model.type === "DATEPICKER") 
		&& (this.model as DynamicInputModel).readOnly));
    }

    get templates(): QueryList<DynamicTemplateDirective> {
        return this.inputTemplates ? this.inputTemplates : this.contentTemplates;
    }

    protected setTemplates(): void {
        this.templates.forEach((template: DynamicTemplateDirective) => {
            if (template.modelType !== undefined || template.modelId !== undefined) {
                if (template.as === null && (template.modelType === this.model.type || template.modelId === this.model.id)) {
                    this.template = template;
                }
            } else {
                if (template.as === null) {
                    this.template = template;
                }
            }
        });
    }

    protected setControlRelations(): void {

        let relActivation = RelationUtils.findActivationRelation(this.model.relation);

        if (relActivation !== null) {

            let rel = relActivation as DynamicFormControlRelationGroup;

            this.updateModelDisabled(rel);

            RelationUtils.getRelatedFormControls(this.model, this.group).forEach(control => {
                this.subscriptions.push(control.valueChanges.subscribe(() => this.updateModelDisabled(rel)));
                this.subscriptions.push(control.statusChanges.subscribe(() => this.updateModelDisabled(rel)));
            });
        }
		
		let relActivationHidden = RelationUtils.findActivationRelationHidden(this.model.relation);
        if (relActivationHidden) {

            this.updateModelHidden(relActivationHidden);

            RelationUtils.getRelatedFormControls(this.model, this.group).forEach(control => {
                this.subscriptions.push(control.valueChanges.subscribe(() => this.updateModelHidden(relActivationHidden)));
                this.subscriptions.push(control.statusChanges.subscribe(() => this.updateModelHidden(relActivationHidden)));
            });
        }
    }

	protected setControlCalculatedRelations(): void {
		//check if calculated relations
		if (this.model.calculatedRelation && this.model.calculatedRelation.initialControlId) {
			RelationUtils.getRelatedFormControlsForCalculation(this.model, this.group).forEach(control => {
				if (control)
					this.subscriptions.push(control.valueChanges.subscribe(() => this.updateModelCalculatedValue()));
			});
		}
	}
	
	updateModelCalculatedValue(): void {

		let newValue = RelationUtils.getCalculatedFormControlValue(this.model, this.group);
		if (this.control.value !== newValue) {
            this.control.setValue(newValue);
            if (this.dynamicInputDirective && (this.model as DynamicInputModel).directiveInputType === "currency") {
                this.dynamicInputDirective.onBlur(newValue);
            }
			if (this.model.type === "DATEPICKER") {
				this.updatePickers(true, newValue);
			}
		}
    }
	
    updateModelDisabled(relation: DynamicFormControlRelationGroup): void {

        this.model.disabledUpdates.next(RelationUtils.isFormControlToBeDisabled(relation, this.group));
    }
	
	updateModelHidden(relation: DynamicFormControlRelationGroup): void {
        this.model.hiddenUpdates.next(RelationUtils.isFormControlToBeHidden(relation, this.group));
    }


    unsubscribe(): void {

        this.subscriptions.forEach(subscription => subscription.unsubscribe());
        this.subscriptions = [];
    }

    onControlValueChanges(value: DynamicFormControlValue): void {

        if (this.model instanceof DynamicFormValueControlModel) {

            let model = this.model as DynamicFormValueControlModel<DynamicFormControlValue>;

            if (model.value !== value) {
                model.valueUpdates.next(value);
            }
        }
    }

    onModelValueUpdates(value: DynamicFormControlValue): void {

        if (this.control.value !== value) {
            this.control.setValue(value);
        }
    }

    onModelDisabledUpdates(value?: boolean): void {
		if (value !== null) {
			value ? this.control.disable() : this.control.enable();
		}
    }
	
	onModelHiddenUpdates(value?: boolean): void {
        let m = this.model as DynamicFormValueControlModel<DynamicFormControlValue>;
        // saving and restoring validators when hiding/showing a control
		if (value !== null) {
			if (value) {
                if (m.validators) {
                    m.hiddenValidators = m.validators;
                    this.group.controls[m.id].setValidators([]);
                    this.group.controls[m.id].updateValueAndValidity();
					m.required = false;
                }
				this.model.cls.grid.container = "hidden";
			}
			else {
				if (m.hiddenValidators) {
                    m.validators = m.hiddenValidators;
                    this.group.controls[m.id].setValidators(Validators.compose(this.validationService.getValidators(m.validators || {})));
                    this.group.controls[m.id].updateValueAndValidity();
					if (m.validators.hasOwnProperty("required") || m.validators.hasOwnProperty("requiredTrue")) {
						m.required = true;
					}
				}
				this.model.cls.grid.container = "";
			}
			//value ? this.model.cls.grid.container = "hidden" : this.model.cls.grid.container = "ui-grid-row";
		}
    }

    onValueChange($event: Event | DynamicFormControlEvent | any): void {

        if ($event && $event instanceof Event) { // native HTML5 change event

            ($event as Event).stopPropagation();

            if (this.model.type === DYNAMIC_FORM_CONTROL_TYPE_INPUT) {

                let model = this.model as DynamicInputModel;

                if (model.inputType === DYNAMIC_FORM_CONTROL_INPUT_TYPE_FILE) {

                    let inputElement: any = ($event as Event).target || ($event as Event).srcElement;

                    model.files = inputElement.files as FileList;
                }
            }

            this.change.emit(
                {
                    $event: $event as Event,
                    context: this.context,
                    control: this.control,
                    group: this.group,
                    model: this.model
                }
            );

        }
        else if ($event && $event.hasOwnProperty("$event") && $event.hasOwnProperty("control") && $event.hasOwnProperty("model")) {

            this.change.emit($event as DynamicFormControlEvent);

        } else {

            this.change.emit(
                {
                    $event: $event,
                    context: this.context,
                    control: this.control,
                    group: this.group,
                    model: this.model
                }
            );
        }
    }

    onFilterChange(_$event: any | DynamicFormControlEvent): void {
        // TODO
    }

    onFocusChange($event: FocusEvent | DynamicFormControlEvent): void {

        let emitValue;

        if ($event instanceof FocusEvent) {

            $event.stopPropagation();

            emitValue = {
                $event: $event,
                context: this.context,
                control: this.control,
                group: this.group,
                model: this.model
            };

            if ($event.type === "focus") {

                this.hasFocus = true;
                this.focus.emit(emitValue);

            } else {

                this.hasFocus = false;
                this.blur.emit(emitValue);
            }

        } else {

            emitValue = $event as DynamicFormControlEvent;

            if (emitValue.$event && emitValue.$event instanceof FocusEvent) {

                emitValue.$event.type === "focus" ? this.focus.emit(emitValue) : this.blur.emit(emitValue);
            }
        }
    }
}