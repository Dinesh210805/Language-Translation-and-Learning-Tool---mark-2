export const LANGUAGE_TO_SPEECH_CODE: { [key: string]: string } = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-PT",
  zh: "zh-CN",
  "zh-TW": "zh-TW",
  ja: "ja-JP",
  ko: "ko-KR",
  ru: "ru-RU",
  ar: "ar-SA",
  hi: "hi-IN",
  bn: "bn-IN",
  tr: "tr-TR",
  vi: "vi-VN",
  th: "th-TH",
  nl: "nl-NL",
  el: "el-GR",
  pl: "pl-PL",
  ta: "ta-IN",
  te: "te-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  mr: "mr-IN",
  pa: "pa-IN",
  ur: "ur-PK",
  id: "id-ID",
  ms: "ms-MY",
  fil: "fil-PH",
  sv: "sv-SE",
  da: "da-DK",
  no: "nb-NO",
  fi: "fi-FI",
  cs: "cs-CZ",
  ro: "ro-RO",
  hu: "hu-HU",
  uk: "uk-UA",
  he: "he-IL",
};

export function speakText(text: string, lang: string = "en-US"): Promise<void> {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGE_TO_SPEECH_CODE[lang] || lang;
    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);
    window.speechSynthesis.speak(utterance);
  });
}

export function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
}
