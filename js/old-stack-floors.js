// stack-floors.js
(function(){
  function toggleStack(){
    const wrap = document.getElementById('map-wrap');
    if(!wrap) return;
    wrap.classList.toggle('stack-on');
  }

  // делаем глобально, чтобы можно было вызвать из кнопки
  window.toggleStackView = toggleStack;

  // Быстро: горячая клавиша "V" (view)
  window.addEventListener('keydown', (e) => {
    if(e.key.toLowerCase() === 'v') toggleStack();
  });
})();
