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
import {changePlugin} from '../core/actions';
import {getActivePlugin} from '../core/store';
import {State} from '../app_state';

// We fake the global 'ga' object, so the object is a noop. The
// google.analytics typing gives the object a type of UniversalAnalytics.ga.
// We do not track open source users.
declare const ga: Function;

class EventSender {
  static sendPageView(path: string, plugin: string) {
    console.log(`send page view: ${path}/${plugin}`);
    // ga('set', 'page', `${path}/${plugin}`);
    // ga('send', 'pageview');
  }
}

/**
 * Method 1: send events baesd on action and current state only.
 *
 * Trade-off:
 * - you log what *user did to the system*, not system reacting to the action,
 *   which is often good enough.
 * - if you want to only log based on diff, it becomes a bit harder
 *   - idea: you can use something like rxjs to make sure it is distinct.
 */
function maybeSendEvent(prevState: State, action: Action) {
  switch (action.type) {
    // Expect this list to grow...
    // Please do not apply too much logic in the case statement. You want it
    // to read like simple enumeration of all the cases when events get fired.
    // Factor the logic out if need be.
    case changePlugin.type:
      util.EventSender.sendPageView(
        window.location.pathname,
        (action as ReturnType<typeof changePlugin>).plugin
      );
      break;
  }
}

export function analyticsMetaReducer(
  reducer: ActionReducer<any>
): ActionReducer<any> {
  return (state: State, action: Action) => {
    maybeSendEvent(state, action);
    return reducer(state, action);
  };
}

const util = {getActivePlugin, EventSender} as any;
export const TEST_ONLY = {util};
