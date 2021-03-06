import { Component, Input, Output, TemplateRef, ContentChild, EventEmitter, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormGroup, AbstractControl } from "@angular/forms";
import { DynamicFormControlModel } from "@ng-dynamic-forms/core";
import { FormDraggableItemService } from "./form-draggable-item.service";
import { FormDraggableItem } from "./form-draggable-item";
import { FormSortableItem } from "./form-sortable-item";

/* tslint:disable */
@Component({
    selector: "form-sortable",
    exportAs: "form-sortable",
    template: `
<div [ngClass]="wrapperClass"
     (dragover)="onItemDragoverWrapper($event)"
     (dragenter)="onItemDragenter($event)"
     (drop)="onItemDrop($event)"
     (dragleave)="onItemDragleave($event)">  

    <div *ngIf="showPlaceholder"
          [ngClass]="placeholderClass"
          (dragover)="onItemDragover($event, 0)">
            {{placeholderItem}}
    </div>

    <div *ngFor="let item of items; let i=index;"
         [ngClass]="[ itemClass, item.active ? itemActiveClass : '' ]"
         [ngStyle]="{'cursor':'move'}"
         draggable="true"
         (dragstart)="onItemDragstart($event, item, i)"
         (dragend)="onItemDragend($event)"
         (dragover)="onItemDragover($event, i)">
         <ng-template [ngTemplateOutlet]="itemTemplate || defItemTemplate" 
                      [ngTemplateOutletContext]="{item:item, index: i, group:group, parent:this}">
         </ng-template>
    </div>
</div>

<ng-template #defItemTemplate let-item="item">{{item.value}}</ng-template>  
`,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FormSortableComponent),
            multi: true
        }
    ]
})
/* tslint:enable */
export class FormSortableComponent implements ControlValueAccessor {
    private static globalZoneIndex = 0;

    @Input()
    controlId: string;

    /** field name if input array consists of objects */
    @Input()
    fieldName: string;

    /** class name for items wrapper */
    @Input()
    wrapperClass: string = "";

    /** class name for item */
    @Input()
    itemClass: string = "";

    /** class name for active item */
    @Input()
    itemActiveClass: string = "";

    /** class name for placeholder */
    @Input()
    placeholderClass: string = "";

    /** placeholder item which will be shown if collection is empty */
    @Input()
    placeholderItem: string = "";

    @Input()
    parent: FormSortableComponent;
    @Input()
    group: FormGroup;
    @Input()
    sourceOnly: boolean;
    @Input()
    createControlModel: (itemData: any) => DynamicFormControlModel;
    @Input()
    createFormControl: (formControlModel: DynamicFormControlModel) => AbstractControl;
    @Input()
    processAdded: (formControlModel: DynamicFormControlModel) => void;

    @ContentChild("itemTemplate")
    itemTemplate: TemplateRef<any>;

    /** fired on array change (reordering, insert, remove), same as <code>ngModelChange</code>.
    *  Returns new items collection as a payload.
    */
    @Output()
    onChange: EventEmitter<any[]> = new EventEmitter<any[]>();

    showPlaceholder = false;
    first: boolean = false;
    second: boolean = false;

    get items(): FormSortableItem[] {
        return this.itemsList;
    }

    set items(value: FormSortableItem[]) {
        // Add new controls to the form group before updating the list so it doesn't break
        if (!this.parent) {
            //console.log(this.controlId + " Setting Items");
            //console.log(this.controlId +" this.group before ", this.group);
            if (this.group && value) {
                value.forEach(item => {
                    if (!this.group.get(item.initData.id))
                        this.addItemToForm(item.initData, this.group);
                });
            }

            //console.log(this.controlId +" value ", value);
            //console.log(this.controlId +" this.parent ", this.parent);
            //console.log(this.controlId +" this.group after ", this.group);
            this.itemsList = value || [];
            const out = this.items.map((x: FormSortableItem) => x.initData);
            this.onChanged(out);
            this.onChange.emit(out);

            // Remove old controls from the form group after updating the list so it doesn't break
            if (this.group) {
                for (let ctrlId in this.group.controls) {
                    if (this.group.controls.hasOwnProperty(ctrlId) &&
                        !this.itemsList.some(item => item.initData.id === ctrlId)) {
                        //console.log("removing item " + ctrlId);
                        this.group.removeControl(ctrlId);
                    }
                }
            }
        }
    }

