import { api } from './api';

export interface UserStats {
  laporan: number;
  aktivitas: number;
  proyek: number;
}

class StatsService {
  /**
   * Get user statistics for dashboard
   */
  async getUserStats(): Promise<{ success: boolean; data?: UserStats; message?: string }> {
    try {
      // Mock data for now - replace with actual API call
      const stats: UserStats = {
        laporan: 24,
        aktivitas: 156,
        proyek: 8,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error: any) {
      console.error('Get user stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengambil statistik',
      };
    }
  }
}

export const statsService = new StatsService();
export default statsService;
