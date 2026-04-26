$ErrorActionPreference = 'Stop'

$root = 'c:\Users\Aravg\OneDrive - Peel District School Board\Special Code\yep'

$single = @(
  'snake', '2048', 'asteroids', 'breakout', 'burrito-bison-clone', 'click-speed-test',
  'cookie-clicker', 'dino-run-clone', 'doodle-jump-clone', 'draw-a-perfect-circle',
  'flappy-bird-clone', 'frogger', 'geometry-dash-clone', 'hextris', 'infinite-craft-clone',
  'little-alchemy-clone', 'memory-match', 'minesweeper', 'pac-man', 'simon-says',
  'slide-puzzle', 'solitaire', 'space-invaders', 'sudoku', 'tetris', 'the-deep-sea',
  'the-password-game', 'tower-builder', 'wordle-inf'
)

$multi = @(
  '8-ball-pool', 'air-hockey', 'among-us-clone', 'battleship', 'checkers', 'chess',
  'connect-4', 'dots-and-boxes', 'fireboy-watergirl-clone', 'hangman-2p',
  'infinite-craft-multiplayer', 'ludo', 'mancala', 'penalty-shootout', 'pong',
  'rock-paper-scissors', 'slither-io-clone', 'snakes-and-ladders', 'tank-trouble-clone',
  'tic-tac-toe', 'trivia-quiz', 'tug-of-war', 'uno-clone'
)

$targets = @()

foreach ($id in $single) {
  $path = Join-Path $root "utils\single-player\$id\index.html"
  if (Test-Path $path) { $targets += $path }
}

foreach ($id in $multi) {
  $path = Join-Path $root "utils\two-player\$id\index.html"
  if (Test-Path $path) { $targets += $path }
}

$pattern = '(?s)\r?\n\s*<div class="placeholder">.*?</div>\r?\n'
$changed = @()

foreach ($file in $targets) {
  $content = Get-Content -Path $file -Raw
  $updated = [regex]::Replace($content, $pattern, "`r`n", 1)
  if ($updated -ne $content) {
    Set-Content -Path $file -Value $updated -NoNewline
    $changed += $file
  }
}

Write-Output ("Changed files: " + $changed.Count)
$changed | ForEach-Object { $_.Replace($root + '\\', '') }
