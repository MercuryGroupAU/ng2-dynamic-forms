export class Utils {

    static equals<T>(value: T, ...comparables: T[]): boolean {
        return !!(comparables.find(comparable => value === comparable));
    }

    static isBoolean(value: any): boolean {
        return typeof value === "boolean";
    }

    static isDefined(value: any): boolean {
        return value !== undefined && value !== null;
    }

    static isFunction(value: any): boolean {
        return typeof value === "function";
    }

    static isNumber(value: any): boolean {
        return typeof value === "number";
    }

    static isObject(value: any): boolean {
        return typeof value === "object";
    }

    static isTrueObject(value: any): boolean {
        return Utils.isDefined(value) && Utils.isObject(value);
    }

    static isNonEmptyObject(value: object): boolean {
        return Utils.isTrueObject(value) && Object.getOwnPropertyNames(value).length > 0;
    }

    static isString(value: any): boolean {
        return typeof value === "string";
    }

    static isEmptyString(value: string | null | undefined): boolean {
        return typeof value !== "string" || value.length === 0;
    }

    static maskToString(mask: string | RegExp | (string | RegExp)[]): string | string[] | null {

        if (Utils.isString(mask)) {

            return mask as string;

        } else if (mask instanceof RegExp) {

            return mask.toString();

        } else if (Array.isArray(mask)) {

            return mask.map(value => Utils.maskToString(value)) as string[];
        }

        return null;
    }

    static maskFromString(mask: string | string[]): string | RegExp | (string | RegExp)[] | null {

        if (typeof mask === "string") {

            let isRegExp = (mask as string).startsWith("/") && (mask as string).endsWith("/");

            return isRegExp ? new RegExp((mask as string).slice(1, mask.length - 1)) : mask;

        } else if (Array.isArray(mask)) {

            return (mask as string[]).map(value => Utils.maskFromString(value)) as string[];
        }

        return null;
    }

    static merge(baseValue: any, defaultValue: any): any {

        if (!Utils.isDefined(baseValue)) {
            return defaultValue;
        }

        if (Utils.isObject(baseValue)) {

            for (let property in baseValue) {

                if (baseValue.hasOwnProperty(property) && Utils.isObject(baseValue[property])) {

                    baseValue[property] = Utils.merge(baseValue[property], defaultValue ? defaultValue[property] : null);
                }
            }

            return defaultValue ? Object.assign(defaultValue, baseValue) : baseValue;
        }

        return baseValue;
    }

    static parseJSONReviver(_key: string, value: any): any {

        let regexDateISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

        return Utils.isString(value) && regexDateISO.test(value) ? new Date(value) : value;
    }
	
	static addDaysToToday(days: number):string {
		let date: Date;
		date = new Date();
		date.setDate(date.getDate() + days);
		var curr_date = date.getDate();
		var curr_month = date.getMonth() + 1;
		var curr_year = date.getFullYear();
		let dateString = curr_year + "-" + this.digit(curr_month) + "-" + this.digit(curr_date);
		return dateString;
	}
	
	static changeDateFormat(days: number): string {
        let date: Date;
		date = new Date();
		date.setDate(date.getDate() + days);
		var month = this.digit((date.getMonth() + 1));
        return date.getDate() + "/" + month + "/" + date.getFullYear();
	}
	static digit(n:number):string {
		return n > 9 ? "" + n: "0" + n;
	}
	static addDaysToToday2(days: number):any {
		let date: Date;
		date = new Date();
		date.setDate(date.getDate() + days);
		var ret = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
		console.log("RETURNING DATE", ret);
		return ret;
	}
}