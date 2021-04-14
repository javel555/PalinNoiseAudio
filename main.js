// ライブラリ準備
const ctx = new AudioContext();
const SIMPLEX = new SimplexNoise();

// 作る音の長さ
const frameCount = ctx.sampleRate * 2.0;
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
    for(let i = 0; i < frameCount; i++){
        // バッファにパーリンノイズを書き込み。
        buffer[i] = SIMPLEX.noise2D(10120, i * 0.008);
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
    if(isPlaying) return;
    const sample = await setupSample();
    playSample(ctx, sample);
});

document.querySelector("#stop").addEventListener("click", async ()=>{
    sampleSource?.stop();
    isPlaying = false;
});