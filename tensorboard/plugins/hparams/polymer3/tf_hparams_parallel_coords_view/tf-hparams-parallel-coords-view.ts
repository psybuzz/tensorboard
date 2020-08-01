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
import {DO_NOT_SUBMIT} from '../tf-imports/polymer.html';
import {DO_NOT_SUBMIT} from '../tf-hparams-scale-and-color-controls/tf-hparams-scale-and-color-controls.html';
import {DO_NOT_SUBMIT} from '../tf-hparams-parallel-coords-plot/tf-hparams-parallel-coords-plot.html';
import {DO_NOT_SUBMIT} from '../tf-hparams-session-group-details/tf-hparams-session-group-details.html';
import {DO_NOT_SUBMIT} from '../tf-hparams-session-group-values/tf-hparams-session-group-values.html';
import {DO_NOT_SUBMIT} from '../tf-imports/vaadin-split-layout.html';
import {DO_NOT_SUBMIT} from '../tf-imports/polymer.html';
import {DO_NOT_SUBMIT} from '../tf-hparams-scale-and-color-controls/tf-hparams-scale-and-color-controls.html';
import {DO_NOT_SUBMIT} from '../tf-hparams-parallel-coords-plot/tf-hparams-parallel-coords-plot.html';
import {DO_NOT_SUBMIT} from '../tf-hparams-session-group-details/tf-hparams-session-group-details.html';
import {DO_NOT_SUBMIT} from '../tf-hparams-session-group-values/tf-hparams-session-group-values.html';
import {DO_NOT_SUBMIT} from '../tf-imports/vaadin-split-layout.html';
'use strict';
@customElement('tf-hparams-parallel-coords-view')
class TfHparamsParallelCoordsView extends PolymerElement {
  static readonly template = html`
    <!-- Controls behavior of parallel coordinates plot
         outputs set options to the _options property.
      -->
    <div class="pane">
      <vaadin-split-layout vertical="">
        <!-- The scale and color controls. -->
        <tf-hparams-scale-and-color-controls
          id="controls"
          class="section"
          configuration="[[configuration]]"
          session-groups="[[sessionGroups]]"
          options="{{_options}}"
        >
        </tf-hparams-scale-and-color-controls>
        <vaadin-split-layout vertical="">
          <!-- The actual parallel coordinates plot -->
          <tf-hparams-parallel-coords-plot
            id="plot"
            class="section"
            session-groups="[[sessionGroups]]"
            selected-session-group="{{_selectedGroup}}"
            closest-session-group="{{_closestGroup}}"
            options="[[_options]]"
          >
          </tf-hparams-parallel-coords-plot>
          <vaadin-split-layout vertical="">
            <tf-hparams-session-group-values
              id="values"
              class="section"
              visible-schema="[[configuration.visibleSchema]]"
              session-group="[[_closestOrSelected(
                             _closestGroup, _selectedGroup)]]"
            >
            </tf-hparams-session-group-values>
            <tf-hparams-session-group-details
              id="details"
              class="section"
              backend="[[backend]]"
              experiment-name="[[experimentName]]"
              session-group="[[_selectedGroup]]"
              visible-schema="[[configuration.visibleSchema]]"
            >
            </tf-hparams-session-group-details>
          </vaadin-split-layout>
        </vaadin-split-layout>
      </vaadin-split-layout>
    </div>

    <style>
      .pane {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .section {
        margin: 10px;
      }
      #controls {
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: auto;
        height: auto;
        overflow-y: auto;
        max-height: fit-content;
      }
      #plot {
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: auto;
        height: 100%;
        overflow-y: auto;
      }
      #values {
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: auto;
        height: 95px;
        overflow-y: auto;
        max-height: fit-content;
      }
      #details {
        flex-grow: 0;
        flex-shrink: 1;
        flex-basis: auto;
        height: auto;
        overflow-y: auto;
        max-height: fit-content;
      }
      vaadin-split-layout {
        height: 100%;
      }
    </style>
  `;
  @property({type: Object})
  backend: object;
  @property({type: String})
  experimentName: string;
  @property({type: Object})
  configuration: object;
  @property({type: Array})
  sessionGroups: unknown[];
  _closestOrSelected(closestSessionGroup, selectedSessionGroup) {
    if (closestSessionGroup !== null) {
      return closestSessionGroup;
    }
    return selectedSessionGroup;
  }
}
