import React from "react";
import ReactPDF, { Font, StyleSheet } from "@react-pdf/renderer";
import { ITemplateProps } from "../../types/templateTypes";
import BaseTemplate from "../BaseTemplate/DefaultBaseTemplate";
import { containsDevanagari, getStringFormData } from "../../utils";

Font.register({
  family: "Kanit",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/kanit/v12/nKKU-Go6G5tXcr5mOCWgX6BJNUJy.ttf",
    },
    {
      src: "https://fonts.gstatic.com/s/kanit/v12/nKKU-Go6G5tXcr4uPiWgX6BJNUJy.ttf",
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
    padding: "160 48 108 54",
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
  sectionWrapper: {
    backgroundColor: "#A8422A",
    marginBottom: 12,
    padding: "6 12",
    paddingBottom: 6,
    maxWidth: 170,
    borderRadius: 2,
  },
  sectionText: {
    fontFamily: "Kanit",
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  sectionGap: {
    height: 20,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    fontFamily: "Kanit",
    marginBottom: 4,
  },
  keyText: {
    fontSize: 12,
    width: 120,
    color: "#A8422A",
  },
  valueText: {
    fontSize: 12,
    fontWeight: 500,
    maxWidth: 340,
    color: "#36454F",
  },
  limitedValueText: {
    maxWidth: 170,
  },
  separator: {
    fontSize: 12,
    marginRight: 24,
    color: "#36454F",
  },
  profile: {
    position: "absolute",
    right: 10,
    top: 30,
    width: 140,
    height: 200,
    objectFit: "cover",
    border: "2 solid #A8422A",
    borderRadius: 4,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 2,
  },
});

const Template6 = (props: ITemplateProps) => {
  const backgroundPath = props.isPreview
    ? "/images/template/wtm/template-bg-6-wtm.png"
    : "/images/template/template-bg-6.png";

  const templateStyles = { ...STYLES };
  const formData = getStringFormData(props.formData);
  const checkForDevnagri = containsDevanagari(formData);

  if (checkForDevnagri) {
    templateStyles["sectionText"]["fontFamily"] = "Noto Sans Devanagari";
    templateStyles["row"]["fontFamily"] = "Noto Sans Devanagari";
    templateStyles["sectionWrapper"]["paddingBottom"] = 2;
  } else {
    templateStyles["sectionText"]["fontFamily"] = "Kanit";
    templateStyles["row"]["fontFamily"] = "Kanit";
    templateStyles["sectionWrapper"]["paddingBottom"] = 6;
  }

  return (
    <BaseTemplate
      styles={templateStyles}
      backgroundPath={backgroundPath}
      {...props}
    />
  );
};

export default async (data: ITemplateProps) => {
  return await ReactPDF.renderToStream(<Template6 {...data} />);
};