    private addItemToForm(formControlModel: DynamicFormControlModel, formGroup: FormGroup): void {
        //console.log("adding item " + formControlModel.id);
        //if (this.createFormControl) {
        //    console.log("ADDING CONTROL", formControlModel);
        //    console.log("TO GROUP", formGroup);
        //    formGroup.addControl(formControlModel.id, this.createFormControl(formControlModel));
        //} else if (this.parent) {
        //    console.log("PARENT ADDING CONTROL", formControlModel);
        //    this.parent.addItemToForm(formControlModel, formGroup);
        //}
        //if (this.parent) {
        //    console.log(this.controlId +"PARENT ADDING CONTROL", formControlModel);
        //    this.parent.addItemToForm(formControlModel, formGroup);
        //} else
            if (this.createFormControl) {
            //console.log(this.controlId +"ADDING CONTROL", formControlModel);
            //console.log(this.controlId +"TO GROUP", formGroup);
            formGroup.addControl(formControlModel.id, this.createFormControl(formControlModel));
        }
    }

    onTouched: any = Function.prototype;
    onChanged: any = Function.prototype;

    private pendingItem: FormDraggableItem;
    private currentZoneIndex: number;
    private itemsBeforeItemDragged: FormSortableItem[];
    private itemsBeforeItemAdded: FormSortableItem[];
    private itemsList: FormSortableItem[];
    private dragDepth: number = 0;

    constructor(private draggableItemService: FormDraggableItemService) {
        this.currentZoneIndex = FormSortableComponent.globalZoneIndex++;
        this.draggableItemService
            .onCaptureItem()
            .subscribe((item: FormDraggableItem) => this.onItemCaptured(item));
    }

    onItemDragstart(event: DragEvent, item: FormSortableItem, i: number): void {
        //console.log("dragstart: zone " + this.currentZoneIndex);
        //console.log("onItemDragstart controlID", this.controlId);
        //console.log("onItemDragstart item", item);
        //console.log("onItemDragstart i", i);
        //console.log(this.controlId + " onItemDragstart (" + this.currentZoneIndex + ")");
        event.stopPropagation();
        this.initDragstartEvent(event);
        this.onTouched();

        if (this.createControlModel)
            item = <FormSortableItem> {
                id: item.id,
                value: item.value,
                initData: this.createControlModel(item.initData),
                active: true
            };
        else
            item.active = true;

        this.draggableItemService.dragStart({
            event,
            item,
            currentIndex: i,
            initialIndex: i,
            initialZoneIndex: this.currentZoneIndex,
            currentZoneIndex: -1
        });

        if (!this.sourceOnly)
            this.itemsBeforeItemDragged = this.itemsList;
    }

    onItemDragoverWrapper(event: DragEvent): void {
        //console.log("dragover wrapper: zone " + this.currentZoneIndex);
        //console.log(this.controlId + " onItemDragoverWrapper");
        this.cancelEvent(event);
        event.stopPropagation();
    }

    onItemDragover(event: DragEvent, i: number): void {
        //console.log("dragover item: zone " + this.currentZoneIndex + " item " + i);
        if (this.currentZoneIndex !== -1) {
            var item = this.draggableItemService.getItem();
            //console.log(this.controlId + " onItemDragover item", item);
            if (this.sourceOnly || !item) {
                //console.log(this.controlId + "onItemDragover RETURNING", item);
                return;
            }

            event.preventDefault();

            const dragItem = this.draggableItemService.captureItem(
                this.currentZoneIndex,
                this.items.length
            );
            //console.log(this.controlId + " onItemDragover dragItem", dragItem);

            this.pendingItem = item;
            //console.log(this.controlId + " onItemDragover pendingItem", this.pendingItem);
            //console.log(this.controlId + " onItemDragover itemsBeforeItemAdded before", this.itemsBeforeItemAdded);
            if (!this.itemsBeforeItemAdded)
                this.itemsBeforeItemAdded = this.itemsList;
            //console.log(this.controlId + " onItemDragover itemsBeforeItemAdded after", this.itemsBeforeItemAdded);

            dragItem.currentIndex = i;
            this.items = [
                ...this.itemsBeforeItemAdded.slice(0, i),
                dragItem.item,
                ...this.itemsBeforeItemAdded.slice(i)
            ];
            //console.log(this.controlId + " onItemDragover items", this.items);
            this.updatePlaceholderState();
        }
    }

