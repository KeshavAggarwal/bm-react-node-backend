import dayjs from "dayjs";
import { IFieldData, StateDataType } from "./types/formTypes";

const VOWELS = ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"];

function maskVowels(inputString: string): string {
  // Use a regular expression to replace vowels with "*"
  const maskedString = inputString.replace(
    new RegExp(`[${VOWELS.join("")}]`, "g"),
    "*"
  );

  return maskedString;
}

export const decodeFormData = (fd: string) => {
  const decodedFormData = Buffer.from(fd, "base64").toString("utf-8");
  return JSON.parse(decodedFormData);
};

export const encodeFormData = (formData: Record<string, any>) => {
  if (!formData) {
    return null;
  }
  const stringifiedData = JSON.stringify(formData);
  return Buffer.from(stringifiedData).toString("base64");
};

export const getFormData = (formData: string | null) => {
  const stringifiedData = getStringFormData(formData);
  const data: StateDataType = JSON.parse(stringifiedData) || [];
  return data;
};

export const getImage = (imagePath: string | null) => {
  if (imagePath) {
    return imagePath;
  }
  return null;
};

export const getLabel = (fieldData: IFieldData) => {
  let value = fieldData.key;
  return value.trim();
};

export const getValue = (fieldData: IFieldData, isMasked = false) => {
  let value = fieldData.value as any;

  switch (fieldData.fieldType) {
    case "time": {
      try {
        value = dayjs(value).format("hh:mm A");
      } catch (error) {
        value = value;
      }
      return value;
    }

    case "date": {
      try {
        value = dayjs(value).format("DD/MM/YYYY");
      } catch (error) {
        value = value;
      }
      return value;
    }

    default: {
      try {
        value = value.trim();
        if (isMasked) {
          value = maskVowels(value);
        }
      } catch (error) {
        value;
      }
      return value;
    }
  }
};

export const getFrontDetails = (formData: StateDataType) => {
  let name = "";
  let dob = "";
  let placeOfBirth = "";

  formData.forEach((eachSection) => {
    eachSection.data.forEach((eachField) => {
      if (eachField.key === "Name") {
        name = getValue(eachField);
      } else if (eachField.key === "Date Of Birth") {
        dob = getValue(eachField);
      } else if (eachField.key === "Place Of Birth") {
        placeOfBirth = getValue(eachField);
      }
    });
  });

  return {
    name,
    dob,
    placeOfBirth,
  };
};

interface IIsLimitedStyle {
  pageIndex: number;
  dataIndex: number;
  isPreview: boolean;
  profileImage: string | null;
  isWithImage: boolean;
}

export const getIsLimitedStyle = ({
  pageIndex,
  dataIndex,
  isPreview,
  profileImage,
  isWithImage,
}: IIsLimitedStyle) => {
  if (
    pageIndex === 0 &&
    dataIndex < 12 &&
    profileImage !== null &&
    isWithImage
  ) {
    return true;
  }

  return false;
};

export const getStringFormData = (formData: string | null) => {
  if (formData) return formData;
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem("form_data") || "[]";
};

export const containsDevanagari = (str: string | null) => {
  if (!str) {
    return false;
  }

  // Regular expression to match any Devanagari character
  const devanagariRegex = /[\u0900-\u097F]/;
  return devanagariRegex.test(str);
};

export const getSectionIcon = (sectionName: string) => {
  switch (sectionName) {
    case "Personal Details":
      return "/images/resources/personal.png";

    case "Family Details":
      return "/images/resources/family.png";

    case "Contact Details":
      return "/images/resources/contact.png";

    default:
      return "/images/resources/family.png";
  }
};

export const PREVIEW_FIELDS = 2;
