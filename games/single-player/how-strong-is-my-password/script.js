(() => {
  const pw = document.getElementById('pw');
  const strengthEl = document.getElementById('strength');
  const timeEl = document.getElementById('time');

  function humanTime(seconds){
    if(!isFinite(seconds) || seconds > 1e24) return 'More than billions of years (fictional)';
    const units = [ ['yr', 60*60*24*365], ['d', 60*60*24], ['h',3600], ['m',60], ['s',1] ];
    for(const [label,s] of units){
      if(seconds >= s*1.5) return Math.round(seconds/s)+' '+label;
    }
    return Math.round(seconds)+' s';
  }

  function charsetSize(s){
    let hasLower=/[a-z]/.test(s);
    let hasUpper=/[A-Z]/.test(s);
    let hasDigit=/[0-9]/.test(s);
    let hasSymbol=/[^A-Za-z0-9]/.test(s);
    let pool = 0;
    if(hasLower) pool += 26;
    if(hasUpper) pool += 26;
    if(hasDigit) pool += 10;
    if(hasSymbol) pool += 32; // rough symbol bucket
    return Math.max(pool,1);
  }

  // simple sequence penalty: detect repeated runs or keyboard-like sequences
  function sequencePenalty(s){
    if(!s) return 1;
    let lower = s.toLowerCase();
    // repeated char penalty
    if(/^(.)\1+$/.test(s)) return 0.2;
    // ascending sequences (abc, 123)
    const seqs = ['abcdefghijklmnopqrstuvwxyz','qwertyuiop','asdfghjkl','zxcvbnm','0123456789'];
    for(const seq of seqs){
      for(let i=0;i+3<=lower.length;i++){
        const sub = lower.slice(i,i+3);
        if(seq.includes(sub)) return 0.4;
      }
    }
    return 1;
  }

  // Main estimator
  function estimateTime(s){
    if(!s) return {label:'—',timeText:'Enter characters to estimate cracking time'};
    const pool = charsetSize(s);
    const len = s.length;
    const entropy = len * Math.log2(pool);
    // convert entropy to guess count ~ 2^(entropy)
    const guesses = Math.pow(2, entropy);
    // assume a fictional AI guess rate (very optimistic): 1e10 guesses/sec
    const guessesPerSec = 1e10;
    // apply sequence penalty
    const penalty = sequencePenalty(s);
    const adjustedGuesses = guesses / penalty;
    const seconds = adjustedGuesses / guessesPerSec;

    // Strength label mapping
    let label = 'Very weak';
    if(entropy > 40) label = 'Weak';
    if(entropy > 60) label = 'Moderate';
    if(entropy > 80) label = 'Strong';
    if(entropy > 120) label = 'Very strong';

    return {label, timeText: humanTime(seconds)};
  }

  pw.addEventListener('input', () => {
    const s = pw.value || '';
    const out = estimateTime(s);
    strengthEl.textContent = out.label;
    timeEl.textContent = 'Estimated time to crack (fictional AI): ' + out.timeText;
  });

})();
