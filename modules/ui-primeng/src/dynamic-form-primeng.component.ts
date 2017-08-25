import {
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    QueryList,
    SimpleChanges,
    ViewChild
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import {
    AutoComplete,
    Calendar,
    Checkbox,
    Chips,
    Dropdown,
    Editor,
    InputSwitch,
    MultiSelect,
    Slider
} from "primeng/primeng";
import {
    DynamicFormValidationService,
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
    DYNAMIC_FORM_CONTROL_TYPE_RADIO_GROUP,
    DYNAMIC_FORM_CONTROL_TYPE_SELECT,
    DYNAMIC_FORM_CONTROL_TYPE_SLIDER,
    DYNAMIC_FORM_CONTROL_TYPE_SWITCH,
    DYNAMIC_FORM_CONTROL_TYPE_TEXTAREA,
    DYNAMIC_FORM_CONTROL_TYPE_TIMEPICKER,
	DYNAMIC_FORM_CONTROL_TYPE_DISCLAIMER,
    Utils
} from "@ng2-dynamic-forms/core";
import {
    PrimeNGFormControlType,
    PRIME_NG_VIEW_CHILD_SELECTOR,
    PRIME_NG_AUTOCOMPLETE_TEMPLATE_DIRECTIVES,
    PRIME_NG_CHIPS_TEMPLATE_DIRECTIVES,
    PRIME_NG_DROPDOWN_LIST_TEMPLATE_DIRECTIVES
} from "./dynamic-form-primeng.const";

export type PrimeNGFormControlComponent = AutoComplete | Calendar | Checkbox | Chips | Dropdown | Editor | InputSwitch |
    MultiSelect | Slider;

@Component({

    moduleId: module.id,
    selector: "dynamic-form-primeng-control",
    templateUrl: "./dynamic-form-primeng.component.html"
})
export class DynamicFormPrimeNGComponent extends DynamicFormControlComponent implements OnChanges {

    @Input() bindId: boolean = true;
    @Input() context: DynamicFormArrayGroupModel = null;
    @Input() group: FormGroup;
    @Input() hasErrorMessaging: boolean = false;
    @Input() model: DynamicFormControlModel;
    @Input() nestedTemplates: QueryList<DynamicTemplateDirective>;
	@Input() dragMode:boolean = false;
    @Output() blur: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
    @Output() change: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
    @Output() focus: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
	@Output() downloadFile: EventEmitter<DocumentEvent> = new EventEmitter<DocumentEvent>();
	@Output() deleteFile: EventEmitter<DocumentEvent> = new EventEmitter<DocumentEvent>();
	@Output() drop: EventEmitter<DropEvent> = new EventEmitter<DropEvent>();
	
    @ContentChildren(DynamicTemplateDirective) contentTemplates: QueryList<DynamicTemplateDirective>;

    @ViewChild(PRIME_NG_VIEW_CHILD_SELECTOR) pViewChild: PrimeNGFormControlComponent | undefined;

    suggestions: string[];
    type: PrimeNGFormControlType | null;

    constructor(protected validationService: DynamicFormValidationService) {
        super(validationService);
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);

        if (changes["model"]) {
            this.type = DynamicFormPrimeNGComponent.getFormControlType(this.model);
        }
    }

    protected setTemplateDirective(directive: DynamicTemplateDirective): void {

        if (this.pViewChild) {

            let templateDirectives: any = DynamicFormPrimeNGComponent.getTemplateDirectives(this.pViewChild);

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

    onAutoComplete($event: any): void {
        this.suggestions = (this.model as DynamicInputModel).list.map(item => item);
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

                if (inputModel.list) {
                    return PrimeNGFormControlType.AutoComplete;

                } else if (inputModel.multiple) {
                    return PrimeNGFormControlType.Chips;

                } else {
                    return PrimeNGFormControlType.Input;
                }

            case DYNAMIC_FORM_CONTROL_TYPE_RADIO_GROUP:
                return PrimeNGFormControlType.RadioGroup;

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