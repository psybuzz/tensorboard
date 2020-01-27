/* Copyright 2019 The TensorFlow Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule, Component, Type} from '@angular/core';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';

import {AppContainer} from './app_container';
import {CoreModule} from './core/core_module';
import {HashStorageModule} from './core/views/hash_storage_module';
import {PluginsModule} from './plugins/plugins_module';

import {ROOT_REDUCERS, metaReducers} from './reducer_config';

import {HeaderModule} from './header/header_module';
import {ReloaderModule} from './reloader/reloader_module';
import {MatIconModule} from './mat_icon_module';
import {DebuggerModule} from '../plugins/debugger_v2/tf_debugger_v2_plugin/debugger_module';
import {DebuggerContainer} from '../plugins/debugger_v2/tf_debugger_v2_plugin/debugger_container';

@NgModule({
  declarations: [AppContainer],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    HashStorageModule,
    HeaderModule,
    MatIconModule,
    DebuggerModule,
    PluginsModule,
    ReloaderModule,
    StoreModule.forRoot(ROOT_REDUCERS, {
      metaReducers,
      runtimeChecks: {
        strictStateSerializability: true,
        strictActionSerializability: true,
      },
    }),
    EffectsModule.forRoot([]),
  ],
  providers: [],
  bootstrap: [AppContainer],
  entryComponents: [DebuggerContainer],
})
export class AppModule {
  constructor(private readonly pluginsModule: PluginsModule) {
    // Angular dashboards must be registered here and in the `entryComponents`
    const pluginConfig = new Map([['debugger-v2', DebuggerContainer]]);

    for (let [pluginId, componentClass] of pluginConfig) {
      const entryComponent = componentClass as Type<Component>;
      this.pluginsModule.registerPluginUI(pluginId, entryComponent);
    }
  }
}
