import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  const { imageUrl } = await request.json();
  const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {type: "text", text: "Within three words, name the object in the image."},
            {type: "image_url", image_url: {url: imageUrl, detail: "low"}},
          ],
        },
      ],
    });
    return NextResponse.json({data: response.choices[0].message.content.trim().slice(0, -1)});
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    return NextResponse.json({ error: 'Error communicating with OpenAI' }, { status: 500 });
  }
}