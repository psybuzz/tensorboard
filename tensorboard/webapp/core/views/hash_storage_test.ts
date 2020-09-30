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
import {TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {provideMockStore, MockStore} from '@ngrx/store/testing';
import {CommonModule} from '@angular/common';

import {getActivePlugin} from '../store';
import {State} from '../store/core_types';
import {pluginUrlHashChanged} from '../actions';
import {SetStringOption} from '../../deeplink/types';

import {HashStorageContainer} from './hash_storage_container';
import {HashStorageComponent} from './hash_storage_component';
import {HashDeepLinker, DeepLinkerInterface} from '../../deeplink';

/** @typehack */ import * as _typeHackStore from '@ngrx/store';
/** @typehack */ import * as _typeHackStoreTesting from '@ngrx/store/testing';

class TestableDeeplinker implements DeepLinkerInterface {
  getString(key: string) {
    return key;
  }
  setString(key: string, value: string) {}
  getPluginId() {
    return 'plugin';
  }
  setPluginId(pluginId: string) {}
}

fdescribe('hash storage test', () => {
  let store: MockStore<State>;
  let dispatchSpy: jasmine.Spy;
  let setPluginIdSpy: jasmine.Spy;
  let getPluginIdSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, CommonModule],
      providers: [
        provideMockStore(),
        HashStorageContainer,
        {provide: HashDeepLinker, useClass: TestableDeeplinker},
      ],
      declarations: [HashStorageContainer, HashStorageComponent],
    }).compileComponents();
    store = TestBed.inject<Store<State>>(Store) as MockStore<State>;
    dispatchSpy = spyOn(store, 'dispatch');
    store.overrideSelector(getActiveRoute, buildRoute());

    const deepLinker = TestBed.inject(HashDeepLinker);
    setPluginIdSpy = spyOn(deepLinker, 'setPluginId');
    getPluginIdSpy = spyOn(deepLinker, 'getPluginId');
  });

  it('sets hash to plugin id when plugin id changes from null to value', () => {
    const setPluginIdCalls: Array<{
      id: string | null;
      option: SetStringOption;
    }> = [];
    setPluginIdSpy.and.callFake(
      (id: string | null, option: SetStringOption) => {
        setPluginIdCalls.push({
          id,
          option,
        });
      }
    );
    store.overrideSelector(getActivePlugin, null);
    const fixture = TestBed.createComponent(HashStorageContainer);
    fixture.detectChanges();

    store.overrideSelector(getActivePlugin, null);
    store.refreshState();
    fixture.detectChanges();

    store.overrideSelector(getActivePlugin, 'foo');
    store.refreshState();
    fixture.detectChanges();

    store.overrideSelector(getActivePlugin, null);
    store.refreshState();
    fixture.detectChanges();

    expect(setPluginIdCalls).toEqual([
      {
        id: '',
        option: {
          useLocationReplace: true,
          defaultValue: '',
        },
      },
      {
        id: 'foo',
        option: {
          useLocationReplace: true,
          defaultValue: '',
        },
      },
      {
        id: '',
        option: {
          useLocationReplace: false,
          defaultValue: '',
        },
      },
    ]);
  });

  it('sets the hash to empty string when activePlugin is not set', () => {
    store.overrideSelector(getActivePlugin, null);
    const fixture = TestBed.createComponent(HashStorageContainer);
    fixture.detectChanges();

    expect(setPluginIdSpy).toHaveBeenCalledWith('', {
      useLocationReplace: true,
      defaultValue: '',
    });
  });

  it('sets the hash to empty string when activePlugin is empty string', () => {
    store.overrideSelector(getActivePlugin, '');
    const fixture = TestBed.createComponent(HashStorageContainer);
    fixture.detectChanges();

    expect(setPluginIdSpy).toHaveBeenCalledWith('', {
      useLocationReplace: true,
      defaultValue: '',
    });
  });

  it('changes hash with new pluginId on subsequent changes', () => {
    store.overrideSelector(getActivePlugin, 'foo');
    const fixture = TestBed.createComponent(HashStorageContainer);
    fixture.detectChanges();
    getPluginIdSpy.and.returnValue('foo');

    store.overrideSelector(getActivePlugin, 'bar');
    store.refreshState();
    fixture.detectChanges();

    expect(setPluginIdSpy).toHaveBeenCalledTimes(2);
    expect(setPluginIdSpy).toHaveBeenCalledWith('bar', jasmine.any(Object));
  });

  it('dispatches plugin changed event when hash changes', () => {
    store.overrideSelector(getActivePlugin, 'foo');
    const fixture = TestBed.createComponent(HashStorageContainer);
    fixture.detectChanges();
    getPluginIdSpy.and.returnValue('bar');

    window.dispatchEvent(new Event('hashchange'));
    expect(dispatchSpy).toHaveBeenCalledWith(
      pluginUrlHashChanged({plugin: 'bar'})
    );
  });

  it('waits for an activeRoute before setting active plugin', () => {
    store.overrideSelector(getActiveRoute, null);
    store.overrideSelector(getActivePlugin, 'foo');
    const fixture = TestBed.createComponent(HashStorageContainer);
    fixture.detectChanges();

    store.overrideSelector(getActivePlugin, 'bar');
    store.refreshState();
    fixture.detectChanges();

    expect(setPluginIdSpy).not.toHaveBeenCalled();

    store.overrideSelector(getActiveRoute, buildRoute());
    store.refreshState();
    fixture.detectChanges();

    expect(setPluginIdSpy).toHaveBeenCalledTimes(1);
    expect(setPluginIdSpy).toHaveBeenCalledWith('bar', jasmine.any(Object));
  });
});
