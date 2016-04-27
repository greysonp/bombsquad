this.game = this.game || {};

(function(exports){

  var KEY_UP = 38;
  var KEY_DOWN = 40;
  var KEY_LEFT = 37;
  var KEY_RIGHT = 39;
  var KEY_SPACE = 32;
  var KEY_M = 77;

  var STAGE_WIDTH = 10;
  var STAGE_HEIGHT = 10;
  var BLINK_FASTEST = 50;
  var BLINK_SLOWEST = 1000;
  var MAX_DISTANCE = Math.sqrt(STAGE_WIDTH * STAGE_WIDTH + STAGE_HEIGHT * STAGE_HEIGHT);
  var GAME_DURATION = 30 * 1000;

  var _pixel = null;
  var _titleScreen = null;
  var _gameOverScreen = null;
  var _colorOn = '#ffffff';
  var _colorOff = '#000000';
  var _blinkRate = 0;
  var _pixelState = false;
  var _lastToggleTime = 0;
  var _nextToggleTime = 0;
  var _onTarget = false;
  var _sound = null;
  var _muted = true;
  var _targets = [];
  var _state = 0; // 0 = title, 1 = game, 2 = game over
  var _gameTimerId = 0;
  var _score = 0;
  var _player = {
    x: 0,
    y: 0
  }


  function init() {
    // Find elements
    _pixel = document.getElementById('pixel');
    _titleScreen = document.getElementById('title');
    _gameOverScreen = document.getElementById('game-over');

    // Hide unnecessary elements
    _gameOverScreen.style.visibility = 'hidden';

    // Load beep
    _sound = new Howl({
      urls: ['beep.wav']
    });

    // Add event listeners
    _pixel.addEventListener('click', onPixelClick, false);
    window.addEventListener('keyup', onKeyUp, false);
    window.addEventListener('keydown', onKeyDown, false);
  }

  function initGame() {
    // Hide other screens
    _titleScreen.style.visibility = 'hidden';
    _gameOverScreen.style.visibility = 'hidden';

    // Reset score
    _score = 0;

    // Init player in the middle of the grid
    _player.x = Math.round(STAGE_WIDTH / 2);
    _player.y = Math.round(STAGE_HEIGHT / 2);

    // Add a target to the list
    targets = [];
    spawnTarget();

    // Initialize update loop
    _gameTimerId = setInterval(update, 1);

    // Kick it off
    _lastToggleTime = _nextToggleTime = Date.now();
    updateBlinkRate();

    // Set game length
    setTimeout(gameOver, GAME_DURATION);
  }

  function onKeyUp(e) {
    // Only do stuff while the game is running
    if (_state != 1) return;

    switch(e.keyCode) {
      case KEY_UP:
        _player.y = Math.max(_player.y - 1, 0);
        updateBlinkRate();
        e.preventDefault();
        break;

      case KEY_DOWN:
        _player.y = Math.min(_player.y + 1, STAGE_HEIGHT);
        updateBlinkRate();
        e.preventDefault();
        break;

      case KEY_LEFT:
        _player.x = Math.max(_player.x - 1, 0);
        updateBlinkRate();
        e.preventDefault();
        break;

      case KEY_RIGHT:
        _player.x = Math.min(_player.x + 1, STAGE_WIDTH);
        updateBlinkRate();
        e.preventDefault();
        break;

      case KEY_SPACE:
        if (_onTarget) {
          disarm();
        }
        e.preventDefault();
        break;

      case KEY_M:
        _muted = !_muted;
        e.preventDefault();
        break;
    }
  }

  function onKeyDown(e) {
    // Only do stuff while the game is running
    if (_state != 1) return;

    // Need to preventDefault to stop window from scrolling
    switch(e.keyCode) {
      case KEY_UP:
      case KEY_DOWN:
      case KEY_LEFT:
      case KEY_RIGHT:
      case KEY_SPACE:
      case KEY_M:
        e.preventDefault();
        break;
    }
  }

  function onPixelClick() {
    if (_state == 0 || _state == 2) {
      _state = 1;
      initGame();
    }
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
      if (!_muted) {
        _sound.play();
      }
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
    _score++;
    spawnTarget();
    updateBlinkRate();
  }

  function gameOver() {
    _state = 2;
    clearInterval(_gameTimerId);
    setPixelState(false);
    document.getElementById('score').innerText = _score;
    _gameOverScreen.style.visibility = 'visible';
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
