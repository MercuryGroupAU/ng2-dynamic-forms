import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { FormDraggableItem } from "./form-draggable-item";

@Injectable()
export class FormDraggableItemService {
  private draggableItem: FormDraggableItem;

  private onCapture: Subject<FormDraggableItem> = new Subject<FormDraggableItem>();

  dragStart(item: FormDraggableItem): void {
    this.draggableItem = item;
  }

  getItem(): FormDraggableItem {
    return this.draggableItem;
  }

  captureItem(overZoneIndex: number, newIndex: number): FormDraggableItem {
    if (this.draggableItem.currentZoneIndex !== overZoneIndex) {
      this.draggableItem.currentZoneIndex = overZoneIndex;
      this.onCapture.next(this.draggableItem);
      this.draggableItem = Object.assign({}, this.draggableItem, {
        currentZoneIndex: overZoneIndex,
        i: newIndex
      });
    }

    return this.draggableItem;
  }

  onCaptureItem(): Subject<FormDraggableItem> {
    return this.onCapture;
  }
}
