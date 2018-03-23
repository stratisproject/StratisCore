// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { Observable } from 'rxjs/Observable';

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// Then we find all the tests.
// Currently many of the default tests generatedby angular have never been looked at
// and need to be fixed, so we only include a subset of them that is working
// It is mostly the tests like *component.spec.ts that need a bit of care
const context = require.context('./', true, /(\.service\.spec\.ts)|(pipe\.spec\.ts)|(directive\.spec\.ts)/);
// const context = require.context('./', true, /\.spec\.ts$/);


// And load the modules.
context.keys().map(context);
