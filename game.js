this.game = this.game || {};

(function(exports){

  var KEY_UP = 38;
  var KEY_DOWN = 40;
  var KEY_LEFT = 37;
  var KEY_RIGHT = 39;
  var KEY_SPACE = 32;

  var STAGE_WIDTH = 10;
  var STAGE_HEIGHT = 10;
  var BLINK_FASTEST = 50;
  var BLINK_SLOWEST = 1000;
  var MAX_DISTANCE = Math.sqrt(STAGE_WIDTH * STAGE_WIDTH + STAGE_HEIGHT * STAGE_HEIGHT);

  var _pixel = null;
  var _colorOn = '#ffffff';
  var _colorOff = '#000000';
  var _blinkRate = 0;
  var _pixelState = false;
  var _lastToggleTime = 0;
  var _nextToggleTime = 0;
  var _onTarget = false;
  var _sound = null;
  var _targets = [];
  var _player = {
    x: Math.round(STAGE_WIDTH / 2),
    y: Math.round(STAGE_HEIGHT / 2)
  }


  function init() {
    // Find element
    _pixel = document.getElementById('pixel');

    // Load beep
    _sound = new Howl({
      urls: ['beep.wav']
    });

    // Add event listener
    window.addEventListener('keyup', onKeyUp, false);
    window.addEventListener('keydown', onKeyDown, false);

    // Add a target to the list
    spawnTarget();

    // Initialize update loop
    setInterval(update, 1);

    // Kick it off
    _lastToggleTime = _nextToggleTime = Date.now();
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

      case KEY_SPACE:
        if (_onTarget) {
          disarm();
        }
        break;
    }
    e.preventDefault();
  }

  function onKeyDown(e) {
    e.preventDefault();
  }

  function update() {
    var time = Date.now();
    if (time > _nextToggleTime) {
      _lastToggleTime = _nextToggleTime;
      _nextToggleTime = _nextToggleTime + _blinkRate;
      if (!_onTarget) {
        setPixelState(!_pixelState);
      } else {
        setPixelState(true);
      }
    }
  }

  function updateBlinkRate() {
    var target = findNearestTarget();
    if (target != null) {
      var dist = getDistance(target, _player);
      var percentClose = dist / MAX_DISTANCE;
      _blinkRate = BLINK_FASTEST + (BLINK_SLOWEST - BLINK_FASTEST) * percentClose;

      if (dist > 0) {
        _nextToggleTime = _lastToggleTime + _blinkRate;
        _onTarget = false;
      } else {
        _onTarget = true;
      }
    }
  }

  function setPixelState(state) {
    _pixelState = state;
    if (state) {
      _pixel.style.backgroundColor = _colorOn;
      _sound.play();
    } else {
      _pixel.style.backgroundColor = _colorOff;
    }
  }

  function spawnTarget() {
    _targets.push({
      x: Math.round(Math.random() * STAGE_WIDTH),
      y: Math.round(Math.random() * STAGE_HEIGHT)
    });
  }

  function disarm() {
    var target = findNearestTarget();
    for (var i = 0; i < _targets.length; i++) {
      if (_targets[i] == target) {
        _targets.splice(i, 1);
        break;
      }
    }
    spawnTarget();
    updateBlinkRate();
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
