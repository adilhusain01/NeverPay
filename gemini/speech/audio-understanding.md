Gemini can analyze audio input and generate text responses.  

### JavaScript

    import {
      GoogleGenAI,
      createUserContent,
      createPartFromUri,
    } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const myfile = await ai.files.upload({
        file: "path/to/sample.mp3",
        config: { mimeType: "audio/mp3" },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: createUserContent([
          createPartFromUri(myfile.uri, myfile.mimeType),
          "Describe this audio clip",
        ]),
      });
      console.log(response.text);
    }

    await main();

## Overview

Gemini can analyze and understand audio input and generate text responses to it,
enabling use cases like the following:

- Describe, summarize, or answer questions about audio content.
- Provide a transcription and translation of the audio (speech to text).
- Detect and label different speakers (speaker diarization).
- Detect emotion in speech and music.
- Analyze specific segments of the audio, and provide timestamps.

As of now the Gemini API doesn't support real-time transcription use cases.
For real-time voice and video interactions refer to the [Live API](https://ai.google.dev/gemini-api/docs/live).
For dedicated speech to text models with support for real-time transcription,
use the [Google Cloud Speech-to-Text API](https://cloud.google.com/speech-to-text).

## Transcribe speech to text

This example application shows how to prompt the Gemini API to transcribe,
translate, and summarize speech, including timestamps, speaker diarization, and
emotion detection using
[structured outputs](https://ai.google.dev/gemini-api/docs/structured-output).  

### JavaScript

    import {
      GoogleGenAI,
      Type
    } from "@google/genai";

    const ai = new GoogleGenAI({});

    const YOUTUBE_URL = "https://www.youtube.com/watch?v=ku-N-eS1lgM";

    async function main() {
      const prompt = `
          Process the audio file and generate a detailed transcription.

          Requirements:
          1. Identify distinct speakers (e.g., Speaker 1, Speaker 2, or names if context allows).
          2. Provide accurate timestamps for each segment (Format: MM:SS).
          3. Detect the primary language of each segment.
          4. If the segment is in a language different than English, also provide the English translation.
          5. Identify the primary emotion of the speaker in this segment. You MUST choose exactly one of the following: Happy, Sad, Angry, Neutral.
          6. Provide a brief summary of the entire audio at the beginning.
        `;

      const Emotion = {
        Happy: 'happy',
        Sad: 'sad',
        Angry: 'angry',
        Neutral: 'neutral'
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              fileData: {
                fileUri: YOUTUBE_URL,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: "A concise summary of the audio content.",
              },
              segments: {
                type: Type.ARRAY,
                description: "List of transcribed segments with speaker and timestamp.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    speaker: { type: Type.STRING },
                    timestamp: { type: Type.STRING },
                    content: { type: Type.STRING },
                    language: { type: Type.STRING },
                    language_code: { type: Type.STRING },
                    translation: { type: Type.STRING },
                    emotion: {
                      type: Type.STRING,
                      enum: Object.values(Emotion)
                    },
                  },
                  required: ["speaker", "timestamp", "content", "language", "language_code", "emotion"],
                },
              },
            },
            required: ["summary", "segments"],
          },
        },
      });
      const json = JSON.parse(response.text);
      console.log(json);
    }

    await main();

## Input audio

You can provide audio data to Gemini in the following ways:

