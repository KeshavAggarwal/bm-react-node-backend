import React from "react";
import ReactPDF, { Font, StyleSheet } from "@react-pdf/renderer";
import { ITemplateProps } from "../../types/templateTypes";
import BaseTemplate from "../BaseTemplate/DefaultBaseTemplate";
import { containsDevanagari, getStringFormData } from "../../utils";

Font.register({
    family: "Roboto",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf",
      },
      {
        src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf",
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
      padding: "100 60 100 60",
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
      fontFamily: "Roboto",
      fontSize: 14,
      color: "#100D0A",
      fontWeight: "bold",
      marginBottom: 12,
    },
    sectionGap: {
      height: 20,
    },
    row: {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      fontFamily: "Roboto",
      marginBottom: 7,
    },
    keyText: {
      fontSize: 12,
      width: 140,
      color: "#100D0A",
    },
    valueText: {
      fontSize: 12,
      fontWeight: 500,
      maxWidth: 310,
      color: "#100D0A",
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
      right: 10,
      top: 30,
      width: 140,
      height: 200,
      objectFit: "cover",
      border: "2 solid #B4A363",
      borderRadius: 4,
    },
    profileImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: 2,
    },
  });

  const Template0 = (props: ITemplateProps) => {
    const templateStyles = { ...STYLES };
    const formData = getStringFormData(props.formData);
    const checkForDevnagri = containsDevanagari(formData);
  
    if (checkForDevnagri) {
        templateStyles["sectionText"]["fontFamily"] = "Noto Sans Devanagari";
        templateStyles["row"]["fontFamily"] = "Noto Sans Devanagari";
      } else {
        templateStyles["sectionText"]["fontFamily"] = "Roboto";
        templateStyles["row"]["fontFamily"] = "Roboto";
      }
  
    return (
        <BaseTemplate
        styles={templateStyles}
        backgroundPath="./images/template/template-bg-0.png"
        {...props}
      />
    );
  };
  
  export default async (data: ITemplateProps) => {
    return await ReactPDF.renderToStream(<Template0 {...data} />);
  };
  