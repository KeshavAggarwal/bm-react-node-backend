import express, { Request, Response } from "express";
import { BaseResponse, TemplateListItem } from "../types/response";
import ConfigManager from "../models/configManager";
import { ITemplateProps } from "../types/templateTypes";

const Router = express.Router();

Router.post("/preview", async (req: Request, res: Response) => {
  try {
    const { fd, image_path } = req.body;

    // Generate HTML with preview flag
    const formData: ITemplateProps = {
      formData: JSON.stringify(fd),
      isPreview: false,
      imagePath: image_path,
    };
  } catch (error: any) {
    console.error("Error generating preview:", error);
    const response: BaseResponse<null> = {
      status: false,
      data: null,
      error: {
        message: `Failed to generate preview: ${error.message}`,
        code: 500,
      },
    };
    res.status(500).json(response);
  }
});

Router.get("/list", async (req: Request, res: Response) => {
  try {
    const currency = (req.query.currency as string) || "INR";

    const priceIds = ["PRICE_1", "PRICE_2", "PRICE_3"].map(
      (id) => `${id}${currency === "USD" ? "_USD" : ""}`
    );

    const configs = await ConfigManager.find({ key: { $in: priceIds } }).lean();

    const configMap = configs.reduce<Record<string, any>>((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    const [p1, p2, p3] = priceIds.map((key) =>
      parseFloat(configMap[key] ?? "0")
    );

    const templates: TemplateListItem[] = [
      {
        id: "eg0",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823902/light-green-marriage-biodata-format_jvoczv.webp",
        price: 0,
        imageOnly: false,
      },
      {
        id: "eg23",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823903/white-brown-theme-marriage-biodata-sample-format-girl_tkjfkq.png",
        price: p3,
        imageOnly: false,
      },
      {
        id: "eg24",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823903/red-background-marriage-biodata-template-example-girl_ailbsm.png",
        price: p3,
        imageOnly: false,
      },
      {
        id: "eg25",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823899/blue-background-marriage-biodata-template-example-boy_hcuhgi.png",
        price: p3,
        imageOnly: false,
      },
      {
        id: "eg26",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823902/pink-theme-marriage-biodata-template-example-girl_k8mxcx.png",
        price: p3,
        imageOnly: false,
      },
      {
        id: "eg20",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823902/elegant-marriage-biodata-sample-boy_sh4jra.png",
        price: p3,
        imageOnly: true,
      },
      {
        id: "eg21",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823902/elegant-marriage-biodata-sample-girl_yuhov2.webp",
        price: p3,
        imageOnly: true,
      },
      {
        id: "eg12",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823903/popular-hindu-marriage-biodata-format_k6dt5z.png",
        price: p2,
        imageOnly: false,
      },
      {
        id: "eg14",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823901/clean-hindu-marriage-biodata-format_gjg2o5.png",
        price: p2,
        imageOnly: false,
      },
      {
        id: "eg6",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823901/beautiful-marriage-biodata-format_ivtltv.png",
        price: p2,
        imageOnly: false,
      },
      {
        id: "eg7",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823904/white-background-marriage-biodata-format_o6nosy.png",
        price: p2,
        imageOnly: false,
      },
      {
        id: "eg30",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823900/gautam-buddha-marriage-biodata-format_kkqu61.webp",
        price: p2,
        imageOnly: false,
      },
      {
        id: "eg15",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823901/flowers-marriage-biodata-format_qnxr2e.webp",
        price: p2,
        imageOnly: false,
      },
      {
        id: "eg11",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823903/red-bordered-marriage-biodata-format_dcixfy.png",
        price: p2,
        imageOnly: false,
      },
      {
        id: "eg13",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823903/yellow-bordered-marriage-biodata-format_xvojfk.png",
        price: p2,
        imageOnly: false,
      },
      {
        id: "eg1",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823903/traditional-theme-marriage-biodata-format_pztrv6.webp",
        price: p1,
        imageOnly: false,
      },
      {
        id: "eg2",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823901/blue-background-marriage-biodata-format_s9i3ge.webp",
        price: p1,
        imageOnly: false,
      },
      {
        id: "eg3",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823901/green-background-marriage-biodata-format_xe5sxm.webp",
        price: p1,
        imageOnly: false,
      },
      {
        id: "eg10",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823903/simple-minimalist-marriage-biodata-format_bqdw6t.png",
        price: p1,
        imageOnly: false,
      },
      {
        id: "eg4",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823901/brown-background-marriage-biodata-format_waybyz.webp",
        price: p1,
        imageOnly: false,
      },
      {
        id: "eg5",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823902/orange-bordered-marriage-biodata-format_jijcua.webp",
        price: p1,
        imageOnly: false,
      },
      {
        id: "eg8",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823900/brown-theme-marriage-biodata-format_grywax.webp",
        price: p1,
        imageOnly: false,
      },
      {
        id: "eg9",
        imageUrl:
          "https://res.cloudinary.com/drmmw7mn8/image/upload/v1753823904/classic-marriage-biodata-format_jg2cfy.png",
        price: p1,
        imageOnly: false,
      },
    ];

    const response: BaseResponse<TemplateListItem[]> = {
      status: true,
      data: templates,
      error: null,
    };
    res.json(response);
  } catch (error: any) {
    console.error("Error fetching template list:", error);
    const response: BaseResponse<null> = {
      status: false,
      data: null,
      error: {
        message: "Internal Server Error",
        code: 500,
      },
    };
    res.status(500).json(response);
  }
});

export { Router };
