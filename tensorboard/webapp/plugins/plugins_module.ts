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
import {NgModule, Component, Type} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PluginsContainer} from './plugins_container';
import {PluginsComponent} from './plugins_component';
import {CoreModule} from '../core/core_module';

@NgModule({
  declarations: [PluginsContainer, PluginsComponent],
  exports: [PluginsContainer],
  imports: [CoreModule, CommonModule],
})
export class PluginsModule {
  pluginNameToComponent = new Map<string, Type<Component>>();

  registerPluginUI(pluginName: string, componentClass: Type<Component>) {
    this.pluginNameToComponent.set(pluginName, componentClass);
  }
}
