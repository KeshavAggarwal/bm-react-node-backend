import React from "react";
import ReactPDF, {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { ITemplateProps } from "../../types/templateTypes";
import {
  containsDevanagari,
  getFormData,
  getFrontDetails,
  getImage,
  getStringFormData,
} from "../../utils";
import MainPage from "../BaseTemplate/DefaultBaseTemplate/MainPage";

Font.register({
  family: "Lora",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/lora/v32/0QI6MX1D_JOuGQbT0gvTJPa787wsuyJGmKxemMeZ.ttf",
    },
    {
      src: "https://fonts.gstatic.com/s/lora/v32/0QI6MX1D_JOuGQbT0gvTJPa787z5vCJGmKxemMeZ.ttf",
      fontWeight: "bold",
    },
  ],
});

Font.register({
  family: "Noto Sans Devanagari",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/notosansdevanagari/v26/TuGoUUFzXI5FBtUq5a8bjKYTZjtRU6Sgv3NaV_SNmI0b8QQCQmHn6B2OHjbL_08AlXQly-A.ttf",
    },

    {
      src: "https://fonts.gstatic.com/s/notoserifdevanagari/v30/x3dYcl3IZKmUqiMk48ZHXJ5jwU-DZGRSaQ4Hh2dGyFzPLcQPVbnRNeFsw0xRWb6uxTDZpA-H.ttf",
      fontWeight: "bold",
    },
  ],
});

const STYLES = StyleSheet.create({
  viewer: {
    width: "100vw",
    height: "100vh",
    border: "none",
  },
  frontPage: { display: "flex", flexDirection: "column", position: "relative" },
  page: {
    display: "flex",
    flexDirection: "column",
    padding: "50 115 50 95",
  },
  borderImage: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  sectionRow: {
    position: "relative",
  },
  sectionText: {
    fontFamily: "Lora",
    fontSize: 14,
    color: "#994B04",
    fontWeight: "bold",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  sectionGap: {
    height: 30,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    fontFamily: "Lora",
    marginBottom: 7,
  },
  keyText: {
    fontSize: 12,
    width: 140,
    minWidth: 140,
    color: "#994B04",
  },
  valueText: {
    fontSize: 12,
    fontWeight: 500,
    maxWidth: 250,
    color: "#994B04",
  },
  limitedValueText: {
    maxWidth: 150,
  },
  separator: {
    fontSize: 12,
    marginRight: 24,
    color: "#994B04",
  },
  profileImage: {
    marginTop: 188,
    marginLeft: 168,
    borderRadius: "50%",
    width: 260,
    minWidth: 260,
    height: 260,
    minHeight: 260,
    objectFit: "cover",
  },
  detailsContainer: {
    marginTop: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  detailKeyText: {
    fontSize: 14,
    width: 100,
    minWidth: 100,
    color: "#994B04",
  },
  detailValueText: {
    fontSize: 14,
    fontWeight: 500,
    maxWidth: 250,
    color: "#994B04",
  },
  detailRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    fontFamily: "Lora",
    marginBottom: 12,
  },
  detailSeparator: {
    fontSize: 16,
    marginRight: 24,
    color: "#994B04",
  },
  nameText: {
    fontFamily: "Lora",
    marginBottom: 30,
    color: "#994B04",
    fontSize: 38,
    fontWeight: 700,
    textTransform: "uppercase",
    paddingLeft: 20,
    paddingRight: 20,
    textAlign: "center",
  },
});

const Template21 = (props: ITemplateProps) => {
  const data = getFormData(props.formData);
  const profileImage = getImage(props.imagePath);
  const frontDetails = getFrontDetails(data);

  const backgroundPath = props.isPreview
    ? "/images/template/wtm/template-2-pager-21-wtm.png"
    : "/images/template/template-bg-21/front-page.png";

  const templateStyles = { ...STYLES };
  const formData = getStringFormData(props.formData);
  const checkForDevnagri = containsDevanagari(formData);

  if (checkForDevnagri) {
    templateStyles["sectionText"]["fontFamily"] = "Noto Sans Devanagari";
    templateStyles["row"]["fontFamily"] = "Noto Sans Devanagari";
    templateStyles["detailRow"]["fontFamily"] = "Noto Sans Devanagari";
    templateStyles["nameText"]["fontFamily"] = "Noto Sans Devanagari";
  } else {
    templateStyles["sectionText"]["fontFamily"] = "Lora";
    templateStyles["row"]["fontFamily"] = "Lora";
    templateStyles["detailRow"]["fontFamily"] = "Lora";
    templateStyles["nameText"]["fontFamily"] = "Lora";
  }

  return (
    <Document>
      <Page size="A4" style={templateStyles.frontPage} wrap>
        <Image style={templateStyles.borderImage} src={backgroundPath} />
        {profileImage && (
          <Image src={profileImage} style={templateStyles.profileImage} />
        )}
        <View style={templateStyles.detailsContainer}>
          <Text style={templateStyles.nameText}>{frontDetails.name}</Text>
          <View>
            <View style={templateStyles.detailRow}>
              <Text style={templateStyles.detailKeyText}>Date of Birth</Text>
              <Text style={templateStyles.separator}>:</Text>
              <Text style={templateStyles.detailValueText}>
                {frontDetails.dob}
              </Text>
            </View>
            <View style={templateStyles.detailRow}>
              <Text style={templateStyles.detailKeyText}>Place of Birth</Text>
              <Text style={templateStyles.separator}>:</Text>
              <Text style={templateStyles.detailValueText}>
                {frontDetails.placeOfBirth}
              </Text>
            </View>
          </View>
        </View>
      </Page>

      <MainPage
        styles={templateStyles}
        backgroundPath="/images/template/template-bg-21/rest-pages.png"
        imageVariant="front-round"
        {...props}
      />
    </Document>
  );
};

export default async (data: ITemplateProps) => {
  return await ReactPDF.renderToStream(<Template21 {...data} />);
};
