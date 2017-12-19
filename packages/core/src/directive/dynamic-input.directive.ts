import { Directive, HostListener, ElementRef, Input, OnInit, Pipe, PipeTransform } from "@angular/core";


@Pipe({ name: "dynamicTelephonePipe" })
export class DynamicTelephonePipe implements PipeTransform {

    transform(value: number | string): string {
        let str = (value || "").toString();

        const openBracket = str.indexOf("(");
        const closeBracket = str.indexOf(")");
        const plus = str.indexOf("+");
        let countryCode = "";
        let areaCode = "";
        let num = "";

        if (plus >= 0) {
            countryCode = this.stripCountryCode(str);
            str = str.replace(countryCode, "");
        }
        if (openBracket >= 0 && closeBracket >= 0) {
            areaCode = this.stripAreaCode(str);
            str = str.replace(areaCode, "");
        }

        str = str.replace(/ /g, "");
        if (str.length > 4 && str.length < 10) {
            // "1234 4568"
            num = this.format4to10(str);
        } else if (str.length >= 10 && str.length < 12) {
            //"03 1234 5678";
            num = this.format10to12(str);
        } else if (str.length >= 12) {
            // "0987 1234 5678"
            num = this.format12plus(str);
        } else {
            num = str;
        }
        if (areaCode !== "") num = areaCode + " " + num;
        if (countryCode !== "") num = countryCode + " " + num;
        return num;
    }

    parse(value: string): string {
        const stripSpace = value.replace(/ /g, "");
        return stripSpace;
    }

    stripAreaCode(str: string): string {
        const openBracket = str.indexOf("(");
        const closeBracket = str.indexOf(")");
        if (openBracket >= 0 && closeBracket > 0) return str.substring(openBracket, closeBracket + 1);
        return "";
    }

    stripCountryCode(str: string): string {
        const plus = str.indexOf("+");
        if (plus === 0) return str.substring(0, 3);
        return "";
    }

    format4to10(str: string): string {
        return str.substring(0, 4) + " " + str.substring(4);
    }

    format10to12(str: string): string {
        return str.substring(0, 2) + " " + str.substring(2, 6) + " " + str.substring(6);
    }

    format12plus(str: string): string {
        return str.substring(0, 4) + " " + str.substring(4, 8) + " " + str.substring(8);
    }
}


const PADDING = "000000";
const DECIMAL_SEPARATOR = ".";
const THOUSANDS_SEPARATOR = ",";

@Pipe({ name: "dynamicCurrencyPipe" })
export class DynamicCurrencyPipe implements PipeTransform {
    transform(value: number | string, fractionSize: number = 2): string {
        let [integer, fraction = ""] = (value || "").toString().split(DECIMAL_SEPARATOR);
        fraction = fractionSize > 0 ? DECIMAL_SEPARATOR + (fraction + PADDING).substring(0, fractionSize) : "";
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);
        integer = integer.replace("$", "");
        return `$${integer}${fraction}`;
    }

    parse(value: string, fractionSize: number = 2): string {
        const stripSymbol = value.replace("$", "");
        let [integer, fraction = ""] = (stripSymbol || "").split(DECIMAL_SEPARATOR);
        integer = integer.replace(new RegExp(THOUSANDS_SEPARATOR, "g"), "");
        fraction = parseInt(fraction, 10) > 0 && fractionSize > 0 ? DECIMAL_SEPARATOR + (fraction + PADDING).substring(0, fractionSize) : "";
        return integer + fraction;
    }
}

@Directive({ selector: "[dynamicInput]" })
export class DynamicInputDirective implements OnInit {

    public el: HTMLInputElement;
    @Input("dynamicInput") inputType: string;
    constructor(private elementRef: ElementRef, private telephonePipe: DynamicTelephonePipe, private currencyPipe: DynamicCurrencyPipe) {
        this.el = this.elementRef.nativeElement;
    }

    ngOnInit() {
		//disabling this, it looks weird for required phone/currency fields
        //if (this.inputType === "currency" || this.inputType === "telephone") {
        //    if (this.el.style) this.el.style.maxWidth = "180px";
        //}
    }
	
    @HostListener("focus", ["$event.target.value"])
    onFocus(value: any) {
        if (this.inputType === "currency") {
            if (this.el.value !== "") this.el.value = this.currencyPipe.parse(value);
        }
    }

    @HostListener("blur", ["$event.target.value"])
    onBlur(value: any) {
        if (this.inputType === "telephone") {
            if (this.el.value !== "") this.el.value = this.telephonePipe.transform(value);
        }
        if (this.inputType === "currency") {
            if (this.el.value !== "") this.el.value = this.currencyPipe.transform(value);
        }
    }
}

