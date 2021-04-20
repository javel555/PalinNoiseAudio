// ライブラリ準備
// import SimplexNoise from 'simplex-noise';
var SimplexNoise = require('simplex-noise');
const SIMPLEX = new SimplexNoise();
const ctx = new AudioContext();

const canvas = document.getElementById('canvas');
const glCtx = canvas.getContext('2d');
glCtx.fillStyle = 'rgb(0,128,255);';

// 作る音の長さ
const frameCount = ctx.sampleRate * 1.0;
/*
  このframeCountは音のバッファ（配列のようなもん）の長さとして使用する
  sampleRateは1秒に何バイト使うか。の情報　この場合２秒分の長さの音を作る
*/

// 音量調整
const gainNode = ctx.createGain();
gainNode.gain.value = 0.1;
/*
  WebAudioは、エフェクターのような仕組みがあり、ここでは音量調整エフェクターを用意する
*/

// 制御用の変数
let sampleSource;
let isPlaying = false;

/**
 * 音の作成
 * 
 * @returns 
 */
async function setupSample(){
    // もともとはファイルを読み込んでバッファを作成する
    // const response = await fetch("../sample.mp3");
    // const arrayBuffer = await response.arrayBuffer();

    // const audioBuffer = await ctx.decodeAudioData(arrayBuffer.buffer);

    const audioBuffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
    const buffer = audioBuffer.getChannelData(0);
    const seed = Math.random();
    const s_color = Math.random() * 0.05;
    const t_color = Math.random() * 0.5;
    // const s_pich = Math.floor(Math.random() * 400) + 10; // 音の高さも変えたい
    const s_pich = 240;
    const t_pich = 0.03;
    for(let i = 0; i < frameCount; i++){
        // バッファにパーリンノイズを書き込み。
        // bufferは -1.0 ～ 1.0 である事
        buffer[i] = SIMPLEX.noise2D(seed, i % s_pich * s_color); 
        // buffer[i] = SIMPLEX.noise2D(seed, Math.sin(i * t_pich) * t_color); 
        /*
          第１引数はSimplexNoiseに1次元パーリンノイズが無いので、シードとして扱う。
          iに対する係数で周波数を制御してる。
          周波数を上げるとホワイトノイズっぽい

          と言うより、周波数の制御を出来るのが特徴と考えた方が良いかもしれない

          余剰でシードをいじると三角波っぽい

        */

        // ただのノイズ 周波数制御が出来ない・・・
        // buffer[i] = Math.random() * 2 - 1;

    }
    glCtx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=0; i< frameCount; i++){
      if(i >= canvas.width) break;
      const x = i;
      const y = buffer[i] * canvas.height * 0.5 + canvas.height * 0.5;
      const nx = x+1;
      const ny = buffer[i+1] * canvas.height * 0.5 + canvas.height * 0.5;
      glCtx.beginPath();
      glCtx.moveTo(x,y);
      glCtx.lineTo(nx,ny);
      glCtx.stroke();
      console.log(buffer[i]);
    }

    return audioBuffer;
}

// 再生機周りの用意
function playSample(ctx, audioBuffer){
    // 音源
    sampleSource = ctx.createBufferSource(); // 実態はAudioBufferSourceNode
    sampleSource.buffer = audioBuffer;
    sampleSource.loop = true

    sampleSource
      .connect(gainNode)         // 音量調整器を接続
      .connect(ctx.destination); // ctx.destinationがスピーカーに繋がっている
    sampleSource.start(); // 再生開始
    isPlaying = true;
}

document.querySelector("#play").addEventListener("click", async ()=>{
    if(isPlaying) sampleSource?.stop();
    const sample = await setupSample();
    playSample(ctx, sample);
});

document.querySelector("#stop").addEventListener("click", async ()=>{
    sampleSource?.stop();
    isPlaying = false;
});
