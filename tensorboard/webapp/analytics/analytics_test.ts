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
import {TestBed} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {Action} from '@ngrx/store';

import {TEST_ONLY, analyticsMetaReducer} from './index';
import {coreLoaded} from '../core/actions';

function createInitialState() {
  return {};
}

describe('changing plugins', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore()],
    });

    spyOn(TEST_ONLY.util.EventSender, 'sendPageView');
  });

  it('fires when activePlugin changes', () => {
    let useInitialValue = true;
    spyOn(TEST_ONLY.util, 'getActivePlugin').and.callFake(() => {
      if (useInitialValue) {
        useInitialValue = false;
        return 'plugin-A';
      }
      return 'plugin-B';
    });

    const reducerThatChangesActivePlugin = (state: any, action: Action) => {
      useInitialValue = false;
      return state;
    };

    const fakeAction = {} as Action;
    const state = createInitialState();
    const reducer = analyticsMetaReducer(reducerThatChangesActivePlugin);
    reducer(state, coreLoaded);
    reducer(state, fakeAction);

    expect(TEST_ONLY.util.EventSender.sendPageView).toHaveBeenCalled();
  });

  it('does not fire when activePlugin remains the same', () => {
    spyOn(TEST_ONLY.util, 'getActivePlugin').and.returnValue('plugin-A');

    const identityReducer = (state: any, action: Action) => {
      return state;
    };

    const fakeAction = {} as Action;
    const state = createInitialState();
    const reducer = analyticsMetaReducer(identityReducer);
    reducer(state, coreLoaded);
    reducer(state, fakeAction);

    expect(TEST_ONLY.util.EventSender.sendPageView).not.toHaveBeenCalled();
  });
});
