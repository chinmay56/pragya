import sys
import os
import json
import io
from faster_whisper import WhisperModel

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file path provided"}))
        sys.exit(1)
        
    audio_path = sys.argv[1]
    if not os.path.exists(audio_path):
        print(json.dumps({"error": f"Audio file not found: {audio_path}"}))
        sys.exit(1)

    # Determine model directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.abspath(os.path.join(script_dir, "..", "..", "models", "speech", "whisper"))

    try:
        model = WhisperModel(model_dir, device="cpu", compute_type="int8")
        segments, info = model.transcribe(audio_path, beam_size=5, language="en")
        
        full_text = " ".join([segment.text for segment in segments]).strip()
        
        print(json.dumps({
            "text": full_text,
            "language": info.language,
            "language_probability": info.language_probability,
            "duration": info.duration
        }))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
