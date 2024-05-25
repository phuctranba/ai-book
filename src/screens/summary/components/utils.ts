import {DeviceEventEmitter, NativeModules, Platform} from "react-native"
import { Device } from "ui/device.ui"
import EventSource from "helpers/RNEventSource";
import { useMemo } from "react";
import { useAppSelector } from "configs/store.config";
import { languages } from "languages";

const { CustomModule } = NativeModules

export const useSampleConstant = () => {
  const language  = useAppSelector(state => state.system.language)
  const option_content = useAppSelector(state => state.system.config.option_content)


  const questionSample:string[] = useMemo((): string[] => {
    return (option_content.find(i => i.key == language+`_suggest_chat`)?.value || "").split("#").filter(element => element);
  }, [language])

  const defaultQuestion = useMemo(() => {
    return languages.homeScreen.tellMeMore
  }, [language])

  return { questionSample, defaultQuestion, }
}


export const functionSendMessage = ({ chatgpt_key, messageSendToChatGPT, handleData, handleDataGPT, eventName }) => {
  // Work on android
  if (Device.isAndroid) {
    DeviceEventEmitter.removeAllListeners(eventName)

    DeviceEventEmitter.addListener(eventName, (data) => {
      if (data.includes("[DONE]")) {
        handleDataGPT(data)
        DeviceEventEmitter.removeAllListeners(eventName)
        return;
      }
      handleData(data)
    })
    CustomModule.initURL(JSON.stringify(messageSendToChatGPT), chatgpt_key, eventName)
    return;
  }

  // work in IOS

  const data = {
    model: "gpt-3.5-turbo",
    messages: messageSendToChatGPT,
    stream: true,
    temperature: 0,
    top_p: 1
  }
  const es = new EventSource("https://best-suggest.net/api/gpt/chat/completions", {
    headers: {
      Authorization: `Bearer ${chatgpt_key}`,
      "Content-Type": "application/json",
      "responseType": "stream"
    },
    body: JSON.stringify(data),
    method: "POST",
  });

  es.addEventListener("open", (event) => {
    console.log("Open SSE connection.");
  });

  es.addEventListener("message", (event) => {
    if (event.data == "[DONE]") {
      handleDataGPT()
      es.removeAllListeners()
      es.close()
      return;
    }
    handleData(event.data)
  });

  es.addEventListener("error", (event) => {
    if (event.type === "error") {
      console.error("Connection error:", event.message);
    } else if (event.type === "exception") {
      console.error("Error:", event.message, event.error);
    }
  });

  es.addEventListener("close", (event) => {
    console.log("Close SSE connection.");
  });
}
