import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { NextResponse } from "next/server";

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID as string;
const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID as string;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env
  .GOOGLE_SERVICE_ACCOUNT_EMAIL as string;
const GOOGLE_SERVICE_PRIVATE_KEY = process.env
  .GOOGLE_SERVICE_PRIVATE_KEY as string;

export async function POST(req: Request) {
  const { data } = await req.json();
  const rowIndex = await appendSpreadsheet(data);

  return new NextResponse(rowIndex as any);
}

const appendSpreadsheet = async (data: any) => {
  console.log("@@@ data", data);

  // Auth
  const serviceAccountAuth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_SERVICE_PRIVATE_KEY.split(String.raw`\n`).join("\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth) as any;

  try {
    await doc.loadInfo();

    // Get sheet
    const sheet = doc.sheetsByIndex[0]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    console.log(sheet.title);
    console.log(sheet.rowCount);

    // Read rows
    let rows = await sheet.getRows();
    console.log("@@@ rows.length", rows.length);

    // Append row
    for (const item of data.items) {
      await sheet.addRow({
        Tag: item.tag,
        Description: item.description,
        Price: item.price,
      });
    }
    // const row = await sheet.addRow({
    //   Tag: "tag",
    //   Description: "desc",
    //   Price: 1000,
    // });

    // // Get new row index
    // const rowIndex = parseInt(row.rowNumber) - 2; // -1 for header & -1 for index

    // return rowIndex;
  } catch (error) {
    console.error(error);
  }
};
