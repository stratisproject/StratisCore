import { Injectable } from "@angular/core";
// import { AppConfig } from "../../app.config";

@Injectable()
export class ConfigService {
  constructor() {
    // const defaultConfig = window.settings.file();
    // window.settings.setPath(`${defaultConfig}.${AppConfig.production ? "prod" : "dev"}`);
    console.log(`Using config file ${window.settings.file()}`);
  }

  public settings = window.settings;
}
