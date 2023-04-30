import axios from "axios/index";

export async function speechToText({
                                       filePath,
                                       tokenGPT,
                                       language
                                   }: { filePath: string, tokenGPT: string, language: string }): Promise<string> {
    const newForm = new FormData();
    newForm.append("file", {
        name: "sound.mp4",
        uri: filePath,
        type: "audio/mp4",
        path: filePath,
    })
    newForm.append("model", "whisper-1")
    newForm.append("language", language)

    let response = await axios.post("https://api.openai.com/v1/audio/transcriptions", newForm, {
        headers: {
            Authorization: `Bearer ${tokenGPT}`,
            "Content-Type": "multipart/form-data",
        }
    })

    if (response.status === 200 && response.data) {
        if (response.data?.text.length > 0) {
            return response.data?.text
        }
    }
    throw "Cant"
}
