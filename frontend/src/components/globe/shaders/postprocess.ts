import * as Cesium from "cesium";
import type { ShaderMode } from "@/types";

export const CRT_SHADER = `
  uniform sampler2D colorTexture;
  in vec2 v_textureCoordinates;
  out vec4 fragColor;

  void main() {
      vec2 uv = v_textureCoordinates;

      // Barrel distortion (subtle)
      vec2 center = uv - 0.5;
      float dist = dot(center, center);
      uv = uv + center * dist * 0.05;

      // Scanlines
      float scanline = sin(uv.y * 800.0) * 0.04;

      // Color channel offset (chromatic aberration)
      float r = texture(colorTexture, uv + vec2(0.001, 0.0)).r;
      float g = texture(colorTexture, uv).g;
      float b = texture(colorTexture, uv - vec2(0.001, 0.0)).b;

      // Vignette
      float vignette = 1.0 - dist * 1.5;

      fragColor = vec4(vec3(r, g, b) * (1.0 - scanline) * vignette, 1.0);
  }
`;

export const NVG_SHADER = `
  uniform sampler2D colorTexture;
  uniform float czm_frameNumber;
  in vec2 v_textureCoordinates;
  out vec4 fragColor;

  void main() {
      vec2 uv = v_textureCoordinates;
      vec4 color = texture(colorTexture, uv);

      // Convert to luminance
      float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));

      // Amplify (night vision boost)
      lum = pow(lum, 0.8) * 1.5;

      // Add noise grain
      float noise = fract(sin(dot(uv * czm_frameNumber, vec2(12.9898, 78.233))) * 43758.5453);
      lum += noise * 0.08;

      // Green phosphor color
      vec3 nvg = vec3(lum * 0.1, lum * 1.0, lum * 0.15);

      // Vignette (circular, like goggles)
      vec2 center = uv - 0.5;
      float dist = length(center);
      float vignette = smoothstep(0.6, 0.3, dist);

      fragColor = vec4(nvg * vignette, 1.0);
  }
`;

export const FLIR_SHADER = `
  uniform sampler2D colorTexture;
  in vec2 v_textureCoordinates;
  out vec4 fragColor;

  void main() {
      vec2 uv = v_textureCoordinates;
      vec4 color = texture(colorTexture, uv);

      // Luminance as "temperature"
      float temp = dot(color.rgb, vec3(0.299, 0.587, 0.114));

      // FLIR iron palette mapping
      vec3 thermal;
      if (temp < 0.25) {
          thermal = mix(vec3(0.0, 0.0, 0.2), vec3(0.0, 0.0, 1.0), temp * 4.0);
      } else if (temp < 0.5) {
          thermal = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 1.0), (temp - 0.25) * 4.0);
      } else if (temp < 0.75) {
          thermal = mix(vec3(1.0, 0.0, 1.0), vec3(1.0, 1.0, 0.0), (temp - 0.5) * 4.0);
      } else {
          thermal = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 1.0, 1.0), (temp - 0.75) * 4.0);
      }

      fragColor = vec4(thermal, 1.0);
  }
`;

const STAGE_PREFIX = "brazil-intel-";

export function applyShader(scene: Cesium.Scene, mode: ShaderMode): void {
  clearShaders(scene);

  if (mode === "none") return;

  const shader =
    mode === "crt" ? CRT_SHADER : mode === "nvg" ? NVG_SHADER : FLIR_SHADER;

  const stage = new Cesium.PostProcessStage({
    fragmentShader: shader,
    name: `${STAGE_PREFIX}${mode}`,
  });

  scene.postProcessStages.add(stage);
}

export function clearShaders(scene: Cesium.Scene): void {
  const stages = scene.postProcessStages;
  for (let i = stages.length - 1; i >= 0; i--) {
    const stage = stages.get(i);
    if (stage.name?.startsWith(STAGE_PREFIX)) {
      stages.remove(stage);
    }
  }
}
