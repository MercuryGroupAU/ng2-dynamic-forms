export const enum PrimeNGFormControlType {

    Array = 1, //"ARRAY",
    AutoComplete = 2, //"AUTOCOMPLETE",
    Calendar = 3, //"CALENDAR",
    Checkbox = 4, //"CHECKBOX",
    Chips = 5, //"CHIPS",
    Dropdown = 6, //"DROPDOWN",
    Editor = 7, //"EDITOR",
    Group = 8, //"GROUP",
    Input = 9, //"INPUT",
    InputSwitch = 10, //"INPUT_SWITCH",
    MultiSelect = 11, //"MULTI_SELECT",
    RadioGroup = 12, //"RADIO_GROUP",
    Slider = 13, //"SLIDER",
    TextArea = 14, //"TEXTAREA"
	Disclaimer = 15 //"DISCLAIMER"
}

export const PRIME_NG_VIEW_CHILD_SELECTOR = `pAutoComplete,pCalendar,pCheckbox,pChips,pDropdown,pEditor,pInputText,
    pInputSwitch,pMultiSelect,pSlider,pInputTextarea`;

export const PRIME_NG_AUTOCOMPLETE_TEMPLATE_DIRECTIVES = {

    itemTemplate: "itemTemplate",
    selectedItemTemplate: "selectedItemTemplate"
};

export const PRIME_NG_CHIPS_TEMPLATE_DIRECTIVES = {

    itemTemplate: "itemTemplate"
};

export const PRIME_NG_DROPDOWN_LIST_TEMPLATE_DIRECTIVES = {

    itemTemplate: "itemTemplate"
};