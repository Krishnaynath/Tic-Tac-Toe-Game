// Tic-Tac-Toe with Animations
class TicTacToeGame {
  constructor() {
    this.cells = document.querySelectorAll('[data-cell]');
    this.board = document.getElementById('board');
    this.statusText = document.getElementById('status');
    this.resetButton = document.getElementById('resetButton');
    this.winningLine = document.getElementById('winningLine');
    this.gameOverModal = document.getElementById('gameOverModal');
    this.modalMessage = document.getElementById('modalMessage');
    this.modalPlayAgain = document.getElementById('modalPlayAgain');
    this.playerIndicators = document.querySelectorAll('.player-indicator');
    
    // Game state
    this.currentPlayer = 'X';
    this.gameActive = true;
    this.gameBoard = Array(9).fill('');
    
    // Statistics
    this.stats = {
      gamesPlayed: 0,
      xWins: 0,
      oWins: 0,
      draws: 0
    };
    
    // Winning combinations with line positions
    this.winningCombos = [
      { indices: [0, 1, 2], line: 'horizontal', position: 0 },
      { indices: [3, 4, 5], line: 'horizontal', position: 1 },
      { indices: [6, 7, 8], line: 'horizontal', position: 2 },
      { indices: [0, 3, 6], line: 'vertical', position: 0 },
      { indices: [1, 4, 7], line: 'vertical', position: 1 },
      { indices: [2, 5, 8], line: 'vertical', position: 2 },
      { indices: [0, 4, 8], line: 'diagonal', position: 0 },
      { indices: [2, 4, 6], line: 'diagonal', position: 1 }
    ];
    
    this.init();
  }
  
  init() {
    this.loadStats();
    this.updateStatsDisplay();
    this.bindEvents();
    this.updatePlayerIndicators();
    this.animateGameStart();
  }

  
  bindEvents() {
    // Remove any existing event listeners first
    this.removeEventListeners();
    
    // Cell click events
    this.cells.forEach((cell, index) => {
      cell.addEventListener('click', (e) => this.handleCellClick(e, index));
    });
    
    // Reset button
    this.resetButton.addEventListener('click', () => this.resetGame());
    
    // Modal play again button
    this.modalPlayAgain.addEventListener('click', () => this.playAgain());
    
    // Add ripple effect to reset button
    this.resetButton.addEventListener('click', this.createRipple.bind(this));
    
    // Keyboard support
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }
  
  removeEventListeners() {
    // Clone and replace each cell to remove all event listeners
    this.cells.forEach((cell, index) => {
      const newCell = cell.cloneNode(true);
      cell.parentNode.replaceChild(newCell, cell);
    });
    // Update the cells NodeList reference
    this.cells = document.querySelectorAll('[data-cell]');
  }
  
  handleCellClick(event, index) {
    if (!this.gameActive || this.gameBoard[index] !== '') return;
    
    const cell = event.target.closest('.cell');
    this.makeMove(cell, index);
  }
  
  makeMove(cell, index) {
    // Update game state
    this.gameBoard[index] = this.currentPlayer;
    
    // Visual feedback
    this.animateCellFill(cell, index);
    
    // Check for win or draw
    setTimeout(() => {
      const winInfo = this.checkWin();
      if (winInfo) {
        this.handleWin(winInfo);
      } else if (this.isDraw()) {
        this.handleDraw();
      } else {
        this.switchPlayer();
      }
    }, 300);
  }
  
  animateCellFill(cell, index) {
    const cellContent = cell.querySelector('.cell-content');
    if (cellContent) {
      cellContent.textContent = this.currentPlayer;
    } else {
      // Fallback: set content directly on cell if .cell-content doesn't exist
      cell.textContent = this.currentPlayer;
    }
    
    // Add appropriate class for styling
    cell.classList.add('taken');
    cell.classList.add(this.currentPlayer === 'X' ? 'x-cell' : 'o-cell');
    
    // Sound effect simulation (visual feedback)
    this.createCellEffect(cell);
  }
  
