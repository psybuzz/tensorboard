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
import {NgModule} from '@angular/core';
// Uses `async` pipe.
import {CommonModule} from '@angular/common';

import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSelectModule} from '@angular/material/select';

import {HeaderComponent} from './header_component';
import {HeaderContainer} from './header_container';
import {CoreModule} from '../core/core_module';
import {SettingsModule} from '../settings/settings_module';

@NgModule({
  declarations: [HeaderComponent, HeaderContainer],
  exports: [HeaderComponent, HeaderContainer],
  providers: [],
  imports: [
    MatToolbarModule,
    MatTabsModule,
    MatSelectModule,
    CommonModule,
    CoreModule,
    SettingsModule,
  ],
})
export class HeaderModule {}
