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
import { FormGroup } from "@angular/forms";
import {
    DynamicFormValidationService,
    DynamicFormControlModel,
    DynamicFormArrayGroupModel,
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
	DynamicFormValueControlModel
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
	
	public signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
		"minWidth": 1,
		"canvasWidth": 200,
		"canvasHeight": 100
    };
  
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
		this.control.setValue(this.signaturePad.toDataURL());
	}

    onDragover(event: DragEvent): void {
		if (this.model.type === DYNAMIC_FORM_CONTROL_TYPE_GROUP)
			event.stopPropagation();
    }
	
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
                protected validationService: DynamicFormValidationService) {

        super(changeDetectorRef, validationService);
    }

    ngOnChanges(changes: SimpleChanges) {
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