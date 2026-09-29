import sys
import os
import json
import wave
import base64
import io
import re
from piper.voice import PiperVoice

def clean_markdown_for_speech(text: str) -> str:
    # Remove markdown tables, markdown formatting, code blocks, URLs
    text = re.sub(r'```[\s\S]*?```', '', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'\|[^\n]+\|', '', text) # remove table rows
    text = re.sub(r'#+\s*', '', text) # remove headers
    text = re.sub(r'[\*_~]', '', text) # remove bold/italic markers
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python piper_tts.py <text_or_json_path> <output_wav_path>"}))
        sys.exit(1)

    input_arg = sys.argv[1]
    output_wav_path = sys.argv[2]

    # Check if input is a text file path or direct string
    if os.path.exists(input_arg):
        with open(input_arg, "r", encoding="utf-8") as f:
            raw_text = f.read()
    else:
        raw_text = input_arg

    cleaned_text = clean_markdown_for_speech(raw_text)
    if not cleaned_text:
        cleaned_text = "No speakable text provided."

    # Determine model directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.abspath(os.path.join(script_dir, "..", "..", "models", "speech", "piper", "en_US-lessac-medium.onnx"))

    try:
        voice = PiperVoice.load(model_path)
        os.makedirs(os.path.dirname(os.path.abspath(output_wav_path)), exist_ok=True)
        with wave.open(output_wav_path, "wb") as wav_file:
            voice.synthesize_wav(cleaned_text, wav_file)
            
        print(json.dumps({
            "success": True,
            "outputPath": output_wav_path,
            "sampleRate": voice.config.sample_rate
        }))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
