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
	@Input() dragMode = false;
	@Input() readOnlyMode = false;
	@Input() userGroups: any[];
	@Input() workflowActions: any[];

    @Output() blur = new EventEmitter<DynamicFormControlEvent>();
    @Output() change = new EventEmitter<DynamicFormControlEvent>();
    @Output() focus = new EventEmitter<DynamicFormControlEvent>();
	@Output() downloadFile = new EventEmitter<DocumentEvent>();
    @Output() deleteFile = new EventEmitter<DocumentEvent>();
    @Output() drop = new EventEmitter<DropEvent>();

    @ContentChildren(DynamicTemplateDirective) templates: QueryList<DynamicTemplateDirective>;

    @ViewChildren(DynamicBootstrapFormControlComponent) components: QueryList<DynamicBootstrapFormControlComponent>;
}