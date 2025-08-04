import React from "react";
import ReactPDF, { Font, StyleSheet } from "@react-pdf/renderer";
import { ITemplateProps } from "../../types/templateTypes";
import BaseTemplate from "../BaseTemplate/DefaultBaseTemplate";
import { containsDevanagari, getStringFormData } from "../../utils";

Font.register({
  family: "Poppins",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLGT9V1tvFP-KUEg.ttf",
    },
    {
      src: "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7V1tvFP-KUEg.ttf",
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
    padding: "100 46 100 44",
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
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  sectionGap: {
    height: 30,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    fontFamily: "Poppins",
    marginBottom: 4,
  },
  keyText: {
    fontSize: 12,
    width: 140,
    color: "#FFFFFF",
  },
  valueText: {
    fontSize: 12,
    fontWeight: 500,
    maxWidth: 340,
    color: "#FFFFFF",
  },
  limitedValueText: {
    maxWidth: 170,
  },
  separator: {
    fontSize: 12,
    marginRight: 24,
    color: "#FFFFFF",
  },
  profile: {
    position: "absolute",
    right: 10,
    top: 30,
    width: 140,
    height: 200,
    objectFit: "cover",
    border: "2 solid #FFFFFF",
    borderRadius: 4,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 2,
  },
});

const Template8 = (props: ITemplateProps) => {
  const backgroundPath = props.isPreview
    ? "/images/template/wtm/template-bg-8-wtm.png"
    : "/images/template/template-bg-8.png";

  const templateStyles = { ...STYLES };
  const formData = getStringFormData(props.formData);
  const checkForDevnagri = containsDevanagari(formData);

  if (checkForDevnagri) {
    templateStyles["sectionText"]["fontFamily"] = "Noto Sans Devanagari";
    templateStyles["row"]["fontFamily"] = "Noto Sans Devanagari";
  } else {
    templateStyles["sectionText"]["fontFamily"] = "Poppins";
    templateStyles["row"]["fontFamily"] = "Poppins";
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
  return await ReactPDF.renderToStream(<Template8 {...data} />);
};
