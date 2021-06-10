import { useEffect, useState, useRef } from 'react';
import * as esbuild from 'esbuild-wasm';
import ReactDOM from 'react-dom';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';

const App: React.FC = () => {
  const ref = useRef<any>();
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: '/esbuild.wasm',
    });
  };

  const transpileCode = async () => {
    if (!ref.current) return;

    const transpiledCode = await ref.current.build(
      {
        entryPoints: ['index.js'],
        bundle: true,
        write: false,
        plugins: [unpkgPathPlugin(input)],
        define: {
          'process.env.NODE_ENV': '"production"',
          global: 'window',
        },
      },
      {
        loader: 'jsx',
        target: 'es2015',
      }
    );
    setCode(transpiledCode.outputFiles[0].text);
  };

  useEffect(() => {
    startService();
  }, []);

  return (
    <div>
      <textarea onChange={e => setInput(e.target.value)} value={input} />
      <div>
        <button onClick={transpileCode}>Submit</button>
      </div>
      <pre>{code}</pre>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
