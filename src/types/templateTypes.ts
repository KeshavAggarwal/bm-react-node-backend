import { IFieldData } from "./formTypes";

export type TemplateDataType = Array<{
  key: string;
  data: Array<IFieldData>;
}>;

export interface ITemplateListData {
  id:
    | "eg0"
    | "eg1"
    | "eg2"
    | "eg3"
    | "eg4"
    | "eg5"
    | "eg6"
    | "eg7"
    | "eg8"
    | "eg9"
    | "eg10"
    | "eg11"
    | "eg12"
    | "eg13"
    | "eg14"
    | "eg15"
    | "eg20"
    | "eg30"
    | "eg21"
    | "eg22";
  link: string;
  isPreviewable: boolean;
  price: number;
  imageOnly: boolean;
  altText: string;
}

export interface ITemplateProps {
  isPreview: boolean;
  formData: string | null;
  imagePath: string | null;
}
