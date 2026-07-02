import devConfig from "./development";
import qaConfig from "./qa";
import prodConfig from "./production";

let config: any;

switch (process.env.NODE_ENV) {
  case "production":
    config = prodConfig;
    break;
  case "qa":
    config = qaConfig;
    break;
  default:
    config = devConfig;
}

export default config;
