package com.zipenter.aibook;
import android.util.Log;
import android.graphics.Color;
import android.view.Window;
import android.app.Activity;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;

public class CustomModule extends ReactContextBaseJavaModule {
   ReactApplicationContext mReactApplicationContext;
   CustomModule(ReactApplicationContext context) {
      super(context);
      mReactApplicationContext = context;
   }

   @Override
   public String getName() {
      return "CustomModule";
   }

   @ReactMethod
   private void initURL(String text, String key, String eventName) {
      OkHttpClient client = new OkHttpClient().newBuilder()
              .connectTimeout(10, TimeUnit.SECONDS)
              .writeTimeout(10, TimeUnit.SECONDS)
              .readTimeout(30, TimeUnit.SECONDS)
              .build();
      MediaType mediaType = MediaType.parse("application/json");
      RequestBody body = RequestBody.create(mediaType, "{\n  \"model\": \"gpt-3.5-turbo\",\n  \"messages\": " + text + ",\n  \"presence_penalty\": 0,\n  \"stream\": true,\n  \"temperature\": 0.7,\n  \"top_p\": 1\n}\n");
      Request request = new Request.Builder()
              .url("https://best-suggest.net/api/gpt/chat/completions")
              .method("POST", body)
              .addHeader("Authorization", "Bearer " + key)
              .addHeader("Content-Type", "application/json")
              .build();


      client.newCall(request).enqueue(new Callback() {
         @Override
         public void onFailure(Call call, IOException e) {
            e.printStackTrace();
         }

         @Override
         public void onResponse(Call call, Response response) throws IOException {
            if (!response.isSuccessful()) {
               throw new IOException("Unexpected code " + response);
            }

            try (ResponseBody body = response.body()) {
               if (body == null) {
                  throw new IOException("Response body is null");
               }
               BufferedReader reader = new BufferedReader(body.charStream());
               String line;
               while ((line = reader.readLine()) != null) {
                  // Do something with the stream data
                  // e.g. update the UI with the received text
//                        runOnUiThread(() -> textViewResult.append(line + "\n"));
                  if (line.contains("data:")) {
                     mReactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                             .emit(eventName, line);
                  }
               }
            }
         }
      });
   }

   @ReactMethod
    public void setColor(final String color) {
        final Activity activity = getCurrentActivity();
        final int colorInt = Color.parseColor(color);
        if(activity == null)
            return;

        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                activity.getWindow().setNavigationBarColor(colorInt);
            }
        });
    }
}
