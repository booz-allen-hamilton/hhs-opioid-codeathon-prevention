export const CAPTURE = 'CAPTURE';

export const captureAudio = (payload) => ({
  type: CAPTURE,
  payload,
});