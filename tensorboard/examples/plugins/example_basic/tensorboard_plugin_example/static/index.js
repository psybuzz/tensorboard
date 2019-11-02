// Copyright 2019 The TensorFlow Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ==============================================================================

// import('TBPluginLibTest.js');
// import TB from './TBPluginLibTest.js';

// fetch('/data/plugin/scalars')

import * as DOM from './dom.js';

export async function render() {
  document.body.innerHTML = `
    <div id="content"></div>
    <div id="preview"></div>
    <textarea id="editor"></textarea>
  `;
  const data = await (await fetch('./runs')).json();
  const runs = Object.keys(data);
  const runToTags = run => data[run].tensors;

  const contentEl = document.querySelector('#content');
  const previewEl = document.querySelector('#preview');
  const editorEl = document.querySelector('#editor');
  
  console.log(runs)
  const select = DOM.create('select');
  for (const run of runs) {
    const option = DOM.create('option');
    option.value = run;
    option.textContent = run;
    select.appendChild(option);
  }

  select.onchange = async function() {
    console.log('changed select')
    const run = select.value;
    const tags = runToTags(run);
    const results = new Map();
    for (let tag of tags) {
      const p = new URLSearchParams({run, tag});
      const result = await (await fetch('./scalars?' + p.toString())).json();
      results.set(tag, result);
    }
    previewEl.innerHTML = '';
    for (let [tag, result] of results) {
      previewEl.innerHTML += `${tag} : ${JSON.stringify(result)}`
    }
  }

  editorEl.addEventListener('keyup', () => {
    console.log('change', editorEl.value)
    contentEl.innerHTML = editorEl.value;
  })

  document.body.appendChild(select);
}
