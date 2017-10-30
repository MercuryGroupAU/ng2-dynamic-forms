import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { TextMaskModule } from "angular2-text-mask";
import { DynamicFormsCoreModule } from "@ng-dynamic-forms/core";
import { DynamicBootstrapFormControlComponent } from "./dynamic-bootstrap-form-control.component";
import { DynamicBootstrapFormComponent } from "./dynamic-bootstrap-form.component";
import { NgxDnDModule } from "@swimlane/ngx-dnd";
import { SignaturePadModule } from "angular2-signaturepad";

@NgModule({

    imports: [
        CommonModule,
        ReactiveFormsModule,
        TextMaskModule,
        DynamicFormsCoreModule,
		NgxDnDModule,
		SignaturePadModule
    ],
    declarations: [
        DynamicBootstrapFormControlComponent,
        DynamicBootstrapFormComponent
    ],
    exports: [
        DynamicFormsCoreModule,
        DynamicBootstrapFormControlComponent,
        DynamicBootstrapFormComponent
    ]
})

export class DynamicFormsBootstrapUIModule {
}