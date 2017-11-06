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
import { DynamicBootstrapFormControlComponent } from "./dynamic-bootstrap-form-control.component";

@Component({
    selector: "dynamic-bootstrap-form",
    templateUrl: "./dynamic-bootstrap-form.component.html"
})
export class DynamicBootstrapFormComponent extends DynamicFormComponent {

    @Input() group: FormGroup;
    @Input() model: DynamicFormControlModel[];
	@Input() dragMode: boolean = false;
	@Input() userRole: any;
	@Input() workflowState: any;

    @Output() blur: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
    @Output() change: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
    @Output() focus: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
	@Output() downloadFile: EventEmitter<DocumentEvent> = new EventEmitter<DocumentEvent>();
    @Output() deleteFile: EventEmitter<DocumentEvent> = new EventEmitter<DocumentEvent>();
    @Output() drop: EventEmitter<DropEvent> = new EventEmitter<DropEvent>();

    @ContentChildren(DynamicTemplateDirective) templates: QueryList<DynamicTemplateDirective>;

    @ViewChildren(DynamicBootstrapFormControlComponent) components: QueryList<DynamicBootstrapFormControlComponent>;
}