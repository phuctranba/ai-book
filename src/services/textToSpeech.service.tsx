import axios from "axios/index";
import { generateParamRequest } from "helpers/string.helper";
import fs from "react-native-fs";

export async function textToSpeech({ text, tokenGoogle, language, gender }: { text: string, tokenGoogle: string, language: string, gender?: "Male" | "Female" }): Promise<{ name: string, path: string }> {
    let paramsRequest = {
        key: tokenGoogle
    }
    console.log(language, "language ok")
    let body = {
        input: {
            text: text
        },
        voice: {
            "languageCode": language,
            // "ssmlGender": "FEMALE",
            // "name": "en-US-Neural2-J"
        },
        audioConfig: {
            audioEncoding: "MP3",
            effectsProfileId: [
                "medium-bluetooth-speaker-class-device"
            ],
            pitch: 0,
            speakingRate: 1.1
        }
    };
    let nameFile = new Date().getTime();
    let response = await axios.post('https://texttospeech.googleapis.com/v1/text:synthesize?' + generateParamRequest(paramsRequest), body, {
        timeout: 10000
    })

    if (response.status === 200 && response.data) {
        try {
            const path = `${fs.DocumentDirectoryPath}/${nameFile}.mp3`;
            let file = await fs.writeFile(path, response.data.audioContent, 'base64').then(() => path).catch(() => { throw "cant" })
            console.log({ name: nameFile + "", path: file })
            return { name: nameFile + "", path: file }
        } catch (error) {
            console.log("catch error", error);
        }
    }

    throw "cant"
}
