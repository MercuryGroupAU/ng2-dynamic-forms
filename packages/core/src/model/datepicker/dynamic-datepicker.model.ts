import { ClsConfig } from "../dynamic-form-control.model";
import { serializable } from "../../decorator/serializable.decorator";
import { DynamicDateControlModel, DynamicDateControlModelConfig } from "../dynamic-date-control.model";
import { INgxMyDpOptions, IMyDateModel } from "ngx-mydatepicker";

export const DYNAMIC_FORM_CONTROL_TYPE_DATEPICKER = "DATEPICKER";

export interface DynamicDatePickerModelConfig extends DynamicDateControlModelConfig {

	startDate?: IMyDateModel;
	startDateAdditionalDays?: string;
	maxAdditionalDays?: string;
	minAdditionalDays?: string;   
	dateDefaultsToday?: boolean;
	readOnly?: boolean;
	options?: INgxMyDpOptions;
		
	focusedDate?: string | Date;
    inline?: boolean;
    toggleIcon?: string;
}

export class DynamicDatePickerModel extends DynamicDateControlModel {

	@serializable() startDate: IMyDateModel | null;
	@serializable() startDateAdditionalDays: string | null;
	@serializable() maxAdditionalDays: string | null;
	@serializable() minAdditionalDays: string | null;
	@serializable() dateDefaultsToday: boolean | null;
	@serializable() readOnly:boolean | null;
	@serializable() options:INgxMyDpOptions | null;
	
	@serializable() focusedDate: string | Date | null;
    @serializable() inline: boolean;
    @serializable() toggleIcon: string | null;
    @serializable() readonly type: string = DYNAMIC_FORM_CONTROL_TYPE_DATEPICKER;

    constructor(config: DynamicDatePickerModelConfig, cls?: ClsConfig) {

        super(config, cls);

        this.startDate = config.startDate !== undefined ? config.startDate : null;
		this.startDateAdditionalDays = config.startDateAdditionalDays || null;
		this.maxAdditionalDays = config.maxAdditionalDays || null;
		this.minAdditionalDays = config.minAdditionalDays || null;
		this.dateDefaultsToday = typeof config.dateDefaultsToday === "boolean" ? config.dateDefaultsToday : null;
		this.readOnly = typeof config.readOnly === "boolean" ? config.readOnly : null;
		this.options = config.options ? config.options : { todayBtnTxt: "Today", dateFormat: "dd/mm/yyyy" };
		
		this.focusedDate = config.focusedDate || null;
        this.inline = typeof config.inline === "boolean" ? config.inline : false;
        this.toggleIcon = typeof config.toggleIcon === "string" ? config.toggleIcon : null;
    }
}