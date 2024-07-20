import lightLogo from "../assets/logos/logo-light.webp";
import darkLogo from "../assets/logos/logo-dark.webp";
import goldIcon from "../assets/icons/icon-gold-cinephoria.webp";
import standardQuality from "../assets/qualities/quality-standard.svg";
import fourDXQuaality from "../assets/qualities/quality-4dx.svg";
import imaxQuality from "../assets/qualities/quality-imax.svg";
import real3DQuality from "../assets/qualities/quality-real-3d.svg";
import dolbyCinemaQuality from "../assets/qualities/quality-dolby-cinema.svg";
import screenXQuality from "../assets/qualities/quality-screenx.svg";

const BASE_URL = process.env.VITE_API_URL || "http://localhost:5000";
console.log(process.env.VITE_API_URL);

const qualityIcons = {
  Standard: standardQuality,
  "4DX": fourDXQuaality,
  IMAX: imaxQuality,
  "RealD 3D": real3DQuality,
  "Dolby Cinema": dolbyCinemaQuality,
  ScreenX: screenXQuality,
};

// Videos
const backgroundVideoUrl =
  "https://cinephoriamedia.s3.us-east-2.amazonaws.com/Background+Videos/background-video.mp4";

export {
  backgroundVideoUrl,
  BASE_URL,
  lightLogo,
  darkLogo,
  goldIcon,
  qualityIcons,
};
