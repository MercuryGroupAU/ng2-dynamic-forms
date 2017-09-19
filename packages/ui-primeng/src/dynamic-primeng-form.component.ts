import { Component, ContentChildren, EventEmitter, Input, Output, QueryList, ViewChildren } from "@angular/core";
import { FormGroup } from "@angular/forms";
import {
    DynamicFormComponent,
    DynamicFormControlEvent,
    DynamicFormControlModel,
    DynamicTemplateDirective,
	DocumentEvent,
	DropEvent,
} from "@ng-dynamic-forms/core";
import { DynamicPrimeNGFormControlComponent } from "./dynamic-primeng-form-control.component";

@Component({
    selector: "dynamic-primeng-form",
    templateUrl: "./dynamic-primeng-form.component.html"
})
export class DynamicPrimeNGFormComponent extends DynamicFormComponent {

    @Input() group: FormGroup;
    @Input() model: DynamicFormControlModel[];
	@Input() dragMode:boolean = false;

    @Output() blur: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
    @Output() change: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
    @Output() focus: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
	@Output() downloadFile: EventEmitter<DocumentEvent> = new EventEmitter<DocumentEvent>();
    @Output() deleteFile: EventEmitter<DocumentEvent> = new EventEmitter<DocumentEvent>();
    @Output() drop: EventEmitter<DropEvent> = new EventEmitter<DropEvent>();

    @ContentChildren(DynamicTemplateDirective) templates: QueryList<DynamicTemplateDirective>;

    @ViewChildren(DynamicPrimeNGFormControlComponent) components: QueryList<DynamicPrimeNGFormControlComponent>;
}