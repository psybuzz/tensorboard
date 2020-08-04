/* Copyright 2020 The TensorFlow Authors. All Rights Reserved.

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

import {PolymerElement, html} from '@polymer/polymer';
import {customElement, property} from '@polymer/decorators';
import * as tf_backend from '../../../../components_polymer3/tf_backend/tf-backend';
import '../tf_hparams_main/tf-hparams-main';
import * as tf_hparams_backend from '../tf_hparams_backend/tf-hparams-backend';
import {LegacyElementMixin} from '../../../../components_polymer3/polymer/legacy_element_mixin';

/**
 * Tensorboard does not specify an experimentName. Currently it only
 * supports one experiment per invocation.
 */
'use strict';
const PLUGIN_NAME = 'hparams';
@customElement('tf-hparams-dashboard')
class TfHparamsDashboard extends LegacyElementMixin(PolymerElement) {
  static readonly template = html`
    <!-- Tensorboard does not specify an experimentName. Currently it only
         supports one experiment per invocation. -->
    <tf-hparams-main
      id="hparams-main"
      backend="[[_backend]]"
      experiment-name=""
    >
    </tf-hparams-main>
  `;
  @property({
    type: Object,
  })
  _backend = new tf_hparams_backend.Backend(
    /* apiUrl= */ tf_backend
      .getRouter()
      .pluginRoute(/* pluginName= */ PLUGIN_NAME, /* route= */ ''),
    new tf_backend.RequestManager(),
    /* Use GETs if we're running in colab (due to b/126387106).
          Otherwise use POSTs. */
    /* useHttpGet= */ !!((window as any).TENSORBOARD_ENV || {}).IN_COLAB
  );
  // This is called by the tensorboard web framework to refresh the plugin.
  reload() {
    (this.$['hparams-main'] as any).reload();
  }
}
