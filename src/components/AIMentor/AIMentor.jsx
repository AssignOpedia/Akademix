import { useEffect, useRef, useState } from "react";
import { GoogleGenAI, Modality } from "@google/genai";
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Loader2,
  RotateCcw,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function AIMentor() {
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [status, setStatus] = useState("Ready to talk");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const sessionRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const silentGainRef = useRef(null);
  const nextPlayTimeRef = useRef(0);

  // --------------------------------------------------
  // FLOAT32 -> INT16 PCM
  // --------------------------------------------------

  function floatTo16BitPCM(float32Array) {
    const output = new Int16Array(float32Array.length);

    for (let i = 0; i < float32Array.length; i++) {
      const sample = Math.max(
        -1,
        Math.min(1, float32Array[i])
      );

      output[i] =
        sample < 0
          ? sample * 0x8000
          : sample * 0x7fff;
    }

    return output;
  }

  // --------------------------------------------------
  // DOWNSAMPLE AUDIO
  // --------------------------------------------------

  function downsample(
    buffer,
    inputSampleRate,
    outputSampleRate = 16000
  ) {
    if (inputSampleRate === outputSampleRate) {
      return buffer;
    }

    const ratio =
      inputSampleRate / outputSampleRate;

    const newLength = Math.round(
      buffer.length / ratio
    );

    const result = new Float32Array(
      newLength
    );

    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round(
        (offsetResult + 1) * ratio
      );

      let accum = 0;
      let count = 0;

      for (
        let i = offsetBuffer;
        i < nextOffsetBuffer &&
        i < buffer.length;
        i++
      ) {
        accum += buffer[i];
        count++;
      }

      result[offsetResult] =
        count > 0 ? accum / count : 0;

      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }

    return result;
  }

  // --------------------------------------------------
  // ARRAY BUFFER -> BASE64
  // --------------------------------------------------

  function arrayBufferToBase64(buffer) {
    let binary = "";

    const bytes = new Uint8Array(buffer);

    const chunkSize = 0x8000;

    for (
      let i = 0;
      i < bytes.length;
      i += chunkSize
    ) {
      binary += String.fromCharCode(
        ...bytes.subarray(
          i,
          i + chunkSize
        )
      );
    }

    return btoa(binary);
  }

  // --------------------------------------------------
  // BASE64 -> INT16
  // --------------------------------------------------

  function base64ToInt16(base64) {
    const binary = atob(base64);

    const bytes = new Uint8Array(
      binary.length
    );

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new Int16Array(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength / 2
    );
  }

  // --------------------------------------------------
  // PLAY GEMINI AUDIO
  // --------------------------------------------------

  function playAudio(base64Audio) {
    if (!audioContextRef.current) {
      return;
    }

    try {
      const audioContext =
        audioContextRef.current;

      const pcm =
        base64ToInt16(base64Audio);

      if (!pcm.length) {
        return;
      }

      const audioBuffer =
        audioContext.createBuffer(
          1,
          pcm.length,
          24000
        );

      const channel =
        audioBuffer.getChannelData(0);

      for (let i = 0; i < pcm.length; i++) {
        channel[i] =
          pcm[i] / 32768;
      }

      const source =
        audioContext.createBufferSource();

      source.buffer = audioBuffer;

      source.connect(
        audioContext.destination
      );

      const now =
        audioContext.currentTime;

      if (
        nextPlayTimeRef.current <
        now
      ) {
        nextPlayTimeRef.current =
          now;
      }

      source.start(
        nextPlayTimeRef.current
      );

      nextPlayTimeRef.current +=
        audioBuffer.duration;

      setSpeaking(true);

      source.onended = () => {
        setSpeaking(false);
      };
    } catch (err) {
      console.error(
        "Audio playback error:",
        err
      );
    }
  }

  // --------------------------------------------------
  // MICROPHONE
  // --------------------------------------------------

  async function getMicrophone() {
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      throw new Error(
        "Your browser does not support microphone access."
      );
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: {
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          }
        );

      const audioTracks =
        stream.getAudioTracks();

      if (!audioTracks.length) {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        throw new Error(
          "No microphone audio track was detected."
        );
      }

      console.log(
        "Akademix microphone:",
        audioTracks[0].label
      );

      return stream;
    } catch (err) {
      console.error(
        "Microphone error:",
        err
      );

      if (
        err?.name ===
        "NotFoundError"
      ) {
        throw new Error(
          "No microphone was found. Connect or enable a microphone and try again."
        );
      }

      if (
        err?.name ===
        "NotAllowedError"
      ) {
        throw new Error(
          "Microphone permission was denied. Allow microphone access in your browser."
        );
      }

      if (
        err?.name ===
        "NotReadableError"
      ) {
        throw new Error(
          "Your microphone is being used by another application."
        );
      }

      throw err;
    }
  }

  // --------------------------------------------------
  // START AI MENTOR
  // --------------------------------------------------

  async function startMentor() {
    if (isStarting || connected) {
      return;
    }

    setOpen(true);
    setError("");
    setTranscript("");
    setIsStarting(true);
    setStatus("Checking microphone...");

    if (!API_KEY) {
      setStatus("API key missing");

      setError(
        "Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env.local file."
      );

      setIsStarting(false);
      return;
    }

    let stream = null;

    try {
      // ----------------------------------------------
      // 1. MICROPHONE FIRST
      // ----------------------------------------------

      stream =
        await getMicrophone();

      streamRef.current = stream;

      setStatus(
        "Microphone connected"
      );

      // ----------------------------------------------
      // 2. AUDIO CONTEXT
      // ----------------------------------------------

      const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error(
          "Web Audio is not supported by this browser."
        );
      }

      const audioContext =
        new AudioContextClass({
          sampleRate: 16000,
        });

      audioContextRef.current =
        audioContext;

      await audioContext.resume();

      // ----------------------------------------------
      // 3. GEMINI
      // ----------------------------------------------

      setStatus(
        "Connecting to Akademix..."
      );

      const ai = new GoogleGenAI({
        apiKey: API_KEY,
      });

      const session =
        await ai.live.connect({
          model: "gemini-3.8-live",

          config: {
            responseModalities: [
              Modality.AUDIO,
            ],

            inputAudioTranscription: {},

            outputAudioTranscription: {},

            systemInstruction: `
You are Akademix AI Mentor.

You are an intelligent, friendly and supportive
academic mentor inside the Akademix platform.

Your job is to help students make informed academic
and career decisions.

You can help with:

1. Subject selection
2. Subject comparison
3. Career exploration
4. University exploration
5. Professor discovery
6. Higher studies
7. Engineering
8. Computer Science
9. Artificial Intelligence
10. Machine Learning
11. Data Science
12. Science
13. Physics
14. Mathematics
15. Medicine
16. Biotechnology
17. Business
18. Finance
19. Economics
20. Law
21. Humanities
22. Social Sciences
23. Research
24. Study planning
25. Assignment guidance
26. Academic mentoring

IMPORTANT:

Give practical and understandable answers.

Ask a short follow-up question when the student's
goal is unclear.

When discussing subjects, explain differences fairly.

Do not claim that one subject is universally better
than another.

When discussing careers, explain possible pathways,
skills, education requirements and examples.

When discussing universities, explain factors such
as programs, research, location, cost, admissions,
and student goals.

When discussing professors, help students understand
what expertise they should look for.

For assignments, provide:
- concept clarification
- research direction
- structure suggestions
- feedback
- learning resources

Do NOT complete assignments dishonestly or encourage
academic cheating.

Speak naturally.

Keep spoken answers concise unless the student asks
for a detailed explanation.

You are a mentor, not a salesperson.

Your purpose is to help the student understand their
options and make their own informed decision.
            `,

            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Aoede",
                },
              },
            },
          },

          callbacks: {
            // ----------------------------------------
            // CONNECTED
            // ----------------------------------------

            onopen: () => {
              console.log(
                "Akademix AI Mentor connected"
              );

              setConnected(true);
              setListening(true);
              setIsStarting(false);
              setStatus(
                "Listening..."
              );
            },

            // ----------------------------------------
            // MESSAGE
            // ----------------------------------------

            onmessage: (message) => {
              // AI AUDIO
              const parts =
                message
                  ?.serverContent
                  ?.modelTurn
                  ?.parts || [];

              for (const part of parts) {
                if (
                  part?.inlineData?.data
                ) {
                  playAudio(
                    part.inlineData.data
                  );
                }
              }

              // STUDENT TRANSCRIPT
              const inputText =
                message
                  ?.serverContent
                  ?.inputTranscription
                  ?.text;

              if (inputText) {
                setTranscript(
                  inputText
                );
              }

              // AI TRANSCRIPT
              const outputText =
                message
                  ?.serverContent
                  ?.outputTranscription
                  ?.text;

              if (outputText) {
                setTranscript(
                  outputText
                );
              }

              // TURN COMPLETE
              if (
                message
                  ?.serverContent
                  ?.turnComplete
              ) {
                setListening(true);

                setStatus(
                  "Listening..."
                );
              }
            },

            // ----------------------------------------
            // ERROR
            // ----------------------------------------

            onerror: (event) => {
              console.error(
                "Gemini Live error:",
                event
              );

              setConnected(false);
              setListening(false);
              setSpeaking(false);
              setIsStarting(false);

              setStatus(
                "Connection error"
              );

              setError(
                "The AI Mentor connection failed. Check your Gemini API key, internet connection and Live API configuration."
              );
            },

            // ----------------------------------------
            // CLOSE
            // ----------------------------------------

            onclose: () => {
              console.log(
                "Akademix AI Mentor disconnected"
              );

              setConnected(false);
              setListening(false);
              setSpeaking(false);
              setIsStarting(false);

              setStatus(
                "Disconnected"
              );
            },
          },
        });

      sessionRef.current =
        session;

      // ----------------------------------------------
      // 4. MICROPHONE AUDIO PIPELINE
      // ----------------------------------------------

      const source =
        audioContext.createMediaStreamSource(
          stream
        );

      sourceRef.current =
        source;

      const processor =
        audioContext.createScriptProcessor(
          4096,
          1,
          1
        );

      processorRef.current =
        processor;

      processor.onaudioprocess =
        (event) => {
          if (
            !sessionRef.current
          ) {
            return;
          }

          const input =
            event.inputBuffer.getChannelData(
              0
            );

          const downsampled =
            downsample(
              input,
              audioContext.sampleRate,
              16000
            );

          const pcm =
            floatTo16BitPCM(
              downsampled
            );

          const base64 =
            arrayBufferToBase64(
              pcm.buffer
            );

          try {
            sessionRef.current.sendRealtimeInput(
              {
                audio: {
                  data: base64,
                  mimeType:
                    "audio/pcm;rate=16000",
                },
              }
            );
          } catch (err) {
            console.error(
              "Failed to send microphone audio:",
              err
            );
          }
        };

      source.connect(
        processor
      );

      // ----------------------------------------------
      // IMPORTANT:
      // Do not send microphone back to speakers.
      // ----------------------------------------------

      const silentGain =
        audioContext.createGain();

      silentGain.gain.value = 0;

      silentGainRef.current =
        silentGain;

      processor.connect(
        silentGain
      );

      silentGain.connect(
        audioContext.destination
      );

      setConnected(true);
      setListening(true);
      setIsStarting(false);
      setStatus(
        "Listening..."
      );
    } catch (err) {
      console.error(
        "AI Mentor startup error:",
        err
      );

      if (stream) {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

      cleanupAudio();

      setConnected(false);
      setListening(false);
      setSpeaking(false);
      setIsStarting(false);

      setStatus(
        "Unable to start"
      );

      setError(
        err?.message ||
          "Unable to start AI Mentor."
      );
    }
  }

  // --------------------------------------------------
  // CLEANUP AUDIO
  // --------------------------------------------------

  function cleanupAudio() {
    try {
      if (
        processorRef.current
      ) {
        processorRef.current.disconnect();

        processorRef.current =
          null;
      }

      if (
        sourceRef.current
      ) {
        sourceRef.current.disconnect();

        sourceRef.current =
          null;
      }

      if (
        silentGainRef.current
      ) {
        silentGainRef.current.disconnect();

        silentGainRef.current =
          null;
      }

      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        streamRef.current =
          null;
      }

      if (
        audioContextRef.current
      ) {
        audioContextRef.current
          .close()
          .catch(() => {});

        audioContextRef.current =
          null;
      }

      nextPlayTimeRef.current =
        0;
    } catch (err) {
      console.error(
        "Audio cleanup error:",
        err
      );
    }
  }

  // --------------------------------------------------
  // STOP MENTOR
  // --------------------------------------------------

  function stopMentor() {
    try {
      if (
        sessionRef.current
      ) {
        try {
          sessionRef.current.close();
        } catch {
          // Already closed.
        }

        sessionRef.current =
          null;
      }
    } catch (err) {
      console.error(
        "Session cleanup error:",
        err
      );
    }

    cleanupAudio();

    setConnected(false);
    setListening(false);
    setSpeaking(false);
    setIsStarting(false);
    setStatus(
      "Ready to talk"
    );
  }

  // --------------------------------------------------
  // CLOSE UI
  // --------------------------------------------------

  function closeMentor() {
    stopMentor();

    setOpen(false);
    setError("");
    setTranscript("");
  }

  // --------------------------------------------------
  // RETRY
  // --------------------------------------------------

  function retryMentor() {
    stopMentor();

    setError("");

    setTimeout(() => {
      startMentor();
    }, 300);
  }

  // --------------------------------------------------
  // CLEANUP WHEN PAGE UNMOUNTS
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      try {
        if (
          sessionRef.current
        ) {
          sessionRef.current.close();
        }
      } catch {}

      cleanupAudio();
    };
  }, []);

  // ==================================================
  // FLOATING BUTTON
  // ==================================================

  if (!open) {
    return (
      <button
        onClick={startMentor}
        className="
          fixed
          bottom-28
          right-3
          z-[81]
          sm:bottom-32
          sm:right-6
          flex
          items-center
          gap-2
          h-11
          rounded-full
          border
          border-white/20
          bg-gradient-to-r
          from-violet-600
          via-purple-600
          to-cyan-500
          px-3
          text-white
          shadow-2xl
          shadow-violet-900/30
          transition-all
          duration-300
          hover:scale-105
          hover:shadow-cyan-500/30
          active:scale-95
        "
      >
        <span
          className="
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            bg-white/20
          "
        >
          <Mic size={17} />
        </span>

        <span className="text-xs font-semibold">
          AI Mentor
        </span>
      </button>
    );
  }

  // ==================================================
  // FULL MENTOR PANEL
  // ==================================================

  return (
    <div
      className="
        fixed
        bottom-28
        right-3
        z-[81]
        w-[calc(100vw-1.5rem)]
        max-w-[360px]
        max-h-[calc(100dvh-8rem)]
        overflow-y-auto
        sm:bottom-32
        sm:right-6
        overflow-x-hidden
        rounded-[28px]
        border
        border-white/15
        bg-slate-950/95
        text-white
        shadow-2xl
        shadow-black/40
        backdrop-blur-2xl
      "
    >
      {/* ============================================
          HEADER
      ============================================= */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-white/10
          px-5
          py-4
        "
      >
        <div>
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-violet-500
                to-cyan-400
              "
            >
              <Sparkles size={18} />
            </div>

            <div>
              <div className="font-bold">
                Akademix AI Mentor
              </div>

              <div className="text-[11px] text-slate-400">
                Voice Academic Assistant
              </div>
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-400">
            {status}
          </div>
        </div>

        <button
          onClick={closeMentor}
          className="
            rounded-full
            p-2
            text-slate-400
            transition
            hover:bg-white/10
            hover:text-white
          "
        >
          <X size={19} />
        </button>
      </div>

      {/* ============================================
          ERROR
      ============================================= */}

      {error && (
        <div
          className="
            mx-5
            mt-5
            rounded-2xl
            border
            border-red-400/20
            bg-red-500/10
            p-4
          "
        >
          <div className="flex gap-3">
            <AlertCircle
              size={20}
              className="
                mt-0.5
                shrink-0
                text-red-400
              "
            />

            <div>
              <p className="text-sm font-semibold text-red-200">
                AI Mentor couldn't start
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-red-200/70
                "
              >
                {error}
              </p>
            </div>
          </div>

          <button
            onClick={retryMentor}
            className="
              mt-3
              flex
              items-center
              gap-2
              rounded-full
              bg-white/10
              px-4
              py-2
              text-xs
              font-medium
              text-white
              transition
              hover:bg-white/15
            "
          >
            <RotateCcw size={14} />
            Try again
          </button>
        </div>
      )}

      {/* ============================================
          VOICE VISUALIZER
      ============================================= */}

      <div
        className="
          flex
          flex-col
          items-center
          px-5
          py-8
        "
      >
        <div className="relative">
          {/* Outer ring */}

          <div
            className={`
              absolute
              -inset-4
              rounded-full
              border
              border-cyan-400/10
              ${
                listening || speaking
                  ? "animate-ping"
                  : ""
              }
            `}
          />

          <div
            className={`
              absolute
              -inset-2
              rounded-full
              border
              border-violet-400/20
              ${
                listening || speaking
                  ? "animate-pulse"
                  : ""
              }
            `}
          />

          {/* Main orb */}

          <div
            className={`
              relative
              flex
              h-32
              w-32
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-violet-600
              via-purple-600
              to-cyan-500
              shadow-2xl
              shadow-violet-600/30
              ${
                listening || speaking
                  ? "scale-105"
                  : ""
              }
              transition-all
              duration-500
            `}
          >
            <div
              className="
                absolute
                inset-3
                rounded-full
                bg-slate-950/30
              "
            />

            <div
              className="
                absolute
                inset-7
                rounded-full
                bg-white/10
                blur-md
              "
            />

            {speaking ? (
              <Volume2
                size={38}
                className="
                  relative
                  z-10
                  animate-pulse
                "
              />
            ) : listening ? (
              <Mic
                size={38}
                className="
                  relative
                  z-10
                  animate-pulse
                "
              />
            ) : (
              <MicOff
                size={38}
                className="relative z-10"
              />
            )}
          </div>
        </div>

        {/* Status */}

        <div className="mt-7 text-center">
          <p className="text-base font-semibold">
            {speaking
              ? "Akademix is speaking..."
              : listening
                ? "I'm listening..."
                : isStarting
                  ? "Connecting..."
                  : "Ready to talk"}
          </p>

          <p
            className="
              mt-2
              max-w-[280px]
              text-xs
              leading-5
              text-slate-400
            "
          >
            Ask me about subjects, careers,
            universities, professors, research
            or your academic journey.
          </p>
        </div>
      </div>

      {/* ============================================
          TRANSCRIPT
      ============================================= */}

      {transcript && (
        <div
          className="
            mx-5
            mb-5
            rounded-2xl
            border
            border-white/5
            bg-white/5
            p-4
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-[11px]
              uppercase
              tracking-wider
              text-slate-500
            "
          >
            <Volume2 size={13} />

            Conversation
          </div>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-200
            "
          >
            {transcript}
          </p>
        </div>
      )}

      {/* ============================================
          FOOTER
      ============================================= */}

      <div
        className="
          border-t
          border-white/10
          p-4
        "
      >
        {connected ? (
          <button
            onClick={stopMentor}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-red-500/10
              px-5
              py-3
              text-sm
              font-medium
              text-red-300
              transition
              hover:bg-red-500/20
            "
          >
            <MicOff size={17} />

            Stop conversation
          </button>
        ) : error ? (
          <button
            onClick={retryMentor}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-gradient-to-r
              from-violet-600
              to-cyan-500
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:scale-[1.01]
            "
          >
            <RotateCcw size={17} />

            Restart AI Mentor
          </button>
        ) : (
          <div
            className="
              flex
              items-center
              justify-center
              gap-2
              text-xs
              text-slate-500
            "
          >
            <Loader2
              size={15}
              className="animate-spin"
            />

            Connecting to Akademix...
          </div>
        )}
      </div>
    </div>
  );
}
