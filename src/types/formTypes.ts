export enum ActionTypeEnum {
  SetSection,
  SetData,
  SetLoading,
  DeleteItem,
  AddItem,
  AddSection,
  DeleteSection,
  ChangeActiveSection,
  SetFormData,
  MoveItem,
}

export type ActionType =
  | {
      type: ActionTypeEnum.SetData;
      payload: {
        sectionIndex: number;
        itemIndex: number;
        value: string;
        dataType: 'key' | 'value';
      };
    }
  | {
      type: ActionTypeEnum.DeleteItem;
      payload: { sectionIndex: number; itemIndex: number };
    }
  | { type: ActionTypeEnum.AddItem; payload: { sectionIndex: number } }
  | {
      type: ActionTypeEnum.SetLoading;
      payload: boolean;
    }
  | {
      type: ActionTypeEnum.SetSection;
      payload: { sectionIndex: number; value: string };
    }
  | { type: ActionTypeEnum.AddSection }
  | {
      type: ActionTypeEnum.DeleteSection;
      payload: { sectionIndex: number };
    }
  | { type: ActionTypeEnum.ChangeActiveSection; payload: { newIndex: number } }
  | {
      type: ActionTypeEnum.SetFormData;
      payload: StateDataType;
    }
  | {
      type: ActionTypeEnum.MoveItem;
      payload: {
        sectionIndex: number;
        itemIndex: number;
        moveType: 'up' | 'down';
      };
    };

export interface IFieldData {
  key: string;
  value: string;
  fieldType?: 'date' | 'time' | 'dropdown';
  options?: Array<any>;
  isMandatory?: boolean;
}

export type StateDataType = Array<{
  key: string;
  data: Array<IFieldData>;
}>;

export interface IState {
  isLoading: boolean;
  activeSectionIndex: number;
  data: StateDataType;
}
