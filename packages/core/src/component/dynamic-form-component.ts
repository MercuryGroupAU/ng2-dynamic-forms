import { EventEmitter, QueryList } from "@angular/core";
import { FormGroup } from "@angular/forms";
import {
    DynamicFormControlComponent,
    DynamicFormControlEvent,
    DynamicFormControlEventType,
	DocumentEvent,
	DropEvent,
} from "./dynamic-form-control.component";
import { DynamicFormControlModel } from "../model/dynamic-form-control.model";
import { DynamicTemplateDirective } from "../directive/dynamic-template.directive";

export abstract class DynamicFormComponent {

    group: FormGroup;
    model: DynamicFormControlModel[];

    components: QueryList<DynamicFormControlComponent>;
    templates: QueryList<DynamicTemplateDirective>;

    blur: EventEmitter<DynamicFormControlEvent>;
    change: EventEmitter<DynamicFormControlEvent>;
    focus: EventEmitter<DynamicFormControlEvent>;
	downloadFile: EventEmitter<DocumentEvent>;
	deleteFile: EventEmitter<DocumentEvent>;
    drop: EventEmitter<DropEvent>;

    trackByFn(_index: number, model: DynamicFormControlModel): string {
        return model.id;
    }

    onEvent($event: DynamicFormControlEvent, type: DynamicFormControlEventType) {

        switch (type) {

            case DynamicFormControlEventType.Blur:
                this.blur.emit($event);
                break;

            case DynamicFormControlEventType.Change:
                this.change.emit($event);
                break;

            case DynamicFormControlEventType.Focus:
                this.focus.emit($event);
                break;
        }
    }
	
	onFileDownloadEvent($event: DocumentEvent) {
		this.downloadFile.emit($event);
	}
	
	onFileDeleteEvent($event: DocumentEvent) {
		this.deleteFile.emit($event);
	}
	
	onDropEvent($event: DropEvent) {
		this.drop.emit($event);
	}
}
