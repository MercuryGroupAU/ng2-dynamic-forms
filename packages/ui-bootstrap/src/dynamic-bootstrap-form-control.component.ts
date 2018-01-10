import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    QueryList,
	ViewChild,
    SimpleChanges
} from "@angular/core";
import { FormGroup, FormArray } from "@angular/forms";
import {
    DynamicFormValidationService,
	DynamicFormService,
    DynamicFormControlModel,
    DynamicFormArrayGroupModel,
	DynamicInputModel,
    DynamicFormControlComponent,
    DynamicFormControlEvent,
	DocumentEvent,
	DropEvent,
    DynamicTemplateDirective,
    DYNAMIC_FORM_CONTROL_TYPE_ARRAY,
    DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX,
    DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX_GROUP,
    DYNAMIC_FORM_CONTROL_TYPE_GROUP,
    DYNAMIC_FORM_CONTROL_TYPE_INPUT,
    DYNAMIC_FORM_CONTROL_TYPE_RADIO_GROUP,
    DYNAMIC_FORM_CONTROL_TYPE_SELECT,
    DYNAMIC_FORM_CONTROL_TYPE_TEXTAREA,
	DYNAMIC_FORM_CONTROL_TYPE_DISCLAIMER,
	DYNAMIC_FORM_CONTROL_TYPE_SIGNATURE,
	DynamicFormValueControlModel,
	DynamicFormArrayModel
} from "@ng-dynamic-forms/core";
import { SignaturePad } from "angular2-signaturepad/signature-pad";

export const enum BootstrapFormControlType {

    Array = 1, //"ARRAY",
    Checkbox = 2, //"CHECKBOX",
    Group = 3, //"GROUP",
    Input = 4, //"INPUT",
    RadioGroup = 5, //"RADIO_GROUP",
    Select = 6, //"SELECT",
    TextArea = 7, //"TEXTAREA"
	Disclaimer = 8, //"DISCLAIMER",
	Signature = 9 //"SIGNATURE"
}

@Component({
    selector: "dynamic-bootstrap-form-control,dynamic-form-bootstrap-control",
    templateUrl: "./dynamic-bootstrap-form-control.component.html"
})
export class DynamicBootstrapFormControlComponent extends DynamicFormControlComponent implements AfterViewInit, OnChanges {

    @ContentChildren(DynamicTemplateDirective) contentTemplates: QueryList<DynamicTemplateDirective>;
    @Input("templates") inputTemplates: QueryList<DynamicTemplateDirective>;

	@Input() parent: any;
    @Input() asBootstrapFormGroup: boolean = true;
    @Input() bindId: boolean = true;
    @Input() context: DynamicFormArrayGroupModel | null = null;
    @Input() group: FormGroup;
    @Input() hasErrorMessaging: boolean = false;
    @Input() model: DynamicFormControlModel;
	@Input() formModel: DynamicFormControlModel[];
	@Input() dragMode:boolean = false;
	@Input() readOnlyMode:boolean = false;
	@Input() userGroups: any;
	@Input() workflowActions: any;

    @Output() blur: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
    @Output() change: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
    @Output() focus: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
	@Output() downloadFile: EventEmitter<DocumentEvent> = new EventEmitter<DocumentEvent>();
    @Output() deleteFile: EventEmitter<DocumentEvent> = new EventEmitter<DocumentEvent>();
    @Output() drop: EventEmitter<DropEvent> = new EventEmitter<DropEvent>();

    type: BootstrapFormControlType | null;

	@ViewChild(SignaturePad) signaturePad: SignaturePad;
	
	showArrayModal: boolean = false;
	arrayItem: DynamicFormArrayGroupModel;
	isEditArrayItem: boolean = false;
    editedArrayitemIndex?: number;
    arrayItemGroup: FormGroup;
	groupPrototypeGroup: FormGroup;
	
	addArrayItem() {
		this.arrayItem = new DynamicFormArrayGroupModel(null, (this.model as DynamicFormArrayModel).groupFactory());
	    this.arrayItemGroup = this.dynamicFormService.createFormGroup(this.arrayItem.group);
		this.showArrayModal = true;
	}
	
    cancelArrayItem() {
        this.arrayItem = null;
        this.arrayItemGroup = null;
		this.showArrayModal = false;
		this.isEditArrayItem = false;
		this.editedArrayitemIndex = null;
	}
	
	editArrayItem(index: number) {
		this.showArrayModal = true;
		this.isEditArrayItem = true;
		this.editedArrayitemIndex = index;
		this.arrayItem = new DynamicFormArrayGroupModel(null, (this.model as DynamicFormArrayModel).groupFactory(), (this.model as DynamicFormArrayModel).groups[index].index);
		this.arrayItem.group.forEach(ctrl => {
			let octrl = (this.model as DynamicFormArrayModel).groups[index].group.filter(c => c.id === ctrl.id)[0];
			(ctrl as DynamicFormValueControlModel<any>).value = (octrl as DynamicFormValueControlModel<any>).value;
			if (ctrl.type === "INPUT" && (ctrl as DynamicInputModel).inputType === "file") {
				(ctrl as DynamicInputModel).files = (octrl as DynamicInputModel).files;
				if ((octrl as DynamicInputModel).documentId) {
					(ctrl as DynamicInputModel).documentId = (octrl as DynamicInputModel).documentId;
					(ctrl as DynamicInputModel).documentName = (octrl as DynamicInputModel).documentName;
				} else if ((octrl as DynamicInputModel).files && (octrl as DynamicInputModel).files.length > 0) {
				}   (ctrl as DynamicInputModel).documentName = (octrl as DynamicInputModel).files[0].name;
			}
		});
	    this.arrayItemGroup = this.dynamicFormService.createFormGroup(this.arrayItem.group);
	}
	
