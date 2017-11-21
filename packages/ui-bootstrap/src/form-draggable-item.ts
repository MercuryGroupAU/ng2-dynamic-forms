import { FormSortableItem } from "./form-sortable-item";

export interface FormDraggableItem {
  event: DragEvent;
  item: FormSortableItem;
  currentIndex: number;
  initialIndex: number;
  initialZoneIndex: number;
  currentZoneIndex: number;
}