import {
    AfterViewInit,
    ChangeDetectorRef,
    EventEmitter,
    OnChanges,
    OnDestroy,
    OnInit,
    QueryList,
    SimpleChange,
    SimpleChanges
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Subscription } from "rxjs/Subscription";
import { DynamicFormControlModel } from "../model/dynamic-form-control.model";
import { DynamicFormValueControlModel, DynamicFormControlValue } from "../model/dynamic-form-value-control.model";
import { DynamicFormControlRelationGroup } from "../model/dynamic-form-control-relation.model";
import { DynamicFormArrayGroupModel } from "../model/form-array/dynamic-form-array.model";
import {
    DynamicInputModel,
    DYNAMIC_FORM_CONTROL_TYPE_INPUT,
    DYNAMIC_FORM_CONTROL_INPUT_TYPE_FILE
} from "../model/input/dynamic-input.model";
import { DynamicTemplateDirective } from "../directive/dynamic-template.directive";
import { Utils } from "../utils/core.utils";
import { RelationUtils } from "../utils/relation.utils";
import { DynamicFormValidationService } from "../service/dynamic-form-validation.service";

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

    bindId: boolean;
    context: DynamicFormArrayGroupModel | null;
    control: FormControl;
    group: FormGroup;
    hasErrorMessaging: boolean = false;
    hasFocus: boolean;
    model: DynamicFormControlModel;

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
	userGroups: any[];
	workflowActions: any[];

    private subscriptions: Subscription[] = [];

    abstract type: number | string | null;

	onDrop(event:any) {
        this.drop.emit({ type:event.type, el: event.el, source: event.source, value:event.value });
    }
    
    onDownloadFile($event: Event | CustomEvent | DynamicFormControlEvent | any) {
		if (this.model.constructor.name === "DynamicInputModel") {
			this.downloadFile.emit({ modelId: this.model.id, documentId: (this.model as DynamicInputModel).documentId, parentId: null });
		} else {
			this.downloadFile.emit({ modelId: ($event as any).modelId, documentId: ($event as any).documentId, parentId: ($event as any).parentId });
		}
    }
    
    onDeleteFile($event: Event | CustomEvent | DynamicFormControlEvent | any) {
		if (this.model.constructor.name === "DynamicInputModel") {
			this.deleteFile.emit({ modelId: this.model.id, documentId: (this.model as DynamicInputModel).documentId, parentId: null });
		} else {
			this.deleteFile.emit({ modelId: ($event as any).modelId, documentId: ($event as any).documentId, parentId: ($event as any).parentId });
		}
    }
    
    constructor(protected changeDetectorRef: ChangeDetectorRef,
                protected validationService: DynamicFormValidationService) { }

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
            }
        }
    }

    ngOnInit(): void {

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
			// console.log("displaying control model", this.model);
			// console.log("workflow relations for this control", this.model.workflowRelation);
			if (this.model.workflowRelation && this.model.workflowRelation.length > 0) {
				let everyoneRelations = this.model.workflowRelation.filter(c => c.group.id === 0);
				everyoneRelations.forEach(eRelation => {
					//console.log("found relations for EVERYONE", eRelation);
					this.onModelHiddenUpdates(RelationUtils.isFormControlToBeHiddenByWorkflow(eRelation, this.workflowActions));
					this.onModelDisabledUpdates(RelationUtils.isFormControlToBeDisabledByWorkflow(eRelation, this.workflowActions));
				});
				//console.log("userGroups", this.userGroups);
				if (this.userGroups && this.userGroups.length > 0) {
					this.userGroups.forEach(group => {
						let groupRelations = this.model.workflowRelation.filter(c => c.group.id === group.id);
						//console.log("groupRelations:", groupRelations);
						if (groupRelations) {
							groupRelations.forEach(gRelation => {
								//console.log("found relations for group", gRelation);
								this.onModelHiddenUpdates(RelationUtils.isFormControlToBeHiddenByWorkflow(gRelation, this.workflowActions));
								this.onModelDisabledUpdates(RelationUtils.isFormControlToBeDisabledByWorkflow(gRelation, this.workflowActions));
							});
						}
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
        return this.hasErrorMessaging && this.control.touched && !this.hasFocus && this.isInvalid;
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
		console.log("CHECKING MODEL", this.model);
		if (this.model.calculatedRelation.initialControlId) {
			console.log("model has calculated relations", this.model.calculatedRelation);
			RelationUtils.getRelatedFormControlsForCalculation(this.model, this.group).forEach(control => {
				this.subscriptions.push(control.valueChanges.subscribe(() => this.updateModelCalculatedValue()));
			});
		}
	}
	
	updateModelCalculatedValue(): void {

		let newValue = RelationUtils.getCalculatedFormControlValue(this.model, this.group);
		console.log("SETTING NEW VALUE", newValue);
		if (newValue) {
			if (this.control.value !== newValue) {
				this.control.setValue(newValue);
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

        if (this.model instanceof DynamicFormValueControlModel
        ) {

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
		if (value !== null) {
			value ? this.model.cls.grid.container = "hidden" : this.model.cls.grid.container = "ui-grid-row";
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