	saveArrayItem() {
		let formArrayControl = this.group.get(this.model.id) as FormArray; 
		if (this.isEditArrayItem) {
			(this.model as DynamicFormArrayModel).groups[this.editedArrayitemIndex].group = this.arrayItem.group; 
		}
		else {
			this.dynamicFormService.addExistingFormArrayGroup(formArrayControl, (this.model as DynamicFormArrayModel), this.arrayItem.group);
		}
        this.arrayItem = null;
	    this.arrayItemGroup = null;
		this.editedArrayitemIndex = null;
		this.showArrayModal = false;
		this.isEditArrayItem = false;
	}
	
	removeArrayLine(index: number) {
        let formArrayControl = this.group.get(this.model.id) as FormArray;
        this.dynamicFormService.removeFormArrayGroup(index, formArrayControl, (this.model as DynamicFormArrayModel));
    }
	
	public signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
        "minWidth": 1,
        "penColor": "rgb(0, 38, 255)",
        "canvasWidth": 390,
        "canvasHeight": 100
    };
  
	isModelReadOnly() :boolean {
		if (this.readOnlyMode) {
			if (this.model.workflowRelation && this.model.workflowRelation.length > 0) {
				return false;
			}
			return true;
		}
		return false;
	}
  
	ngAfterViewInit() {
		if (this.signaturePad) {
			this.signaturePad.set("minWidth", 1);
			this.signaturePad.set("maxWidth", 1);
			this.signaturePad.clear();
			if ((this.model as DynamicFormValueControlModel<string>).value) {
				this.signaturePad.fromDataURL((this.model as DynamicFormValueControlModel<string>).value, this.signaturePadOptions);
			}
		}
		this.setTemplates();
		this.changeDetectorRef.detectChanges();
	}

	drawComplete() {
		if (!this.isModelReadOnly()) {
			this.control.setValue(this.signaturePad.toDataURL());
		}
	}
	
    //onDragover(event: DragEvent): void {
		// if (this.model.type === DYNAMIC_FORM_CONTROL_TYPE_GROUP)
			// event.stopPropagation();
    //}
	
	onResetSignature() {
		if (this.signaturePad) {
			this.signaturePad.clear();
			this.control.setValue(null);
		}
	}
  
	getStyle() {
		if (!this.dragMode) {
			return [this.model.cls.element.container, this.model.cls.grid.container];
		} else { return [];}
	}
	
    constructor(protected changeDetectorRef: ChangeDetectorRef,
                protected validationService: DynamicFormValidationService,
				protected dynamicFormService: DynamicFormService) {

        super(changeDetectorRef, validationService, dynamicFormService);
    }

    ngOnChanges(changes: SimpleChanges) {
		if (this.model.type === "ARRAY") {
			this.groupPrototypeGroup = this.dynamicFormService.createFormGroup((this.model as DynamicFormArrayModel).groupPrototype, null, this.model);
		}
		
        super.ngOnChanges(changes);

        if (changes["model"]) {
            this.type = DynamicBootstrapFormControlComponent.getFormControlType(this.model);
        }
    }

    static getFormControlType(model: DynamicFormControlModel): BootstrapFormControlType | null {

        switch (model.type) {

            case DYNAMIC_FORM_CONTROL_TYPE_ARRAY:
                return BootstrapFormControlType.Array;

            case DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX:
                return BootstrapFormControlType.Checkbox;

            case DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX_GROUP:
            case DYNAMIC_FORM_CONTROL_TYPE_GROUP:
                return BootstrapFormControlType.Group;

            case DYNAMIC_FORM_CONTROL_TYPE_INPUT:
                return BootstrapFormControlType.Input;

            case DYNAMIC_FORM_CONTROL_TYPE_RADIO_GROUP:
                return BootstrapFormControlType.RadioGroup;

            case DYNAMIC_FORM_CONTROL_TYPE_SELECT:
                return BootstrapFormControlType.Select;

            case DYNAMIC_FORM_CONTROL_TYPE_TEXTAREA:
                return BootstrapFormControlType.TextArea;

			case DYNAMIC_FORM_CONTROL_TYPE_DISCLAIMER:
                return BootstrapFormControlType.Disclaimer;
				
			case DYNAMIC_FORM_CONTROL_TYPE_SIGNATURE:
                return BootstrapFormControlType.Signature;
				
            default:
                return null;
        }
    }
}