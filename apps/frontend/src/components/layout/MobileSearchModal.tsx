import { useState, useEffect } from 'react';
import { Search, X, FileText, Users, MapPin, DollarSign, Calendar, Grid, Wallet } from 'lucide-react';
import { useLocation } from 'wouter';
import { searchService, type SearchResult } from '@/services/search.service';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search function with debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await searchService.globalSearch(query);
      
      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSelect = (result: SearchResult) => {
    setLocation(result.link);
    onClose();
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'anggota': return <Users size={20} className="text-blue-500" />;
      case 'lahan': return <MapPin size={20} className="text-green-500" />;
      case 'pnbp': return <DollarSign size={20} className="text-purple-500" />;
      case 'kegiatan': return <Calendar size={20} className="text-orange-500" />;
      case 'dokumen': return <FileText size={20} className="text-gray-500" />;
      case 'aset': return <Grid size={20} className="text-teal-500" />;
      case 'keuangan': return <Wallet size={20} className="text-indigo-500" />;
      default: return <FileText size={20} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Cari Data</h2>
        </div>
        
        {/* Search Input */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lahan, anggota, pembayaran..."
              autoFocus
              className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          
          {/* Query hint */}
          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className="mt-2 text-xs text-gray-500 px-1">
              Ketik minimal 2 karakter untuk mencari
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="overflow-y-auto h-[calc(100vh-140px)]">
        {searchResults.length > 0 ? (
          <div className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-2">
              Hasil Pencarian ({searchResults.length})
            </p>
            <div className="space-y-1 mt-2">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSearchSelect(result)}
                  className="w-full flex items-start gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors text-left border border-transparent hover:border-gray-200"
                >
                  <div className="mt-0.5">{getResultIcon(result.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-900 mb-1">{result.title}</p>
                    <p className="text-sm text-gray-600">{result.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : searchQuery.length >= 2 && !isSearching ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-1">Tidak ada hasil</p>
            <p className="text-gray-500 text-sm text-center">
              Coba gunakan kata kunci yang berbeda
            </p>
          </div>
        ) : searchQuery.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-emerald-600" />
            </div>
            <p className="text-gray-900 font-medium mb-1">Cari apa saja</p>
            <p className="text-gray-500 text-sm text-center max-w-xs">
              Cari data lahan, anggota, pembayaran, kegiatan, dan lainnya
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
