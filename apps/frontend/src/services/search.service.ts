import { api } from './api';

export interface SearchResult {
  id: string;
  type: 'anggota' | 'lahan' | 'pnbp' | 'kegiatan' | 'dokumen' | 'aset' | 'keuangan';
  title: string;
  subtitle: string;
  link: string;
  metadata?: Record<string, any>;
}

export interface GlobalSearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

class SearchService {
  /**
   * Perform global search across all modules
   */
  async globalSearch(query: string): Promise<{ success: boolean; data?: SearchResult[]; message?: string }> {
    try {
      if (!query || query.trim().length < 2) {
        return { success: true, data: [] };
      }

      const searchTerm = query.trim().toLowerCase();
      const results: SearchResult[] = [];

      // Search in parallel across all modules
      const [anggotaRes, lahanRes, pnbpRes, kegiatanRes, keuanganRes] = await Promise.allSettled([
        this.searchAnggota(searchTerm),
        this.searchLahan(searchTerm),
        this.searchPnbp(searchTerm),
        this.searchKegiatan(searchTerm),
        this.searchKeuangan(searchTerm),
      ]);

      // Collect successful results
      if (anggotaRes.status === 'fulfilled' && anggotaRes.value.success) {
        results.push(...(anggotaRes.value.data || []));
      }
      if (lahanRes.status === 'fulfilled' && lahanRes.value.success) {
        results.push(...(lahanRes.value.data || []));
      }
      if (pnbpRes.status === 'fulfilled' && pnbpRes.value.success) {
        results.push(...(pnbpRes.value.data || []));
      }
      if (kegiatanRes.status === 'fulfilled' && kegiatanRes.value.success) {
        results.push(...(kegiatanRes.value.data || []));
      }
      if (keuanganRes.status === 'fulfilled' && keuanganRes.value.success) {
        results.push(...(keuanganRes.value.data || []));
      }

      return {
        success: true,
        data: results.slice(0, 10), // Limit to 10 results
      };
    } catch (error: any) {
      console.error('Global search error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Pencarian gagal',
      };
    }
  }

  /**
   * Search in Anggota module
   */
  private async searchAnggota(query: string): Promise<{ success: boolean; data?: SearchResult[] }> {
    try {
      const response = await api.get<any>('/anggota?search=' + encodeURIComponent(query) + '&limit=3');

      if (!response.success || !response.data) {
        return { success: false, data: [] };
      }

      const results: SearchResult[] = (response.data.data || []).map((item: any) => ({
        id: item.id,
        type: 'anggota' as const,
        title: `${item.namaLengkap}`,
        subtitle: `Nomor Anggota: ${item.nomorAnggota} | ${item.email}`,
        link: `/anggota/${item.id}`,
        metadata: item,
      }));

      return { success: true, data: results };
    } catch (error) {
      return { success: false, data: [] };
    }
  }

  /**
   * Search in Lahan module
   */
  private async searchLahan(query: string): Promise<{ success: boolean; data?: SearchResult[] }> {
    try {
      const response = await api.get<any>('/lahan?search=' + encodeURIComponent(query) + '&limit=3');

      if (!response.success || !response.data) {
        return { success: false, data: [] };
      }

      const results: SearchResult[] = (response.data.data || []).map((item: any) => ({
        id: item.id,
        type: 'lahan' as const,
        title: `Lahan ${item.kodeLahan}`,
        subtitle: `Petak ${item.nomorPetak} - ${item.luasLahan} Ha | ${item.anggotaNama}`,
        link: '/lahan',
        metadata: item,
      }));

      return { success: true, data: results };
    } catch (error) {
      return { success: false, data: [] };
    }
  }

  /**
   * Search in PNBP module
   */
  private async searchPnbp(query: string): Promise<{ success: boolean; data?: SearchResult[] }> {
    try {
      const response = await api.get<any>('/pnbp?search=' + encodeURIComponent(query) + '&limit=3');

      if (!response.success || !response.data) {
        return { success: false, data: [] };
      }

      const results: SearchResult[] = (response.data.data || []).map((item: any) => ({
        id: item.id,
        type: 'pnbp' as const,
        title: `PNBP ${item.tahun} - ${item.anggotaNama}`,
        subtitle: `Status: ${item.statusPembayaran} | Rp ${item.totalTagihan?.toLocaleString('id-ID')}`,
        link: '/pnbp',
        metadata: item,
      }));

      return { success: true, data: results };
    } catch (error) {
      return { success: false, data: [] };
    }
  }

  /**
   * Search in Kegiatan module
   */
  private async searchKegiatan(query: string): Promise<{ success: boolean; data?: SearchResult[] }> {
    try {
      const response = await api.get<any>('/kegiatan?search=' + encodeURIComponent(query) + '&limit=3');

      if (!response.success || !response.data) {
        return { success: false, data: [] };
      }

      const results: SearchResult[] = (response.data.data || []).map((item: any) => ({
        id: item.id,
        type: 'kegiatan' as const,
        title: `Kegiatan: ${item.namaKegiatan}`,
        subtitle: `${item.jenisKegiatan} | ${new Date(item.tanggalKegiatan).toLocaleDateString('id-ID')}`,
        link: '/kegiatan',
        metadata: item,
      }));

      return { success: true, data: results };
    } catch (error) {
      return { success: false, data: [] };
    }
  }

  /**
   * Search in Keuangan module
   */
  private async searchKeuangan(query: string): Promise<{ success: boolean; data?: SearchResult[] }> {
    try {
      const response = await api.get<any>('/keuangan?search=' + encodeURIComponent(query) + '&limit=3');

      if (!response.success || !response.data) {
        return { success: false, data: [] };
      }

      const results: SearchResult[] = (response.data.data || []).map((item: any) => ({
        id: item.id,
        type: 'keuangan' as const,
        title: `${item.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}: ${item.kategori}`,
        subtitle: `Rp ${item.jumlah?.toLocaleString('id-ID')} | ${new Date(item.tanggal).toLocaleDateString('id-ID')}`,
        link: '/keuangan',
        metadata: item,
      }));

      return { success: true, data: results };
    } catch (error) {
      return { success: false, data: [] };
    }
  }
}

export const searchService = new SearchService();
export default searchService;
