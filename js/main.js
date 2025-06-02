document.addEventListener('DOMContentLoaded', function() {
    // Обработка кнопки регистрации
    const registerBtn = document.querySelector('.register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            console.log('Регистрация');
        });
    }

    // Обработка кликов по играм
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', function() {
            const gameName = this.querySelector('h3').textContent.trim();
            console.log('Clicked game:', gameName);
            
            if (gameName === 'Мины') {
                window.location.href = 'mines.html';
            }
        });
    });

    // Обработка поиска
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const games = document.querySelectorAll('.game-card');
            
            games.forEach(game => {
                const gameName = game.querySelector('h3').textContent.toLowerCase();
                if (gameName.includes(searchTerm)) {
                    game.style.display = 'block';
                } else {
                    game.style.display = 'none';
                }
            });
        });
    }

    // Обработка категорий
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const category = this.textContent;
            console.log(`Выбрана категория: ${category}`);
        });
    });
});

// Игра Мины
class MinesGame {
    constructor() {
        this.grid = [];
        this.mines = [];
        this.revealed = [];
        this.isPlaying = false;
        this.bet = 0;
        this.multiplier = 1;
        this.initializeGame();
    }

    initializeGame() {
        // Инициализация элементов управления
        this.betInput = document.querySelector('.bet-input');
        this.minesInput = document.querySelector('.mines-input');
        this.startBtn = document.querySelector('.start-btn');
        this.cashoutBtn = document.querySelector('.cashout-btn');
        this.multiplierDisplay = document.querySelector('.multiplier');
        this.mineCells = document.querySelectorAll('.mine-cell');
        
        // Удаляем элемент сложности
        const difficultyElement = document.querySelector('.difficulty-value');
        if (difficultyElement) {
            difficultyElement.parentElement.remove();
        }

        // Добавляем обработчики событий
        this.startBtn.addEventListener('click', () => this.startGame());
        this.cashoutBtn.addEventListener('click', () => this.cashout());
        
        // Добавляем обработчики для ячеек
        this.mineCells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });

        // Устанавливаем минимальное количество мин
        if (this.minesInput) {
            this.minesInput.min = 3;
            this.minesInput.value = 3;
        }
    }

    startGame() {
        if (this.isPlaying) return;

        const bet = parseFloat(this.betInput.value);
        const mines = parseInt(this.minesInput.value);

        if (!bet || bet <= 0) {
            this.showNotification('Введите сумму ставки');
            return;
        }

        if (!mines || mines < 3 || mines > 24) {
            this.showNotification('Выберите количество мин от 3 до 24');
            return;
        }

        const balance = parseFloat(document.querySelector('.balance .amount').textContent);
        if (bet > balance) {
            this.showNotification('Недостаточно средств');
            return;
        }

        // Сбрасываем состояние игры
        this.grid = Array(25).fill(null);
        this.mines = [];
        this.revealed = [];
        this.isPlaying = true;
        this.bet = bet;
        this.multiplier = 1;

        // Обновляем баланс
        const newBalance = balance - bet;
        document.querySelector('.balance .amount').textContent = `${newBalance.toFixed(2)} ₽`;

        // Размещаем мины с подкруткой
        this.placeMines(mines);

        // Обновляем UI
        this.startBtn.disabled = true;
        this.cashoutBtn.disabled = false;
        this.betInput.disabled = true;
        this.minesInput.disabled = true;
        this.updateMultiplier();
    }

    placeMines(count) {
        // Подкрутка: увеличиваем шанс проигрыша
        const actualCount = Math.min(count + Math.floor(Math.random() * 3), 24);
        
        // Размещаем мины в стратегических позициях
        const positions = [];
        for (let i = 0; i < 25; i++) {
            positions.push(i);
        }
        
        // Перемешиваем позиции
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        // Выбираем позиции для мин
        this.mines = positions.slice(0, actualCount);
        
        // Увеличиваем шанс проигрыша на первых ходах
        if (Math.random() < 0.3) {
            const firstClick = this.revealed[0];
            if (firstClick !== undefined && !this.mines.includes(firstClick)) {
                // Заменяем безопасную ячейку на мину
                const safeIndex = this.mines.indexOf(firstClick);
                if (safeIndex !== -1) {
                    this.mines[safeIndex] = positions[actualCount];
                }
            }
        }
    }

    handleCellClick(cell) {
        if (!this.isPlaying || cell.classList.contains('revealed')) return;

        const index = parseInt(cell.dataset.index);
        this.revealed.push(index);

        if (this.mines.includes(index)) {
            // Игрок нашел мину
            cell.classList.add('revealed', 'bomb');
            const mineIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            mineIcon.innerHTML = '<use xlink:href="#mine-icon"/>';
            cell.appendChild(mineIcon);
            this.gameOver();
        } else {
            // Игрок нашел безопасную ячейку
            cell.classList.add('revealed');
            const diamondIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            diamondIcon.innerHTML = '<use xlink:href="#diamond-icon"/>';
            cell.appendChild(diamondIcon);
            
            // Уменьшаем множитель для усложнения игры
            this.multiplier += 0.05;
            this.updateMultiplier();
        }
    }

    gameOver() {
        this.isPlaying = false;
        this.revealAllMines();
        this.startBtn.disabled = false;
        this.cashoutBtn.disabled = true;
        this.betInput.disabled = false;
        this.minesInput.disabled = false;
        this.showNotification('Игра окончена!');
    }

    cashout() {
        if (!this.isPlaying) return;
        
        const winAmount = this.bet * this.multiplier;
        const balance = parseFloat(document.querySelector('.balance .amount').textContent);
        const newBalance = balance + winAmount;
        
        document.querySelector('.balance .amount').textContent = `${newBalance.toFixed(2)} ₽`;
        this.showNotification(`Выигрыш: ${winAmount.toFixed(2)}₽`);
        
        this.isPlaying = false;
        this.startBtn.disabled = false;
        this.cashoutBtn.disabled = true;
        this.betInput.disabled = false;
        this.minesInput.disabled = false;
    }

    revealAllMines() {
        this.mines.forEach(index => {
            const cell = this.mineCells[index];
            if (!cell.classList.contains('revealed')) {
                cell.classList.add('revealed', 'bomb');
                const mineIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                mineIcon.innerHTML = '<use xlink:href="#mine-icon"/>';
                cell.appendChild(mineIcon);
            }
        });
    }

    updateMultiplier() {
        this.multiplierDisplay.textContent = `x${this.multiplier.toFixed(1)}`;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.mines-game')) {
        window.minesGame = new MinesGame();
    }
}); 
