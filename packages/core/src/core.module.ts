import { CommonModule } from "@angular/common";
import { NgModule, ModuleWithProviders } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DynamicFormService } from "./service/dynamic-form.service";
import { DynamicFormValidationService } from "./service/dynamic-form-validation.service";
import { DynamicIdDirective } from "./directive/dynamic-id.directive";
import { DynamicTemplateDirective } from "./directive/dynamic-template.directive";
import { DynamicInputDirective, DynamicTelephonePipe, DynamicCurrencyPipe } from "./directive/dynamic-input.directive";

@NgModule({

    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    declarations: [
        DynamicIdDirective,
        DynamicTemplateDirective,
		DynamicInputDirective,
		DynamicTelephonePipe,
		DynamicCurrencyPipe
    ],
    exports: [
        DynamicIdDirective,
        DynamicTemplateDirective,
		DynamicInputDirective,
		DynamicTelephonePipe,
		DynamicCurrencyPipe
    ]
})

export class DynamicFormsCoreModule {

    static forRoot(): ModuleWithProviders {

        return {

            ngModule: DynamicFormsCoreModule,

            providers: [
                DynamicFormService,
                DynamicFormValidationService,
				DynamicTelephonePipe,
				DynamicCurrencyPipe
            ]
        };
    }
}