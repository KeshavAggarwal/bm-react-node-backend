import React from "react";
import { Image, Page, Text, View } from "@react-pdf/renderer";
import {
  getFormData,
  getFrontDetails,
  getImage,
  getLabel,
  getSectionIcon,
  getValue,
  PREVIEW_FIELDS,
} from "../../../utils";
import { IBaseTemplateProps } from "../types";

const EXCLUDE_LABELS = ["Name"];

const MainPage = ({
  styles,
  backgroundPath,
  formData,
  imagePath,
  isPreview,
}: IBaseTemplateProps) => {
  const data = getFormData(formData);
  const profileImage = getImage(imagePath);
  const valueStyles = { ...styles.valueText };
  const frontDetails = getFrontDetails(data);

  return (
    <Page size="A4" style={styles.page} wrap>
      <Image style={styles.borderImage} src={backgroundPath} fixed />
      <View>
        <View style={styles.topSecContainer}>
          {profileImage !== null ? (
            <View style={styles.profile}>
              <Image src={profileImage} style={styles.profileImage} />
            </View>
          ) : (
            <View style={styles.dummyContainer} />
          )}

          <View style={styles.detailsContainer}>
            <Text style={styles.nameText}>{frontDetails.name}</Text>
            <View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKeyText}>Date of Birth</Text>
                <Text style={styles.detailSeparator}>:</Text>
                <Text style={styles.detailValueText}>{frontDetails.dob}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKeyText}>Place of Birth</Text>
                <Text style={styles.detailSeparator}>:</Text>
                <Text style={styles.detailValueText}>
                  {frontDetails.placeOfBirth}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {data.map((eachSection, idx) => {
          const nonEmptyValues = eachSection.data.filter((eachData) =>
            Boolean(eachData.value)
          );
          if (nonEmptyValues.length === 0) {
            return null;
          }
          let renderedFields = 0;
          const sectionIconSrc = getSectionIcon(eachSection.key);

          return (
            <View key={eachSection.key} style={styles.sectionRow}>
              <View style={styles.sectionWrapper} wrap={false}>
                <View style={styles.sectionSubWrapper} wrap={false}>
                  <Text style={styles.sectionText}>{eachSection.key}</Text>
                  <Image style={styles.sectionIcon} src={sectionIconSrc} />
                </View>
              </View>
              {eachSection.data.map((eachData, dataIdx) => {
                if (isPreview && renderedFields == PREVIEW_FIELDS) {
                  return null;
                }

                if (!eachData.value) {
                  return null;
                }

                const label = getLabel(eachData);
                if (EXCLUDE_LABELS.includes(label)) {
                  return null;
                }

                renderedFields++;
                return (
                  <View key={label} style={styles.row} wrap={false}>
                    <Text style={styles.keyText}>{label}</Text>
                    <Text style={valueStyles}>{getValue(eachData, false)}</Text>
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
