import { Image, Page, Text, View } from '@react-pdf/renderer';
import { getIsLimitedStyle, getLabel, getValue } from '../../utils';
const MainPage = ({
  styles,
  backgroundPath,
  isPreview,
  imageVariant = 'default',
  data = [],
  profileImage,
}) => {
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

          return (
            <View key={eachSection.key} style={styles.sectionRow}>
              {idx === 0 &&
                profileImage !== null &&
                (imageVariant === 'default' ||
                  imageVariant === 'side-round') && (
                  <View style={styles.profile}>
                    <Image src={profileImage} style={styles.profileImage} />
                  </View>
                )}
              <View style={styles.sectionWrapper} wrap={false}>
                <Text style={styles.sectionText}>{eachSection.key}</Text>
              </View>
              {eachSection.data.map((eachData) => {
                if (isPreview && renderedFields == 2) {
                  return null;
                }

                if (!eachData.value) {
                  return null;
                }

                renderedFields++;

                const label = getLabel(eachData);

                return (
                  <View key={label} style={styles.row} wrap={false}>
                    <Text style={styles.keyText}>{label}</Text>
                    <Text style={styles.separator}>:</Text>
                    <Text
                      style={
                        getIsLimitedStyle({
                          index: idx,
                          pageNumber: 1,
                          isPreview,
                          profileImage,
                          isWithImage: imageVariant === 'default',
                        })
                          ? limitedValueStyles
                          : valueStyles
                      }
                    >
                      {getValue(eachData)}
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
