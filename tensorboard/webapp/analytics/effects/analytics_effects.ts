import {Injectable} from '@angular/core';
import {Store, createAction} from '@ngrx/store';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {merge, EMPTY} from 'rxjs';
import {map, tap, withLatestFrom, filter, distinct} from 'rxjs/operators';

import {State} from '../../app_state';
import {changePlugin, changeReloadPeriod} from '../../core/actions';
import {getActivePlugin} from '../../core/store';

/** @typehack */ import * as _typeHackRxjs from 'rxjs';
/** @typehack */ import * as _typeHackNgrxStore from '@ngrx/store/src/models';

// Effects always return an action... :\
export const analyticsFired = createAction('[Analytics] Event Fired');

/**
 * Method 2: can make use of rxjs to make sure to only log on chnages and after
 * reducers have chance to apply business logic around the action.
 */
@Injectable()
export class AnalyticsEffects {
  /** @export */
  readonly analytics$ = createEffect(() => this.createEffectObservable());

  constructor(private actions$: Actions, private store: Store<State>) {}

  private createEffectObservable() {
    return merge(
      this.createPageViewObservable(),
      this.createGenericEventObservable()
    ).pipe(map(() => analyticsFired()));
  }

  private createPageViewObservable() {
    return this.actions$.pipe(
      ofType(changePlugin),
      withLatestFrom(this.store.select(getActivePlugin)),
      filter(([action, pluginId]) => Boolean(pluginId)),
      distinct(),
      tap(([action, pluginId]) => {
        this.sendPageView(pluginId!);
      }),
      map(([action]) => action)
    );
  }

  private createGenericEventObservable() {
    const changeReloadPeriod$ = this.actions$.pipe(ofType(changeReloadPeriod));

    return merge(changeReloadPeriod$).pipe(
      tap((action) => {
        this.sendGenericEvent(action.type);
      })
    );
  }

  sendGenericEvent(eventIdentifier: string) {
    console.log(`send generic event: ${eventIdentifier}`);
    // ga('set', 'page', `${path}/${plugin}`);
    // ga('send', 'pageview');
  }

  sendPageView(plugin: string) {
    console.log(`send page view: ${window.location.pathname}/${plugin}`);
    // ga('set', 'page', `${path}/${plugin}`);
    // ga('send', 'pageview');
  }
}
