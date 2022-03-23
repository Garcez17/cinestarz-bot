import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

export async function translateAzureApi(text: string): Promise<string> {
  let translatedText = '';

  try {
    await axios({
      baseURL: process.env.AZURE_BASE_URL,
      url: '/translate',
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANSLATION_KEY,
        'Ocp-Apim-Subscription-Region': process.env.AZURE_SUBSCRIPTION_REGION,
        'Content-type': 'application/json',
        'X-ClientTraceId': uuidv4().toString()
      },
      params: {
        'api-version': '3.0',
        'from': 'en',
        'to': 'pt-br'
      },
      data: [{
        'text': text,
      }],
      responseType: 'json'
    }).then(function (response) {
      translatedText = response.data[0].translations[0].text;
    })
  } catch (err) {
    translatedText = text;
  }

  return translatedText;
}