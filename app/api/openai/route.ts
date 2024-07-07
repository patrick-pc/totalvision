import { NextResponse } from "next/server";
import { parse } from "best-effort-json-parser";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  console.log("@@@ openai POST");

  const { image } = await req.json();

  console.log("@@@ image", image);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `List the tags description and price then total it. Return your output in JSON format like this:
{
  "items": [
    {
      "tag": "WC001",
      "description": "Top",
      "price": 1000
    },
    {
      "tag": "WC002",
      "description": "Skirt",
      "price": 2000
    }
  ],
  "total": 3000
}`,
          },
          {
            type: "image_url",
            image_url: {
              url: image,
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  const data = parse(response.choices[0].message.content);
  console.log("@@@ data", data);

  //   const base64String = image.split(",")[1];
  //   const claude = await anthropic.messages.create({
  //     model: "claude-3-5-sonnet-20240620",
  //     max_tokens: 1024,
  //     messages: [
  //       {
  //         role: "user",
  //         content: [
  //           {
  //             type: "image",
  //             source: {
  //               type: "base64",
  //               media_type: "image/jpeg",
  //               data: base64String,
  //             },
  //           },
  //           {
  //             type: "text",
  //             text: `List the tags description and price then total it. Return your output in JSON format like this:
  // {
  //   "items": [
  //     {
  //       "tag": "WC001",
  //       "description": "Top",
  //       "price": 1000
  //     },
  //     {
  //       "tag": "WC002",
  //       "description": "Skirt",
  //       "price": 2000
  //     }
  //   ],
  //   "total": 3000
  // }`,
  //           },
  //         ],
  //       },
  //     ],
  //   });
  //   // @ts-ignore
  //   const claudeData = parse(claude.content[0].text);

  return NextResponse.json(data);
}
