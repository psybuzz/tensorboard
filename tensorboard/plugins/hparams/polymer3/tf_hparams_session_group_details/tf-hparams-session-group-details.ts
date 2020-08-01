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
import '@polymer/iron-flex-layout';
import {DO_NOT_SUBMIT} from '../tf-imports/polymer.html';
import '@polymer/iron-resizable-behavior';
import {DO_NOT_SUBMIT} from '../tf-backend/tf-backend.html';
import {DO_NOT_SUBMIT} from '../tf-scalar-dashboard/tf-scalar-card.html';
import {DO_NOT_SUBMIT} from '../tf-hparams-utils/tf-hparams-utils.html';
import {DO_NOT_SUBMIT} from '../tf-color-scale/tf-color-scale.html';
import '@polymer/iron-flex-layout';
import {DO_NOT_SUBMIT} from '../tf-imports/polymer.html';
import '@polymer/iron-resizable-behavior';
import {DO_NOT_SUBMIT} from '../tf-backend/tf-backend.html';
import {DO_NOT_SUBMIT} from '../tf-scalar-dashboard/tf-scalar-card.html';
import {DO_NOT_SUBMIT} from '../tf-hparams-utils/tf-hparams-utils.html';
import {DO_NOT_SUBMIT} from '../tf-color-scale/tf-color-scale.html';
'use strict';
@customElement('tf-hparams-session-group-details')
class TfHparamsSessionGroupDetails extends PolymerElement {
  static readonly template = html`
    <template is="dom-if" if="[[!sessionGroup]]">
      <div>
        <h3>No session group selected</h3>
        <p>Please select a session group to see its metric-graphs here.</p>
      </div>
    </template>
    <template is="dom-if" if="[[!_haveMetrics(visibleSchema.*)]]">
      <div>
        <h3>No metrics are enabled</h3>
        <p>Please enable some metrics to see content here.</p>
      </div>
    </template>
    <div class="layout horizontal wrap session-group-details">
      <template
        is="dom-if"
        if="[[_haveMetricsAndSessionGroup(visibleSchema.*,
                                                  sessionGroup)]]"
      >
        <template
          is="dom-repeat"
          items="[[visibleSchema.metricInfos]]"
          as="metricInfo"
        >
          <!-- Note that we do not provide a request-manager attribute since
               we provide a function in request-data for calling the backend
               to get the metrics data.
            -->
          <tf-scalar-card
            class="scalar-card"
            color-scale="[[_colorScale]]"
            data-to-load="[[_computeSeriesForSessionGroupMetric(sessionGroup,
                          metricInfo)]]"
            tag="[[metricInfo.name.tag]]"
            tag-metadata="[[_computeTagMetadata(metricInfo)]]"
            x-type="[[_xType]]"
            multi-experiments="[[_noMultiExperiments]]"
            request-data="[[_requestData]]"
            active=""
          >
          </tf-scalar-card>
        </template>
      </template>
    </div>
    <!-- "iron-flex" is needed to use the layout classes in the div above -->
    <style include="iron-flex">
      :host {
        display: block;
      }
    </style>
  `;
  @property({type: Object})
  backend: object;
  @property({type: String})
  experimentName: string;
  @property({type: Object})
  visibleSchema: object;
  @property({type: Object})
  sessionGroup: object;
  @property({
    type: String,
  })
  _xType: string = vz_chart_helpers.XType.STEP;
  @property({
    type: Boolean,
  })
  _noMultiExperiments: boolean = false;
  @property({type: Object})
  _indexOfSession: object;
  @property({type: Number})
  _sessionGroupNameHash: number;
  @property({
    type: Function,
  })
  _requestData: object = function() {
    return ({tag, run}) => {
      const request = {
        experimentName: this.experimentName,
        sessionName: run,
        metricName: tag,
      };
      return this.backend.listMetricEvals(request);
    };
  };
  @property({
    type: Object,
  })
  _colorScale: object = function() {
    return {
      scale: (seriesName) => {
        // The tf-scalar-card API sends a seriesName as a JSON
        // representation of the 2-element array [experiment, run],
        // where 'run' is the run we return in the 'requestData'
        // function--in our case that is the session name, and
        // 'experiment' is not used here tf-scalar-card's
        // multi-experiment attribute is turned off here).
        // The color of a session is determined by choosing a
        // starting point in 'palette' based on the sessionGroup name
        // and walking cyclicly 'sessionIndex' steps in the array, where
        // sesionIndex is the index of the session in the
        // group. We do this instead of just hashing the session name,
        // to guarantee that we don't repeat a color if the number
        // of sessions is at most the size of the palette.
        // Note that this method is called every time the user moves
        // over the metric plot, so it needs to be reasonably fast.
        const sessionName = JSON.parse(seriesName)[1];
        const sessionIndex = this._indexOfSession.get(sessionName);
        const palette = tf_color_scale.standard;
        return palette[
          (this._sessionGroupNameHash + sessionIndex) % palette.length
        ];
      },
    };
  };
  // Whenever the backend sends a new 'sessionGroups' array reply to the
  // ListSessionGroups RPC, we recreate the tf-session-group-detail
  // elements that correspond to session groups whose name is in the new
  // sessionGroups array. As such this element can be constructed when one
  // of its parents container is invisible: for example, if sessionGroups
  // was replaced when the user was on the parallel-coordinates view tab
  // and the new sessionGroups contains a session group object
  // whose metrics were open in the table view tab (i.e. the old
  // sessionGroups array contained a distinct JavaScript sessionGroup
  // object with same name).
  // If this happens, the tf-scalar-card child elements of this element
  // would measure a 0 size of their bounding boxes and would render
  // incorrectly. To avoid that, we listen for the 'iron-resize' event
  // that is fired by 'iron-pages' whenever the active page changes and
  // redraw each tf-scalar-card child.
  behaviors: [Polymer.IronResizableBehavior];
  redraw() {
    Polymer.dom(this.root)
      .querySelectorAll('tf-scalar-card')
      .forEach((c) => c.redraw());
  }
  @observe('sessionGroup.*')
  _sessionGroupChanged() {
    if (!this.sessionGroup) {
      this._indexOfSession = new Map();
      this._sessionGroupNameHash = 0;
    } else {
      this._indexOfSession = new Map(
        this.sessionGroup.sessions.map((session, index) => [
          session.name,
          index,
        ])
      );
      this._sessionGroupNameHash = tf.hparams.utils.hashOfString(
        this.sessionGroup.name
      );
    }
    // Reset each scalar-card by prodding 'tag'.
    // We do this so the card will reset its domain on the next load.
    Polymer.dom(this.root)
      .querySelectorAll('tf-scalar-card')
      .forEach((c) => {
        const tag = c.get('tag');
        c.set('tag', '');
        c.set('tag', tag);
      });
  }
  _haveMetrics() {
    return (
      this.visibleSchema &&
      Array.isArray(this.visibleSchema.metricInfos) &&
      this.visibleSchema.metricInfos.length > 0
    );
  }
  _haveMetricsAndSessionGroup() {
    return this.sessionGroup && this._haveMetrics();
  }
  // Returns an array of the tensorboard 'runs' and 'tags' corresponding to
  // the given metric in each of the sessions in the given session group.
  _computeSeriesForSessionGroupMetric(sessionGroup, metricInfo) {
    if (sessionGroup === null || metricInfo === null) {
      return [];
    }
    return sessionGroup.sessions
      .filter(
        // If this session does not currently have a value for the given
        // metric then we don't want to include its run.
        (session) =>
          tf.hparams.utils.metricValueByName(
            session.metricValues,
            metricInfo.name
          ) !== undefined
      )
      .map(
        // Since the 'tag' and 'run' fields are essentially opaque
        // for the tf-scalar-card element, and passed as is to the
        // requestData function, we use them to encode the fields we
        // need to supply to the eval_metrics API (called in our
        // implementation of requestData above).
        (session) => ({tag: metricInfo.name, run: session.name})
      );
  }
  // Computes the tag-metadata attribute to send to the
  // tf-scalar-card element.
  _computeTagMetadata(metricInfo) {
    return {
      displayName: tf.hparams.utils.metricName(metricInfo),
      description: metricInfo.description || '',
    };
  }
}
