import dayjs from 'dayjs';

export const getLabel = (fieldData) => {
  let value = fieldData.key;
  return value.trim();
};

export const getValue = (fieldData) => {
  let value = fieldData.value;

  switch (fieldData.fieldType) {
    case 'time': {
      try {
        value = dayjs(value).format('hh:mm A');
      } catch (error) {
        value = value;
      }
      return value;
    }

    case 'date': {
      try {
        value = dayjs(value).format('DD/MM/YYYY');
      } catch (error) {
        value = value;
      }
      return value;
    }

    default: {
      try {
        value = value.trim();
      } catch (error) {
        value;
      }
      return value;
    }
  }
};

// export const getFrontDetails = (formData: StateDataType) => {
//   let name = '';
//   let dob = '';
//   let placeOfBirth = '';

//   formData.forEach((eachSection) => {
//     eachSection.data.forEach((eachField) => {
//       if (eachField.key === 'Name') {
//         name = getValue(eachField);
//       } else if (eachField.key === 'Date Of Birth') {
//         dob = getValue(eachField);
//       } else if (eachField.key === 'Place Of Birth') {
//         placeOfBirth = getValue(eachField);
//       }
//     });
//   });

//   return {
//     name,
//     dob,
//     placeOfBirth,
//   };
// };

export const getIsLimitedStyle = ({
  index,
  pageNumber,
  isPreview,
  profileImage,
  isWithImage,
}) => {
  if ((index === 0 || isPreview) && profileImage !== null && isWithImage) {
    return true;
  }

  return false;
};
