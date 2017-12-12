import {
    ChangeDetectorRef,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    QueryList,
    SimpleChanges,
    ViewChild, AfterViewInit
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import {
    AutoComplete,
    Calendar,
    Checkbox,
    Chips,
    Dropdown,
    Editor,
    InputMask,
    InputSwitch,
    MultiSelect,
    Rating,
    Slider,
    Spinner
} from "primeng/primeng";
import {
    DynamicFormValidationService,
	DynamicFormService,
    DynamicFormControlComponent,
    DynamicFormControlModel,
    DynamicFormArrayGroupModel,
    DynamicFormControlEvent,
	DocumentEvent,
	DropEvent,
    DynamicTemplateDirective,
    DynamicInputModel,
    DynamicSelectModel,
    DYNAMIC_FORM_CONTROL_TYPE_ARRAY,
    DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX,
    DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX_GROUP,
    DYNAMIC_FORM_CONTROL_TYPE_EDITOR,
    DYNAMIC_FORM_CONTROL_TYPE_DATEPICKER,
    DYNAMIC_FORM_CONTROL_TYPE_GROUP,
    DYNAMIC_FORM_CONTROL_TYPE_INPUT,
    DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER,
    DYNAMIC_FORM_CONTROL_TYPE_RADIO_GROUP,
    DYNAMIC_FORM_CONTROL_TYPE_RATING,
    DYNAMIC_FORM_CONTROL_TYPE_SELECT,
    DYNAMIC_FORM_CONTROL_TYPE_SLIDER,
    DYNAMIC_FORM_CONTROL_TYPE_SWITCH,
    DYNAMIC_FORM_CONTROL_TYPE_TEXTAREA,
    DYNAMIC_FORM_CONTROL_TYPE_TIMEPICKER,
	DYNAMIC_FORM_CONTROL_TYPE_DISCLAIMER,
	DYNAMIC_FORM_CONTROL_TYPE_SIGNATURE,
    Utils,
	DynamicFormValueControlModel
} from "@ng-dynamic-forms/core";
import {
    PrimeNGFormControlType,
    PRIME_NG_VIEW_CHILD_SELECTOR,
    PRIME_NG_AUTOCOMPLETE_TEMPLATE_DIRECTIVES,
    PRIME_NG_CHIPS_TEMPLATE_DIRECTIVES,
    PRIME_NG_DROPDOWN_LIST_TEMPLATE_DIRECTIVES
} from "./dynamic-primeng-form.const";
import { SignaturePad } from "angular2-signaturepad/signature-pad";
export type PrimeNGFormControlComponent = AutoComplete | Calendar | Checkbox | Chips | Dropdown | Editor | InputMask |
    InputSwitch | MultiSelect | Rating | Slider | Spinner;

@Component({
    selector: "dynamic-primeng-form-control,dynamic-form-primeng-control",
    templateUrl: "./dynamic-primeng-form-control.component.html"
})
export class DynamicPrimeNGFormControlComponent extends DynamicFormControlComponent implements OnChanges, AfterViewInit {

    @ContentChildren(DynamicTemplateDirective) contentTemplates: QueryList<DynamicTemplateDirective>;
    @Input("templates") inputTemplates: QueryList<DynamicTemplateDirective>;

    @Input() bindId: boolean = true;
    @Input() context: DynamicFormArrayGroupModel | null = null;
    @Input() group: FormGroup;
    @Input() hasErrorMessaging: boolean = false;
    @Input() model: DynamicFormControlModel;
    @Input() dragMode:boolean = false;

    @Output() blur: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
    @Output() change: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
    @Output() focus: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
    @Output() downloadFile: EventEmitter<DocumentEvent> = new EventEmitter<DocumentEvent>();
    @Output() deleteFile: EventEmitter<DocumentEvent> = new EventEmitter<DocumentEvent>();
    @Output() drop: EventEmitter<DropEvent> = new EventEmitter<DropEvent>();

    @ViewChild(PRIME_NG_VIEW_CHILD_SELECTOR) pViewChild: PrimeNGFormControlComponent | undefined;

    suggestions: string[];

    type: PrimeNGFormControlType | null;

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
    // will be notified of szimek/signature_pad's onEnd event
	//console.log("finished sign", this.signaturePad);
    //console.log("dataUrl", this.signaturePad.toDataURL());
	//(this.model as DynamicFormValueControlModel<string>).setValue(this.signaturePad.toDataURL());
	this.control.setValue(this.signaturePad.toDataURL());
  }

  onResetSignature() {
	  if (this.signaturePad) {
		  this.signaturePad.clear();
		  this.control.setValue(null);
		  //(this.model as DynamicFormValueControlModel<string>).value = null;
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
        super.ngOnChanges(changes);

        if (changes["model"]) {
            this.type = DynamicPrimeNGFormControlComponent.getFormControlType(this.model);
        }
    }

    protected setTemplateDirective(directive: DynamicTemplateDirective): void {

        if (this.pViewChild && (directive.modelId === this.model.id || directive.modelType === this.model.type)) {

            let templateDirectives: any = DynamicPrimeNGFormControlComponent.getTemplateDirectives(this.pViewChild);

            Object.keys(templateDirectives || {}).forEach((key: string) => {

                if (templateDirectives[key] === directive.as) {
                    (this.pViewChild as any)[key] = directive.templateRef;
                }
            });
        }
    }

    protected setTemplates(): void {

        super.setTemplates();

        this.templates
            .filter(directive => Utils.isString(directive.as))
            .forEach(directive => this.setTemplateDirective(directive));
    }

    onAutoComplete(_$event: any): void {
        let inputModel = this.model as DynamicInputModel;

        if(Array.isArray(inputModel.list)) {
            this.suggestions = inputModel.list.map(item => item);
        }
    }

    static getFormControlType(model: DynamicFormControlModel): PrimeNGFormControlType | null {

        switch (model.type) {

            case DYNAMIC_FORM_CONTROL_TYPE_ARRAY:
                return PrimeNGFormControlType.Array;

            case DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX:
                return PrimeNGFormControlType.Checkbox;

            case DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX_GROUP:
            case DYNAMIC_FORM_CONTROL_TYPE_GROUP:
                return PrimeNGFormControlType.Group;

            case DYNAMIC_FORM_CONTROL_TYPE_DATEPICKER:
            case DYNAMIC_FORM_CONTROL_TYPE_TIMEPICKER:
                return PrimeNGFormControlType.Calendar;

            case DYNAMIC_FORM_CONTROL_TYPE_EDITOR:
                return PrimeNGFormControlType.Editor;

            case DYNAMIC_FORM_CONTROL_TYPE_INPUT:
                let inputModel = model as DynamicInputModel;

                if (inputModel.inputType === DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER) {
                    return PrimeNGFormControlType.Spinner;

                } else if (inputModel.mask) {
                    return PrimeNGFormControlType.InputMask;

                } else if (Array.isArray(inputModel.list)) {
                    return PrimeNGFormControlType.AutoComplete;

                } else if (inputModel.multiple) {
                    return PrimeNGFormControlType.Chips;

                } else {
                    return PrimeNGFormControlType.Input;
                }

            case DYNAMIC_FORM_CONTROL_TYPE_RADIO_GROUP:
                return PrimeNGFormControlType.RadioGroup;

            case DYNAMIC_FORM_CONTROL_TYPE_RATING:
                return PrimeNGFormControlType.Rating;

            case DYNAMIC_FORM_CONTROL_TYPE_SELECT:
                let selectModel = model as DynamicSelectModel<any>;

                return selectModel.multiple ? PrimeNGFormControlType.MultiSelect : PrimeNGFormControlType.Dropdown;

            case DYNAMIC_FORM_CONTROL_TYPE_SLIDER:
                return PrimeNGFormControlType.Slider;

            case DYNAMIC_FORM_CONTROL_TYPE_SWITCH:
                return PrimeNGFormControlType.InputSwitch;

            case DYNAMIC_FORM_CONTROL_TYPE_TEXTAREA:
                return PrimeNGFormControlType.TextArea;
				
            case DYNAMIC_FORM_CONTROL_TYPE_DISCLAIMER:
                return PrimeNGFormControlType.Disclaimer;
				
			case DYNAMIC_FORM_CONTROL_TYPE_SIGNATURE:
                return PrimeNGFormControlType.Signature;

            default:
                return null;
        }
    }

    static getTemplateDirectives(component: PrimeNGFormControlComponent): any | null {

        switch (component.constructor) {

            case AutoComplete:
                return PRIME_NG_AUTOCOMPLETE_TEMPLATE_DIRECTIVES;

            case Chips:
                return PRIME_NG_CHIPS_TEMPLATE_DIRECTIVES;

            case Dropdown:
                return PRIME_NG_DROPDOWN_LIST_TEMPLATE_DIRECTIVES;

            default:
                return null;
        }
    }
}