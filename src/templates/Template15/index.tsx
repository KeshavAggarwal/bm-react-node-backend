import React from "react";
import ReactPDF, { Font, StyleSheet } from "@react-pdf/renderer";
import { ITemplateProps } from "../../types/templateTypes";
import BaseTemplate from "../BaseTemplate/DefaultBaseTemplate";
import { containsDevanagari, getStringFormData } from "../../utils";

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
  page: {
    display: "flex",
    flexDirection: "column",
    padding: "160 130 140 120",
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
    color: "#62450e",
    fontWeight: "bold",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  sectionGap: {
    height: 20,
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
    width: 110,
    lineHeight: 1.5,
    color: "#452b22",
  },
  valueText: {
    fontSize: 12,
    fontWeight: 500,
    maxWidth: 210,
    lineHeight: 1.5,
    color: "#452b22",
  },
  limitedValueText: {
    maxWidth: 150,
  },
  separator: {
    fontSize: 12,
    marginRight: 24,
  },
  profile: {
    position: "absolute",
    right: -20,
    top: -60,
    width: 85,
    height: 85,
    objectFit: "cover",
    borderRadius: "50%",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%",
  },
});

const Template15 = (props: ITemplateProps) => {
  const backgroundPath = props.isPreview
    ? "./images/template/wtm/template-bg-15-wtm.png"
    : "./images/template/template-bg-15.png";

  const templateStyles = { ...STYLES };
  const formData = getStringFormData(props.formData);
  const checkForDevnagri = containsDevanagari(formData);

  if (checkForDevnagri) {
    templateStyles["sectionText"]["fontFamily"] = "Noto Sans Devanagari";
    templateStyles["row"]["fontFamily"] = "Noto Sans Devanagari";
  } else {
    templateStyles["sectionText"]["fontFamily"] = "Lora";
    templateStyles["row"]["fontFamily"] = "Lora";
  }

  return (
    <BaseTemplate
      styles={templateStyles}
      backgroundPath={backgroundPath}
      imageVariant="side-round"
      {...props}
    />
  );
};

export default async (data: ITemplateProps) => {
  return await ReactPDF.renderToStream(<Template15 {...data} />);
};
