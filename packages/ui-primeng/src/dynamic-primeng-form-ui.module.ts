import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { DynamicFormsCoreModule } from "@ng-dynamic-forms/core";
import { DynamicPrimeNGFormControlComponent } from "./dynamic-primeng-form-control.component";
import {
    AutoCompleteModule,
    CalendarModule,
    CheckboxModule,
    ChipsModule,
    DropdownModule,
    EditorModule,
    InputMaskModule,
    InputSwitchModule,
    InputTextModule,
    InputTextareaModule,
    MultiSelectModule,
    RadioButtonModule,
    RatingModule,
    SliderModule,
    SpinnerModule,
	FieldsetModule
} from "primeng/primeng";
import { DynamicPrimeNGFormComponent } from "./dynamic-primeng-form.component";
import { NgxDnDModule } from "@swimlane/ngx-dnd";

@NgModule({

    imports: [
        CommonModule,
        ReactiveFormsModule,
        DynamicFormsCoreModule,
        AutoCompleteModule,
        CalendarModule,
        CheckboxModule,
        ChipsModule,
        DropdownModule,
        EditorModule,
        InputMaskModule,
        InputSwitchModule,
        InputTextModule,
        InputTextareaModule,
        MultiSelectModule,
        RadioButtonModule,
        RatingModule,
        SliderModule,
        SpinnerModule,
		FieldsetModule,
		NgxDnDModule
    ],
    declarations: [
        DynamicPrimeNGFormControlComponent,
        DynamicPrimeNGFormComponent
    ],
    exports: [
        DynamicFormsCoreModule,
        DynamicPrimeNGFormControlComponent,
        DynamicPrimeNGFormComponent
    ]
})

export class DynamicFormsPrimeNGUIModule {
}