- [Upload an audio file](https://ai.google.dev/gemini-api/docs/audio#upload-audio) before making a request to `generateContent`.
- [Pass inline audio data](https://ai.google.dev/gemini-api/docs/audio#inline-audio) with the request to `generateContent`.

To learn about other file input methods, see the
[File input methods](https://ai.google.dev/gemini-api/docs/file-input-methods) guide.

### Upload an audio file

You can use the [Files API](https://ai.google.dev/gemini-api/docs/files) to upload an audio file.
Always use the Files API when the total request size (including the files, text
prompt, system instructions, etc.) is larger than 20 MB.

The following code uploads an audio file and then uses the file in a call to
`generateContent`.  

### JavaScript

    import {
      GoogleGenAI,
      createUserContent,
      createPartFromUri,
    } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const myfile = await ai.files.upload({
        file: "path/to/sample.mp3",
        config: { mimeType: "audio/mp3" },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: createUserContent([
          createPartFromUri(myfile.uri, myfile.mimeType),
          "Describe this audio clip",
        ]),
      });
      console.log(response.text);
    }

    await main();


### Pass audio data inline

Instead of uploading an audio file, you can pass inline audio data in the
request to `generateContent`:  

### JavaScript

    import { GoogleGenAI } from "@google/genai";
    import * as fs from "node:fs";

    const ai = new GoogleGenAI({});
    const base64AudioFile = fs.readFileSync("path/to/small-sample.mp3", {
      encoding: "base64",
    });

    const contents = [
      { text: "Please summarize the audio." },
      {
        inlineData: {
          mimeType: "audio/mp3",
          data: base64AudioFile,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
    });
    console.log(response.text);

## Get a transcript

To get a transcript of audio data, just ask for it in the prompt:  


### JavaScript

    import {
      GoogleGenAI,
      createUserContent,
      createPartFromUri,
    } from "@google/genai";

    const ai = new GoogleGenAI({});
    const myfile = await ai.files.upload({
      file: "path/to/sample.mp3",
      config: { mimeType: "audio/mpeg" },
    });

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: createUserContent([
        createPartFromUri(myfile.uri, myfile.mimeType),
        "Generate a transcript of the speech.",
      ]),
    });
    console.log("result.text=", result.text);

## Refer to timestamps

You can refer to specific sections of an audio file using timestamps of the form
`MM:SS`. For example, the following prompt requests a transcript that

- Starts at 2 minutes 30 seconds from the beginning of the file.
- Ends at 3 minutes 29 seconds from the beginning of the file.

### JavaScript

    // Create a prompt containing timestamps.
    const prompt = "Provide a transcript of the speech from 02:30 to 03:29."

## Count tokens

Call the `countTokens` method to get a count of the number of tokens in an
audio file. For example:  

### JavaScript

    import {
      GoogleGenAI,
      createUserContent,
      createPartFromUri,
    } from "@google/genai";

    const ai = new GoogleGenAI({});
    const myfile = await ai.files.upload({
      file: "path/to/sample.mp3",
      config: { mimeType: "audio/mpeg" },
    });

    const countTokensResponse = await ai.models.countTokens({
      model: "gemini-3-flash-preview",
      contents: createUserContent([
        createPartFromUri(myfile.uri, myfile.mimeType),
      ]),
    });
    console.log(countTokensResponse.totalTokens);

## Supported audio formats

Gemini supports the following audio format MIME types:

- WAV - `audio/wav`
- MP3 - `audio/mp3`
- AIFF - `audio/aiff`
- AAC - `audio/aac`
- OGG Vorbis - `audio/ogg`
- FLAC - `audio/flac`

## Technical details about audio

- Gemini represents each second of audio as 32 tokens; for example, one minute of audio is represented as 1,920 tokens.
- Gemini can "understand" non-speech components, such as birdsong or sirens.
- The maximum supported length of audio data in a single prompt is 9.5 hours. Gemini doesn't limit the *number* of audio files in a single prompt; however, the total combined length of all audio files in a single prompt can't exceed 9.5 hours.
- Gemini downsamples audio files to a 16 Kbps data resolution.
- If the audio source contains multiple channels, Gemini combines those channels into a single channel.

## What's next

This guide shows how to generate text in response to audio data. To learn more,
see the following resources:

- [File prompting strategies](https://ai.google.dev/gemini-api/docs/files#prompt-guide): The Gemini API supports prompting with text, image, audio, and video data, also known as multimodal prompting.
- [System instructions](https://ai.google.dev/gemini-api/docs/text-generation#system-instructions): System instructions let you steer the behavior of the model based on your specific needs and use cases.
- [Safety guidance](https://ai.google.dev/gemini-api/docs/safety-guidance): Sometimes generative AI models produce unexpected outputs, such as outputs that are inaccurate, biased, or offensive. Post-processing and human evaluation are essential to limit the risk of harm from such outputs.