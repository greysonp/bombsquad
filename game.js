this.game = this.game || {};

(function(exports){

  var KEY_UP = 38;
  var KEY_DOWN = 40;
  var KEY_LEFT = 37;
  var KEY_RIGHT = 39;

  var STAGE_WIDTH = 25;
  var STAGE_HEIGHT = 25;
  var BLINK_SLOWEST = 1000;
  var MAX_DISTANCE = Math.sqrt(STAGE_WIDTH * STAGE_WIDTH + STAGE_HEIGHT * STAGE_HEIGHT);

  var _pixel = null;
  var _colorOn = '#ffffff';
  var _colorOff = '#000000';
  var _timerId = 0;
  var _pixelState = false;
  var _player = {
    x: STAGE_WIDTH / 2,
    y: STAGE_HEIGHT / 2
  }




  var _targets = [];

  function init() {
    // Find element
    _pixel = document.getElementById('pixel');

    // Add event listener
    document.addEventListener('keyup', onKeyUp);

    // Add a target to the list
    _targets.push({
      x: Math.round(Math.random() * STAGE_WIDTH),
      y: Math.round(Math.random() * STAGE_HEIGHT)
    });

    // Kick it off
    updateBlinkRate();
  }

  function onKeyUp(e) {
    switch(e.keyCode) {
      case KEY_UP:
        _player.y = Math.max(_player.y - 1, 0);
        updateBlinkRate();
      break;

      case KEY_DOWN:
        _player.y = Math.min(_player.y + 1, STAGE_HEIGHT);
        updateBlinkRate();
      break;

      case KEY_LEFT:
        _player.x = Math.max(_player.x - 1, 0);
        updateBlinkRate();
      break;

      case KEY_RIGHT:
        _player.x = Math.min(_player.x + 1, STAGE_WIDTH);
        updateBlinkRate();
      break;
    }
    console.log(_player);
  }

  function updateBlinkRate() {
    var target = findNearestTarget();
    if (target != null) {
      var dist = getDistance(target, _player);
      var percentClose = dist / MAX_DISTANCE;
      var blinkRate = BLINK_SLOWEST * percentClose;

      clearInterval(_timerId);
      if (blinkRate > 0) {
        _timerId = setInterval(function() {
          setPixelState(!_pixelState);
        }, blinkRate);
      } else {
        setPixelState(true);
      }
    }
  }

  function setPixelState(state) {
    _pixelState = state;
    if (state) {
      _pixel.style.backgroundColor = _colorOn;
    } else {
      _pixel.style.backgroundColor = _colorOff;
    }
  }

  function findNearestTarget() {
    var nearest = null;
    var closestDistance = 1000000000;

    for (var i = 0; i < _targets.length; i++) {
      var target = _targets[i];
      var dist = getDistance(target, _player);
      if (dist < closestDistance) {
        nearest = target;
        closestDistance = dist;
      }
    }

    return nearest;
  }

  function getDistance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  exports.init = init;

})(this.game);

game.init();
