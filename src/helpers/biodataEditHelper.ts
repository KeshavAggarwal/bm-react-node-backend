import { StateDataType, IFieldData } from "../types/formTypes";
import { getISTDate } from "../helpers";

// Restricted fields that cannot be edited after payment
const RESTRICTED_FIELDS = ["name", "date of birth", "place of birth"];

/**
 * Checks if a field key matches any restricted field (case-insensitive)
 */
function isRestrictedField(fieldKey: string): boolean {
  const normalizedKey = fieldKey.toLowerCase().trim();
  return RESTRICTED_FIELDS.some(
    (restricted) => restricted.toLowerCase() === normalizedKey
  );
}


/**
 * Merges form_data and form_data_editable to get final biodata
 * Strategy: Start with form_data_editable, inject restricted fields from form_data
 * RESTRICTED fields ALWAYS come from form_data (original, protected)
 * All other fields come ONLY from form_data_editable (allows additions/deletions)
 * @param formData - Original form data (locked after payment)
 * @param formDataEditable - Editable form data (user's latest version)
 * @returns Merged form data
 */
export function mergeBiodataFormData(
  formData: StateDataType,
  formDataEditable: StateDataType
): StateDataType {
  if (!Array.isArray(formData)) {
    return Array.isArray(formDataEditable) ? formDataEditable : [];
  }

  if (!Array.isArray(formDataEditable) || formDataEditable.length === 0) {
    return formData;
  }

  // Create a deep clone of form_data_editable as the base
  const mergedData: StateDataType = JSON.parse(JSON.stringify(formDataEditable));

  // Create a map of restricted fields from original form_data
  const restrictedFieldsMap = new Map<string, Map<string, IFieldData>>();
  
  formData.forEach((section) => {
    if (!section || typeof section !== "object" || !Array.isArray(section.data)) {
      return;
    }

    const restrictedFields = new Map<string, IFieldData>();
    section.data.forEach((field: IFieldData) => {
      if (field && field.key && isRestrictedField(field.key)) {
        restrictedFields.set(field.key.toLowerCase().trim(), field);
      }
    });

    if (restrictedFields.size > 0) {
      restrictedFieldsMap.set(section.key.toLowerCase().trim(), restrictedFields);
    }
  });

  // Inject restricted fields from form_data into each section
  mergedData.forEach((section) => {
    const sectionKey = section.key.toLowerCase().trim();
    const restrictedFields = restrictedFieldsMap.get(sectionKey);

    if (restrictedFields && restrictedFields.size > 0) {
      // Replace any restricted fields in editable data with original values
      section.data = section.data.map((field: IFieldData) => {
        if (!field || !field.key) return field;
        
        const fieldKey = field.key.toLowerCase().trim();
        const restrictedField = restrictedFields.get(fieldKey);
        
        // If this field is restricted, use the original value
        return restrictedField || field;
      });

      // Add any missing restricted fields that user might have removed
      restrictedFields.forEach((restrictedField, fieldKey) => {
        const exists = section.data.some(
          (f: IFieldData) => f.key.toLowerCase().trim() === fieldKey
        );
        
        if (!exists) {
          section.data.push(restrictedField);
        }
      });
    }
  });

  // Add sections from form_data that contain restricted fields but are missing in editable
  formData.forEach((originalSection) => {
    const sectionKey = originalSection.key.toLowerCase().trim();
    const sectionExists = mergedData.some(
      (s) => s.key.toLowerCase().trim() === sectionKey
    );

    if (!sectionExists) {
      const restrictedFields = originalSection.data.filter((field: IFieldData) =>
        field && field.key && isRestrictedField(field.key)
      );

      if (restrictedFields.length > 0) {
        mergedData.push({
          key: originalSection.key,
          data: restrictedFields,
        });
      }
    }
  });

  return mergedData;
}

/**
 * Validates the structure of form data
 * @param formData - The form data to validate
 * @returns True if valid, false otherwise
 */
export function isValidFormDataStructure(formData: any): formData is StateDataType {
  if (!Array.isArray(formData)) {
    return false;
  }

  return formData.every((section) => {
    if (!section || typeof section !== "object") {
      return false;
    }

    if (typeof section.key !== "string") {
      return false;
    }

    if (!Array.isArray(section.data)) {
      return false;
    }

    return section.data.every((field: any) => {
      return field && typeof field === "object" && typeof field.key === "string";
    });
  });
}

