import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TextMaskModule } from "angular2-text-mask";
import { DynamicFormsCoreModule } from "@ng-dynamic-forms/core";
import { DynamicBootstrapFormControlComponent } from "./dynamic-bootstrap-form-control.component";
import { DynamicBootstrapFormComponent } from "./dynamic-bootstrap-form.component";
import { SignaturePadModule } from "angular2-signaturepad";
import { AlertModule } from "ngx-bootstrap/alert";
import { TabsModule } from "ngx-bootstrap/tabs";
import { SortableModule } from "ngx-bootstrap/sortable";
import { FormSortableComponent } from "./formsortable.component";
import { FormDraggableItemService } from "./form-draggable-item.service";
import { ModalModule } from "ngx-bootstrap/modal";

@NgModule({

    imports: [
        CommonModule,
		FormsModule,
        ReactiveFormsModule,
        TextMaskModule,
        DynamicFormsCoreModule,
        SignaturePadModule,
        AlertModule.forRoot(),
        TabsModule.forRoot(),
        SortableModule.forRoot(),
		ModalModule.forRoot()
    ],
    declarations: [
        DynamicBootstrapFormControlComponent,
        DynamicBootstrapFormComponent,
        FormSortableComponent
    ],
    exports: [
        DynamicFormsCoreModule,
        DynamicBootstrapFormControlComponent,
        DynamicBootstrapFormComponent,
        FormSortableComponent,
        AlertModule,
        TabsModule,
        SortableModule,
		ModalModule
    ]
})

export class DynamicFormsBootstrapUIModule {
    static forRoot(): ModuleWithProviders {

        return {

            ngModule: DynamicFormsBootstrapUIModule,

            providers: [
                FormDraggableItemService
            ]
        };
    }
}