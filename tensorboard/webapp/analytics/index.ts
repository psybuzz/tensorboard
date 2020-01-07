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
import {Action, ActionReducer} from '@ngrx/store';
import {coreLoaded} from '../core/actions';
import {getActivePlugin} from '../core/store';

// We fake the global 'ga' object, so the object is a noop. The
// google.analytics typing gives the object a type of UniversalAnalytics.ga.
// We do not track open source users.
declare const ga: Function;

class EventSender {
  static sendPageView(pathAndPlugin: string) {
    ga('set', 'page', pathAndPlugin);
    ga('send', 'pageview');
  }
}

// Send analytics when the activePlugin changes.
export function analyticsMetaReducer(
  reducer: ActionReducer<any>
): ActionReducer<any> {
  // Must wait for 'core' to load before using its 'getActivePlugin' selector.
  let isCoreLoaded = false;

  return (state, action: Action) => {
    if (action.type === coreLoaded.type) {
      isCoreLoaded = true;
      return reducer(state, action);
    }
    if (!isCoreLoaded) return reducer(state, action);

    const oldActivePlugin = util.getActivePlugin(state);
    const nextState = reducer(state, action);
    const newActivePlugin = util.getActivePlugin(nextState);

    if (newActivePlugin && oldActivePlugin !== newActivePlugin) {
      util.EventSender.sendPageView(getPathAndPlugin(newActivePlugin));
    }

    return nextState;
  };
}

function getPathAndPlugin(pluginString: string) {
  let pathname = window.location.pathname;
  pathname += pathname.endsWith('/') ? pluginString : '/' + pluginString;
  return pathname;
}

const util = { getActivePlugin, EventSender } as any;
export const TEST_ONLY = {util};
