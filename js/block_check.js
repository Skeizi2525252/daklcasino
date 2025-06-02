// Функция для проверки блокировки
async function checkBlockStatus() {
    try {
        // Проверяем, находимся ли мы на локальной файловой системе
        if (window.location.protocol === 'file:') {
            console.log('Running in local file system, skipping block check');
            return;
        }

        const response = await fetch('check_block.php');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.blocked) {
            // Если пользователь заблокирован, показываем сообщение
            document.body.innerHTML = `
                <div style="text-align: center; padding: 20px; color: red;">
                    <h2>Доступ заблокирован</h2>
                    <p>${data.message || 'Ваш доступ к игре временно ограничен.'}</p>
                </div>
            `;
        }
    } catch (error) {
        // Игнорируем ошибки CORS при локальной разработке
        if (window.location.protocol === 'file:') {
            console.log('Skipping block check in local development');
            return;
        }
        console.error('Error checking block status:', error);
    }
}

// Проверяем блокировку при загрузке страницы
document.addEventListener('DOMContentLoaded', checkBlockStatus);

// Проверяем статус блокировки каждые 30 секунд
setInterval(checkBlockStatus, 30000); 
