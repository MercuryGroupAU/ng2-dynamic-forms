import { Component, Input, TemplateRef } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal/bs-modal-ref.service";

@Component({
    selector: "dynamic-help-modal",
	exportAs: "dynamic-help-modal",
    template:`
	<a (click)="openModal(helpModal)" href="#" class="icon"><i class="fa fa-question-circle fa-fw" aria-hidden="true"> </i></a>
	<ng-template #helpModal>
		<div class="modal-header">
			<button type="button" class="close pull-right" aria-label="Close" (click)="helpModalRef.hide()">
				<i class="fa fa-window-close-o" aria-hidden="true" style="color: red"></i>
			</button>
			<h4 class="modal-title pull-left"><i class="fa fa-question-circle fa-fw fa-2x" style="color: green" aria-hidden="true"></i> {{helpTitle}}</h4>
		</div>
		<div class="modal-body">
			<ng-content></ng-content>
		</div>
		<div class="modal-footer">
			<button type="button" class="btn btn-success" (click)="helpModalRef.hide()">Close <i class="fa fa-check" aria-hidden="true"></i></button>
		</div>
	</ng-template>
	`
})
export class DynamicHelpModalComponent {
    constructor(private modalService: BsModalService) { }
    @Input() helpTitle: string;
    helpModalRef: BsModalRef;
    
    openModal(template: TemplateRef<any>){
        this.helpModalRef = this.modalService.show(template, { class: "modal-md" });
        return false;
    }
}