  createCellEffect(cell) {
    // Create a pulse effect
    cell.style.animation = 'none';
    cell.offsetHeight; // Trigger reflow
    cell.style.animation = `cellFill${this.currentPlayer} 0.6s ease-out`;
  }
  
  checkWin() {
    for (let combo of this.winningCombos) {
      const [a, b, c] = combo.indices;
      if (this.gameBoard[a] && 
          this.gameBoard[a] === this.gameBoard[b] && 
          this.gameBoard[a] === this.gameBoard[c]) {
        return {
          winner: this.gameBoard[a],
          combo: combo,
          winningCells: [a, b, c]
        };
      }
    }
    return null;
  }
  
  handleWin(winInfo) {
    this.gameActive = false;
    this.animateWinningCells(winInfo.winningCells);
    this.drawWinningLine(winInfo.combo);
    this.updateStats(winInfo.winner);
    
    // Add celebration effects
    this.playSoundEffect('win');
    this.showCharacterAnimation('win', winInfo.winner);
    
    setTimeout(() => {
      this.showGameOverModal(`Player ${winInfo.winner} Wins! 🎉`);
    }, 1000);
  }
  
  animateWinningCells(winningCells) {
    winningCells.forEach((index, i) => {
      setTimeout(() => {
        const cell = this.cells[index];
        cell.style.animation = 'none';
        cell.offsetHeight; // Trigger reflow
        cell.style.animation = 'winningCell 0.6s ease-out';
        cell.style.transform = 'scale(1.1)';
        cell.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.8)';
      }, i * 200);
    });
  }
  
  drawWinningLine(combo) {
    const cellSize = getComputedStyle(document.documentElement)
      .getPropertyValue('--cell-size')?.trim() || '100px';
    const size = parseInt(cellSize);
    const gap = 8;
    
    let lineStyles = {};
    
    if (combo.line === 'horizontal') {
      const row = combo.position;
      lineStyles = {
        width: `${size * 3 + gap * 2}px`,
        height: '6px',
        top: `${row * (size + gap) + size / 2 + 16}px`,
        left: '16px'
      };
    } else if (combo.line === 'vertical') {
      const col = combo.position;
      lineStyles = {
        width: '6px',
        height: `${size * 3 + gap * 2}px`,
        top: '16px',
        left: `${col * (size + gap) + size / 2 + 16}px`
      };
    } else if (combo.line === 'diagonal') {
      const length = Math.sqrt(Math.pow(size * 3 + gap * 2, 2) + Math.pow(size * 3 + gap * 2, 2));
      lineStyles = {
        width: `${length}px`,
        height: '6px',
        top: `${size * 1.5 + gap + 16}px`,
        left: `${size * 1.5 + gap + 16}px`,
        transformOrigin: 'center'
      };
      
      if (combo.position === 0) {
        lineStyles.transform = 'rotate(45deg)';
      } else {
        lineStyles.transform = 'rotate(-45deg)';
      }
    }
    
    Object.assign(this.winningLine.style, lineStyles);
    this.winningLine.classList.add('show');
  }
  
  isDraw() {
    return this.gameBoard.every(cell => cell !== '');
  }
  
  handleDraw() {
    this.gameActive = false;
    this.updateStats('draw');
    
    // Add draw effects
    this.playSoundEffect('draw');
    this.showCharacterAnimation('draw');
    
    // Animate all cells for draw
    this.cells.forEach((cell, index) => {
      setTimeout(() => {
        cell.style.animation = 'drawCell 0.4s ease-out';
      }, index * 100);
    });
    
    setTimeout(() => {
      this.showGameOverModal("It's a Draw! 🤝");
    }, 1000);
  }
  
  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    this.updateStatus();
    this.updatePlayerIndicators();
  }
  
  updateStatus() {
    this.statusText.innerHTML = `
      <i class="fas fa-play-circle status-icon"></i>
      Player ${this.currentPlayer}'s turn
    `;
    
    // Animate status change
    this.statusText.style.animation = 'none';
    this.statusText.offsetHeight; // Trigger reflow
    this.statusText.style.animation = 'fadeIn 0.5s ease-out';
  }
  
  updatePlayerIndicators() {
    this.playerIndicators.forEach(indicator => {
      const player = indicator.dataset.player;
      if (player === this.currentPlayer) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }
  
  updateStats(result) {
    this.stats.gamesPlayed++;
    
    if (result === 'X') {
      this.stats.xWins++;
    } else if (result === 'O') {
      this.stats.oWins++;
    } else if (result === 'draw') {
      this.stats.draws++;
    }
    
    this.saveStats();
    this.updateStatsDisplay();
  }
  
  updateStatsDisplay() {
    const elements = {
      gamesPlayed: document.getElementById('gamesPlayed'),
      xWins: document.getElementById('xWins'),
      oWins: document.getElementById('oWins'),
      draws: document.getElementById('draws')
    };
    
    // Only update if elements exist
    if (elements.gamesPlayed) elements.gamesPlayed.textContent = this.stats.gamesPlayed;
    if (elements.xWins) elements.xWins.textContent = this.stats.xWins;
    if (elements.oWins) elements.oWins.textContent = this.stats.oWins;
    if (elements.draws) elements.draws.textContent = this.stats.draws;
    
    // Animate stats update
    document.querySelectorAll('.stat-value').forEach(stat => {
      stat.style.animation = 'none';
      stat.offsetHeight; // Trigger reflow
      stat.style.animation = 'countUp 0.5s ease-out';
    });
  }
  
  showGameOverModal(message) {
    this.modalMessage.textContent = message;
    this.gameOverModal.classList.add('show');
    
    // Add confetti effect for wins
    if (message.includes('Wins')) {
      this.createConfetti();
      this.createFloatingHearts();
    }
  }
  
  createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        top: -10px;
        left: ${Math.random() * 100}vw;
        z-index: 1001;
        border-radius: 50%;
        animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
      `;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  }
  
  playSoundEffect(type) {
    const soundElement = document.createElement('div');
    soundElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1002;
      font-size: 4rem;
      font-weight: bold;
      color: transparent;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
      background-clip: text;
      -webkit-background-clip: text;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
      pointer-events: none;
    `;
    
    if (type === 'win') {
      soundElement.textContent = '🎉 YAYY! 🎉';
      soundElement.style.animation = 'soundBounce 1.5s ease-out forwards';
    } else if (type === 'draw') {
      soundElement.textContent = '🤝 DRAW! 🤝';
      soundElement.style.animation = 'soundShake 1.5s ease-out forwards';
    }
    
    document.body.appendChild(soundElement);
    
    setTimeout(() => {
      soundElement.remove();
    }, 2000);
  }
  
  showCharacterAnimation(type, winner = null) {
    // Create animated character container
    const characterContainer = document.createElement('div');
    characterContainer.className = 'character-animation';
    characterContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1003;
      font-size: 6rem;
      pointer-events: none;
    `;
    
    let character = '';
    let animationClass = '';
    
    if (type === 'win') {
      // Different characters based on winner
      if (winner === 'X') {
        character = '🐱'; // Cat for X
        animationClass = 'catDance';
      } else {
        character = '🐶'; // Dog for O
        animationClass = 'dogDance';
      }
    } else if (type === 'draw') {
      character = '🐸'; // Frog for draw
      animationClass = 'frogBounce';
    }
    
    characterContainer.textContent = character;
    characterContainer.style.animation = `${animationClass} 2s ease-in-out`;
    
    document.body.appendChild(characterContainer);
    
    // Add speech bubble
    const speechBubble = document.createElement('div');
    speechBubble.style.cssText = `
      position: absolute;
      top: -60px;
      right: 0;
      background: rgba(255, 255, 255, 0.95);
      border: 3px solid #333;
      border-radius: 20px;
      padding: 10px 15px;
      font-size: 1.2rem;
      font-weight: bold;
      color: #333;
      white-space: nowrap;
      animation: speechBubbleAppear 0.5s ease-out 0.3s both;
    `;
    
    let message = '';
    if (type === 'win') {
      const messages = ['Awesome!', 'Great job!', 'Well done!', 'Fantastic!'];
      message = messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = ['Good game!', 'Nice try!', 'Play again?', 'So close!'];
      message = messages[Math.floor(Math.random() * messages.length)];
    }
    
    speechBubble.textContent = message;
    
    // Add speech bubble tail
    const tail = document.createElement('div');
    tail.style.cssText = `
      position: absolute;
      bottom: -10px;
      right: 30px;
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid #333;
    `;
    speechBubble.appendChild(tail);
    
    characterContainer.appendChild(speechBubble);
    
    // Remove after animation
    setTimeout(() => {
      characterContainer.remove();
    }, 3000);
  }
  
  // Add floating hearts effect for wins
  createFloatingHearts() {
    const heartColors = ['❤️', '💛', '💚', '💙', '💜'];
    
    for (let i = 0; i < 15; i++) {
      const heart = document.createElement('div');
      heart.textContent = heartColors[Math.floor(Math.random() * heartColors.length)];
      heart.style.cssText = `
        position: fixed;
        font-size: 2rem;
        bottom: -50px;
        left: ${Math.random() * 100}vw;
        z-index: 1001;
        pointer-events: none;
        animation: floatingHearts ${3 + Math.random() * 2}s ease-out forwards;
      `;
      
      document.body.appendChild(heart);
      
      setTimeout(() => {
        heart.remove();
      }, 6000);
    }
  }
  
  resetGame() {
    // Reset game state
    this.gameActive = true;
    this.currentPlayer = 'X';
    this.gameBoard = Array(9).fill('');
    
    // Reset visual state - FIXED VERSION
    this.cells.forEach(cell => {
      // Clear both direct cell content and .cell-content div
      cell.textContent = '';
      const contentDiv = cell.querySelector('.cell-content');
      if (contentDiv) {
        contentDiv.textContent = '';
      }
      
      // Reset all classes to base state
      cell.className = 'cell';
      
      // Reset all inline styles
      cell.style.cssText = '';
    });
    
    // Reset winning line
    this.winningLine.classList.remove('show');
    this.winningLine.style.cssText = '';
    
    // Re-bind events to ensure they work after reset
    this.bindEvents();
    
    // Update UI
    this.updateStatus();
    this.updatePlayerIndicators();
    this.animateGameStart();
  }
  
  playAgain() {
    this.gameOverModal.classList.remove('show');
    this.resetGame();
  }
  
  animateGameStart() {
    this.cells.forEach((cell, index) => {
      cell.style.animation = 'none';
      cell.offsetHeight; // Trigger reflow
      cell.style.animation = `cellSlideIn 0.4s ease-out ${index * 0.05}s both`;
    });
  }
  
  createRipple(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('div');
    ripple.className = 'btn-ripple';
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  handleKeyPress(event) {
    if (!this.gameActive) return;
    
    const key = event.key;
    const numKey = parseInt(key);
    
    if (numKey >= 1 && numKey <= 9) {
      const index = numKey - 1;
      if (this.gameBoard[index] === '') {
        const cell = this.cells[index];
        this.makeMove(cell, index);
      }
    }
    
    if (key === 'r' || key === 'R') {
      this.resetGame();
    }
  }
  
  saveStats() {
    try {
      // Store stats in memory for this session
      window.gameStats = this.stats;
    } catch (error) {
      console.log('Could not save stats');
    }
  }
  
  loadStats() {
    try {
      // Load stats from memory
      if (window.gameStats) {
        this.stats = { ...window.gameStats };
      }
    } catch (error) {
      console.log('Could not load stats');
    }
  }
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes cellSlideIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.8);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes cellFillX {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.2); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes cellFillO {
    0% { transform: scale(0.8) rotate(-10deg); opacity: 0; }
    50% { transform: scale(1.2) rotate(5deg); opacity: 0.8; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  
  @keyframes winningCell {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1.1); }
  }
  
  @keyframes drawCell {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes countUp {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  
  @keyframes confettiFall {
    0% {
      transform: translateY(-10px) rotateZ(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotateZ(360deg);
      opacity: 0;
    }
  }
  
  .btn-ripple {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  }
  
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  /* Sound Effect Animations */
  @keyframes soundBounce {
    0% { 
      transform: translate(-50%, -50%) scale(0) rotate(0deg); 
      opacity: 0; 
    }
    20% { 
      transform: translate(-50%, -50%) scale(1.3) rotate(5deg); 
      opacity: 1; 
    }
    40% { 
      transform: translate(-50%, -50%) scale(0.9) rotate(-3deg); 
      opacity: 1; 
    }
    60% { 
      transform: translate(-50%, -50%) scale(1.1) rotate(2deg); 
      opacity: 1; 
    }
    80% { 
      transform: translate(-50%, -50%) scale(1) rotate(0deg); 
      opacity: 1; 
    }
    100% { 
      transform: translate(-50%, -50%) scale(0) rotate(0deg); 
      opacity: 0; 
    }
  }
  
  @keyframes soundShake {
    0% { 
      transform: translate(-50%, -50%) scale(0); 
      opacity: 0; 
    }
    20% { 
      transform: translate(-50%, -50%) scale(1.2); 
      opacity: 1; 
    }
    30% { 
      transform: translate(-48%, -50%) scale(1.1); 
    }
    40% { 
      transform: translate(-52%, -50%) scale(1.1); 
    }
    50% { 
      transform: translate(-48%, -50%) scale(1); 
    }
    60% { 
      transform: translate(-52%, -50%) scale(1); 
    }
    70% { 
      transform: translate(-50%, -50%) scale(1); 
      opacity: 1; 
    }
    100% { 
      transform: translate(-50%, -50%) scale(0); 
      opacity: 0; 
    }
  }
  
  /* Character Animations */
  @keyframes catDance {
    0%, 100% { 
      transform: translateY(0) rotate(0deg) scale(1); 
    }
    25% { 
      transform: translateY(-30px) rotate(-10deg) scale(1.1); 
    }
    50% { 
      transform: translateY(-20px) rotate(10deg) scale(1.2); 
    }
    75% { 
      transform: translateY(-40px) rotate(-5deg) scale(1.1); 
    }
  }
  
  @keyframes dogDance {
    0%, 100% { 
      transform: translateX(0) rotate(0deg) scale(1); 
    }
    20% { 
      transform: translateX(-20px) rotate(-15deg) scale(1.1); 
    }
    40% { 
      transform: translateX(20px) rotate(15deg) scale(1.2); 
    }
    60% { 
      transform: translateX(-15px) rotate(-10deg) scale(1.1); 
    }
    80% { 
      transform: translateX(15px) rotate(10deg) scale(1.1); 
    }
  }
  
  @keyframes frogBounce {
    0%, 100% { 
      transform: translateY(0) scale(1); 
    }
    25% { 
      transform: translateY(-50px) scale(1.2); 
    }
    50% { 
      transform: translateY(0) scale(0.9); 
    }
    75% { 
      transform: translateY(-30px) scale(1.1); 
    }
  }
  
  @keyframes speechBubbleAppear {
    0% { 
      opacity: 0; 
      transform: translateY(20px) scale(0.8); 
    }
    100% { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }
  
  @keyframes floatingHearts {
    0% {
      transform: translateY(0) rotate(0deg) scale(0.5);
      opacity: 0;
    }
    20% {
      opacity: 1;
      transform: translateY(-100px) rotate(90deg) scale(1);
    }
    40% {
      transform: translateY(-200px) rotate(180deg) scale(0.8);
    }
    60% {
      transform: translateY(-300px) rotate(270deg) scale(1.1);
    }
    80% {
      transform: translateY(-400px) rotate(360deg) scale(0.9);
    }
    100% {
      transform: translateY(-500px) rotate(450deg) scale(0.3);
      opacity: 0;
    }
  }
  
  /* Character container styling */
  .character-animation {
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
  }
`;
document.head.appendChild(style);

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new TicTacToeGame();
  
  // Add some easter eggs
  console.log('🎮 Modern Tic-Tac-Toe Game Loaded!');
  console.log('💡 Pro tip: Use number keys 1-9 to play!');
  console.log('🔄 Press R to reset the game!');
});

// Add touch support for mobile
document.addEventListener('touchstart', () => {}, { passive: true });