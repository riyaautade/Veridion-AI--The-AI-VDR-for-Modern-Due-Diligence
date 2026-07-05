import { useEffect, useState } from 'react';
import mammoth from 'mammoth';
import api from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface DocumentViewerProps {
  dealId: number;
  documentId: number;
  filename: string;
  fileType: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DocumentViewer({ dealId, documentId, filename, fileType, open, onOpenChange }: DocumentViewerProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fileUrl = `${api.defaults.baseURL}/deals/${dealId}/documents/${documentId}/view`;

  useEffect(() => {
    if (!open) {
      setHtmlContent('');
      setError('');
      setPdfUrl('');
      return;
    }

    setLoading(true);
    const token = window.localStorage.getItem('vdr_token');
    
    if (fileType === 'pdf') {
      fetch(fileUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load PDF');
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      })
      .catch(() => setError('Error displaying PDF'))
      .finally(() => setLoading(false));
    } else if (fileType === 'docx') {
      fetch(fileUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load document');
        return res.arrayBuffer();
      })
      .then(buffer => mammoth.convertToHtml({ arrayBuffer: buffer }))
      .then(result => setHtmlContent(result.value))
      .catch(() => setError('Error displaying document'))
      .finally(() => setLoading(false));
    }
    
    return () => {
      // Cleanup blob url when closing
      if (fileType === 'pdf') {
        setPdfUrl(current => {
          if (current) URL.revokeObjectURL(current);
          return '';
        });
      }
    };
  }, [dealId, documentId, fileType, fileUrl, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>{filename}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto bg-slate-50 relative">
          {fileType === 'pdf' ? (
            <div className="w-full h-full relative">
              {loading && <div className="absolute inset-0 flex items-center justify-center text-slate-500 animate-pulse bg-white">Loading PDF...</div>}
              {error && <div className="absolute inset-0 flex items-center justify-center text-rose-500 bg-white">{error}</div>}
              {pdfUrl && (
                <iframe 
                  src={`${pdfUrl}#toolbar=0`} 
                  className="w-full h-full border-0" 
                  title={filename} 
                />
              )}
            </div>
          ) : (
            <div className="p-8 mx-auto bg-white min-h-full max-w-[800px] shadow-sm">
              {loading && <div className="text-slate-500 animate-pulse text-center mt-10">Loading document...</div>}
              {error && <div className="text-rose-500 text-center mt-10">{error}</div>}
              {htmlContent && (
                <div 
                  className="prose prose-slate max-w-none prose-sm" 
                  dangerouslySetInnerHTML={{ __html: htmlContent }} 
                />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