    cancelEvent(event: DragEvent): void {
        if (this.draggableItemService.getItem() && event)
            event.preventDefault();
    }

    onItemCaptured(item: FormDraggableItem): void {
        // remove the item from the list if it has been dragged away from its original container
        //console.log(this.controlId + " onItemCapture (" + this.currentZoneIndex + ")");
        //console.log("item.initialZoneIndex", item.initialZoneIndex);
        if (!this.sourceOnly && item && item.initialZoneIndex === this.currentZoneIndex) {
            //console.log("item captured: zone " + this.currentZoneIndex + " item " + item.initialIndex);
            //console.log("onItemCaptured item", item);
            // make sure this isn't triggered again
            item.initialZoneIndex = -1;
            this.items = [
                ...this.itemsList.slice(0, item.initialIndex),
                ...this.itemsList.slice(item.initialIndex + 1)
            ];
            //console.log("onItemCaptured items", this.items);
            this.updatePlaceholderState();
        }
    }

    registerOnChange(callback: (_: any) => void): void {
        this.onChanged = callback;
    }

    registerOnTouched(callback: () => void): void {
        this.onTouched = callback;
    }

    writeValue(value: any[]): void {
        if (value) {
            this.items = value.map((x: any, i: number) => ({
                id: i,
                initData: x,
                value: this.fieldName ? x[this.fieldName] : x,
                active: false
            }));
        } else {
            this.items = [];
        }
        this.updatePlaceholderState();
    }

    updatePlaceholderState(): void {
        this.showPlaceholder = !this.itemsList || !this.itemsList.length;
    }

    // tslint:disable-next-line
    private initDragstartEvent(event: DragEvent): void {
        // it is necessary for mozilla
        // data type should be 'Text' instead of 'text/plain' to keep compatibility
        // with IE
        event.dataTransfer.setData("Text", "placeholder");
    }

    onItemDragend(event: DragEvent): void {
        //console.log("dragend: zone " + this.currentZoneIndex);
        //console.log(this.controlId + "onItemDragend");
        event.stopPropagation();
        this.cancelEvent(event);
        const dragItem = this.draggableItemService.getItem();
        if (dragItem.currentZoneIndex === -1 && this.itemsBeforeItemDragged)
            this.items = this.itemsBeforeItemDragged;
        this.itemsBeforeItemDragged = null;
        dragItem.item.active = false;
        this.draggableItemService.dragStart(null);
    }

    onItemDragenter(event: DragEvent): void {
        event.stopPropagation();
        if (this.first) {
            this.second = true;
        } else {
            this.first = true;
        }

        // if (this.first && this.second)
            // console.log("dragenter: zone " + this.currentZoneIndex);
    }

    onItemDragleave(event: DragEvent): void {
        //console.log(this.controlId + "onItemDragleave");
        event.stopPropagation();

        if (this.second)
            this.second = false;
        else if (this.first)
            this.first = false;

        if (!this.first && !this.second && !this.sourceOnly) {
            //console.log("dragleave: zone " + this.currentZoneIndex);
            //console.log("REMOVING PENDING ITEM");
            this.removePendingItem();
        }
    }

    removePendingItem(): void {
        if (this.pendingItem) {
            //console.log("removing pending item");
            var item = this.pendingItem;
            this.pendingItem = null;
            this.items = this.itemsBeforeItemAdded;
            this.itemsBeforeItemAdded = null;
            this.updatePlaceholderState();
            item.currentZoneIndex = -1;
            item.currentIndex = this.items.length;
        }
    }

    onItemDrop(event: DragEvent): void {
        //console.log(this.controlId + "onItemDrop");
        //console.log("drop: zone " + this.currentZoneIndex);
        event.stopPropagation();
        this.cancelEvent(event);
        this.itemsBeforeItemAdded = null;
        if (this.pendingItem) {
            this.processAddedItem(this.pendingItem.item.initData);
            this.pendingItem = null;
        }
    }

    processAddedItem(formControlModel: DynamicFormControlModel) {
        if (this.processAdded)
            this.processAdded(formControlModel);
        else if (this.parent)
            this.parent.processAddedItem(formControlModel);
    }
}
