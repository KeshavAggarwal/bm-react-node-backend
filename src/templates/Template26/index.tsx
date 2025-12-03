import React from "react";
import ReactPDF, { Font, StyleSheet } from "@react-pdf/renderer";
import { ITemplateProps } from "../../types/templateTypes";
import { containsDevanagari, getStringFormData } from "../../utils";
import CenterColorBaseTemplate from "../BaseTemplate/CenterColorBaseTemplate";

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
  family: "Roboto Slab",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/robotoslab/v34/BngbUXZYTXPIvIBgJJSb6s3BzlRRfKOFbvjojISmb2Rm.ttf",
    },
    {
      src: "https://fonts.gstatic.com/s/robotoslab/v34/BngbUXZYTXPIvIBgJJSb6s3BzlRRfKOFbvjovoSmb2Rm.ttf",
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
    padding: "20 0 20 0",
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
    padding: "0 32 0 32",
  },
  sectionWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionSubWrapper: {
    width: 225,
    height: 36,
    paddingLeft: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6CED6",
    marginBottom: 18,
    borderRadius: "50%",
    paddingTop: 0,
    position: "relative",
  },
  sectionText: {
    fontFamily: "Roboto Slab",
    fontSize: 16,
    color: "#202021",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  sectionIcon: {
    position: "absolute",
    left: 10,
    zIndex: 2,
    height: 28,
    width: 28,
  },
  sectionGap: {
    height: 30,
  },
  row: {
    marginLeft: 0,
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    fontFamily: "Lora",
    marginBottom: 7,
  },
  keyText: {
    fontSize: 14,
    width: 220,
    minWidth: 220,
    color: "#202021",
  },
  valueText: {
    fontSize: 14,
    fontWeight: 500,
    maxWidth: 300,
    color: "#202021",
  },
  limitedValueText: {
    maxWidth: 150,
  },
  separator: {
    fontSize: 14,
    marginRight: 24,
    color: "#202021",
  },
  topSecContainer: {
    minWidth: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    marginBottom: 24,
    backgroundColor: "#E6CED6",
    padding: "20 32 20 32",
    marginTop: "-20",
  },
  profile: {
    width: 191,
    minWidth: 191,
    height: 191,
    minHeight: 191,
    objectFit: "cover",
    marginLeft: 10,
    marginRight: 45,
    borderRadius: "50%",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%",
  },
  dummyContainer: {
    height: "100%",
  },
  detailsContainer: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  detailKeyText: {
    fontSize: 14,
    width: 100,
    minWidth: 100,
    color: "#202021",
    fontFamily: "Lora",
  },
  detailValueText: {
    fontSize: 14,
    maxWidth: 250,
    color: "#202021",
    fontFamily: "Lora",
  },
  detailSeparator: {
    fontSize: 14,
    marginRight: 10,
    color: "#202021",
    fontFamily: "Lora",
  },
  detailRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    fontFamily: "Lora",
  },
  nameText: {
    marginBottom: 8,
    width: 330,
    maxWidth: 330,
    color: "#202021",
    fontSize: 24,
    fontWeight: 700,
    textAlign: "left",
    fontFamily: "Roboto Slab",
  },
});

const Template26 = (props: ITemplateProps) => {
  const templateStyles = { ...STYLES };
  const formData = getStringFormData(props.formData);
  const checkForDevnagri = containsDevanagari(formData);
  if (checkForDevnagri) {
    templateStyles["detailKeyText"]["fontFamily"] = "Noto Sans Devanagari";
    templateStyles["row"]["fontFamily"] = "Noto Sans Devanagari";
    templateStyles["detailValueText"]["fontFamily"] = "Noto Sans Devanagari";
    templateStyles["detailSeparator"]["fontFamily"] = "Noto Sans Devanagari";
    templateStyles["detailRow"]["fontFamily"] = "Noto Sans Devanagari";
    templateStyles["sectionText"]["fontFamily"] = "Noto Sans Devanagari";
    templateStyles["nameText"]["fontFamily"] = "Noto Sans Devanagari";
    templateStyles["sectionSubWrapper"]["paddingTop"] = 6;
  } else {
    templateStyles["detailKeyText"]["fontFamily"] = "Lora";
    templateStyles["row"]["fontFamily"] = "Lora";
    templateStyles["detailValueText"]["fontFamily"] = "Lora";
    templateStyles["detailSeparator"]["fontFamily"] = "Lora";
    templateStyles["detailRow"]["fontFamily"] = "Lora";
    templateStyles["sectionText"]["fontFamily"] = "Roboto Slab";
    templateStyles["nameText"]["fontFamily"] = "Roboto Slab";
    templateStyles["sectionSubWrapper"]["paddingTop"] = 0;
  }

  const backgroundPath = props.isPreview
    ? "./images/template/wtm/template-bg-26-wtm.png"
    : "./images/template/template-bg-26.png";

  return (
    <CenterColorBaseTemplate
      styles={templateStyles}
      backgroundPath={backgroundPath}
      {...props}
    />
  );
};

export default async (data: ITemplateProps) => {
  return await ReactPDF.renderToStream(<Template26 {...data} />);
};
