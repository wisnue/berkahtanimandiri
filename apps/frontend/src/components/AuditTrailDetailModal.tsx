import { X, Calendar, User, Database, Globe, Monitor, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuditTrailDetailModalProps {
  entry: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditTrailDetailModal({ entry, isOpen, onClose }: AuditTrailDetailModalProps) {
  if (!isOpen || !entry) return null;

  const oldValues = entry.oldValues ? (typeof entry.oldValues === 'string' ? JSON.parse(entry.oldValues) : entry.oldValues) : null;
  const newValues = entry.newValues ? (typeof entry.newValues === 'string' ? JSON.parse(entry.newValues) : entry.newValues) : null;
  const changedFields = entry.changedFields || [];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      case 'VERIFY': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'APPROVE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECT': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (value instanceof Date) return value.toLocaleString('id-ID');
    return String(value);
  };

  const isFieldChanged = (fieldName: string) => {
    return changedFields.includes(fieldName);
  };

  const getAllFields = () => {
    const fields = new Set<string>();
    if (oldValues) Object.keys(oldValues).forEach(key => fields.add(key));
    if (newValues) Object.keys(newValues).forEach(key => fields.add(key));
    return Array.from(fields).sort();
  };

  const getTableDisplayName = (tableName: string) => {
    const names: Record<string, string> = {
      'anggota': 'Anggota',
      'lahan_khdpk': 'Lahan KHDPK',
      'kegiatan': 'Kegiatan',
      'aset': 'Aset',
      'keuangan': 'Keuangan',
      'pnbp': 'PNBP',
      'dokumen': 'Dokumen',
      'dokumen_organisasi': 'Dokumen Organisasi',
    };
    return names[tableName] || tableName;
  };

  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detail Audit Trail</h2>
            <p className="text-sm text-gray-600 mt-1">
              {getTableDisplayName(entry.tableName)} - {entry.action}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase">Waktu</div>
                <div className="text-sm text-gray-900 mt-1">
                  {new Date(entry.createdAt).toLocaleString('id-ID', {
                    dateStyle: 'full',
                    timeStyle: 'medium',
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase">User</div>
                <div className="text-sm text-gray-900 mt-1">{entry.userName || entry.userId}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase">Tabel</div>
                <div className="text-sm text-gray-900 mt-1">{getTableDisplayName(entry.tableName)}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`px-3 py-1.5 rounded-md border text-sm font-medium ${getActionColor(entry.action)}`}>
                {entry.action}
              </div>
            </div>

            {entry.ipAddress && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">IP Address</div>
                  <div className="text-sm text-gray-900 mt-1">{entry.ipAddress}</div>
                </div>
              </div>
            )}

            {entry.userAgent && (
              <div className="flex items-start gap-3">
                <Monitor className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">Browser / Device</div>
                  <div className="text-sm text-gray-900 mt-1 truncate" title={entry.userAgent}>
                    {entry.userAgent.length > 50 ? entry.userAgent.substring(0, 50) + '...' : entry.userAgent}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {entry.description && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs font-medium text-blue-900 uppercase mb-1">Deskripsi</div>
              <div className="text-sm text-blue-800">{entry.description}</div>
            </div>
          )}

          {/* Changed Fields Summary */}
          {changedFields.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                <div className="text-xs font-medium text-amber-900 uppercase">
                  Field yang Berubah ({changedFields.length})
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {changedFields.map((field: string) => (
                  <span
                    key={field}
                    className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-md"
                  >
                    {formatFieldName(field)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Before/After Comparison */}
          {(oldValues || newValues) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Perbandingan Data
              </h3>

              <div className="space-y-3">
                {getAllFields().map((fieldName) => {
                  const oldValue = oldValues?.[fieldName];
                  const newValue = newValues?.[fieldName];
                  const isChanged = isFieldChanged(fieldName);

                  return (
                    <div
                      key={fieldName}
                      className={`p-4 rounded-lg border ${
                        isChanged
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-sm font-semibold text-gray-700">
                          {formatFieldName(fieldName)}
                        </div>
                        {isChanged && (
                          <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs font-medium rounded">
                            Berubah
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Old Value */}
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                            Sebelum
                          </div>
                          <div className={`p-3 rounded border ${
                            isChanged ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                          }`}>
                            <pre className="text-sm text-gray-900 whitespace-pre-wrap break-words font-mono">
                              {formatValue(oldValue)}
                            </pre>
                          </div>
                        </div>

                        {/* Arrow */}
                        {entry.action === 'UPDATE' && (
                          <div className="hidden md:flex items-center justify-center">
                            <ArrowRight className="h-6 w-6 text-gray-400" />
                          </div>
                        )}

                        {/* New Value */}
                        <div className={entry.action === 'UPDATE' ? '' : 'md:col-start-2'}>
                          <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                            Sesudah
                          </div>
                          <div className={`p-3 rounded border ${
                            isChanged ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                          }`}>
                            <pre className="text-sm text-gray-900 whitespace-pre-wrap break-words font-mono">
                              {formatValue(newValue)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Data */}
          {!oldValues && !newValues && (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Tidak ada detail perubahan data</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
