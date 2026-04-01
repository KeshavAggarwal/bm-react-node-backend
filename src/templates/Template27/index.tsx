import React from "react";
import ReactPDF, { Font, StyleSheet } from "@react-pdf/renderer";
import { ITemplateProps } from "../../types/templateTypes";
import { containsDevanagari, getStringFormData } from "../../utils";
import CenterRightBaseTemplate from "../BaseTemplate/CenterRightBaseTemplate";

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
  
  Font.register({
    family: "Playfair Display",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/playfairdisplay/v10/2NBgzUtEeyB-Xtpr9bm1CV6uyC_qD11hrFQ6EGgTJWI.ttf",
      },
      {
        src: "https://fonts.gstatic.com/s/playfairdisplay/v10/UC3ZEjagJi85gF9qFaBgICsv6SrURqJprbhH_C1Mw8w.ttf",
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
    padding: "110 38 80 38",
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
    marginBottom: 6,
  },
  sectionSubWrapper: {},
  sectionText: {
    fontFamily: "Playfair Display",
    fontSize: 18,
    color: "#966F16",
    fontWeight: "bold",
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
    width: 200,
    minWidth: 200,
    color: "#49370E",
  },
  valueText: {
    fontSize: 14,
    fontWeight: 500,
    maxWidth: 280,
    minWidth: 280,
    color: "#49370E",
  },
  limitedValueText: {
    maxWidth: 150,
  },
  separator: {
    fontSize: 14,
    marginRight: 24,
    color: "#49370E",
  },
  topSecContainer: {
    minWidth: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    marginBottom: 24,
  },
  profile: {
    width: 160,
    height: 160,
    objectFit: "cover",
    borderRadius: 2,
    marginLeft: 30,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 2,
  },
  dummyContainer: {
    height: "100%",
    width: 0,
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
    color: "#49370E",
    fontFamily: "Lora",
  },
  detailValueText: {
    fontSize: 14,
    maxWidth: 250,
    color: "#49370E",
    fontFamily: "Lora",
  },
  detailSeparator: {
    fontSize: 14,
    marginRight: 10,
    color: "#49370E",
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
    width: 310,
    maxWidth: 310,
    color: "#49370E",
    fontSize: 24,
    fontWeight: 700,
    textAlign: "left",
    fontFamily: "Playfair Display",
  },
});

const Template27 = (props: ITemplateProps) => {
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
  } else {
    templateStyles["detailKeyText"]["fontFamily"] = "Lora";
    templateStyles["row"]["fontFamily"] = "Lora";
    templateStyles["detailValueText"]["fontFamily"] = "Lora";
    templateStyles["detailSeparator"]["fontFamily"] = "Lora";
    templateStyles["detailRow"]["fontFamily"] = "Lora";
    templateStyles["sectionText"]["fontFamily"] = "Playfair Display";
    templateStyles["nameText"]["fontFamily"] = "Playfair Display";
  }

  const backgroundPath = props.isPreview
    ? "./images/template/wtm/template-bg-27-wtm.png"
    : "./images/template/template-bg-27.png";

  return (
    <CenterRightBaseTemplate
      styles={templateStyles}
      backgroundPath={backgroundPath}
      {...props}
    />
  );
};

export default async (data: ITemplateProps) => {
  return await ReactPDF.renderToStream(<Template27 {...data} />);
};
