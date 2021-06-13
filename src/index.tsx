import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';

const App = () => {
  const buildRef = useRef<any>();
  const iframeRef = useRef<any>();
  const [input, setInput] = useState('');

  const startService = async () => {
    buildRef.current = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
    });
  };
  useEffect(() => {
    startService();
  }, []);

  const transpileCode = async () => {
    if (!buildRef.current) {
      return;
    }

    iframeRef.current.srcdoc = html; // reset iframe-content before each transpilation

    const result = await buildRef.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
    });

    iframeRef.current.contentWindow.postMessage(
      result.outputFiles[0].text,
      '*'
    );
  };

  const html = `
   <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script>
        window.addEventListener('message', (event)=> {
        try{
            eval(event.data)
          } catch(err){
            const root = document.querySelector('#root');
            root.innerHTML = '<div style="color: red"><h4 style="margin-bottom: 2.5px">Runtime Error</h4>' + err + '</div>';
            console.error(err);
          }
        }, false)
        </script>
      </body>
   </html>
  `;

  return (
    <div>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={transpileCode}>Submit</button>
      </div>
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        srcDoc={html}
        title="preview"
      ></iframe>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));

// import React from 'react'
// import ReactDOM from 'react-dom'

// const Test = () => {
//   return <div>Was geht</div>
// }

// ReactDOM.render(<Test/>, document.querySelector('#root'))
