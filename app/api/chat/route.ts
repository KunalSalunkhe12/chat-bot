/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const { resumeText, question } = await req.json();
    if (!resumeText || !question) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: `Resume content: ${resumeText}\n\nQuestion: ${question}`,
        },
      ],
      model: "gpt-4o-mini",
    });

    console.log(completion.choices[0]);
    return NextResponse.json({
      result: completion.choices[0].message?.content,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "An error occurred during your request." },
      { status: 500 }
    );
  }
}
//   if (!configuration.apiKey) {
//     return NextResponse.json(
//       { error: "OpenAI API key not configured" },
//       { status: 500 }
//     );
//   }

//   try {
//     const { resumeText, question } = await req.json();

//     if (!resumeText || !question) {
//       return NextResponse.json(
//         { error: "Missing required parameters" },
//         { status: 400 }
//       );
//     }

//     const completion = await openai.createChatCompletion({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a helpful assistant analyzing a resume. The resume content will be provided, followed by a user question about the resume.",
//         },
//         {
//           role: "user",
//           content: `Resume content: ${resumeText}\n\nQuestion: ${question}`,
//         },
//       ],
//     });

//     return NextResponse.json({
//       result: completion.data.choices[0].message?.content,
//     });
//   } catch (error: any) {
//     if (error.response) {
//       console.error(error.response.status, error.response.data);
//       return NextResponse.json(
//         { error: error.response.data },
//         { status: error.response.status }
//       );
//     } else {
//       console.error(`Error with OpenAI API request: ${error.message}`);
//       return NextResponse.json(
//         { error: "An error occurred during your request." },
//         { status: 500 }
//       );
//     }
//   }
