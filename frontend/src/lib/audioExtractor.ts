/**
 * Audio Extraction Utility
 * Decodes the pure audio stream from any video file (MP4, MOV, WEBM, MKV, etc.)
 * in the browser using the Web Audio API, converting it to standard PCM WAV format.
 */

export async function extractAudioFromMediaFile(file: File): Promise<{ blob: Blob; filename: string; isVideo: boolean }> {
  const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|mkv|webm|mpeg|avi)$/i.test(file.name);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  if (!isVideo) {
    return {
      blob: file,
      filename: file.name,
      isVideo: false
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioContextClass();

    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const wavBlob = audioBufferToWavBlob(audioBuffer);

    await audioCtx.close();

    return {
      blob: wavBlob,
      filename: `${baseName}.wav`,
      isVideo: true
    };
  } catch (err) {
    console.warn('[AudioExtractor] Web Audio API extraction fallback, sending original file:', err);
    return {
      blob: file,
      filename: file.name,
      isVideo: true
    };
  }
}

/**
 * Convert an AudioBuffer to a standard 16-bit PCM WAV Blob
 */
function audioBufferToWavBlob(audioBuffer: AudioBuffer): Blob {
  const numChannels = Math.min(audioBuffer.numberOfChannels, 2);
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  // Interleave channels
  let result: Float32Array;
  if (numChannels === 2) {
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    result = new Float32Array(left.length + right.length);
    let index = 0;
    let inputIndex = 0;
    while (index < result.length) {
      result[index++] = left[inputIndex];
      result[index++] = right[inputIndex];
      inputIndex++;
    }
  } else {
    result = audioBuffer.getChannelData(0);
  }

  // Create WAV container buffer
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = result.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Write RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < result.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, result[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
