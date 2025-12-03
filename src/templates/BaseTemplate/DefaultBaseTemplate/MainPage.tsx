import React from "react";
import { Font,Image, Page, Text, View } from "@react-pdf/renderer";
import {
  getFormData,
  getImage,
  getIsLimitedStyle,
  getLabel,
  getPreviewFields,
  getValue,
} from "../../../utils";
import { IBaseTemplateProps } from "../types";
Font.registerHyphenationCallback((word) => [word]);


const MainPage = ({
  styles,
  backgroundPath,
  isPreview,
  imageVariant = "default",
  formData,
  imagePath,
}: IBaseTemplateProps) => {
  const data = getFormData(formData);
  const profileImage = getImage(imagePath);

  const valueStyles = { ...styles.valueText };
  const limitedValueStyles = { ...valueStyles, ...styles.limitedValueText };

  return (
    <Page size="A4" style={styles.page} wrap>
      <Image style={styles.borderImage} src={backgroundPath} fixed />
      <View>
        {data.map((eachSection, idx) => {
          const nonEmptyValues = eachSection.data.filter((eachData) =>
            Boolean(eachData.value)
          );
          if (nonEmptyValues.length === 0) {
            return null;
          }
          let renderedFields = 0;
          const previewfields = getPreviewFields(eachSection.key);

          return (
            <View key={eachSection.key} style={styles.sectionRow}>
              {idx === 0 &&
                profileImage !== null &&
                (imageVariant === "default" ||
                  imageVariant === "side-round") && (
                  <View style={styles.profile}>
                    <Image src={profileImage} style={styles.profileImage} />
                  </View>
                )}
              <View style={styles.sectionWrapper} wrap={false}>
                <Text style={styles.sectionText}>{eachSection.key}</Text>
              </View>
              {eachSection.data.map((eachData, dataIdx) => {
                if (isPreview && renderedFields == previewfields) {
                  return null;
                }

                if (!eachData.value) {
                  return null;
                }

                renderedFields++;

                const label = getLabel(eachData);

                const isLimited = getIsLimitedStyle({
                  pageIndex: idx,
                  dataIndex: dataIdx,
                  isPreview,
                  profileImage,
                  isWithImage: imageVariant === "default",
                });

                return (
                  <View key={label} style={styles.row} wrap={false}>
                    <Text style={styles.keyText}>{label}</Text>
                    <Text style={styles.separator}>:</Text>
                    <Text style={isLimited ? limitedValueStyles : valueStyles}>
                      {getValue(eachData, false)}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.sectionGap} />
            </View>
          );
        })}
      </View>
    </Page>
  );
};

export default MainPage;
