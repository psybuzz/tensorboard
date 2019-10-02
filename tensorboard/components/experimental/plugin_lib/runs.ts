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
import {sendMessage, listen} from '../tf-plugin-lib/plugin-guest.js';

export async function getRuns() {
  return sendMessage('experimental.GetRuns');
}

export function setOnRunsChanged(callback: (runs: string[]) => void | void) {
  return listen('experimental.RunsChanged', callback);
}
