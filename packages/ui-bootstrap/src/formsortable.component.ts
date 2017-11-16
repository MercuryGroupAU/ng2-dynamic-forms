import { Component, Input, Output, TemplateRef, ContentChild, EventEmitter, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormGroup } from "@angular/forms";
import { DraggableItem, DraggableItemService } from "ngx-bootstrap/sortable";

/* tslint:disable */
@Component({
    selector: "form-sortable",
    exportAs: "form-sortable",
    template: `
<div
    [ngClass]="wrapperClass"
    (dragover)="cancelEvent($event)"
    (dragenter)="onItemDragenter()"
    (drop)="onItemDrop($event)"
    (dragleave)="onItemDragleave()">
  <div
        *ngIf="showPlaceholder"
        [ngClass]="placeholderClass"
        (dragover)="onItemDragover($event, 0)"
    >{{placeholderItem}}</div>
  <div
        *ngFor="let item of items; let i=index;"
        [ngClass]="[ itemClass, item.active ? itemActiveClass : '' ]"
        draggable="true"
        (dragstart)="onItemDragstart($event, item, i)"
        (dragend)="onItemDragend($event)"
        (dragover)="onItemDragover($event, i)"
    ><ng-template [ngTemplateOutlet]="itemTemplate || defItemTemplate" [ngTemplateOutletContext]="{item:item, index: i, group:group, parent:this}"></ng-template>
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
    createDragItem: (itemData: any) => any;
    @Input()
    addToForm: (itemData: any, formGroup: FormGroup) => void;
    @Input()
    removeFromForm: (itemData: any, formGroup: FormGroup) => void;
    @Input()
    processAdded: (itemData: any, formGroup: FormGroup) => void;

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

    get items(): SortableItem[] {
        return this.itemsList;
    }

    set items(value: SortableItem[]) {
        this.itemsList = value;
        const out = this.items.map((x: SortableItem) => x.initData);
        this.onChanged(out);
        this.onChange.emit(out);
    }

    onTouched: any = Function.prototype;
    onChanged: any = Function.prototype;

    private pendingItem: DraggableItem;
    private itemsBeforeDrop: any[];
    private currentZoneIndex: number;
    private itemsBeforeDrag: SortableItem[];
    private itemsList: SortableItem[];
    private dragDepth: number = 0;

    constructor(private draggableItemService: DraggableItemService) {
        this.currentZoneIndex = FormSortableComponent.globalZoneIndex++;
        this.draggableItemService
            .onCaptureItem()
            .subscribe((item: DraggableItem) => this.onItemCaptured(item));
    }

    onItemDragstart(event: DragEvent, item: SortableItem, i: number): void {
        this.initDragstartEvent(event);
        this.onTouched();

        if (this.createDragItem)
            item = <SortableItem> {
                id: item.id,
                value: item.value,
                initData: this.createDragItem(item.initData),
                active: true
            };
        else
            item.active = true;

        this.draggableItemService.dragStart({
            event,
            item,
            i,
            initialIndex: i,
            lastZoneIndex: this.currentZoneIndex,
            overZoneIndex: this.currentZoneIndex
        });
    }

    onItemDragover(event: DragEvent, i: number): void {
        var item = this.draggableItemService.getItem();
        if (this.sourceOnly || !item)
            return;

        this.pendingItem = item;
        if (this.group)
            this.addItemToForm(item.item.initData, this.group);

        event.preventDefault();
        const dragItem = this.draggableItemService.captureItem(
            this.currentZoneIndex,
            this.items.length
        );

        if (!this.itemsBeforeDrag)
            this.itemsBeforeDrag = this.itemsList;

        this.items = [
                ...this.itemsBeforeDrag.slice(0, i),
                dragItem.item,
                ...this.itemsBeforeDrag.slice(i)
            ];
        dragItem.i = i;
        this.updatePlaceholderState();
    }

    cancelEvent(event: DragEvent): void {
        if (this.draggableItemService.getItem() && event)
            event.preventDefault();
    }

    onItemCaptured(item: DraggableItem): void {
        if (
            !this.sourceOnly &&
                item &&
                item.overZoneIndex !== this.currentZoneIndex &&
                item.lastZoneIndex === this.currentZoneIndex
        ) {
            this.items = this.items.filter(
                (_: SortableItem, i: number) => i !== item.i
            );
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
        this.showPlaceholder = !this.itemsList.length;
    }

    // tslint:disable-next-line
    private initDragstartEvent(event: DragEvent): void {
        // it is necessary for mozilla
        // data type should be 'Text' instead of 'text/plain' to keep compatibility
        // with IE
        event.dataTransfer.setData("Text", "placeholder");
    }

    onItemDragend(event: DragEvent): void {
        this.draggableItemService.getItem().item.active = false;
        this.draggableItemService.dragStart(null);
        this.cancelEvent(event);
    }

    addItemToForm(item: any, formGroup: FormGroup): void {
        if (this.addToForm)
            this.addToForm(item, formGroup);
        else if (this.parent)
            this.parent.addItemToForm(item, formGroup);
    }

    onItemDragenter(): void {
        if (this.first) {
            this.second = true;
        } else {
            this.first = true;
        }
    }

    onItemDragleave(): void {
        if (this.second) {
            this.second = false;
        } else if (this.first) {
            this.first = false;
        }
        if (!this.first && !this.second) {
            if (!this.sourceOnly && this.pendingItem) {
                var item = this.pendingItem;
                this.pendingItem = null;
                item.overZoneIndex = -1;
                item.i = this.items.length;
                this.removeItemFromForm(item.item.initData, this.group);
                this.items = this.itemsBeforeDrag;
                this.itemsBeforeDrag = null;
                this.updatePlaceholderState();
            }
        }
    }

    removeItemFromForm(item: any, formGroup: FormGroup): void {
        if (this.removeFromForm)
            this.removeFromForm(item, formGroup);
        else if (this.parent)
            this.parent.removeItemFromForm(item, formGroup);
    }

    onItemDrop(event: DragEvent): void {
        this.cancelEvent(event);
        this.itemsBeforeDrag = null;
        if (this.pendingItem) {
            this.processAddedItem(this.pendingItem.item.initData, this.group);
            this.pendingItem = null;
        }
    }

    processAddedItem(itemData: any, formGroup: FormGroup) {
        if (this.processAdded)
            this.processAdded(itemData, formGroup);
        else if (this.parent)
            this.parent.processAddedItem(itemData, formGroup);
    }
}

export interface SortableItem {
    id: number;
    value: string;
    initData: any;
    active: boolean;
}
