import { crmService, transformUserForCRM, createWelcomeTicket } from './crmService';

interface LocalUser {
  id: string;
  email: string;
  name: string;
  nickname: string;
  role: 'student' | 'teacher';
  phone: string;
}

class UserSyncService {
  // Загружаем пользователей из localStorage
  private loadLocalUsers(): LocalUser[] {
    try {
      const saved = localStorage.getItem('tutoring_users');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading users from localStorage:', e);
      return [];
    }
  }

  // Синхронизируем всех существующих пользователей с CRM
  async syncAllUsers(): Promise<{ success: number; failed: number; errors: string[] }> {
    const localUsers = this.loadLocalUsers();
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    console.log(`Начинаем синхронизацию ${localUsers.length} пользователей с CRM...`);

    for (const user of localUsers) {
      try {
        // Преобразуем данные пользователя для CRM
        const crmUserData = transformUserForCRM(
          user.name,
          user.email,
          user.role,
          user.phone
        );

        // Отправляем пользователя в CRM
        const response = await crmService.createUser(crmUserData);

        if (response.success) {
          console.log(`✅ Пользователь ${user.name} синхронизирован с CRM`);
          results.success++;
        } else {
          console.warn(`❌ Ошибка синхронизации пользователя ${user.name}:`, response.message);
          results.failed++;
          results.errors.push(`${user.name}: ${response.message}`);
        }
      } catch (error) {
        console.error(`❌ Ошибка синхронизации пользователя ${user.name}:`, error);
        results.failed++;
        results.errors.push(`${user.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`Синхронизация завершена: ${results.success} успешно, ${results.failed} ошибок`);
    return results;
  }

  // Синхронизируем одного пользователя
  async syncUser(user: LocalUser): Promise<boolean> {
    try {
      const crmUserData = transformUserForCRM(
        user.name,
        user.email,
        user.role,
        user.phone
      );

      const response = await crmService.createUser(crmUserData);

      if (response.success) {
        console.log(`✅ Пользователь ${user.name} синхронизирован с CRM`);
        return true;
      } else {
        console.warn(`❌ Ошибка синхронизации пользователя ${user.name}:`, response.message);
        return false;
      }
    } catch (error) {
      console.error(`❌ Ошибка синхронизации пользователя ${user.name}:`, error);
      return false;
    }
  }

  // Проверяем, синхронизирован ли пользователь с CRM
  async checkUserSync(userId: string): Promise<boolean> {
    try {
      // Здесь можно добавить проверку через CRM API
      // Пока возвращаем false для принудительной синхронизации
      return false;
    } catch (error) {
      console.error('Ошибка проверки синхронизации:', error);
      return false;
    }
  }

  // Получаем статистику синхронизации
  getSyncStats(): { local: number; synced: number } {
    const localUsers = this.loadLocalUsers();
    // В реальном приложении здесь можно получить количество синхронизированных пользователей из CRM
    return {
      local: localUsers.length,
      synced: 0 // Будет обновляться после синхронизации
    };
  }
}

export const userSyncService = new UserSyncService(); 